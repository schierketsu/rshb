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

// ---------------------------------------------------------------- 1. Титул

pres.addSection({ title: 'Задача' });
{
  const s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle: 'Задача' });
  T(s, 'РСХБ.Цифра · стипендиальная программа 2026–2027 · ИТ-кейс «Свои Финансы», задача 2', M, 0.9, 11, 0.4, { fontSize: 14, color: P.mint, bold: true });
  s.addText('Интеграция Diasoft FA# Treasury.Back и ESM-платформы «Диво»', { placeholder: 'title' });
  s.addText('Автоматическая передача событий казначейского бэк-офиса в «Диво» для мониторинга ИТ-услуг, инцидентов и SLA', { placeholder: 'body' });
  const steps = ['Операция в Diasoft', 'Событие', 'Инцидент', 'SLA', 'Дашборд'];
  let x = M;
  steps.forEach((st, i) => {
    const w = 0.42 + st.length * 0.105;
    s.addText(st, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y: 5.15, w, h: 0.5, fill: { color: P.darkSoft },
      line: { color: '3A3A38', width: 0.75 }, color: P.white, fontSize: 14, bold: i === 1, align: 'center', valign: 'middle', margin: 0 });
    x += w;
    if (i < steps.length - 1) { arrow(s, x + 0.08, 5.4, x + 0.42, 5.4, { color: P.mint }); x += 0.5; }
  });
  T(s, AUTHOR, M, 6.55, 8, 0.35, { fontSize: 14, color: P.white });
  T(s, 'Октябрь 2026', SW - M - 3, 6.55, 3, 0.35, { fontSize: 14, color: P.sideText, align: 'right' });
}

// ---------------------------------------------------------------- 2. Проблема
{
  const s = content('Сегодня о сбоях в казначействе ИТ узнаёт от пользователей', '01 · ПРОБЛЕМА', 'Задача');
  T(s, 'Как это происходит сейчас', M, 1.65, 6.8, 0.35, { fontSize: 16, bold: true });
  const steps = [
    ['Расчёт по сделке «завис» в Treasury.Back', '0 мин'],
    ['Сотрудник бэк-офиса замечает, что платёж не ушёл', '+10–20 мин'],
    ['Звонок или обращение в поддержку', '+5–10 мин'],
    ['1-я линия вручную регистрирует инцидент', '+5 мин'],
    ['2-я линия выясняет: какая операция, какой модуль', '+5–10 мин']
  ];
  steps.forEach((st, i) => {
    const y = 2.15 + i * 0.66;
    numCircle(s, i + 1, M, y, { fill: i === 0 ? P.critical : P.bg, color: i === 0 ? P.white : P.text });
    T(s, st[0], M + 0.6, y + 0.07, 4.9, 0.35, { fontSize: 15 });
    T(s, st[1], M + 5.55, y + 0.07, 1.25, 0.35, { fontSize: 14, bold: true, color: P.muted, align: 'right' });
    if (i < steps.length - 1) s.addShape(pres.shapes.LINE, { x: M + 0.21, y: y + 0.44, w: 0, h: 0.22, line: { color: P.border, width: 1.5 } });
  });
  box(s, M, 5.55, 6.8, 0.95, { fill: P.criticalBg, line: null });
  T(s, '15–40 мин', M + 0.25, 5.68, 2.4, 0.7, { fontSize: 30, bold: true, color: P.critical, valign: 'middle' });
  T(s, 'проходит до начала работы над сбоем — и всё это время до cut-off расчётов', M + 2.7, 5.68, 3.95, 0.7, { fontSize: 14, color: P.text, valign: 'middle' });

  const cons = [
    ['SLA не контролируется', 'Нет точного времени начала и окончания сбоя — длительность восстанавливают по памяти.'],
    ['Риск срыва расчётов', 'Время уходит, пока до cut-off платёжной системы или депозитария ещё можно успеть.'],
    ['Неполная отчётность', 'Короткие сбои никто не регистрирует — их нет в статистике и в разборе причин.']
  ];
  T(s, 'Последствия', 7.85, 1.65, 4.9, 0.35, { fontSize: 16, bold: true });
  cons.forEach((c, i) => {
    const y = 2.15 + i * 1.48;
    box(s, 7.85, y, 4.88, 1.3, { shadow: true });
    T(s, c[0], 8.1, y + 0.18, 4.4, 0.35, { fontSize: 16, bold: true, color: P.critical });
    T(s, c[1], 8.1, y + 0.55, 4.45, 0.7, { fontSize: 13, color: P.muted });
  });
  T(s, 'Оценка типичной ручной схемы, не данные банка', 7.85, 6.62, 4.9, 0.3, { fontSize: 10, color: P.subtle, align: 'right' });
}

// ---------------------------------------------------------------- 3. Решение и ценность
{
  const s = content('Решение: адаптер сам сообщает «Диво» о проблемах', '02 · РЕШЕНИЕ И БИЗНЕС-ЦЕННОСТЬ', 'Задача');
  const nodes = [
    ['Diasoft FA#\nTreasury.Back', 'источник фактов,\nбез доработок', P.bg, '5C5B57'],
    ['Integration\nAdapter', 'обнаруживает, нормализует,\nгарантирует доставку', P.white, P.brand],
    ['API Gateway\nбанка', 'mTLS · OAuth2 ·\nаудит', P.bg, P.muted],
    ['ESM-платформа\n«Диво»', 'инцидент · SLA ·\nдашборд', P.infoBg, '2B73FE']
  ];
  const nw = 2.35, gap = (CW - 4 * nw) / 3;
  nodes.forEach((n, i) => {
    const x = M + i * (nw + gap);
    s.addText(n[0], { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.1, x, y: 1.75, w: nw, h: 1.0, fill: { color: n[2] },
      line: { color: n[3], width: 1.25 }, fontSize: 16, bold: true, color: P.text, align: 'center', valign: 'middle', margin: 0 });
    T(s, n[1], x, 2.85, nw, 0.6, { fontSize: 12, color: P.muted, align: 'center' });
    if (i < 3) arrow(s, x + nw + 0.1, 2.25, x + nw + gap - 0.1, 2.25, { color: P.brand, width: 2 });
  });
  T(s, 'чтение реплики БД', M + nw + 0.05, 1.9, gap - 0.1, 0.3, { fontSize: 10, color: P.muted, align: 'center' });
  T(s, 'REST push', M + 2 * nw + gap + 0.05, 1.9, gap - 0.1, 0.3, { fontSize: 10, color: P.muted, align: 'center' });

  const stats = [
    ['≤ 2 мин', 'обнаружение сбоя вместо 15–40 мин ручной схемы'],
    ['≥ 80 %', 'инцидентов казначейства регистрируются автоматически'],
    ['100 %', 'сбоев попадают в SLA-отчёт с точной длительностью'],
    ['0', 'доработок Diasoft: адаптер только читает реплику БД']
  ];
  const sw = (CW - 3 * 0.3) / 4;
  stats.forEach((st, i) => {
    const x = M + i * (sw + 0.3);
    box(s, x, 3.95, sw, 2.45, { fill: P.bg, line: null });
    T(s, st[0], x + 0.25, 4.2, sw - 0.5, 0.95, { fontSize: 44, bold: true, color: P.brand });
    T(s, st[1], x + 0.25, 5.25, sw - 0.5, 0.95, { fontSize: 14, color: P.text });
  });
  T(s, 'Целевые значения для пилота; измеряются в «Диво Мера»', M, 6.55, CW, 0.3, { fontSize: 10, color: P.subtle });
}

