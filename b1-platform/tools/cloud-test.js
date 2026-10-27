// Тест интерфейса регистрации/входа и кабинета на имитации Supabase (сам сервер проверен SQL-тестом): node tools/cloud-test.js
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
const FAKE = `
const KEYDB = '__mockdb';
const load = () => JSON.parse(localStorage.getItem(KEYDB) || JSON.stringify({ invites: [{ code: 'ABCDE-FGHJK', label: 'Мария', student_id: null, used_at: null, created_at: new Date().toISOString() }], students: [], sessions: {}, pushes: 0, session: null, n: 0 }));
const save = d => localStorage.setItem(KEYDB, JSON.stringify(d));
const sess = (db, sid) => { const t = 'tok' + (++db.n); db.sessions[t] = sid; return t; };
window.supabase = { createClient() { return {
  rpc: async (fn, a) => { const db = load(); const done = r => { save(db); return r; };
    if (fn === 'b1_register') { const n = String(a.p_code).toUpperCase().replace(/[^A-Z0-9]/g, ''); const inv = db.invites.find(i => i.code.replace('-', '') === n && !i.used_at);
      if (!inv) return { error: { message: 'bad_code' } }; const lg = String(a.p_login).trim().toLowerCase();
      if (lg.length < 3) return { error: { message: 'bad_login' } }; if (a.p_password.length < 8) return { error: { message: 'weak_password' } };
      let s = inv.student_id && db.students.find(x => x.id === inv.student_id);
      if (db.students.some(x => x.login === lg && x !== s)) return { error: { message: 'login_taken' } };
      if (s) { s.login = lg; s.password = a.p_password; Object.keys(db.sessions).forEach(t => { if (db.sessions[t] === s.id) delete db.sessions[t]; }); }
      else { if (!a.p_name) return { error: { message: 'name_required' } }; s = { id: 's' + (db.students.length + 1), name: a.p_name, login: lg, password: a.p_password, state: null, created_at: new Date().toISOString(), last_seen: new Date().toISOString() }; db.students.push(s); inv.student_id = s.id; }
      inv.used_at = 'x'; return done({ data: { token: sess(db, s.id), name: s.name, login: s.login, state: s.state } }); }
    if (fn === 'b1_login') { const s = db.students.find(x => x.login === String(a.p_login).trim().toLowerCase()); if (!s || s.password !== a.p_password) return { data: { error: 'bad_credentials' } }; return done({ data: { token: sess(db, s.id), name: s.name, login: s.login, state: s.state } }); }
    if (fn === 'b1_change_password') { const s = db.students.find(x => x.id === db.sessions[a.p_token]); if (!s) return { error: { message: 'bad_token' } }; if (s.password !== a.p_old) return { data: { error: 'bad_credentials' } };
      if (a.p_new.length < 8) return { error: { message: 'weak_password' } }; s.password = a.p_new; Object.keys(db.sessions).forEach(t => { if (db.sessions[t] === s.id && t !== a.p_token) delete db.sessions[t]; }); return done({ data: { ok: true } }); }
    if (fn === 'b1_logout') { delete db.sessions[a.p_token]; return done({ data: null }); }
    if (fn === 'b1_set_credentials') { const s = db.students.find(x => x.id === db.sessions[a.p_token]); if (!s) return { error: { message: 'bad_token' } }; s.login = a.p_login.toLowerCase(); s.password = a.p_password; return done({ data: { login: s.login } }); }
    if (fn === 'b1_push') { const s = db.students.find(x => x.id === db.sessions[a.p_token]); if (!s) return { error: { message: 'bad_token' } }; s.state = a.p_state; s.state_updated = new Date().toISOString(); s.last_seen = s.state_updated; db.pushes++; return done({ data: null }); }
    if (fn === 'b1_me') { const s = db.students.find(x => x.id === db.sessions[a.p_token]); return s ? { data: { name: s.name, login: s.login, has_password: !!s.password, state: s.state } } : { error: { message: 'bad_token' } }; }
    if (fn === 'b1_is_teacher') return { data: !!db.session };
    if (fn === 'b1_create_invite') { const c = 'ZZZZZ-' + String(db.invites.length).padStart(5, 'A'); db.invites.push({ code: c, label: a.p_label, student_id: a.p_student_id, used_at: null, created_at: new Date().toISOString() }); return done({ data: c }); }
  },
  from: t => { const q = { select() { return q; }, order() { return q; }, is() { q._is = true; return q; }, delete() { q._d = true; return q; }, eq(k, v) { q._eq = [k, v]; return q; },
    then(res) { const db = load(); if (q._d) { if (t === 'b1_students') db.students = db.students.filter(s => s.id !== q._eq[1]); else db.invites = db.invites.filter(i => i.code !== q._eq[1]); save(db); return res({ error: null }); }
      return res({ data: t === 'b1_students' ? db.students.map(({ password, ...r }) => r) : (q._is ? db.invites.filter(i => !i.used_at) : db.invites), error: null }); } }; return q; },
  auth: { getSession: async () => ({ data: { session: load().session } }), signInWithPassword: async ({ email, password }) => { const db = load(); if (email === 'almirzhan@gmail.com' && password === 'secret123') { db.session = { user: { email } }; save(db); return { error: null }; } return { error: { message: 'Invalid login credentials' } }; }, signOut: async () => { const db = load(); db.session = null; save(db); }, signUp: async () => ({ data: {}, error: null }) } }; } };`;
