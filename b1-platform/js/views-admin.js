// Вход ученика по коду и кабинет преподавателя.
(function (JP) {
  const U = JP.U, ui = JP.ui, C = JP.cloud, S = () => JP.store.get(), esc = U.esc;

  // ---------- Вход и регистрация ученика ----------
  const field = (id, label, attrs) => `<label class="muted" for="${id}">${label}</label><input type="text" id="${id}" ${attrs || ''} style="margin-bottom:12px">`;
  const pwField = (id, label, ac) => `<label class="muted" for="${id}">${label}</label><input type="password" id="${id}" autocomplete="${ac}" style="width:100%;font:inherit;border:2px solid var(--line);border-radius:12px;padding:11px 14px;min-height:46px;background:var(--card);color:var(--ink);margin-bottom:12px">`;
  ui.route('/login', () => {
    if (S().profile || C.token()) return ui.go('#/');
    const q = (location.hash.split('?')[1] || ''); const startReg = /(^|&)reg=1/.test(q) || /(^|&)code=/.test(q);
    const pre = (q.match(/(?:^|&)code=([^&]+)/) || [])[1] || '';
    let mode = startReg ? 'reg' : 'in';
    const draw = () => {
      ui.set(`<div class="center" style="margin-top:20px"><div class="emoji-xl">🔑</div><h1>Английский с Эми</h1><p class="muted">Путь к уровню B1 вместе с виртуальным ассистентом.</p></div>
        <div class="row" style="justify-content:center;margin-bottom:12px"><button class="choice ${mode === 'in' ? 'on' : ''}" data-m="in">Войти</button><button class="choice ${mode === 'reg' ? 'on' : ''}" data-m="reg">Регистрация по коду</button></div>
        <form class="card" id="f" autocomplete="on">${mode === 'in'
          ? field('lg', 'Логин', 'autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false"') + pwField('pw', 'Пароль', 'current-password')
          : `<p class="muted" style="margin-top:0">Впервые здесь? Введите код, который вам дал преподаватель, и придумайте свой логин и пароль.</p>`
            + field('code', 'Код приглашения', `placeholder="XXXXX-XXXXX" value="${esc(pre)}" autocapitalize="characters" autocorrect="off" spellcheck="false" maxlength="14" style="font-size:1.2rem;letter-spacing:.1em;text-transform:uppercase"`)
            + field('nm', 'Ваше имя', 'placeholder="Как к вам обращаться" maxlength="60" autocomplete="name"')
            + field('lg', 'Придумайте логин', 'placeholder="например, ваш email" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="60"')
            + pwField('pw', 'Пароль (не короче 8 символов)', 'new-password') + pwField('pw2', 'Повторите пароль', 'new-password')}
          <div id="msg" class="muted" role="alert" style="min-height:1.4em;color:var(--bad)"></div>
          <button class="btn primary block" id="go" type="submit">${mode === 'in' ? 'Войти' : 'Зарегистрироваться'}</button>
          ${mode === 'reg' ? '<p class="muted" style="margin-bottom:0;font-size:.85rem">Код действует один раз. После регистрации вы будете входить по логину и паролю с любого устройства.</p>' : '<p class="muted" style="margin-bottom:0;font-size:.85rem">Забыли пароль? Попросите преподавателя выдать код восстановления и выберите «Регистрация по коду».</p>'}</form>
        <p class="center"><a href="#/admin">Вход для преподавателя</a></p>`, { noTabs: true });
      ui.$$('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; draw(); });
      if (!C.enabled) ui.$('#msg').textContent = 'Сервер недоступен. Обновите страницу.';
      ui.$('#f').onsubmit = async e => {
        e.preventDefault(); const msg = ui.$('#msg'), go = ui.$('#go'), v = id => (ui.$('#' + id) || {}).value || '';
        const login = v('lg').trim(), pw = v('pw');
        if (mode === 'in') { if (!login || !pw) { msg.textContent = 'Введите логин и пароль.'; return; } }
        else {
          if (v('code').trim().length < 6) { msg.textContent = 'Введите код целиком.'; return; }
          if (!v('nm').trim()) { msg.textContent = 'Впишите своё имя.'; ui.$('#nm').focus(); return; }
          if (login.length < 3) { msg.textContent = 'Логин должен быть не короче 3 символов.'; return; }
          if (pw.length < 8) { msg.textContent = 'Пароль должен быть не короче 8 символов.'; return; }
          if (pw !== v('pw2')) { msg.textContent = 'Пароли не совпадают.'; return; }
        }
        go.disabled = true; go.textContent = 'Проверяю…'; msg.textContent = '';
        try { mode === 'in' ? await C.login(login, pw) : await C.register(v('code').trim(), v('nm').trim(), login, pw); history.replaceState(null, '', '#/'); ui.dispatch(); }
        catch (x) { msg.textContent = C.err(x); go.disabled = false; go.textContent = mode === 'in' ? 'Войти' : 'Зарегистрироваться'; }
      };
    };
    draw();
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
  const inviteText = (code, name) => `${name ? name + ', здравствуйте!' : 'Здравствуйте!'} Приглашаю на занятия английским с виртуальным ассистентом.\n1. Откройте ${siteUrl()}#/login?code=${String(code).replace(/-/g, '')}\n2. Впишите своё имя, придумайте логин и пароль.\nКод приглашения: ${code} (действует один раз).`;
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
          <p class="muted" style="font-size:.85rem;margin:0">Ученик открывает ссылку, вводит код, имя и придумывает логин и пароль.</p></div></div>`);
    ui.$('#cplink').onclick = () => copy(siteUrl()); ui.$('#shlink').onclick = () => share('Платформа для занятий английским: ' + siteUrl());
  }));

  // ---------- Ученики ----------
  const F = { q: '', sort: 'last', f: 'all' };
  ui.route('/admin/students', () => guard('/admin/students', 'Ученики', (d, out) => {
    out(`<div class="adm-tools"><input type="text" id="q" placeholder="Поиск по имени или логину" value="${esc(F.q)}" class="grow">
        <select id="sort" aria-label="Сортировка"><option value="last">Сначала недавно заходившие</option><option value="prog">По прогрессу</option><option value="acc">По точности</option><option value="week">По минутам за неделю</option><option value="name">По имени</option></select></div>
      <div class="choices" id="flt" style="margin-bottom:12px">${[['all', 'Все'], ['active', 'Активные'], ['quiet', 'Нет активности'], ['new', 'Не начали']].map(([k, l]) => `<button class="choice" data-f="${k}">${l}</button>`).join('')}</div>
      <div id="list"></div>`);
    ui.$('#sort').value = F.sort;
    const draw = () => {
      ui.$$('#flt .choice').forEach(b => b.classList.toggle('on', b.dataset.f === F.f));
      let rows = d.students.filter(x => (x.name + ' ' + (x.login || '')).toLowerCase().includes(F.q.toLowerCase()));
      if (F.f === 'active') rows = rows.filter(x => daysSince(x.last_seen) < 3 && x.sum.onboarded);
      if (F.f === 'quiet') rows = rows.filter(x => daysSince(x.last_seen) >= 3);
      if (F.f === 'new') rows = rows.filter(x => !x.sum.onboarded);
      const key = { last: x => -new Date(x.last_seen || 0), prog: x => -(x.sum.progress || 0), acc: x => -(x.sum.acc == null ? -1 : x.sum.acc), week: x => -(x.sum.weekMin || 0), name: x => x.name.toLowerCase() }[F.sort];
      rows.sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0);
      ui.$('#list').innerHTML = rows.length ? `<div class="adm-table"><div class="adm-th"><span>Ученик</span><span>Прогресс</span><span>Этап</span><span>Неделя</span><span>Точность</span><span>Серия</span><span>Заходил</span></div>${rows.map(x => { const m = x.sum, quiet = daysSince(x.last_seen) >= 3;
        return `<a class="adm-tr" href="#/admin/s/${x.id}"><span class="adm-name"><b>${esc(x.name)}</b>${x.login ? `<small class="muted">@${esc(x.login)}</small>` : '<small class="muted">без пароля</small>'}</span>
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
      <div class="d-card" style="margin-top:8px"><div class="row between"><div><h2 class="d-h2" style="font-size:1.5rem">${esc(st.name)}</h2><div class="muted">${st.login ? 'Логин: <b>' + esc(st.login) + '</b>' : 'Пароль не задан'} · регистрация ${U.fmt(st.created_at.slice(0, 10))} · последний вход: ${ago(st.last_seen)}</div></div>
        <div class="row"><button class="btn small" id="rec">🔑 Сброс пароля</button><button class="btn small" id="exp">⬇️ Данные</button><button class="btn small ghost" id="del" style="color:var(--bad)">Удалить</button></div></div><div id="newcode"></div></div>
      <div class="adm-tabs"><button class="choice on" data-t="dash">Прогресс</button><button class="choice" data-t="rep">Отчёт для занятия</button></div>
      <div id="t-dash">${dash}</div><div id="t-rep" hidden>${rep}</div>`);
    ui.$$('.adm-tabs .choice').forEach(b => b.onclick = () => { ui.$$('.adm-tabs .choice').forEach(x => x.classList.toggle('on', x === b)); ui.$('#t-dash').hidden = b.dataset.t !== 'dash'; ui.$('#t-rep').hidden = b.dataset.t !== 'rep'; });
    ui.$('#rec').onclick = async () => { try { const code = await C.createInvite('сброс пароля: ' + st.name, st.id); cache = null; showCode(code, st.name, 'Код сброса пароля'); U.toast('Код создан: ученик задаст новый пароль'); } catch (x) { U.toast(C.err(x)); } };
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
      <div class="choices" id="cflt" style="margin:4px 0 12px">${[['free', 'Свободные', free.length], ['reset', 'Сброс пароля', reset.length], ['used', 'Использованные', used.length]].map(([k, l, n]) => `<button class="choice" data-f="${k}">${l} · ${n}</button>`).join('')}</div>
      <div class="d-card" id="clist"></div>`);
    const draw = () => {
      ui.$$('#cflt .choice').forEach(b => b.classList.toggle('on', b.dataset.f === CF.f));
      const rows = CF.f === 'free' ? free : CF.f === 'reset' ? reset : used;
      const bar = CF.f !== 'used' && rows.length ? `<div class="row between" style="margin-bottom:8px"><b>${rows.length} ${U.plural(rows.length, 'код', 'кода', 'кодов')}</b><div class="row"><button class="btn small" id="cpall">Копировать все</button><button class="btn small" id="dlall">Скачать .csv</button></div></div>` : '';
      ui.$('#clist').innerHTML = bar + (rows.length ? rows.map(i => { const who = byId[i.student_id];
        return `<div class="list-item"><span class="grow"><b style="letter-spacing:.08em">${esc(i.code)}</b><br><small class="muted">${esc(i.label || 'без подписи')} · создан ${ago(i.created_at)}${i.used_at ? ' · использован' + (who ? ': ' + esc(who.name) + (who.login ? ' (@' + esc(who.login) + ')' : '') : '') : ''}</small></span>
          ${i.used_at ? '' : `<button class="btn small" data-copy="${esc(i.code)}">Код</button><button class="btn small" data-invite="${esc(i.code)}">Приглашение</button><button class="icon-btn" data-del="${esc(i.code)}" aria-label="Удалить код">🗑</button>`}</div>`; }).join('') : `<p class="muted">${CF.f === 'free' ? 'Свободных кодов нет. Создайте код или пачку выше.' : CF.f === 'reset' ? 'Кодов сброса пароля нет. Они создаются в карточке ученика.' : 'Использованных кодов пока нет.'}</p>`);
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
