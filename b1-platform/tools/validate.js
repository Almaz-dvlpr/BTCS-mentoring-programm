// Проверка данных курса: node tools/validate.js
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => s.startsWith('js/data/') || s === 'js/util.js');
const ctx = { console, Math, Date }; ctx.window = ctx; ctx.document = undefined;
vm.createContext(ctx);
scripts.forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const { JP } = ctx; const D = JP.data; let errors = 0;
const err = m => { errors++; console.log('✗', m); };
if (D.egTitles.length !== 115) err('egTitles != 115: ' + D.egTitles.length);
const ids = new Set(D.egTitles.map((_, i) => 'eg-' + (i + 1)).concat(D.muList.map(x => 'mu-' + x[0])));
let nEx = 0;
Object.values(D.lessons).forEach(l => {
  if (!ids.has(l.id)) err('lesson not in curriculum: ' + l.id);
  if (!l.rule || l.rule.length < 80) err(l.id + ': empty rule');
  if (l.ex.length < 6) err(l.id + ': <6 exercises');
  l.ex.forEach((e, i) => {
    nEx++;
    const w = l.id + ' #' + (i + 1) + ' ';
    if (e.t === 'gap') {
      if (!e.a.length || e.a.some(a => !a.trim())) err(w + 'empty answer');
      if (!/___/.test(e.q)) err(w + 'no blank: ' + e.q);
      e.a.forEach(a => { if (JP.U.norm(a) === '') err(w + 'answer normalises to empty'); });
    } else if (e.t === 'mc') {
      if (!(e.a >= 0 && e.a < e.o.length)) err(w + 'bad mc index');
      if (new Set(e.o).size !== e.o.length) err(w + 'duplicate options');
    } else if (e.t === 'ord') {
      if (e.s.split(' ').length < 3) err(w + 'short ord');
    } else err(w + 'unknown type');
  });
});
// сценарии речевой практики
Object.entries(D.speak || {}).forEach(([id, sp]) => {
  if (!D.lessons[id]) err('speak: нет урока ' + id);
  if (!sp.say || sp.say.length < 4) err('speak ' + id + ': меньше 4 образцов для повтора');
  if (!sp.subs || sp.subs.length < 3) err('speak ' + id + ': меньше 3 подстановок');
  if (!sp.tasks || sp.tasks.length < 2) err('speak ' + id + ': меньше 2 ситуаций');
  const en = [].concat(sp.say, (sp.subs || []).map(x => x.m), (sp.tasks || []).map(x => x.m));
  en.forEach(t => { if (!t || /[А-Яа-яЁё]/.test(t)) err('speak ' + id + ': образец пустой или не по-английски: ' + t); });
  (sp.subs || []).forEach(x => { if (!/[А-Яа-яЁё]/.test(x.c)) err('speak ' + id + ': подсказка без русского: ' + x.c); });
});
if (Object.keys(D.speak || {}).length < 12) err('speak: сценариев меньше 12');
const pl = D.placement;
pl.forEach((p, i) => { if (!(p.a >= 0 && p.a < p.o.length)) err('placement #' + (i + 1) + ' bad index'); if (!ids.has(p.u)) err('placement unit ' + p.u); });
const seen = new Set();
D.vocab.forEach(v => v.words.forEach(w => { if (seen.has(w.id)) err('dup word id ' + w.id); seen.add(w.id); }));
const irr = D.irregular, ib = new Set();
irr.forEach(v => { if (ib.has(v.b)) err('дубль глагола ' + v.b); ib.add(v.b); if (!v.b || !v.p || !v.pp || !v.ru) err('неполный глагол ' + JSON.stringify(v)); });
if (D.irregularSets !== Math.ceil(irr.length / 10)) err('число наборов глаголов');
console.log(`уроков с упражнениями: ${Object.keys(D.lessons).length}, упражнений: ${nEx}, слов: ${seen.size}, вопросов теста: ${pl.length}, неправильных глаголов: ${irr.length}`);
console.log(errors ? errors + ' ошибок' : 'OK');
process.exit(errors ? 1 : 0);
