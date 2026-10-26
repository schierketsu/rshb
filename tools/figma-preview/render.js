/*
 * Предпросмотр Figma-плагина без Figma · v2
 *
 * Эмулирует ту часть Figma Plugin API, которую использует figma-plugin/code.js:
 * страницы, переменные (примитивы → токены, привязка к заливкам, отступам и радиусам),
 * стили текста, компоненты, наборы вариантов, экземпляры и их свойства, auto-layout,
 * SVG-иконки, дуги эллипсов. Затем рендерит фреймы через Chromium: auto-layout
 * переводится в flexbox, поэтому раскладка близка к Figma.
 *
 * Проверки, как в Figma: шрифт загружен до текста, FILL только у детей auto-layout,
 * HUG только у auto-layout и текста, нельзя добавлять слои в экземпляр, свойства
 * экземпляра существуют, все символы есть в шрифте, текст не вылезает из блока.
 *
 *   cd tools/figma-preview && npm install && node render.js [out-dir]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const opentype = require('opentype.js');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'figma-plugin/preview'));
const ONEST = path.join(__dirname, 'node_modules/@fontsource/onest/files');
const warnings = [];
const warn = (m) => warnings.push(m);

// ---------------------------------------------------------------- шрифты
const AVAILABLE = [];
for (const st of ['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold']) AVAILABLE.push({ fontName: { family: 'Onest', style: st } });
for (const st of ['Regular', 'Medium', 'Semi Bold', 'Bold']) AVAILABLE.push({ fontName: { family: 'Inter', style: st } });
const WEIGHT = { Regular: 400, Medium: 500, SemiBold: 600, 'Semi Bold': 600, Bold: 700, ExtraBold: 800 };
const loaded = new Set();
const fontKey = (f) => f.family + '|' + f.style;
const glyphFonts = ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'].map((sub) => {
  try { return opentype.parse(fs.readFileSync(path.join(ONEST, `onest-${sub}-400-normal.woff`)).buffer); } catch (e) { return null; }
}).filter(Boolean);
function checkGlyphs(str, where) {
  for (const ch of str) {
    if (/\s/.test(ch)) continue;
    if (!glyphFonts.some((f) => f.charToGlyph(ch).index > 0)) warn(`нет глифа «${ch}» (U+${ch.codePointAt(0).toString(16)}) в Onest: «${where}»`);
  }
}

// ---------------------------------------------------------------- переменные
let seq = 0;
const nid = () => '1:' + (++seq);
const collections = [], variables = [], textStyles = [], allNodes = new Map();
function resolveVar(id, depth = 0) {
  const v = variables.find((x) => x.id === id);
  if (!v) throw new Error('переменная не найдена: ' + id);
  const val = Object.values(v.valuesByMode)[0];
  if (val && val.type === 'VARIABLE_ALIAS') { if (depth > 10) throw new Error('цикл алиасов'); return resolveVar(val.id, depth + 1); }
  return val;
}
const VAR_FIELDS = new Set(['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'itemSpacing', 'counterAxisSpacing', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius', 'width', 'height', 'strokeWeight', 'opacity']);

// ---------------------------------------------------------------- узлы
const AL_TYPES = new Set(['FRAME', 'COMPONENT', 'INSTANCE', 'COMPONENT_SET']);
class Node {
  constructor(type) {
    this.id = nid(); this.type = type; this.name = type; this.parent = null; this.children = [];
    this.x = 0; this.y = 0; this._w = 100; this._h = 100;
    this.fills = []; this.strokes = []; this.strokeWeight = 1; this.strokeAlign = 'INSIDE'; this._sides = null;
    this.cornerRadius = 0; this._radii = null; this.opacity = 1; this.rotation = 0; this.effects = []; this.dashPattern = [];
    this.clipsContent = true; this.layoutMode = 'NONE'; this.primaryAxisSizingMode = 'AUTO'; this.counterAxisSizingMode = 'AUTO';
    this.primaryAxisAlignItems = 'MIN'; this.counterAxisAlignItems = 'MIN'; this.itemSpacing = 0; this.counterAxisSpacing = 0;
    this.paddingTop = 0; this.paddingBottom = 0; this.paddingLeft = 0; this.paddingRight = 0; this.layoutWrap = 'NO_WRAP';
    this.layoutGrow = 0; this.layoutAlign = 'INHERIT'; this.layoutPositioning = 'AUTO'; this.minHeight = null;
    this.componentPropertyReferences = null; this.description = ''; this.isExposedInstance = false;
    allNodes.set(this.id, this);
  }
  get width() { return this._w; }
  get height() { return this._h; }
  resize(w, h) {
    if (!(w >= 0.01 && h >= 0.01)) throw new Error(`resize(${w}, ${h}) у «${this.name}»`);
    this._w = w; this._h = h;
    if (this.layoutMode !== 'NONE') { this.primaryAxisSizingMode = 'FIXED'; this.counterAxisSizingMode = 'FIXED'; }
    this._fixedW = true; this._fixedH = true;
  }
  rescale(s) {
    this._w *= s; this._h *= s; this._scale = (this._scale || 1) * s;
    for (const c of this.children) { c.x *= s; c.y *= s; c.rescale(s); }
  }
  appendChild(n) {
    if (this.type === 'INSTANCE' || this._inInstance) throw new Error(`нельзя добавлять слои в экземпляр «${this.name}»`);
    if (n.parent) n.parent.children = n.parent.children.filter((c) => c !== n);
    n.parent = this; this.children.push(n);
  }
  insertChild(i, n) { this.appendChild(n); this.children.pop(); this.children.splice(i, 0, n); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this); this.parent = null; this.removed = true; }
  set topLeftRadius(v) { this._r('tl', v); } set topRightRadius(v) { this._r('tr', v); } set bottomLeftRadius(v) { this._r('bl', v); } set bottomRightRadius(v) { this._r('br', v); }
  get topLeftRadius() { return this._radii ? this._radii.tl : this.cornerRadius; }
  _r(k, v) { if (!this._radii) this._radii = { tl: this.cornerRadius, tr: this.cornerRadius, bl: this.cornerRadius, br: this.cornerRadius }; this._radii[k] = v; }
  set strokeTopWeight(v) { this._side('t', v); } set strokeBottomWeight(v) { this._side('b', v); } set strokeLeftWeight(v) { this._side('l', v); } set strokeRightWeight(v) { this._side('r', v); }
  _side(k, v) { if (!this._sides) this._sides = { t: this.strokeWeight, b: this.strokeWeight, l: this.strokeWeight, r: this.strokeWeight }; this._sides[k] = v; }
  setBoundVariable(field, v) {
    if (!VAR_FIELDS.has(field)) throw new Error('setBoundVariable: поле ' + field);
    if (!v) throw new Error(`setBoundVariable(${field}): переменная не передана у «${this.name}»`);
    this[field] = resolveVar(v.id);
  }
  get isAL() { return this.layoutMode !== 'NONE'; }
  get layoutSizingHorizontal() { return this._sizing('H'); }
  get layoutSizingVertical() { return this._sizing('V'); }
  set layoutSizingHorizontal(v) { this._setSizing('H', v); }
  set layoutSizingVertical(v) { this._setSizing('V', v); }
  _sizing(ax) {
    const p = this.parent;
    if (p && p.isAL && this.layoutPositioning !== 'ABSOLUTE') {
      const primary = (p.layoutMode === 'HORIZONTAL') === (ax === 'H');
      if (primary ? this.layoutGrow === 1 : this.layoutAlign === 'STRETCH') return 'FILL';
    }
    if (this.type === 'TEXT') {
      if (ax === 'H') return this._auto === 'WIDTH_AND_HEIGHT' ? 'HUG' : 'FIXED';
      return this._auto === 'NONE' ? 'FIXED' : 'HUG';
    }
    if (this.isAL) {
      const primary = (this.layoutMode === 'HORIZONTAL') === (ax === 'H');
      return (primary ? this.primaryAxisSizingMode : this.counterAxisSizingMode) === 'AUTO' ? 'HUG' : 'FIXED';
    }
    return 'FIXED';
  }
  _setSizing(ax, v) {
    const p = this.parent;
    if (v === 'FILL') {
      if (!p || !p.isAL) throw new Error(`layoutSizing${ax === 'H' ? 'Horizontal' : 'Vertical'} = FILL: «${this.name}» не внутри auto-layout`);
      const primary = (p.layoutMode === 'HORIZONTAL') === (ax === 'H');
      if (primary) this.layoutGrow = 1; else this.layoutAlign = 'STRETCH';
      return;
    }
    if (p && p.isAL) { const primary = (p.layoutMode === 'HORIZONTAL') === (ax === 'H'); if (primary) this.layoutGrow = 0; else this.layoutAlign = 'INHERIT'; }
    if (v === 'HUG') {
      if (this.type === 'TEXT') { if (ax === 'H') this.textAutoResize = 'WIDTH_AND_HEIGHT'; else if (this._auto === 'NONE') this.textAutoResize = 'HEIGHT'; return; }
      if (!this.isAL) throw new Error(`HUG: «${this.name}» не auto-layout`);
      const primary = (this.layoutMode === 'HORIZONTAL') === (ax === 'H');
      if (primary) this.primaryAxisSizingMode = 'AUTO'; else this.counterAxisSizingMode = 'AUTO';
      return;
    }
    if (v === 'FIXED') {
      if (this.isAL) { const primary = (this.layoutMode === 'HORIZONTAL') === (ax === 'H'); if (primary) this.primaryAxisSizingMode = 'FIXED'; else this.counterAxisSizingMode = 'FIXED'; }
      if (this.type === 'TEXT' && ax === 'H' && this._auto === 'WIDTH_AND_HEIGHT') this.textAutoResize = 'HEIGHT';
    }
  }
  findAll(pred) { const out = []; const walk = (n) => { for (const c of n.children) { if (!pred || pred(c)) out.push(c); walk(c); } }; walk(this); return out; }
  findOne(pred) { return this.findAll(pred)[0] || null; }
  clone() {
    const c = deepClone(this, null);
    if (this.parent) { const i = this.parent.children.indexOf(this); c.parent = this.parent; this.parent.children.splice(i + 1, 0, c); }
    return c;
  }
}

function deepClone(n, parent, asInstance) {
  const c = Object.create(Object.getPrototypeOf(n));
  for (const k of Object.keys(n)) c[k] = n[k];
  c.id = nid(); allNodes.set(c.id, c);
  c.parent = parent; c.removed = false;
  c.fills = JSON.parse(JSON.stringify(n.fills)); c.strokes = JSON.parse(JSON.stringify(n.strokes));
  c.effects = JSON.parse(JSON.stringify(n.effects));
  if (n._radii) c._radii = Object.assign({}, n._radii);
  if (n._sides) c._sides = Object.assign({}, n._sides);
  if (asInstance && n.type !== 'INSTANCE') c._inInstance = true;
  c.children = n.children.map((ch) => deepClone(ch, c, asInstance));
  return c;
}

class TextNode extends Node {
  constructor() {
    super('TEXT');
    this._font = { family: 'Inter', style: 'Regular' }; this.fontSize = 12; this.lineHeight = { unit: 'AUTO' };
    this.letterSpacing = { unit: 'PIXELS', value: 0 }; this.textCase = 'ORIGINAL'; this._chars = ''; this._auto = 'WIDTH_AND_HEIGHT';
    this.textAlignHorizontal = 'LEFT'; this.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  }
  set fontName(f) { if (!loaded.has(fontKey(f))) throw new Error(`fontName: шрифт ${f.family} ${f.style} не загружен`); this._font = f; }
  get fontName() { return this._font; }
  set characters(s) {
    if (!loaded.has(fontKey(this._font))) throw new Error(`characters: шрифт ${this._font.family} ${this._font.style} не загружен («${s}»)`);
    this._chars = String(s); checkGlyphs(this._chars, this._chars.slice(0, 40));
    if (this._auto !== 'NONE') this._h = this.lh() * Math.max(1, this._chars.split('\n').length);
  }
  get characters() { return this._chars; }
  set textAutoResize(v) { this._auto = v; }
  get textAutoResize() { return this._auto; }
  lh() { return this.lineHeight.unit === 'PIXELS' ? this.lineHeight.value : this.fontSize * 1.25; }
  resize(w, h) { super.resize(w, h); if (this._auto === 'WIDTH_AND_HEIGHT') this._auto = 'NONE'; }
  async setTextStyleIdAsync(id) {
    const s = textStyles.find((x) => x.id === id);
    if (!s) throw new Error('стиль не найден ' + id);
    if (!loaded.has(fontKey(s.fontName))) throw new Error('setTextStyleIdAsync: шрифт стиля не загружен ' + fontKey(s.fontName));
    this._font = s.fontName; this.fontSize = s.fontSize; this.lineHeight = s.lineHeight; this.letterSpacing = s.letterSpacing; this.textCase = s.textCase;
    this.textStyleId = id;
  }
}

// ---------------------------------------------------------------- компоненты
let propSeq = 0;
function parseVariant(name) {
  const out = {};
  for (const part of name.split(',')) { const [k, v] = part.split('=').map((x) => x && x.trim()); if (!k || v === undefined) return null; out[k] = v; }
  return out;
}
function compProps(comp) { return comp._props || (comp._props = {}); }
function makeComponentNode() {
  const c = new Node('COMPONENT');
  c.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  c.createInstance = function () {
    if (this.parent && this.parent.type === 'COMPONENT_SET' && !this.variantProperties) throw new Error('вариант без свойств');
    const i = deepClone(this, null, true);
    Object.setPrototypeOf(i, Node.prototype);
    i.type = 'INSTANCE'; i._inInstance = false; i.mainComponent = this; i.description = '';
    delete i._props; delete i.createInstance; delete i.addComponentProperty;
    for (const k of ['_fixedW', '_fixedH']) i[k] = this[k];
    attachInstanceApi(i);
    return i;
  };
  c.addComponentProperty = function (name, type, def) { return addProp(this, name, type, def); };
  return c;
}
function addProp(owner, name, type, def) {
  if (owner.parent && owner.parent.type === 'COMPONENT_SET') throw new Error('addComponentProperty у варианта — нужно у набора');
  const key = `${name}#${++propSeq}:0`;
  compProps(owner)[key] = { type, def, name };
  return key;
}
function propsOf(inst) {
  const m = inst.mainComponent;
  const owner = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m;
  return { owner, props: compProps(owner) };
}
function attachInstanceApi(i) {
  i.setProperties = function (props) {
    const { owner, props: defs } = propsOf(this);
    const variantChange = {};
    for (const [k, v] of Object.entries(props)) {
      if (defs[k]) continue;
      if (owner.type === 'COMPONENT_SET' && owner.children.some((c) => c.variantProperties && k in c.variantProperties)) { variantChange[k] = v; continue; }
      throw new Error(`setProperties: у «${owner.name}» нет свойства «${k}»`);
    }
    if (Object.keys(variantChange).length) swapVariant(this, Object.assign({}, this.mainComponent.variantProperties, variantChange));
    for (const [k, v] of Object.entries(props)) {
      const d = defs[k]; if (!d) continue;
      if (d.type === 'TEXT') {
        const ts = this.findAll((n) => n.type === 'TEXT' && n.componentPropertyReferences && n.componentPropertyReferences.characters === k && ownedBy(n, this));
        if (!ts.length) warn(`свойство ${k} не нашло слоя в «${this.name}»`);
        for (const t of ts) { t._chars = String(v); checkGlyphs(t._chars, t._chars); }
      } else if (d.type === 'INSTANCE_SWAP') {
        const comp = allNodes.get(v);
        if (!comp || comp.type !== 'COMPONENT') throw new Error('INSTANCE_SWAP: нет компонента ' + v);
        for (const n of this.findAll((x) => x.type === 'INSTANCE' && x.componentPropertyReferences && x.componentPropertyReferences.mainComponent === k)) swapTo(n, comp);
      }
    }
  };
  i.detachInstance = function () { this.type = 'FRAME'; return this; };
}
// слой принадлежит этому экземпляру, а не вложенному
function ownedBy(n, inst) { let p = n.parent; while (p && p !== inst) { if (p.type === 'INSTANCE') return false; p = p.parent; } return true; }
function swapTo(instNode, comp) {
  const fresh = comp.createInstance();
  const keep = { x: instNode.x, y: instNode.y, layoutGrow: instNode.layoutGrow, layoutAlign: instNode.layoutAlign, layoutPositioning: instNode.layoutPositioning, name: instNode.name, opacity: instNode.opacity, componentPropertyReferences: instNode.componentPropertyReferences, _scale: instNode._scale };
  instNode.children = fresh.children; for (const c of instNode.children) c.parent = instNode;
  for (const k of ['_w', '_h', 'fills', 'strokes', 'effects', 'cornerRadius', '_radii', 'layoutMode', 'primaryAxisSizingMode', 'counterAxisSizingMode', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'itemSpacing', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'mainComponent', '_sides', 'strokeWeight']) instNode[k] = fresh[k];
  Object.assign(instNode, keep);
  if (keep._scale && keep._scale !== 1) { instNode._scale = 1; instNode.rescale(keep._scale); }
}
function swapVariant(inst, want) {
  const set = inst.mainComponent.parent;
  const target = set.children.find((c) => Object.entries(want).every(([k, v]) => c.variantProperties[k] === v));
  if (!target) throw new Error(`нет варианта ${JSON.stringify(want)} в «${set.name}»`);
  // переносим текстовые переопределения по имени слоя (как Figma)
  const over = {}; for (const t of inst.findAll((n) => n.type === 'TEXT')) over[t.name] = t._chars;
  const userW = inst._userW;
  swapTo(inst, target);
  for (const t of inst.findAll((n) => n.type === 'TEXT')) {
    const def = target.findAll((n) => n.type === 'TEXT' && n.name === t.name)[0];
    if (over[t.name] !== undefined && def && over[t.name] !== def._chars && t.componentPropertyReferences) t._chars = over[t.name];
  }
  if (userW) inst._w = userW;
}

// ---------------------------------------------------------------- figma
let finish;
const done = new Promise((r) => { finish = r; });
function makePage(name) {
  const p = new Node('PAGE'); p.name = name; p.loadAsync = async () => {};
  Object.defineProperty(p, 'selection', { set(v) { this._sel = v; }, get() { return this._sel || []; }, configurable: true });
  return p;
}
const root = { children: [makePage('Page 1')] };
const figma = {
  root,
  currentPage: root.children[0],
  async setCurrentPageAsync(p) { this.currentPage = p; },
  createPage() { if (root.children.length >= 3) throw new Error('Starter: не больше 3 страниц'); const p = makePage('Page'); root.children.push(p); return p; },
  createFrame() { const n = new Node('FRAME'); n.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; return n; },
  createRectangle() { const n = new Node('RECTANGLE'); n.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 } }]; return n; },
  createEllipse() { const n = new Node('ELLIPSE'); n.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 } }]; return n; },
  createText() { return new TextNode(); },
  createComponent() { return makeComponentNode(); },
  createNodeFromSvg(svg) {
    const n = new Node('FRAME'); n._svg = svg; n.fills = [];
    const w = +(/width="([\d.]+)"/.exec(svg) || [0, 24])[1], h = +(/height="([\d.]+)"/.exec(svg) || [0, 24])[1];
    n._w = w; n._h = h; n.clipsContent = false; return n;
  },
  combineAsVariants(nodes, parent) {
    for (const n of nodes) if (n.type !== 'COMPONENT') throw new Error('combineAsVariants: не компонент ' + n.name);
    const set = new Node('COMPONENT_SET'); set.fills = [];
    set.addComponentProperty = function (name, type, def) { return addProp(this, name, type, def); };
    parent.appendChild(set);
    for (const n of nodes) {
      const vp = parseVariant(n.name);
      if (!vp) throw new Error('имя варианта без свойств: ' + n.name);
      n.variantProperties = vp; set.appendChild(n);
    }
    Object.defineProperty(set, 'defaultVariant', { get() { return this.children[0]; } });
    return set;
  },
  async loadFontAsync(f) {
    if (!AVAILABLE.some((a) => fontKey(a.fontName) === fontKey(f))) throw new Error('шрифт недоступен: ' + fontKey(f));
    loaded.add(fontKey(f));
  },
  async listAvailableFontsAsync() { return AVAILABLE; },
  createTextStyle() {
    const s = { id: 'S:' + (++seq), name: 'Style', fontName: { family: 'Inter', style: 'Regular' }, fontSize: 12, lineHeight: { unit: 'AUTO' }, letterSpacing: { unit: 'PIXELS', value: 0 }, textCase: 'ORIGINAL', remove() { textStyles.splice(textStyles.indexOf(this), 1); } };
    textStyles.push(s); return s;
  },
  async getLocalTextStylesAsync() { return textStyles.slice(); },
  variables: {
    async getLocalVariableCollectionsAsync() { return collections.slice(); },
    async getLocalVariablesAsync() { return variables.slice(); },
    createVariableCollection(name) {
      const c = { id: 'VC:' + (++seq), name, modes: [{ modeId: 'M:1', name: 'Mode 1' }], remove() { collections.splice(collections.indexOf(this), 1); } };
      collections.push(c); return c;
    },
    createVariable(name, coll, type) {
      const v = { id: 'V:' + (++seq), name, resolvedType: type, variableCollectionId: coll.id || coll, valuesByMode: {}, scopes: [],
        setValueForMode(m, val) { if (val && val.type === 'VARIABLE_ALIAS' && !variables.some((x) => x.id === val.id)) throw new Error('алиас на несуществующую переменную'); this.valuesByMode[m] = val; },
        setVariableCodeSyntax() {}, remove() { variables.splice(variables.indexOf(this), 1); } };
      variables.push(v); return v;
    },
    setBoundVariableForPaint(paint, field, v) {
      if (field !== 'color' || !v) throw new Error('setBoundVariableForPaint: ' + field);
      return Object.assign({}, paint, { boundVariables: { color: { type: 'VARIABLE_ALIAS', id: v.id } } });
    },
  },
  viewport: { scrollAndZoomIntoView() {} },
  notify(m) { console.log('[notify]', m); },
  showUI() { throw new Error('showUI на пустом файле не ожидается'); },
  closePlugin(m) { finish(m); },
};

// ---------------------------------------------------------------- HTML
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function paintColor(p) {
  if (!p || p.type !== 'SOLID' || p.visible === false) return null;
  const c = p.boundVariables ? resolveVar(p.boundVariables.color.id) : p.color;
  const a = (p.opacity === undefined ? 1 : p.opacity) * (c.a === undefined ? 1 : c.a);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${+a.toFixed(3)})`;
}
const firstColor = (arr) => { for (const p of arr || []) { const c = paintColor(p); if (c) return c; } return null; };
const JUST = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', SPACE_BETWEEN: 'space-between' };
const ALIGN = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', BASELINE: 'baseline' };

function radiusCss(n) {
  if (n.type === 'ELLIPSE') return 'border-radius:50%;';
  if (n._radii) return `border-radius:${n._radii.tl}px ${n._radii.tr}px ${n._radii.br}px ${n._radii.bl}px;`;
  return n.cornerRadius ? `border-radius:${Math.min(n.cornerRadius, 9999)}px;` : '';
}

function render(n, parentAL, isRoot) {
  if (n.removed) return '';
  const st = ['box-sizing:border-box', 'position:relative', 'flex-shrink:0'];
  const absolute = !isRoot && (!parentAL || n.layoutPositioning === 'ABSOLUTE');
  if (absolute) st.push(`position:absolute;left:${n.x}px;top:${n.y}px`);
  const hs = isRoot ? (n.isAL && n.type !== 'TEXT' ? n._sizing('H') : 'FIXED') : n._sizing('H');
  const vs = isRoot ? (n.isAL && n.type !== 'TEXT' ? n._sizing('V') : 'FIXED') : n._sizing('V');
  const row = parentAL === 'HORIZONTAL';
  if (hs === 'FILL' && !absolute) st.push(row ? 'flex:1 1 0;min-width:0' : 'align-self:stretch;min-width:0');
  else if (hs === 'HUG') st.push('width:max-content');
  else st.push(`width:${n.width}px`);
  if (vs === 'FILL' && !absolute) st.push(row ? 'align-self:stretch' : 'flex:1 1 0;min-height:0');
  else if (vs === 'HUG') st.push('height:auto');
  else st.push(`height:${n.height}px`);
  if (hs === 'FILL' && vs === 'FILL' && !absolute) st.push('flex:1 1 0;align-self:stretch');
  if (n.opacity !== 1) st.push(`opacity:${n.opacity}`);
  if (n.rotation) st.push(`transform:rotate(${-n.rotation}deg);transform-origin:0 0`);
  const eff = (n.effects || []).filter((e) => e.type === 'DROP_SHADOW' && e.visible !== false)
    .map((e) => `${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread || 0}px rgba(${Math.round(e.color.r * 255)},${Math.round(e.color.g * 255)},${Math.round(e.color.b * 255)},${e.color.a})`);
  if (eff.length) st.push('box-shadow:' + eff.join(','));
  const attrs = `data-name="${esc(n.name)}" data-type="${n.type}"`;

  if (n.type === 'TEXT') {
    const f = n._font, col = firstColor(n.fills) || 'transparent';
    st.push(`font-family:'${f.family}';font-weight:${WEIGHT[f.style] || 400};font-size:${n.fontSize}px;line-height:${n.lh()}px;color:${col}`);
    if (n.letterSpacing && n.letterSpacing.value) st.push(`letter-spacing:${n.letterSpacing.unit === 'PERCENT' ? n.fontSize * n.letterSpacing.value / 100 : n.letterSpacing.value}px`);
    if (n.textCase === 'UPPER') st.push('text-transform:uppercase');
    st.push(`text-align:${(n.textAlignHorizontal || 'LEFT').toLowerCase()}`);
    st.push(n._auto === 'WIDTH_AND_HEIGHT' && hs !== 'FILL' ? 'white-space:pre' : 'white-space:pre-wrap;overflow-wrap:break-word');
    return `<div ${attrs} data-text="1" style="${st.join(';')}">${esc(n._chars)}</div>`;
  }
  if (n.type === 'ELLIPSE' && n.arcData) {
    const { startingAngle: a0, endingAngle: a1, innerRadius: ir } = n.arcData;
    const W = n.width, H = n.height, cx = W / 2, cy = H / 2, R = W / 2, r = R * ir;
    const pt = (rad, a) => `${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const d = `M ${pt(R, a0)} A ${R} ${R} 0 ${large} 1 ${pt(R, a1)} L ${pt(r, a1)} A ${r} ${r} 0 ${large} 0 ${pt(r, a0)} Z`;
    return `<div ${attrs} style="${st.join(';')}"><svg width="${W}" height="${H}" style="display:block"><path d="${d}" fill="${firstColor(n.fills)}"/></svg></div>`;
  }
  if (n._svg) {
    const inner = n._svg.replace(/width="[\d.]+"/, 'width="100%"').replace(/height="[\d.]+"/, 'height="100%"');
    return `<div ${attrs} style="${st.join(';')}">${inner}</div>`;
  }
  const bg = firstColor(n.fills);
  if (bg) st.push(`background:${bg}`);
  st.push(radiusCss(n));
  if (n.clipsContent && n.type !== 'RECTANGLE' && n.type !== 'ELLIPSE') st.push('overflow:hidden');
  let inner = '';
  if (n.isAL) {
    const dir = n.layoutMode;
    const sb = n.primaryAxisAlignItems === 'SPACE_BETWEEN';
    st.push(`display:flex;flex-direction:${dir === 'HORIZONTAL' ? 'row' : 'column'}`);
    st.push(`justify-content:${JUST[n.primaryAxisAlignItems] || 'flex-start'};align-items:${ALIGN[n.counterAxisAlignItems] || 'flex-start'}`);
    st.push(`padding:${n.paddingTop}px ${n.paddingRight}px ${n.paddingBottom}px ${n.paddingLeft}px`);
    if (n.layoutWrap === 'WRAP') st.push(`flex-wrap:wrap;column-gap:${sb ? 0 : n.itemSpacing}px;row-gap:${n.counterAxisSpacing}px`);
    else st.push(`gap:${sb ? 0 : n.itemSpacing}px`);
    if (n.minHeight) st.push(`min-height:${n.minHeight}px`);
  }
  inner = n.children.map((c) => render(c, n.isAL ? n.layoutMode : null, false)).join('');
  // обводка поверх, внутрь — не влияет на раскладку, как в Figma
  const sc = firstColor(n.strokes);
  if (sc) {
    const s = n._sides || { t: n.strokeWeight, b: n.strokeWeight, l: n.strokeWeight, r: n.strokeWeight };
    if (s.t || s.b || s.l || s.r) {
      const style = n.dashPattern && n.dashPattern.length ? 'dashed' : 'solid';
      inner += `<div style="position:absolute;inset:0;pointer-events:none;box-sizing:border-box;border-style:${style};border-color:${sc};border-width:${s.t}px ${s.r}px ${s.b}px ${s.l}px;${radiusCss(n)}"></div>`;
    }
  }
  return `<div ${attrs} style="${st.join(';')}">${inner}</div>`;
}

function fontFaces() {
  const out = [];
  for (const [w, file] of [[400, 400], [500, 500], [600, 700], [700, 700], [800, 800]]) for (const sub of ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext']) {
    const f = path.join(ONEST, `onest-${sub}-${file}-normal.woff2`);
    if (fs.existsSync(f)) out.push(`@font-face{font-family:'Onest';font-weight:${w};src:url('file://${f}') format('woff2');}`);
  }
  return out.join('\n');
}

// ---------------------------------------------------------------- запуск
(async () => {
  const code = fs.readFileSync(path.join(ROOT, 'figma-plugin/code.js'), 'utf8');
  vm.runInNewContext(code, { figma, console, Promise, Object, Math, String, Number, Array, JSON, Set, Map, parseFloat, parseInt, Error, setTimeout }, { filename: 'code.js' });
  const msg = await Promise.race([done, new Promise((_, rej) => setTimeout(() => rej(new Error('плагин не вызвал closePlugin за 20 с')), 20000))]);
  console.log('closePlugin:', msg);
  if (!msg || !/^✅/.test(msg)) process.exit(1);

  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) if (/\.(png|svg|html)$/.test(f)) fs.unlinkSync(path.join(OUT, f));
  const targets = [];
  for (const p of root.children) for (const r of p.children) {
    if (/Экраны$/.test(r.name)) r.children.forEach((sc) => targets.push([sc, sc.name]));
    else targets.push([r, r.name.replace(/^.* · /, '00 · ')]);
  }
  const counts = { nodes: 0, comps: 0, inst: 0 }; for (const p of root.children) for (const n of p.findAll()) { counts.nodes++; if (n.type === 'COMPONENT') counts.comps++; if (n.type === 'INSTANCE') counts.inst++; }
  console.log(`Страницы: ${root.children.map((p) => p.name).join(', ')} · слоёв ${counts.nodes}, компонентов ${counts.comps}, экземпляров ${counts.inst}, переменных ${variables.length}, стилей ${textStyles.length}`);

  const puppeteer = require(process.env.PUPPETEER || '/opt/npm-tools/node_modules/puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const pg = await browser.newPage();
  for (const [node, title] of targets) {
    const slug = title.replace(/[«»"]/g, '').replace(/[^0-9A-Za-zА-Яа-яЁё]+/g, '-').replace(/-+$/, '');
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces()}\nbody{margin:0;background:#fff}*{-webkit-font-smoothing:antialiased}</style></head><body><div id="root" style="display:inline-block">${render(node, null, true)}</div></body></html>`;
    const file = path.join(OUT, slug + '.html');
    fs.writeFileSync(file, html);
    const big = /^00 · /.test(title);
    await pg.setViewport({ width: Math.ceil(Math.min(node.width, 4000)) + 2, height: 800, deviceScaleFactor: big ? 1 : 2 });
    await pg.goto('file://' + file, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    const issues = await pg.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('[data-text]')) {
        const p = el.parentElement;
        const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
        if (el.scrollWidth > el.clientWidth + 1) out.push(`текст не помещается по ширине: «${el.textContent.slice(0, 50)}» в «${el.dataset.name}»`);
        if (getComputedStyle(p).overflow === 'hidden' && (r.right > pr.right + 1 || r.bottom > pr.bottom + 1)) out.push(`текст обрезан рамкой «${p.dataset.name}»: «${el.textContent.slice(0, 50)}»`);
      }
      for (const el of document.querySelectorAll('[data-type]')) {
        if (el.dataset.type === 'TEXT') continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'flex' && el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible') out.push(`содержимое шире рамки «${el.dataset.name}» (${el.scrollWidth} > ${el.clientWidth})`);
      }
      return out;
    });
    issues.forEach((m) => warn(`[${title}] ${m}`));
    const box = await (await pg.$('#root > div')).boundingBox();
    await pg.screenshot({ path: path.join(OUT, slug + '.png'), clip: { x: 0, y: 0, width: Math.ceil(box.width), height: Math.ceil(box.height) }, captureBeyondViewport: true });
    fs.unlinkSync(file);
    console.log(`  ${title} → ${slug}.png (${Math.round(box.width)}×${Math.round(box.height)})`);
  }
  await browser.close();
  const uniq = [...new Set(warnings)];
  if (uniq.length) { console.log('ПРЕДУПРЕЖДЕНИЯ (' + uniq.length + '):'); uniq.slice(0, 60).forEach((w) => console.log('  - ' + w)); } else console.log('Предупреждений нет');
})().catch((e) => { console.error(e); process.exit(1); });
