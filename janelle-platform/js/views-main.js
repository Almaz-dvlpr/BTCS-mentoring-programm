// Главные экраны: сегодня, план, прогресс, настройки, кабинет преподавателя.
(function (JP) {
  const U = JP.U, E = JP.E, A = JP.amy, ui = JP.ui, S = () => JP.store.get(), D = JP.data, esc = U.esc;

  // ---------- Сегодня ----------
  ui.route('/', () => {
    const p = S().profile; E.syncDay(); const day = E.buildDay();
    const open = day.tasks.filter(t => !t.done), doneN = day.tasks.length - open.length;
    const prog = E.progress(), est = E.estimate(), wk = E.weekStats(), streak = E.streak();
    const stage = E.currentStage(); const st = D.stages[stage - 1];
    const next = open[0];
    const dueC = E.dueCards().length;
    const tasks = day.tasks.map(t => {
      const ic = { unit: t.kind === 'vocab' ? '🔤' : t.kind === 'write' ? '✍️' : '📘', srs: '🃏', greview: '🔁', checkpoint: '📝', stagetest: '🏆', mix: '⚡' }[t.type] || '•';
      const inner = `<span class="dot">${t.done ? '✓' : ic}</span><span class="grow"><span class="tt">${esc(t.title)}</span><br><small class="muted">${esc(t.desc || '')} · ~${t.minutes} мин</small></span>${t.done ? '' : '<span class="muted">›</span>'}`;
      return t.done ? `<div class="task done">${inner}</div>` : `<a class="task" href="#/do/${t.id}">${inner}</a>`;
    }).join('');
    ui.set(`
      <div class="row between"><div><small class="muted">${U.parse(U.today()).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</small><h1>Привет, ${esc(p.name)}!</h1></div>
        <span class="chip warm" title="Занятий подряд по расписанию">🔥 ${streak}</span></div>
      <div class="card"><div class="amy"><div class="avatar">🙂</div><div class="bubble" style="box-shadow:none;border:0;padding:0;background:transparent">${esc(A.homeMessage(day))}</div></div></div>
      <div class="card"><div class="row between"><h2 style="margin:0">Сегодня</h2><small class="muted">${doneN} из ${day.tasks.length}</small></div>
        ${ui.bar(day.tasks.length ? doneN / day.tasks.length : 0)}
        <div style="margin-top:6px">${tasks || '<p class="muted">Задач нет. Можно взять дополнительный урок.</p>'}</div>
        ${next ? `<a class="btn primary block" style="margin-top:10px" href="#/do/${next.id}">${doneN ? 'Продолжить' : 'Начать'}: ${esc(next.title)}</a>` : `<button class="btn primary block" id="more" style="margin-top:10px">Ещё один урок</button>`}
        <div class="row" style="margin-top:10px;justify-content:center"><button class="btn ghost small" id="short">⏱ Только 10 минут сегодня</button></div></div>
      <div class="card"><div class="row between"><h2 style="margin:0">Путь к B1</h2><span class="chip">${Math.round(prog * 100)}%</span></div>
        <div style="margin:10px 0">${ui.bar(prog)}</div>
        <p class="muted" style="margin:4px 0">Сейчас: этап ${stage} · ${esc(st.title)} (${st.level})</p>
        <p class="muted" style="margin:4px 0">Примерно к <b>${U.fmtLong(est.eta)}</b> при текущем режиме${est.deadline ? (est.ok ? ' — в срок ✓' : ' — позже срока ' + U.fmt(est.deadline)) : ''}.</p></div>
      <div class="card"><div class="row between"><h2 style="margin:0">Неделя</h2><small class="muted">${wk.minutes} / ${wk.goalMin} мин</small></div>
        <div style="margin:10px 0">${ui.bar(wk.goalMin ? wk.minutes / wk.goalMin : 0, 'accent')}</div>
        <div class="week">${[1, 2, 3, 4, 5, 6, 0].map((d, i) => { const date = U.addDays(U.mondayOf(U.today()), i); const did = E.didStudy(date); return `<div class="day-pill ${E.isStudyDay(date) ? 'study' : ''} ${(p.liveDays || []).includes(d) ? 'live' : ''}" ${date === U.today() ? 'style="outline:3px solid var(--accent)"' : ''}>${U.DAYS[d]}<br>${did ? '✓' : E.isStudyDay(date) ? '·' : '—'}</div>`; }).join('')}</div></div>`);
    const m = ui.$('#more'); if (m) m.onclick = () => { const t = E.addExtraTask(); if (t) ui.go('#/do/' + t.id); else U.toast('Все доступные уроки пройдены — пройди итоговый тест'); };
    ui.$('#short').onclick = () => { E.buildDay(10, true); U.toast('Готово: план на сегодня — 10 минут'); ui.dispatch(); };
  });

  // ---------- План ----------
  ui.route('/plan', () => {
    const p = S().profile, est = E.estimate(), lim = E.unlockedStage(), cur = E.currentStage();
    const first = E.nextItems(1)[0];
    const stages = E.roadmap().map(st => {
      const done = st.items.filter(i => E.isDone(i.id)).length;
      const locked = st.n > lim;
      const rows = st.items.map(it => {
        const d = E.isDone(it.id), sk = d && S().units[it.id].status === 'skipped';
        const ic = d ? (sk ? '⏭' : '✓') : (locked ? '🔒' : (first && first.id === it.id ? '▶' : '○'));
        const tag = it.kind === 'vocab' ? '<span class="chip warm">слова</span>' : it.kind === 'write' ? '<span class="chip warm">письмо</span>' : it.interactive ? '<span class="chip">интерактив</span>' : '<span class="chip gray">по книге</span>';
        const sc = S().units[it.id] && S().units[it.id].score != null ? ` · ${Math.round(S().units[it.id].score * 100)}%` : '';
        const label = it.kind === 'grammar' ? `${it.book === 'eg' ? '' : 'M'}${it.n}. ${esc(it.title)}` : esc(it.title);
        return `<a class="list-item ${locked ? 'locked' : ''}" href="${locked ? 'javascript:void(0)' : '#/unit/' + it.id}" style="text-decoration:none;color:inherit"><span class="${d ? 'badge-done' : ''}" style="width:22px;text-align:center">${ic}</span><span class="grow">${label}<br><small class="muted">${sk ? 'пропущено по диагностике' : (d ? 'пройдено' + sc : '~' + it.minutes + ' мин')}</small></span>${tag}</a>`;
      }).join('');
      return `<details class="card" ${st.n === cur ? 'open' : ''}><summary><div class="stage" style="display:inline-grid;width:calc(100% - 20px);vertical-align:middle"><span class="lvl ${locked ? 'off' : ''}">${st.level}</span><span><b>Этап ${st.n}. ${esc(st.title)}</b><br><small class="muted">${done} из ${st.items.length}</small></span></div></summary>
        <p class="muted">${esc(st.desc)}</p>${ui.bar(done / st.items.length)}<div style="margin-top:8px">${rows}</div></details>`;
    }).join('');
    ui.set(`<h1>План обучения</h1>
      <div class="card soft"><b>${Math.round(E.progress() * 100)}% пути пройдено.</b> Осталось ≈ ${Math.round(est.remaining / 60)} ч работы; при ${p.daysPerWeek}×${p.minutesPerDay} мин в неделю — до ${U.fmtLong(est.eta)}.</div>
      ${stages}
      <p class="muted">Нумерация уроков совпадает с книгами: <b>Essential Grammar in Use</b> (этапы 1–3), <b>English Grammar in Use</b> Murphy (этап 4, буква M) и <b>Vocabulary in Use Elementary</b> (темы со словами).</p>`);
  });

  // ---------- Прогресс ----------
  function reportHtml(forTeacher) {
    const p = S().profile; if (!p) return '<div class="card">Данных пока нет.</div>';
    const prog = E.progress(), est = E.estimate(), wk = E.weekStats();
    const acc = E.avgAccuracy(); const weak = E.weakTopics();
    const doneCount = Object.values(S().units).filter(u => u.status === 'done').length;
    const stageRows = E.roadmap().map(st => { const d = st.items.filter(i => E.isDone(i.id)).length; return `<div class="stage"><span class="lvl ${d === 0 ? 'off' : ''}">${st.level}</span><div>${ui.bar(d / st.items.length)}</div><small class="muted">${d}/${st.items.length}</small></div>`; }).join('');
    const days = []; for (let i = 13; i >= 0; i--) { const d = U.addDays(U.today(), -i); days.push({ d, m: (S().days[d] || {}).minutes || 0 }); }
    const maxM = Math.max(30, ...days.map(x => x.m));
    const chart = `<div style="display:flex;align-items:flex-end;gap:4px;height:80px">${days.map(x => `<div title="${U.fmt(x.d)}: ${x.m} мин" style="flex:1;background:${x.m ? 'var(--brand)' : 'var(--line)'};height:${Math.max(4, x.m / maxM * 100)}%;border-radius:4px 4px 0 0"></div>`).join('')}</div><div class="row between"><small class="muted">14 дней назад</small><small class="muted">сегодня</small></div>`;
    const cps = S().checkpoints.slice(-6).reverse();
    const P = S().placement;
    return `
      <div class="card"><div class="row"><div class="ring" style="--p:${Math.round(prog * 100)}"><span>${Math.round(prog * 100)}%</span></div>
        <div class="grow"><b>${esc(p.name)}: путь к B1</b><p class="muted" style="margin:4px 0">Старт: ${P && P.done ? JP.levelName(P.stage) : '—'}<br>Прогноз завершения: ${U.fmtLong(est.eta)}${est.deadline ? '<br>Срок: ' + U.fmtLong(est.deadline) + (est.ok ? ' ✓' : ' — нужно ≈' + est.needWeekly + ' мин/нед') : ''}</p></div></div></div>
      <div class="grid2"><div class="card stat"><b>🔥 ${E.streak()}</b><small>занятий подряд</small></div><div class="card stat"><b>${wk.minutes}′</b><small>на этой неделе из ${wk.goalMin}</small></div>
        <div class="card stat"><b>${doneCount}</b><small>тем пройдено</small></div><div class="card stat"><b>${acc == null ? '—' : Math.round(acc * 100) + '%'}</b><small>средняя точность</small></div>
        <div class="card stat"><b>${E.learnedWords()}</b><small>слов изучено</small></div><div class="card stat"><b>${E.knownWords()}</b><small>слов запомнено крепко</small></div></div>
      <div class="card"><h3>Этапы</h3><div class="stages">${stageRows}</div></div>
      <div class="card"><h3>Минуты за 14 дней</h3>${chart}</div>
      ${weak.length ? `<div class="card"><h3>Что подтянуть</h3>${weak.slice(0, 8).map(w => `<div class="list-item"><span class="grow">${esc(w.title)}<br><small class="muted">${w.score != null ? 'результат ' + Math.round(w.score * 100) + '%' : 'ошибка в диагностике'}</small></span>${forTeacher ? '' : `<a class="btn small ghost" href="#/unit/${w.id}">Открыть</a>`}</div>`).join('')}</div>` : ''}
      ${cps.length ? `<div class="card"><h3>Проверки</h3>${cps.map(c => `<div class="list-item"><span class="grow">${c.type === 'stagetest' ? 'Тест этапа ' + c.stage : 'Недельная проверка'}<br><small class="muted">${U.fmt(c.date)}</small></span><b>${Math.round(c.score * 100)}%</b></div>`).join('')}</div>` : ''}
      ${S().writings.length ? `<div class="card"><h3>Письменные работы (${S().writings.length})</h3>${S().writings.slice().reverse().slice(0, forTeacher ? 20 : 3).map(w => `<details><summary>${esc(w.title)} · ${U.fmt(w.date)}</summary>${forTeacher ? `<p class="muted">${esc(w.prompt)}</p>` : ''}<p style="white-space:pre-wrap">${esc(w.text)}</p></details>`).join('')}</div>` : ''}`;
  }
  ui.route('/progress', () => {
    ui.set(`<h1>Прогресс</h1>${reportHtml(false)}<a class="btn block" href="#/teacher" style="margin:8px 0 24px">👩‍🏫 Отчёт для преподавателя</a>`);
  });

  // ---------- Ещё: настройки ----------
  ui.route('/more', () => {
    const p = S().profile;
    const order = [1, 2, 3, 4, 5, 6, 0];
    ui.set(`<h1>Настройки</h1>
      <div class="card"><h3>Режим занятий</h3>
        <label class="muted">Минут в день</label><select id="mins">${[15, 20, 30, 45, 60, 90].map(m => `<option value="${m}" ${m === p.minutesPerDay ? 'selected' : ''}>${m} минут</option>`).join('')}</select>
        <p class="muted" style="margin-bottom:4px">Дни самостоятельных занятий</p><div class="choices" id="sd">${order.map(d => `<button class="choice day ${p.studyDays.includes(d) ? 'on' : ''}" data-d="${d}">${U.DAYS[d]}</button>`).join('')}</div>
        <p class="muted" style="margin-bottom:4px">Дни занятий с преподавателем</p><div class="choices" id="ld">${order.map(d => `<button class="choice day ${(p.liveDays || []).includes(d) ? 'on' : ''}" data-d="${d}">${U.DAYS[d]}</button>`).join('')}</div>
        <label class="muted" style="display:block;margin-top:12px">Удобное время</label><select id="bt">${[['morning', 'Утро'], ['day', 'День'], ['evening', 'Вечер'], ['late', 'Поздно вечером']].map(([k, l]) => `<option value="${k}" ${k === p.bestTime ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <label class="muted" style="display:block;margin-top:12px">Стиль общения Эми</label><select id="tone">${[['soft', 'Мягко'], ['firm', 'Чётко и по делу'], ['fun', 'С юмором']].map(([k, l]) => `<option value="${k}" ${k === p.tone ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <label class="muted" style="display:block;margin-top:12px">Срок достижения B1 (необязательно)</label><input type="date" id="dl" value="${p.deadline || ''}">
        <div id="est" class="muted" style="margin:10px 0"></div>
        <button class="btn primary block" id="save">Сохранить</button></div>
      <div class="card"><h3>Календарь</h3><p class="muted">Скачай файл и открой его в Google Calendar / Apple Calendar — занятия будут повторяться каждую неделю с напоминанием за 10 минут.</p><button class="btn block" id="ics">📅 Скачать .ics</button></div>
      <div class="card"><h3>Звук</h3><label class="check"><input type="checkbox" id="snd" ${S().settings.sound ? 'checked' : ''}><span>Озвучивать правильные предложения после ответа</span></label>${U.canSpeak() ? '' : '<p class="muted">В этом браузере озвучка недоступна.</p>'}</div>
      <div class="card"><h3>Данные</h3><p class="muted">Прогресс хранится в этом браузере. Сделай копию, чтобы перенести на другое устройство или отправить преподавателю.</p>
        <div class="row"><button class="btn" id="exp">⬇️ Скачать прогресс</button><button class="btn" id="imp">⬆️ Загрузить</button><input type="file" id="file" accept=".json" hidden></div>
        <details style="margin-top:12px"><summary>Начать заново</summary><p class="muted">Удалит все ответы, прогресс и тексты на этом устройстве.</p><button class="btn" style="color:var(--bad)" id="reset">Удалить всё</button></details></div>
      <a class="btn block" href="#/teacher" style="margin-bottom:24px">👩‍🏫 Кабинет преподавателя</a>`);
    const on = id => new Set(ui.$$('#' + id + ' .choice.on').map(b => +b.dataset.d));
    ['sd', 'ld'].forEach(id => ui.$$('#' + id + ' .choice').forEach(b => b.onclick = () => { b.classList.toggle('on'); upd(); }));
    const upd = () => {
      const days = on('sd').size || 1, mins = +ui.$('#mins').value;
      const e = E.estimate({ daysPerWeek: days, minutesPerDay: mins, deadline: ui.$('#dl').value || null });
      ui.$('#est').innerHTML = `При таком режиме (${days}×${mins} мин = ${days * mins} мин/нед) завершение ≈ <b>${U.fmtLong(e.eta)}</b>${e.deadline ? (e.ok ? ' — в срок ✓' : '. Для срока нужно ≈ ' + e.needWeekly + ' мин/нед') : ''}.`;
    };
    ['mins', 'dl'].forEach(id => ui.$('#' + id).onchange = upd); upd();
    ui.$('#save').onclick = () => {
      const sd = [...on('sd')]; if (!sd.length) return U.toast('Выбери хотя бы один день');
      Object.assign(p, { minutesPerDay: +ui.$('#mins').value, studyDays: sd, daysPerWeek: sd.length, liveDays: [...on('ld')], bestTime: ui.$('#bt').value, tone: ui.$('#tone').value, deadline: ui.$('#dl').value || null });
      const d = E.day(U.today()); d.built = false; JP.store.save(); U.toast('Сохранено ✓'); upd();
    };
    ui.$('#ics').onclick = () => ui.download('put-k-b1.ics', E.icsFor(), 'text/calendar');
    ui.$('#snd').onchange = e => { S().settings.sound = e.target.checked; JP.store.save(); };
    ui.$('#exp').onclick = () => ui.download('progress-' + U.today() + '.json', JP.store.exportJSON(), 'application/json');
    ui.$('#imp').onclick = () => ui.$('#file').click();
    ui.$('#file').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { JP.store.importJSON(r.result); E.invalidate(); U.toast('Данные загружены'); ui.go('#/'); } catch (x) { U.toast('Не удалось прочитать файл'); } }; r.readAsText(f); };
    ui.$('#reset').onclick = () => { if (confirm('Точно удалить весь прогресс на этом устройстве?')) { JP.store.reset(); E.invalidate(); location.hash = '#/welcome'; location.reload(); } };
  });

  // ---------- Кабинет преподавателя ----------
  function textReport() {
    const p = S().profile; if (!p) return '';
    const est = E.estimate(), wk = E.weekStats(), acc = E.avgAccuracy(), P = S().placement;
    const L = [];
    L.push(`ОТЧЁТ ПО УЧЕНИЦЕ: ${p.name} — ${U.fmtLong(U.today())}`);
    L.push(`Цель: B1 · прогресс ${Math.round(E.progress() * 100)}% · этап ${E.currentStage()} (${D.stages[E.currentStage() - 1].title})`);
    L.push(`Диагностика: ${P && P.done ? JP.levelName(P.stage) + ' (' + Object.entries(P.by).map(([l, b]) => l + ' ' + b.ok + '/' + b.n).join(', ') + ')' : 'не пройдена'}`);
    L.push(`Режим: ${p.daysPerWeek}×${p.minutesPerDay} мин; ${p.studyDays.map(d => U.DAYS[d]).join(', ')}; ${({ morning: 'утро', day: 'день', evening: 'вечер', late: 'поздно вечером' })[p.bestTime]}; занятий с преподавателем в неделю: ${p.liveLessons}`);
    L.push(`Прогноз завершения: ${U.fmtLong(est.eta)}${est.deadline ? '; срок ' + U.fmtLong(est.deadline) + (est.ok ? ' — реалистично' : ' — нужно ≈' + est.needWeekly + ' мин/нед') : ''}`);
    L.push(`Неделя: ${wk.minutes} из ${wk.goalMin} мин; серия: ${E.streak()}; средняя точность: ${acc == null ? '—' : Math.round(acc * 100) + '%'}`);
    L.push(`Слова: изучено ${E.learnedWords()}, запомнено крепко ${E.knownWords()}`);
    const weak = E.weakTopics(); if (weak.length) L.push('Слабые темы: ' + weak.slice(0, 8).map(w => w.title + (w.score != null ? ' (' + Math.round(w.score * 100) + '%)' : '')).join('; '));
    L.push(`Письменных работ: ${S().writings.length}`);
    L.push(`Цели: ${(p.reasons || []).join(', ')}; трудности: ${(p.difficulties || []).join(', ')}`);
    return L.join('\n');
  }
  ui.route('/teacher', () => {
    const has = !!S().profile;
    ui.set(`<a href="#/" class="muted">← на главную</a><h1>Кабинет преподавателя</h1>
      <div class="card soft"><b>Как это работает.</b> Прогресс Жанель хранится в её браузере. Чтобы увидеть его, она нажимает «Скачать прогресс» (раздел «Ещё»), отправляет вам файл, а вы загружаете его здесь. Ничего не уходит на сторонние серверы.</div>
      <div class="card"><h3>Загрузить отчёт ученицы</h3><input type="file" id="f" accept=".json"><p class="muted" id="msg"></p></div>
      <div id="rep">${has ? '<h2>Данные этого устройства</h2>' + reportBlock() : ''}</div>`);
    function reportBlock() {
      return `<div class="card"><div class="row"><button class="btn small" id="copy">📋 Скопировать краткий отчёт</button></div><pre class="report" id="txt">${esc(textReport())}</pre></div>
        ${suggestions()}${reportHtml(true)}${profileBlock()}`;
    }
    ui.$('#f').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = () => {
        try {
          const obj = JSON.parse(r.result); const restore = JP.store.swap(obj); E.invalidate();
          let html; try { html = '<h2>Отчёт: ' + esc((obj.profile || {}).name || 'ученица') + '</h2>' + reportBlock(); } finally { restore(); E.invalidate(); }
          ui.$('#rep').innerHTML = html; bindCopy(); ui.$('#msg').textContent = 'Файл загружен ✓';
        } catch (x) { ui.$('#msg').textContent = 'Не удалось прочитать файл: ' + x.message; }
      }; r.readAsText(f);
    };
    function bindCopy() { const b = ui.$('#copy'); if (b) b.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(ui.$('#txt').textContent).then(() => U.toast('Скопировано'), () => U.toast('Не удалось скопировать')); }; }
    bindCopy();
  });
  function suggestions() {
    const weak = E.weakTopics().slice(0, 3); const w = S().writings.length;
    const items = [];
    if (weak.length) items.push('Разобрать на занятии: ' + weak.map(x => '«' + esc(x.title) + '»').join(', '));
    if (w) items.push('Дать обратную связь по письменным работам (' + w + ')');
    const p = S().profile; if (p && (p.difficulties || []).includes('speaking')) items.push('Ученица отметила трудность с разговором — добавить речевую практику на занятии');
    if (E.missedScheduledDays() >= 2) items.push('Пропущено занятий подряд: ' + E.missedScheduledDays() + ' — узнать, что мешает');
    if (!items.length) items.push('Пока данных мало — рекомендаций нет.');
    return `<div class="card warm"><h3>Что обсудить на следующем занятии</h3><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
  }
  function profileBlock() {
    const p = S().profile; if (!p) return '';
    const m = { work: 'работа', travel: 'путешествия', study: 'учёба', relocation: 'переезд', friends: 'общение', hobby: 'фильмы/музыка', self: 'для себя' };
    return `<details class="card"><summary>Анкета ученицы</summary><ul><li>Цели: ${(p.reasons || []).map(r => m[r] || r).join(', ')}</li><li>Режим: ${p.daysPerWeek} дн × ${p.minutesPerDay} мин (${p.studyDays.map(d => U.DAYS[d]).join(', ')})</li><li>Время: ${p.bestTime}; устройство: ${p.device}</li><li>Трудности: ${(p.difficulties || []).join(', ')}</li><li>Форматы: ${(p.formats || []).join(', ')}</li><li>Книги: ${p.hasBooks}</li><li>Занятий с преподавателем в неделю: ${p.liveLessons}</li></ul></details>`;
  }
})(window.JP);
