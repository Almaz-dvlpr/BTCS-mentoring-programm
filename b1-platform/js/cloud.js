// Облако: вход ученика по одноразовому коду, автосохранение прогресса, вход преподавателя.
// Ключ ниже публичный (publishable): доступ к данным защищён правилами в базе (RLS) и токеном ученика.
(function (JP) {
  const URL = 'https://sbuwwbqteuzeqbtvgcug.supabase.co';
  const KEY = 'sb_publishable_-t7CmS02GtCWhAN5L2KoyA_wQnuEA_U';
  const TOKEN_KEY = 'b1.student.token';
  const C = { enabled: !!(window.supabase && window.supabase.createClient), status: 'off' };
  const sb = C.enabled ? window.supabase.createClient(URL, KEY, { auth: { persistSession: true, storageKey: 'b1.teacher.auth', autoRefreshToken: true, detectSessionInUrl: false } }) : null;
  C.sb = sb;

  const get = () => { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } };
  const set = t => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} };
  C.token = get;
  C.err = e => { const m = String((e && e.message) || e || ''); if (/bad_code/.test(m)) return 'Код не найден или уже использован. Проверьте символы или попросите новый код.'; if (/name_required/.test(m)) return 'Впишите своё имя.'; if (/login_taken/.test(m)) return 'Этот логин уже занят, придумайте другой.'; if (/weak_password/.test(m)) return 'Пароль должен быть не короче 8 символов.'; if (/bad_login/.test(m)) return 'Логин должен быть не короче 3 символов.'; if (/bad_credentials/.test(m)) return 'Неверный логин или пароль.'; if (/locked/.test(m)) return 'Слишком много попыток. Подождите 15 минут или попросите преподавателя сбросить пароль.'; if (/already_set/.test(m)) return 'Пароль уже задан.'; if (/Failed to fetch|NetworkError/i.test(m)) return 'Нет связи с сервером. Проверьте интернет.'; if (/Invalid login/i.test(m)) return 'Неверный email или пароль.'; return m; };

  // ---------- Ученик ----------
  const accept = data => {
    set(data.token);
    if (data.state && data.state.units) JP.store.importObj(data.state);
    const s = JP.store.get(); s.seen.cloudName = data.name; s.seen.cloudLogin = data.login || null; JP.store.save();
    return data;
  };
  // регистрация по одноразовому коду (или сброс пароля по коду восстановления)
  C.register = async (code, name, login, password) => {
    const { data, error } = await sb.rpc('b1_register', { p_code: code, p_name: name, p_login: login, p_password: password });
    if (error) throw error; return accept(data);
  };
  C.login = async (login, password) => {
    const { data, error } = await sb.rpc('b1_login', { p_login: login, p_password: password });
    if (error) throw error; return accept(data);
  };
  C.setCredentials = async (login, password) => {
    const { data, error } = await sb.rpc('b1_set_credentials', { p_token: get(), p_login: login, p_password: password });
    if (error) throw error; JP.store.get().seen.cloudLogin = data.login; JP.store.save(); return data;
  };
  C.me = async () => { const { data, error } = await sb.rpc('b1_me', { p_token: get() }); if (error) throw error; return data; };
  let timer = null, inflight = false, dirty = false;
  const push = async () => {
    if (!C.enabled || !get() || JP.store.isSwapped()) return;
    if (inflight) { dirty = true; return; }
    inflight = true; dirty = false;
    try {
      const { error } = await sb.rpc('b1_push', { p_token: get(), p_state: JSON.parse(JP.store.exportJSON()) });
      if (error) throw error;
      C.status = 'ok'; C.lastSync = Date.now();
    } catch (e) {
      C.status = /bad_token/.test(String(e.message)) ? 'revoked' : 'err';
    }
    inflight = false; if (dirty) schedule();
  };
  const schedule = () => { if (!C.enabled || !get() || JP.store.isSwapped()) return; clearTimeout(timer); timer = setTimeout(push, 2500); };
  C.flush = () => { clearTimeout(timer); return push(); };
  // автосохранение вместе с локальным
  const origSave = JP.store.save.bind(JP.store);
  JP.store.save = function () { origSave(); schedule(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) C.flush(); });
  window.addEventListener('pagehide', () => { C.flush(); });
  C.logoutStudent = async () => { const t = get(); try { if (t && sb) await sb.rpc('b1_logout', { p_token: t }); } catch (e) {} set(null); C.status = 'off'; };
  C.check = async () => { // при запуске: токен ещё действует?
    if (!C.enabled || !get()) return;
    try { const { error } = await sb.rpc('b1_me', { p_token: get() }); if (error) throw error; C.status = 'ok'; await push(); }
    catch (e) { C.status = /bad_token/.test(String(e.message)) ? 'revoked' : 'err'; }
  };

  // ---------- Преподаватель ----------
  C.session = async () => { const { data } = await sb.auth.getSession(); return data.session; };
  C.isTeacher = async () => { const { data, error } = await sb.rpc('b1_is_teacher'); return !error && data === true; };
  C.signIn = async (email, password) => { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; };
  C.signUp = async (email, password) => { const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + '/#/admin' } }); if (error) throw error; return data; };
  C.signOut = () => sb.auth.signOut();
  C.students = async () => { const { data, error } = await sb.from('b1_students').select('id,name,login,created_at,last_seen,state,state_updated').order('last_seen', { ascending: false }); if (error) throw error; return data; };
  C.invitesAll = async () => { const { data, error } = await sb.from('b1_invites').select('code,label,student_id,created_at,used_at').order('created_at', { ascending: false }); if (error) throw error; return data; };
  C.invites = async () => { const { data, error } = await sb.from('b1_invites').select('code,label,student_id,created_at,used_at').is('used_at', null).order('created_at', { ascending: false }); if (error) throw error; return data; };
  C.createInvite = async (label, studentId) => { const { data, error } = await sb.rpc('b1_create_invite', { p_label: label || null, p_student_id: studentId || null }); if (error) throw error; return data; };
  C.deleteInvite = async code => { const { error } = await sb.from('b1_invites').delete().eq('code', code); if (error) throw error; };
  C.deleteStudent = async id => { const { error } = await sb.from('b1_students').delete().eq('id', id); if (error) throw error; };

  JP.cloud = C;
  C.check();
})(window.JP);
