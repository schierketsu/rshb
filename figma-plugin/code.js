// =====================================================================
//  Диво × Diasoft · UI Kit generator for Figma · v2
//  Макеты раздела «Диво» для событий из Diasoft FA# Treasury.Back.
//
//  Устройство кита — как у генератора «ФОЛК»: переменные (примитивы →
//  токены → размеры), стили текста, компоненты с вариантами, три страницы
//  «Основы / Компоненты / Экраны», всё на auto-layout.
//  Визуальный язык — как у дашборда деградаций сервисов (demotask):
//  белая страница, чёрный текст, тонкие линии, «таблетки» с тенью,
//  серые подложки, шкала степеней зелёный → жёлтый → оранжевый → красный.
//
//  Запуск на пустом файле: Plugins → Development → Import plugin from
//  manifest… → manifest.json → Plugins → Development → «Диво × Diasoft».
// =====================================================================

// Шрифт: первый найденный из списка. Styrene A LC — как в дашборде деградаций;
// если его нет в Figma, берётся похожий геометрический Onest (Google Fonts).
const FONT_FAMILIES = ['Styrene A LC', 'Onest', 'Manrope', 'Inter'];
const KIT = 'Диво × Diasoft';
const PAGES = { found: 'Основы', comps: 'Компоненты', screens: 'Экраны' };

// ---------------------------------------------------------------------
// Палитра: монохром + шкала степеней
// ---------------------------------------------------------------------
const PALETTE = [
  { key: 'neutral', ru: 'Нейтральные', role: 'Текст, фоны, линии, кнопки', shades: { 0: '#FFFFFF', 50: '#F4F4F2', 100: '#EBEBE8', 200: '#E6E5E0', 300: '#D5D8DE', 400: '#C9CCD2', 600: '#5C5B57', 900: '#0B0B0B' } },
  { key: 'green', ru: 'Зелёный', role: 'Норма · устранено · цель выполнена', shades: { 50: '#E4F6E9', 300: '#8CE19F', 500: '#2FC35A', 700: '#236B3F' } },
  { key: 'yellow', ru: 'Жёлтый', role: 'WARNING · предупреждение', shades: { 50: '#FFF4D6', 300: '#FDD468', 500: '#FBB516', 700: '#8A6414' } },
  { key: 'orange', ru: 'Оранжевый', role: 'MAJOR · деградация', shades: { 50: '#FFEADF', 300: '#FF9A72', 500: '#FF5B1F', 700: '#B34E2E' } },
  { key: 'red', ru: 'Красный', role: 'CRITICAL · нарушение SLA', shades: { 50: '#FCE4E7', 300: '#EE6F7A', 500: '#E31D2F', 700: '#B5202D' } },
  { key: 'blue', ru: 'Синий', role: 'INFO · ссылки · фокус', shades: { 50: '#E7EEFF', 300: '#8DB3FF', 500: '#2B73FE', 700: '#1F55C2' } },
];

const S_FILL = ['FRAME_FILL', 'SHAPE_FILL'];
const S_TEXT = ['TEXT_FILL'];
const S_STROKE = ['STROKE_COLOR'];
const S_ANY = ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR', 'TEXT_FILL'];

const SEMANTIC = [
  ['color/bg/page', 'neutral/0', S_FILL],
  ['color/bg/card', 'neutral/0', S_FILL],
  ['color/bg/wash', 'neutral/50', S_FILL],
  ['color/bg/wash-hover', 'neutral/100', S_FILL],
  ['color/text/primary', 'neutral/900', S_ANY],
  ['color/text/secondary', 'neutral/600', S_ANY],
  ['color/text/disabled', 'neutral/400', S_TEXT],
  ['color/text/on-color', 'neutral/0', S_TEXT],
  ['color/line/default', 'neutral/200', S_ANY],
  ['color/line/control', 'neutral/300', S_STROKE],
  ['color/track', 'neutral/400', S_ANY],
  ['color/action/primary', 'neutral/900', S_FILL],
];
// Роли шкалы: ok — норма, warning — WARNING, major — MAJOR, critical — CRITICAL, info — INFO и ссылки
const ROLES = { ok: 'green', warning: 'yellow', major: 'orange', critical: 'red', info: 'blue' };
for (const [role, fam] of Object.entries(ROLES)) {
  SEMANTIC.push([`color/${role}/default`, `${fam}/500`, S_ANY]);
  SEMANTIC.push([`color/${role}/strong`, `${fam}/700`, S_ANY]);
  SEMANTIC.push([`color/${role}/muted`, `${fam}/300`, S_ANY]);
  SEMANTIC.push([`color/${role}/subtle`, `${fam}/50`, S_ANY]);
}

const SPACING = { '2xs': 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, '2xl': 32 };
const RADIUS = { xs: 4, sm: 6, md: 10, lg: 12, xl: 16, '2xl': 24, full: 999 };

// Типографика: ключ → [имя, вес, размер, интерлиньяж, трекинг, капс]
// Три основных размера, как в дашборде деградаций: 24 · 15 · 12 (+ 13 для таблиц и 28 для чисел)
const TYPE = {
  display: ['Display', 'bold', 32, 40, -0.4, false],
  h1: ['Заголовок страницы', 'bold', 24, 32, -0.2, false],
  kpi: ['Число', 'bold', 28, 34, -0.3, false],
  h2: ['Заголовок блока', 'bold', 15, 20, 0, false],
  body: ['Текст', 'regular', 15, 21, 0, false],
  bodyBold: ['Текст жирный', 'bold', 15, 21, 0, false],
  cell: ['Ячейка', 'regular', 13, 18, 0, false],
  cellBold: ['Ячейка жирная', 'bold', 13, 18, 0, false],
  small: ['Подпись', 'regular', 12, 16, 0, false],
  smallBold: ['Подпись жирная', 'bold', 12, 16, 0, false],
  overline: ['Надзаголовок', 'bold', 11, 14, 0.6, true],
};

// ---------------------------------------------------------------------
// Иконки: контурные, сетка 24, линия 1.8 — в духе Admiral Icons
// ---------------------------------------------------------------------
const ic = (b) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const ICONS = {
  'Шеврон вниз': ic('<path d="M6 9l6 6 6-6"/>'),
  'Шеврон влево': ic('<path d="M15 6l-6 6 6 6"/>'),
  'Шеврон вправо': ic('<path d="M9 6l6 6-6 6"/>'),
  'Закрыть': ic('<path d="M6 6l12 12M18 6L6 18"/>'),
  'Экспорт': ic('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  'Импорт': ic('<path d="M12 15V4M7 9l5-5 5 5M5 20h14"/>'),
  'Выход': ic('<path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10M14 8l4 4-4 4M18 12H9"/>'),
  'Солнце': ic('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
  'Луна': ic('<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/>'),
  'Поиск': ic('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.6-4.6"/>'),
  'Колокол': ic('<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16zM10 20.5a2 2 0 0 0 4 0"/>'),
  'Ссылка': ic('<path d="M14 5h5v5M19 5l-8 8M17 13.5V18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4.5"/>'),
  'Код': ic('<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>'),
  'Обновить': ic('<path d="M19 12a7 7 0 1 1-2.05-4.95M19 4v4h-4"/>'),
};

// ---------------------------------------------------------------------
// Данные для экранов (совпадают с примерами в репозитории)
// ---------------------------------------------------------------------
const EVENTS = [
  { sev: 'CRITICAL', time: '19:30', title: 'Задержка закрытия операционного дня', code: 'EOD_CLOSE_DELAYED', obj: 'шаг 07 «Переоценка»', svc: 'Закрытие опердня', ci: 'CI-TB-EOD-01', dev: '+173 %', devSub: '27 из 10 мин', sla: 'осталось 22 мин', slaRole: 'critical', inc: 'INC-18501', active: true },
  { sev: 'MAJOR', time: '19:21', title: 'Курсы и котировки устарели', code: 'MARKET_DATA_STALE', obj: 'курсы USD, EUR, CNY', svc: 'Рыночные данные', ci: 'CI-TB-MD-01', dev: '34 мин', devSub: 'порог 15 мин', sla: 'запас 1 ч 05 мин', slaRole: null, inc: 'INC-18498', active: true },
  { sev: 'WARNING', time: '19:05', title: 'Рост очереди обработки сделок', code: 'PROCESSING_BACKLOG', obj: 'загрузка из фронт-офиса', svc: 'Учёт сделок', ci: 'CI-TB-CORE-01', dev: '148 шт.', devSub: 'порог 100', sla: 'в норме', slaRole: 'ok', inc: '—', active: true },
  { sev: 'MAJOR', time: '18:52', title: 'Ошибки обмена со шлюзом SWIFT', code: 'EXTERNAL_GATEWAY_ERROR', obj: 'шлюз SWIFT', svc: 'Расчёты FX и МБК', ci: 'CI-TB-SETTL-01', dev: '7 ошибок', devSub: 'порог 3', sla: 'запас 2 ч 38 мин', slaRole: null, inc: 'INC-18496', active: true },
  { sev: 'WARNING', time: '18:40', title: 'Задержка расчёта по сделке', code: 'OPERATION_DELAYED', obj: 'REPO-2026-118377', svc: 'Расчёты ЦБ и РЕПО', ci: 'CI-TB-SEC-01', dev: '+62 %', devSub: '8 из 5 мин', sla: 'в норме', slaRole: 'ok', inc: '—', active: true },
  { sev: 'CRITICAL', time: '13:15', title: 'Treasury.Back недоступен', code: 'SYSTEM_UNAVAILABLE', obj: 'tb-app-prod-01', svc: 'Учёт сделок', ci: 'CI-TB-CORE-01', dev: '14 мин', devSub: 'простой', sla: 'нарушен', slaRole: 'critical', inc: 'INC-18494', active: false, resolved: '13:29' },
  { sev: 'CRITICAL', time: '12:04', title: 'Поручение отклонено депозитарием', code: 'SETTLEMENT_REJECTED', obj: 'REPO-2026-118204', svc: 'Расчёты ЦБ и РЕПО', ci: 'CI-TB-SEC-01', dev: 'отказ', devSub: 'NSD-REJ-4012', sla: 'нарушен', slaRole: 'critical', inc: 'INC-18495', active: false, resolved: '12:41' },
  { sev: 'MAJOR', time: '11:47', title: 'Задержка расчёта по сделке', code: 'OPERATION_DELAYED', obj: 'FX-2026-834724', svc: 'Расчёты FX и МБК', ci: 'CI-TB-SETTL-01', dev: '+340 %', devSub: '22 из 5 мин', sla: 'в норме', slaRole: 'ok', inc: 'INC-18493', active: false, resolved: '11:58' },
];

const SERVICES = [
  { name: 'Учёт сделок казначейства', short: 'Учёт сделок', code: 'TREASURY_DEAL_CAPTURE', st: 'Предупреждение', av: '99,97 %', inTime: '99,6 %', inc: [1, 1], ev: [1, 3, 9], days: '000000000000000000001000000000' },
  { name: 'Расчёты по сделкам FX и МБК', short: 'Расчёты FX и МБК', code: 'TREASURY_FX_MM_SETTLEMENT', st: 'Деградация', av: '99,95 %', inTime: '96,7 %', inc: [1, 3], ev: [2, 11, 21], days: '000020000000200000000020000022' },
  { name: 'Расчёты по ценным бумагам и РЕПО', short: 'Расчёты ЦБ и РЕПО', code: 'TREASURY_SEC_SETTLEMENT', st: 'Предупреждение', av: '99,92 %', inTime: '98,1 %', inc: [2, 1], ev: [3, 6, 17], days: '000000003000000020000000000001' },
  { name: 'Закрытие операционного дня', short: 'Закрытие опердня', code: 'TREASURY_EOD', st: 'Критично', av: '99,90 %', inTime: '93,3 %', inc: [1, 2], ev: [2, 8, 12], days: '000000200000000000020000000003' },
  { name: 'Загрузка рыночных данных', short: 'Рыночные данные', code: 'TREASURY_MARKET_DATA', st: 'Деградация', av: '99,93 %', inTime: '98,9 %', inc: [0, 2], ev: [1, 6, 14], days: '000000000000200000000000000002' },
  { name: 'Регуляторная отчётность', short: 'Отчётность', code: 'TREASURY_REPORTING', st: 'Норма', av: '100 %', inTime: '100 %', inc: [0, 0], ev: [0, 0, 4], days: '000000000000000000000000000000' },
];

// Уровни шкалы: название → роль токена
const SEV = { CRITICAL: 'critical', MAJOR: 'major', WARNING: 'warning', INFO: 'info' };
const STATUS = { 'Норма': 'ok', 'Предупреждение': 'warning', 'Деградация': 'major', 'Критично': 'critical', 'Нет данных': null };

// ---------------------------------------------------------------------
// Утилиты (по образцу генератора «ФОЛК»)
// ---------------------------------------------------------------------
const V = {};
const TS = {};
const STATS = { variables: 0, textStyles: 0, components: 0, sets: 0, screens: 0 };

const hex = (h) => { h = h.replace('#', ''); return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }; };
const solid = (h, opacity = 1) => ({ type: 'SOLID', color: hex(h), opacity });
const vpaint = (name, opacity = 1) => {
  if (!V[name]) throw new Error('Нет переменной ' + name);
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity }, 'color', V[name]);
};
function fill(n, name, opacity = 1) { n.fills = name ? [vpaint(name, opacity)] : []; }
function stroke(n, name, w = 1) { n.strokes = [vpaint(name)]; n.strokeWeight = w; n.strokeAlign = 'INSIDE'; }
function rad(n, key) { for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) n.setBoundVariable(c, V['radius/' + key]); }
function pad(n, vKey, hKey) {
  n.setBoundVariable('paddingTop', V['spacing/' + vKey]); n.setBoundVariable('paddingBottom', V['spacing/' + vKey]);
  n.setBoundVariable('paddingLeft', V['spacing/' + hKey]); n.setBoundVariable('paddingRight', V['spacing/' + hKey]);
}
function gap(n, key) { n.setBoundVariable('itemSpacing', V['spacing/' + key]); }
// Приподнятая «таблетка»: тонкая рамка и мягкая тень
function raised(n) {
  stroke(n, 'color/line/control', 1);
  n.effects = [{ type: 'DROP_SHADOW', color: { r: 15 / 255, g: 23 / 255, b: 42 / 255, a: 0.15 }, offset: { x: 0, y: 1 }, radius: 3, spread: 0, visible: true, blendMode: 'NORMAL' }];
}
function cardStyle(n, r = 'lg') { fill(n, 'color/bg/card'); stroke(n, 'color/line/default', 1); rad(n, r); }