// ---------------------------------------------------------------- 4. ЦА
{
  const s = content('Пять ролей получают пользу от интеграции', '03 · ЦЕЛЕВАЯ АУДИТОРИЯ', 'Задача');
  const roles = [
    ['Дежурная смена ИТ', '1-я линия', 'Экран мониторинга событий', 'Видит сбой раньше пользователя, инцидент уже создан и классифицирован'],
    ['Сопровождение Diasoft', '2-я линия', 'Карточка события', 'Операция, модуль, код ошибки и инструкция — без переписки с бэк-офисом'],
    ['Владелец ИТ-услуги', 'сервис-менеджер', 'Дашборд «Диво Мера»', 'Объективная доступность и выполнение SLA, топ причин сбоев'],
    ['Бэк-офис казначейства', 'пользователи', 'Виджет «Диво Портала»', 'Знает, что о сбое уже известно, — не тратит время на звонки'],
    ['Руководство', 'ИТ и казначейство', 'Дашборд', 'Риск срыва расчётов и состояние критичных услуг — в одном месте']
  ];
  const w = (CW - 4 * 0.2) / 5;
  roles.forEach((r, i) => {
    const x = M + i * (w + 0.2);
    box(s, x, 1.75, w, 4.75, { shadow: true });
    numCircle(s, i + 1, x + 0.25, 2.0, { d: 0.5, size: 15 });
    T(s, r[0], x + 0.25, 2.7, w - 0.45, 0.65, { fontSize: 16, bold: true });
    T(s, r[1], x + 0.25, 3.35, w - 0.45, 0.3, { fontSize: 12, color: P.muted });
    chip(s, r[2], x + 0.25, 3.85, w - 0.5, { h: 0.5, size: 11, align: 'left' });
    T(s, r[3], x + 0.25, 4.6, w - 0.45, 1.7, { fontSize: 14, color: P.text });
  });
}

// ---------------------------------------------------------------- 5. Анализ
{
  const s = content('Где в работе бэк-офиса возникают сбои и что полезно «Диво»', '04 · АНАЛИЗ', 'Задача');
  const flow = [
    ['Захват сделки', 'очередь растёт'],
    ['Подтверждение', 'нет подтверждения'],
    ['Расчёты', 'поручение отклонено, задержка'],
    ['Учёт в АБС', 'ошибка проводки'],
    ['Курсы и переоценка', 'данные устарели'],
    ['Закрытие дня', 'шаг не завершён в срок']
  ];
  const fw = (CW - 5 * 0.25) / 6;
  flow.forEach((f, i) => {
    const x = M + i * (fw + 0.25);
    s.addText(f[0], { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y: 1.7, w: fw, h: 0.62, fill: { color: P.brandSoft },
      line: { color: P.brand, width: 1 }, fontSize: 14, bold: true, color: P.text, align: 'center', valign: 'middle', margin: 2 });
    if (i < 5) arrow(s, x + fw + 0.02, 2.01, x + fw + 0.23, 2.01, { color: P.brand });
    s.addText([{ text: '⚠ ', options: { color: P.critical, bold: true } }, { text: f[1], options: { color: P.critical } }],
      { x, y: 2.42, w: fw, h: 0.55, fontSize: 12, align: 'center', valign: 'top', margin: 0, isTextBox: true });
  });
  T(s, 'Какие данные Diasoft передаём и зачем', M, 3.2, CW, 0.35, { fontSize: 16, bold: true });
  const rows = [
    head(['Данные Diasoft', 'Что даёт «Диво»', 'Процесс «Диво»']),
    ['Статусы операций и время нахождения на этапе', 'Задержки относительно норматива', 'Инциденты, SLA'],
    ['Ошибки обработки и отказы внешних систем', 'Немедленный инцидент с кодом ошибки', 'Инциденты'],
    ['Глубина очереди, пропускная способность', 'Деградация видна до жалоб пользователей', 'Мониторинг, «Мера»'],
    ['Статусы шагов закрытия дня, загрузки курсов', 'Контроль критичных ежедневных процессов', 'Инциденты, SLA'],
    ['Агрегаты: доля операций в нормативе, p95', 'Объективная SLA-отчётность и тренды', '«Диво Мера»']
  ].map((r, i) => i === 0 ? r : r.map(c => cell(c)));
  s.addTable(rows, tableOpts(M, 3.62, CW, [4.7, 4.6, 2.83], { fontSize: 13, rowH: 0.42 }));
  s.addText([{ text: 'Не передаём: ', options: { bold: true } }, { text: 'суммы, счета, наименования контрагентов, ПДн — банковская тайна; вместо суммы — класс значимости amountClass' }],
    { x: M, y: 6.3, w: CW, h: 0.45, fontSize: 13, color: P.text, fill: { color: P.warningBg }, margin: [0, 10, 0, 10], valign: 'middle', isTextBox: true });
}

