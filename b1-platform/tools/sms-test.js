// Тест регистрации и входа по телефону (SMS-код) на имитации Supabase: node tools/sms-test.js
// Сам SMS-провайдер здесь не проверяется: код в имитации всегда 123456.
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
const FAKE = `
const K = '__sdb', TEACHER = 'almirzhan@gmail.com', OTP = '123456';
const fresh = () => ({ sms: false, n: 1, current: null, outbox: [], pushes: 0, sessions: {}, students: [], users: { [TEACHER]: { id: 'u-t', email: TEACHER, password: 'secret123' } },
  invites: [{ code: 'ABCDE-FGHJK', label: 'Айгерим', student_id: null, used_at: null, created_at: new Date().toISOString() }, { code: 'QWERT-YUIOP', label: '', student_id: null, used_at: null, created_at: new Date().toISOString() }] });
const load = () => JSON.parse(localStorage.getItem(K) || JSON.stringify(fresh())); const save = d => localStorage.setItem(K, JSON.stringify(d));
const norm = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const cur = db => db.current && Object.values(db.users).find(u => u.id === db.current);
const digits = p => String(p || '').replace(/\\D/g, '');
const who = (db, tok) => { const u = cur(db); let s = u && db.students.find(x => x.auth_uid === u.id); if (!s && tok) s = db.students.find(x => x.id === db.sessions[tok]); return s; };
window.supabase = { createClient() { save(load()); return {
  rpc: async (fn, a) => { const db = load(); const done = r => { save(db); return r; }; const u = cur(db);
    if (fn === 'b1_get_settings') return { data: { sms: !!db.sms } };
    if (fn === 'b1_set_sms') { if (!u || u.email !== TEACHER) return { error: { message: 'forbidden' } }; db.sms = !!a.p_on; return done({ data: { sms: db.sms } }); }
    if (fn === 'b1_is_teacher') return { data: !!u && u.email === TEACHER };
    if (fn === 'b1_check_code') { const i = db.invites.find(x => norm(x.code) === norm(a.p_code) && !x.used_at); return { data: i ? { ok: true, reset: !!i.student_id } : { ok: false } }; }
    if (fn === 'b1_me') { const s = who(db, a.p_token); return s ? { data: { name: s.name, email: s.email, phone: s.phone, linked: !!s.auth_uid, state: s.state } } : { error: { message: 'bad_token' } }; }
    if (fn === 'b1_push') { const s = who(db, a.p_token); if (!s) return { error: { message: 'bad_token' } }; s.state = a.p_state; s.last_seen = new Date().toISOString(); db.pushes++; return done({ data: null }); }
    if (fn === 'b1_claim') { if (!u) return { error: { message: 'not_authenticated' } }; let s = db.students.find(x => x.auth_uid === u.id);
      if (!s) { const inv = db.invites.find(x => norm(x.code) === norm(a.p_code) && !x.used_at); if (!inv) return { error: { message: 'bad_code' } };
        s = { id: 's' + (db.students.length + 1), name: a.p_name, email: u.email || null, phone: u.phone || null, auth_uid: u.id, state: null, created_at: new Date().toISOString(), last_seen: null }; db.students.push(s); inv.student_id = s.id; inv.used_at = new Date().toISOString(); }
      return done({ data: { name: s.name, state: s.state, email: s.email, phone: s.phone } }); }
    if (fn === 'b1_claim_legacy') { if (!u) return { error: { message: 'not_authenticated' } }; const s = db.students.find(x => x.id === db.sessions[a.p_token]); if (!s) return { error: { message: 'bad_token' } };
      if (s.auth_uid && s.auth_uid !== u.id) return { error: { message: 'already_linked' } }; s.auth_uid = u.id; s.phone = u.phone || null; s.email = u.email || null; return done({ data: { name: s.name, state: s.state, phone: s.phone } }); }
    if (fn === 'b1_logout') { delete db.sessions[a.p_token]; return done({ data: null }); }
    return { error: { message: 'unknown rpc ' + fn } }; },
  from: t => { const q = { select() { return q; }, order() { return q; }, is() { q._is = true; return q; },
    then(res) { const db = load(); return res({ data: t === 'b1_students' ? db.students : (q._is ? db.invites.filter(i => !i.used_at) : db.invites), error: null }); } }; return q; },
  auth: {
    getSession: async () => { const db = load(), u = cur(db); return { data: { session: u ? { user: { id: u.id, email: u.email, phone: u.phone ? digits(u.phone) : undefined } } : null } }; },
    signInWithOtp: async ({ phone }) => { const db = load(); if (db.sms === 'broken') return { error: { message: 'Unsupported phone provider' } }; db.outbox.push({ to: phone, kind: 'sms' }); save(db); return { error: null }; },
    verifyOtp: async ({ phone, token }) => { const db = load(); if (token !== OTP) return { error: { message: 'Token has expired or is invalid' } };
      let u = Object.values(db.users).find(x => x.phone && digits(x.phone) === digits(phone)); if (!u) { u = { id: 'u' + (++db.n), phone, password: null }; db.users['p' + digits(phone)] = u; } db.current = u.id; save(db); return { error: null }; },
    signInWithPassword: async ({ email, phone, password }) => { const db = load(); const u = Object.values(db.users).find(x => (email && x.email === email) || (phone && x.phone && digits(x.phone) === digits(phone)));
      if (!u || !u.password || u.password !== password) return { error: { message: 'Invalid login credentials' } }; db.current = u.id; save(db); return { error: null }; },
    signOut: async () => { const db = load(); db.current = null; save(db); },
    updateUser: async ({ password }) => { const db = load(), u = cur(db); if (!u) return { error: { message: 'not_authenticated' } }; u.password = password; save(db); return { error: null }; },
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } }; } };`;
const PROFILE = (n, unit) => `const s = JP.store.get(), t = JP.U.today(); s.profile = { name: ${JSON.stringify(n)}, reasons: [], difficulties: [], daysPerWeek: 7, studyDays: [0,1,2,3,4,5,6], minutesPerDay: 30, bestTime: 'evening', formats: [], liveLessons: 0, liveDays: [], hasBooks: 'all', tone: 'soft', startedAt: t }; s.placement = { done: true, stage: 1, by: { A1: { n: 8, ok: 5 }, A2: { n: 10, ok: 1 }, 'A2+': { n: 6, ok: 0 }, B1: { n: 6, ok: 0 } }, wrong: [] }; JP.E.invalidate(); ${unit ? `JP.E.completeUnit(${JSON.stringify(unit)}, 0.9);` : ''} s.days[t] = { tasks: [], minutes: 25 }; JP.store.save();`;
const DB = pg => pg.evaluate(() => JSON.parse(localStorage.getItem('__sdb')));
const setDB = (pg, body) => pg.evaluate(f => { const db = JSON.parse(localStorage.getItem('__sdb')); new Function('db', f)(db); localStorage.setItem('__sdb', JSON.stringify(db)); }, body);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async db => { const c = await b.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' }); await c.route('**/supabase.js', r => r.fulfill({ contentType: 'application/javascript', body: FAKE }));
    const pg = await c.newPage(); pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|Failed to load resource/.test(m.text()) && errs.push(m.text()));
    await pg.goto(url + '#/login'); await pg.waitForSelector('#lg, [data-m]');
    if (db) { await pg.evaluate(d => localStorage.setItem('__sdb', d), JSON.stringify(db)); await pg.reload(); await pg.waitForSelector('#lg, [data-m]'); } return pg; };
  const msgOf = async p => (await p.locator('#msg').textContent()) || '';
  const fill = async (p, o) => { for (const [k, v] of Object.entries(o)) await p.fill('#' + k, v); };
  const base = (await (async () => { const p = await mk(); const d = await DB(p); await p.context().close(); return d; })());

  // ===== A. Переключатель выключен: телефон не предлагается =====
  let p = await mk();
  ok(await p.locator('#smslogin').count() === 0 && (await p.locator('label[for=lg]').textContent()).trim() === 'Email', 'пока SMS выключен, вход только по email, кнопки SMS нет');
  await p.click('[data-m=reg]'); ok(await p.locator('[data-meth]').count() === 0 && await p.locator('#em').count() === 1, 'при выключенном SMS регистрация только по email');
  await p.context().close();

  // ===== B. Включено: регистрация по телефону =====
  p = await mk({ ...base, sms: true });
  ok(await p.locator('#smslogin').count() === 1, 'при включённом SMS появляется «Войти по SMS-коду»');
  await p.click('[data-m=reg]'); await p.waitForSelector('[data-meth=phone].on'); ok(await p.locator('#ph').count() === 1 && await p.locator('#em').count() === 0, 'регистрация по умолчанию по телефону');
  await fill(p, { code: 'WRONG-CODE1', nm: 'Айгерим', ph: '8 701 123 45 67' }); await p.click('#go'); await p.waitForSelector('#msg:has-text("не найден")');
  ok((await DB(p)).outbox.length === 0, 'неверный код приглашения: SMS не отправляется');
  await fill(p, { code: 'abcde fghjk', ph: '12' }); await p.click('#go'); ok((await msgOf(p)).includes('номер'), 'неверный номер не принимается');
  await fill(p, { ph: '8 701 123 45 67' }); await p.click('#go'); await p.waitForSelector('#otp');
  { const d = await DB(p); ok(d.outbox.length === 1 && d.outbox[0].to === '+77011234567', 'номер 8 701… приведён к +77011234567, SMS отправлено'); ok(d.invites[0].used_at === null, 'код приглашения не расходуется до подтверждения номера'); }
  ok(!(await p.locator('#f').innerText()).includes('7011234567'), 'номер на экране кода частично скрыт');
  ok(await p.locator('#resend:disabled').count() === 1, 'повторная отправка заблокирована на 30 секунд');
  await p.fill('#otp', '000000'); await p.click('#go'); await p.waitForSelector('#msg:has-text("код")'); ok((await DB(p)).students.length === 0, 'неверный код из SMS отклоняется, ученик не создан');
  await p.fill('#otp', '123456'); await p.click('#go'); await p.waitForSelector('#pw');
  { const d = await DB(p); ok(d.students.length === 1 && d.students[0].phone === '+77011234567' && d.students[0].name === 'Айгерим' && d.invites[0].used_at, 'после кода ученик создан с телефоном, код расходован'); }
  await fill(p, { pw: 'short', pw2: 'short' }); await p.click('#go'); ok((await msgOf(p)).includes('не короче 8'), 'короткий пароль не принимается');
  await fill(p, { pw: 'phone-pass1', pw2: 'phone-pass1' }); await p.click('#go'); await p.waitForSelector('#chat'); ok(true, 'пароль задан, ученик попадает в знакомство');
  ok((await DB(p)).users.p77011234567.password === 'phone-pass1', 'пароль сохранён у учётной записи по телефону');
  await p.evaluate(`(async () => { ${PROFILE('Айгерим','eg-1')} await JP.cloud.flush(); })()`);
  ok((await DB(p)).pushes >= 1, 'прогресс сохраняется на сервере под учётной записью по телефону');

  // ===== C. Выход, вход по телефону и паролю, вход по SMS =====
  await p.goto(url + '#/more'); await p.waitForSelector('#logout'); ok((await p.locator('.card:has(#logout)').first().innerText()).includes('+77011234567'), 'в профиле виден номер телефона');
  ok(await p.locator('#setpw').count() === 0 && await p.locator('#chpw').count() === 1, 'пароль уже задан: блока «Задайте пароль» нет, есть смена пароля');
  p.once('dialog', d => d.accept()); await p.click('#logout'); await p.waitForSelector('#lg');
  await p.fill('#lg', '+7 701 123-45-67'); await p.fill('#pw', 'wrong-pass1'); await p.click('#go'); await p.waitForSelector('#msg:has-text("Неверный")'); ok(true, 'неверный пароль при входе по телефону отклоняется');
  await p.fill('#pw', 'phone-pass1'); await p.click('#go'); await p.waitForFunction(() => JP.store.get().profile && JP.store.get().units['eg-1']); ok(true, 'вход по телефону и паролю возвращает прогресс');
  await p.goto(url + '#/more'); await p.waitForSelector('#logout'); p.once('dialog', d => d.accept()); await p.click('#logout'); await p.waitForSelector('#lg');
  await p.fill('#lg', ''); await p.click('#smslogin'); ok((await msgOf(p)).includes('номер'), 'вход по SMS без номера: подсказка');
  await p.fill('#lg', '87011234567'); await p.click('#smslogin'); await p.waitForSelector('#otp'); await p.fill('#otp', '123456'); await p.click('#go');
  await p.waitForFunction(() => JP.cloud.authed && JP.store.get().units['eg-1']); ok(true, 'вход только по SMS-коду, без пароля, возвращает прогресс');

  // ===== D. Забыли пароль по телефону =====
  await p.goto(url + '#/more'); await p.waitForSelector('#logout'); p.once('dialog', d => d.accept()); await p.click('#logout'); await p.waitForSelector('#forgot');
  await p.fill('#lg', '+77011234567'); await p.click('#forgot'); await p.waitForSelector('#otp'); await p.fill('#otp', '123456'); await p.click('#go'); await p.waitForSelector('#pw');
  ok(await p.locator('#skip').count() === 0, 'при восстановлении пароля пропустить нельзя');
  await fill(p, { pw: 'restored-pass1', pw2: 'restored-pass1' }); await p.click('#go'); await p.waitForFunction(() => JP.cloud.authed && JP.store.get().units['eg-1']);
  ok((await DB(p)).users.p77011234567.password === 'restored-pass1', 'новый пароль после SMS сохранён');
  await p.context().close();

  // ===== E. «Пропустить» пароль и задать его позже в профиле =====
  p = await mk({ ...base, sms: true }); await p.click('[data-m=reg]');
  await fill(p, { code: 'QWERTYUIOP', nm: 'Дана', ph: '+7 702 000 11 22' }); await p.click('#go'); await p.waitForSelector('#otp'); await p.fill('#otp', '123456'); await p.click('#go'); await p.waitForSelector('#skip'); await p.click('#skip'); await p.waitForSelector('#chat');
  await p.evaluate(`(() => { ${PROFILE('Дана')} })()`);
  await p.goto(url + '#/more'); await p.waitForSelector('#setpw'); ok(await p.locator('#chpw').count() === 0, 'без пароля в профиле предлагается «Задайте пароль», а не смена пароля');
  await p.fill('#sp1', 'later-pass1'); await p.fill('#sp2', 'other-pass12'); await p.click('#savesp'); await p.waitForSelector('#spmsg:has-text("не совпадают")');
  await p.fill('#sp2', 'later-pass1'); await p.click('#savesp'); await p.waitForSelector('#chpw'); ok((await DB(p)).users.p77020001122.password === 'later-pass1' && await p.locator('#setpw').count() === 0, 'пароль задан позже в профиле, появилась смена пароля');
  await p.context().close();

  // ===== F. Старый ученик привязывает телефон =====
  const legacy = { ...base, sms: true, students: [{ id: 's1', name: 'Жанель', login: null, state: null, created_at: new Date().toISOString(), last_seen: new Date().toISOString() }], sessions: { legtok: 's1' } };
  p = await mk(legacy); await p.evaluate(() => localStorage.setItem('b1.student.token', 'legtok')); await p.reload(); await p.waitForTimeout(800);
  await p.evaluate(`(async () => { ${PROFILE('Жанель','eg-5')} await JP.cloud.flush(); })()`);
  await p.goto(url + '#/'); await p.waitForSelector('#linkbanner'); ok(await p.locator('#linkbanner:has-text("телефон или email")').count() === 1, 'напоминание на главной предлагает привязать телефон или email');
  await p.goto(url + '#/more'); await p.waitForSelector('#sendphone'); await p.fill('#lph', '12'); await p.click('#sendphone'); ok((await p.locator('#lmsg').textContent()).includes('номер'), 'неверный номер при привязке отклоняется');
  await p.fill('#lph', '8 707 555 66 77'); await p.click('#sendphone'); await p.waitForSelector('#finphone');
  await p.fill('#lcode', '000000'); await p.click('#finphone'); await p.waitForSelector('#lmsg:has-text("код")'); ok(true, 'неверный код при привязке отклоняется');
  await p.fill('#lcode', '123456'); await p.click('#finphone'); await p.waitForFunction(() => JP.cloud.authed && !JP.cloud.token());
  { const d = await DB(p); ok(d.students[0].phone === '+77075556677' && !!d.students[0].auth_uid && !d.sessions.legtok, 'телефон привязан к тому же ученику, старый токен отключён'); }
  ok(await p.evaluate(() => !!JP.store.get().units['eg-5']), 'прогресс сохранён после привязки');
  await p.context().close();

  // ===== G. Кабинет: переключатель SMS, телефон в списках =====
  const withStudent = { ...base, sms: false, students: [{ id: 's1', name: 'Айгерим', phone: '+77011234567', email: null, auth_uid: 'u9', state: null, created_at: new Date().toISOString(), last_seen: new Date().toISOString() }],
    invites: [{ code: 'ABCDE-FGHJK', label: 'Айгерим', student_id: 's1', used_at: new Date().toISOString(), created_at: new Date().toISOString() }, { code: 'ZZZZZ-AAAAA', label: '', student_id: null, used_at: null, created_at: new Date().toISOString() }] };
  p = await mk(withStudent); await p.goto(url + '#/admin'); await p.waitForSelector('#em'); await p.fill('#em', 'almirzhan@gmail.com'); await p.fill('#pw', 'secret123'); await p.click('#in'); await p.waitForSelector('#smstog');
  ok((await p.locator('.d-card:has(#smstog)').innerText()).includes('выключен'), 'в обзоре виден переключатель «Вход по SMS: выключен»');
  p.once('dialog', d => d.dismiss()); await p.click('#smstog'); await p.waitForTimeout(300); ok((await DB(p)).sms === false, 'при отказе в подтверждении переключатель не включается');
  p.once('dialog', d => d.accept()); await p.click('#smstog'); await p.waitForSelector('text=Вход по SMS: включён'); ok((await DB(p)).sms === true, 'преподаватель включает вход по SMS');
  await p.click('.adm-side nav a:has-text("Ученики")'); await p.waitForSelector('#list .adm-tr'); ok(await p.locator('#list .adm-tr:has-text("+77011234567")').count() === 1, 'в списке учеников виден телефон');
  await p.fill('#q', '7011234567'); ok(await p.locator('#list .adm-tr').count() === 1, 'поиск по телефону работает');
  await p.fill('#q', ''); await p.click('#list .adm-tr'); await p.waitForSelector('#t-dash'); ok(await p.locator('text=Телефон: +77011234567').count() === 1, 'в карточке ученика указан телефон');
  await p.click('.adm-side nav a:has-text("Коды")'); await p.waitForSelector('#cused'); ok((await p.locator('#cused').innerText()).includes('+77011234567'), 'в использованных кодах указан телефон ученика');
  const inv = await p.evaluate(() => { let txt = ''; Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); Object.defineProperty(navigator, 'clipboard', { value: { writeText: t => { txt = t; return Promise.resolve(); } }, configurable: true }); document.querySelector('[data-invite]').click(); return new Promise(r => setTimeout(() => r(txt), 300)); });
  ok(/#\/login\?code=/.test(inv) && /телефона/.test(inv) && /SMS/.test(inv), 'приглашение при включённом SMS просит указать телефон и ввести код из SMS');
  await p.click('.adm-side nav a:has-text("Обзор")'); await p.waitForSelector('#smstog'); await p.click('#smstog'); await p.waitForSelector('text=Вход по SMS: выключен'); ok((await DB(p)).sms === false, 'преподаватель может снова выключить SMS');
  await p.context().close();

  // ===== H. Ошибка провайдера =====
  p = await mk({ ...base, sms: true }); await setDB(p, 'db.sms = "broken";'); await p.evaluate(() => { JP.cloud.smsEnabled = true; }); await p.click('[data-m=reg]');
  await fill(p, { code: 'ABCDEFGHJK', nm: 'Тест', ph: '+77010000000' }); await p.click('#go'); await p.waitForSelector('#msg:has-text("SMS")'); ok(true, 'если SMS-провайдер не настроен, ученик видит понятную ошибку, а не пустой экран');
  await p.context().close();

  ok(errs.length === 0, 'нет ошибок в консоли' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' проверок не пройдено' : 'Все проверки пройдены'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
