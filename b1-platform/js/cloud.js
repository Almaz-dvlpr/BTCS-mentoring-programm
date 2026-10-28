// Облако: регистрация и вход учеников по email (с подтверждением письмом), старый вход по токену, автосохранение прогресса, вход преподавателя.
// Ключ ниже публичный (publishable): доступ к данным защищён правилами в базе (RLS) и проверкой пользователя в функциях.
(function (JP) {
  const URL = 'https://sbuwwbqteuzeqbtvgcug.supabase.co';
  const KEY = 'sb_publishable_-t7CmS02GtCWhAN5L2KoyA_wQnuEA_U';
  const TOKEN_KEY = 'b1.student.token', PENDING_KEY = 'b1.pending';
  const C = { enabled: !!(window.supabase && window.supabase.createClient), status: 'off', authed: false, email: null, phone: null, needClaim: false, smsEnabled: false };
  const sb = C.enabled ? window.supabase.createClient(URL, KEY, { auth: { persistSession: true, storageKey: 'b1.teacher.auth', autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } }) : null;
  C.sb = sb;

  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} } };
  const get = () => (JP.preview ? null : ls.get(TOKEN_KEY));
  const pending = () => { try { return JSON.parse(ls.get(PENDING_KEY) || 'null'); } catch (e) { return null; } };
  const setPending = o => ls.set(PENDING_KEY, o ? JSON.stringify(o) : null);
  C.token = get; C.pending = pending;
  C.hasAccess = () => !!JP.preview || !!get() || C.authed;
  C.err = e => {
    const m = String((e && e.message) || e || '');
    const map = [[/bad_code/, 'Код не найден или уже использован. Проверьте символы или попросите новый код.'], [/name_required/, 'Впишите своё имя.'], [/login_taken/, 'Этот логин уже занят, придумайте другой.'],
      [/weak_password|at least 6|Password should be/i, 'Пароль должен быть не короче 8 символов.'], [/bad_login/, 'Логин должен быть не короче 3 символов.'], [/bad_credentials|Invalid login/i, 'Неверный email/логин или пароль.'],
      [/locked/, 'Слишком много попыток. Подождите 15 минут.'], [/already_set/, 'Пароль уже задан.'], [/already_linked/, 'Этот ученик уже привязан к другому email.'],
      [/Email not confirmed/i, 'Почта ещё не подтверждена: откройте письмо и перейдите по ссылке, затем войдите снова.'], [/rate limit|too many requests|over_email/i, 'Слишком много писем за короткое время. Подождите немного и попробуйте снова.'],
      [/valid email|invalid format|Unable to validate email/i, 'Проверьте адрес email.'], [/Token has expired|invalid.*(otp|token)|otp_expired/i, 'Неверный или просроченный код. Запросите новый.'], [/Error sending.*(otp|sms)|sms.*(provider|disabled|not enabled)|phone provider|provider.*(configured|disabled)|Unsupported phone/i, 'SMS сейчас недоступны. Попробуйте зарегистрироваться по email.'], [/phone.*(invalid|format)|invalid.*phone/i, 'Проверьте номер телефона.'], [/not_authenticated/, 'Сначала войдите.'], [/Failed to fetch|NetworkError/i, 'Нет связи с сервером. Проверьте интернет.']];
    for (const [re, t] of map) if (re.test(m)) return t; return m;
  };

  // ---------- Ученик: данные ----------
  const accept = data => {
    if (data.token) ls.set(TOKEN_KEY, data.token);
    if (data.state && data.state.units) JP.store.importObj(data.state);
    const s = JP.store.get(); s.seen.cloudName = data.name || s.seen.cloudName; s.seen.cloudLogin = data.login || s.seen.cloudLogin || null; s.seen.cloudEmail = data.email || s.seen.cloudEmail || null; s.seen.cloudPhone = data.phone || s.seen.cloudPhone || null; JP.store.save();
    return data;
  };
  let timer = null, inflight = false, dirty = false;
  const push = async () => {
    if (!C.enabled || JP.preview || !C.hasAccess() || JP.store.isSwapped()) return;
    if (inflight) { dirty = true; return; }
    inflight = true; dirty = false;
    try {
      const { error } = await sb.rpc('b1_push', { p_token: C.authed ? null : get(), p_state: JSON.parse(JP.store.exportJSON()) });
      if (error) throw error; C.status = 'ok'; C.lastSync = Date.now();
    } catch (e) { C.status = /bad_token/.test(String(e.message)) ? 'revoked' : 'err'; }
    inflight = false; if (dirty) schedule();
  };
  const schedule = () => { if (!C.enabled || JP.preview || !C.hasAccess() || JP.store.isSwapped()) return; clearTimeout(timer); timer = setTimeout(push, 2500); };
  C.flush = () => { clearTimeout(timer); return push(); };
  const origSave = JP.store.save.bind(JP.store);
  JP.store.save = function () { origSave(); schedule(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) C.flush(); });
  window.addEventListener('pagehide', () => { C.flush(); });

  // Определяем, есть ли у вошедшего пользователя профиль ученика; при необходимости завершаем регистрацию по сохранённому коду.
  C.resolve = async () => {
    C.authed = false; C.needClaim = false;
    if (!C.enabled) return;
    const { data: { session } } = await sb.auth.getSession(); if (!session) return;
    C.email = session.user && session.user.email; C.phone = (session.user && session.user.phone) || null;
    let me = await sb.rpc('b1_me', { p_token: null });
    if (me.error) {
      const pd = pending();
      try {
        if (pd && pd.legacyToken) { const r = await sb.rpc('b1_claim_legacy', { p_token: pd.legacyToken }); if (r.error) throw r.error; accept(Object.assign({}, r.data, { token: null })); await sb.rpc('b1_logout', { p_token: pd.legacyToken }); ls.set(TOKEN_KEY, null); }
        else if (pd && pd.code) { const r = await sb.rpc('b1_claim', { p_code: pd.code, p_name: pd.name || '' }); if (r.error) throw r.error; accept(r.data); }
        else { C.needClaim = !(await C.isTeacher()); return; }
        setPending(null); C.authed = true; C.status = 'ok'; return;
      } catch (x) { C.needClaim = true; C.claimError = C.err(x); return; }
    }
    C.authed = true; C.status = 'ok'; accept(me.data); // сервер — источник истины для нового устройства
  };
  C.claim = async (code, name) => {
    const r = await sb.rpc('b1_claim', { p_code: code, p_name: name }); if (r.error) throw r.error;
    accept(r.data); setPending(null); C.authed = true; C.needClaim = false; C.status = 'ok'; return r.data;
  };
  C.checkCode = async code => { const { data, error } = await sb.rpc('b1_check_code', { p_code: code }); if (error) throw error; return data; };
  // регистрация нового ученика: проверка кода → создание учётной записи → письмо с подтверждением
  C.register = async (code, name, email, password) => {
    const chk = await C.checkCode(code); if (!chk || !chk.ok) throw new Error('bad_code');
    setPending({ code, name, email });
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: location.origin + '/' } });
    if (error) { setPending(null); throw error; }
    if (data.session) { await C.resolve(); return { confirmed: true }; }
    return { confirmed: false };
  };
  C.loginEmail = async (email, password) => {
    const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error;
    await C.resolve(); return { linked: C.authed };
  };
  // старый вход по логину (для тех, кто регистрировался до email)
  C.loginLegacy = async (login, password) => {
    const { data, error } = await sb.rpc('b1_login', { p_login: login, p_password: password });
    if (error) throw error; if (data && data.error) throw new Error(data.error); accept(data); return data;
  };
  C.forgot = async email => { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/' }); if (error) throw error; };
  C.setNewPassword = async pw => { const { error } = await sb.auth.updateUser({ password: pw }); if (error) throw error; };
  C.changePassword = async (oldPw, newPw) => {
    if (C.authed) {
      const ident = C.email ? { email: C.email } : { phone: (String(C.phone || '').startsWith('+') ? '' : '+') + C.phone };
      const { error: e1 } = await sb.auth.signInWithPassword(Object.assign({ password: oldPw }, ident)); if (e1) throw new Error('bad_credentials');
      const { error } = await sb.auth.updateUser({ password: newPw }); if (error) throw error; JP.store.get().seen.pwSet = true; JP.store.save(); return { ok: true };
    }
    const { data, error } = await sb.rpc('b1_change_password', { p_token: get(), p_old: oldPw, p_new: newPw });
    if (error) throw error; if (data && data.error) throw new Error(data.error); return data;
  };
  // привязка email к ученику, который вошёл по старому коду
  C.linkEmail = async (email, password) => {
    const tok = get(); if (!tok) throw new Error('bad_token');
    setPending({ legacyToken: tok, email });
    const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + '/' } });
    if (error) { setPending(null); throw error; }
    if (data.session) { await C.resolve(); return { confirmed: true }; }
    return { confirmed: false };
  };
  C.finishLink = async password => {
    const pd = pending(); if (!pd || !pd.email) throw new Error('bad_credentials');
    await C.loginEmail(pd.email, password); if (!C.authed) throw new Error(C.claimError || 'already_linked'); return true;
  };
  C.logoutStudent = async () => {
    const t = get(); try { if (t && sb) await sb.rpc('b1_logout', { p_token: t }); if (sb) await sb.auth.signOut(); } catch (e) {}
    ls.set(TOKEN_KEY, null); setPending(null); C.authed = false; C.needClaim = false; C.status = 'off';
  };
  C.me = async () => { const { data, error } = await sb.rpc('b1_me', { p_token: C.authed ? null : get() }); if (error) throw error; return data; };

  // ---------- Телефон и SMS ----------
  // номер → формат E.164 (+7…): 8701… и 701… приводятся к +7; вернёт null, если не похоже на номер
  C.normPhone = v => { let d = String(v || '').replace(/[^\d+]/g, ''); if (!d) return null; if (d[0] !== '+') { if (d.length === 11 && (d[0] === '8')) d = '+7' + d.slice(1); else if (d.length === 11 && d[0] === '7') d = '+' + d; else if (d.length === 10) d = '+7' + d; else d = '+' + d; } return /^\+\d{10,15}$/.test(d) ? d : null; };
  C.looksPhone = v => /^[+\d][\d\s\-()]{8,}$/.test(String(v || '').trim());
  C.sendOtp = async phone => { const { error } = await sb.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } }); if (error) throw error; };
  C.verifyOtp = async (phone, token) => { const { error } = await sb.auth.verifyOtp({ phone, token: String(token).replace(/\D/g, ''), type: 'sms' }); if (error) throw error; await C.resolve(); return { linked: C.authed }; };
  // регистрация нового ученика по телефону: проверка кода приглашения → SMS
  C.registerPhone = async (code, name, phone) => { const chk = await C.checkCode(code); if (!chk || !chk.ok) throw new Error('bad_code'); setPending({ code, name, phone }); await C.sendOtp(phone); };
  C.loginPhone = async (phone, password) => { const { error } = await sb.auth.signInWithPassword({ phone, password }); if (error) throw error; await C.resolve(); return { linked: C.authed }; };
  // ученик со старым входом привязывает телефон
  C.linkPhone = async phone => { const tok = get(); if (!tok) throw new Error('bad_token'); setPending({ legacyToken: tok, phone }); await C.sendOtp(phone); };
  C.finishLinkPhone = async (phone, token) => { await C.verifyOtp(phone, token); if (!C.authed) throw new Error(C.claimError || 'already_linked'); return true; };
  C.setPasswordFirst = async pw => { await C.setNewPassword(pw); const s = JP.store.get(); s.seen.pwSet = true; JP.store.save(); };
  C.loadSettings = async () => { try { const { data, error } = await sb.rpc('b1_get_settings'); if (!error && data) C.smsEnabled = !!data.sms; } catch (e) {} return C.smsEnabled; };
  C.setSms = async on => { const { data, error } = await sb.rpc('b1_set_sms', { p_on: !!on }); if (error) throw error; C.smsEnabled = !!data.sms; return C.smsEnabled; };

  // ---------- Преподаватель ----------
  C.session = async () => { const { data } = await sb.auth.getSession(); return data.session; };
  C.isTeacher = async () => { const { data, error } = await sb.rpc('b1_is_teacher'); return !error && data === true; };
  C.signIn = async (email, password) => { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; };
  C.signUp = async (email, password) => { const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + '/#/admin' } }); if (error) throw error; return data; };
  C.signOut = () => sb.auth.signOut();
  C.students = async () => { const { data, error } = await sb.from('b1_students').select('id,name,login,email,phone,created_at,last_seen,state,state_updated').order('last_seen', { ascending: false }); if (error) throw error; return data; };
  C.invitesAll = async () => { const { data, error } = await sb.from('b1_invites').select('code,label,student_id,created_at,used_at').order('created_at', { ascending: false }); if (error) throw error; return data; };
  C.invites = async () => { const { data, error } = await sb.from('b1_invites').select('code,label,student_id,created_at,used_at').is('used_at', null).order('created_at', { ascending: false }); if (error) throw error; return data; };
  C.createInvite = async (label, studentId) => { const { data, error } = await sb.rpc('b1_create_invite', { p_label: label || null, p_student_id: studentId || null }); if (error) throw error; return data; };
  C.deleteInvite = async code => { const { error } = await sb.from('b1_invites').delete().eq('code', code); if (error) throw error; };
  C.deleteStudent = async id => { const { error } = await sb.from('b1_students').delete().eq('id', id); if (error) throw error; };

  // ---------- Запуск ----------
  C.ready = (async () => {
    if (!C.enabled || JP.preview) return;
    try { await C.resolve(); } catch (e) {}
    await C.loadSettings();
    if (get() && !C.authed) { try { await C.me().then(() => { C.status = 'ok'; }); } catch (e) { C.status = /bad_token/.test(String(e.message)) ? 'revoked' : 'err'; } }
    else if (C.authed) { try { await push(); } catch (e) {} }
    sb.auth.onAuthStateChange(evt => {
      setTimeout(async () => {
        if (evt === 'PASSWORD_RECOVERY') { C.recovering = true; location.hash = '#/recover'; return; }
        if (evt === 'SIGNED_IN' && !C.authed && !C.recovering) { try { await C.resolve(); } catch (e) {} if (C.authed && JP.ui) JP.ui.dispatch(); }
      }, 0);
    });
  })();
  JP.cloud = C;
})(window.JP);
