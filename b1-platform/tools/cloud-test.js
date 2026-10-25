// Тест интерфейса входа/кабинета на имитации Supabase (настоящий сервер проверяется SQL-тестом): node tools/cloud-test.js
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
const FAKE = `
const KEYDB = '__mockdb';
const load = () => JSON.parse(localStorage.getItem(KEYDB) || JSON.stringify({ invites: [{ code: 'ABCDE-FGHJK', label: 'Жанель', student_id: null, used_at: null, created_at: new Date().toISOString() }], students: [], pushes: 0, session: null }));
const save = d => localStorage.setItem(KEYDB, JSON.stringify(d));
window.supabase = { createClient() { return {
  rpc: async (fn, a) => { const db = load(); const done = r => { save(db); return r; };
    if (fn === 'b1_redeem') { const n = String(a.p_code).toUpperCase().replace(/[^A-Z0-9]/g, ''); const inv = db.invites.find(i => i.code.replace('-', '') === n && !i.used_at);
      if (!inv) return { error: { message: 'bad_code' } }; if (!a.p_name) return { error: { message: 'name_required' } };
      const s = { id: 's' + (db.students.length + 1), name: a.p_name, token: 'tok' + db.students.length, state: null, last_seen: new Date().toISOString() }; db.students.push(s); inv.used_at = 'x'; inv.student_id = s.id; return done({ data: { token: s.token, name: s.name, state: null } }); }
    if (fn === 'b1_push') { const s = db.students.find(x => x.token === a.p_token); if (!s) return { error: { message: 'bad_token' } }; s.state = a.p_state; s.state_updated = new Date().toISOString(); s.last_seen = s.state_updated; db.pushes++; return done({ data: null }); }
    if (fn === 'b1_me') { const s = db.students.find(x => x.token === a.p_token); return s ? { data: { name: s.name, state: s.state } } : { error: { message: 'bad_token' } }; }
    if (fn === 'b1_is_teacher') return { data: !!db.session };
    if (fn === 'b1_create_invite') { const c = 'ZZZZZ-' + String(db.invites.length).padStart(5, 'A'); db.invites.push({ code: c, label: a.p_label, student_id: a.p_student_id, used_at: null, created_at: new Date().toISOString() }); return done({ data: c }); }
  },
  from: t => { const q = { select() { return q; }, order() { return q; }, is() { return q; }, delete() { q._d = true; return q; }, eq(k, v) { q._eq = [k, v]; return q; },
    then(res) { const db = load(); if (q._d) { if (t === 'b1_students') db.students = db.students.filter(s => s.id !== q._eq[1]); else db.invites = db.invites.filter(i => i.code !== q._eq[1]); save(db); return res({ error: null }); }
      return res({ data: t === 'b1_students' ? db.students : db.invites.filter(i => !i.used_at), error: null }); } }; return q; },
  auth: { getSession: async () => ({ data: { session: load().session } }), signInWithPassword: async ({ email, password }) => { const db = load(); if (email === 'almirzhan@gmail.com' && password === 'secret123') { db.session = { user: { email } }; save(db); return { error: null }; } return { error: { message: 'Invalid login credentials' } }; }, signOut: async () => { const db = load(); db.session = null; save(db); }, signUp: async () => ({ data: {}, error: null }) } }; } };`;
