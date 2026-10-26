/*
 * Сборка презентации presentation/Diasoft-Divo-integration.pptx
 *   node tools/build_presentation.js
 * Использует диаграммы из diagrams/ и превью макетов из figma-plugin/preview/.
 */
'use strict';
const path = require('path');
const pptxgen = require('pptxgenjs');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'presentation', 'Diasoft-Divo-integration.pptx');
const APPLY_THEME = process.env.APPLY_THEME;
const AUTHOR = process.env.AUTHOR || 'ФИО участника · вуз · курс';
const REPO = process.env.REPO_URL || 'github.com/<пользователь>/<репозиторий>';
const FIGMA = process.env.FIGMA_URL || 'ссылка на файл Figma';

const P = {
  dark: '0B0B0B', darkSoft: '1F1F1E', mint: 'FFFFFF', sideText: 'C9CCD2',
  text: '0B0B0B', muted: '5C5B57', subtle: '8A8984', border: 'E6E5E0', bg: 'F4F4F2', white: 'FFFFFF',
  brand: '0B0B0B', brandSoft: 'F4F4F2',
  critical: 'E31D2F', criticalBg: 'FCE4E7', major: 'FF5B1F', majorBg: 'FFEADF',
  warning: '8A6414', warningBg: 'FFF4D6', info: '2B73FE', infoBg: 'E7EEFF', ok: '236B3F', okBg: 'E4F6E9'
};
const THEME = {
  name: 'Diasoft Divo',
  headFontFace: 'Arial', bodyFontFace: 'Arial',
  colors: { dk1: P.text, lt1: P.white, dk2: P.dark, lt2: P.bg, accent1: P.brand, accent2: P.major, accent3: P.critical,
    accent4: P.warning, accent5: P.info, accent6: P.ok, hlink: P.brand, folHlink: P.darkSoft }
};
const SEV = { CRITICAL: [P.critical, P.criticalBg], MAJOR: [P.major, P.majorBg], WARNING: [P.warning, P.warningBg], INFO: [P.info, P.infoBg] };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 × 7.5
pres.author = 'Участник стипендиальной программы РСХБ.Цифра';
pres.title = 'Интеграция Diasoft FA# Treasury.Back и ESM-платформы «Диво»';
pres.subject = 'Кейс «Свои Финансы», задача 2';
pres.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial' };

const fs = require('fs');
// соотношение сторон PNG по заголовку IHDR
function pngRatio(file) { const b = fs.readFileSync(file); return b.readUInt32BE(16) / b.readUInt32BE(20); }
const PREV = (f) => path.join(ROOT, 'figma-plugin/preview', f);

const SW = 13.333, M = 0.6, CW = SW - 2 * M;

pres.defineSlideMaster({
  title: 'TITLE_DARK',
  background: { color: P.dark },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.6, w: 11.6, h: 1.9, fontSize: 38, bold: true, color: P.white, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: M, y: 3.7, w: 9.6, h: 1.0, fontSize: 18, color: P.sideText, valign: 'top', align: 'left', margin: 0 }, text: '' } }
  ]
});
pres.defineSlideMaster({
  title: 'CONTENT',
  background: { color: P.white },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.72, w: CW, h: 0.62, fontSize: 28, bold: true, color: P.text, valign: 'middle', align: 'left', margin: 0 }, text: '' } },
    { text: { text: 'Diasoft FA# Treasury.Back ↔ «Диво» · РСХБ.Цифра 2026–2027', options: { x: M, y: 7.05, w: 8, h: 0.3, fontSize: 10, color: P.subtle, margin: 0 } } }
  ],
  slideNumber: { x: 12.23, y: 7.05, w: 0.5, h: 0.3, fontSize: 10, color: P.subtle, align: 'right' }
});

// ---------------------------------------------------------------- helpers

const shadow = () => ({ type: 'outer', color: '0F1B2D', opacity: 0.08, blur: 6, offset: 2, angle: 90 });