// ---------------------------------------------------------------- 6. Каталог событий
pres.addSection({ title: 'Концепция' });
{
  const s = content('Что передаём: 11 типов событий, привязанных к ИТ-услугам', '05 · КОНЦЕПЦИЯ', 'Концепция');
  const ev = [
    ['OPERATION_DELAYED', 'операция на этапе дольше норматива', 'WARNING → MAJOR', 'Расчёты FX/МБК, ЦБ'],
    ['OPERATION_FAILED', 'операция перешла в ошибку', 'MAJOR', 'операционные'],
    ['SETTLEMENT_REJECTED', 'поручение отклонено ПС / депозитарием', 'CRITICAL', 'Расчёты'],
    ['PROCESSING_BACKLOG', 'очередь необработанных операций выше порога', 'WARNING → MAJOR', 'Учёт сделок, расчёты'],
    ['EOD_CLOSE_DELAYED', 'закрытие операционного дня дольше норматива', 'MAJOR → CRITICAL', 'Закрытие дня'],
    ['EOD_STEP_FAILED', 'шаг закрытия дня завершился ошибкой', 'CRITICAL', 'Закрытие дня'],
    ['MARKET_DATA_STALE', 'курсы и котировки не обновлялись дольше порога', 'MAJOR', 'Рыночные данные'],
    ['EXTERNAL_GATEWAY_ERROR', 'ошибки обмена со SWIFT/СПФС, ПС БР, НРД, биржей', 'MAJOR → CRITICAL', 'Расчёты'],
    ['BATCH_JOB_FAILED', 'упало регламентное задание', 'MAJOR', 'по заданию'],
    ['SYSTEM_DEGRADED', 'время отклика / доля ошибок выше порога', 'MAJOR', 'все услуги'],
    ['SYSTEM_UNAVAILABLE', 'сервер не отвечает на 3 проверки подряд', 'CRITICAL', 'все услуги']
  ];
  const rows = [head(['eventType', 'Когда возникает', 'Severity', 'ИТ-услуга'])].concat(ev.map(e => {
    const top = e[2].split(' → ').pop();
    return [cell(e[0], { fontFace: 'Courier New', bold: true, fontSize: 11 }), cell(e[1]), cell(e[2], { bold: true, color: SEV[top][0] }), cell(e[3], { color: P.muted })];
  }));
  s.addTable(rows, tableOpts(M, 1.62, 8.6, [2.7, 3.35, 1.3, 1.25], { fontSize: 11, rowH: 0.37 }));
  const rx = M + 8.85, rw = CW - 8.85;
  box(s, rx, 1.62, rw, 2.25, { fill: P.brandSoft, line: null });
  T(s, 'Событие ≠ инцидент', rx + 0.22, 1.8, rw - 0.4, 0.35, { fontSize: 16, bold: true, color: P.brand });
  T(s, 'Адаптер сообщает факты. «Диво» по правилам решает, создавать ли инцидент: группирует, подавляет, применяет пороги.', rx + 0.22, 2.2, rw - 0.4, 1.55, { fontSize: 13 });
  box(s, rx, 4.02, rw, 1.35, { shadow: true });
  T(s, 'FIRING / RESOLVED', rx + 0.22, 4.17, rw - 0.4, 0.35, { fontSize: 14, bold: true });
  T(s, 'Парное событие закрывает инцидент и останавливает SLA-таймер автоматически', rx + 0.22, 4.52, rw - 0.4, 0.8, { fontSize: 12, color: P.muted });
  box(s, rx, 5.52, rw, 1.0, { shadow: true });
  T(s, '+ метрики раз в 5 мин\n+ heartbeat раз в 60 с', rx + 0.22, 5.65, rw - 0.4, 0.75, { fontSize: 13, bold: true, color: P.text });
}

// ---------------------------------------------------------------- 7. Режим и инициатор
{
  const s = content('Как передаём: push от адаптера, гибрид режимов', '05 · КОНЦЕПЦИЯ', 'Концепция');
  const col = (x, title, items) => {
    T(s, title, x, 1.65, 5.9, 0.4, { fontSize: 18, bold: true });
    items.forEach((it, i) => {
      const y = 2.2 + i * 1.5;
      const yes = it[0];
      box(s, x, y, 5.9, 1.32, { fill: yes ? P.brandSoft : P.white, line: yes ? P.brand : P.border, lw: yes ? 1.5 : 0.75 });
      chip(s, yes ? 'ВЫБРАНО' : 'НЕТ', x + 0.2, y + 0.2, 1.1, { fill: yes ? P.brand : P.bg, color: yes ? P.white : P.muted, h: 0.28 });
      T(s, it[1], x + 1.45, y + 0.17, 4.3, 0.35, { fontSize: 16, bold: true, color: yes ? P.text : P.muted });
      T(s, it[2], x + 1.45, y + 0.55, 4.3, 0.72, { fontSize: 13, color: yes ? P.text : P.muted });
    });
  };
  col(M, 'Режим передачи', [
    [true, 'По событию (push)', 'Все события из каталога — задержка секунды, нет лишнего трафика'],
    [true, 'По расписанию', 'Метрики раз в 5 мин, heartbeat раз в 60 с, досылка накопленного пакетами'],
    [false, 'Потоково (Kafka)', 'Избыточно при единицах событий в минуту; «Диво» пришлось бы стать потребителем брокера. Путь развития']
  ]);
  col(M + 6.23, 'Кто инициирует', [
    [false, 'Pull из «Диво»', '«Диво» должно знать внутренности Diasoft; задержка = частота опроса; нагрузка на ESM'],
    [false, 'Push напрямую из Diasoft', 'Доработка вендорской системы; при недоступности «Диво» события теряются'],
    [true, 'Push из Integration Adapter', 'Diasoft без доработок, нормализованные события, гарантированная доставка']
  ]);
  T(s, 'Ожидаемый объём: единицы событий в минуту, до ~50 событий/с в пике закрытия дня — REST выдерживает с запасом', M, 6.62, CW, 0.3, { fontSize: 11, color: P.muted });
}

// ---------------------------------------------------------------- 8. Архитектура
pres.addSection({ title: 'Архитектура' });
{
  const s = content('Схема интеграции: четыре зоны ответственности', '06 · АРХИТЕКТУРА', 'Архитектура');
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

  const why = [
    ['Адаптер между системами', 'Diasoft не знает модель «Диво» и наоборот — обновления изолированы'],
    ['Outbox + повторы + DLQ', 'недоступность «Диво» не теряет ни одного события'],
    ['Идемпотентность по eventId', 'повторная доставка не создаёт второй инцидент'],
    ['Read-only реплика', 'нет нагрузки на рабочую БД в часы расчётов']
  ];
  const ww = (CW - 3 * 0.2) / 4;
  why.forEach((w, i) => {
    const x = M + i * (ww + 0.2);
    T(s, w[0], x, 5.75, ww, 0.3, { fontSize: 13, bold: true, color: P.brand });
    T(s, w[1], x, 6.07, ww, 0.75, { fontSize: 12, color: P.muted });
  });
}

