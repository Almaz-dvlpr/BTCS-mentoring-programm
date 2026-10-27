// Тест раздела «Неправильные глаголы»: node tools/verbs-test.js
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET/.test(m.text()) && errs.push(m.text()));
  await p.goto(url + '#/welcome');
  await p.evaluate(() => { const s = JP.store.get(), t = JP.U.today(); s.profile = { name: 'Анна', reasons: [], difficulties: [], daysPerWeek: 7, studyDays: [0,1,2,3,4,5,6], minutesPerDay: 30, bestTime: 'evening', formats: [], liveLessons: 0, liveDays: [], hasBooks: 'all', tone: 'soft', startedAt: t }; s.placement = { done: true, stage: 1, by: { A1: { n: 8, ok: 2 }, A2: { n: 10, ok: 0 }, 'A2+': { n: 6, ok: 0 }, B1: { n: 6, ok: 0 } }, wrong: [] }; JP.E.invalidate(); JP.store.save(); const orig = JP.runQuiz; JP.runQuiz = (r, qs, o) => { window.__qs = qs; return orig(r, qs, o); }; });
  const solve = async wrongEvery => { for (let g = 0; g < 80; g++) { const c = await p.locator('.qcount span').first().textContent({ timeout: 1200 }).catch(() => null); if (!c) return; const i = +c.match(/Вопрос (\d+)/)[1] - 1; const q = await p.evaluate(i => window.__qs[i], i); const wrong = wrongEvery && (i + 1) % wrongEvery === 0;
    if (q.t === 'vtype') { await p.fill('.qinput', wrong ? 'zzz' : q.a[q.a.length - 1]); await p.keyboard.press('Enter'); } else { const n = await p.locator('.opt').count(); await p.locator('.opt').nth(wrong ? (q.a + 1) % n : q.a).click(); } await p.click('[data-act=next]'); } };
  const items = await p.evaluate(() => JP.E.items().filter(i => i.kind === 'irregular').map(i => i.id + ':' + i.stage));
  ok(items.length === 14, 'в маршрут добавлено 14 наборов глаголов: ' + items.slice(0, 4).join(', ') + '…');
  ok(items.filter(i => i.endsWith(':1')).length === 3 && items.filter(i => i.endsWith(':2')).length === 5, 'наборы распределены по этапам (1: три, 2: пять)');
  // набор 1
  await p.goto(url + '#/unit/irr-1'); await p.waitForSelector('.irr-row'); ok(await p.locator('.irr-row').count() === 10, 'набор показывает 10 глаголов с тремя формами');
  await p.click('#go'); await solve(5); await p.waitForSelector('.emoji-xl');
  const st = await p.evaluate(() => ({ cards: Object.keys(JP.store.get().cards).filter(k => k.startsWith('irr:')).length, done: JP.E.isDone('irr-1'), words: JP.E.learnedWords(), irr: JP.E.irrStats() }));
  ok(st.cards === 20 && st.done && st.words === 0 && st.irr.learned === 10, 'после набора: 20 карточек, набор пройден, обычные слова не затронуты');
  // повторение через общий SRS
  await p.evaluate(() => { Object.entries(JP.store.get().cards).forEach(([id, c]) => { c.due = JP.U.today(); c.box = id.endsWith(':p') ? 3 : 1; }); JP.store.save(); });
  await p.goto(url + '#/words'); await p.waitForSelector('#srs'); ok(await p.locator('a[href="#/verbs"]').count() === 1, 'на странице «Слова» есть вход в неправильные глаголы');
  await p.click('#srs'); await solve(0); await p.waitForSelector('.emoji-xl'); ok(true, 'повторение карточек глаголов (ввод и выбор) проходит без ошибок');
  // справочник и экзамен
  await p.goto(url + '#/verbs'); await p.waitForSelector('#list .irr-row');
  ok(await p.locator('#list .irr-row').count() === 140, 'справочник содержит все 140 глаголов');
  await p.fill('#q', 'идти'); ok(await p.locator('#list .irr-row').count() >= 1, 'поиск по переводу работает'); await p.fill('#q', '');
  await p.click('#exam'); await solve(4); await p.waitForSelector('.emoji-xl');
  const cp = await p.evaluate(() => JP.store.get().checkpoints.filter(c => c.type === 'irregular'));
  ok(cp.length === 1 && cp[0].n === 30, 'экзамен (15 глаголов × 2 формы) записан в историю проверок');
  await p.goto(url + '#/progress'); await p.waitForSelector('.dash'); ok(await p.locator('text=Неправильные глаголы').count() >= 1, 'экзамен виден в дашборде прогресса');
  ok(errs.length === 0, 'нет ошибок в консоли' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' проверок не пройдено' : 'Все проверки пройдены'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