function T(slide, text, x, y, w, h, o) {
  o = o || {};
  slide.addText(text, Object.assign({ x, y, w, h, fontSize: 14, color: P.text, margin: 0, valign: 'top', isTextBox: true, fit: 'none' }, o));
}
function box(slide, x, y, w, h, o) {
  o = o || {};
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: o.r !== undefined ? o.r : 0.08,
    fill: { color: o.fill || P.white }, line: o.line === null ? { type: 'none' } : { color: o.line || P.border, width: o.lw || 0.75 },
    shadow: o.shadow ? shadow() : undefined, objectName: o.name
  });
}
function chip(slide, text, x, y, w, o) {
  o = o || {};
  slide.addText(text, {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x, y, w, h: o.h || 0.3,
    fill: { color: o.fill || P.brandSoft }, line: { type: 'none' }, color: o.color || P.brand,
    fontSize: o.size || 10, bold: o.bold !== false, align: o.align || 'center', valign: 'middle', margin: [0, 6, 0, 6], charSpacing: o.cs
  });
}
function numCircle(slide, n, x, y, o) {
  o = o || {};
  const d = o.d || 0.42;
  slide.addText(String(n), { shape: pres.shapes.OVAL, x, y, w: d, h: d, fill: { color: o.fill || P.brand }, line: { type: 'none' },
    color: o.color || P.white, fontSize: o.size || 13, bold: true, align: 'center', valign: 'middle', margin: 0 });
}
function arrow(slide, x1, y1, x2, y2, o) {
  o = o || {};
  slide.addShape(pres.shapes.LINE, { x: x1, y: y1, w: Math.max(x2 - x1, 0.001), h: Math.max(y2 - y1, 0), flipV: false,
    line: { color: o.color || P.muted, width: o.width || 1.5, endArrowType: 'triangle', dashType: o.dash } });
}
function content(title, tag, section) {
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText(title, { placeholder: 'title' });
  chip(s, tag, M, 0.34, Math.max(1.6, tag.length * 0.11 + 0.35), { cs: 1 });
  return s;
}
const cell = (text, o) => ({ text, options: o || {} });
const head = (labels) => labels.map(l => cell(l, { bold: true, color: P.muted, fill: { color: 'F4F4F2' }, fontSize: 11 }));
const tableOpts = (x, y, w, colW, o) => Object.assign({ x, y, w, colW, fontSize: 12, color: P.text, valign: 'middle',
  border: { type: 'solid', pt: 0.75, color: P.border }, margin: [3, 6, 3, 6] }, o || {});

// ================================================================ слайды
// Правило: одна мысль на слайд, текст от 14 pt, детали — в репозитории.

function lane(s, x, label, y0, y1) {
  s.addText(label, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x: x - 1.05, y: y0, w: 2.1, h: 0.5, fill: { color: P.bg },
    line: { color: P.muted, width: 0.75 }, fontSize: 14, bold: true, color: P.text, align: 'center', valign: 'middle', margin: 0 });
  s.addShape(pres.shapes.LINE, { x, y: y0 + 0.5, w: 0, h: y1 - y0 - 0.5, line: { color: 'C9CCD2', width: 1.25 } });
}
function msg(s, xFrom, xTo, y, label, o) {
  o = o || {};
  const left = Math.min(xFrom, xTo), w = Math.abs(xTo - xFrom);
  const toRight = xTo > xFrom;
  s.addShape(pres.shapes.LINE, { x: left, y, w, h: 0, line: { color: o.color || P.text, width: 1.5, dashType: o.dash,
    endArrowType: toRight ? 'triangle' : undefined, beginArrowType: toRight ? undefined : 'triangle' } });
  T(s, label, left, y - 0.32, w, 0.3, { fontSize: 12, align: 'center', color: o.color || P.text });
}
function note(s, x, y, w, text, fill) {
  s.addText(text, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x, y: y - 0.2, w, h: 0.4, fill: { color: fill || P.warningBg },
    line: { type: 'none' }, fontSize: 12, color: P.text, align: 'center', valign: 'middle', margin: 0 });
}
function sevDot(s, x, y, color, d) { d = d || 0.16; s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { type: 'none' } }); }

// ---------------------------------------------------------------- 1. Титул
pres.addSection({ title: 'Задача' });
{
  const s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle: 'Задача' });
  T(s, 'РСХБ.Цифра · ИТ-кейс «Свои Финансы», задача 2', M, 0.9, 11, 0.4, { fontSize: 14, color: P.sideText, bold: true });
  s.addText('Интеграция Diasoft FA# Treasury.Back и ESM-платформы «Диво»', { placeholder: 'title' });
  s.addText('Сбои казначейского бэк-офиса сами попадают в «Диво»: событие, инцидент, SLA, дашборд', { placeholder: 'body' });
  const steps = ['Операция в Diasoft', 'Событие', 'Инцидент', 'SLA', 'Дашборд'];
  let x = M;
  steps.forEach((st, i) => {
    const w = 0.42 + st.length * 0.105;
    s.addText(st, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y: 5.15, w, h: 0.5, fill: { color: P.darkSoft },
      line: { color: '3A3A38', width: 0.75 }, color: P.white, fontSize: 14, bold: i === 1, align: 'center', valign: 'middle', margin: 0 });
    x += w;
    if (i < steps.length - 1) { arrow(s, x + 0.08, 5.4, x + 0.42, 5.4, { color: P.white }); x += 0.5; }
  });
  T(s, AUTHOR, M, 6.55, 8, 0.35, { fontSize: 14, color: P.white });
  T(s, 'Октябрь 2026', SW - M - 3, 6.55, 3, 0.35, { fontSize: 14, color: P.sideText, align: 'right' });
}