// ---------------------------------------------------------------- 9. Sequence
{
  const s = content('Sequence diagram: от задержки расчёта до инцидента', '06 · АРХИТЕКТУРА', 'Архитектура');
  const h = 5.25, w = h * 2352 / 1152;
  s.addImage({ path: path.join(ROOT, 'diagrams/seq-main.png'), x: (SW - w) / 2, y: 1.58, w, h, altText: 'Sequence diagram основного сценария' });
  T(s, 'Сценарии сбоев (недоступность «Диво», ошибка данных, перегрузка, падение Diasoft и адаптера) — в diagrams/seq-failure и seq-health', M, 6.88, CW, 0.2, { fontSize: 9, color: P.subtle });
}

// ---------------------------------------------------------------- 10. Ошибки
{
  const s = content('Обработка ошибок: ни одно событие не теряется', '07 · НАДЁЖНОСТЬ', 'Архитектура');
  const rows = [head(['Ситуация', 'Поведение', 'Результат'])].concat([
    ['«Диво» недоступно (503, таймаут)', 'Событие уже в outbox; повторы 1→2→4…300 с; после 5 ошибок — circuit breaker', 'После восстановления досылка пакетами /events/batch по порядку'],
    ['Повторная доставка', 'Тот же eventId = Idempotency-Key', '200 DUPLICATE — второго инцидента нет'],
    ['Ошибка данных (400, 409, 422)', 'Без повторов → Dead Letter Queue', 'Алерт команде интеграции'],
    ['Перегрузка (429)', 'Пауза по Retry-After', 'Плавная досылка'],
    ['Недоступен Diasoft', '3 неудачных health-probe → SYSTEM_UNAVAILABLE', 'Инцидент P1, производные события подавлены'],
    ['Упал сам адаптер', 'Heartbeat не приходит 3 мин', '«Диво» само создаёт событие, статус услуг — «Нет данных»'],
    ['Плановые работы', '«Диво» знает окно работ по КЕ', 'События сохраняются, инциденты не создаются']
  ].map((r, i) => [cell(r[0], { bold: true, color: i === 0 || i >= 4 ? P.critical : P.text }), cell(r[1]), cell(r[2], { color: P.brand })]));
  s.addTable(rows, tableOpts(M, 1.65, CW, [3.0, 5.0, 4.13], { fontSize: 13, rowH: 0.56 }));
  T(s, 'Тишина ≠ норма: отсутствие событий без heartbeat означает «нет данных», а не «всё хорошо»', M, 6.62, CW, 0.3, { fontSize: 13, bold: true, color: P.brand });
}

// ---------------------------------------------------------------- 11. Правила и severity
{
  const s = content('Событие ≠ инцидент: правила «Диво» и расчёт severity', '08 · ПРАВИЛА', 'Архитектура');
  T(s, 'Обработка события в «Диво»', M, 1.62, 5.6, 0.35, { fontSize: 16, bold: true });
  const steps = [
    ['Валидация', 'JSON Schema, КЕ есть в CMDB'],
    ['Дедупликация', 'по eventId'],
    ['Подавление', 'не-PROD, плановые работы, активная авария'],
    ['Группировка', 'по correlationKey в окне 10 мин'],
    ['Порог инцидента', 'CRITICAL — сразу; MAJOR — от 5 событий за 10 мин'],
    ['Обновить, а не создать', 'если по ключу уже открыт инцидент'],
    ['RESOLVED → закрыть', 'и остановить SLA-таймер']
  ];
  steps.forEach((st, i) => {
    const y = 2.08 + i * 0.66;
    numCircle(s, i + 1, M, y, { d: 0.4, size: 12 });
    T(s, st[0], M + 0.55, y - 0.02, 5.1, 0.3, { fontSize: 14, bold: true });
    T(s, st[1], M + 0.55, y + 0.27, 5.1, 0.3, { fontSize: 12, color: P.muted });
  });
  const mx = M + 6.1, mw = CW - 6.1;
  T(s, 'Severity = критичность услуги × отклонение', mx, 1.62, mw, 0.35, { fontSize: 16, bold: true });
  const sc = (v) => cell(v, { bold: true, color: SEV[v][0], fill: { color: SEV[v][1] }, align: 'center' });
  const rows = [
    head(['Отклонение', 'Услуга кр. 1', 'кр. 2', 'кр. 3']).map((c, i) => { if (i) c.options.align = 'center'; return c; }),
    [cell('Недоступность, отказ внешней системы, ошибка шага закрытия дня'), sc('CRITICAL'), sc('CRITICAL'), sc('MAJOR')],
    [cell('> 200 % норматива или ≤ 30 мин до нарушения SLA'), sc('CRITICAL'), sc('MAJOR'), sc('WARNING')],
    [cell('50–200 % норматива'), sc('MAJOR'), sc('WARNING'), sc('WARNING')],
    [cell('< 50 % норматива, рост очереди'), sc('WARNING'), sc('INFO'), sc('INFO')]
  ];
  s.addTable(rows, tableOpts(mx, 2.08, mw, [2.75, 1.13, 1.04, 1.11], { fontSize: 12, rowH: 0.72 }));
  box(s, mx, 5.85, mw, 0.85, { fill: P.bg, line: null });
  T(s, 'Повышают: валютирование сегодня, класс суммы LARGE / VERY_LARGE. Приоритет: CRITICAL → P1/P2, MAJOR → P2/P3; группа — из карточки КЕ.', mx + 0.2, 5.92, mw - 0.4, 0.72, { fontSize: 12, color: P.text, valign: 'middle' });
}