function AL(dir = 'HORIZONTAL', name = 'Frame') {
  const f = figma.createFrame();
  f.name = name; f.layoutMode = dir;
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  f.fills = []; f.clipsContent = false;
  return f;
}
function COMP(name, dir = 'HORIZONTAL') {
  const c = figma.createComponent();
  c.name = name; c.layoutMode = dir;
  c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'AUTO';
  c.fills = []; c.clipsContent = false;
  STATS.components++;
  return c;
}
function center(n) { n.primaryAxisAlignItems = 'CENTER'; n.counterAxisAlignItems = 'CENTER'; }
function fixW(n, w) { n.resize(w, n.height); if (n.layoutMode === 'VERTICAL') n.primaryAxisSizingMode = 'AUTO'; else n.counterAxisSizingMode = 'AUTO'; }
function fixBox(n, w, h) { n.resize(w, h); n.primaryAxisSizingMode = 'FIXED'; n.counterAxisSizingMode = 'FIXED'; }
function append(parent, child, o = {}) {
  parent.appendChild(child);
  if (o.fillW) child.layoutSizingHorizontal = 'FILL';
  if (o.fillH) child.layoutSizingVertical = 'FILL';
  if (o.grow) child.layoutGrow = 1;
  return child;
}
function spacer(parent) { const s = figma.createFrame(); s.name = 'Распорка'; s.fills = []; s.resize(1, 1); parent.appendChild(s); s.layoutGrow = 1; return s; }
function wrapRow(name, width, g, rowGap) {
  const f = AL('HORIZONTAL', name);
  f.resize(width, 10);
  f.layoutWrap = 'WRAP'; f.counterAxisSizingMode = 'AUTO';
  f.itemSpacing = g; f.counterAxisSpacing = rowGap;
  return f;
}

async function T(chars, style, color, o = {}) {
  const t = figma.createText();
  await t.setTextStyleIdAsync(TS[style].id);
  t.characters = chars;
  t.name = o.name || chars.slice(0, 32);
  if (color) fill(t, color, o.opacity || 1);
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.width) { t.resize(o.width, t.height); t.textAutoResize = 'HEIGHT'; }
  return t;
}
function wrap(t) { t.layoutSizingHorizontal = 'FILL'; t.textAutoResize = 'HEIGHT'; return t; }
function svgNode(svg, name) { const n = figma.createNodeFromSvg(svg); n.name = name; n.fills = []; return n; }

const variantOf = (set, props) => set.children.find((c) => Object.entries(props).every(([k, v]) => c.variantProperties && c.variantProperties[k] === v));
function inst(compOrSet, props) {
  const c = compOrSet.type === 'COMPONENT_SET' ? (props ? variantOf(compOrSet, props) : compOrSet.defaultVariant) : compOrSet;
  if (!c) throw new Error('Нет варианта ' + JSON.stringify(props) + ' в ' + compOrSet.name);
  return c.createInstance();
}
const nested = (instance, name) => instance.findOne((n) => n.type === 'INSTANCE' && n.name === name);
const textIn = (node, name) => node.findOne((n) => n.type === 'TEXT' && n.name === name);

// Набор вариантов в пунктирной рамке, ширина задаётся явно (cols колонок по colW)
function combine(variants, parent, name, cols, colW, desc) {
  const set = figma.combineAsVariants(variants, parent);
  set.name = name;
  set.layoutMode = 'HORIZONTAL';
  set.itemSpacing = 24;
  set.paddingTop = 32; set.paddingBottom = 32; set.paddingLeft = 32; set.paddingRight = 32;
  set.counterAxisAlignItems = 'MIN';
  set.resize(64 + cols * colW + (cols - 1) * 24, 100);
  set.layoutWrap = 'WRAP'; set.counterAxisSpacing = 24;
  set.primaryAxisSizingMode = 'FIXED'; set.counterAxisSizingMode = 'AUTO';
  set.fills = [solid('#FFFFFF')];
  set.strokes = [solid('#9747FF')]; set.strokeWeight = 1; set.dashPattern = [10, 5];
  set.cornerRadius = 16;
  if (desc) set.description = desc;
  STATS.sets++;
  return set;
}
function textProp(owner, prop, def, layerName) {
  const key = owner.addComponentProperty(prop, 'TEXT', def);
  const comps = owner.type === 'COMPONENT_SET' ? owner.children : [owner];
  for (const v of comps) for (const t of v.findAll((n) => n.type === 'TEXT' && n.name === layerName)) t.componentPropertyReferences = { characters: key };
  return key;
}
function swapProp(owner, prop, defComp, layerName) {
  const key = owner.addComponentProperty(prop, 'INSTANCE_SWAP', defComp.id);
  const comps = owner.type === 'COMPONENT_SET' ? owner.children : [owner];
  for (const v of comps) for (const i of v.findAll((n) => n.type === 'INSTANCE' && n.name === layerName)) i.componentPropertyReferences = { mainComponent: key };
  return key;
}

// ---------------------------------------------------------------------
// 1. Шрифты
// ---------------------------------------------------------------------
async function loadFonts() {
  const all = await figma.listAvailableFontsAsync();
  const norm = (s) => s.replace(/\s/g, '').toLowerCase();
  const family = FONT_FAMILIES.find((f) => all.some((x) => x.fontName.family === f)) || 'Inter';
  const pick = (wanted) => {
    const fam = all.filter((f) => f.fontName.family === family);
    for (const w of wanted) { const m = fam.find((f) => norm(f.fontName.style) === norm(w)); if (m) return m.fontName; }
    return fam.length ? fam[0].fontName : { family: 'Inter', style: 'Regular' };
  };
  const F = {
    regular: pick(['Regular', 'Book', 'Medium']),
    bold: pick(['Bold', 'SemiBold', 'Semi Bold', 'Medium']),
  };
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  for (const f of Object.values(F)) await figma.loadFontAsync(f);
  return { F, family };
}