// ---------------------------------------------------------------- 2. Проблема
{
  const s = content('О сбоях в казначействе ИТ узнаёт от пользователей', '01 · ПРОБЛЕМА', 'Задача');
  T(s, '15–40 мин', M, 1.9, 6.2, 1.2, { fontSize: 72, bold: true, color: P.critical });
  T(s, 'проходит от сбоя до начала работы над ним', M, 3.15, 6, 0.5, { fontSize: 20 });
  T(s, 'Сотрудник бэк-офиса замечает, что платёж не ушёл, звонит в поддержку, дежурный регистрирует инцидент вручную, 2-я линия выясняет детали.',
    M, 3.9, 5.8, 1.3, { fontSize: 16, color: P.muted });
  T(s, 'Оценка типичной ручной схемы', M, 6.55, 6, 0.3, { fontSize: 11, color: P.subtle });
  const cons = [
    ['SLA не контролируется', 'нет точного начала и конца сбоя'],
    ['Риск срыва расчётов', 'время уходит до cut-off платёжной системы'],
    ['Неполная отчётность', 'короткие сбои не попадают в статистику'],
  ];
  const rx = 7.3, rw = SW - M - rx;
  cons.forEach((c, i) => {
    const y = 1.95 + i * 1.5;
    if (i) s.addShape(pres.shapes.LINE, { x: rx, y: y - 0.28, w: rw, h: 0, line: { color: P.border, width: 1 } });
    T(s, c[0], rx, y, rw, 0.45, { fontSize: 20, bold: true });
    T(s, c[1], rx, y + 0.5, rw, 0.4, { fontSize: 16, color: P.muted });
  });
}

// ---------------------------------------------------------------- 3. Решение
{
  const s = content('Решение: адаптер сам сообщает «Диво» о проблемах', '02 · РЕШЕНИЕ', 'Задача');
  const nodes = [
    ['Diasoft FA#\nTreasury.Back', 'без доработок', P.bg, '5C5B57'],
    ['Integration\nAdapter', 'находит проблему,\nгарантирует доставку', P.white, P.text],
    ['API Gateway\nбанка', 'mTLS · OAuth2', P.bg, P.muted],
    ['ESM-платформа\n«Диво»', 'инцидент · SLA · дашборд', P.infoBg, '2B73FE'],
  ];
  const nw = 2.35, gap = (CW - 4 * nw) / 3;
  nodes.forEach((n, i) => {
    const x = M + i * (nw + gap);
    s.addText(n[0], { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.1, x, y: 1.75, w: nw, h: 1.0, fill: { color: n[2] },
      line: { color: n[3], width: i === 1 ? 2 : 1.25 }, fontSize: 16, bold: true, color: P.text, align: 'center', valign: 'middle', margin: 0 });
    T(s, n[1], x, 2.88, nw, 0.6, { fontSize: 13, color: P.muted, align: 'center' });
    if (i < 3) arrow(s, x + nw + 0.1, 2.25, x + nw + gap - 0.1, 2.25, { color: P.text, width: 2 });
  });
  const stats = [
    ['≤ 2 мин', 'обнаружение сбоя'],
    ['≥ 80 %', 'инцидентов создаются сами'],
    ['100 %', 'сбоев в SLA-отчёте'],
    ['0', 'доработок Diasoft'],
  ];
  const sw = (CW - 3 * 0.3) / 4;
  stats.forEach((st, i) => {
    const x = M + i * (sw + 0.3);
    box(s, x, 4.05, sw, 2.2, { fill: P.bg, line: null });
    T(s, st[0], x + 0.3, 4.35, sw - 0.6, 0.95, { fontSize: 38, bold: true });
    T(s, st[1], x + 0.3, 5.35, sw - 0.6, 0.7, { fontSize: 16, color: P.muted });
  });
}

// ---------------------------------------------------------------- 4. ЦА
{
  const s = content('Кому это нужно', '03 · ЦЕЛЕВАЯ АУДИТОРИЯ', 'Задача');
  const roles = [
    ['Дежурная смена ИТ', 'видит сбой раньше пользователя — инцидент уже создан'],
    ['Сопровождение Diasoft', 'получает операцию, код ошибки и инструкцию сразу'],
    ['Владелец ИТ-услуги', 'видит честную доступность и выполнение SLA'],
    ['Бэк-офис казначейства', 'знает, что о сбое уже известно, — не звонит'],
  ];
  const w = (CW - 3 * 0.3) / 4;
  roles.forEach((r, i) => {
    const x = M + i * (w + 0.3);
    numCircle(s, i + 1, x, 1.9, { d: 0.6, size: 18 });
    T(s, r[0], x, 2.8, w - 0.1, 0.85, { fontSize: 20, bold: true });
    T(s, r[1], x, 3.7, w - 0.1, 1.4, { fontSize: 16, color: P.muted });
  });
  box(s, M, 5.6, CW, 0.9, { fill: P.bg, line: null });
  T(s, 'Плюс руководство ИТ и казначейства: состояние критичных услуг и риск срыва расчётов — на одном дашборде.', M + 0.3, 5.6, CW - 0.6, 0.9, { fontSize: 15, valign: 'middle' });
}