// ---------------------------------------------------------------- 12. API
pres.addSection({ title: 'API и данные' });
{
  const s = content('REST API: 5 endpoints, спецификация OpenAPI 3.1', '09 · API-КОНТРАКТ', 'API и данные');
  T(s, 'Базовый URL: https://api-gw.rshb.local/divo/api/v1/integrations/treasury', M, 1.58, CW, 0.3, { fontSize: 12, color: P.muted, fontFace: 'Courier New' });
  const m = (v) => cell(v, { bold: true, color: v === 'GET' ? P.info : P.brand, fontFace: 'Courier New', fontSize: 12 });
  const rows = [head(['Метод', 'Путь', 'Назначение', 'Входные параметры', 'Ответ'])].concat([
    ['POST', '/events', 'Передать одно событие — основной канал', 'Idempotency-Key, тело TreasuryEvent', '202 / 200 дубль'],
    ['POST', '/events/batch', 'До 500 событий: досылка после сбоя, пик закрытия дня', 'batchId, events[1..500]', '207 Multi-Status'],
    ['GET', '/events/{eventId}', 'Статус обработки: создан ли инцидент', 'eventId в пути', '200 EventStatus / 404'],
    ['POST', '/metrics', 'Агрегаты за 5 мин для SLA и дашбордов', 'snapshotId, period, services[]', '202 / 200 дубль'],
    ['POST', '/heartbeat', 'Живость адаптера раз в 60 с', 'adapterId, source, outbox', '204']
  ].map(r => [m(r[0]), cell(r[1], { fontFace: 'Courier New', bold: true, fontSize: 12 }), cell(r[2]), cell(r[3], { color: P.muted }), cell(r[4], { bold: true })]));
  s.addTable(rows, tableOpts(M, 2.0, CW, [0.85, 2.05, 4.0, 3.2, 2.03], { fontSize: 13, rowH: 0.56 }));
  const feats = [
    ['Идемпотентность', 'Idempotency-Key = eventId: повтор → 200, другое тело → 409'],
    ['Асинхронность', '202 = «надёжно сохранено»; инцидент создаётся за ~1–2 с, статус — через GET'],
    ['Безопасность', 'mTLS по сертификату УЦ банка + OAuth2 client credentials, scope на запись и чтение'],
    ['Ошибки', 'RFC 9457 problem+json: код, поле, traceId для сквозной трассировки']
  ];
  const fw = (CW - 3 * 0.2) / 4;
  feats.forEach((f, i) => {
    const x = M + i * (fw + 0.2);
    box(s, x, 5.5, fw, 1.25, { fill: P.brandSoft, line: null });
    T(s, f[0], x + 0.18, 5.62, fw - 0.36, 0.3, { fontSize: 14, bold: true, color: P.brand });
    T(s, f[1], x + 0.18, 5.95, fw - 0.36, 0.75, { fontSize: 11, color: P.text });
  });
}

// ---------------------------------------------------------------- 13. Коды ответов
{
  const s = content('Коды ответов и реакция адаптера', '09 · API-КОНТРАКТ', 'API и данные');
  const k = (code, when, act, kind) => {
    const c = { ok: P.ok, stop: P.critical, retry: P.major }[kind];
    return [cell(code, { bold: true, color: c, fontFace: 'Courier New', fontSize: 13 }), cell(when), cell(act, { color: c })];
  };
  const rows = [head(['Код', 'Когда', 'Реакция адаптера'])].concat([
    k('202', 'событие принято и сохранено', 'отметить доставленным', 'ok'),
    k('200', 'eventId уже был (DUPLICATE)', 'отметить доставленным', 'ok'),
    k('207', 'пакет: результат по каждому', 'повторить только RETRY', 'ok'),
    k('400', 'битый JSON, нет полей', 'DLQ, без повторов', 'stop'),
    k('401', 'истёк токен / сертификат', 'обновить токен и повторить', 'retry'),
    k('403', 'нет прав, источник не зарегистрирован', 'DLQ + алерт', 'stop'),
    k('404', 'GET: события не было', 'отправить повторно', 'retry'),
    k('409', 'тот же eventId, другое тело', 'DLQ (ошибка адаптера)', 'stop'),
    k('413', 'событие > 64 КБ / пакет > 500', 'раздробить пакет', 'retry'),
    k('422', 'нет услуги/КЕ, неверный формат', 'DLQ + алерт', 'stop'),
    k('429', 'превышен лимит', 'ждать Retry-After', 'retry'),
    k('503', '«Диво» недоступно', 'повтор с backoff, событие в outbox', 'retry')
  ]);
  s.addTable(rows, tableOpts(M, 1.62, 7.0, [0.75, 3.25, 3.0], { fontSize: 12, rowH: 0.395 }));
  const cx = M + 7.3, cw = CW - 7.3;
  const code = [
    'POST /events',
    'Idempotency-Key: 0192f1a4-7c3e-…',
    'Authorization: Bearer eyJ…',
    '',
    '→ 202 Accepted',
    '{',
    '  "eventId": "0192f1a4-…",',
    '  "status": "ACCEPTED",',
    '  "statusUrl": "/events/0192f1a4-…"',
    '}',
    '',
    'GET /events/0192f1a4-…',
    '→ 200 OK',
    '{',
    '  "processingStatus": "INCIDENT_CREATED",',
    '  "incident": { "id": "INC-18493",',
    '                "priority": "P2" }',
    '}'
  ].join('\n');
  s.addText(code, { x: cx, y: 1.62, w: cw, h: 4.85, fontFace: 'Courier New', fontSize: 11, color: 'E6E5E0', fill: { color: '0B0B0B' },
    margin: [10, 14, 10, 14], valign: 'top', isTextBox: true });
  s.addText([
    { text: '● ', options: { color: P.ok } }, { text: 'успех   ', options: { color: P.muted } },
    { text: '● ', options: { color: P.major } }, { text: 'повтор   ', options: { color: P.muted } },
    { text: '● ', options: { color: P.critical } }, { text: 'без повтора → DLQ', options: { color: P.muted } }
  ], { x: cx, y: 6.58, w: cw, h: 0.3, fontSize: 12, margin: 0, isTextBox: true });
}

