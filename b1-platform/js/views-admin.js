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

  ui.route('/admin', async () => {
    if (!C.enabled) return ui.set('<div class="card"><h1>Сервер недоступен</h1><p>Не загрузился скрипт Supabase. Обновите страницу.</p></div>', { noTabs: true });
    let ses = null; try { ses = await C.session(); } catch (e) {}
    if (!ses || !(await C.isTeacher())) return loginForm();
    ui.set('<h1>Кабинет преподавателя</h1><p class="muted">Загружаю…</p>', { noTabs: true });
    let students = [], invites = [];
    try { [students, invites] = await Promise.all([C.students(), C.invites()]); } catch (x) { return ui.set(`<div class="card"><p>${esc(C.err(x))}</p><a class="btn" href="#/admin">Повторить</a></div>`, { noTabs: true }); }
    const rows = students.map(s => {
      const m = s.state && s.state.units ? JP.studentSummary(s.state) : { onboarded: false };
      const quiet = daysSince(s.last_seen) >= 3;
      return `<a class="card" href="#/admin/s/${s.id}" style="display:block;text-decoration:none;color:inherit"><div class="row between"><span><b style="font-size:1.1rem">${esc(s.name)}</b>${s.login ? ` <small class="muted">@${esc(s.login)}</small>` : ' <small class="muted">без пароля</small>'}</span>${quiet ? '<span class="chip warm">⚠ нет активности</span>' : ''}</div>
        ${m.onboarded ? `<div style="margin:8px 0">${ui.bar(m.progress)}</div><div class="row between"><small class="muted">${Math.round(m.progress * 100)}% · этап ${m.stage} (${m.level})</small><small class="muted">🔥 ${m.streak}</small></div>
        <small class="muted">неделя: ${m.weekMin} из ${m.goalMin} мин · точность ${m.acc == null ? '—' : Math.round(m.acc * 100) + '%'} · слов ${m.words}</small><br>` : '<p class="muted" style="margin:6px 0">Знакомство ещё не пройдено</p>'}
        <small class="muted">последний вход: ${ago(s.last_seen)}</small></a>`;
    }).join('') || '<div class="card muted">Пока нет учеников. Создайте код и отправьте ученику.</div>';
    const inv = invites.map(i => `<div class="list-item"><span class="grow"><b style="letter-spacing:.08em">${esc(i.code)}</b><br><small class="muted">${esc(i.label || 'без подписи')}${i.student_id ? ' · восстановление' : ''} · ${ago(i.created_at)}</small></span><button class="btn small" data-copy="${esc(i.code)}">Код</button><button class="btn small" data-invite="${esc(i.code)}" data-lab="${esc(i.label || '')}">Приглашение</button><button class="icon-btn" data-del="${esc(i.code)}" aria-label="Удалить код">🗑</button></div>`).join('');
    ui.set(`<div class="row between"><h1 style="margin:0">Кабинет преподавателя</h1><button class="btn small ghost" id="out">Выйти</button></div>
      <div class="card warm"><div class="muted" style="font-size:.85rem">Ссылка на платформу для учеников</div><div style="font-weight:700;word-break:break-all;margin:4px 0 8px">${esc(siteUrl())}</div><div class="row"><button class="btn small" id="cplink">Копировать ссылку</button><button class="btn small ghost" id="shlink">Поделиться</button></div>
        <p class="muted" style="font-size:.85rem;margin:8px 0 0">Ученик открывает ссылку, нажимает «Регистрация по коду», вводит код, имя и придумывает логин и пароль. Или отправьте приглашение с кодом: оно уже содержит ссылку.</p></div>
      <p class="muted">Учеников: ${students.length}. Прогресс обновляется автоматически, когда ученик занимается.</p>
      <div class="card soft"><h3 style="margin-top:0">Новый код для ученика</h3><div class="row"><input type="text" id="lab" placeholder="Подпись (необязательно)" class="grow" maxlength="60"><button class="btn primary" id="mk">Создать код</button></div>
        <div class="row" style="margin-top:10px"><span class="muted">Или сразу пачку:</span><input type="number" id="cnt" value="10" min="2" max="50" style="width:90px"><button class="btn" id="mkn">Создать</button></div>
        <div id="newcode"></div></div>
      ${invites.length ? `<div class="card"><div class="row between"><h3 style="margin:0">Запас кодов: ${invites.length}</h3><div class="row"><button class="btn small" id="cpall">Копировать все</button><button class="btn small" id="dlall">Скачать .csv</button></div></div>${inv}</div>` : ''}
      <h2>Ученики</h2>${rows}<a class="btn block" href="#/teacher" style="margin:8px 0 24px">Открыть отчёт из файла</a>`, { noTabs: true });
    ui.$('#out').onclick = async () => { await C.signOut(); ui.dispatch(); };
    ui.$('#mk').onclick = async () => { try { const code = await C.createInvite(ui.$('#lab').value.trim()); ui.dispatch(); setTimeout(() => showCode(code, ui.$('#lab') && ui.$('#lab').value), 50); } catch (x) { U.toast(C.err(x)); } };
    ui.$('#mkn').onclick = async () => {
      const n = Math.max(2, Math.min(50, parseInt(ui.$('#cnt').value, 10) || 10)), lab = ui.$('#lab').value.trim(); const btn = ui.$('#mkn'); btn.disabled = true; btn.textContent = 'Создаю…';
      try { for (let i = 1; i <= n; i++) await C.createInvite(lab ? lab + ' ' + i : ''); U.toast('Создано кодов: ' + n); ui.dispatch(); } catch (x) { U.toast(C.err(x)); btn.disabled = false; btn.textContent = 'Создать'; }
    };
    const cpall = ui.$('#cpall'); if (cpall) cpall.onclick = () => copy(invites.map(i => i.code + (i.label ? '  ' + i.label : '')).join('\n'));
    const dlall = ui.$('#dlall'); if (dlall) dlall.onclick = () => ui.download('b1-codes-' + U.today() + '.csv', 'code,label,created\n' + invites.map(i => [i.code, '"' + (i.label || '').replace(/"/g, '""') + '"', i.created_at.slice(0, 10)].join(',')).join('\n'), 'text/csv');
    ui.$('#cplink').onclick = () => copy(siteUrl()); ui.$('#shlink').onclick = () => share('Платформа для занятий английским: ' + siteUrl());
    ui.$$('[data-copy]').forEach(b => b.onclick = () => copy(b.dataset.copy));
    ui.$$('[data-invite]').forEach(b => b.onclick = () => share(inviteText(b.dataset.invite, '')));
    ui.$$('[data-del]').forEach(b => b.onclick = async () => { if (confirm('Удалить этот код?')) { try { await C.deleteInvite(b.dataset.del); ui.dispatch(); } catch (x) { U.toast(C.err(x)); } } });
  });
  const siteUrl = () => location.origin + '/';
  const inviteText = (code, name) => `${name ? name + ', здравствуйте!' : 'Здравствуйте!'} Приглашаю на занятия английским с виртуальным ассистентом.\n1. Откройте ${siteUrl()}#/login?code=${String(code).replace(/-/g, '')}\n2. Впишите своё имя, придумайте логин и пароль.\nКод приглашения: ${code} (действует один раз).`;
  function share(text) { if (navigator.share) navigator.share({ text }).catch(() => {}); else copy(text); }
  function copy(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => U.toast(t.includes('\n') ? 'Скопировано кодов: ' + t.split('\n').length : 'Скопировано: ' + t), () => U.toast('Не удалось скопировать')); }
  function showCode(code, label) {
    const el = ui.$('#newcode'); if (!el) return;
    el.innerHTML = `<div class="card" style="margin:12px 0 0;text-align:center"><div class="muted">Код создан (действует один раз)</div><div style="font-size:1.8rem;font-weight:800;letter-spacing:.12em;margin:6px 0">${esc(code)}</div><div class="row" style="justify-content:center"><button class="btn small" id="cc">Копировать код</button><button class="btn small primary" id="ci">Приглашение со ссылкой</button></div></div>`;
    ui.$('#cc').onclick = () => copy(code); ui.$('#ci').onclick = () => share(inviteText(code, label || ''));
  }

  ui.route('/admin/s/:id', async ({ id }) => {
    let ses = null; try { ses = await C.session(); } catch (e) {}
    if (!ses || !(await C.isTeacher())) return ui.go('#/admin');
    ui.set('<p class="muted">Загружаю…</p>', { noTabs: true });
    let st; try { st = (await C.students()).find(s => s.id === id); } catch (x) { return ui.set(`<div class="card">${esc(C.err(x))}</div>`, { noTabs: true }); }
    if (!st) return ui.go('#/admin');
    const rep = st.state && st.state.units ? JP.teacherReport(st.state) : '<div class="card muted">Занятия ещё не начаты.</div>';
    ui.set(`<a href="#/admin" class="muted">← все ученики</a><h1>${esc(st.name)}</h1><p class="muted">${st.login ? 'Логин: <b>' + esc(st.login) + '</b> · ' : 'Пароль не задан · '}Последняя активность: ${ago(st.last_seen)}${st.state_updated ? ' · данные от ' + U.fmt(st.state_updated.slice(0, 10)) : ''}</p>
      <div class="row" style="margin-bottom:12px"><button class="btn" id="rec">🔑 Сброс пароля (код)</button><button class="btn" id="exp">⬇️ Скачать данные</button><button class="btn ghost" id="del" style="color:var(--bad)">Удалить ученика</button></div><div id="newcode"></div>${rep}`, { noTabs: true });
    ui.$('#rec').onclick = async () => { try { const code = await C.createInvite('сброс пароля: ' + st.name, st.id); showCode(code, st.name); U.toast('Код сброса создан: ученик задаст новый пароль'); } catch (x) { U.toast(C.err(x)); } };
    ui.$('#exp').onclick = () => ui.download(st.name.replace(/\W+/g, '_') + '-' + U.today() + '.json', JSON.stringify(st.state || {}, null, 1), 'application/json');
    ui.$('#del').onclick = async () => { if (confirm('Удалить ученика «' + st.name + '» вместе со всем прогрессом? Это нельзя отменить.')) { try { await C.deleteStudent(st.id); ui.go('#/admin'); } catch (x) { U.toast(C.err(x)); } } };
  });
})(window.JP);
