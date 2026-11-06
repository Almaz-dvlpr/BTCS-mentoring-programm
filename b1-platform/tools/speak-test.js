// Тест речевой практики «Скажи вслух»: node tools/speak-test.js
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };

(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|Failed to load resource/.test(m.text()) && errs.push(m.text()));
  await p.goto(url); await p.waitForSelector('#chat, h1');
  // профиль и диагностика, как после знакомства
  await p.evaluate(() => {
    const s = JP.store.get(), t = JP.U.today();
    s.profile = { name: 'Тест', reasons: [], difficulties: [], daysPerWeek: 7, studyDays: [0, 1, 2, 3, 4, 5, 6], minutesPerDay: 45, bestTime: 'evening', formats: [], liveLessons: 0, liveDays: [], hasBooks: 'all', tone: 'soft', startedAt: t };
    s.placement = { done: true, stage: 1, by: { A1: { n: 8, ok: 5 }, A2: { n: 10, ok: 1 }, 'A2+': { n: 6, ok: 0 }, B1: { n: 6, ok: 0 } }, wrong: [] };
    JP.E.invalidate(); JP.store.save();
  });

  // ===== A. Данные и автосборка =====
  const cov = await p.evaluate(() => {
    const ids = Object.keys(JP.data.lessons), res = { total: ids.length, built: 0, manual: 0, bad: [] };
    ids.forEach(id => { const sc = JP.speak.build(id); if (!sc) return; res.built++; if (sc.manual) res.manual++;
      const r1 = sc.items.filter(x => x.r === 1).length, r2 = sc.items.filter(x => x.r === 2).length;
      if (r1 < 2 || r2 < 2 || sc.items.some(x => !x.m && x.kind !== 'free') || sc.items.some(x => x.kind !== 'free' && /[А-Яа-яЁё]|___|\?\?/.test(x.m))) res.bad.push(id); });
    return res;
  });
  ok(cov.built === cov.total, `речевая практика собирается для всех уроков (${cov.built} из ${cov.total})`);
  ok(cov.manual === 12, 'для 12 ключевых тем B1 есть авторские сценарии');
  ok(cov.bad.length === 0, 'образцы везде на английском, без пропусков' + (cov.bad.length ? ': ' + cov.bad.slice(0, 5).join(', ') : ''));

  // ===== B. Прохождение: три раунда и сохранение =====
  await p.evaluate(() => { JP.E.completeUnit('mu-9', 0.9); });
  await p.goto(url + '#/speak/mu-9'); await p.waitForSelector('#go');
  ok(await p.locator('h1').textContent() !== '' && await p.locator('#skip').count() === 1, 'вступление Эми, кнопки «Начать» и «Пропустить»');
  await p.click('#go');
  for (let i = 0; i < 4; i++) { await p.waitForSelector('#said'); for (let k = 0; k < 4; k++) await p.click('#said'); }
  ok(await p.locator('.chip:has-text("Раунд 2")').count() === 1, 'после четырёх повторов по три раза идёт раунд 2 (подстановка)');
  for (let i = 0; i < 6; i++) { await p.waitForSelector('#show'); if (i === 0) ok(await p.locator('#tm').count() === 0, 'в первый раз таймера скорости нет'); if (i === 4) ok(await p.locator('.chip:has-text("Раунд 3")').count() === 1, 'после подстановок идёт раунд 3: своя речь'); await p.click('#show'); await p.waitForSelector('[data-v="1"]'); await p.click('[data-v="1"]'); }
  await p.waitForSelector('h1:has-text("Речевая практика пройдена")');
  { const u = await p.evaluate(() => Object.assign({ today: JP.U.today() }, JP.store.get().units['mu-9'])); ok(u && u.speak && u.speak.runs === 1 && u.speak.fluency === 1 && u.speak.next > u.today, 'результат сохранён: 1 проход, уверенность 100%, повтор назначен'); }
  ok((await p.locator('body').innerText()).includes('Уверенность: 100%'), 'экран итога показывает уверенность и реплику Эми');
  ok(await p.evaluate(() => (JP.store.get().days[JP.U.today()].cat || {}).speaking >= 1), 'минуты речи учитываются отдельной категорией');

  // ===== C. Повтор «на скорость» =====
  await p.evaluate(() => { JP.store.get().units['mu-9'].speak.next = JP.U.today(); JP.store.save(); });
  ok(await p.evaluate(() => JP.E.dueSpeak().includes('mu-9')), 'через несколько дней тема возвращается в план как повтор');
  await p.goto(url + '#/'); await p.goto(url + '#/speak/mu-9'); await p.waitForSelector('#go'); await p.click('#go');
  for (let i = 0; i < 4; i++) { await p.waitForSelector('#said'); for (let k = 0; k < 4; k++) await p.click('#said'); }
  await p.waitForSelector('#tm'); ok((await p.locator('#tm').textContent()).includes('⏱'), 'в повторе появляется таймер скорости');
  await p.click('#show'); await p.waitForSelector('[data-v="0"]'); await p.click('[data-v="0"]');
  for (let i = 0; i < 5; i++) { await p.waitForSelector('#show'); await p.click('#show'); await p.waitForSelector('[data-v="0"]'); await p.click('[data-v="0"]'); }
  await p.waitForSelector('h1:has-text("пройдена")');
  { const sp = await p.evaluate(() => JP.store.get().units['mu-9'].speak); ok(sp.runs === 2 && sp.fluency === 0 && sp.best === 1, 'второй проход: уверенность упала до 0, лучший результат помнится');
    ok(await p.evaluate(() => JP.store.get().units['mu-9'].speak.next === JP.U.addDays(JP.U.today(), 2)), 'при слабом результате повтор уже через 2 дня'); }
  ok(await p.locator('a:has-text("Повторить правило")').count() === 1, 'при слабом результате предлагается вернуться к правилу');

  // ===== D. План дня: речевая практика и удержание новых тем =====
  const plan = await p.evaluate(() => {
    const s = JP.store.get(); const y = JP.U.addDays(JP.U.today(), -1);
    s.units = {}; s.days = {};
    s.units['eg-20'] = { status: 'done', score: 0.9, tries: 1, doneAt: y, step: 1, next: JP.U.addDays(JP.U.today(), 5), weak: false };
    JP.E.invalidate(); JP.store.save(); const d = JP.E.buildDay(45, true);
    return { types: d.tasks.map(t => t.type + ':' + (t.ref || '')), hold: d.tasks.filter(t => t.type === 'unit' && !t.kind).length };
  });
  ok(plan.types.includes('speak:eg-20'), 'вчерашняя тема без речевой практики попадает в план: ' + plan.types.join(', '));
  ok(plan.types[0].startsWith('speak') || plan.types.indexOf('speak:eg-20') < 2, 'речевая практика стоит в начале плана');
  ok(plan.hold === 0, 'пока тема не проговорена, новые грамматические темы не начинаются');
  await p.evaluate(() => { JP.E.saveSpeak('eg-20', null); const d = JP.E.buildDay(45, true); window.__after = d.tasks.map(t => t.type + ':' + (t.kind || '')); });
  ok(await p.evaluate(() => !window.__after.some(t => t.startsWith('speak')) && window.__after.some(t => t.startsWith('unit'))), 'после пропуска практики план снова продолжается новыми темами');
  ok(await p.evaluate(() => JP.E.pendingSpeak().length === 0 && JP.E.dueSpeak().length === 0), 'пропущенная практика не возвращается назойливо');
  await p.evaluate(() => { const s = JP.store.get(); s.units['eg-20'].status = 'done'; delete s.units['eg-20'].speak; s.units['eg-20'].doneAt = JP.U.addDays(JP.U.today(), -30); JP.store.save(); });
  ok(await p.evaluate(() => JP.E.pendingSpeak().length === 0), 'старые пройденные темы (больше 14 дней) не создают очередь из практик');

  // ===== E. Задача плана отмечается, главная показывает задачу =====
  await p.evaluate(() => { const s = JP.store.get(); s.units['eg-20'].doneAt = JP.U.addDays(JP.U.today(), -1); JP.store.save(); JP.E.buildDay(45, true); });
  await p.goto(url + '#/'); await p.waitForSelector('.task');
  ok(await p.locator('.task:has-text("Скажи вслух")').count() === 1, 'на главной есть задача «Скажи вслух»');
  await p.click('.task:has-text("Скажи вслух")'); await p.waitForSelector('#skip'); p.once('dialog', d => d.accept()); await p.click('#skip');
  await p.waitForSelector('text=Пропущено'); ok(await p.evaluate(() => JP.E.day(JP.U.today()).tasks.find(t => t.type === 'speak').done === true), 'пропуск закрывает задачу плана');

  // ===== F. Подсказки преподавателю =====
  const rep = await p.evaluate(() => {
    const s = JP.store.get(); s.units['eg-21'] = { status: 'done', score: .9, doneAt: JP.U.today(), speak: { runs: 1, fluency: 0.2, date: JP.U.today(), next: JP.U.today() } }; JP.store.save();
    return JP.teacherReport(JSON.parse(JP.store.exportJSON()));
  });
  ok(typeof rep === 'string' && rep.includes('Отработать вслух'), 'в «Что обсудить на занятии» попадают темы, где ученик запинается');
  ok(errs.length === 0, 'нет ошибок в консоли' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' проверок не пройдено' : 'Все проверки пройдены'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