// ---------------------------------------------------------------- 14. JSON
{
  const s = content('Схема данных: событие отвечает на шесть вопросов «Диво»', '10 · СХЕМА ДАННЫХ', 'API и данные');
  const json = [
    '{',
    '  "specVersion": "1.0",',
    '  "eventId": "0192f1a4-7c3e-7b21-…",',
    '  "eventType": "OPERATION_DELAYED",',
    '  "category": "OPERATION",',
    '  "state": "FIRING",',
    '  "severity": "MAJOR",',
    '  "occurredAt": "2026-10-26T11:30:00+03:00",',
    '  "detectedAt": "2026-10-26T11:47:21+03:00",',
    '  "correlationKey":',
    '     "TREASURY_FX_MM_SETTLEMENT:OPERATION_DELAYED",',
    '  "source":  { "system": "DIASOFT_FA_TREASURY_BACK",',
    '              "module": "SETTLEMENT", "environment": "PROD" },',
    '  "service": { "code": "TREASURY_FX_MM_SETTLEMENT",',
    '              "ciId": "CI-TB-SETTL-01" },',
    '  "operation": { "id": "FX-2026-834724", "type": "FX_SWAP",',
    '                "valueDate": "2026-10-26", "amountClass": "LARGE" },',
    '  "metrics": { "expectedDurationSec": 300,',
    '              "actualDurationSec": 1320, "deviationPct": 340 },',
    '  "sla": { "breached": false, "timeToBreachSec": 13359 },',
    '  "message": "Превышено нормативное время расчёта…",',
    '  "details": { "errorCode": "TB-SETTL-WAIT-ACK", "runbookUrl": "…" }',
    '}'
  ].join('\n');
  s.addText(json, { x: M, y: 1.6, w: 6.15, h: 5.25, fontFace: 'Courier New', fontSize: 10, color: 'E6E5E0', fill: { color: '0B0B0B' },
    margin: [10, 12, 10, 12], valign: 'top', isTextBox: true });
  const q = [
    ['Это новое событие?', 'eventId, sequence', 'идемпотентность, порядок'],
    ['Что случилось и насколько плохо?', 'eventType, state, severity, message', 'правила, приоритет'],
    ['Когда?', 'occurredAt, detectedAt', 'SLA с момента сбоя, MTTD'],
    ['Где и какую услугу задело?', 'source, service.code, ciId', 'КЕ в CMDB, группа назначения'],
    ['Насколько сильно?', 'metrics, sla.timeToBreachSec', 'приоритет, дашборды'],
    ['Что делать?', 'details.errorCode, runbookUrl', 'диагностика 2-й линии']
  ];
  const qx = M + 6.4, qw = CW - 6.4;
  q.forEach((it, i) => {
    const y = 1.6 + i * 0.885;
    box(s, qx, y, qw, 0.78, { shadow: true });
    T(s, it[0], qx + 0.2, y + 0.09, qw - 0.4, 0.3, { fontSize: 13, bold: true });
    s.addText([{ text: it[1], options: { fontFace: 'Courier New', color: P.brand, bold: true } }, { text: '  →  ' + it[2], options: { color: P.muted } }],
      { x: qx + 0.2, y: y + 0.42, w: qw - 0.4, h: 0.3, fontSize: 11, margin: 0, isTextBox: true, valign: 'top' });
  });
}

// ---------------------------------------------------------------- 15. Поля
{
  const s = content('Почему именно эти поля', '10 · СХЕМА ДАННЫХ', 'API и данные');
  const rows = [head(['Поле', 'Польза для «Диво»'])].concat([
    ['service.code + ciId', 'связка технического события с ИТ-услугой каталога — SLA считается по услуге, группа назначения — из КЕ'],
    ['eventId (UUID v7)', 'повтор не создаёт второй инцидент; упорядочен по времени — удобен для индексов'],
    ['state FIRING / RESOLVED', 'инцидент закрывается сам, длительность сбоя для отчёта точная'],
    ['correlationKey', 'однотипные события — в одно оповещение, без «шторма» инцидентов'],
    ['occurredAt / detectedAt', 'SLA с момента сбоя, а не обнаружения; разница — KPI самой интеграции'],
    ['sla.timeToBreachSec', 'сколько осталось до нарушения — главный параметр приоритета'],
    ['operation.valueDate', 'валютирование сегодня → выше приоритет (риск неисполнения)'],
    ['details.runbookUrl', 'дежурный сразу открывает инструкцию']
  ].map(r => [cell(r[0], { fontFace: 'Courier New', bold: true, color: P.brand, fontSize: 12 }), cell(r[1])]));
  s.addTable(rows, tableOpts(M, 1.62, 7.75, [2.45, 5.3], { fontSize: 12, rowH: 0.58 }));
  const rx = M + 8.05, rw = CW - 8.05;
  box(s, rx, 1.62, rw, 2.75, { fill: P.warningBg, line: null });
  T(s, 'Сознательно не передаём', rx + 0.22, 1.78, rw - 0.4, 0.35, { fontSize: 15, bold: true });
  T(s, [
    { text: 'Суммы сделок → класс amountClass', options: { bullet: true, breakLine: true } },
    { text: 'Счета и реквизиты', options: { bullet: true, breakLine: true } },
    { text: 'Контрагентов и ПДн (152-ФЗ)', options: { bullet: true, breakLine: true } },
    { text: 'Полные тексты SWIFT — только код и обезличенный текст ошибки', options: { bullet: true } }
  ], rx + 0.22, 2.2, rw - 0.4, 2.1, { fontSize: 13, paraSpaceAfter: 4 });
  box(s, rx, 4.52, rw, 2.25, { shadow: true });
  T(s, 'Строгая валидация', rx + 0.22, 4.68, rw - 0.4, 0.35, { fontSize: 15, bold: true });
  T(s, [
    { text: 'JSON Schema 2020-12, additionalProperties: false', options: { bullet: true, breakLine: true } },
    { text: 'operation обязателен для OPERATION, metrics — для задержек', options: { bullet: true, breakLine: true } },
    { text: '14 примеров проверяются скриптом validate.py', options: { bullet: true } }
  ], rx + 0.22, 5.08, rw - 0.4, 1.6, { fontSize: 13, paraSpaceAfter: 4 });
}