const DB = pg => pg.evaluate(() => JSON.parse(localStorage.getItem('__mockdb')));
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  await ctx.route('**/supabase.js', r => r.fulfill({ contentType: 'application/javascript', body: FAKE }));
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  const msgOf = async () => (await p.locator('#msg').textContent()) || '';
  await p.goto(url); await p.waitForSelector('#lg');
  ok(p.url().endsWith('#/login'), 'без входа ученик попадает на экран входа');
  // регистрация
  await p.click('[data-m=reg]'); await p.waitForSelector('#code');
  await p.fill('#code', 'WRONG-CODE1'); await p.fill('#nm', 'Мария'); await p.fill('#lg', 'maria@mail.com'); await p.fill('#pw', 'password123'); await p.fill('#pw2', 'password123'); await p.click('#go');
  await p.waitForSelector('#msg:has-text("не найден")'); ok(true, 'неверный код отклоняется с понятным сообщением');
  await p.fill('#code', 'abcde fghjk'); await p.fill('#pw2', 'different99'); await p.click('#go');
  ok((await msgOf()).includes('не совпадают'), 'разные пароли не принимаются');
  await p.fill('#pw', 'short'); await p.fill('#pw2', 'short'); await p.click('#go');
  ok((await msgOf()).includes('не короче 8'), 'короткий пароль не принимается');
  await p.fill('#pw', 'password123'); await p.fill('#pw2', 'password123'); await p.click('#go'); await p.waitForSelector('#chat');
  ok(await p.evaluate(() => !!JP.cloud.token() && JP.store.get().seen.cloudLogin === 'maria@mail.com'), 'регистрация прошла: токен и логин сохранены');
  await p.waitForSelector('#in'); ok(await p.inputValue('#in') === 'Мария', 'в знакомстве имя подставлено');
  // занятия и автосохранение
  await p.evaluate(async () => { const s = JP.store.get(); const t = JP.U.today(); s.profile = { name: 'Мария', reasons: [], difficulties: [], daysPerWeek: 7, studyDays: [0,1,2,3,4,5,6], minutesPerDay: 30, bestTime: 'evening', formats: [], liveLessons: 0, liveDays: [], hasBooks: 'all', tone: 'soft', startedAt: t }; s.placement = { done: true, stage: 1, by: { A1: { n: 8, ok: 5 }, A2: { n: 10, ok: 1 }, 'A2+': { n: 6, ok: 0 }, B1: { n: 6, ok: 0 } }, wrong: [] }; JP.E.invalidate(); JP.E.completeUnit('eg-1', 0.9); s.days[t] = { tasks: [], minutes: 25 }; JP.store.save(); await JP.cloud.flush(); });
  const d1 = await DB(p); ok(d1.pushes >= 1 && !!d1.students[0].state.units['eg-1'], 'прогресс автоматически ушёл на сервер');
  // выход и повторный вход паролем (в т. ч. «с другого устройства»: локальные данные очищены)
  await p.goto(url + '#/more'); await p.waitForSelector('#logout'); p.once('dialog', d => d.accept()); await p.click('#logout');
  await p.waitForSelector('#lg'); ok(await p.evaluate(() => !JP.cloud.token() && !JP.store.get().profile), 'выход очищает вход и данные на устройстве');
  await p.fill('#lg', 'maria@mail.com'); await p.fill('#pw', 'wrong-pass1'); await p.click('#go'); await p.waitForSelector('#msg:has-text("Неверный")');
  ok(true, 'неверный пароль отклоняется');
  await p.fill('#pw', 'password123'); await p.click('#go'); await p.waitForFunction(() => JP.store.get().profile && JP.store.get().units['eg-1']);
  ok(true, 'вход по логину и паролю восстановил прогресс с сервера');
  // смена пароля в кабинете ученика
  await p.goto(url + '#/more'); await p.waitForSelector('#chpw'); await p.click('#chpw summary');
  await p.fill('#op', 'bad-old-pass'); await p.fill('#n1', 'brand-new-pass1'); await p.fill('#n2', 'brand-new-pass1'); await p.click('#savechpw');
  await p.waitForSelector('#cmsg:has-text("неверно")'); ok(true, 'смена пароля: неверный текущий пароль отклоняется');
  await p.fill('#op', 'password123'); await p.fill('#n2', 'other-pass-123'); await p.click('#savechpw');
  ok((await p.locator('#cmsg').textContent()).includes('не совпадают'), 'смена пароля: несовпадающие новые пароли отклоняются');
  await p.fill('#n1', 'short'); await p.fill('#n2', 'short'); await p.click('#savechpw');
  ok((await p.locator('#cmsg').textContent()).includes('не короче 8'), 'смена пароля: короткий пароль отклоняется');
  await p.fill('#n1', 'brand-new-pass1'); await p.fill('#n2', 'brand-new-pass1'); await p.click('#savechpw'); await p.waitForSelector('#cmsg:has-text("изменён")');
  ok((await DB(p)).students[0].password === 'brand-new-pass1', 'пароль изменён на сервере');
  p.once('dialog', d => d.accept()); await p.click('#logout'); await p.waitForSelector('#lg');
  await p.fill('#lg', 'maria@mail.com'); await p.fill('#pw', 'password123'); await p.click('#go'); await p.waitForSelector('#msg:has-text("Неверный")');
  await p.fill('#pw', 'brand-new-pass1'); await p.click('#go'); await p.waitForFunction(() => JP.store.get().profile);
  ok(true, 'после смены пароля старый не работает, новый — работает');
  // преподаватель
  await p.goto(url + '#/admin'); await p.waitForSelector('#em');
  await p.fill('#em', 'almirzhan@gmail.com'); await p.fill('#pw', 'wrong'); await p.click('#in'); await p.waitForSelector('#msg:has-text("Неверный")');
  ok(true, 'неверный пароль преподавателя отклоняется');
  await p.fill('#pw', 'secret123'); await p.click('#in'); await p.waitForSelector('.adm-side');
  ok(await p.locator('.adm-side nav a').count() === 3 && await p.locator('text=Требуют внимания').count() === 1, 'после входа открывается обзор с разделами «Обзор / Ученики / Коды»');
  ok(await p.locator('#cplink').count() === 1 && await p.locator('#shlink').count() === 1, 'в обзоре есть ссылка на платформу, копирование и «Поделиться»');
  // ученики
  await p.click('.adm-side nav a:has-text("Ученики")'); await p.waitForSelector('#list .adm-tr');
  ok(await p.locator('#list .adm-tr:has-text("Мария")').count() === 1 && await p.locator('text=@maria@mail.com').count() > 0, 'раздел «Ученики»: ученик виден с логином');
  await p.fill('#q', 'нет такого'); await p.waitForSelector('text=Никого не нашли'); ok(true, 'поиск по ученикам работает'); await p.fill('#q', '');
  await p.click('#flt [data-f=new]'); ok(await p.locator('#list .adm-tr').count() === 0, 'фильтр «Не начали» скрывает начавшего ученика'); await p.click('#flt [data-f=all]');
  // коды
  await p.click('.adm-side nav a:has-text("Коды")'); await p.waitForSelector('#mkn');
  await p.fill('#lab', 'Пачка'); await p.fill('#cnt', '5'); await p.click('#mkn'); await p.waitForSelector('#clist [data-invite]');
  ok((await DB(p)).invites.filter(i => /^Пачка/.test(i.label || '')).length === 5, 'создаётся пачка из 5 кодов');
  ok(await p.locator('#clist [data-invite]').count() >= 5 && await p.locator('#cpall').count() === 1 && await p.locator('#dlall').count() === 1, 'у кодов есть «Приглашение», «Копировать все», «Скачать .csv»');
  await p.click('#cflt [data-f=used]'); ok(await p.locator('#clist:has-text("использован: Мария")').count() === 1, 'во вкладке «Использованные» видно, кто воспользовался кодом');
  await p.click('#cflt [data-f=free]');
  const inv = await p.evaluate(() => { let txt = ''; Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); Object.defineProperty(navigator, 'clipboard', { value: { writeText: t => { txt = t; return Promise.resolve(); } }, configurable: true }); document.querySelector('[data-invite]').click(); return new Promise(r => setTimeout(() => r(txt), 100)); });
  ok(/#\/login\?code=/.test(inv) && /Код приглашения/.test(inv), 'текст приглашения содержит ссылку с кодом');
  const codeRaw = (await DB(p)).invites.find(i => !i.used_at).code.replace('-', '');
  const p3 = await (await b.newContext({ reducedMotion: 'reduce' })).newPage(); await p3.route('**/supabase.js', r => r.fulfill({ contentType: 'application/javascript', body: FAKE })); await p3.goto(url + '#/login?code=' + codeRaw); await p3.waitForSelector('#code');
  ok((await p3.inputValue('#code')).replace('-', '').toUpperCase() === codeRaw, 'ссылка-приглашение подставляет код в форму регистрации'); await p3.close();
  // карточка ученика
  await p.click('.adm-side nav a:has-text("Ученики")'); await p.waitForSelector('#list .adm-tr'); await p.click('#list .adm-tr:has-text("Мария")'); await p.waitForSelector('#t-dash .dash');
  ok(await p.locator('#t-dash:has-text("Минуты по неделям")').count() === 1 && await p.locator('#t-dash:has-text("Календарь занятий")').count() === 1, 'карточка ученика показывает полный дашборд прогресса');
  await p.click('.adm-tabs [data-t=rep]'); ok(await p.locator('#t-rep:has-text("Что обсудить на следующем занятии")').count() === 1, 'вкладка «Отчёт для занятия» показывает рекомендации');
  // сброс пароля
  await p.click('#rec'); await p.waitForSelector('#ci');
  const rst = (await DB(p)).invites.find(i => i.student_id === 's1' && !i.used_at); ok(!!rst, 'создаётся код сброса пароля для ученика');
  await p.evaluate(() => { JP.cloud.logoutStudent(); }); // ученик «на другом устройстве» регистрируется кодом сброса
  const p2 = await (await b.newContext({ reducedMotion: 'reduce' })).newPage(); await p2.route('**/supabase.js', r => r.fulfill({ contentType: 'application/javascript', body: FAKE }));
  await p2.goto(url); await p2.evaluate(db => localStorage.setItem('__mockdb', db), JSON.stringify(await DB(p))); await p2.goto(url + '#/login'); await p2.reload(); await p2.waitForSelector('[data-m=reg]');
  await p2.click('[data-m=reg]'); await p2.fill('#code', rst.code); await p2.fill('#nm', 'x'); await p2.fill('#lg', 'maria@mail.com'); await p2.fill('#pw', 'newpass-456'); await p2.fill('#pw2', 'newpass-456'); await p2.click('#go');
  await p2.waitForFunction(() => JP.cloud.token()); ok((await p2.evaluate(() => JP.store.get().units['eg-1'] ? 1 : 0)) === 1, 'код сброса задаёт новый пароль и возвращает прогресс');
  ok(errs.length === 0, 'нет ошибок в консоли' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' проверок не пройдено' : 'Все проверки пройдены'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
