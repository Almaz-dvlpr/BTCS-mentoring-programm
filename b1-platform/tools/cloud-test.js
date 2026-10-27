// Тест регистрации по email с подтверждением, входа, привязки email у старых учеников и кабинета преподавателя
// на имитации Supabase (сервер проверен отдельным SQL-тестом): node tools/cloud-test.js
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
const FAKE = `
const KEYDB = '__mockdb', TEACHER = 'almirzhan@gmail.com';
const fresh = () => ({ invites: [{ code: 'ABCDE-FGHJK', label: 'Мария', student_id: null, used_at: null, created_at: new Date().toISOString() }], students: [], sessions: {}, users: { [TEACHER]: { id: 'u-teacher', password: 'secret123', confirmed: true } }, current: null, outbox: [], pushes: 0, n: 0 });
const load = () => JSON.parse(localStorage.getItem(KEYDB) || JSON.stringify(fresh())); const save = d => localStorage.setItem(KEYDB, JSON.stringify(d));
const norm = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const cur = db => db.current && db.users[db.current];
const who = (db, tok) => { const u = cur(db); let s = u && db.students.find(x => x.auth_uid === u.id); if (!s && tok) s = db.students.find(x => x.id === db.sessions[tok]); return s; };
window.supabase = { createClient() { save(load()); return {
  rpc: async (fn, a) => { const db = load(); const done = r => { save(db); return r; };
    if (fn === 'b1_check_code') { const i = db.invites.find(x => norm(x.code) === norm(a.p_code) && !x.used_at); return { data: i ? { ok: true, reset: !!i.student_id } : { ok: false } }; }
    if (fn === 'b1_me') { const s = who(db, a.p_token); return s ? { data: { name: s.name, login: s.login, email: s.email, linked: !!s.auth_uid, has_password: !!s.password, state: s.state } } : { error: { message: 'bad_token' } }; }
    if (fn === 'b1_push') { const s = who(db, a.p_token); if (!s) return { error: { message: 'bad_token' } }; s.state = a.p_state; s.state_updated = new Date().toISOString(); s.last_seen = s.state_updated; db.pushes++; return done({ data: null }); }
    if (fn === 'b1_claim') { const u = cur(db); if (!u) return { error: { message: 'not_authenticated' } }; let s = db.students.find(x => x.auth_uid === u.id);
      if (!s) { const inv = db.invites.find(x => norm(x.code) === norm(a.p_code) && !x.used_at); if (!inv) return { error: { message: 'bad_code' } };
        if (inv.student_id) { s = db.students.find(x => x.id === inv.student_id); s.auth_uid = u.id; s.email = db.current; }
        else { if (!a.p_name) return { error: { message: 'name_required' } }; s = { id: 's' + (db.students.length + 1), name: a.p_name, email: db.current, auth_uid: u.id, state: null, created_at: new Date().toISOString(), last_seen: new Date().toISOString() }; db.students.push(s); inv.student_id = s.id; }
        inv.used_at = 'x'; }
      return done({ data: { name: s.name, state: s.state, email: s.email } }); }
    if (fn === 'b1_claim_legacy') { const u = cur(db); if (!u) return { error: { message: 'not_authenticated' } }; const s = db.students.find(x => x.id === db.sessions[a.p_token]); if (!s) return { error: { message: 'bad_token' } };
      if (s.auth_uid && s.auth_uid !== u.id) return { error: { message: 'already_linked' } }; s.auth_uid = u.id; s.email = db.current; return done({ data: { name: s.name, state: s.state, email: s.email } }); }
    if (fn === 'b1_login') { const s = db.students.find(x => x.login === String(a.p_login).trim().toLowerCase()); if (!s || s.password !== a.p_password) return { data: { error: 'bad_credentials' } }; const t = 'tok' + (++db.n); db.sessions[t] = s.id; return done({ data: { token: t, name: s.name, login: s.login, state: s.state } }); }
    if (fn === 'b1_logout') { delete db.sessions[a.p_token]; return done({ data: null }); }
    if (fn === 'b1_is_teacher') return { data: db.current === TEACHER };
    if (fn === 'b1_create_invite') { const c = 'ZZZZZ-' + String(db.invites.length).padStart(5, 'A'); db.invites.push({ code: c, label: a.p_label, student_id: a.p_student_id, used_at: null, created_at: new Date().toISOString() }); return done({ data: c }); }
  },
  from: t => { const q = { select() { return q; }, order() { return q; }, is() { q._is = true; return q; }, delete() { q._d = true; return q; }, eq(k, v) { q._eq = [k, v]; return q; },
    then(res) { const db = load(); if (q._d) { if (t === 'b1_students') db.students = db.students.filter(s => s.id !== q._eq[1]); else db.invites = db.invites.filter(i => i.code !== q._eq[1]); save(db); return res({ error: null }); }
      return res({ data: t === 'b1_students' ? db.students.map(({ password, auth_uid, ...r }) => r) : (q._is ? db.invites.filter(i => !i.used_at) : db.invites), error: null }); } }; return q; },
  auth: {
    getSession: async () => { const db = load(), u = cur(db); return { data: { session: u ? { user: { email: db.current, id: u.id } } : null } }; },
    signUp: async ({ email }) => { const db = load(); if (!db.users[email]) { db.users[email] = { id: 'u' + (++db.n), password: arguments[0] && 0, confirmed: false }; } db.users[email].password = db.users[email].password || null; db.outbox.push({ to: email, kind: 'confirm' }); save(db); return { data: { session: null, user: {} }, error: null }; },
    signInWithPassword: async ({ email, password }) => { const db = load(), u = db.users[email]; if (!u || u.password !== password) return { error: { message: 'Invalid login credentials' } }; if (!u.confirmed) return { error: { message: 'Email not confirmed' } }; db.current = email; save(db); return { error: null }; },
    signOut: async () => { const db = load(); db.current = null; save(db); }, resetPasswordForEmail: async email => { const db = load(); db.outbox.push({ to: email, kind: 'reset' }); save(db); return { error: null }; },
    updateUser: async ({ password }) => { const db = load(); db.users[db.current].password = password; save(db); return { error: null }; }, onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } }; } };`;