// ---------------------------------------------------------------- 16–19. Макеты
pres.addSection({ title: 'UX' });
function mockSlide(title, img, ratio, notes) {
  const s = content(title, '11 · UX И МАКЕТЫ', 'UX');
  const h = 5.25, w = h * ratio;
  box(s, M - 0.02, 1.58, w + 0.04, h + 0.04, { line: P.border, r: 0.04 });
  s.addImage({ path: path.join(ROOT, 'figma-plugin/preview', img), x: M, y: 1.6, w, h, altText: title });
  const nx = M + w + 0.35, nw = SW - M - nx;
  notes.forEach((n, i) => {
    const y = 1.6 + i * (h / notes.length);
    numCircle(s, i + 1, nx, y, { d: 0.38, size: 12 });
    T(s, n[0], nx + 0.5, y + 0.02, nw - 0.5, 0.35, { fontSize: 14, bold: true });
    T(s, n[1], nx + 0.5, y + 0.38, nw - 0.5, h / notes.length - 0.5, { fontSize: 12, color: P.muted });
  });
  return s;
}
mockSlide('Экран мониторинга событий — для дежурной смены', '01-Мониторинг-событий.png', 2880 / 2320, [
  ['Статус интеграции', 'heartbeat, очередь и DLQ на виду: тишина — это норма, а не обрыв связи'],
  ['SLA под угрозой', 'отдельный KPI и колонка «осталось 22 мин» — что спасать первым'],
  ['Группировка', 'по correlationKey: один сбой — одна строка, а не 50'],
  ['Автозакрытие', 'устранённые приглушены и закрыты по RESOLVED']
]);
mockSlide('Карточка события — что случилось и сколько осталось', '02-Карточка-события.png', 2880 / 2320, [
  ['Шкала до дедлайна', 'старт → норматив → сейчас → дедлайн SLA: запас времени виден сразу'],
  ['Хронология', 'Diasoft, адаптер и «Диво» в одной ленте: эскалация WARNING → CRITICAL и создание инцидента за секунды'],
  ['Всё для 2-й линии', 'КЕ, экземпляр, задание, eventId, исходный JSON, инструкция'],
  ['Одно действие', 'инцидент уже создан — «Открыть инцидент»']
]);
mockSlide('Дашборд «Диво Мера» — для владельца услуги', '03-Дашборд-Диво-Мера.png', 2880 / 1696, [
  ['Эффект на виду', 'доступность против цели, % операций в нормативе, MTTD и MTTR'],
  ['30 дней по услугам', 'полоса дней с инцидентами: какая услуга болеет систематически'],
  ['Тренд событий', 'разбивка по критичности за 14 дней'],
  ['Причины', 'топ причин — основа решений о доработках']
]);
{
  const s = content('Виджет портала и UI Kit', '11 · UX И МАКЕТЫ', 'UX');
  const h1 = 5.25, w1 = h1 * 960 / 1356;
  s.addImage({ path: path.join(ROOT, 'figma-plugin/preview/04-Виджет-Диво-Портал.png'), x: M, y: 1.6, w: w1, h: h1, altText: 'Виджет «Диво Портала»' });
  const x2 = M + w1 + 0.4, w2 = SW - M - x2, h2 = w2 * 780 / 1560;
  box(s, x2 - 0.02, 1.58, w2 + 0.04, h2 + 0.04, { fill: P.white, line: P.border, r: 0.04 });
  s.addImage({ path: path.join(ROOT, 'presentation/assets/kit-foundations.png'), x: x2, y: 1.6, w: w2, h: h2, altText: 'UI Kit: основы' });
  T(s, 'UI Kit в Figma: 74 переменные, 11 стилей текста, 75 компонентов с вариантами. Устройство — как у генератора «ФОЛК», визуальный язык — как у отчёта о деградациях сервисов.', x2, 1.6 + h2 + 0.25, w2, 0.75, { fontSize: 13 });
  T(s, 'Виджет слева: «известная проблема» с номером инцидента и сроком — меньше звонков в поддержку во время сбоя.', x2, 1.6 + h2 + 1.05, w2, 0.55, { fontSize: 12, color: P.muted });
}

// ---------------------------------------------------------------- 20. НФТ
pres.addSection({ title: 'Эффект' });
{
  const s = content('Нефункциональные требования и безопасность', '12 · НФТ И БЕЗОПАСНОСТЬ', 'Эффект');
  const tiles = [
    ['≤ 60 с', 'p95: от обнаружения до приёма в «Диво»'],
    ['0', 'потерянных событий: outbox, повторы, DLQ'],
    ['≥ 50 / с', 'событий в пике закрытия дня, пакет до 500'],
    ['2', 'экземпляра адаптера, active-standby'],
    ['60 с', 'heartbeat; 3 пропуска → «нет данных»'],
    ['7 дней', 'хранение доставленных событий для разборов']
  ];
  const tw = 2.35, th = 1.55;
  tiles.forEach((t, i) => {
    const x = M + (i % 3) * (tw + 0.2), y = 1.65 + Math.floor(i / 3) * (th + 0.2);
    box(s, x, y, tw, th, { fill: P.bg, line: null });
    T(s, t[0], x + 0.2, y + 0.18, tw - 0.4, 0.6, { fontSize: 28, bold: true, color: P.brand });
    T(s, t[1], x + 0.2, y + 0.82, tw - 0.4, 0.65, { fontSize: 12, color: P.text });
  });
  T(s, 'Сложность реализации: адаптер — обычный сервис (Java/Spring Boot или .NET 8 + PostgreSQL), без брокера и без доработок Diasoft.',
    M, 5.3, 3 * tw + 0.4, 0.8, { fontSize: 13, color: P.muted });
  const sx = M + 3 * tw + 0.75, sw = CW - (3 * tw + 0.75);
  box(s, sx, 1.65, sw, 4.95, { shadow: true });
  T(s, 'Безопасность', sx + 0.25, 1.85, sw - 0.5, 0.4, { fontSize: 18, bold: true });
  T(s, [
    { text: 'mTLS по сертификату УЦ банка + OAuth2 client credentials с минимальными scope', options: { bullet: true, breakLine: true } },
    { text: 'Учётная запись Diasoft — только чтение нужных представлений реплики', options: { bullet: true, breakLine: true } },
    { text: 'Минимизация данных: без сумм, счетов, контрагентов и ПДн', options: { bullet: true, breakLine: true } },
    { text: 'Аудит всех вызовов в API Gateway, сквозной X-Request-Id', options: { bullet: true, breakLine: true } },
    { text: 'Секреты — в хранилище секретов банка, не в конфигурации', options: { bullet: true } }
  ], sx + 0.25, 2.35, sw - 0.5, 4.1, { fontSize: 14, paraSpaceAfter: 8 });
}