// ---------------------------------------------------------------- 5. Что передаём
pres.addSection({ title: 'Решение' });
{
  const s = content('Что передаём: события о проблемах', '04 · КОНЦЕПЦИЯ', 'Решение');
  const groups = [
    ['Операции', 'задержка, ошибка, отказ в расчёте', ['OPERATION_DELAYED', 'OPERATION_FAILED', 'SETTLEMENT_REJECTED']],
    ['Процессы', 'закрытие дня, курсы, очередь', ['EOD_CLOSE_DELAYED', 'MARKET_DATA_STALE', 'PROCESSING_BACKLOG']],
    ['Система', 'недоступность, шлюзы, задания', ['SYSTEM_UNAVAILABLE', 'EXTERNAL_GATEWAY_ERROR', 'BATCH_JOB_FAILED']],
  ];
  const w = (CW - 2 * 0.3) / 3;
  groups.forEach((g, i) => {
    const x = M + i * (w + 0.3);
    box(s, x, 1.75, w, 2.85, { line: P.border });
    T(s, g[0], x + 0.3, 1.95, w - 0.6, 0.45, { fontSize: 20, bold: true });
    T(s, g[1], x + 0.3, 2.42, w - 0.6, 0.4, { fontSize: 14, color: P.muted });
    g[2].forEach((e, k) => chip(s, e, x + 0.3, 2.95 + k * 0.5, w - 0.6, { h: 0.4, size: 12, align: 'left', color: P.text, fill: P.bg }));
  });
  const extras = [
    ['Событие ≠ инцидент', '«Диво» группирует похожие события и создаёт инцидент по порогу'],
    ['FIRING / RESOLVED', 'проблема ушла — инцидент закрывается сам, SLA считается точно'],
    ['+ метрики и heartbeat', 'агрегаты раз в 5 мин для SLA, сигнал живости раз в 60 с'],
  ];
  extras.forEach((e, i) => {
    const x = M + i * (w + 0.3);
    T(s, e[0], x, 4.95, w, 0.4, { fontSize: 17, bold: true });
    T(s, e[1], x, 5.4, w, 0.8, { fontSize: 14, color: P.muted });
  });
}

// ---------------------------------------------------------------- 6. Как передаём
{
  const s = content('Как передаём: push от адаптера, по событию', '04 · КОНЦЕПЦИЯ', 'Решение');
  const cols = [
    ['Кто инициирует', 'Адаптер — push в «Диво»', 'Diasoft не дорабатываем: адаптер читает реплику БД. «Диво» получает готовые события и не опрашивает чужие системы.'],
    ['В каком режиме', 'По событию + по расписанию', 'Проблема уходит в «Диво» за секунды. Метрики для SLA — пакетом раз в 5 минут, heartbeat — раз в минуту.'],
  ];
  const w = (CW - 0.4) / 2;
  cols.forEach((c, i) => {
    const x = M + i * (w + 0.4);
    box(s, x, 1.75, w, 2.9, { fill: P.bg, line: null });
    T(s, c[0], x + 0.35, 1.98, w - 0.7, 0.35, { fontSize: 14, color: P.muted });
    T(s, c[1], x + 0.35, 2.35, w - 0.7, 0.55, { fontSize: 24, bold: true });
    T(s, c[2], x + 0.35, 3.05, w - 0.7, 1.4, { fontSize: 16 });
  });
  T(s, 'Рассмотрели и отклонили', M, 5.0, CW, 0.35, { fontSize: 14, bold: true, color: P.muted });
  const rej = [
    ['Pull из «Диво»', 'задержка = период опроса, «Диво» должно знать внутренности Diasoft'],
    ['Push прямо из Diasoft', 'доработка вендорской системы, события теряются при сбое «Диво»'],
    ['Kafka', 'избыточно для десятков событий в минуту — путь развития'],
  ];
  const rw = (CW - 2 * 0.3) / 3;
  rej.forEach((r, i) => {
    const x = M + i * (rw + 0.3);
    T(s, r[0], x, 5.4, rw, 0.35, { fontSize: 15, bold: true });
    T(s, r[1], x, 5.78, rw, 0.8, { fontSize: 13, color: P.muted });
  });
}