// signUp в имитации должен знать пароль: переопределяем аккуратно
const FAKE2 = FAKE.replace("signUp: async ({ email }) => { const db = load(); if (!db.users[email]) { db.users[email] = { id: 'u' + (++db.n), password: arguments[0] && 0, confirmed: false }; } db.users[email].password = db.users[email].password || null; db.outbox.push({ to: email, kind: 'confirm' }); save(db); return { data: { session: null, user: {} }, error: null }; },",
  "signUp: async ({ email, password }) => { const db = load(); if (!db.users[email]) db.users[email] = { id: 'u' + (++db.n), password, confirmed: false }; db.outbox.push({ to: email, kind: 'confirm' }); save(db); return { data: { session: null, user: {} }, error: null }; },");
const DB = pg => pg.evaluate(() => JSON.parse(localStorage.getItem('__mockdb')));
const setDB = (pg, fn) => pg.evaluate(f => { const db = JSON.parse(localStorage.getItem('__mockdb')); new Function('db', f)(db); localStorage.setItem('__mockdb', JSON.stringify(db)); }, fn);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const newCtx = async () => { const c = await b.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' }); await c.route('**/supabase.js', r => r.fulfill({ contentType: 'application/javascript', body: FAKE2 })); return c; };
  const ctx = await newCtx(); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  const msgOf = async () => (await p.locator('#msg').textContent()) || '';
  const profile = async (name) => p.evaluate(async n => { const s = JP.store.get(), t = JP.U.today(); s.profile = { name: n, reasons: [], difficulties: [], daysPerWeek: 7, studyDays: [0,1,2,3,4,5,6], minutesPerDay: 30, bestTime: 'evening', formats: [], liveLessons: 0, liveDays: [], hasBooks: 'all', tone: 'soft', startedAt: t }; s.placement = { done: true, stage: 1, by: { A1: { n: 8, ok: 5 }, A2: { n: 10, ok: 1 }, 'A2+': { n: 6, ok: 0 }, B1: { n: 6, ok: 0 } }, wrong: [] }; JP.E.invalidate(); JP.E.completeUnit('eg-1', 0.9); s.days[t] = { tasks: [], minutes: 25 }; JP.store.save(); await JP.cloud.flush(); }, name);

  // ===== A. Регистрация по коду с подтверждением email =====
  await p.goto(url); await p.waitForSelector('#lg'); ok(p.url().endsWith('#/login'), 'без входа ученик попадает на экран входа');
  await p.click('[data-m=reg]'); await p.waitForSelector('#code');
  const fill = async o => { for (const [k, v] of Object.entries(o)) await p.fill('#' + k, v); };
  await fill({ code: 'WRONG-CODE1', nm: 'Мария', em: 'maria@mail.com', pw: 'password123', pw2: 'password123' }); await p.click('#go'); await p.waitForSelector('#msg:has-text("не найден")');
  ok((await DB(p)).outbox.length === 0, 'при неверном коде письмо не отправляется');
  await fill({ code: 'abcde fghjk', em: 'not-an-email' }); await p.click('#go'); ok((await msgOf()).includes('email'), 'неверный адрес email не принимается');
  await fill({ em: 'maria@mail.com', pw2: 'different99' }); await p.click('#go'); ok((await msgOf()).includes('не совпадают'), 'разные пароли не принимаются');
  await fill({ pw: 'short', pw2: 'short' }); await p.click('#go'); ok((await msgOf()).includes('не короче 8'), 'короткий пароль не принимается');
  await fill({ pw: 'password123', pw2: 'password123' }); await p.click('#go'); await p.waitForSelector('text=Проверьте почту');
  const d1 = await DB(p); ok(d1.outbox.length === 1 && d1.outbox[0].to === 'maria@mail.com' && d1.users['maria@mail.com'].confirmed === false, 'отправлено письмо на email, адрес пока не подтверждён');
  ok((await DB(p)).invites[0].used_at === null, 'код не расходуется, пока почта не подтверждена');
  await p.click('#go'); await p.waitForSelector('#msg:has-text("не подтверждена")'); ok(true, 'до подтверждения почты войти нельзя, понятное сообщение');
  await setDB(p, "db.users['maria@mail.com'].confirmed = true;"); // «пользователь перешёл по ссылке из письма»
  await p.click('#go'); await p.waitForSelector('#chat'); await p.waitForSelector('#in');
  ok(await p.inputValue('#in') === 'Мария', 'после подтверждения вход выполнен, имя подставлено в знакомство');
  const d2 = await DB(p); ok(d2.students.length === 1 && d2.students[0].email === 'maria@mail.com' && d2.invites[0].used_at, 'ученик создан и привязан к подтверждённому email, код использован');

  // ===== B. Прогресс, выход, вход по email =====
  await profile('Мария'); ok((await DB(p)).pushes >= 1 && !!(await DB(p)).students[0].state.units['eg-1'], 'прогресс сохраняется на сервере под email-учётной записью');
  await p.goto(url + '#/more'); await p.waitForSelector('#logout'); p.once('dialog', d => d.accept()); await p.click('#logout'); await p.waitForSelector('#lg');
  await p.fill('#lg', 'maria@mail.com'); await p.fill('#pw', 'wrong-pass1'); await p.click('#go'); await p.waitForSelector('#msg:has-text("Неверный")'); ok(true, 'неверный пароль отклоняется');
  await p.fill('#pw', 'password123'); await p.click('#go'); await p.waitForFunction(() => JP.store.get().profile && JP.store.get().units['eg-1']); ok(true, 'вход по email и паролю возвращает прогресс с сервера');
  await p.goto(url + '#/more'); await p.waitForSelector('#logout'); p.once('dialog', d => d.accept()); await p.click('#logout'); await p.waitForSelector('#forgot');
  await p.fill('#lg', 'maria@mail.com'); await p.click('#forgot'); await p.waitForSelector('#msg:has-text("отправили письмо")');
  ok((await DB(p)).outbox.some(m => m.kind === 'reset' && m.to === 'maria@mail.com'), '«Забыли пароль» отправляет письмо для восстановления');
  // смена пароля
  await p.fill('#pw', 'password123'); await p.click('#go'); await p.waitForFunction(() => JP.store.get().profile);
  await p.goto(url + '#/more'); await p.waitForSelector('#chpw'); await p.click('#chpw summary');
  await p.fill('#op', 'bad-old-pass'); await p.fill('#n1', 'brand-new-pass1'); await p.fill('#n2', 'brand-new-pass1'); await p.click('#savechpw'); await p.waitForSelector('#cmsg:has-text("неверно")'); ok(true, 'смена пароля: неверный текущий пароль отклоняется');
  await p.fill('#op', 'password123'); await p.click('#savechpw'); await p.waitForSelector('#cmsg:has-text("изменён")'); ok((await DB(p)).users['maria@mail.com'].password === 'brand-new-pass1', 'пароль изменён');
  p.once('dialog', d => d.accept()); await p.click('#logout'); await p.waitForSelector('#lg');
  await p.fill('#lg', 'maria@mail.com'); await p.fill('#pw', 'password123'); await p.click('#go'); await p.waitForSelector('#msg:has-text("Неверный")');
  await p.fill('#pw', 'brand-new-pass1'); await p.click('#go'); await p.waitForFunction(() => JP.store.get().profile); ok(true, 'после смены старый пароль не работает, новый работает');

  // ===== C. Старый ученик (до email): привязка почты, прогресс сохраняется =====
  const p2 = await (await newCtx()).newPage(); p2.on('pageerror', e => errs.push('p2: ' + e.message)); p2.on('console', m => m.type() === 'error' && errs.push('p2: ' + m.text()));
  await p2.goto(url + '#/login'); await p2.waitForSelector('#lg');
  await p2.evaluate(() => { const db = { invites: [], students: [{ id: 's1', name: 'Жанель', login: null, state: null, created_at: new Date().toISOString(), last_seen: new Date().toISOString() }], sessions: { legtok: 's1' }, users: { 'almirzhan@gmail.com': { id: 'u-teacher', password: 'secret123', confirmed: true } }, current: null, outbox: [], pushes: 0, n: 0 }; localStorage.setItem('__mockdb', JSON.stringify(db)); localStorage.setItem('b1.student.token', 'legtok'); });
  await p2.goto(url + '#/'); await p2.reload(); await p2.waitForSelector('#lg').catch(() => {});
  await p2.evaluate(() => { const s = JP.store.get(), t = JP.U.today(); s.profile = { name: 'Жанель', reasons: [], difficulties: [], daysPerWeek: 7, studyDays: [0,1,2,3,4,5,6], minutesPerDay: 30, bestTime: 'evening', formats: [], liveLessons: 0, liveDays: [], hasBooks: 'all', tone: 'soft', startedAt: t }; s.placement = { done: true, stage: 1, by: { A1: { n: 8, ok: 5 }, A2: { n: 10, ok: 1 }, 'A2+': { n: 6, ok: 0 }, B1: { n: 6, ok: 0 } }, wrong: [] }; JP.E.invalidate(); JP.E.completeUnit('eg-5', 0.9); JP.store.save(); return JP.cloud.flush(); });
  await p2.goto(url + '#/'); await p2.waitForSelector('#linkbanner'); ok(await p2.locator('#linkbanner a:has-text("Привязать email")').count() === 1, 'на главной у ученика без email есть напоминание «Привяжите email»');
  await p2.click('#snooze'); await p2.goto(url + '#/more'); await p2.goto(url + '#/'); ok(await p2.locator('#linkbanner').count() === 0, 'напоминание можно отложить на 3 дня');
  await p2.goto(url + '#/more'); await p2.waitForSelector('#sendlink'); ok(true, 'ученик со старым входом видит блок «Привяжите email»');
  await p2.fill('#le', 'zhanel@mail.com'); await p2.fill('#lp', 'zhanel-pass1'); await p2.fill('#lp2', 'zhanel-pass1'); await p2.click('#sendlink'); await p2.waitForSelector('#finlink');
  ok((await DB(p2)).outbox.some(m => m.to === 'zhanel@mail.com'), 'письмо для привязки отправлено');
  await p2.fill('#lp', 'zhanel-pass1'); await p2.click('#finlink'); await p2.waitForSelector('#lmsg:has-text("не подтверждена")'); ok(true, 'до подтверждения почты привязка не завершается');
  await setDB(p2, "db.users['zhanel@mail.com'].confirmed = true;"); await p2.click('#finlink'); await p2.waitForFunction(() => JP.cloud.authed && !JP.cloud.token());
  const d3 = await DB(p2); ok(d3.students[0].email === 'zhanel@mail.com' && !!d3.students[0].state.units['eg-5'], 'email привязан к тому же ученику, прогресс сохранён');
  ok(await p2.evaluate(() => !localStorage.getItem('b1.student.token')) && !(await DB(p2)).sessions.legtok, 'старый вход по токену отключён');
  // вход со старым логином, похожим на email
  await setDB(p2, "db.students.push({ id: 's9', name: 'Диас', login: 'diyas@mail.com', password: 'old-pass-123', state: null, created_at: new Date().toISOString(), last_seen: new Date().toISOString() });");
  const p3 = await (await newCtx()).newPage(); await p3.goto(url + '#/login'); await p3.evaluate(db => localStorage.setItem('__mockdb', db), JSON.stringify({ ...(await DB(p2)), current: null })); await p3.reload(); await p3.waitForSelector('#lg');
  await p3.fill('#lg', 'diyas@mail.com'); await p3.fill('#pw', 'old-pass-123'); await p3.click('#go'); await p3.waitForFunction(() => JP.cloud.token()); ok(true, 'ученик, регистрировавшийся по логину, по-прежнему входит (логин, похожий на email)'); await p3.close();

  // ===== D. Кабинет преподавателя =====
  await p.goto(url + '#/admin'); await p.waitForSelector('#em').catch(async () => { await p.evaluate(() => JP.cloud.logoutStudent()); await p.goto(url + '#/admin'); await p.waitForSelector('#em'); });
  await p.fill('#em', 'almirzhan@gmail.com'); await p.fill('#pw', 'wrong'); await p.click('#in'); await p.waitForSelector('#msg:has-text("Неверный")'); ok(true, 'неверный пароль преподавателя отклоняется');
  await p.fill('#pw', 'secret123'); await p.click('#in'); await p.waitForSelector('.adm-side');
  ok(await p.locator('.adm-side nav a').count() === 4 && await p.locator('text=Требуют внимания').count() === 1, 'после входа открывается обзор с разделами «Обзор / Ученики / Коды / Глазами ученика»');
  await p.click('.adm-side nav a:has-text("Ученики")'); await p.waitForSelector('#list .adm-tr');
  ok(await p.locator('#list .adm-tr:has-text("Мария")').count() === 1 && await p.locator('text=maria@mail.com').count() > 0, 'в списке ученик виден с подтверждённым email');
  await p.fill('#q', 'maria@'); ok(await p.locator('#list .adm-tr').count() === 1, 'поиск по email работает'); await p.fill('#q', 'нет такого'); await p.waitForSelector('text=Никого не нашли'); await p.fill('#q', '');
  await p.click('.adm-side nav a:has-text("Коды")'); await p.waitForSelector('#mkn'); await p.fill('#lab', 'Пачка'); await p.fill('#cnt', '5'); await p.click('#mkn'); await p.waitForSelector('#clist [data-invite]');
  ok((await DB(p)).invites.filter(i => /^Пачка/.test(i.label || '')).length === 5, 'создаётся пачка из 5 кодов');
  await p.click('#cflt [data-f=used]'); ok(await p.locator('#clist:has-text("использован: Мария")').count() === 1, 'видно, кто воспользовался кодом');
  await p.click('#cflt [data-f=free]');
  const inv = await p.evaluate(() => { let txt = ''; Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); Object.defineProperty(navigator, 'clipboard', { value: { writeText: t => { txt = t; return Promise.resolve(); } }, configurable: true }); document.querySelector('[data-invite]').click(); return new Promise(r => setTimeout(() => r(txt), 100)); });
  ok(/#\/login\?code=/.test(inv) && /email/.test(inv), 'приглашение содержит ссылку с кодом и просьбу подтвердить email');
  // сброс доступа: ученик регистрируется с новым email и сохраняет прогресс
  await p.click('.adm-side nav a:has-text("Ученики")'); await p.waitForSelector('#list .adm-tr'); await p.click('#list .adm-tr:has-text("Мария")'); await p.waitForSelector('#t-dash .dash');
  ok(await p.locator('#t-dash:has-text("Минуты по неделям")').count() === 1, 'карточка ученика показывает полный дашборд'); 
  await p.click('#rec'); await p.waitForSelector('#ci'); const reset = (await DB(p)).invites.find(i => i.student_id === 's1' && !i.used_at); ok(!!reset, 'создаётся код сброса доступа для ученика');
  const p4 = await (await newCtx()).newPage(); await p4.goto(url + '#/login'); await p4.evaluate(db => localStorage.setItem('__mockdb', db), JSON.stringify({ ...(await DB(p)), current: null })); await p4.reload(); await p4.waitForSelector('[data-m=reg]');
  await p4.click('[data-m=reg]'); for (const [k, v] of Object.entries({ code: reset.code, nm: 'Мария', em: 'maria.new@mail.com', pw: 'another-pass1', pw2: 'another-pass1' })) await p4.fill('#' + k, v); await p4.click('#go'); await p4.waitForSelector('text=Проверьте почту');
  await p4.evaluate(() => { const db = JSON.parse(localStorage.getItem('__mockdb')); db.users['maria.new@mail.com'].confirmed = true; localStorage.setItem('__mockdb', JSON.stringify(db)); });
  await p4.click('#go'); await p4.waitForFunction(() => JP.cloud.authed);
  ok((await p4.evaluate(() => JSON.parse(localStorage.getItem('__mockdb')).students.find(s => s.id === 's1').email)) === 'maria.new@mail.com' && await p4.evaluate(() => !!JP.store.get().units['eg-1']), 'по коду сброса ученик входит с новым email, прогресс сохранён');
  // ===== E. Просмотр глазами ученика =====
  await p.goto(url + '#/admin/preview'); await p.waitForSelector('#pdemo');
  const own = await p.evaluate(() => localStorage.getItem('b1.platform.v1')); const pushes0 = (await DB(p)).pushes;
  const grab = async sel => { await p.evaluate(() => { window.__pv = null; window.open = u => { window.__pv = u; return {}; }; }); await p.click(sel); const u = await p.evaluate(() => window.__pv); return u.replace(/^.*?\/\?/, url + '?'); };
  const demoUrl = await grab('#pdemo'); ok(/preview=demo/.test(demoUrl), 'кнопка «Тестовый ученик с прогрессом» открывает платформу в режиме просмотра');
  const v = await ctx.newPage(); v.on('pageerror', e => errs.push('v: ' + e.message)); v.on('console', m => m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME/.test(m.text()) && errs.push('v: ' + m.text()));
  await v.goto(demoUrl); await v.waitForSelector('#previewbar'); await v.waitForSelector('h1:has-text("Тестовый ученик")');
  ok(await v.locator('#previewbar:has-text("все этапы открыты")').count() === 1, 'сверху заметная полоса «режим просмотра»');
  ok(await v.evaluate(() => JP.store.get().profile.name === 'Тестовый ученик' && Object.keys(JP.store.get().units).length >= 20), 'тестовый ученик с готовым прогрессом открывается без входа');
  await v.goto(url + '?preview=demo#/unit/mu-9'); await v.waitForSelector('h1'); ok(await v.locator('text=пока закрыт').count() === 0 && await v.locator('h1:has-text("Present perfect continuous")').count() === 1, 'в режиме просмотра открыт любой этап (урок B1 доступен)');
  await v.goto(url + '#/progress'); await v.waitForSelector('.dash'); ok(await v.locator('.dash:has-text("Календарь занятий")').count() === 1, 'у тестового ученика заполнен дашборд прогресса');
  await v.evaluate(async () => { JP.E.completeUnit('eg-2', 0.5); JP.store.save(); await JP.cloud.flush(); });
  const after = await DB(p); ok(after.pushes === pushes0, 'действия в режиме просмотра не отправляются на сервер');
  ok((await p.evaluate(() => localStorage.getItem('b1.platform.v1'))) === own, 'настоящие данные браузера не затронуты');
  await v.click('#pvexit'); await v.waitForURL(/#\/admin/, { timeout: 8000 }).catch(() => {}); await v.waitForTimeout(400); ok(/#\/admin/.test(v.url()) && await v.evaluate(() => !sessionStorage.getItem('b1.preview')), 'кнопка «Выйти из просмотра» возвращает в кабинет и снимает режим просмотра');
  await p.goto(url + '#/admin/preview'); await p.waitForSelector('#pnew'); const newUrl = await grab('#pnew');
  const v2 = await ctx.newPage(); await v2.goto(newUrl); await v2.waitForSelector('#chat'); ok(await v2.locator('#previewbar:has-text("с нуля")').count() === 1, '«Новый ученик с нуля» открывает знакомство с Эми без входа'); await v2.close();
  await p.goto(url + '#/admin/preview'); await p.waitForSelector('[data-as]'); const asUrl = await grab('[data-as]'); ok(/preview=student/.test(asUrl) && /as=/.test(asUrl), 'у каждого ученика есть кнопка «Открыть» (просмотр его глазами)');
  const v3 = await ctx.newPage(); await v3.goto(asUrl); await v3.waitForSelector('#previewbar'); await v3.waitForSelector('h1');
  ok(await v3.evaluate(() => !!JP.store.get().units['eg-1']) && await v3.locator('#previewbar:has-text("не сохраняются")').count() === 1, 'просмотр «как ученик» показывает его прогресс и предупреждает, что изменения не сохраняются');
  await v3.close(); await v.close();

  ok(errs.length === 0, 'нет ошибок в консоли' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' проверок не пройдено' : 'Все проверки пройдены'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
