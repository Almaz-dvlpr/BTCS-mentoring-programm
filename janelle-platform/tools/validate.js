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
const pl = D.placement;
pl.forEach((p, i) => { if (!(p.a >= 0 && p.a < p.o.length)) err('placement #' + (i + 1) + ' bad index'); if (!ids.has(p.u)) err('placement unit ' + p.u); });
const seen = new Set();
D.vocab.forEach(v => v.words.forEach(w => { if (seen.has(w.id)) err('dup word id ' + w.id); seen.add(w.id); }));
console.log(`уроков с упражнениями: ${Object.keys(D.lessons).length}, упражнений: ${nEx}, слов: ${seen.size}, вопросов теста: ${pl.length}`);
console.log(errors ? errors + ' ошибок' : 'OK');
process.exit(errors ? 1 : 0);