// ---------------------------------------------------------------- 7. Архитектура
// ---------------------------------------------------------------- 8. Архитектура
{
  const s = content('Схема интеграции: четыре зоны ответственности', '05 · АРХИТЕКТУРА', 'Решение');
  const Y = 1.65, H = 3.85;
  const zone = (x, w, title, color, fill) => {
    box(s, x, Y, w, H, { fill, line: color, lw: 1.25 });
    T(s, title, x + 0.15, Y + 0.12, w - 0.3, 0.55, { fontSize: 13, bold: true, color: P.text });
  };
  const item = (x, y, w, t, sub, o) => {
    o = o || {};
    s.addText([{ text: t, options: { bold: true, fontSize: 12, color: P.text, breakLine: !!sub } }].concat(sub ? [{ text: sub, options: { fontSize: 10, color: P.muted } }] : []),
      { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x, y, w, h: o.h || 0.62, fill: { color: P.white }, line: { color: o.line || P.border, width: 0.75 },
        align: 'center', valign: 'middle', margin: 2 });
  };
  // зона 1
  const z1x = M, z1w = 2.05;
  zone(z1x, z1w, 'Diasoft FA#\nTreasury.Back', '5C5B57', 'F4F4F2');
  item(z1x + 0.15, Y + 0.85, z1w - 0.3, 'Серверы приложений', 'сделки · расчёты');
  item(z1x + 0.15, Y + 1.6, z1w - 0.3, 'БД', 'журнал, статусы, задания');
  item(z1x + 0.15, Y + 2.35, z1w - 0.3, 'Read-only реплика', 'для адаптера');
  T(s, 'без доработок', z1x + 0.15, Y + 3.2, z1w - 0.3, 0.3, { fontSize: 11, color: '5C5B57', bold: true, align: 'center' });
  // зона 2
  const z2x = z1x + z1w + 0.5, z2w = 3.75;
  zone(z2x, z2w, 'Integration Adapter · Treasury Event Gateway', P.text, P.white);
  const iw = (z2w - 0.45) / 2;
  item(z2x + 0.15, Y + 0.85, iw, 'Source Connectors', 'опрос 30 с · probe 20 с');
  item(z2x + 0.3 + iw, Y + 0.85, iw, 'Rules Engine', 'нормативы · severity');
  item(z2x + 0.15, Y + 1.6, iw, 'Transactional Outbox', 'PostgreSQL');
  item(z2x + 0.3 + iw, Y + 1.6, iw, 'Delivery Worker', 'retry · circuit breaker');
  item(z2x + 0.15, Y + 2.35, iw, 'Heartbeat · метрики', '60 с · 5 мин');
  item(z2x + 0.3 + iw, Y + 2.35, iw, 'Dead Letter Queue', 'алерт в мониторинг', { line: P.critical });
  T(s, 'гарантированная доставка, идемпотентность', z2x + 0.15, Y + 3.2, z2w - 0.3, 0.3, { fontSize: 11, color: P.brand, bold: true, align: 'center' });
  // зона 3
  const z3x = z2x + z2w + 0.5, z3w = 1.3;
  zone(z3x, z3w, 'API Gateway', P.muted, P.bg);
  ['mTLS', 'OAuth2', 'лимиты', 'аудит'].forEach((t, i) => item(z3x + 0.15, Y + 0.85 + i * 0.6, z3w - 0.3, t, null, { h: 0.45 }));
  // зона 4
  const z4x = z3x + z3w + 0.5, z4w = SW - M - z4x;
  zone(z4x, z4w, 'ESM-платформа «Диво»', '2B73FE', 'E7EEFF');
  const jw = (z4w - 0.45) / 2;
  item(z4x + 0.15, Y + 0.85, jw, 'Integration API', '/events · /metrics');
  item(z4x + 0.3 + jw, Y + 0.85, jw, 'Корреляция', 'дедуп · группировка');
  item(z4x + 0.15, Y + 1.6, jw, '«Диво Сервис»', 'инциденты · SLA');
  item(z4x + 0.3 + jw, Y + 1.6, jw, 'CMDB', 'услуги и КЕ');
  item(z4x + 0.15, Y + 2.35, jw, '«Диво Мера»', 'дашборды');
  item(z4x + 0.3 + jw, Y + 2.35, jw, '«Диво Портал»', 'виджет');
  // стрелки
  const ay = Y + 1.9;
  arrow(s, z1x + z1w + 0.05, ay, z2x - 0.05, ay, { color: '5C5B57', width: 2 });
  T(s, 'SQL\nread-only', z1x + z1w, ay - 0.62, 0.5, 0.5, { fontSize: 9, color: P.muted, align: 'center' });
  arrow(s, z2x + z2w + 0.05, ay, z3x - 0.05, ay, { color: P.brand, width: 2.5 });
  T(s, 'HTTPS\nREST', z2x + z2w, ay - 0.62, 0.5, 0.5, { fontSize: 9, color: P.muted, align: 'center' });
  arrow(s, z3x + z3w + 0.05, ay, z4x - 0.05, ay, { color: P.brand, width: 2.5 });
  T(s, 'push', z3x + z3w, ay - 0.42, 0.5, 0.3, { fontSize: 9, color: P.muted, align: 'center' });

  T(s, 'Адаптер изолирует системы друг от друга · outbox и повторы не теряют события · идемпотентность по eventId · чтение только с реплики', M, 5.85, CW, 0.4, { fontSize: 14, color: P.muted });
}

