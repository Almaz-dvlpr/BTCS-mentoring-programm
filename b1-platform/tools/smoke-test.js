// Сквозной тест в настоящем браузере: node tools/smoke-test.js
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
let fails = 0;
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };

async function answerQuiz(page, getAnswer, wrongEvery) {
  for (let guard = 0; guard < 80; guard++) {
    const cnt = await page.locator('.qcount span').first().textContent({ timeout: 1200 }).catch(() => null);
    if (!cnt) return;
    const m = cnt.match(/Вопрос (\d+) из (\d+)/); if (!m) return;
    const type = await page.locator('.qtype').textContent();
    const a = await getAnswer(page, type, +m[1] - 1);
    const wrong = wrongEvery && (+m[1]) % wrongEvery === 0;
    if (a.kind === 'gap') { await page.fill('.qinput', wrong ? 'zzz' : a.text); await page.keyboard.press('Enter'); }
    else if (a.kind === 'mc') { const n = await page.locator('.opt').count(); await page.locator('.opt').nth(wrong ? (a.idx + 1) % n : a.idx).click(); }
    else if (a.kind === 'ord') {
      const words = wrong ? a.text.split(' ').reverse() : a.text.split(' ');
      for (const w of words) { const t = page.locator('#pool .tile', { hasText: new RegExp('^' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).first(); await t.click(); }
      await page.click('[data-act=check]');
    }
    await page.click('[data-act=next]');
  }
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET/.test(m.text())) errors.push(m.text()); });
  await page.goto(url);
  await page.waitForSelector('#chat');
  ok(page.url().endsWith('#/welcome'), 'пустой профиль → знакомство');

  // опросник
  const step = async (fn) => { await page.waitForSelector('#ans button, #ans input', { timeout: 4000 }); await fn(); };
  await step(async () => { await page.fill('#in', 'Анна'); await page.click('#ok'); });
  await step(async () => { await page.click('.choice >> nth=1'); await page.click('.choice >> nth=2'); await page.click('#ok'); }); // reasons
  await step(async () => { await page.click('.choice >> nth=1'); }); // self level
  await step(async () => { await page.click('.choice >> nth=0'); await page.click('#ok'); }); // difficulties
  await step(async () => { await page.click('.choice >> nth=5'); }); // 7 days
  await step(async () => { await page.click('#ok'); }); // default days
  await step(async () => { await page.click('.choice >> nth=2'); }); // 30 min
  await step(async () => { await page.click('.choice >> nth=2'); }); // evening (after react msg)
  await step(async () => { await page.click('.choice >> nth=0'); }); // device
  await step(async () => { await page.click('.choice >> nth=0'); await page.click('#ok'); }); // formats
  await step(async () => { await page.click('.choice >> nth=1'); }); // live 1
  await step(async () => { await page.click('.choice.day >> nth=2'); await page.click('#ok'); }); // live day
  await step(async () => { await page.click('.choice >> nth=1'); }); // deadline: date
  await step(async () => { const d = new Date(); d.setDate(d.getDate() + 120); await page.fill('#in', d.toISOString().slice(0, 10)); await page.click('#ok'); });
  await step(async () => { await page.click('.choice >> nth=0'); }); // books
  await step(async () => { await page.click('.choice >> nth=2'); }); // tone fun
  await step(async () => { await page.click('#go'); });
  ok(page.url().endsWith('#/placement'), 'после опросника → диагностика');
  let prof = await page.evaluate(() => JP.store.get().profile);
  ok(prof && prof.daysPerWeek === 7 && prof.minutesPerDay === 30 && prof.tone === 'fun' && prof.liveDays.length === 1 && prof.deadline, 'профиль сохранён: ' + JSON.stringify({ d: prof.daysPerWeek, m: prof.minutesPerDay, t: prof.tone, live: prof.liveDays, dl: prof.deadline }));

  // диагностика: A1 верно, остальное «не знаю» → этап 2
  await page.click('#go');
  for (let i = 0; i < 30; i++) {
    const lvl = await page.evaluate(i => JP.data.placement[i].l, i);
    const a = await page.evaluate(i => JP.data.placement[i].a, i);
    if (lvl === 'A1' || (lvl === 'A2' && i < 15)) await page.locator('.opt').nth(a).click(); else await page.locator('.opt').last().click();
  }
  await page.waitForSelector('text=вот твой маршрут');
  const pl = await page.evaluate(() => JP.store.get().placement);
  ok(pl.done && pl.stage >= 1 && pl.stage <= 4, 'диагностика → этап ' + pl.stage);
  ok(await page.locator('text=Сколько это займёт').count() === 1, 'экран плана с оценкой срока');
  const ics = await page.evaluate(() => JP.E.icsFor());
  ok(/BEGIN:VCALENDAR/.test(ics) && /RRULE:FREQ=WEEKLY/.test(ics), 'календарь .ics формируется');
  await page.click('text=Начать с первого занятия');

  // главная
  await page.waitForSelector('.task');
  const tasks = await page.evaluate(() => JP.E.day(JP.U.today()).tasks.map(t => t.type + ':' + (t.ref || '')));
  ok(tasks.length >= 1, 'план дня: ' + tasks.join(', '));

  // проходим весь план дня правильно (с одной ошибкой на урок)
  const getAnswer = async (pg, type, idx) => {
    return pg.evaluate(([type, idx]) => {
      const el = document.querySelector('.qtext'); const label = document.querySelector('.qcount span').textContent;
      return { label, html: el ? el.innerText : '' };
    }, [type, idx]).then(async info => {
      if (type.includes('Впиши слово') || type.includes('Напиши')) { const ans = await pg.evaluate(() => window.__cur && window.__cur.a); return { kind: 'gap', text: ans[0] }; }
      return null;
    });
  };
  // Подмена: получаем текущий вопрос напрямую из рантайма через перехват runQuiz
  await page.evaluate(() => { const orig = JP.runQuiz; JP.runQuiz = function (root, qs, o) { window.__qs = qs; return orig(root, qs, o); }; });
  const solve = async (wrongEvery) => {
    await answerQuiz(page, async (pg, type, idx) => {
      const q = await pg.evaluate(i => window.__qs[i], idx);
      if (q.t === 'gap' || q.t === 'vtype' || q.t === 'listen') return { kind: 'gap', text: q.a[0] };
      if (q.t === 'mc' || q.t === 'vmc') return { kind: 'mc', idx: q.a };
      return { kind: 'ord', text: q.s };
    }, wrongEvery);
  };
  let guard = 0;
  while (guard++ < 8) {
    await page.goto(url + '#/'); await page.waitForSelector('h1');
    const hasNext = await page.locator('a.btn.primary:has-text("Начать"), a.btn.primary:has-text("Продолжить")').count();
    if (!hasNext) break;
    await page.click('a.btn.primary:has-text("Начать"), a.btn.primary:has-text("Продолжить")');
    await page.waitForTimeout(150);
    const h = page.url();
    // каждая задача: может быть урок (кнопка «К упражнениям»), слова («Проверить себя»), письмо, книга или квиз
    if (await page.locator('#go:has-text("упражнениям"), #go:has-text("Повторить упражнения")').count()) { await page.click('#go'); await solve(4); }
    else if (await page.locator('#go:has-text("Проверить себя")').count()) { await page.click('#go'); await solve(0); }
    else if (await page.locator('#send').count()) { await page.fill('#wr', 'My name is Anna and I am from a small city. I like music and I read books every evening.'); await page.click('#send'); }
    else if (await page.locator('[data-s]').count()) { await page.click('[data-s="0.85"]'); }
    else if (await page.locator('.qcount').count()) { await solve(0); }
    await page.waitForSelector('.emoji-xl', { timeout: 5000 }).catch(() => {});
    ok(await page.locator('.emoji-xl').count() === 1, 'экран результата после задачи (' + h.split('#')[1] + ')');
  }
  const st = await page.evaluate(() => ({ done: Object.keys(JP.store.get().units).filter(k => JP.store.get().units[k].status === 'done').length, min: JP.E.day(JP.U.today()).minutes, cards: Object.keys(JP.store.get().cards).length, tasks: JP.E.day(JP.U.today()).tasks.map(t => t.done) }));
  ok(st.done > 0 && st.tasks.every(Boolean), 'весь план дня выполнен: ' + JSON.stringify(st));
  await page.goto(url + '#/'); await page.waitForSelector('h1');
  ok(await page.locator('text=План на сегодня выполнен').count() > 0 || await page.locator('text=Всё сделано').count() > 0 || await page.locator('text=Эми аплодирует').count() > 0, 'ассистент поздравляет с выполненным планом');

  // экраны
  for (const r of ['plan', 'words', 'progress', 'more']) {
    await page.goto(url + '#/' + r); await page.waitForSelector('h1');
    ok(await page.locator('h1').count() >= 1, 'экран /' + r + ' открывается');
  }
  // следующий день: имитация — сдвигаем даты назад и проверяем повторения
  await page.evaluate(() => { const s = JP.store.get(); const shift = d => JP.U.addDays(d, -2); Object.values(s.cards).forEach(c => { c.due = shift(c.due); }); Object.values(s.units).forEach(u => { if (u.next) u.next = shift(u.next); }); s.days = {}; JP.store.save(); });
  await page.goto(url + '#/'); await page.waitForSelector('h1');
  const t2 = await page.evaluate(() => JP.E.day(JP.U.today()).tasks.map(t => t.type));
  ok(t2.includes('srs') || t2.includes('greview'), 'на следующий день появились повторения: ' + t2.join(','));
  // пропуск дней → ассистент не ругается
  const missed = await page.evaluate(() => JP.E.missedScheduledDays());
  console.log('  (пропущено запланированных дней: ' + missed + ')');


  // ---------- Сценарий 2: новичок, все типы занятий ----------
  const page2 = await (await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' })).newPage();
  page2.on('pageerror', e => errors.push('p2: ' + e.message)); page2.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET/.test(m.text())) errors.push('p2: ' + m.text()); });
  await page2.goto(url + '#/welcome');
  await page2.evaluate(() => {
    const s = JP.store.get(); const t = JP.U.today();
    s.profile = { name: 'Анна', reasons: ['travel'], selfLevel: 'zero', difficulties: [], daysPerWeek: 7, studyDays: [0, 1, 2, 3, 4, 5, 6], minutesPerDay: 45, bestTime: 'evening', device: 'phone', formats: [], liveLessons: 0, liveDays: [], deadline: null, hasBooks: 'all', tone: 'soft', startedAt: t };
    s.placement = { done: true, stage: 1, by: { 'A1': { n: 8, ok: 2 }, 'A2': { n: 10, ok: 0 }, 'A2+': { n: 6, ok: 0 }, 'B1': { n: 6, ok: 0 } }, wrong: [], answers: [], takenAt: t };
    JP.store.save();
  });
  await page2.goto(url + '#/'); await page2.waitForSelector('h1');
  await page2.evaluate(() => { const orig = JP.runQuiz; JP.runQuiz = function (root, qs, o) { window.__qs = qs; return orig(root, qs, o); }; });
  const solve2 = async (wrongEvery) => {
    await answerQuiz(page2, async (pg, type, idx) => {
      const q = await pg.evaluate(i => window.__qs[i], idx);
      if (q.t === 'gap' || q.t === 'vtype' || q.t === 'listen') return { kind: 'gap', text: q.a[0] };
      if (q.t === 'mc' || q.t === 'vmc') return { kind: 'mc', idx: q.a };
      return { kind: 'ord', text: q.s };
    }, wrongEvery);
  };
  // слова
  await page2.goto(url + '#/unit/voc-1'); await page2.waitForSelector('#go');
  ok(await page2.locator('.word').count() >= 10, 'тема со словами: список слов');
  await page2.click('#go'); await solve2(5); await page2.waitForSelector('.emoji-xl');
  const cards = await page2.evaluate(() => Object.keys(JP.store.get().cards).length);
  ok(cards >= 10, 'слова добавлены в карточки: ' + cards);
  // повторение слов (карточки с ошибками стали due сегодня)
  await page2.goto(url + '#/words'); await page2.waitForSelector('#srs');
  await page2.click('#srs'); await solve2(0); await page2.waitForSelector('.emoji-xl');
  ok(true, 'повторение слов пройдено');
  // книга
  await page2.goto(url + '#/unit/eg-3'); await page2.waitForSelector('[data-s]'); await page2.click('[data-s="0.97"]'); await page2.waitForSelector('.emoji-xl');
  ok(await page2.evaluate(() => JP.E.isDone('eg-3')), 'урок «по книге» отмечается');
  // письмо
  await page2.goto(url + '#/unit/w-1'); await page2.waitForSelector('#wr');
  await page2.fill('#wr', 'short'); await page2.click('#send');
  ok(await page2.evaluate(() => JP.store.get().writings.length === 0), 'короткий текст не отправляется');
  await page2.fill('#wr', 'My name is Anna. I am twenty five years old. I live in a big city and I like music.'); await page2.click('#send'); await page2.waitForSelector('.emoji-xl');
  ok(await page2.evaluate(() => JP.store.get().writings.length === 1), 'письменная работа сохранена для преподавателя');
  // этап 2 закрыт, пока не пройден этап 1
  await page2.goto(url + '#/unit/eg-16'); await page2.waitForSelector('h1');
  ok(await page2.locator('text=пока закрыт').count() === 1, 'этап 2 заблокирован до теста этапа 1');
  // завершаем этап 1 → тест этапа
  await page2.evaluate(() => { const s = JP.store.get(); JP.E.roadmap()[0].items.forEach(it => { if (!JP.E.isDone(it.id)) JP.E.completeUnit(it.id, 0.9); }); s.days = {}; JP.store.save(); });
  await page2.goto(url + '#/'); await page2.waitForSelector('h1');
  const types = await page2.evaluate(() => JP.E.day(JP.U.today()).tasks.map(t => t.type));
  ok(types.includes('stagetest'), 'после этапа 1 в плане итоговый тест: ' + types.join(','));
  const stId = await page2.evaluate(() => JP.E.day(JP.U.today()).tasks.find(t => t.type === 'stagetest').id);
  await page2.goto(url + '#/do/' + stId); await page2.waitForSelector('.qcard'); await solve2(0); await page2.waitForSelector('.emoji-xl');
  ok(await page2.evaluate(() => JP.E.unlockedStage() === 2), 'тест этапа 1 пройден → этап 2 открыт');
  await page2.evaluate(() => { const s = JP.store.get(); s.checkpoints.forEach(c => { c.date = JP.U.addDays(c.date, -8); }); s.days = {}; JP.store.save(); });
  await page2.goto(url + '#/'); await page2.waitForSelector('h1');
  const types2 = await page2.evaluate(() => JP.E.day(JP.U.today()).tasks.map(t => t.type));
  ok(types2.includes('checkpoint'), 'через неделю предлагается недельная проверка: ' + types2.join(','));
  const cpId = await page2.evaluate(() => JP.E.day(JP.U.today()).tasks.find(t => t.type === 'checkpoint').id);
  await page2.goto(url + '#/do/' + cpId); await page2.waitForSelector('.qcard'); await solve2(3); await page2.waitForSelector('.emoji-xl');
  ok(await page2.evaluate(() => JP.store.get().checkpoints.length >= 2), 'проверки записаны в историю');
  // «только 10 минут»
  await page2.goto(url + '#/'); await page2.waitForSelector('#short'); await page2.click('#short');
  ok(await page2.evaluate(() => JP.E.day(JP.U.today()).budget === 10), 'режим «10 минут» работает');
  // кабинет преподавателя читает файл
  const dump = await page2.evaluate(() => JP.store.exportJSON());
  require('fs').writeFileSync('/tmp/b1-export.json', dump);
  await page2.screenshot({ path: '/tmp/shot-home.png' });

  ok(errors.length === 0, 'нет ошибок в консоли' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? `\n${fails} проверок не пройдено` : '\nВсе проверки пройдены');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