const DB = pg => pg.evaluate(() => JSON.parse(localStorage.getItem('__mockdb')));
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  await ctx.route('**/supabase.js', r => r.fulfill({ contentType: 'application/javascript', body: FAKE }));
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForSelector('#code');
  ok(p.url().endsWith('#/login'), 'без входа ученик попадает на экран кода');
  await p.fill('#code', 'WRONG-CODE1'); await p.fill('#nm', 'Анна'); await p.click('#go'); await p.waitForSelector('#msg:has-text("не найден")');
  ok(true, 'неверный код отклоняется с понятным сообщением');
  await p.fill('#code', 'abcde fghjk'); await p.click('#go'); await p.waitForSelector('#chat');
  ok(await p.evaluate(() => JP.cloud.token() === 'tok0'), 'код принят (регистр и пробелы не важны), токен сохранён');
  ok(await p.evaluate(() => JP.store.get().seen.cloudName === 'Анна'), 'имя из входа сохранено');
  await p.waitForSelector('#in'); ok(await p.inputValue('#in') === 'Анна', 'в знакомстве имя подставлено');
  // повторное использование кода
  // другое устройство = другая база; код в «общей» in-memory базе у каждой страницы свой, поэтому проверяем через тот же контекст:
  await p.evaluate(() => JP.store.get().profile = null); await p.evaluate(() => { JP.cloud.logoutStudent(); });
  await p.goto(url + '#/login'); await p.reload(); await p.waitForSelector('#code');
  ok((await DB(p)).invites[0].used_at !== null, 'код помечен использованным');
  // эмулируем занятия: профиль + сохранение
  await p.evaluate(async () => { const s = JP.store.get(); const t = JP.U.today(); s.profile = { name: 'Анна', reasons: [], difficulties: [], daysPerWeek: 7, studyDays: [0,1,2,3,4,5,6], minutesPerDay: 30, bestTime: 'evening', formats: [], liveLessons: 0, liveDays: [], hasBooks: 'all', tone: 'soft', startedAt: t }; s.placement = { done: true, stage: 1, by: { A1: { n: 8, ok: 5 }, A2: { n: 10, ok: 1 }, 'A2+': { n: 6, ok: 0 }, B1: { n: 6, ok: 0 } }, wrong: [] }; JP.E.invalidate(); JP.E.completeUnit('eg-1', 0.9); s.days[t] = { tasks: [], minutes: 25 }; localStorage.setItem('b1.student.token', 'tok0'); JP.store.save(); await JP.cloud.flush(); });
  const d2 = await DB(p); ok(d2.pushes >= 1 && !!d2.students[0].state.units['eg-1'], 'прогресс автоматически ушёл на сервер');
  // преподаватель
  await p.goto(url + '#/admin'); await p.waitForSelector('#em');
  await p.fill('#em', 'almirzhan@gmail.com'); await p.fill('#pw', 'wrong'); await p.click('#in'); await p.waitForSelector('#msg:has-text("Неверный")');
  ok(true, 'неверный пароль отклоняется');
  await p.fill('#pw', 'secret123'); await p.click('#in'); await p.waitForSelector('text=Ученики');
  ok(await p.locator('text=Анна').count() > 0, 'преподаватель видит ученика в списке');
  await p.fill('#lab', 'Мария'); await p.click('#mk'); await p.waitForSelector('text=Неиспользованные коды');
  ok(await p.locator('text=Мария').count() > 0, 'преподаватель создаёт новый код');
  await p.fill('#cnt', '5'); await p.fill('#lab', 'Пачка'); await p.click('#mkn'); await p.waitForSelector('text=Запас кодов');
  ok((await DB(p)).invites.filter(i => /^Пачка/.test(i.label || '')).length === 5, 'создаётся пачка из 5 кодов');
  ok(await p.locator('#cpall').count() === 1 && await p.locator('#dlall').count() === 1, 'есть «Копировать все» и «Скачать .csv»');
  await p.click('a.card:has-text("Анна")'); await p.waitForSelector('text=ОТЧЁТ ПО УЧЕНИЦЕ');
  ok(await p.locator('text=Что обсудить на следующем занятии').count() === 1, 'карточка ученика показывает его результаты');
  ok(await p.evaluate(() => JP.store.get().profile === null || JP.store.get().profile.name === 'Анна'), 'просмотр чужих данных не подменяет данные браузера');
  ok(errs.length === 0, 'нет ошибок в консоли' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' проверок не пройдено' : 'Все проверки пройдены'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