// ---------------------------------------------------------------------
// 2. Переменные и стили
// ---------------------------------------------------------------------
async function buildVariables() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const existing = await figma.variables.getLocalVariablesAsync();
  const coll = (name) => cols.find((c) => c.name === name) || figma.variables.createVariableCollection(name);
  const mk = (c, name, type, value, scopes) => {
    let v = existing.find((x) => x.name === name && x.variableCollectionId === c.id);
    if (!v) { v = figma.variables.createVariable(name, c, type); STATS.variables++; }
    v.setValueForMode(c.modes[0].modeId, value);
    v.scopes = scopes;
    try { v.setVariableCodeSyntax('WEB', 'var(--' + name.replace(/\//g, '-') + ')'); } catch (e) { /* ок */ }
    V[name] = v;
    return v;
  };
  const prim = coll(`${KIT} · Примитивы`);
  for (const p of PALETTE) for (const [shade, h] of Object.entries(p.shades)) mk(prim, `${p.key}/${shade}`, 'COLOR', hex(h), []);
  const tok = coll(`${KIT} · Токены`);
  for (const [name, ref, scopes] of SEMANTIC) mk(tok, name, 'COLOR', { type: 'VARIABLE_ALIAS', id: V[ref].id }, scopes);
  const dim = coll(`${KIT} · Размеры`);
  for (const [k, v] of Object.entries(SPACING)) mk(dim, `spacing/${k}`, 'FLOAT', v, ['GAP']);
  for (const [k, v] of Object.entries(RADIUS)) mk(dim, `radius/${k}`, 'FLOAT', v, ['CORNER_RADIUS']);
}

async function buildTextStyles(F) {
  const ex = await figma.getLocalTextStylesAsync();
  for (const [k, [name, w, size, lh, ls, upper]] of Object.entries(TYPE)) {
    const full = `${KIT}/${name}`;
    let s = ex.find((x) => x.name === full);
    if (!s) { s = figma.createTextStyle(); STATS.textStyles++; }
    s.name = full;
    s.fontName = F[w];
    s.fontSize = size;
    s.lineHeight = { unit: 'PIXELS', value: lh };
    s.letterSpacing = { unit: 'PIXELS', value: ls };
    s.textCase = upper ? 'UPPER' : 'ORIGINAL';
    TS[k] = s;
  }
}

// ---------------------------------------------------------------------
// 3. Страницы и разделы
// ---------------------------------------------------------------------
async function getPage(name) {
  let p = figma.root.children.find((x) => x.name === name);
  if (p) return p;
  const first = figma.root.children[0];
  await first.loadAsync();
  if (figma.root.children.length === 1 && first.children.length === 0) { first.name = name; return first; }
  try { p = figma.createPage(); p.name = name; return p; }
  catch (e) { return first; } // лимит страниц (Starter) — кладём всё на первую
}
function rootFrame(name, page) {
  const f = AL('VERTICAL', name);
  f.paddingTop = 80; f.paddingBottom = 80; f.paddingLeft = 80; f.paddingRight = 80;
  f.itemSpacing = 72;
  f.fills = [solid('#F4F4F2')];
  page.appendChild(f);
  const others = page.children.filter((n) => n !== f);
  f.x = others.length ? Math.max(...others.map((n) => n.x + n.width)) + 200 : 0;
  f.y = 0;
  return f;
}
async function section(parent, title, desc, dir = 'HORIZONTAL') {
  const s = AL('VERTICAL', title);
  s.itemSpacing = 24;
  parent.appendChild(s);
  const head = AL('VERTICAL', 'Заголовок раздела'); head.itemSpacing = 6; s.appendChild(head);
  head.appendChild(await T(title, 'h1', 'color/text/primary'));
  if (desc) head.appendChild(await T(desc, 'body', 'color/text/secondary', { width: 820 }));
  const body = AL(dir, 'Содержимое');
  body.itemSpacing = 32;
  s.appendChild(body);
  return body;
}

// ---------------------------------------------------------------------
// 4. Страница «Основы»
// ---------------------------------------------------------------------
async function buildFoundations(page, family) {
  await figma.setCurrentPageAsync(page);
  const root = rootFrame(`${KIT} · Основы`, page);

  // Обложка
  const cover = AL('VERTICAL', 'Обложка'); cover.itemSpacing = 16;
  pad(cover, '2xl', '2xl'); fill(cover, 'color/action/primary'); rad(cover, 'xl');
  root.appendChild(cover); fixW(cover, 1400);
  cover.appendChild(await T('UI Kit · v2', 'overline', 'color/text/on-color', { opacity: 0.7 }));
  cover.appendChild(await T('Диво × Diasoft FA# Treasury.Back', 'display', 'color/text/on-color'));
  cover.appendChild(await T('Раздел ESM-платформы «Диво» для событий казначейского бэк-офиса: мониторинг событий, карточка события, дашборд «Диво Мера», виджет «Диво Портала».', 'body', 'color/text/on-color', { width: 820, opacity: 0.85 }));
  cover.appendChild(await T(`Шрифт: ${family}. Устройство кита — как у генератора «ФОЛК», визуальный язык — как у дашборда деградаций сервисов.`, 'small', 'color/text/on-color', { width: 820, opacity: 0.6 }));
  const scale = AL('HORIZONTAL', 'Шкала'); scale.itemSpacing = 8; cover.appendChild(scale);
  for (const [lvl, role] of [['Норма', 'ok'], ['WARNING', 'warning'], ['MAJOR', 'major'], ['CRITICAL', 'critical']]) {
    const c = AL('HORIZONTAL', lvl); center(c); pad(c, '2xs', 'sm'); rad(c, 'sm'); fill(c, `color/${role}/default`);
    c.appendChild(await T(lvl, 'smallBold', role === 'warning' ? 'color/text/primary' : 'color/text/on-color'));
    scale.appendChild(c);
  }

  // Цвета
  const colors = await section(root, 'Цвета', 'Интерфейс монохромный: чёрный текст, белые карточки, серые подложки. Цвет несёт только смысл — степень критичности и статус услуги. В макетах используйте токены «color/…» из коллекции «' + KIT + ' · Токены».', 'VERTICAL');
  colors.itemSpacing = 24;
  for (const p of PALETTE) {
    const row = AL('HORIZONTAL', p.ru); row.itemSpacing = 16; row.counterAxisAlignItems = 'CENTER';
    colors.appendChild(row);
    const lbl = AL('VERTICAL', 'Название'); lbl.itemSpacing = 2; row.appendChild(lbl);
    lbl.appendChild(await T(p.ru, 'h2', 'color/text/primary'));
    lbl.appendChild(await T(p.role, 'small', 'color/text/secondary', { width: 200 }));
    for (const [shade, h] of Object.entries(p.shades)) {
      const sw = AL('VERTICAL', `${p.key}/${shade}`); sw.itemSpacing = 6; row.appendChild(sw);
      const chip = figma.createFrame(); chip.name = 'Образец'; chip.resize(112, 64); chip.fills = [vpaint(`${p.key}/${shade}`)];
      chip.cornerRadius = 10; chip.strokes = [solid('#000000', 0.06)]; chip.strokeWeight = 1; chip.strokeAlign = 'INSIDE';
      sw.appendChild(chip);
      sw.appendChild(await T(`${p.key}/${shade}`, 'smallBold', 'color/text/primary'));
      sw.appendChild(await T(h.toUpperCase(), 'small', 'color/text/secondary'));
    }
  }

  // Семантика
  const sem = await section(root, 'Семантические токены', 'Роли шкалы: ok — норма, warning — WARNING, major — MAJOR, critical — CRITICAL, info — INFO и ссылки. У каждой роли четыре оттенка: default — точка и заливка, strong — текст на тоне, muted — ненулевая ячейка, subtle — тон.', 'VERTICAL');
  const semGrid = wrapRow('Токены', 1400, 12, 12); sem.appendChild(semGrid);
  for (const [name, ref] of SEMANTIC) {
    const r = AL('HORIZONTAL', name); r.itemSpacing = 12; r.counterAxisAlignItems = 'CENTER'; pad(r, 'xs', 'sm'); cardStyle(r, 'md');
    semGrid.appendChild(r);
    const dot = figma.createEllipse(); dot.resize(24, 24); dot.fills = [vpaint(name)]; dot.strokes = [solid('#000000', 0.08)]; dot.strokeWeight = 1; r.appendChild(dot);
    const tx = AL('VERTICAL', 'Текст'); r.appendChild(tx);
    tx.appendChild(await T(name, 'smallBold', 'color/text/primary'));
    tx.appendChild(await T('= ' + ref, 'small', 'color/text/secondary'));
    fixW(r, 335);
  }

  // Типографика
  const typo = await section(root, 'Типографика', `Геометрический гротеск (${family}), два начертания. Основные размеры — 24 · 15 · 12: заголовок страницы, текст и заголовки блоков, подписи. 13 — таблицы, 28 — числа KPI.`, 'VERTICAL');
  typo.itemSpacing = 18;
  for (const [k, [name, w, size, lh]] of Object.entries(TYPE)) {
    const r = AL('HORIZONTAL', name); r.itemSpacing = 32; r.counterAxisAlignItems = 'CENTER'; typo.appendChild(r);
    r.appendChild(await T(`${name} · ${size}/${lh} · ${w}`, 'small', 'color/text/secondary', { width: 260 }));
    r.appendChild(await T(k === 'kpi' ? '1 мин 12 с · 99,94 %' : k === 'overline' ? 'Казначейский блок' : 'Задержка закрытия операционного дня', k, 'color/text/primary'));
  }

  // Шкала критичности
  const sv = await section(root, 'Шкала критичности', 'Одна шкала на весь раздел — те же четыре цвета, что в отчётах о деградациях. Severity события считает адаптер по матрице «критичность услуги × отклонение».', 'VERTICAL');
  sv.itemSpacing = 10;
  const rules = [
    ['CRITICAL', 'critical', 'Недоступность, отказ внешней системы, > 200 % норматива или 30 мин и меньше до нарушения SLA', 'Инцидент сразу, P1/P2'],
    ['MAJOR', 'major', 'Превышение норматива 50–200 %, ошибки шлюза выше порога', 'Инцидент от 5 событий за 10 мин'],
    ['WARNING', 'warning', 'Превышение до 50 %, рост очереди', 'Оповещение и тренд, без инцидента'],
    ['INFO', 'info', 'Событие RESOLVED, служебные сообщения', 'Закрывает инцидент'],
  ];
  for (const [lvl, role, when, what] of rules) {
    const r = AL('HORIZONTAL', lvl); r.itemSpacing = 24; r.counterAxisAlignItems = 'CENTER'; pad(r, 'sm', 'md'); cardStyle(r, 'lg');
    sv.appendChild(r); fixW(r, 1400);
    const b = AL('HORIZONTAL', 'Бейдж'); center(b); pad(b, '2xs', 'xs'); rad(b, 'sm'); fill(b, `color/${role}/default`); fixBox(b, 96, 28);
    b.appendChild(await T(lvl, 'smallBold', role === 'warning' ? 'color/text/primary' : 'color/text/on-color'));
    r.appendChild(b);
    const t1 = await T(when, 'body', 'color/text/primary'); r.appendChild(t1); t1.layoutGrow = 1;
    r.appendChild(await T(what, 'bodyBold', `color/${role}/strong`, { width: 360 }));
  }

  // Отступы и радиусы
  const dims = await section(root, 'Отступы и скругления', 'Шаг 4 px. Карточки — 12, окна — 24, кнопки панели — 10, ячейки — 6.', 'HORIZONTAL');
  dims.itemSpacing = 80;
  const spc = AL('VERTICAL', 'Отступы'); spc.itemSpacing = 10; dims.appendChild(spc);
  for (const [k, v] of Object.entries(SPACING)) {
    const r = AL('HORIZONTAL', k); r.itemSpacing = 16; r.counterAxisAlignItems = 'CENTER'; spc.appendChild(r);
    r.appendChild(await T(`spacing/${k} · ${v}`, 'small', 'color/text/secondary', { width: 140 }));
    const bar = figma.createRectangle(); bar.name = 'Полоса'; bar.resize(v * 6, 14); bar.cornerRadius = 3; bar.fills = [vpaint('color/track')]; r.appendChild(bar);
  }
  const rds = AL('HORIZONTAL', 'Радиусы'); rds.itemSpacing = 24; dims.appendChild(rds);
  for (const [k, v] of Object.entries(RADIUS)) {
    const c = AL('VERTICAL', k); c.itemSpacing = 8; c.counterAxisAlignItems = 'CENTER'; rds.appendChild(c);
    const b = figma.createFrame(); b.name = 'Образец'; b.resize(72, 72); b.fills = [vpaint('color/bg/wash')]; b.strokes = [vpaint('color/line/control')]; b.strokeWeight = 1.5; b.strokeAlign = 'INSIDE';
    c.appendChild(b); rad(b, k);
    c.appendChild(await T(`${k} · ${v === 999 ? 'круг' : v}`, 'small', 'color/text/secondary'));
  }

  // Принципы
  const pr = await section(root, 'Принципы', null, 'VERTICAL');
  const prGrid = wrapRow('Карточки', 1400, 24, 24); pr.appendChild(prGrid);
  const principles = [
    ['Монохром и смысловой цвет', 'Интерфейс чёрно-белый. Цвет есть только у шкалы критичности и статусов — поэтому он сразу читается как сигнал.'],
    ['Таблетки', 'Кнопки панели — белые «таблетки» в тонкой рамке с мягкой тенью. Выбранное в переключателе приподнято над серой подложкой.'],
    ['Тон и цвет', 'Нулевая ячейка — бледный тон, ненулевая — насыщенный цвет и жирное число. Глаз сразу находит, где есть события.'],
    ['Число — главное', 'Крупное число и короткая подпись: «осталось 22 мин», «+173 %», «27 из 10 мин». Дежурному важнее запас времени, чем дедлайн.'],
    ['Тишина — не норма', 'Если heartbeat интеграции пропал, статус услуг — «Нет данных», а не «Норма». Статус интеграции всегда на виду.'],
    ['Красный дозирован', 'Красный — только CRITICAL и нарушенный SLA. Устранённое приглушено и закрыто по событию RESOLVED.'],
  ];
  for (const [h, d] of principles) {
    const c = AL('VERTICAL', h); c.itemSpacing = 8; pad(c, 'xl', 'xl'); cardStyle(c, 'lg');
    prGrid.appendChild(c);
    c.appendChild(await T(h, 'h2', 'color/text/primary'));
    c.appendChild(await T(d, 'body', 'color/text/secondary', { width: 400 }));
  }
  return root;
}

// ---------------------------------------------------------------------
// 5. Компоненты
// ---------------------------------------------------------------------
async function buildComponents(page) {
  await figma.setCurrentPageAsync(page);
  const root = rootFrame(`${KIT} · Компоненты`, page);
  const K = { icon: {} };

  // ---- Иконки
  {
    const body = await section(root, 'Иконки', 'Контурные, 20 × 20, линия 1.8. Подменяются через свойство «Иконка» у кнопок.');
    const grid = wrapRow('Иконки', 1400, 16, 16); body.appendChild(grid);
    for (const [name, svg] of Object.entries(ICONS)) {
      const c = COMP(`Иконка/${name}`); center(c); fixBox(c, 20, 20);
      const v = svgNode(svg, 'Вектор'); v.rescale(20 / 24); c.appendChild(v);
      const cell = AL('VERTICAL', name); cell.itemSpacing = 8; cell.counterAxisAlignItems = 'CENTER'; pad(cell, 'sm', 'sm'); cardStyle(cell, 'md'); fixW(cell, 120);
      grid.appendChild(cell); cell.appendChild(c);
      cell.appendChild(await T(name, 'small', 'color/text/secondary'));
      K.icon[name] = c;
    }
  }

  // ---- Кнопка
  {
    const body = await section(root, 'Кнопка', 'Основная — чёрная, одна на экран или окно. Контур — второстепенное действие в окне. Таблетка — кнопки панели фильтров. Призрачная — ссылка-действие.');
    const STY = [['Основная'], ['Контур'], ['Таблетка'], ['Призрачная']];
    const vs = [];
    for (const [s] of STY) for (const st of ['Обычное', 'Недоступно']) {
      const c = COMP(`Вид=${s}, Состояние=${st}`); center(c);
      body.appendChild(c);
      const dis = st === 'Недоступно';
      const tx = s === 'Основная' ? 'color/text/on-color' : s === 'Призрачная' ? 'color/info/default' : 'color/text/primary';
      c.appendChild(await T('Открыть инцидент', 'bodyBold', dis && s !== 'Основная' ? 'color/text/disabled' : tx, { name: 'Текст' }));
      if (s === 'Основная') { fill(c, dis ? 'color/track' : 'color/action/primary'); rad(c, 'full'); c.paddingLeft = 24; c.paddingRight = 24; fixBox(c, 220, 44); c.primaryAxisSizingMode = 'AUTO'; }
      else if (s === 'Контур') { fill(c, 'color/bg/card'); stroke(c, dis ? 'color/line/default' : 'color/line/control', 1); rad(c, 'full'); c.paddingLeft = 24; c.paddingRight = 24; fixBox(c, 220, 44); c.primaryAxisSizingMode = 'AUTO'; }
      else if (s === 'Таблетка') { fill(c, 'color/bg/card'); if (dis) stroke(c, 'color/line/default'); else raised(c); rad(c, 'md'); c.paddingLeft = 14; c.paddingRight = 14; fixBox(c, 160, 36); c.primaryAxisSizingMode = 'AUTO'; }
      else { c.paddingLeft = 4; c.paddingRight = 4; fixBox(c, 160, 36); c.primaryAxisSizingMode = 'AUTO'; }
      vs.push(c);
    }
    K.button = combine(vs, body, 'Кнопка', 2, 240, 'Кнопка. Свойства: Вид, Состояние, Текст.');
    K.buttonText = textProp(K.button, 'Текст', 'Открыть инцидент', 'Текст');
  }

  // ---- Кнопка с иконкой
  {
    const body = await section(root, 'Кнопка с иконкой', 'Таблетка с иконкой слева («Экспорт», выход) и квадратная — стрелки листания периода.');
    const vs = [];
    for (const s of ['Таблетка', 'Квадрат']) {
      const c = COMP(`Вид=${s}`); center(c); c.itemSpacing = 10; fill(c, 'color/bg/card'); raised(c); rad(c, 'md');
      body.appendChild(c);
      const i = inst(K.icon[s === 'Квадрат' ? 'Шеврон влево' : 'Экспорт']); i.name = 'Иконка'; c.appendChild(i);
      if (s === 'Таблетка') { c.appendChild(await T('Экспорт', 'bodyBold', 'color/text/primary', { name: 'Текст' })); c.paddingLeft = 12; c.paddingRight = 14; fixBox(c, 120, 36); c.primaryAxisSizingMode = 'AUTO'; }
      else fixBox(c, 36, 36);
      vs.push(c);
    }
    K.iconBtn = combine(vs, body, 'Кнопка с иконкой', 2, 140, 'Свойства: Вид, Иконка, Текст.');
    K.iconBtnIcon = swapProp(K.iconBtn, 'Иконка', K.icon['Экспорт'], 'Иконка');
    K.iconBtnText = textProp(K.iconBtn, 'Текст', 'Экспорт', 'Текст');
  }

  // ---- Переключатель
  {
    const body = await section(root, 'Переключатель', 'Серая подложка, выбранный пункт — белая приподнятая таблетка с жирным текстом. Период, навигация по разделам, тема.');
    const vs = [];
    for (const sel of [1, 2, 3]) {
      const c = COMP(`Выбрано=${sel}`); c.itemSpacing = 4; c.counterAxisAlignItems = 'CENTER'; pad(c, '2xs', '2xs'); fill(c, 'color/bg/wash'); rad(c, 'lg');
      body.appendChild(c);
      for (const i of [1, 2, 3]) {
        const it = AL('HORIZONTAL', `Пункт ${i}`); center(it); it.paddingLeft = 14; it.paddingRight = 14; fixBox(it, 80, 32); it.primaryAxisSizingMode = 'AUTO'; rad(it, 'md');
        c.appendChild(it);
        const on = i === sel;
        if (on) { fill(it, 'color/bg/card'); raised(it); }
        it.appendChild(await T(['Месяц', 'Год', 'Диапазон'][i - 1], on ? 'bodyBold' : 'body', on ? 'color/text/primary' : 'color/text/secondary', { name: `Текст ${i}` }));
      }
      vs.push(c);
    }
    K.segment = combine(vs, body, 'Переключатель', 3, 280, 'Свойства: Выбрано (1–3), Пункт 1–3.');
    K.segText = [1, 2, 3].map((i) => textProp(K.segment, `Пункт ${i}`, ['Месяц', 'Год', 'Диапазон'][i - 1], `Текст ${i}`));

    // Переключатель темы — иконки
    const tg = COMP('Тема'); tg.itemSpacing = 4; tg.counterAxisAlignItems = 'CENTER'; pad(tg, '2xs', '2xs'); fill(tg, 'color/bg/wash'); rad(tg, 'lg');
    body.appendChild(tg);
    for (const [name, on] of [['Солнце', true], ['Луна', false]]) {
      const it = AL('HORIZONTAL', name); center(it); fixBox(it, 32, 32); rad(it, 'md'); tg.appendChild(it);
      if (on) { fill(it, 'color/bg/card'); raised(it); }
      const i = inst(K.icon[name]); i.name = 'Иконка'; it.appendChild(i); i.opacity = on ? 1 : 0.55;
    }
    K.theme = tg;
  }

  // ---- Список
  {
    const body = await section(root, 'Список', 'Выпадающий список на панели фильтров: значение жирным и шеврон.');
    const c = COMP('Список'); c.itemSpacing = 10; c.counterAxisAlignItems = 'CENTER'; fill(c, 'color/bg/card'); raised(c); rad(c, 'md');
    c.paddingLeft = 14; c.paddingRight = 12; fixBox(c, 140, 36); c.primaryAxisSizingMode = 'AUTO';
    body.appendChild(c);
    c.appendChild(await T('Октябрь 2026', 'bodyBold', 'color/text/primary', { name: 'Значение' }));
    const i = inst(K.icon['Шеврон вниз']); i.name = 'Шеврон'; c.appendChild(i);
    K.select = c;
    K.selectText = textProp(c, 'Значение', 'Октябрь 2026', 'Значение');
  }

  // ---- Критичность
  {
    const body = await section(root, 'Критичность', 'Тон — в таблицах и карточках: бледный фон, точка и тёмный текст. Заливка — заголовки столбцов и обложки.');
    const vs = [];
    for (const v of ['Тон', 'Заливка']) for (const [lvl, role] of Object.entries(SEV)) {
      const c = COMP(`Вид=${v}, Уровень=${lvl}`); c.itemSpacing = 6; c.counterAxisAlignItems = 'CENTER'; c.paddingLeft = 8; c.paddingRight = 10; fixBox(c, 100, 24); c.primaryAxisSizingMode = 'AUTO'; rad(c, 'sm');
      body.appendChild(c);
      if (v === 'Тон') {
        fill(c, `color/${role}/subtle`);
        const d = figma.createEllipse(); d.name = 'Точка'; d.resize(6, 6); fill(d, `color/${role}/default`); c.appendChild(d);
        c.appendChild(await T(lvl, 'smallBold', `color/${role}/strong`, { name: 'Текст' }));
      } else {
        fill(c, `color/${role}/default`); c.paddingLeft = 10;
        c.appendChild(await T(lvl, 'smallBold', role === 'warning' ? 'color/text/primary' : 'color/text/on-color', { name: 'Текст' }));
      }
      vs.push(c);
    }
    K.sev = combine(vs, body, 'Критичность', 4, 110, 'Свойства: Вид, Уровень.');
  }

  // ---- Статус услуги и состояние события
  {
    const body = await section(root, 'Статус и состояние', 'Статус ИТ-услуги — точка и слово. Состояние события — «Активно» или «Устранено» со временем закрытия.');
    const vs = [];
    for (const [st, role] of Object.entries(STATUS)) {
      const c = COMP(`Статус=${st}`); c.itemSpacing = 6; c.counterAxisAlignItems = 'CENTER'; c.paddingLeft = 8; c.paddingRight = 10; fixBox(c, 100, 24); c.primaryAxisSizingMode = 'AUTO'; rad(c, 'full');
      body.appendChild(c);
      fill(c, role ? `color/${role}/subtle` : 'color/bg/wash');
      const d = figma.createEllipse(); d.name = 'Точка'; d.resize(8, 8); fill(d, role ? `color/${role}/default` : 'color/track'); c.appendChild(d);
      c.appendChild(await T(st, 'smallBold', role ? `color/${role}/strong` : 'color/text/secondary', { name: 'Текст' }));
      vs.push(c);
    }
    K.status = combine(vs, body, 'Статус услуги', 5, 130, 'Свойство: Статус.');

    const ss = [];
    for (const [st, role, txt] of [['Активно', 'critical', 'Активно'], ['Устранено', 'ok', 'Устранено 11:58']]) {
      const c = COMP(`Состояние=${st}`); c.itemSpacing = 6; c.counterAxisAlignItems = 'CENTER'; c.paddingLeft = 8; c.paddingRight = 10; fixBox(c, 100, 24); c.primaryAxisSizingMode = 'AUTO'; rad(c, 'full');
      body.appendChild(c);
      if (st === 'Активно') { stroke(c, `color/${role}/default`, 1); const d = figma.createEllipse(); d.name = 'Точка'; d.resize(6, 6); fill(d, `color/${role}/default`); c.appendChild(d); }
      else fill(c, `color/${role}/subtle`);
      c.appendChild(await T(txt, 'smallBold', `color/${role}/strong`, { name: 'Текст' }));
      ss.push(c);
    }
    K.state = combine(ss, body, 'Состояние события', 2, 150, 'Свойства: Состояние, Текст.');
    K.stateText = textProp(K.state, 'Текст', 'Активно', 'Текст');
  }

  // ---- Ячейки
  {
    const body = await section(root, 'Ячейки степени', 'Как в отчёте о деградациях: заголовок столбца — заливка, ноль — бледный тон, ненулевое значение — насыщенный цвет и жирное число.');
    const hs = [];
    for (const [lvl, role] of [['Норма', 'ok'], ['WARNING', 'warning'], ['MAJOR', 'major'], ['CRITICAL', 'critical']]) {
      const c = COMP(`Уровень=${lvl}`); center(c); fixBox(c, 96, 40); rad(c, 'sm'); fill(c, `color/${role}/default`);
      body.appendChild(c);
      c.appendChild(await T(lvl, 'cellBold', role === 'warning' ? 'color/text/primary' : 'color/text/on-color', { name: 'Текст' }));
      hs.push(c);
    }
    K.headCell = combine(hs, body, 'Заголовок степени', 4, 96, 'Свойства: Уровень, Текст.');
    K.headCellText = textProp(K.headCell, 'Текст', 'CRITICAL', 'Текст');

    const cs = [];
    for (const z of ['Тон', 'Цвет']) for (const [lvl, role] of [['Норма', 'ok'], ['WARNING', 'warning'], ['MAJOR', 'major'], ['CRITICAL', 'critical']]) {
      const c = COMP(`Заливка=${z}, Уровень=${lvl}`); center(c); fixBox(c, 96, 40); rad(c, 'sm');
      body.appendChild(c);
      fill(c, z === 'Тон' ? `color/${role}/subtle` : `color/${role}/muted`);
      c.appendChild(await T(z === 'Тон' ? '0' : '3', z === 'Тон' ? 'cell' : 'cellBold', z === 'Тон' ? 'color/text/secondary' : 'color/text/primary', { name: 'Значение' }));
      cs.push(c);
    }
    K.cell = combine(cs, body, 'Ячейка степени', 4, 96, 'Свойства: Заливка, Уровень, Значение.');
    K.cellText = textProp(K.cell, 'Значение', '0', 'Значение');
  }

  // ---- Карточка KPI
  {
    const body = await section(root, 'Карточка KPI', 'Крупное число и короткая подпись. Акцент «Критично» — когда показатель требует действия прямо сейчас.');
    const vs = [];
    for (const [a, col] of [['Нет', 'color/text/primary'], ['Критично', 'color/critical/default'], ['Норма', 'color/ok/strong']]) {
      const c = COMP(`Акцент=${a}`, 'VERTICAL'); c.itemSpacing = 6; pad(c, 'lg', 'lg'); cardStyle(c, 'lg'); fixW(c, 260);
      body.appendChild(c);
      c.appendChild(await T('Время обнаружения', 'body', 'color/text/secondary', { name: 'Название' }));
      c.appendChild(await T('1 мин 12 с', 'kpi', col, { name: 'Значение' }));
      c.appendChild(await T('медиана · цель до 2 мин', 'small', a === 'Критично' ? 'color/critical/strong' : 'color/text/secondary', { name: 'Подпись' }));
      vs.push(c);
    }
    K.kpi = combine(vs, body, 'Карточка KPI', 3, 260, 'Свойства: Акцент, Название, Значение, Подпись. Растягивайте по ширине (Fill).');
    K.kpiTitle = textProp(K.kpi, 'Название', 'Время обнаружения', 'Название');
    K.kpiValue = textProp(K.kpi, 'Значение', '1 мин 12 с', 'Значение');
    K.kpiSub = textProp(K.kpi, 'Подпись', 'медиана · цель до 2 мин', 'Подпись');
  }

  // ---- Статус интеграции
  {
    const body = await section(root, 'Статус интеграции', 'Всегда на виду на экране мониторинга: тишина в списке событий — это норма, только если интеграция жива.');
    const vs = [];
    for (const [st, role, title, sub] of [['Работает', 'ok', 'Интеграция работает', 'heartbeat 12 с назад · очередь 0 · DLQ 0'], ['Задержка', 'warning', 'Доставка с задержкой', 'в очереди 148 · повтор через 20 с'], ['Нет связи', 'critical', 'Нет данных от адаптера', 'heartbeat не приходит 3 мин']]) {
      const c = COMP(`Состояние=${st}`); c.itemSpacing = 10; c.counterAxisAlignItems = 'CENTER'; c.paddingLeft = 12; c.paddingRight = 14; fixBox(c, 300, 44); c.primaryAxisSizingMode = 'AUTO';
      fill(c, 'color/bg/card'); raised(c); rad(c, 'md');
      body.appendChild(c);
      const d = figma.createEllipse(); d.name = 'Точка'; d.resize(10, 10); fill(d, `color/${role}/default`); c.appendChild(d);
      const tx = AL('VERTICAL', 'Текст'); c.appendChild(tx);
      tx.appendChild(await T(title, 'smallBold', 'color/text/primary', { name: 'Заголовок' }));
      tx.appendChild(await T(sub, 'small', 'color/text/secondary', { name: 'Подробности' }));
      vs.push(c);
    }
    K.integration = combine(vs, body, 'Статус интеграции', 3, 300, 'Свойства: Состояние, Подробности.');
  }

  // ---- Строка легенды
  {
    const body = await section(root, 'Строка легенды', 'Легенда кольцевой диаграммы: точка, название, число и доля.');
    const vs = [];
    for (const [lvl, role] of [['CRITICAL', 'critical'], ['MAJOR', 'major'], ['WARNING', 'warning'], ['Норма', 'ok']]) {
      const c = COMP(`Уровень=${lvl}`); c.itemSpacing = 8; c.counterAxisAlignItems = 'CENTER'; fixW(c, 200);
      body.appendChild(c);
      const d = figma.createEllipse(); d.name = 'Точка'; d.resize(10, 10); fill(d, `color/${role}/default`); c.appendChild(d);
      const n = await T(lvl, 'cell', 'color/text/primary', { name: 'Название' }); c.appendChild(n); n.layoutGrow = 1;
      c.appendChild(await T('9', 'cellBold', 'color/text/primary', { name: 'Число', width: 28, align: 'RIGHT' }));
      c.appendChild(await T('8 %', 'cell', 'color/text/secondary', { name: 'Доля', width: 38, align: 'RIGHT' }));
      vs.push(c);
    }
    K.legend = combine(vs, body, 'Строка легенды', 4, 200, 'Свойства: Уровень, Название, Число, Доля.');
    K.legendName = textProp(K.legend, 'Название', 'CRITICAL', 'Название');
    K.legendNum = textProp(K.legend, 'Число', '9', 'Число');
    K.legendPct = textProp(K.legend, 'Доля', '8 %', 'Доля');
  }

  // ---- Пункт хронологии
  {
    const body = await section(root, 'Пункт хронологии', 'Время, источник и что произошло. Цвет точки — уровень на этот момент.');
    const vs = [];
    for (const [m, role] of [['Источник', null], ['WARNING', 'warning'], ['MAJOR', 'major'], ['CRITICAL', 'critical'], ['Диво', 'info']]) {
      const c = COMP(`Метка=${m}`); c.itemSpacing = 12; c.counterAxisAlignItems = 'CENTER'; fixW(c, 560);
      body.appendChild(c);
      c.appendChild(await T('19:30:00', 'cellBold', 'color/text/primary', { name: 'Время', width: 68 }));
      const d = figma.createEllipse(); d.name = 'Точка'; d.resize(10, 10); fill(d, role ? `color/${role}/default` : 'color/track'); c.appendChild(d);
      const src = AL('HORIZONTAL', 'Источник'); center(src); src.paddingLeft = 8; src.paddingRight = 8; fixBox(src, 72, 22); rad(src, 'sm'); fill(src, 'color/bg/wash'); c.appendChild(src);
      src.appendChild(await T('Адаптер', 'smallBold', 'color/text/secondary', { name: 'Источник текст' }));
      const t = await T('До дедлайна SLA 30 мин — CRITICAL (seq 3)', 'cell', 'color/text/primary', { name: 'Описание' }); c.appendChild(t); wrap(t);
      vs.push(c);
    }
    K.tl = combine(vs, body, 'Пункт хронологии', 1, 560, 'Свойства: Метка, Время, Источник, Описание.');
    K.tlTime = textProp(K.tl, 'Время', '19:30:00', 'Время');
    K.tlSrc = textProp(K.tl, 'Источник', 'Адаптер', 'Источник текст');
    K.tlText = textProp(K.tl, 'Описание', 'До дедлайна SLA 30 мин — CRITICAL (seq 3)', 'Описание');
  }

  // ---- Строка события
  {
    const body = await section(root, 'Строка события', 'Строка таблицы мониторинга: белый фон и тонкая линия снизу, шесть колонок. Критичность и состояние — вложенные экземпляры (меняются в панели свойств).', 'VERTICAL');
    const panel = AL('VERTICAL', 'Пример таблицы'); pad(panel, 'lg', 'lg'); cardStyle(panel, 'lg'); body.appendChild(panel);
    const COLS = [['Критичность', 132], ['Событие', null], ['ИТ-услуга', 200], ['Отклонение', 150], ['SLA', 170], ['Состояние', 160]];

    const h = COMP('Заголовок таблицы'); h.counterAxisAlignItems = 'CENTER'; fixW(h, 1328); h.paddingLeft = 16; h.paddingRight = 16; fixBox(h, 1328, 40); rad(h, 'md'); fill(h, 'color/bg/wash');
    panel.appendChild(h);
    for (const [name, w] of COLS) {
      const t = await T(name, 'smallBold', 'color/text/secondary'); h.appendChild(t);
      if (w) { t.resize(w, t.height); t.textAutoResize = 'HEIGHT'; } else t.layoutGrow = 1;
    }
    K.head = h;

    const c = COMP('Строка события'); c.counterAxisAlignItems = 'CENTER'; c.paddingLeft = 16; c.paddingRight = 16; c.paddingTop = 14; c.paddingBottom = 14;
    fixW(c, 1328); c.strokes = [vpaint('color/line/default')]; c.strokeAlign = 'INSIDE'; c.strokeTopWeight = 0; c.strokeLeftWeight = 0; c.strokeRightWeight = 0; c.strokeBottomWeight = 1;
    panel.appendChild(c);
    const col = (name, w) => {
      const f = AL('VERTICAL', name); f.itemSpacing = 2; c.appendChild(f);
      if (w) fixW(f, w); else f.layoutGrow = 1;
      return f;
    };
    const sevCol = col('Критичность', 132);
    const sb = inst(K.sev, { 'Вид': 'Тон', 'Уровень': 'CRITICAL' }); sb.name = 'Критичность'; sevCol.appendChild(sb);
    const ev = col('Событие', null);
    wrap(append(ev, await T('Задержка закрытия операционного дня', 'bodyBold', 'color/text/primary', { name: 'Событие' })));
    wrap(append(ev, await T('19:30 · EOD_CLOSE_DELAYED', 'small', 'color/text/secondary', { name: 'Код' })));
    const sv = col('ИТ-услуга', 200);
    sv.appendChild(await T('Закрытие опердня', 'cell', 'color/text/primary', { name: 'Услуга' }));
    const dv = col('Отклонение', 150);
    dv.appendChild(await T('+173 %', 'bodyBold', 'color/critical/strong', { name: 'Отклонение' }));
    dv.appendChild(await T('27 из 10 мин', 'small', 'color/text/secondary', { name: 'Норматив' }));
    const sl = col('SLA', 170);
    sl.appendChild(await T('осталось 22 мин', 'cellBold', 'color/critical/strong', { name: 'SLA' }));
    const stc = col('Состояние', 160);
    const sti = inst(K.state, { 'Состояние': 'Активно' }); sti.name = 'Состояние'; stc.appendChild(sti);
    sb.isExposedInstance = true; sti.isExposedInstance = true;
    c.description = 'Строка таблицы событий. Ширина — Fill по таблице.';
    K.row = c;
    K.rowProps = {};
    for (const [p, def] of [['Событие', 'Задержка закрытия операционного дня'], ['Код', '19:30 · EOD_CLOSE_DELAYED'], ['Услуга', 'Закрытие опердня'], ['Отклонение', '+173 %'], ['Норматив', '27 из 10 мин'], ['SLA', 'осталось 22 мин']]) {
      K.rowProps[p] = textProp(c, p, def, p);
    }
  }

  // ---- Шапка
  {
    const body = await section(root, 'Шапка', 'Логотип и модуль «Диво», разделы, тема и пользователь. Вариант «Модуль» переключает подпись и выбранный раздел.');
    const vs = [];
    for (const [mod, sel] of [['Сервис', 1], ['Мера', 3]]) {
      const c = COMP(`Модуль=${mod}`); c.primaryAxisAlignItems = 'SPACE_BETWEEN'; c.counterAxisAlignItems = 'CENTER'; fixW(c, 1392);
      body.appendChild(c);
      const left = AL('HORIZONTAL', 'Слева'); left.itemSpacing = 24; left.counterAxisAlignItems = 'CENTER'; c.appendChild(left);
      const logo = AL('HORIZONTAL', 'Логотип'); logo.itemSpacing = 10; logo.counterAxisAlignItems = 'CENTER'; left.appendChild(logo);
      const mark = AL('HORIZONTAL', 'Знак'); center(mark); fixBox(mark, 32, 32); rad(mark, 'md'); fill(mark, 'color/action/primary'); logo.appendChild(mark);
      mark.appendChild(await T('Д', 'bodyBold', 'color/text/on-color'));
      const lt = AL('VERTICAL', 'Название'); logo.appendChild(lt);
      lt.appendChild(await T('Диво', 'bodyBold', 'color/text/primary'));
      lt.appendChild(await T(mod, 'small', 'color/text/secondary', { name: 'Модуль' }));
      const nav = inst(K.segment, { 'Выбрано': String(sel) }); nav.name = 'Разделы';
      nav.setProperties({ [K.segText[0]]: 'Мониторинг событий', [K.segText[1]]: 'Инциденты', [K.segText[2]]: 'Дашборды' });
      left.appendChild(nav);
      const right = AL('HORIZONTAL', 'Справа'); right.itemSpacing = 12; right.counterAxisAlignItems = 'CENTER'; c.appendChild(right);
      right.appendChild(inst(K.theme));
      const bell = inst(K.iconBtn, { 'Вид': 'Квадрат' }); bell.setProperties({ [K.iconBtnIcon]: K.icon['Колокол'].id }); bell.name = 'Уведомления'; right.appendChild(bell);
      const user = inst(K.iconBtn, { 'Вид': 'Таблетка' }); user.setProperties({ [K.iconBtnIcon]: K.icon['Выход'].id, [K.iconBtnText]: 'А. Смирнова' }); user.name = 'Пользователь'; right.appendChild(user);
      vs.push(c);
    }
    K.header = combine(vs, body, 'Шапка', 1, 1392, 'Свойство: Модуль.');
  }

  return { root, K };
}

// ---------------------------------------------------------------------
// 6. Экраны
// ---------------------------------------------------------------------
const SW = 1440;
function screen(parent, name) {
  const s = AL('VERTICAL', name);
  fixW(s, SW); s.itemSpacing = 16; pad(s, 'xl', '2xl');
  s.clipsContent = true; fill(s, 'color/bg/page');
  parent.appendChild(s);
  STATS.screens++;
  return s;
}
function header(K, s, mod) { const h = inst(K.header, { 'Модуль': mod }); append(s, h, { fillW: true }); return h; }
function btn(K, text, vid = 'Таблетка') { const b = inst(K.button, { 'Вид': vid, 'Состояние': 'Обычное' }); b.setProperties({ [K.buttonText]: text }); return b; }
function iconBtn(K, icon, text) {
  const b = inst(K.iconBtn, { 'Вид': text ? 'Таблетка' : 'Квадрат' });
  const p = { [K.iconBtnIcon]: K.icon[icon].id }; if (text) p[K.iconBtnText] = text;
  b.setProperties(p); return b;
}
function seg(K, items, sel) {
  const s = inst(K.segment, { 'Выбрано': String(sel) });
  s.setProperties({ [K.segText[0]]: items[0], [K.segText[1]]: items[1], [K.segText[2]]: items[2] });
  return s;
}
function select(K, value) { const s = inst(K.select); s.setProperties({ [K.selectText]: value }); return s; }
function vline(parent) { const l = figma.createRectangle(); l.name = 'Разделитель'; l.resize(1, 28); fill(l, 'color/line/default'); parent.appendChild(l); return l; }
async function label(text) { return T(text, 'body', 'color/text/secondary'); }
function card(parent, name, dir = 'VERTICAL', padded = true) { const c = AL(dir, name); c.itemSpacing = padded ? 16 : 0; if (padded) pad(c, 'lg', 'lg'); cardStyle(c, 'lg'); c.clipsContent = true; append(parent, c, { fillW: true }); return c; }
function kpi(K, accent, t, v, sub) { const k = inst(K.kpi, { 'Акцент': accent }); k.setProperties({ [K.kpiTitle]: t, [K.kpiValue]: v, [K.kpiSub]: sub }); return k; }

// Кольцевая диаграмма из дуг (ellipse.arcData)
async function donut(parent, parts, total, caption, D = 180) {
  const f = figma.createFrame(); f.name = 'Кольцо'; f.resize(D, D); f.fills = []; f.clipsContent = false;
  parent.appendChild(f);
  const sum = parts.reduce((a, p) => a + p[0], 0) || 1;
  let a = -Math.PI / 2;
  const gapA = parts.filter((p) => p[0] > 0).length > 1 ? 0.035 : 0;
  for (const [v, role] of parts) {
    if (!v) continue;
    const span = (v / sum) * Math.PI * 2;
    const e = figma.createEllipse(); e.name = 'Сегмент'; e.resize(D, D); fill(e, `color/${role}/default`);
    e.arcData = { startingAngle: a + gapA / 2, endingAngle: a + span - gapA / 2, innerRadius: 0.72 };
    f.appendChild(e); e.x = 0; e.y = 0;
    a += span;
  }
  const mid = AL('VERTICAL', 'Центр'); mid.counterAxisAlignItems = 'CENTER'; fixBox(mid, D, D); mid.primaryAxisAlignItems = 'CENTER';
  f.appendChild(mid); mid.x = 0; mid.y = 0;
  mid.appendChild(await T(total, 'h1', 'color/text/primary', { align: 'CENTER' }));
  mid.appendChild(await T(caption, 'small', 'color/text/secondary', { align: 'CENTER' }));
  return f;
}

// Полоса по услуге: название, сегменты по уровням, число
async function serviceBar(parent, name, parts, scale) {
  const r = AL('VERTICAL', name); r.itemSpacing = 6; append(parent, r, { fillW: true });
  wrap(append(r, await T(name, 'cell', 'color/text/primary')));
  const line = AL('HORIZONTAL', 'Полоса'); line.itemSpacing = 2; line.counterAxisAlignItems = 'CENTER'; r.appendChild(line);
  let total = 0;
  for (const [v, role] of parts) {
    if (!v) continue;
    total += v;
    const b = figma.createRectangle(); b.name = role; b.resize(Math.max(6, v * scale), 10); b.cornerRadius = 2; fill(b, `color/${role}/default`); line.appendChild(b);
  }
  const n = await T(String(total), 'small', 'color/text/secondary'); line.appendChild(n);
  line.itemSpacing = 2;
  return r;
}

async function monitoringScreen(root, K) {
  const s = screen(root, '01 · Мониторинг событий');
  s.itemSpacing = 24;
  header(K, s, 'Сервис');

  // Заголовок страницы + статус интеграции
  const top = AL('HORIZONTAL', 'Заголовок'); top.counterAxisAlignItems = 'CENTER'; top.itemSpacing = 16; append(s, top, { fillW: true });
  const tt = AL('VERTICAL', 'Текст'); tt.itemSpacing = 4; top.appendChild(tt);
  tt.appendChild(await T('Мониторинг событий', 'h1', 'color/text/primary'));
  tt.appendChild(await T('Казначейство · Diasoft FA# Treasury.Back', 'body', 'color/text/secondary'));
  spacer(top);
  top.appendChild(inst(K.integration, { 'Состояние': 'Работает' }));

  // KPI
  const kr = AL('HORIZONTAL', 'Показатели'); kr.itemSpacing = 16; append(s, kr, { fillW: true });
  for (const [acc, t, v, sub] of [
    ['Нет', 'Активные события', '5', '1 CRITICAL · 2 MAJOR · 2 WARNING'],
    ['Критично', 'SLA под угрозой', '1', 'закрытие дня: 22 мин до дедлайна'],
    ['Нет', 'Открытые инциденты', '3', 'все созданы автоматически'],
    ['Норма', 'Время обнаружения', '1 мин 12 с', 'медиана за сегодня'],
  ]) append(kr, kpi(K, acc, t, v, sub), { grow: true });

  // Таблица
  const tb = card(s, 'События'); tb.itemSpacing = 12;
  const th = AL('HORIZONTAL', 'Панель'); th.counterAxisAlignItems = 'CENTER'; th.itemSpacing = 12; append(tb, th, { fillW: true });
  th.appendChild(seg(K, ['Активные 5', 'Устранённые 3', 'Все 8'], 1));
  spacer(th);
  th.appendChild(select(K, 'Все услуги'));
  th.appendChild(select(K, 'За 24 часа'));
  const tbl = AL('VERTICAL', 'Таблица'); append(tb, tbl, { fillW: true });
  append(tbl, inst(K.head), { fillW: true });
  const rows = EVENTS.filter((e) => e.active).concat(EVENTS.filter((e) => !e.active).slice(0, 1));
  for (const e of rows) {
    const r = inst(K.row); append(tbl, r, { fillW: true }); r.name = `${e.time} · ${e.code}`;
    const P = K.rowProps;
    r.setProperties({ [P['Событие']]: e.title, [P['Код']]: `${e.time} · ${e.code}`, [P['Услуга']]: e.svc, [P['Отклонение']]: e.dev, [P['Норматив']]: e.devSub, [P['SLA']]: e.sla });
    const sb = nested(r, 'Критичность'); if (sb) sb.setProperties({ 'Уровень': e.sev });
    const st = nested(r, 'Состояние');
    if (st) { st.setProperties({ 'Состояние': e.active ? 'Активно' : 'Устранено' }); if (!e.active) st.setProperties({ [K.stateText]: 'Устранено ' + e.resolved }); }
    const dvT = textIn(r, 'Отклонение'); if (dvT) fill(dvT, e.active ? `color/${SEV[e.sev]}/strong` : 'color/text/secondary');
    const slT = textIn(r, 'SLA'); if (slT) fill(slT, e.slaRole === 'critical' ? 'color/critical/strong' : e.slaRole === 'ok' ? 'color/ok/strong' : 'color/text/primary');
    if (!e.active) { const evT = textIn(r, 'Событие'); if (evT) fill(evT, 'color/text/secondary'); if (sb) sb.opacity = 0.55; }
  }
  const ft = AL('HORIZONTAL', 'Подвал'); ft.counterAxisAlignItems = 'CENTER'; append(tb, ft, { fillW: true });
  ft.appendChild(await T('Похожие события сгруппированы. Устранённые закрываются сами по событию RESOLVED.', 'small', 'color/text/secondary'));
  spacer(ft);
  ft.appendChild(btn(K, 'Показать все 37', 'Призрачная'));
  return s;
}

async function eventCardScreen(root, K) {
  const s = screen(root, '02 · Карточка события');
  s.itemSpacing = 24;
  header(K, s, 'Сервис');

  // Заголовок
  const back = AL('HORIZONTAL', 'Назад'); back.itemSpacing = 6; back.counterAxisAlignItems = 'CENTER'; s.appendChild(back);
  const bi = inst(K.icon['Шеврон влево']); bi.name = 'Иконка'; back.appendChild(bi);
  back.appendChild(await T('Мониторинг событий', 'body', 'color/text/secondary'));
  const top = AL('HORIZONTAL', 'Заголовок'); top.counterAxisAlignItems = 'MAX'; top.itemSpacing = 24; append(s, top, { fillW: true });
  const tt = AL('VERTICAL', 'Текст'); tt.itemSpacing = 10; append(top, tt, { grow: true });
  const tags = AL('HORIZONTAL', 'Метки'); tags.itemSpacing = 8; tags.counterAxisAlignItems = 'CENTER'; tt.appendChild(tags);
  tags.appendChild(inst(K.sev, { 'Вид': 'Тон', 'Уровень': 'CRITICAL' }));
  tags.appendChild(inst(K.state, { 'Состояние': 'Активно' }));
  wrap(append(tt, await T('Закрытие операционного дня задерживается', 'h1', 'color/text/primary')));
  wrap(append(tt, await T('Шаг «Переоценка позиций» идёт 27 мин при нормативе 10 мин', 'body', 'color/text/secondary')));
  const acts = AL('HORIZONTAL', 'Действия'); acts.itemSpacing = 12; acts.counterAxisAlignItems = 'CENTER'; top.appendChild(acts);
  acts.appendChild(iconBtn(K, 'Ссылка', 'Инструкция'));
  acts.appendChild(btn(K, 'Открыть инцидент', 'Основная'));

  // Две колонки
  const cols = AL('HORIZONTAL', 'Колонки'); cols.itemSpacing = 24; append(s, cols, { fillW: true });
  const left = AL('VERTICAL', 'Слева'); left.itemSpacing = 24; append(cols, left, { grow: true });

  // Запас до дедлайна
  const dv = AL('VERTICAL', 'До дедлайна'); dv.itemSpacing = 20; pad(dv, 'xl', 'xl'); cardStyle(dv, 'lg'); append(left, dv, { fillW: true });
  const nums = AL('HORIZONTAL', 'Числа'); nums.itemSpacing = 48; append(dv, nums, { fillW: true });
  for (const [t, v, col] of [['До нарушения SLA', '22 мин', 'color/critical/default'], ['Идёт', '27 мин', 'color/text/primary'], ['Норматив', '10 мин', 'color/text/primary']]) {
    const c = AL('VERTICAL', t); c.itemSpacing = 2; nums.appendChild(c);
    c.appendChild(await T(t, 'small', 'color/text/secondary'));
    c.appendChild(await T(v, 'kpi', col));
  }
  const W = SW - 64 * 2 - 400 - 24 - 32 * 2, span = 50;
  const scale = figma.createFrame(); scale.name = 'Шкала'; scale.resize(W, 52); scale.fills = []; scale.clipsContent = false; dv.appendChild(scale);
  const zones = [[0, 10, 'ok'], [10, 20, 'major'], [20, 50, 'critical']];
  zones.forEach(([a, b, role], i) => {
    const z = figma.createRectangle(); z.name = role; z.resize((b - a) / span * W - 3, 12); fill(z, `color/${role}/muted`); z.cornerRadius = 6;
    scale.appendChild(z); z.x = a / span * W + (i ? 3 : 0); z.y = 6;
  });
  const now = 27 / span * W;
  const knob = figma.createEllipse(); knob.name = 'Сейчас'; knob.resize(20, 20); fill(knob, 'color/bg/card'); knob.strokes = [vpaint('color/text/primary')]; knob.strokeWeight = 4; scale.appendChild(knob); knob.x = now - 10; knob.y = 2;
  for (const [m, t, col] of [[0, '19:10 старт', 'color/text/secondary'], [10, '19:20 норматив', 'color/text/secondary'], [27, 'сейчас', 'color/text/primary'], [50, '20:00 дедлайн', 'color/critical/strong']]) {
    const l = await T(t, m === 27 ? 'smallBold' : 'small', col); scale.appendChild(l);
    l.x = m === 0 ? 0 : m === 50 ? W - l.width : m / span * W - l.width / 2; l.y = 32;
  }

  // Хронология
  const tl = AL('VERTICAL', 'Хронология'); tl.itemSpacing = 16; pad(tl, 'xl', 'xl'); cardStyle(tl, 'lg'); append(left, tl, { fillW: true });
  tl.appendChild(await T('Что произошло', 'h2', 'color/text/primary'));
  for (const [m, t, src, text] of [
    ['Источник', '19:10', 'Diasoft', 'Начался шаг «Переоценка позиций»'],
    ['WARNING', '19:20', 'Адаптер', 'Норматив превышен — WARNING'],
    ['CRITICAL', '19:30', 'Адаптер', 'До дедлайна 30 мин — CRITICAL'],
    ['Диво', '19:30', '«Диво»', 'Создан инцидент INC-18501, дежурный уведомлён'],
  ]) {
    const it = inst(K.tl, { 'Метка': m }); it.setProperties({ [K.tlTime]: t, [K.tlSrc]: src, [K.tlText]: text }); append(tl, it, { fillW: true });
  }

  // Справа — сведения
  const info = AL('VERTICAL', 'Сведения'); info.itemSpacing = 20; pad(info, 'xl', 'xl'); cardStyle(info, 'lg'); cols.appendChild(info); fixW(info, 400);
  info.appendChild(await T('Инцидент', 'h2', 'color/text/primary'));
  for (const [k, v, col] of [['Номер', 'INC-18501 · P2 · в работе', 'color/info/default'], ['Группа', 'Сопровождение Diasoft Treasury', null], ['Создан', 'автоматически за 2 секунды', null]]) {
    const r = AL('VERTICAL', k); r.itemSpacing = 2; append(info, r, { fillW: true });
    r.appendChild(await T(k, 'small', 'color/text/secondary'));
    wrap(append(r, await T(v, 'bodyBold', col || 'color/text/primary')));
  }
  const line = figma.createRectangle(); line.name = 'Линия'; line.resize(100, 1); fill(line, 'color/line/default'); append(info, line, { fillW: true });
  info.appendChild(await T('ИТ-услуга', 'h2', 'color/text/primary'));
  for (const [k, v] of [['Услуга', 'Закрытие операционного дня'], ['КЕ', 'CI-TB-EOD-01'], ['SLA', 'до 20:00 ежедневно']]) {
    const r = AL('VERTICAL', k); r.itemSpacing = 2; append(info, r, { fillW: true });
    r.appendChild(await T(k, 'small', 'color/text/secondary'));
    wrap(append(r, await T(v, 'bodyBold', 'color/text/primary')));
  }
  return s;
}

async function dashboardScreen(root, K) {
  const s = screen(root, '03 · Дашборд «Диво Мера»');
  s.itemSpacing = 24;
  header(K, s, 'Мера');
  const top = AL('HORIZONTAL', 'Заголовок'); top.counterAxisAlignItems = 'CENTER'; top.itemSpacing = 12; append(s, top, { fillW: true });
  const tt = AL('VERTICAL', 'Текст'); tt.itemSpacing = 4; top.appendChild(tt);
  tt.appendChild(await T('Казначейские ИТ-услуги', 'h1', 'color/text/primary'));
  tt.appendChild(await T('Октябрь 2026 · данные из Diasoft FA# Treasury.Back', 'body', 'color/text/secondary'));
  spacer(top);
  top.appendChild(seg(K, ['Месяц', 'Квартал', 'Год'], 1));
  top.appendChild(iconBtn(K, 'Экспорт', 'Экспорт'));

  const kr = AL('HORIZONTAL', 'KPI'); kr.itemSpacing = 16; append(s, kr, { fillW: true });
  for (const [acc, t, v, sub] of [['Норма', 'Доступность', '99,94 %', 'цель 99,90 %'], ['Нет', 'Инциденты', '14', '13 созданы автоматически'], ['Нет', 'Время обнаружения', '1 мин 12 с', 'медиана, цель до 2 мин'], ['Нет', 'Время восстановления', '41 мин', 'медиана, цель до 60 мин']]) {
    append(kr, kpi(K, acc, t, v, sub), { grow: true });
  }

  const row = AL('HORIZONTAL', 'Блоки'); row.itemSpacing = 24; append(s, row, { fillW: true });
  // Состояние услуг
  const tb = AL('VERTICAL', 'Услуги'); tb.itemSpacing = 0; pad(tb, 'xl', 'xl'); cardStyle(tb, 'lg'); append(row, tb, { grow: true });
  tb.appendChild(await T('Состояние услуг', 'h2', 'color/text/primary'));
  const sp = figma.createFrame(); sp.name = 'Отступ'; sp.resize(1, 16); sp.fills = []; tb.appendChild(sp);
  const COLS = [['Услуга', null], ['Сейчас', 170], ['Доступность', 120], ['30 дней', 220]];
  const hr = AL('HORIZONTAL', 'Заголовок'); hr.counterAxisAlignItems = 'CENTER'; hr.paddingLeft = 12; hr.paddingRight = 12; rad(hr, 'md'); fill(hr, 'color/bg/wash'); append(tb, hr, { fillW: true }); hr.resize(100, 36); hr.counterAxisSizingMode = 'FIXED';
  for (const [name, w] of COLS) { const t = await T(name, 'smallBold', 'color/text/secondary'); hr.appendChild(t); if (w) { t.resize(w, t.height); t.textAutoResize = 'HEIGHT'; } else t.layoutGrow = 1; }
  for (const sv of SERVICES) {
    const r = AL('HORIZONTAL', sv.short); r.counterAxisAlignItems = 'CENTER'; r.paddingLeft = 12; r.paddingRight = 12; r.paddingTop = 14; r.paddingBottom = 14;
    r.strokes = [vpaint('color/line/default')]; r.strokeAlign = 'INSIDE'; r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 1;
    append(tb, r, { fillW: true });
    const n = await T(sv.name, 'cell', 'color/text/primary'); r.appendChild(n); n.layoutGrow = 1;
    const stw = AL('HORIZONTAL', 'Статус'); fixW(stw, 170); r.appendChild(stw); stw.appendChild(inst(K.status, { 'Статус': sv.st }));
    const warn = sv.av === '99,90 %';
    const av = await T(sv.av, 'cellBold', warn ? 'color/major/strong' : 'color/text/primary'); r.appendChild(av); av.resize(120, av.height); av.textAutoResize = 'HEIGHT';
    const strip = AL('HORIZONTAL', '30 дней'); strip.itemSpacing = 3; strip.counterAxisAlignItems = 'CENTER'; r.appendChild(strip); fixW(strip, 220);
    for (let i = 0; i < 30; i++) {
      const ch = sv.days.charAt(i);
      const role = ch === '1' ? 'warning' : ch === '2' ? 'major' : ch === '3' ? 'critical' : null;
      const b = figma.createRectangle(); b.name = `День ${i + 1}`; b.resize(4, 20); b.cornerRadius = 2; fill(b, role ? `color/${role}/default` : 'color/ok/muted'); strip.appendChild(b);
    }
  }
  // События за месяц
  const ev = AL('VERTICAL', 'События'); ev.itemSpacing = 20; pad(ev, 'xl', 'xl'); cardStyle(ev, 'lg'); row.appendChild(ev); fixW(ev, 380);
  ev.layoutSizingVertical = 'FILL';
  ev.appendChild(await T('События за месяц', 'h2', 'color/text/primary'));
  const dwrap = AL('HORIZONTAL', 'Кольцо'); dwrap.primaryAxisAlignItems = 'CENTER'; append(ev, dwrap, { fillW: true });
  await donut(dwrap, [[9, 'critical'], [34, 'major'], [77, 'warning']], '120', 'событий', 168);
  const lg = AL('VERTICAL', 'Легенда'); lg.itemSpacing = 12; append(ev, lg, { fillW: true });
  for (const [lvl, n, p] of [['CRITICAL', '9', '8 %'], ['MAJOR', '34', '28 %'], ['WARNING', '77', '64 %']]) {
    const l = inst(K.legend, { 'Уровень': lvl }); l.setProperties({ [K.legendNum]: n, [K.legendPct]: p }); append(lg, l, { fillW: true });
  }
  return s;
}

async function widgetScreen(root, K) {
  const s = AL('VERTICAL', '04 · Виджет «Диво Портал»'); fixW(s, 480); s.itemSpacing = 16; pad(s, '2xl', '2xl'); fill(s, 'color/bg/wash');
  root.appendChild(s); STATS.screens++;
  s.appendChild(await T('Виджет на главной «Диво Портала»', 'h2', 'color/text/primary'));
  s.appendChild(await T('для сотрудников бэк-офиса казначейства', 'small', 'color/text/secondary'));
  const w = AL('VERTICAL', 'Виджет'); w.itemSpacing = 12; pad(w, 'lg', 'lg'); cardStyle(w, 'lg'); append(s, w, { fillW: true });
  const top = AL('HORIZONTAL', 'Шапка'); top.counterAxisAlignItems = 'CENTER'; append(w, top, { fillW: true });
  top.appendChild(await T('Казначейские сервисы', 'h2', 'color/text/primary')); spacer(top);
  top.appendChild(await T('обновлено 19:38', 'small', 'color/text/secondary'));
  const al = AL('VERTICAL', 'Известная проблема'); al.itemSpacing = 6; pad(al, 'sm', 'md'); rad(al, 'md'); fill(al, 'color/critical/subtle'); append(w, al, { fillW: true });
  const ah = AL('HORIZONTAL', 'Метки'); ah.itemSpacing = 8; ah.counterAxisAlignItems = 'CENTER'; al.appendChild(ah);
  ah.appendChild(inst(K.sev, { 'Вид': 'Заливка', 'Уровень': 'CRITICAL' }));
  ah.appendChild(await T('Известная проблема · с 19:10', 'smallBold', 'color/critical/strong'));
  wrap(append(al, await T('Задерживается закрытие операционного дня. Специалисты уже работают — обращаться в поддержку не нужно.', 'cell', 'color/text/primary')));
  al.appendChild(await T('INC-18501 · ожидаемое решение до 20:00', 'small', 'color/text/secondary'));
  const list = AL('VERTICAL', 'Услуги'); list.itemSpacing = 4; append(w, list, { fillW: true });
  for (const sv of SERVICES) {
    const r = AL('HORIZONTAL', sv.short); r.counterAxisAlignItems = 'CENTER'; r.paddingTop = 10; r.paddingBottom = 10; r.paddingLeft = 12; r.paddingRight = 10; rad(r, 'sm'); fill(r, 'color/bg/wash'); append(list, r, { fillW: true });
    r.appendChild(await T(sv.short, 'cell', 'color/text/primary')); spacer(r);
    r.appendChild(inst(K.status, { 'Статус': sv.st }));
  }
  const ft = AL('HORIZONTAL', 'Действия'); ft.itemSpacing = 8; ft.counterAxisAlignItems = 'CENTER'; append(w, ft, { fillW: true });
  ft.appendChild(btn(K, 'Подписаться на уведомления', 'Призрачная')); spacer(ft);
  ft.appendChild(btn(K, 'Все услуги', 'Таблетка'));
  return s;
}

async function buildScreens(page, K) {
  await figma.setCurrentPageAsync(page);
  const root = rootFrame(`${KIT} · Экраны`, page);
  root.layoutMode = 'HORIZONTAL'; root.itemSpacing = 80; root.counterAxisAlignItems = 'MIN';
  await monitoringScreen(root, K);
  await eventCardScreen(root, K);
  await dashboardScreen(root, K);
  await widgetScreen(root, K);
  return root;
}

// ---------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------
async function findPrevious() {
  const cols = (await figma.variables.getLocalVariableCollectionsAsync()).filter((c) => c.name.startsWith(KIT + ' · '));
  const styles = (await figma.getLocalTextStylesAsync()).filter((s) => s.name.startsWith(KIT + '/'));
  const rootNames = new Set(['Основы', 'Компоненты', 'Экраны'].map((n) => `${KIT} · ${n}`));
  const frames = [];
  for (const p of figma.root.children) { await p.loadAsync(); for (const n of p.children) if (rootNames.has(n.name)) frames.push(n); }
  return { cols, styles, frames, empty: !cols.length && !styles.length && !frames.length };
}
function confirmRebuild(prev) {
  const html = `<style>body{font:14px/1.45 Inter,system-ui,sans-serif;margin:0;padding:20px;color:#0B0B0B}h3{margin:0 0 8px;font-size:16px}p{margin:0 0 16px;color:#5C5B57}
  .r{display:flex;gap:8px;justify-content:flex-end}button{font:inherit;font-weight:700;border-radius:999px;padding:10px 18px;cursor:pointer;border:1px solid #D5D8DE;background:#fff;color:#0B0B0B}
  #ok{background:#0B0B0B;border-color:#0B0B0B;color:#fff}</style>
  <h3>Пересоздать кит?</h3>
  <p>В файле есть прошлая версия: ${prev.frames.length} фрейм(а), ${prev.cols.length} коллекции переменных, ${prev.styles.length} стилей текста. Они будут удалены и созданы заново. Ваши собственные фреймы не тронем.</p>
  <div class="r"><button id="no">Отмена</button><button id="ok">Пересоздать</button></div>
  <script>document.getElementById('ok').onclick=()=>parent.postMessage({pluginMessage:'ok'},'*');document.getElementById('no').onclick=()=>parent.postMessage({pluginMessage:'no'},'*');</script>`;
  return new Promise((resolve) => {
    figma.showUI(html, { width: 380, height: 230, title: KIT });
    figma.ui.onmessage = (msg) => { figma.ui.close(); resolve(msg === 'ok'); };
  });
}
async function cleanup(prev) {
  for (const f of prev.frames) f.remove();
  for (const s of prev.styles) s.remove();
  for (const c of prev.cols) c.remove();
}

async function main() {
  const prev = await findPrevious();
  if (!prev.empty) {
    if (!(await confirmRebuild(prev))) return 'Отменено — ничего не изменено.';
    await cleanup(prev);
  }
  const { F, family } = await loadFonts();
  await buildVariables();
  await buildTextStyles(F);
  const pFound = await getPage(PAGES.found);
  await buildFoundations(pFound, family);
  const pComps = await getPage(PAGES.comps);
  const { K } = await buildComponents(pComps);
  const pScreens = await getPage(PAGES.screens);
  const screens = await buildScreens(pScreens, K);
  figma.viewport.scrollAndZoomIntoView([screens]);
  return `✅ ${KIT} · UI Kit готов: ${STATS.components} компонентов (${STATS.sets} наборов), ${STATS.variables} переменных, ${STATS.textStyles} стилей, ${STATS.screens} экранов. Шрифт: ${family}.`;
}

main()
  .then((msg) => figma.closePlugin(msg))
  .catch((e) => figma.closePlugin('❌ Ошибка: ' + (e && e.message ? e.message : e)));