// ---------------------------------------------------------------- 21. Эффект
{
  const s = content('Ожидаемый эффект', '13 · ЭФФЕКТ', 'Эффект');
  const rows = [head(['Показатель', 'Сейчас (оценка)', 'После интеграции', 'За счёт чего'])].concat([
    ['Время обнаружения сбоя', '15–40 мин', '≤ 2 мин', 'опрос 30 с + push'],
    ['Инциденты, созданные автоматически', '≈ 0 %', '≥ 80 %', 'правила событие → инцидент'],
    ['Время восстановления', '—', '−20–30 %', 'в инциденте сразу операция, КЕ, ошибка, инструкция'],
    ['Полнота SLA-отчёта', 'только сбои, о которых сообщили', '100 % сбоев', 'пара FIRING / RESOLVED'],
    ['Звонки в поддержку при известном сбое', 'каждый пострадавший', '−50 %', 'виджет на «Диво Портале»'],
    ['Ручная регистрация дежурным', '5–10 мин на инцидент', '0', 'автоматическое создание']
  ].map(r => [cell(r[0], { bold: true }), cell(r[1], { color: P.muted }), cell(r[2], { bold: true, color: P.ok, fontSize: 15 }), cell(r[3], { color: P.muted })]));
  s.addTable(rows, tableOpts(M, 1.62, CW, [3.4, 2.75, 2.15, 3.83], { fontSize: 13, rowH: 0.58 }));
  const q = [
    ['Меньше финансовых рисков', 'расчёт успевают исправить до cut-off — нет неисполненных обязательств'],
    ['Данные для улучшений', 'статистика причин показывает, какие узлы дорабатывать'],
    ['Тиражируемость', 'адаптер и контракт подходят для других бэк-офисных систем банка']
  ];
  const qw = (CW - 2 * 0.25) / 3;
  q.forEach((it, i) => {
    const x = M + i * (qw + 0.25);
    box(s, x, 5.85, qw, 0.95, { fill: P.brandSoft, line: null });
    T(s, it[0], x + 0.2, 5.93, qw - 0.4, 0.3, { fontSize: 13, bold: true, color: P.brand });
    T(s, it[1], x + 0.2, 6.23, qw - 0.4, 0.55, { fontSize: 11 });
  });
}

// ---------------------------------------------------------------- 22. План
{
  const s = content('План внедрения: от MVP до тиражирования', '14 · ВНЕДРЕНИЕ', 'Эффект');
  const st = [
    ['Согласование', '2 нед.', 'каталог событий, нормативы, услуги и КЕ в CMDB, доступ к реплике'],
    ['MVP', '4–6 нед.', '4 ключевых события, /events и /heartbeat, экран мониторинга'],
    ['Теневой пилот', '4 нед.', 'события идут в «Диво» без инцидентов; калибровка порогов'],
    ['Эксплуатация', '2 нед.', 'автоинциденты, SLA-таймеры, карточка события, виджет портала'],
    ['Развитие', 'далее', '/metrics и «Мера», остальные события, другие системы, брокер при росте']
  ];
  const w = (CW - 4 * 0.2) / 5;
  s.addShape(pres.shapes.LINE, { x: M + 0.25, y: 2.0, w: CW - 0.5, h: 0, line: { color: P.border, width: 2 } });
  st.forEach((x0, i) => {
    const x = M + i * (w + 0.2);
    numCircle(s, i, x, 1.78, { d: 0.46, size: 14, fill: i === 2 ? P.major : P.brand });
    T(s, x0[0], x, 2.45, w, 0.4, { fontSize: 17, bold: true });
    chip(s, x0[1], x, 2.9, 1.0, { fill: P.bg, color: P.muted, h: 0.3, size: 11 });
    T(s, x0[2], x, 3.35, w - 0.1, 1.3, { fontSize: 13, color: P.text });
  });
  box(s, M, 4.95, CW, 1.45, { fill: P.majorBg, line: null });
  T(s, 'Почему теневой пилот', M + 0.3, 5.1, 4, 0.35, { fontSize: 15, bold: true, color: P.major });
  T(s, 'Главный риск мониторинга — «шторм» ложных инцидентов из-за неверных порогов. Месяц событий без создания инцидентов позволяет откалибровать нормативы на реальных данных и сверить их с ручными обращениями.',
    M + 0.3, 5.5, CW - 0.6, 1.1, { fontSize: 13 });
}

// ---------------------------------------------------------------- 23. Итог
{
  const s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle: 'Эффект' });
  T(s, 'Итог', M, 0.7, 8, 0.7, { fontSize: 36, bold: true, color: P.white });
  const pts = [
    ['Концепция', 'гибрид: push событий, метрики по расписанию, heartbeat'],
    ['Архитектура', 'адаптер с outbox, повторами, DLQ; Diasoft без доработок'],
    ['API', '5 endpoints, OpenAPI 3.1, идемпотентность, коды ответов'],
    ['Данные', 'JSON Schema, 6 вопросов «Диво», минимизация данных'],
    ['UX', 'мониторинг, карточка события, дашборд «Мера», виджет портала'],
    ['Эффект', 'обнаружение ≤ 2 мин, ≥ 80 % автоинцидентов, полный SLA-отчёт']
  ];
  pts.forEach((p, i) => {
    const x = M + (i % 2) * 6.15, y = 1.75 + Math.floor(i / 2) * 1.2;
    numCircle(s, i + 1, x, y, { fill: P.white, color: P.dark, d: 0.46, size: 14 });
    T(s, p[0], x + 0.65, y - 0.02, 5.3, 0.35, { fontSize: 17, bold: true, color: P.white });
    T(s, p[1], x + 0.65, y + 0.35, 5.3, 0.6, { fontSize: 13, color: P.sideText });
  });
  s.addShape(pres.shapes.LINE, { x: M, y: 5.5, w: CW, h: 0, line: { color: '3A3A38', width: 1 } });
  s.addText([
    { text: 'Репозиторий: ', options: { color: P.sideText } }, { text: REPO, options: { color: P.mint, bold: true, breakLine: true } },
    { text: 'Макеты Figma: ', options: { color: P.sideText } }, { text: FIGMA, options: { color: P.mint, bold: true } }
  ], { x: M, y: 5.7, w: 8.5, h: 0.8, fontSize: 14, margin: 0, isTextBox: true, valign: 'top' });
  T(s, AUTHOR, SW - M - 4.5, 5.7, 4.5, 0.4, { fontSize: 14, color: P.white, align: 'right' });
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  if (APPLY_THEME) { const { applyTheme } = require(APPLY_THEME); await applyTheme(OUT, THEME); }
  console.log('written', OUT);
})();
