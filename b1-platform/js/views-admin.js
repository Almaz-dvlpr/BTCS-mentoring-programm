// Вход ученика по коду и кабинет преподавателя.
(function (JP) {
  const U = JP.U, ui = JP.ui, C = JP.cloud, S = () => JP.store.get(), esc = U.esc;

  // ---------- Вход и регистрация ученика ----------
  const field = (id, label, attrs) => `<label class="muted" for="${id}">${label}</label><input type="text" id="${id}" ${attrs || ''} style="margin-bottom:12px">`;
  const PWSTYLE = 'width:100%;font:inherit;border:2px solid var(--line);border-radius:12px;padding:11px 14px;min-height:46px;background:var(--card);color:var(--ink);margin-bottom:12px';
  const pwField = (id, label, ac) => `<label class="muted" for="${id}">${label}</label><input type="password" id="${id}" autocomplete="${ac}" style="${PWSTYLE}">`;
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  ui.route('/login', () => {
    if (S().profile && C.hasAccess()) return ui.go('#/');
    if (C.hasAccess()) return ui.go('#/');
    const q = (location.hash.split('?')[1] || ''); const pre = (q.match(/(?:^|&)code=([^&]+)/) || [])[1] || '';
    let mode = C.needClaim && !C.pendingTeacher ? 'claim' : (/(^|&)reg=1/.test(q) || pre) ? 'reg' : 'in'; let sentEmail = '', keepPw = '';
    const head = `<div class="center" style="margin-top:20px"><div class="emoji-xl">🔑</div><h1>Английский с Эми</h1><p class="muted">Путь к уровню B1 вместе с виртуальным ассистентом.</p></div>`;
    const done = () => { history.replaceState(null, '', '#/'); ui.dispatch(); };
    const draw = () => {
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
      ui.set(`${head}${mode === 'claim' ? '' : `<div class="row" style="justify-content:center;margin-bottom:12px"><button class="choice ${mode === 'in' ? 'on' : ''}" data-m="in">Войти</button><button class="choice ${mode === 'reg' ? 'on' : ''}" data-m="reg">Регистрация по коду</button></div>`}
        <form class="card" id="f" autocomplete="on">${mode === 'in'
          ? field('lg', 'Email', 'inputmode="email" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false"') + pwField('pw', 'Пароль', 'current-password')
          : mode === 'claim'
            ? `<p style="margin-top:0">Вы вошли как <b>${esc(C.email || '')}</b>. Осталось ввести код приглашения.</p>` + field('code', 'Код приглашения', `placeholder="XXXXX-XXXXX" value="${esc(pre)}" autocapitalize="characters" autocorrect="off" spellcheck="false" maxlength="14" style="font-size:1.2rem;letter-spacing:.1em;text-transform:uppercase"`) + field('nm', 'Ваше имя', 'placeholder="Как к вам обращаться" maxlength="60" autocomplete="name"')
            : `<p class="muted" style="margin-top:0">Впервые здесь? Введите код, который вам дал преподаватель, свой email и придумайте пароль. На почту придёт письмо для подтверждения.</p>`
              + field('code', 'Код приглашения', `placeholder="XXXXX-XXXXX" value="${esc(pre)}" autocapitalize="characters" autocorrect="off" spellcheck="false" maxlength="14" style="font-size:1.2rem;letter-spacing:.1em;text-transform:uppercase"`)
              + field('nm', 'Ваше имя', 'placeholder="Как к вам обращаться" maxlength="60" autocomplete="name"')
              + field('em', 'Email', 'inputmode="email" placeholder="name@example.com" autocomplete="email" autocapitalize="off" autocorrect="off" spellcheck="false"')
              + pwField('pw', 'Пароль (не короче 8 символов)', 'new-password') + pwField('pw2', 'Повторите пароль', 'new-password')}
          <div id="msg" class="muted" role="alert" style="min-height:1.4em;color:var(--bad)"></div>
          <button class="btn primary block" id="go" type="submit">${mode === 'in' ? 'Войти' : mode === 'claim' ? 'Завершить регистрацию' : 'Зарегистрироваться'}</button>
          ${mode === 'in' ? '<button class="btn ghost block" type="button" id="forgot" style="margin-top:8px">Забыли пароль?</button><p class="muted" style="margin-bottom:0;font-size:.85rem">Регистрировались раньше по логину? Введите логин вместо email.</p>' : mode === 'claim' ? '<button class="btn ghost block" type="button" id="exit" style="margin-top:8px">Выйти</button>' : '<p class="muted" style="margin-bottom:0;font-size:.85rem">Код действует один раз. Дальше вы входите по email и паролю с любого устройства.</p>'}</form>
        <p class="center"><a href="#/admin">Вход для преподавателя</a></p>`, { noTabs: true });
      ui.$$('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; draw(); });
      if (!C.enabled) ui.$('#msg').textContent = 'Сервер недоступен. Обновите страницу.';
      const ex = ui.$('#exit'); if (ex) ex.onclick = async () => { await C.logoutStudent(); mode = 'in'; draw(); };
      const fg = ui.$('#forgot'); if (fg) fg.onclick = async () => { const msg = ui.$('#msg'), em = ui.$('#lg').value.trim(); msg.style.color = 'var(--bad)';
        if (!isEmail(em)) { msg.textContent = 'Введите свой email в поле выше, затем нажмите «Забыли пароль?».'; return; }
        try { await C.forgot(em); msg.style.color = 'var(--ok)'; msg.textContent = 'Если такой адрес зарегистрирован, мы отправили письмо со ссылкой для нового пароля.'; } catch (x) { msg.textContent = C.err(x); } };
      ui.$('#f').onsubmit = async e => {
        e.preventDefault(); const msg = ui.$('#msg'), go = ui.$('#go'), v = id => (ui.$('#' + id) || {}).value || ''; msg.style.color = 'var(--bad)';
        const label = go.textContent;
        try {
          if (mode === 'in') {
            const id = v('lg').trim(), pw = v('pw'); if (!id || !pw) { msg.textContent = 'Введите email и пароль.'; return; }
            go.disabled = true; go.textContent = 'Проверяю…';
            if (isEmail(id)) {
              try { await C.loginEmail(id.toLowerCase(), pw); if (C.authed) return done(); mode = 'claim'; return draw(); }
              catch (x) { if (!/Invalid login|bad_credentials/i.test(String(x.message))) throw x; await C.loginLegacy(id, pw); return done(); } // старый вход: логин мог быть похож на email
            } else { await C.loginLegacy(id, pw); return done(); }
          } else if (mode === 'claim') {
            if (v('code').trim().length < 6) { msg.textContent = 'Введите код целиком.'; return; } if (!v('nm').trim()) { msg.textContent = 'Впишите своё имя.'; return; }
            go.disabled = true; go.textContent = 'Проверяю…'; await C.claim(v('code').trim(), v('nm').trim()); return done();
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
  const inviteText = (code, name) => `${name ? name + ', здравствуйте!' : 'Здравствуйте!'} Приглашаю на занятия английским с виртуальным ассистентом.\n1. Откройте ${siteUrl()}#/login?code=${String(code).replace(/-/g, '')}\n2. Впишите имя и email, придумайте пароль и подтвердите почту по письму.\nКод приглашения: ${code} (действует один раз).`;
  function copy(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => U.toast(t.includes('\n') && t.length > 60 ? 'Скопировано' : 'Скопировано: ' + t), () => U.toast('Не удалось скопировать')); }
  function share(text) { if (navigator.share) navigator.share({ text }).catch(() => {}); else copy(text); }
  let cache = null;
  async function load(force) {
    if (!force && cache && Date.now() - cache.at < 30000) return cache;
    const [students, invites] = await Promise.all([C.students(), C.invitesAll()]);
    students.forEach(st => { st.sum = st.state && st.state.units ? JP.studentSummary(st.state) : { onboarded: false }; });
    return (cache = { at: Date.now(), students, invites });
  }
  const NAV = [['#/admin', '📊', 'Обзор', p => p === '/admin'], ['#/admin/students', '👥', 'Ученики', p => p === '/admin/students' || p.startsWith('/admin/s/')], ['#/admin/codes', '🔑', 'Коды', p => p === '/admin/codes']];
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
    if (!C.enabled) return ui.set('<div class="card"><h1>Сервер недоступен</h1><p>Не загрузился скрипт Supabase. Обновите страницу.</p></div>', { noTabs: true });
    let ses = null; try { ses = await C.session(); } catch (e) {}
    if (!ses || !(await C.isTeacher())) return loginForm();
    if (!cache) ui.set('<div class="adm"><main class="adm-main"><p class="muted">Загружаю данные…</p></main></div>', { noTabs: true });
    let d; try { d = await load(); } catch (x) { return ui.set(`<div class="card"><p>${esc(C.err(x))}</p><a class="btn" href="#/admin">Повторить</a></div>`, { noTabs: true }); }
    render(d, (body, o) => shell(path, title, body, o));
  }
  const freeCodes = d => d.invites.filter(i => !i.used_at);
  const isReset = i => !!i.student_id && !i.used_at;

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
          <p class="muted" style="font-size:.85rem;margin:0">Ученик открывает ссылку, вводит код, имя и email, придумывает пароль и подтверждает почту по письму.</p></div></div>`);
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
      let rows = d.students.filter(x => (x.name + ' ' + (x.login || '') + ' ' + (x.email || '')).toLowerCase().includes(F.q.toLowerCase()));
      if (F.f === 'active') rows = rows.filter(x => daysSince(x.last_seen) < 3 && x.sum.onboarded);
      if (F.f === 'quiet') rows = rows.filter(x => daysSince(x.last_seen) >= 3);
      if (F.f === 'new') rows = rows.filter(x => !x.sum.onboarded);
      const key = { last: x => -new Date(x.last_seen || 0), prog: x => -(x.sum.progress || 0), acc: x => -(x.sum.acc == null ? -1 : x.sum.acc), week: x => -(x.sum.weekMin || 0), name: x => x.name.toLowerCase() }[F.sort];
      rows.sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0);
      ui.$('#list').innerHTML = rows.length ? `<div class="adm-table"><div class="adm-th"><span>Ученик</span><span>Прогресс</span><span>Этап</span><span>Неделя</span><span>Точность</span><span>Серия</span><span>Заходил</span></div>${rows.map(x => { const m = x.sum, quiet = daysSince(x.last_seen) >= 3;
        return `<a class="adm-tr" href="#/admin/s/${x.id}"><span class="adm-name"><b>${esc(x.name)}</b>${x.email ? `<small class="muted">${esc(x.email)}</small>` : x.login ? `<small class="muted">логин ${esc(x.login)} · без email</small>` : '<small class="muted">без email</small>'}</span>
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
      <div class="d-card" style="margin-top:8px"><div class="row between"><div><h2 class="d-h2" style="font-size:1.5rem">${esc(st.name)}</h2><div class="muted">${st.email ? 'Email: <b>' + esc(st.email) + '</b>' : st.login ? 'Логин: <b>' + esc(st.login) + '</b> (email не привязан)' : 'Email не привязан'} · регистрация ${U.fmt(st.created_at.slice(0, 10))} · последний вход: ${ago(st.last_seen)}</div></div>
        <div class="row"><button class="btn small" id="rec">🔑 Сброс доступа</button><button class="btn small" id="exp">⬇️ Данные</button><button class="btn small ghost" id="del" style="color:var(--bad)">Удалить</button></div></div><div id="newcode"></div></div>
      <div class="adm-tabs"><button class="choice on" data-t="dash">Прогресс</button><button class="choice" data-t="rep">Отчёт для занятия</button></div>
      <div id="t-dash">${dash}</div><div id="t-rep" hidden>${rep}</div>`);
    ui.$$('.adm-tabs .choice').forEach(b => b.onclick = () => { ui.$$('.adm-tabs .choice').forEach(x => x.classList.toggle('on', x === b)); ui.$('#t-dash').hidden = b.dataset.t !== 'dash'; ui.$('#t-rep').hidden = b.dataset.t !== 'rep'; });
    ui.$('#rec').onclick = async () => { try { const code = await C.createInvite('сброс доступа: ' + st.name, st.id); cache = null; showCode(code, st.name, 'Код сброса доступа'); U.toast('Код создан: ученик зарегистрируется заново, прогресс сохранится'); } catch (x) { U.toast(C.err(x)); } };
    ui.$('#exp').onclick = () => ui.download(st.name.replace(/\W+/g, '_') + '-' + U.today() + '.json', JSON.stringify(st.state || {}, null, 1), 'application/json');
    ui.$('#del').onclick = async () => { if (confirm('Удалить ученика «' + st.name + '» вместе со всем прогрессом? Это нельзя отменить.')) { try { await C.deleteStudent(st.id); cache = null; ui.go('#/admin/students'); } catch (x) { U.toast(C.err(x)); } } };
  }));
  function showCode(code, label, title) {
    const el = ui.$('#newcode'); if (!el) return;
    el.innerHTML = `<div class="card soft" style="margin:12px 0 0;text-align:center"><div class="muted">${esc(title || 'Код создан')} (действует один раз)</div><div style="font-size:1.8rem;font-weight:800;letter-spacing:.12em;margin:6px 0">${esc(code)}</div><div class="row" style="justify-content:center"><button class="btn small" id="cc">Копировать код</button><button class="btn small primary" id="ci">Приглашение со ссылкой</button></div></div>`;
    ui.$('#cc').onclick = () => copy(code); ui.$('#ci').onclick = () => share(inviteText(code, label || ''));
  }

  // ---------- Коды ----------
  const CF = { f: 'free' };
  ui.route('/admin/codes', () => guard('/admin/codes', 'Коды', (d, out) => {
    const byId = Object.fromEntries(d.students.map(s => [s.id, s]));
    const free = d.invites.filter(i => !i.used_at && !i.student_id), reset = d.invites.filter(isReset), used = d.invites.filter(i => i.used_at);
    out(`<div class="d-main"><div class="d-card soft"><h2 class="d-h2">Создать код</h2>
        <div class="row" style="margin-top:8px"><input type="text" id="lab" placeholder="Подпись (необязательно), например имя" class="grow" maxlength="60"><button class="btn primary" id="mk">Создать код</button></div>
        <div class="row" style="margin-top:10px"><span class="muted">Или пачку:</span><input type="number" id="cnt" value="10" min="2" max="50" style="width:90px"><button class="btn" id="mkn">Создать</button></div><div id="newcode"></div></div>
      <div class="d-card warm"><h2 class="d-h2">Ссылка для учеников</h2><div style="font-weight:700;word-break:break-all;margin:6px 0">${esc(siteUrl())}</div><div class="row"><button class="btn small" id="cplink">Копировать</button><button class="btn small ghost" id="shlink">Поделиться</button></div>
        <p class="muted" style="font-size:.85rem;margin:8px 0 0">Каждый код работает один раз. «Приглашение» формирует готовый текст со ссылкой, в которую уже вписан код.</p></div></div>
      <div class="choices" id="cflt" style="margin:4px 0 12px">${[['free', 'Свободные', free.length], ['reset', 'Сброс доступа', reset.length], ['used', 'Использованные', used.length]].map(([k, l, n]) => `<button class="choice" data-f="${k}">${l} · ${n}</button>`).join('')}</div>
      <div class="d-card" id="clist"></div>`);
    const draw = () => {
      ui.$$('#cflt .choice').forEach(b => b.classList.toggle('on', b.dataset.f === CF.f));
      const rows = CF.f === 'free' ? free : CF.f === 'reset' ? reset : used;
      const bar = CF.f !== 'used' && rows.length ? `<div class="row between" style="margin-bottom:8px"><b>${rows.length} ${U.plural(rows.length, 'код', 'кода', 'кодов')}</b><div class="row"><button class="btn small" id="cpall">Копировать все</button><button class="btn small" id="dlall">Скачать .csv</button></div></div>` : '';
      ui.$('#clist').innerHTML = bar + (rows.length ? rows.map(i => { const who = byId[i.student_id];
        return `<div class="list-item"><span class="grow"><b style="letter-spacing:.08em">${esc(i.code)}</b><br><small class="muted">${esc(i.label || 'без подписи')} · создан ${ago(i.created_at)}${i.used_at ? ' · использован' + (who ? ': ' + esc(who.name) + (who.login ? ' (@' + esc(who.login) + ')' : '') : '') : ''}</small></span>
          ${i.used_at ? '' : `<button class="btn small" data-copy="${esc(i.code)}">Код</button><button class="btn small" data-invite="${esc(i.code)}">Приглашение</button><button class="icon-btn" data-del="${esc(i.code)}" aria-label="Удалить код">🗑</button>`}</div>`; }).join('') : `<p class="muted">${CF.f === 'free' ? 'Свободных кодов нет. Создайте код или пачку выше.' : CF.f === 'reset' ? 'Кодов сброса доступа нет. Они создаются в карточке ученика.' : 'Использованных кодов пока нет.'}</p>`);
      const cpall = ui.$('#cpall'); if (cpall) cpall.onclick = () => copy(rows.map(i => i.code + (i.label ? '  ' + i.label : '')).join('\n'));
      const dlall = ui.$('#dlall'); if (dlall) dlall.onclick = () => ui.download('b1-codes-' + U.today() + '.csv', 'code,label,created\n' + rows.map(i => [i.code, '"' + (i.label || '').replace(/"/g, '""') + '"', i.created_at.slice(0, 10)].join(',')).join('\n'), 'text/csv');
      ui.$$('[data-copy]').forEach(b => b.onclick = () => copy(b.dataset.copy));
      ui.$$('[data-invite]').forEach(b => b.onclick = () => share(inviteText(b.dataset.invite, '')));
      ui.$$('[data-del]').forEach(b => b.onclick = async () => { if (confirm('Удалить этот код?')) { try { await C.deleteInvite(b.dataset.del); cache = null; ui.dispatch(); } catch (x) { U.toast(C.err(x)); } } });
    };
    ui.$$('#cflt .choice').forEach(b => b.onclick = () => { CF.f = b.dataset.f; draw(); }); draw();
    ui.$('#cplink').onclick = () => copy(siteUrl()); ui.$('#shlink').onclick = () => share('Платформа для занятий английским: ' + siteUrl());
    ui.$('#mk').onclick = async () => { const lab = ui.$('#lab').value.trim(); try { const code = await C.createInvite(lab); cache = null; CF.f = 'free'; ui.dispatch(); setTimeout(() => showCode(code, lab), 80); } catch (x) { U.toast(C.err(x)); } };
    ui.$('#mkn').onclick = async () => {
      const n = Math.max(2, Math.min(50, parseInt(ui.$('#cnt').value, 10) || 10)), lab = ui.$('#lab').value.trim(); const btn = ui.$('#mkn'); btn.disabled = true; btn.textContent = 'Создаю…';
      try { for (let i = 1; i <= n; i++) await C.createInvite(lab ? lab + ' ' + i : ''); U.toast('Создано кодов: ' + n); cache = null; CF.f = 'free'; ui.dispatch(); } catch (x) { U.toast(C.err(x)); btn.disabled = false; btn.textContent = 'Создать'; }
    };
  }));
})(window.JP);
