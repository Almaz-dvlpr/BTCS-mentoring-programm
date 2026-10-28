// Вход ученика по коду и кабинет преподавателя.
(function (JP) {
  const U = JP.U, ui = JP.ui, C = JP.cloud, S = () => JP.store.get(), esc = U.esc;

  // ---------- Вход и регистрация ученика ----------
  const field = (id, label, attrs) => `<label class="muted" for="${id}">${label}</label><input type="text" id="${id}" ${attrs || ''} style="margin-bottom:12px">`;
  const PWSTYLE = 'width:100%;font:inherit;border:2px solid var(--line);border-radius:12px;padding:11px 14px;min-height:46px;background:var(--card);color:var(--ink);margin-bottom:12px';
  const pwField = (id, label, ac) => `<label class="muted" for="${id}">${label}</label><input type="password" id="${id}" autocomplete="${ac}" style="${PWSTYLE}">`;
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const CODEF = pre => field('code', 'Код приглашения', `placeholder="XXXXX-XXXXX" value="${esc(pre)}" autocapitalize="characters" autocorrect="off" spellcheck="false" maxlength="14" style="font-size:1.2rem;letter-spacing:.1em;text-transform:uppercase"`);
  const maskPhone = p => String(p || '').replace(/^(\+\d{1,3})(\d+)(\d{2})$/, (m, c, mid, last) => c + ' ' + '•'.repeat(mid.length) + last);
  ui.route('/login', () => {
    if (C.hasAccess()) return ui.go('#/');
    const q = (location.hash.split('?')[1] || ''); const pre = (q.match(/(?:^|&)code=([^&]+)/) || [])[1] || '';
    const sms = !!C.smsEnabled; // переключатель в кабинете преподавателя
    let mode = C.needClaim ? 'claim' : (/(^|&)reg=1/.test(q) || pre) ? 'reg' : 'in', method = sms ? 'phone' : 'email';
    let sentEmail = '', keepPw = '', otp = { phone: '', flow: 'login' }, timer = null;
    const head = `<div class="center" style="margin-top:20px"><div class="emoji-xl">🔑</div><h1>Английский с Эми</h1><p class="muted">Путь к уровню B1 вместе с виртуальным ассистентом.</p></div>`;
    const done = () => { clearInterval(timer); history.replaceState(null, '', '#/'); ui.dispatch(); };
    const draw = () => {
      clearInterval(timer);
      if (mode === 'otp') {
        ui.set(`${head}<form class="card" id="f"><div class="center" style="font-size:2.2rem">📱</div><h2 style="text-align:center;margin:6px 0">Введите код из SMS</h2>
          <p class="center muted" style="margin-top:0">Мы отправили код на <b>${esc(maskPhone(otp.phone))}</b></p>
          <input type="text" id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="______" aria-label="Код из SMS" style="font-size:1.8rem;letter-spacing:.35em;text-align:center;margin-bottom:12px">
          <div id="msg" role="alert" style="min-height:1.4em;color:var(--bad)"></div>
          <button class="btn primary block" id="go" type="submit">Подтвердить</button>
          <button class="btn ghost block" type="button" id="resend" style="margin-top:8px" disabled>Отправить код ещё раз</button>
          <button class="btn ghost block" type="button" id="back" style="margin-top:4px">Изменить номер</button></form>`, { noTabs: true });
        const rs = ui.$('#resend'); let left = 30; const tick = () => { rs.textContent = left > 0 ? 'Отправить код ещё раз (' + left + ' с)' : 'Отправить код ещё раз'; rs.disabled = left > 0; left--; }; tick(); timer = setInterval(() => { tick(); if (left < -1) clearInterval(timer); }, 1000);
        rs.onclick = async () => { rs.disabled = true; const msg = ui.$('#msg'); msg.style.color = 'var(--bad)'; try { await C.sendOtp(otp.phone); msg.style.color = 'var(--ok)'; msg.textContent = 'Новый код отправлен.'; left = 30; tick(); timer = setInterval(tick, 1000); } catch (x) { msg.textContent = C.err(x); rs.disabled = false; } };
        ui.$('#back').onclick = () => { mode = otp.flow === 'reg' ? 'reg' : 'in'; draw(); };
        ui.$('#otp').focus();
        ui.$('#f').onsubmit = async e => { e.preventDefault(); const msg = ui.$('#msg'), go = ui.$('#go'), code = ui.$('#otp').value.replace(/\D/g, ''); msg.style.color = 'var(--bad)';
          if (code.length < 4) { msg.textContent = 'Введите код из SMS.'; return; } go.disabled = true; go.textContent = 'Проверяю…';
          try { await C.verifyOtp(otp.phone, code); if (!C.authed) { mode = 'claim'; return draw(); } if (otp.flow === 'reg' || otp.flow === 'forgot') { mode = 'setpw'; return draw(); } return done(); }
          catch (x) { msg.textContent = C.err(x); go.disabled = false; go.textContent = 'Подтвердить'; } };
        return;
      }
      if (mode === 'setpw') {
        ui.set(`${head}<form class="card" id="f"><div class="center" style="font-size:2.2rem">✅</div><h2 style="text-align:center;margin:6px 0">${otp.flow === 'forgot' ? 'Задайте новый пароль' : 'Номер подтверждён'}</h2>
          <p class="muted center" style="margin-top:0">Придумайте пароль, чтобы дальше входить без SMS.</p>${pwField('pw', 'Пароль (не короче 8 символов)', 'new-password')}${pwField('pw2', 'Повторите пароль', 'new-password')}
          <div id="msg" role="alert" style="min-height:1.4em;color:var(--bad)"></div><button class="btn primary block" id="go" type="submit">Сохранить пароль</button>
          ${otp.flow === 'forgot' ? '' : '<button class="btn ghost block" type="button" id="skip" style="margin-top:8px">Пропустить (входить по SMS)</button>'}</form>`, { noTabs: true });
        const sk = ui.$('#skip'); if (sk) sk.onclick = done;
        ui.$('#f').onsubmit = async e => { e.preventDefault(); const msg = ui.$('#msg'), pw = ui.$('#pw').value; if (pw.length < 8) { msg.textContent = 'Пароль должен быть не короче 8 символов.'; return; } if (pw !== ui.$('#pw2').value) { msg.textContent = 'Пароли не совпадают.'; return; }
          ui.$('#go').disabled = true; try { await C.setPasswordFirst(pw); done(); } catch (x) { msg.textContent = C.err(x); ui.$('#go').disabled = false; } };
        return;
      }
      if (mode === 'sent') {
        ui.set(`${head}<div class="card"><div class="center emoji-xl" style="font-size:2.4rem">📧</div><h2 style="text-align:center;margin-top:8px">Проверьте почту</h2>
          <p>Мы отправили письмо на <b>${esc(sentEmail)}</b>. Откройте его и нажмите на ссылку подтверждения. Письмо может прийти в течение минуты, загляните и в «Спам».</p>
          <p class="muted">Затем вернитесь сюда и нажмите кнопку (если ссылка открыла платформу сама, вход выполнится автоматически).</p>
          <div id="msg" class="muted" role="alert" style="min-height:1.4em;color:var(--bad)"></div>
          <button class="btn primary block" id="go">Я подтвердил(а) почту — войти</button><button class="btn ghost block" id="back" style="margin-top:8px">Изменить данные</button></div>`, { noTabs: true });
        ui.$('#back').onclick = () => { mode = 'reg'; draw(); };
        ui.$('#go').onclick = async () => { const msg = ui.$('#msg'), go = ui.$('#go'); go.disabled = true; msg.textContent = '';
          try { if (!keepPw) throw new Error('Введите пароль на вкладке «Войти».'); await C.loginEmail(sentEmail, keepPw); if (C.authed) return done(); mode = 'claim'; draw(); }
          catch (x) { msg.textContent = C.err(x); go.disabled = false; if (/подтверждена/.test(msg.textContent) === false && !keepPw) { mode = 'in'; draw(); } } };
        return;
      }
      const regTabs = mode === 'reg' ? `<div class="row" style="justify-content:center;margin-bottom:10px"><button type="button" class="choice ${method === 'phone' ? 'on' : ''}" data-meth="phone">📱 По телефону</button><button type="button" class="choice ${method === 'email' ? 'on' : ''}" data-meth="email">✉️ По email</button></div>` : '';
      ui.set(`${head}${mode === 'claim' ? '' : `<div class="row" style="justify-content:center;margin-bottom:12px"><button class="choice ${mode === 'in' ? 'on' : ''}" data-m="in">Войти</button><button class="choice ${mode === 'reg' ? 'on' : ''}" data-m="reg">Регистрация по коду</button></div>`}
        <form class="card" id="f" autocomplete="on">${regTabs}${mode === 'in'
          ? field('lg', sms ? 'Телефон или email' : 'Email', 'inputmode="email" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false"') + pwField('pw', 'Пароль', 'current-password')
          : mode === 'claim'
            ? `<p style="margin-top:0">Вы вошли как <b>${esc(C.email || (C.phone ? maskPhone('+' + String(C.phone).replace('+', '')) : ''))}</b>. Осталось ввести код приглашения.</p>` + CODEF(pre) + field('nm', 'Ваше имя', 'placeholder="Как к вам обращаться" maxlength="60" autocomplete="name"')
            : method === 'phone' && !sms
              ? `<p class="muted">Регистрация по телефону скоро заработает. Пока зарегистрируйтесь по email: откройте вкладку «✉️ По email».</p>`
            : method === 'phone'
              ? `<p class="muted" style="margin-top:0">Впервые здесь? Введите код от преподавателя и свой номер телефона: пришлёт SMS с кодом, и вы сразу зарегистрированы.</p>` + CODEF(pre) + field('nm', 'Ваше имя', 'placeholder="Как к вам обращаться" maxlength="60" autocomplete="name"') + field('ph', 'Номер телефона', 'type="tel" inputmode="tel" placeholder="+7 701 123 45 67" autocomplete="tel"')
              : `<p class="muted" style="margin-top:0">Впервые здесь? Введите код, который вам дал преподаватель, свой email и придумайте пароль. На почту придёт письмо для подтверждения.</p>` + CODEF(pre) + field('nm', 'Ваше имя', 'placeholder="Как к вам обращаться" maxlength="60" autocomplete="name"')
                + field('em', 'Email', 'inputmode="email" placeholder="name@example.com" autocomplete="email" autocapitalize="off" autocorrect="off" spellcheck="false"') + pwField('pw', 'Пароль (не короче 8 символов)', 'new-password') + pwField('pw2', 'Повторите пароль', 'new-password')}
          <div id="msg" class="muted" role="alert" style="min-height:1.4em;color:var(--bad)"></div>
          <button class="btn primary block" id="go" type="submit" ${mode === 'reg' && method === 'phone' && !sms ? 'hidden' : ''}>${mode === 'in' ? 'Войти' : mode === 'claim' ? 'Завершить регистрацию' : method === 'phone' ? 'Получить SMS-код' : 'Зарегистрироваться'}</button>
          ${mode === 'in' ? `${sms ? '<button class="btn block" type="button" id="smslogin" style="margin-top:8px">📱 Войти по SMS-коду</button>' : ''}<button class="btn ghost block" type="button" id="forgot" style="margin-top:8px">Забыли пароль?</button><p class="muted" style="margin-bottom:0;font-size:.85rem">Регистрировались раньше по логину? Введите логин вместо ${sms ? 'телефона или ' : ''}email.</p>` : mode === 'claim' ? '<button class="btn ghost block" type="button" id="exit" style="margin-top:8px">Выйти</button>' : `<p class="muted" style="margin-bottom:0;font-size:.85rem">Код действует один раз. ${method === 'phone' ? 'Дальше вы входите по номеру и паролю, SMS больше не нужны.' : 'Дальше вы входите по email и паролю с любого устройства.'}</p>`}</form>`, { noTabs: true });
      ui.$$('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; draw(); }); ui.$$('[data-meth]').forEach(b => b.onclick = () => { method = b.dataset.meth; draw(); });
      if (!C.enabled) ui.$('#msg').textContent = 'Сервер недоступен. Обновите страницу.';
      const ex = ui.$('#exit'); if (ex) ex.onclick = async () => { await C.logoutStudent(); mode = 'in'; draw(); };
      const startOtp = async (phone, flow, msg) => { otp = { phone, flow }; await C.sendOtp(phone); mode = 'otp'; draw(); };
      const sl = ui.$('#smslogin'); if (sl) sl.onclick = async () => { const msg = ui.$('#msg'), ph = C.normPhone(ui.$('#lg').value); msg.style.color = 'var(--bad)'; if (!ph) { msg.textContent = 'Введите номер телефона в поле выше.'; return; } sl.disabled = true; try { await startOtp(ph, 'login'); } catch (x) { msg.textContent = C.err(x); sl.disabled = false; } };
      const fg = ui.$('#forgot'); if (fg) fg.onclick = async () => { const msg = ui.$('#msg'), id = ui.$('#lg').value.trim(); msg.style.color = 'var(--bad)';
        if (sms && C.looksPhone(id)) { const ph = C.normPhone(id); if (!ph) { msg.textContent = 'Проверьте номер телефона.'; return; } try { await startOtp(ph, 'forgot'); } catch (x) { msg.textContent = C.err(x); } return; }
        if (!isEmail(id)) { msg.textContent = 'Введите свой email' + (sms ? ' или телефон' : '') + ' в поле выше, затем нажмите «Забыли пароль?».'; return; }
        try { await C.forgot(id); msg.style.color = 'var(--ok)'; msg.textContent = 'Если такой адрес зарегистрирован, мы отправили письмо со ссылкой для нового пароля.'; } catch (x) { msg.textContent = C.err(x); } };
      ui.$('#f').onsubmit = async e => {
        e.preventDefault(); const msg = ui.$('#msg'), go = ui.$('#go'), v = id => (ui.$('#' + id) || {}).value || ''; msg.style.color = 'var(--bad)'; const label = go.textContent;
        try {
          if (mode === 'in') {
            const id = v('lg').trim(), pw = v('pw'); if (!id || !pw) { msg.textContent = 'Введите ' + (sms ? 'телефон или email' : 'email') + ' и пароль.'; return; }
            go.disabled = true; go.textContent = 'Проверяю…';
            if (isEmail(id)) {
              try { await C.loginEmail(id.toLowerCase(), pw); if (C.authed) return done(); mode = 'claim'; return draw(); }
              catch (x) { if (!/Invalid login|bad_credentials/i.test(String(x.message))) throw x; await C.loginLegacy(id, pw); return done(); }
            } else if (sms && C.looksPhone(id)) {
              const ph = C.normPhone(id); if (!ph) throw new Error('phone invalid format');
              try { await C.loginPhone(ph, pw); if (C.authed) return done(); mode = 'claim'; return draw(); } catch (x) { if (/Invalid login|bad_credentials/i.test(String(x.message))) throw new Error('Неверный телефон или пароль. Если пароля нет, нажмите «Войти по SMS-коду».'); throw x; }
            } else { await C.loginLegacy(id, pw); return done(); }
          } else if (mode === 'claim') {
            if (v('code').trim().length < 6) { msg.textContent = 'Введите код целиком.'; return; } if (!v('nm').trim()) { msg.textContent = 'Впишите своё имя.'; return; }
            go.disabled = true; go.textContent = 'Проверяю…'; await C.claim(v('code').trim(), v('nm').trim()); return done();
          } else if (method === 'phone') {
            if (v('code').trim().length < 6) { msg.textContent = 'Введите код целиком.'; return; } if (!v('nm').trim()) { msg.textContent = 'Впишите своё имя.'; ui.$('#nm').focus(); return; }
            const ph = C.normPhone(v('ph')); if (!ph) { msg.textContent = 'Проверьте номер телефона.'; return; }
            go.disabled = true; go.textContent = 'Отправляю SMS…'; await C.registerPhone(v('code').trim(), v('nm').trim(), ph); otp = { phone: ph, flow: 'reg' }; mode = 'otp'; return draw();
          } else {
            const em = v('em').trim().toLowerCase(), pw = v('pw');
            if (v('code').trim().length < 6) { msg.textContent = 'Введите код целиком.'; return; } if (!v('nm').trim()) { msg.textContent = 'Впишите своё имя.'; ui.$('#nm').focus(); return; }
            if (!isEmail(em)) { msg.textContent = 'Проверьте адрес email.'; return; } if (pw.length < 8) { msg.textContent = 'Пароль должен быть не короче 8 символов.'; return; } if (pw !== v('pw2')) { msg.textContent = 'Пароли не совпадают.'; return; }
            go.disabled = true; go.textContent = 'Отправляю письмо…'; const r = await C.register(v('code').trim(), v('nm').trim(), em, pw);
            if (r.confirmed && C.authed) return done(); sentEmail = em; keepPw = pw; mode = 'sent'; return draw();
          }
        } catch (x) { msg.textContent = C.err(x); go.disabled = false; go.textContent = label; }
      };
    };
    draw();
  });

  // ---------- Новый пароль по ссылке из письма ----------
  ui.route('/recover', () => {
    ui.set(`<div class="center" style="margin-top:20px"><div class="emoji-xl">🔒</div><h1>Новый пароль</h1></div><form class="card" id="f">${pwField('p1', 'Новый пароль (не короче 8 символов)', 'new-password')}${pwField('p2', 'Повторите пароль', 'new-password')}<div id="msg" role="alert" style="min-height:1.4em;color:var(--bad)"></div><button class="btn primary block" type="submit">Сохранить пароль</button></form>`, { noTabs: true });
    ui.$('#f').onsubmit = async e => { e.preventDefault(); const msg = ui.$('#msg'), a = ui.$('#p1').value;
      if (a.length < 8) { msg.textContent = 'Пароль должен быть не короче 8 символов.'; return; } if (a !== ui.$('#p2').value) { msg.textContent = 'Пароли не совпадают.'; return; }
      try { await C.setNewPassword(a); C.recovering = false; await C.resolve(); U.toast('Пароль изменён'); history.replaceState(null, '', '#/'); ui.dispatch(); } catch (x) { msg.textContent = C.err(x); } };
  });

  // ---------- Кабинет преподавателя ----------
  const ago = d => { if (!d) return 'входа ещё не было'; const n = Math.floor((Date.now() - new Date(d).getTime()) / 86400000); return n <= 0 ? 'сегодня' : n === 1 ? 'вчера' : n + ' ' + U.plural(n, 'день', 'дня', 'дней') + ' назад'; };
  const daysSince = d => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 999;

  function loginForm(note) {
    ui.set(`<a href="#/login" class="muted">← вход для учеников</a><h1>Вход для преподавателя</h1>
      <form class="card" id="f"><label class="muted" for="em">Email</label><input type="text" id="em" inputmode="email" autocomplete="username" autocapitalize="off" style="margin-bottom:12px">
        <label class="muted" for="pw">Пароль</label><input type="password" id="pw" autocomplete="current-password" style="width:100%;font:inherit;border:2px solid var(--line);border-radius:12px;padding:11px 14px;min-height:46px;background:var(--card);color:var(--ink);margin-bottom:12px">
        <div id="msg" role="alert" style="min-height:1.4em;color:var(--bad)">${note ? esc(note) : ''}</div>
        <button class="btn primary block" type="submit" id="in">Войти</button>
        <button class="btn ghost block" type="button" id="up" style="margin-top:8px">Первый вход: создать пароль</button>
        <p class="muted" style="font-size:.85rem;margin-bottom:0">Доступ есть только у email, добавленных преподавателями. «Создать пароль» отправит письмо для подтверждения почты.</p></form>`, { noTabs: true });
    const val = () => [ui.$('#em').value.trim(), ui.$('#pw').value];
    ui.$('#f').onsubmit = async e => { e.preventDefault(); const [em, pw] = val(); const msg = ui.$('#msg'); msg.style.color = 'var(--bad)';
      if (!em || !pw) { msg.textContent = 'Введите email и пароль.'; return; }
      try { await C.signIn(em, pw); if (!(await C.isTeacher())) { await C.signOut(); msg.textContent = 'У этого email нет доступа преподавателя.'; return; } ui.dispatch(); } catch (x) { msg.textContent = /Email not confirmed/i.test(x.message) ? 'Почта ещё не подтверждена: откройте письмо от Supabase.' : C.err(x); } };
    ui.$('#up').onclick = async () => { const [em, pw] = val(); const msg = ui.$('#msg');
      if (!em || pw.length < 8) { msg.style.color = 'var(--bad)'; msg.textContent = 'Введите email и пароль не короче 8 символов.'; return; }
      try { await C.signUp(em, pw); msg.style.color = 'var(--ok)'; msg.textContent = 'Готово. Проверьте почту, подтвердите адрес и затем войдите с этим паролем.'; } catch (x) { msg.style.color = 'var(--bad)'; msg.textContent = C.err(x); } };
  }

  // ---------- Данные кабинета (кэш на 30 секунд) ----------
  const siteUrl = () => location.origin + '/';
  const inviteText = (code, name) => `${name ? name + ', здравствуйте!' : 'Здравствуйте!'} Приглашаю на занятия английским с виртуальным ассистентом.\n1. Откройте ${siteUrl()}#/login?code=${String(code).replace(/-/g, '')}\n2. ${C.smsEnabled ? 'Впишите имя и номер телефона, введите код из SMS и придумайте пароль.' : 'Впишите имя и email, придумайте пароль и подтвердите почту по письму.'}\nКод приглашения: ${code} (действует один раз).`;
  const contact = x => x.phone ? '+' + String(x.phone).replace('+', '') : x.email || '';
  function copy(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => U.toast(t.includes('\n') && t.length > 60 ? 'Скопировано' : 'Скопировано: ' + t), () => U.toast('Не удалось скопировать')); }
  function share(text) { if (navigator.share) navigator.share({ text }).catch(() => {}); else copy(text); }
  let cache = null;
  async function load(force) {
    if (!force && cache && Date.now() - cache.at < 30000) return cache;
    const [students, invites] = await Promise.all([C.students(), C.invitesAll()]);
    students.forEach(st => { st.sum = st.state && st.state.units ? JP.studentSummary(st.state) : { onboarded: false }; });
    return (cache = { at: Date.now(), students, invites });
  }
  const NAV = [['#/admin', '📊', 'Обзор', p => p === '/admin'], ['#/admin/students', '👥', 'Ученики', p => p === '/admin/students' || p.startsWith('/admin/s/')], ['#/admin/codes', '🔑', 'Коды', p => p === '/admin/codes'], ['#/admin/preview', '👁', 'Глазами ученика', p => p === '/admin/preview']];
  function shell(path, title, body, o) {
    o = o || {};
    ui.set(`<div class="adm"><aside class="adm-side"><div class="adm-brand">Путь к B1<small>кабинет преподавателя</small></div>
        <nav>${NAV.map(n => `<a href="${n[0]}" class="${n[3](path) ? 'on' : ''}"><span>${n[1]}</span>${n[2]}${n[2] === 'Коды' && cache ? `<em>${cache.invites.filter(i => !i.used_at && !i.student_id).length}</em>` : ''}${n[2] === 'Ученики' && cache ? `<em>${cache.students.length}</em>` : ''}</a>`).join('')}</nav>
        <div class="adm-foot"><button class="btn small ghost" id="out">Выйти</button></div></aside>
      <main class="adm-main"><header class="adm-top"><h1>${title}</h1><div class="row">${o.actions || ''}<button class="btn small" id="refresh" title="Обновить данные">⟳ Обновить</button></div></header>${body}</main></div>`, { noTabs: true });
    ui.$('#out').onclick = async () => { cache = null; await C.signOut(); ui.dispatch(); };
    ui.$('#refresh').onclick = () => { cache = null; ui.dispatch(); };
  }
  async function guard(path, title, render) {
    if (!JP.preview && C.enabled && C.hasAccess()) return ui.go('#/'); // кабинет не для учеников
    if (!C.enabled) return ui.set('<div class="card"><h1>Сервер недоступен</h1><p>Не загрузился скрипт Supabase. Обновите страницу.</p></div>', { noTabs: true });
    let ses = null; try { ses = await C.session(); } catch (e) {}
    if (!ses || !(await C.isTeacher())) return loginForm();
    if (!cache) ui.set('<div class="adm"><main class="adm-main"><p class="muted">Загружаю данные…</p></main></div>', { noTabs: true });
    let d; try { d = await load(); } catch (x) { return ui.set(`<div class="card"><p>${esc(C.err(x))}</p><a class="btn" href="#/admin">Повторить</a></div>`, { noTabs: true }); }
    render(d, (body, o) => shell(path, title, body, o));
  }
  const freeCodes = d => d.invites.filter(i => !i.used_at);

  // ---------- Обзор ----------
  ui.route('/admin', () => guard('/admin', 'Обзор', (d, out) => {
    const st = d.students, on = st.filter(x => x.sum.onboarded);
    const active7 = st.filter(x => daysSince(x.last_seen) < 7).length;
    const avgProg = on.length ? on.reduce((a, x) => a + x.sum.progress, 0) / on.length : 0;
    const free = freeCodes(d).filter(i => !i.student_id).length;
    const weekMin = on.reduce((a, x) => a + x.sum.weekMin, 0);
    const attn = [];
    st.forEach(x => {
      const why = [];
      if (!x.sum.onboarded) { if (daysSince(x.created_at) >= 1) why.push('не прошёл знакомство'); }
      else {
        if (daysSince(x.last_seen) >= 3) why.push('нет активности ' + daysSince(x.last_seen) + ' дн.');
        if (x.sum.acc != null && x.sum.acc < 0.6) why.push('низкая точность ' + Math.round(x.sum.acc * 100) + '%');
        if (x.sum.weak >= 3) why.push('слабых тем: ' + x.sum.weak);
      }
      if (why.length) attn.push({ x, why });
    });
    const recent = st.slice().sort((a, b) => String(b.last_seen || '').localeCompare(String(a.last_seen || ''))).slice(0, 6);
    const top = on.slice().sort((a, b) => b.sum.progress - a.sum.progress).slice(0, 5);
    out(`<div class="d-kpis">
        <div class="d-card"><div class="d-lab">Ученики</div><div class="d-big">${st.length}</div><div class="d-foot">активны за 7 дней: <b>${active7}</b></div></div>
        <div class="d-card"><div class="d-lab">Средний прогресс</div><div class="d-big">${Math.round(avgProg * 100)}<small>%</small></div><div class="d-bar"><i style="width:${Math.round(avgProg * 100)}%"></i></div><div class="d-foot">на пути к B1</div></div>
        <div class="d-card"><div class="d-lab">Минут за неделю</div><div class="d-big">${weekMin}</div><div class="d-foot">у всех учеников вместе</div></div>
        <div class="d-card"><div class="d-lab">Свободные коды</div><div class="d-big">${free}</div><div class="d-foot"><a href="#/admin/codes">управлять кодами →</a></div></div></div>
      <div class="d-main">
        <div class="d-card"><h2 class="d-h2">Требуют внимания</h2>${attn.length ? attn.map(a => `<a class="adm-row" href="#/admin/s/${a.x.id}"><span class="grow"><b>${esc(a.x.name)}</b><br><small class="muted">${esc(a.why.join(' · '))}</small></span><span class="muted">›</span></a>`).join('') : '<p class="muted">Всё спокойно: у всех есть активность, тревожных сигналов нет.</p>'}</div>
        <div class="d-card"><h2 class="d-h2">Последняя активность</h2>${recent.length ? recent.map(x => `<a class="adm-row" href="#/admin/s/${x.id}"><span class="grow"><b>${esc(x.name)}</b><br><small class="muted">${ago(x.last_seen)}${x.sum.onboarded ? ' · ' + Math.round(x.sum.progress * 100) + '%' : ''}</small></span><span class="muted">›</span></a>`).join('') : '<p class="muted">Пока нет учеников. Создайте код в разделе «Коды».</p>'}</div></div>
      <div class="d-main">
        <div class="d-card"><h2 class="d-h2">Лидеры по прогрессу</h2>${top.length ? top.map((x, i) => `<div class="adm-row"><span style="width:22px">${i + 1}</span><span class="grow">${esc(x.name)}<div class="d-bar" style="margin-top:4px"><i style="width:${Math.round(x.sum.progress * 100)}%"></i></div></span><b>${Math.round(x.sum.progress * 100)}%</b></div>`).join('') : '<p class="muted">Данных пока нет.</p>'}</div>
        <div class="d-card warm"><h2 class="d-h2">Пригласить ученика</h2><p class="muted">Ссылка на платформу:</p><div style="font-weight:700;word-break:break-all">${esc(siteUrl())}</div>
          <div class="row" style="margin:10px 0"><button class="btn small" id="cplink">Копировать</button><button class="btn small ghost" id="shlink">Поделиться</button><a class="btn small primary" href="#/admin/codes">Создать код</a></div>
          <p class="muted" style="font-size:.85rem;margin:0">${C.smsEnabled ? 'Ученик открывает ссылку, вводит код, имя и номер телефона, затем код из SMS.' : 'Ученик открывает ссылку, вводит код, имя и email, придумывает пароль и подтверждает почту по письму.'}</p></div></div>
      <div class="d-card ${C.smsEnabled ? '' : 'soft'}"><div class="row between"><div><h2 class="d-h2" style="margin:0">Вход по SMS: ${C.smsEnabled ? 'включён' : 'выключен'}</h2>
        <p class="muted" style="margin:6px 0 0;max-width:640px">${C.smsEnabled ? 'Ученики регистрируются и входят по номеру телефона и коду из SMS. Email остаётся вторым способом.' : 'Включайте только после подключения SMS-провайдера в Supabase (Authentication → Sign In / Providers → Phone: Twilio, MessageBird, Vonage или Textlocal). Иначе коды не будут приходить.'}</p></div>
        <button class="btn ${C.smsEnabled ? 'ghost' : 'primary'}" id="smstog">${C.smsEnabled ? 'Выключить' : 'Включить'}</button></div><div id="smsmsg" role="alert" class="muted" style="min-height:1.2em;margin-top:6px"></div></div>`);
    ui.$('#smstog').onclick = async b => { const el = ui.$('#smstog'); if (!C.smsEnabled && !confirm('Провайдер SMS уже подключён в Supabase? Если нет, ученики не получат коды. Включить?')) return; el.disabled = true; try { await C.setSms(!C.smsEnabled); U.toast(C.smsEnabled ? 'Вход по SMS включён' : 'Вход по SMS выключен'); ui.dispatch(); } catch (x) { ui.$('#smsmsg').textContent = C.err(x); el.disabled = false; } };
    ui.$('#cplink').onclick = () => copy(siteUrl()); ui.$('#shlink').onclick = () => share('Платформа для занятий английским: ' + siteUrl());
  }));

  // ---------- Ученики ----------
  const F = { q: '', sort: 'last', f: 'all' };
  ui.route('/admin/students', () => guard('/admin/students', 'Ученики', (d, out) => {
    out(`<div class="adm-tools"><input type="text" id="q" placeholder="Поиск по имени, email или логину" value="${esc(F.q)}" class="grow">
        <select id="sort" aria-label="Сортировка"><option value="last">Сначала недавно заходившие</option><option value="prog">По прогрессу</option><option value="acc">По точности</option><option value="week">По минутам за неделю</option><option value="name">По имени</option></select></div>
      <div class="choices" id="flt" style="margin-bottom:12px">${[['all', 'Все'], ['active', 'Активные'], ['quiet', 'Нет активности'], ['new', 'Не начали']].map(([k, l]) => `<button class="choice" data-f="${k}">${l}</button>`).join('')}</div>
      <div id="list"></div>`);
    ui.$('#sort').value = F.sort;
    const draw = () => {
      ui.$$('#flt .choice').forEach(b => b.classList.toggle('on', b.dataset.f === F.f));
      let rows = d.students.filter(x => (x.name + ' ' + (x.login || '') + ' ' + (x.email || '') + ' ' + (x.phone || '')).toLowerCase().includes(F.q.toLowerCase()));
      if (F.f === 'active') rows = rows.filter(x => daysSince(x.last_seen) < 3 && x.sum.onboarded);
      if (F.f === 'quiet') rows = rows.filter(x => daysSince(x.last_seen) >= 3);
      if (F.f === 'new') rows = rows.filter(x => !x.sum.onboarded);
      const key = { last: x => -new Date(x.last_seen || 0), prog: x => -(x.sum.progress || 0), acc: x => -(x.sum.acc == null ? -1 : x.sum.acc), week: x => -(x.sum.weekMin || 0), name: x => x.name.toLowerCase() }[F.sort];
      rows.sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0);
      ui.$('#list').innerHTML = rows.length ? `<div class="adm-table"><div class="adm-th"><span>Ученик</span><span>Прогресс</span><span>Этап</span><span>Неделя</span><span>Точность</span><span>Серия</span><span>Заходил</span></div>${rows.map(x => { const m = x.sum, quiet = daysSince(x.last_seen) >= 3;
        return `<a class="adm-tr" href="#/admin/s/${x.id}"><span class="adm-name"><b>${esc(x.name)}</b>${contact(x) ? `<small class="muted">${esc(contact(x))}</small>` : x.login ? `<small class="muted">логин ${esc(x.login)} · без контакта</small>` : '<small class="muted">без контакта</small>'}</span>
          ${m.onboarded ? `<span data-l="Прогресс"><div class="d-bar"><i style="width:${Math.round(m.progress * 100)}%"></i></div><small>${Math.round(m.progress * 100)}%</small></span><span data-l="Этап">${m.stage} · ${m.level}</span><span data-l="Неделя">${m.weekMin} / ${m.goalMin}′</span><span data-l="Точность">${m.acc == null ? '—' : Math.round(m.acc * 100) + '%'}</span><span data-l="Серия">🔥 ${m.streak}</span>`
            : '<span class="muted" style="grid-column:2 / 7">Знакомство ещё не пройдено</span>'}<span data-l="Заходил" class="${quiet ? 'down' : ''}">${ago(x.last_seen)}</span></a>`; }).join('')}</div>` : '<div class="d-card muted">Никого не нашли. Измените поиск или фильтр.</div>';
    };
    ui.$('#q').oninput = e => { F.q = e.target.value; draw(); }; ui.$('#sort').onchange = e => { F.sort = e.target.value; draw(); };
    ui.$$('#flt .choice').forEach(b => b.onclick = () => { F.f = b.dataset.f; draw(); }); draw();
  }));

  // ---------- Карточка ученика ----------
  ui.route('/admin/s/:id', ({ id }) => guard('/admin/students', 'Ученик', (d, out) => {
    const st = d.students.find(s => s.id === id); if (!st) return ui.go('#/admin/students');
    const has = st.state && st.state.units;
    const dash = has ? JP.studentDashboard(st.state) : '<div class="d-card muted">Ученик ещё не начал занятия.</div>';
    const rep = has ? JP.teacherReport(st.state) : '';
    out(`<a href="#/admin/students" class="muted">← все ученики</a>
      <div class="d-card" style="margin-top:8px"><div class="row between"><div><h2 class="d-h2" style="font-size:1.5rem">${esc(st.name)}</h2><div class="muted">${st.phone ? 'Телефон: <b>' + esc(contact(st)) + '</b>' + (st.email ? ' · ' + esc(st.email) : '') : st.email ? 'Email: <b>' + esc(st.email) + '</b>' : st.login ? 'Логин: <b>' + esc(st.login) + '</b> (контакт не привязан)' : 'Контакт не привязан'} · регистрация ${U.fmt(st.created_at.slice(0, 10))} · последний вход: ${ago(st.last_seen)}</div></div>
        <div class="row"><button class="btn small" id="asstu">👁 Как видит ученик</button><button class="btn small" id="rec">🔑 Сброс доступа</button><button class="btn small" id="exp">⬇️ Данные</button><button class="btn small ghost" id="del" style="color:var(--bad)">Удалить</button></div></div><div id="newcode"></div></div>
      <div class="adm-tabs"><button class="choice on" data-t="dash">Прогресс</button><button class="choice" data-t="rep">Отчёт для занятия</button></div>
      <div id="t-dash">${dash}</div><div id="t-rep" hidden>${rep}</div>`);
    ui.$$('.adm-tabs .choice').forEach(b => b.onclick = () => { ui.$$('.adm-tabs .choice').forEach(x => x.classList.toggle('on', x === b)); ui.$('#t-dash').hidden = b.dataset.t !== 'dash'; ui.$('#t-rep').hidden = b.dataset.t !== 'rep'; });
    const cb = ui.$('#copy'); if (cb) cb.onclick = () => copy(ui.$('#txt').textContent);
    ui.$('#asstu').onclick = () => openPreview('student', st);
    ui.$('#rec').onclick = async () => { try { const code = await C.createInvite('сброс доступа: ' + st.name, st.id); cache = null; showCode(code, st.name, 'Код сброса доступа'); U.toast('Код создан: ученик зарегистрируется заново, прогресс сохранится'); } catch (x) { U.toast(C.err(x)); } };
    ui.$('#exp').onclick = () => ui.download(st.name.replace(/\W+/g, '_') + '-' + U.today() + '.json', JSON.stringify(st.state || {}, null, 1), 'application/json');
    ui.$('#del').onclick = async () => { if (confirm('Удалить ученика «' + st.name + '» вместе со всем прогрессом? Это нельзя отменить.')) { try { await C.deleteStudent(st.id); cache = null; ui.go('#/admin/students'); } catch (x) { U.toast(C.err(x)); } } };
  }));
  function showCode(code, label, title) {
    const el = ui.$('#newcode'); if (!el) return;
    el.innerHTML = `<div class="card soft" style="margin:12px 0 0;text-align:center"><div class="muted">${esc(title || 'Код создан')} (действует один раз)</div><div style="font-size:1.8rem;font-weight:800;letter-spacing:.12em;margin:6px 0">${esc(code)}</div><div class="row" style="justify-content:center"><button class="btn small" id="cc">Копировать код</button><button class="btn small primary" id="ci">Приглашение со ссылкой</button></div></div>`;
    ui.$('#cc').onclick = () => copy(code); ui.$('#ci').onclick = () => share(inviteText(code, label || ''));
  }

  // ---------- Просмотр глазами ученика ----------
  // Открывает платформу в новой вкладке в изолированном режиме: отдельное хранилище, без сервера, все этапы открыты.
  function openPreview(kind, st) {
    try {
      if (kind === 'demo') localStorage.setItem('b1.preview.v1', JSON.stringify(JP.demoState()));
      else if (kind === 'student' && st && st.state && st.state.units) localStorage.setItem('b1.preview.v1', JSON.stringify(st.state));
      else localStorage.removeItem('b1.preview.v1');
    } catch (e) { return U.toast('Не удалось подготовить просмотр'); }
    const u = siteUrl() + '?preview=' + kind + (st ? '&as=' + encodeURIComponent(st.name) + (st.email || st.phone ? '' : '&noemail=1') : '') + '#/';
    if (!window.open(u, '_blank')) location.href = u;
  }
  ui.route('/admin/preview', () => guard('/admin/preview', 'Глазами ученика', (d, out) => {
    out(`<p class="muted">Платформа открывается в новой вкладке так, как её видит ученик. Это безопасно: настоящие данные и сервер не затрагиваются, всё остаётся только в той вкладке. Все этапы курса открыты, чтобы вы могли пройтись по любому уроку.</p>
      <div class="d-main"><div class="d-card"><h2 class="d-h2">Тестовый ученик с прогрессом</h2><p class="muted">Заполненный дашборд, повторения, проверки и письменная работа. Удобно смотреть, как выглядят экраны и уроки.</p><button class="btn primary" id="pdemo">Открыть</button></div>
        <div class="d-card"><h2 class="d-h2">Новый ученик с нуля</h2><p class="muted">Знакомство с Эми, диагностика и первое занятие: путь, который проходит ученик после регистрации.</p><button class="btn primary" id="pnew">Открыть</button></div></div>
      <div class="d-card"><h2 class="d-h2">Как видит конкретный ученик</h2><p class="muted">Откроется копия его текущего прогресса. Что вы там нажмёте, у ученика не изменится.</p>
        ${d.students.length ? d.students.map(x => `<div class="adm-row"><span class="grow"><b>${esc(x.name)}</b><br><small class="muted">${x.sum && x.sum.onboarded ? Math.round(x.sum.progress * 100) + '% · этап ' + x.sum.stage : 'знакомство не пройдено'}</small></span><button class="btn small" data-as="${esc(x.id)}">Открыть</button></div>`).join('') : '<p class="muted">Учеников пока нет.</p>'}</div>`);
    ui.$('#pdemo').onclick = () => openPreview('demo'); ui.$('#pnew').onclick = () => openPreview('new');
    ui.$$('[data-as]').forEach(b => b.onclick = () => openPreview('student', d.students.find(x => x.id === b.dataset.as)));
  }));

  // ---------- Коды ----------
  const fmtDT = iso => { const d = new Date(iso); if (isNaN(d)) return ''; return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); };
  ui.route('/admin/codes', () => guard('/admin/codes', 'Коды', (d, out) => {
    const byId = Object.fromEntries(d.students.map(s => [s.id, s]));
    const free = d.invites.filter(i => !i.used_at).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    const used = d.invites.filter(i => i.used_at).sort((a, b) => String(b.used_at).localeCompare(String(a.used_at)));
    const who = i => byId[i.student_id];
    out(`<div class="d-main"><div class="d-card soft"><h2 class="d-h2">Создать код</h2>
        <div class="row" style="margin-top:8px"><input type="text" id="lab" placeholder="Подпись (необязательно), например имя" class="grow" maxlength="60"><button class="btn primary" id="mk">Создать код</button></div>
        <div class="row" style="margin-top:10px"><span class="muted">Или пачку:</span><input type="number" id="cnt" value="10" min="2" max="50" style="width:90px"><button class="btn" id="mkn">Создать</button></div><div id="newcode"></div></div>
      <div class="d-card warm"><h2 class="d-h2">Ссылка для учеников</h2><div style="font-weight:700;word-break:break-all;margin:6px 0">${esc(siteUrl())}</div><div class="row"><button class="btn small" id="cplink">Копировать</button><button class="btn small ghost" id="shlink">Поделиться</button></div>
        <p class="muted" style="font-size:.85rem;margin:8px 0 0">Каждый код работает один раз. Использованный код сразу переходит в правую колонку: с именем ученика и датой регистрации.</p></div></div>
      <div class="codes-cols">
        <section class="d-card" id="cfree" aria-label="Свободные коды"><div class="row between" style="margin-bottom:8px"><h2 class="d-h2">Свободные · <span id="nfree">${free.length}</span></h2>${free.length ? '<div class="row"><button class="btn small" id="cpall">Копировать все</button><button class="btn small" id="dlall">.csv</button></div>' : ''}</div>
          ${free.length ? free.map(i => { const st = i.student_id && who(i);
            return `<div class="list-item"><span class="grow"><b style="letter-spacing:.08em">${esc(i.code)}</b>${i.student_id ? ' <span class="chip warm">сброс доступа</span>' : ''}<br><small class="muted">${esc(i.label || 'без подписи')}${st ? ' · для ' + esc(st.name) : ''} · создан ${ago(i.created_at)}</small></span>
              <button class="btn small" data-copy="${esc(i.code)}">Код</button><button class="btn small" data-invite="${esc(i.code)}">Приглашение</button><button class="icon-btn" data-del="${esc(i.code)}" aria-label="Удалить код">🗑</button></div>`; }).join('') : '<p class="muted">Свободных кодов нет. Создайте код или пачку выше.</p>'}</section>
        <section class="d-card" id="cused" aria-label="Использованные коды"><div class="row between" style="margin-bottom:8px"><h2 class="d-h2">Использованные · <span id="nused">${used.length}</span></h2>${used.length ? '<button class="btn small" id="dlused">.csv</button>' : ''}</div>
          ${used.length ? used.map(i => { const st = who(i);
            return `<div class="list-item used"><span class="grow"><b style="letter-spacing:.08em;opacity:.7">${esc(i.code)}</b> <span class="chip">✓ использован</span><br>
              <span>${st ? `<a href="#/admin/s/${esc(st.id)}"><b>${esc(st.name)}</b></a>${contact(st) ? ' · ' + esc(contact(st)) : st.login ? ' · ' + esc(st.login) : ''}` : '<span class="muted">ученик удалён</span>'}</span><br>
              <small class="muted">зарегистрировался ${esc(fmtDT(i.used_at))}${i.label ? ' · подпись «' + esc(i.label) + '»' : ''}</small></span></div>`; }).join('') : '<p class="muted">Использованных кодов пока нет. Когда ученик зарегистрируется по коду, код появится здесь вместе с его именем и датой.</p>'}</section></div>`);
    const csvq = v => '"' + String(v || '').replace(/"/g, '""') + '"';
    const cpall = ui.$('#cpall'); if (cpall) cpall.onclick = () => copy(free.map(i => i.code + (i.label ? '  ' + i.label : '')).join('\n'));
    const dlall = ui.$('#dlall'); if (dlall) dlall.onclick = () => ui.download('b1-codes-free-' + U.today() + '.csv', 'code,label,created\n' + free.map(i => [i.code, csvq(i.label), i.created_at.slice(0, 10)].join(',')).join('\n'), 'text/csv');
    const dlu = ui.$('#dlused'); if (dlu) dlu.onclick = () => ui.download('b1-codes-used-' + U.today() + '.csv', 'code,student,email_or_login,registered_at\n' + used.map(i => { const st = who(i) || {}; return [i.code, csvq(st.name), csvq(contact(st) || st.login), i.used_at].join(','); }).join('\n'), 'text/csv');
    ui.$$('[data-copy]').forEach(b => b.onclick = () => copy(b.dataset.copy));
    ui.$$('[data-invite]').forEach(b => b.onclick = () => share(inviteText(b.dataset.invite, '')));
    ui.$$('[data-del]').forEach(b => b.onclick = async () => { if (confirm('Удалить этот код?')) { try { await C.deleteInvite(b.dataset.del); cache = null; ui.dispatch(); } catch (x) { U.toast(C.err(x)); } } });
    ui.$('#cplink').onclick = () => copy(siteUrl()); ui.$('#shlink').onclick = () => share('Платформа для занятий английским: ' + siteUrl());
    ui.$('#mk').onclick = async () => { const lab = ui.$('#lab').value.trim(); try { const code = await C.createInvite(lab); cache = null; ui.dispatch(); setTimeout(() => showCode(code, lab), 80); } catch (x) { U.toast(C.err(x)); } };
    ui.$('#mkn').onclick = async () => {
      const n = Math.max(2, Math.min(50, parseInt(ui.$('#cnt').value, 10) || 10)), lab = ui.$('#lab').value.trim(); const btn = ui.$('#mkn'); btn.disabled = true; btn.textContent = 'Создаю…';
      try { for (let i = 1; i <= n; i++) await C.createInvite(lab ? lab + ' ' + i : ''); U.toast('Создано кодов: ' + n); cache = null; ui.dispatch(); } catch (x) { U.toast(C.err(x)); btn.disabled = false; btn.textContent = 'Создать'; }
    };
  }));
})(window.JP);