// ---------------------------------------------------------------- 8. Sequence (упрощённая)
{
  const s = content('Sequence diagram: от задержки до закрытия', '06 · СХЕМА ИНТЕГРАЦИИ', 'Решение');
  const X = { tb: 1.8, ad: 5.0, dv: 8.6, ops: 11.6 };
  const y0 = 1.65, y1 = 6.7;
  lane(s, X.tb, 'Diasoft', y0, y1);
  lane(s, X.ad, 'Адаптер', y0, y1);
  lane(s, X.dv, '«Диво»', y0, y1);
  lane(s, X.ops, 'Дежурный', y0, y1);
  let y = 2.62; const st = 0.5;
  msg(s, X.ad, X.tb, y, 'опрос реплики, каждые 30 с', { color: P.muted, dash: 'dash' }); y += st;
  msg(s, X.tb, X.ad, y, 'сделка 22 мин при нормативе 5'); y += st;
  note(s, X.ad - 1.9, y, 3.8, 'OPERATION_DELAYED · MAJOR, в outbox'); y += st + 0.15;
  msg(s, X.ad, X.dv, y, 'POST /events · Idempotency-Key'); y += st;
  msg(s, X.dv, X.ad, y, '202 Accepted', { color: P.muted, dash: 'dash' }); y += st;
  msg(s, X.dv, X.ops, y, 'инцидент P2 + уведомление', { color: P.critical }); y += st;
  msg(s, X.tb, X.ad, y, 'расчёт завершён'); y += st;
  msg(s, X.ad, X.dv, y, 'POST /events · RESOLVED'); y += st;
  note(s, X.dv - 1.9, y, 3.8, 'инцидент закрыт, SLA-таймер остановлен', P.okBg);
  
}

// ---------------------------------------------------------------- 9. Надёжность
{
  const s = content('Что если что-то сломалось: события не теряются', '07 · ОБРАБОТКА ОШИБОК', 'Решение');
  const cases = [
    [P.critical, '«Диво» недоступно', 'Событие ждёт в outbox. Повторы с растущей паузой, после восстановления — досылка пакетом.'],
    [P.major, 'Событие пришло дважды', 'eventId — ключ идемпотентности: «Диво» ответит 200 DUPLICATE, второго инцидента не будет.'],
    [P.critical, 'Упал сам адаптер', 'Нет heartbeat 3 минуты — «Диво» само поднимает тревогу и показывает «Нет данных», а не «Норма».'],
    ['C9CCD2', 'Ошибка в данных', 'Без повторов — в Dead Letter Queue и алерт команде интеграции.'],
  ];
  const w = (CW - 0.4) / 2, h = 2.25;
  cases.forEach((c, i) => {
    const x = M + (i % 2) * (w + 0.4), y = 1.7 + Math.floor(i / 2) * (h + 0.3);
    box(s, x, y, w, h, { line: P.border });
    sevDot(s, x + 0.35, y + 0.42, c[0], 0.2);
    T(s, c[1], x + 0.7, y + 0.3, w - 1, 0.45, { fontSize: 20, bold: true });
    T(s, c[2], x + 0.35, y + 0.95, w - 0.7, 1.15, { fontSize: 16, color: P.muted });
  });
}

// ---------------------------------------------------------------- 10. API
pres.addSection({ title: 'API и данные' });
{
  const s = content('API-контракт: 5 методов REST', '08 · API-КОНТРАКТ', 'API и данные');
  const eps = [
    ['POST', '/events', 'Передать событие — основной канал'],
    ['POST', '/events/batch', 'До 500 событий: досылка после сбоя'],
    ['GET', '/events/{eventId}', 'Узнать, создан ли инцидент'],
    ['POST', '/metrics', 'Агрегаты за 5 минут для SLA и дашбордов'],
    ['POST', '/heartbeat', 'Адаптер жив — раз в 60 секунд'],
  ];
  eps.forEach((e, i) => {
    const y = 1.75 + i * 0.66;
    if (i) s.addShape(pres.shapes.LINE, { x: M, y: y - 0.1, w: CW, h: 0, line: { color: P.border, width: 1 } });
    chip(s, e[0], M, y + 0.08, 0.8, { h: 0.36, size: 12, fill: e[0] === 'GET' ? P.info : P.text, color: P.white });
    T(s, e[1], M + 1.05, y + 0.06, 3.6, 0.42, { fontSize: 18, bold: true, fontFace: 'Courier New' });
    T(s, e[2], M + 4.8, y + 0.08, CW - 4.8, 0.42, { fontSize: 17 });
  });
  const codes = [['202', 'принято', P.ok], ['200', 'дубль, уже было', P.ok], ['4xx', 'ошибка данных → DLQ', P.critical], ['429 · 503', 'повторить позже', P.major]];
  const cw = (CW - 3 * 0.25) / 4;
  codes.forEach((c, i) => {
    const x = M + i * (cw + 0.25);
    box(s, x, 5.3, cw, 1.15, { fill: P.bg, line: null });
    T(s, c[0], x + 0.25, 5.42, cw - 0.5, 0.5, { fontSize: 22, bold: true, color: c[2], fontFace: 'Courier New' });
    T(s, c[1], x + 0.25, 5.92, cw - 0.5, 0.4, { fontSize: 14, color: P.muted });
  });
  T(s, 'OpenAPI 3.1 · mTLS + OAuth2 · ошибки в формате RFC 9457 · полная спецификация — api/openapi.yaml', M, 6.6, CW, 0.3, { fontSize: 11, color: P.subtle });
}

// ---------------------------------------------------------------- 11. JSON
{
  const s = content('Схема данных: каждое поле отвечает на вопрос «Диво»', '09 · СХЕМА ДАННЫХ', 'API и данные');
  const json = [
    '{',
    '  "eventId": "0192f1a4-7c3e-…",',
    '  "eventType": "OPERATION_DELAYED",',
    '  "state": "FIRING",',
    '  "severity": "MAJOR",',
    '  "occurredAt": "2026-10-26T11:30:00+03:00",',
    '  "service": { "code": "TREASURY_FX_MM_SETTLEMENT",',
    '               "ciId": "CI-TB-SETTL-01" },',
    '  "operation": { "id": "FX-2026-834724",',
    '                 "amountClass": "LARGE" },',
    '  "sla": { "timeToBreachSec": 13359 },',
    '  "message": "Превышено время расчёта…"',
    '}',
  ].join('\n');
  s.addText(json, { x: M, y: 1.7, w: 6.0, h: 4.75, fontFace: 'Courier New', fontSize: 13, color: 'E6E5E0', fill: { color: P.dark },
    margin: [14, 16, 14, 16], valign: 'middle', isTextBox: true });
  const q = [
    ['eventId', 'то же событие или новое? — без дублей инцидентов'],
    ['eventType · severity', 'что случилось и насколько плохо'],
    ['state', 'проблема есть или ушла — закрыть инцидент'],
    ['service.ciId', 'какую ИТ-услугу задело — SLA и группа'],
    ['sla.timeToBreachSec', 'сколько осталось — главный для приоритета'],
    ['amountClass', 'значимость без суммы — банковская тайна'],
  ];
  const qx = M + 6.4, qw = CW - 6.4;
  q.forEach((it, i) => {
    const y = 1.72 + i * 0.79;
    T(s, it[0], qx, y, qw, 0.35, { fontSize: 15, bold: true, fontFace: 'Courier New' });
    T(s, it[1], qx, y + 0.36, qw, 0.35, { fontSize: 14, color: P.muted });
  });
}

// ---------------------------------------------------------------- 12–13. Макеты
pres.addSection({ title: 'UX' });
function mockSlide(title, file, notes) {
  const s = content(title, '10 · МАКЕТЫ', 'UX');
  const r = pngRatio(PREV(file));
  let w = 8.6, h = w / r;
  if (h > 5.15) { h = 5.15; w = h * r; }
  box(s, M - 0.02, 1.63, w + 0.04, h + 0.04, { line: P.border, r: 0.04 });
  s.addImage({ path: PREV(file), x: M, y: 1.65, w, h, altText: title });
  const nx = M + w + 0.45, nw = SW - M - nx;
  notes.forEach((n, i) => {
    const y = 1.75 + i * 1.5;
    numCircle(s, i + 1, nx, y, { d: 0.42, size: 13 });
    T(s, n[0], nx + 0.6, y + 0.02, nw - 0.6, 0.4, { fontSize: 17, bold: true });
    T(s, n[1], nx + 0.6, y + 0.45, nw - 0.6, 0.9, { fontSize: 14, color: P.muted });
  });
}
mockSlide('Мониторинг: что горит и что спасать первым', '01-Мониторинг-событий.png', [
  ['Статус интеграции', 'тишина — норма, только если адаптер жив'],
  ['SLA под угрозой', '«осталось 22 мин» вместо дедлайна'],
  ['Таблица событий', 'критичность первой колонкой, устранённые приглушены'],
]);
mockSlide('Карточка события: сколько осталось и кто работает', '02-Карточка-события.png', [
  ['Запас до дедлайна', 'крупно — сколько минут до нарушения SLA'],
  ['Что произошло', 'от Diasoft до инцидента за секунды'],
  ['Одно действие', 'инцидент уже создан — открыть его'],
]);
mockSlide('Дашборд «Диво Мера»: доступность и SLA за месяц', '03-Дашборд-Диво-Мера.png', [
  ['Эффект на виду', 'доступность, время обнаружения и восстановления'],
  ['30 дней по услугам', 'видно, какая услуга болеет систематически'],
  ['Уровни событий', 'сколько CRITICAL, MAJOR и WARNING'],
]);

// ---------------------------------------------------------------- 14. Эффект
pres.addSection({ title: 'Эффект' });
{
  const s = content('Ожидаемый эффект', '11 · ЭФФЕКТ', 'Эффект');
  const eff = [
    ['15–40 мин', '≤ 2 мин', 'время обнаружения сбоя'],
    ['≈ 0 %', '≥ 80 %', 'инцидентов создаются автоматически'],
    ['частично', '100 %', 'сбоев попадают в SLA-отчёт'],
    ['каждый звонит', '−50 %', 'обращений во время известного сбоя'],
  ];
  const w = (CW - 0.4) / 2, h = 2.1;
  eff.forEach((e, i) => {
    const x = M + (i % 2) * (w + 0.4), y = 1.7 + Math.floor(i / 2) * (h + 0.3);
    box(s, x, y, w, h, { fill: P.bg, line: null });
    T(s, e[1], x + 0.35, y + 0.3, w - 0.7, 0.85, { fontSize: 44, bold: true, color: P.ok });
    T(s, e[2], x + 0.35, y + 1.18, w - 0.7, 0.4, { fontSize: 17 });
    T(s, 'было: ' + e[0], x + 0.35, y + 1.58, w - 0.7, 0.35, { fontSize: 13, color: P.muted });
  });
  T(s, '«Было» — оценка типичной ручной схемы. Цели предлагается зафиксировать как KPI пилота и измерять в «Диво Мера».', M, 6.62, CW, 0.3, { fontSize: 11, color: P.subtle });
}

// ---------------------------------------------------------------- 15. План
{
  const s = content('План внедрения', '12 · ВНЕДРЕНИЕ', 'Эффект');
  const st = [
    ['Согласование', '2 нед.', 'события, нормативы, доступ к реплике'],
    ['MVP', '4–6 нед.', '4 события, /events, экран мониторинга'],
    ['Теневой пилот', '4 нед.', 'события без инцидентов, калибровка порогов'],
    ['Эксплуатация', '2 нед.', 'автоинциденты, SLA, карточка, виджет'],
    ['Развитие', 'далее', 'метрики, «Мера», другие системы'],
  ];
  const w = (CW - 4 * 0.2) / 5;
  s.addShape(pres.shapes.LINE, { x: M + 0.25, y: 2.08, w: CW - 0.5, h: 0, line: { color: P.border, width: 2 } });
  st.forEach((x0, i) => {
    const x = M + i * (w + 0.2);
    numCircle(s, i + 1, x, 1.82, { d: 0.52, size: 15, fill: i === 2 ? P.major : P.text });
    T(s, x0[0], x, 2.6, w, 0.45, { fontSize: 19, bold: true });
    T(s, x0[1], x, 3.08, w, 0.35, { fontSize: 14, color: P.muted, bold: true });
    T(s, x0[2], x, 3.5, w - 0.1, 1.1, { fontSize: 15 });
  });
  box(s, M, 5.15, CW, 1.2, { fill: P.majorBg, line: null });
  T(s, 'Теневой пилот — главная страховка: месяц события идут в «Диво» без создания инцидентов, пороги калибруются на реальных данных, «шторма» ложных инцидентов не будет.',
    M + 0.35, 5.15, CW - 0.7, 1.2, { fontSize: 15, valign: 'middle' });
}

// ---------------------------------------------------------------- 16. Итог
{
  const s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle: 'Эффект' });
  T(s, 'Итог', M, 0.75, 8, 0.7, { fontSize: 36, bold: true, color: P.white });
  const pts = [
    ['Адаптер без доработок Diasoft', 'push событий в «Диво», outbox и повторы — ничего не теряется'],
    ['Контракт, который можно проверить', '5 методов REST, OpenAPI 3.1, JSON Schema и 14 примеров'],
    ['Раздел «Диво» в Figma', 'мониторинг, карточка события, дашборд, виджет — UI Kit на переменных'],
    ['Измеримый эффект', 'обнаружение ≤ 2 мин, ≥ 80 % автоинцидентов, полный SLA-отчёт'],
  ];
  pts.forEach((p, i) => {
    const y = 1.8 + i * 0.95;
    numCircle(s, i + 1, M, y, { fill: P.white, color: P.dark, d: 0.46, size: 14 });
    T(s, p[0], M + 0.7, y - 0.02, 11, 0.4, { fontSize: 19, bold: true, color: P.white });
    T(s, p[1], M + 0.7, y + 0.4, 11, 0.4, { fontSize: 14, color: P.sideText });
  });
  s.addShape(pres.shapes.LINE, { x: M, y: 5.85, w: CW, h: 0, line: { color: '3A3A38', width: 1 } });
  s.addText([
    { text: 'Репозиторий: ', options: { color: P.sideText } }, { text: REPO, options: { color: P.white, bold: true, breakLine: true } },
    { text: 'Макеты Figma: ', options: { color: P.sideText } }, { text: FIGMA, options: { color: P.white, bold: true } }
  ], { x: M, y: 6.0, w: 8.5, h: 0.75, fontSize: 14, margin: 0, isTextBox: true, valign: 'top' });
  T(s, AUTHOR, SW - M - 4.5, 6.0, 4.5, 0.4, { fontSize: 14, color: P.white, align: 'right' });
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  if (APPLY_THEME) { const { applyTheme } = require(APPLY_THEME); await applyTheme(OUT, THEME); }
  console.log('written', OUT);
})();
