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
      const ic = { unit: t.kind === 'vocab' ? '🔤' : t.kind === 'irregular' ? '🧩' : t.kind === 'write' ? '✍️' : '📘', srs: '🃏', greview: '🔁', checkpoint: '📝', stagetest: '🏆', mix: '⚡' }[t.type] || '•';
      const inner = `<span class="dot">${t.done ? '✓' : ic}</span><span class="grow"><span class="tt">${esc(t.title)}</span><br><small class="muted">${esc(t.desc || '')} · ~${t.minutes} мин</small></span>${t.done ? '' : '<span class="muted">›</span>'}`;
      return t.done ? `<div class="task done">${inner}</div>` : `<a class="task" href="#/do/${t.id}">${inner}</a>`;
    }).join('');
    ui.set(`
      <div class="row between"><div><small class="muted">${U.parse(U.today()).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</small><h1>Привет, ${esc(p.name)}!</h1></div>
        <span class="chip warm" title="Занятий подряд по расписанию">🔥 ${streak}</span></div>
      <div class="card"><div class="amy"><div class="avatar">🙂</div><div class="bubble" style="box-shadow:none;border:0;padding:0;background:transparent">${esc(A.homeMessage(day))}</div></div></div>
      ${(() => { const C = JP.cloud; if (!(C && C.enabled && C.token() && !C.authed)) return ''; if ((S().seen.linkSnooze || '') > U.today()) return ''; const pend = C.pending && C.pending();
        return `<div class="card warm" id="linkbanner"><div class="row between"><b>📧 ${pend && pend.legacyToken ? 'Завершите привязку email' : 'Привяжите email'}</b><button class="icon-btn" id="snooze" aria-label="Напомнить позже">✕</button></div>
          <p class="muted" style="margin:6px 0 10px">${pend && pend.legacyToken ? 'Подтвердите почту по письму и завершите привязку.' : 'Чтобы входить с любого устройства по email и паролю. Прогресс сохранится.'}</p><a class="btn primary small" href="#/more">${pend && pend.legacyToken ? 'Завершить' : 'Привязать email'}</a></div>`; })()}
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
    const sn = ui.$('#snooze'); if (sn) sn.onclick = () => { S().seen.linkSnooze = U.addDays(U.today(), 3); JP.store.save(); ui.$('#linkbanner').remove(); U.toast('Напомню через 3 дня'); };
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
        const tag = it.kind === 'vocab' ? '<span class="chip warm">слова</span>' : it.kind === 'irregular' ? '<span class="chip warm">глаголы</span>' : it.kind === 'write' ? '<span class="chip warm">письмо</span>' : it.interactive ? '<span class="chip">интерактив</span>' : '<span class="chip gray">по книге</span>';
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
      ${cps.length ? `<div class="card"><h3>Проверки</h3>${cps.map(c => `<div class="list-item"><span class="grow">${c.type === 'stagetest' ? 'Тест этапа ' + c.stage : c.type === 'irregular' ? 'Неправильные глаголы' : 'Недельная проверка'}<br><small class="muted">${U.fmt(c.date)}</small></span><b>${Math.round(c.score * 100)}%</b></div>`).join('')}</div>` : ''}
      ${S().writings.length ? `<div class="card"><h3>Письменные работы (${S().writings.length})</h3>${S().writings.slice().reverse().slice(0, forTeacher ? 20 : 3).map(w => `<details><summary>${esc(w.title)} · ${U.fmt(w.date)}</summary>${forTeacher ? `<p class="muted">${esc(w.prompt)}</p>` : ''}<p style="white-space:pre-wrap">${esc(w.text)}</p></details>`).join('')}</div>` : ''}`;
  }
  // ---------- Дашборд ----------
  const CATS = [['grammar', 'Грамматика', 'var(--d-gold)'], ['words', 'Слова', 'var(--d-blue)'], ['writing', 'Письмо', 'var(--d-rose)'], ['review', 'Повторение и тесты', 'var(--d-green)']];
  function spark(vals, w, h) {
    const max = Math.max(1, ...vals), n = vals.length - 1 || 1;
    const pts = vals.map((v, i) => [i / n * w, h - 3 - v / max * (h - 8)]);
    const line = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${line} L${w} ${h} L0 ${h} Z" fill="var(--d-gold)" opacity=".15"/><path d="${line}" fill="none" stroke="var(--d-gold)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  }
  function weeklyChart() {
    const mon = U.mondayOf(U.today()); const weeks = [];
    for (let k = 11; k >= 0; k--) {
      const start = U.addDays(mon, -7 * k); const c = { grammar: 0, words: 0, writing: 0, review: 0 };
      for (let i = 0; i < 7; i++) { const d = S().days[U.addDays(start, i)]; if (!d) continue; if (d.cat) Object.keys(c).forEach(x => { c[x] += d.cat[x] || 0; }); else c.grammar += d.minutes || 0; }
      weeks.push({ start, c, tot: c.grammar + c.words + c.writing + c.review });
    }
    const goal = S().profile.daysPerWeek * S().profile.minutesPerDay; const max = Math.max(goal, ...weeks.map(w => w.tot), 60);
    const W = 600, H = 220, L = 34, B = 24, bw = (W - L) / 12;
    let g = '';
    [0, .5, 1].forEach(f => { const y = H - B - f * (H - B - 10); g += `<line x1="${L}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${L - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${Math.round(max * f)}</text>`; });
    weeks.forEach((w, i) => {
      let y = H - B; const x = L + i * bw + bw * .18, ww = bw * .64;
      CATS.forEach(([k, , col]) => { const h = w.c[k] / max * (H - B - 10); if (h > 0) { y -= h; g += `<rect x="${x}" y="${y}" width="${ww}" height="${h}" fill="${col}" rx="2"><title>${U.fmt(w.start)}: ${k} ${w.c[k]} мин</title></rect>`; } });
      if (i % 2 === 0 || i === 11) g += `<text x="${x + ww / 2}" y="${H - 6}" text-anchor="middle" font-size="10" fill="var(--muted)">${U.fmt(w.start, { day: 'numeric', month: 'short' }).replace('.', '')}</text>`;
    });
    const gy = H - B - goal / max * (H - B - 10);
    g += `<line x1="${L}" x2="${W}" y1="${gy}" y2="${gy}" stroke="var(--d-ink)" stroke-dasharray="4 4" opacity=".55"/><text x="${W}" y="${gy - 4}" text-anchor="end" font-size="10" fill="var(--d-ink)">цель ${goal}</text>`;
    return { svg: `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Минуты занятий по неделям">${g}</svg>`, total: weeks.reduce((a, w) => a + w.tot, 0) };
  }
  function topicStatus() {
    const items = E.items(), U_ = S().units; let done = 0, rev = 0, weak = 0, skip = 0, ahead = 0;
    items.forEach(it => { const u = U_[it.id]; if (!u) ahead++; else if (u.status === 'skipped') skip++; else if (u.weak) weak++; else if (u.next && u.next <= U.addDays(U.today(), 1)) rev++; else done++; });
    return { done, rev, weak, skip, ahead, total: items.length };
  }
  function heatmap() {
    const mon = U.mondayOf(U.today()), today = U.today(), goal = S().profile.minutesPerDay;
    let cols = '', n = 0;
    for (let w = 11; w >= 0; w--) {
      let col = '';
      for (let d = 0; d < 7; d++) {
        const date = U.addDays(mon, -7 * w + d);
        if (date > today) { col += '<i class="hm future"></i>'; continue; }
        const m = (S().days[date] || {}).minutes || 0; if (m) n++;
        const lvl = m === 0 ? 0 : m < goal * .5 ? 1 : m < goal ? 2 : m < goal * 1.5 ? 3 : 4;
        col += `<i class="hm l${lvl}${date === today ? ' now' : ''}" title="${U.fmt(date)}: ${m} мин"></i>`;
      }
      cols += `<div class="hm-col">${col}</div>`;
    }
    const labels = ['Пн', '', 'Ср', '', 'Пт', '', 'Вс'].map(l => `<span>${l}</span>`).join('');
    return `<div class="d-card"><div class="row between"><div><h2 class="d-h2">Календарь занятий</h2><small class="muted">12 недель · дней с занятиями: ${n}</small></div><div class="d-legend" style="margin:0">Меньше <i class="hm l1"></i><i class="hm l2"></i><i class="hm l3"></i><i class="hm l4"></i> больше</div></div><div class="hm-wrap"><div class="hm-lab">${labels}</div><div class="hm-grid">${cols}</div></div></div>`;
  }
  function dashHtml(forTeacher) {
    const p = S().profile, prog = E.progress(), est = E.estimate(), wk = E.weekStats(), acc = E.avgAccuracy();
    const last14 = []; for (let i = 13; i >= 0; i--) last14.push((S().days[U.addDays(U.today(), -i)] || {}).minutes || 0);
    const prev7 = last14.slice(0, 7).reduce((a, b) => a + b, 0), cur7 = last14.slice(7).reduce((a, b) => a + b, 0);
    const diff = cur7 - prev7; const trend = diff >= 0 ? `↗ +${diff} мин` : `↘ ${diff} мин`;
    const ch = weeklyChart(), ts = topicStatus();
    const dayDone = E.day(U.today()).tasks; const dp = dayDone.length ? Math.round(dayDone.filter(t => t.done).length / dayDone.length * 100) : 0;
    const known = E.knownWords(), learned = E.learnedWords();
    const accVals = Object.values(S().units).filter(u => u.status === 'done' && u.score != null).sort((a, b) => (a.doneAt || '').localeCompare(b.doneAt || '')).slice(-14).map(u => u.score * 100);
    const seg = [['done', ts.done, 'var(--d-blue)'], ['rev', ts.rev, 'var(--d-gold)'], ['weak', ts.weak, 'var(--bad)'], ['skip', ts.skip, 'var(--d-green)'], ['ahead', ts.ahead, 'var(--line)']];
    const rows = [['✓', 'Пройдено', 'закреплено, результат ≥ 70%', ts.done, 'var(--d-blue)'], ['🔁', 'На повторении', 'вернутся сегодня или завтра', ts.rev, 'var(--d-gold)'], ['!', 'Нужно подтянуть', 'результат ниже 70%', ts.weak, 'var(--bad)'], ['⏭', 'Пропущено', 'знакомо по диагностике', ts.skip, 'var(--d-green)'], ['○', 'Впереди', 'ещё не начато', ts.ahead, 'var(--muted)']]
      .map(([ic, t, d, n, col]) => `<div class="d-row"><span class="d-ic" style="color:${col}">${ic}</span><span class="grow"><b>${t}</b><br><small class="muted">${d}</small></span><span class="d-num">${n}</span></div>`).join('');
    const stageRows = E.roadmap().map(st => { const d = st.items.filter(i => E.isDone(i.id)).length; return `<div class="d-stage"><span class="lvl ${d === 0 ? 'off' : ''}">${st.level}</span><div class="grow"><div class="row between"><b>${esc(st.title)}</b><small class="muted">${d} из ${st.items.length}</small></div><div class="d-bar"><i style="width:${Math.round(d / st.items.length * 100)}%"></i></div></div></div>`; }).join('');
    const weak = E.weakTopics().slice(0, 5);
    const doneCount = Object.values(S().units).filter(u => u.status === 'done').length;
    return `<div class="dash">
      <div class="d-eyebrow">${U.parse(U.today()).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()} · ЭТАП ${E.currentStage()}</div>
      <h1 class="d-title">Прогресс, ${esc(p.name)}</h1>
      <p class="muted">Пройдено ${doneCount} ${U.plural(doneCount, 'тема', 'темы', 'тем')}, изучено ${learned} ${U.plural(learned, 'слово', 'слова', 'слов')}. До B1 осталось ≈ ${Math.round(est.remaining / 60)} ч, прогноз — ${U.fmtLong(est.eta)}</p>
      <div class="d-kpis">
        <div class="d-card"><div class="d-lab">Путь к B1</div><div class="d-big">${Math.round(prog * 100)}<small>%</small></div><div class="d-bar"><i style="width:${Math.round(prog * 100)}%"></i></div><div class="d-foot">${est.deadline ? (est.ok ? '✓ срок реален' : 'нужно ≈' + est.needWeekly + ' мин/нед') : 'к ' + U.fmt(est.eta)}</div></div>
        <div class="d-card"><div class="d-lab">Эта неделя</div><div class="d-big">${wk.minutes}<small> / ${wk.goalMin} мин</small></div><div class="d-bar"><i style="width:${Math.round(U.clamp(wk.minutes / wk.goalMin, 0, 1) * 100)}%"></i></div><div class="d-foot"><span class="${diff >= 0 ? 'up' : 'down'}">${trend}</span> к прошлой неделе</div></div>
        <div class="d-card"><div class="d-lab">Точность <small>последние темы</small></div><div class="d-big">${acc == null ? '—' : Math.round(acc * 100)}<small>${acc == null ? '' : '%'}</small></div>${spark(accVals.length > 1 ? accVals : [0, 0], 200, 40)}<div class="d-foot">${accVals.length} ${U.plural(accVals.length, 'результат', 'результата', 'результатов')}</div></div>
        <div class="d-card"><div class="d-lab">Слова</div><div class="d-big">${learned}</div>${spark(last14, 200, 40)}<div class="d-foot"><span class="up">${known}</span> запомнено крепко · 🔥 ${E.streak()} подряд</div></div>
      </div>
      <div class="d-main">
        <div class="d-card d-wide"><div class="row between"><div><h2 class="d-h2">Минуты по неделям</h2><small class="muted">12 недель, по видам занятий</small></div><div class="d-right"><small class="muted">ВСЕГО</small><div class="d-total">${ch.total} мин</div></div></div>
          <div class="d-legend">${CATS.map(c => `<span><i style="background:${c[2]}"></i>${c[1]}</span>`).join('')}</div>${ch.svg}</div>
        <div class="d-card"><div class="row between"><h2 class="d-h2">Статус тем</h2><small class="muted">${ts.total} всего</small></div>
          <div class="d-seg">${seg.map(([k, n, col]) => n ? `<i style="flex:${n};background:${col}" title="${k}: ${n}"></i>` : '').join('')}</div>
          ${rows}
          <div class="d-today"><div><b>Сегодняшний план</b><br><small class="muted">${dayDone.filter(t => t.done).length} из ${dayDone.length} задач</small></div><div class="ring" style="--p:${dp};width:58px;height:58px"><span style="width:44px;height:44px;font-size:.85rem">${dp}%</span></div></div></div>
      </div>
      <div style="margin:12px 0">${heatmap()}</div>
      <div class="d-main">
        <div class="d-card"><h2 class="d-h2">Этапы маршрута</h2><div style="margin-top:8px">${stageRows}</div></div>
        <div class="d-card"><h2 class="d-h2">Что подтянуть</h2>${weak.length ? weak.map(w => `<div class="d-row"><span class="grow">${esc(w.title)}<br><small class="muted">${w.score != null ? 'результат ' + Math.round(w.score * 100) + '%' : 'ошибка в диагностике'}</small></span>${forTeacher ? '' : `<a class="btn small ghost" href="#/unit/${w.id}">Открыть</a>`}</div>`).join('') : '<p class="muted">Слабых тем нет.</p>'}
          ${S().checkpoints.length ? `<h3 style="margin-top:16px">Последние проверки</h3>${S().checkpoints.slice(-3).reverse().map(c => `<div class="d-row"><span class="grow">${c.type === 'stagetest' ? 'Тест этапа ' + c.stage : c.type === 'irregular' ? 'Неправильные глаголы' : 'Недельная проверка'}<br><small class="muted">${U.fmt(c.date)}</small></span><span class="d-num">${Math.round(c.score * 100)}%</span></div>`).join('')}` : ''}</div>
      </div>
      ${forTeacher ? '' : '<a class="btn block" href="#/teacher" style="margin:8px 0 24px">👩‍🏫 Отчёт для преподавателя</a>'}</div>`;
  }
  ui.route('/progress', () => ui.set(dashHtml(false)));

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
      ${JP.preview ? '<div class="card warm"><h3>Аккаунт</h3><p class="muted" style="margin:0">Режим просмотра: вход и сервер отключены, все действия остаются только в этом окне.</p></div>' : (() => {
        const C = JP.cloud, authed = !!(C && C.authed), legacy = !!(C && C.token() && !authed), PW = 'width:100%;font:inherit;border:2px solid var(--line);border-radius:12px;padding:11px 14px;min-height:46px;background:var(--card);color:var(--ink);margin-bottom:8px';
        const who = authed ? ' (' + esc(S().seen.cloudEmail || C.email || '') + ')' : S().seen.cloudLogin ? ' (логин: ' + esc(S().seen.cloudLogin) + ')' : '';
        const status = (authed || legacy) ? 'Прогресс сохраняется на сервере автоматически' + (C.status === 'ok' ? ' ✓' : C.status === 'err' ? ' (сейчас нет связи, сохраню позже)' : C.status === 'revoked' ? ' — доступ отозван, войдите снова' : '') + '.' : 'Вход не выполнен: данные только на этом устройстве.';
        const pend = C && C.pending && C.pending(); const waiting = legacy && pend && pend.legacyToken && pend.email;
        return `<div class="card"><h3>Аккаунт</h3><p>Вы вошли как <b>${esc(p.name)}</b>${who}. ${status}</p>
          ${legacy ? (waiting ? `<div class="card soft" id="linkbox"><b>Подтвердите почту</b><p class="muted" style="margin:4px 0 8px">Мы отправили письмо на ${esc(pend.email)}. Перейдите по ссылке в письме, затем введите пароль и завершите привязку.</p>
              <input type="password" id="lp" placeholder="Пароль, который вы указали" autocomplete="current-password" style="${PW}"><div id="lmsg" role="alert" style="color:var(--bad);min-height:1.2em"></div><div class="row"><button class="btn primary" id="finlink">Завершить привязку</button><button class="btn ghost" id="cancellink">Отмена</button></div></div>`
            : `<div class="card soft" id="linkbox"><b>Привяжите email</b><p class="muted" style="margin:4px 0 8px">Чтобы входить с любого устройства по email и паролю. Прогресс сохранится.</p>
              <input type="text" id="le" placeholder="Email" inputmode="email" autocapitalize="off" style="${PW}"><input type="password" id="lp" placeholder="Придумайте пароль (от 8 символов)" autocomplete="new-password" style="${PW}"><input type="password" id="lp2" placeholder="Повторите пароль" autocomplete="new-password" style="${PW}">
              <div id="lmsg" role="alert" style="color:var(--bad);min-height:1.2em"></div><button class="btn primary" id="sendlink">Отправить письмо для подтверждения</button></div>`) : ''}
          ${(authed || (legacy && S().seen.cloudLogin)) ? `<details class="card soft" id="chpw"><summary>Сменить пароль</summary>
            <input type="password" id="op" placeholder="Текущий пароль" autocomplete="current-password" style="${PW};margin-top:8px"><input type="password" id="n1" placeholder="Новый пароль, не короче 8 символов" autocomplete="new-password" style="${PW}"><input type="password" id="n2" placeholder="Повторите новый пароль" autocomplete="new-password" style="${PW}">
            <div id="cmsg" role="alert" style="min-height:1.2em;color:var(--bad)"></div><button class="btn primary" id="savechpw">Сохранить новый пароль</button><p class="muted" style="font-size:.85rem;margin:8px 0 0">На других устройствах придётся войти заново.</p></details>` : ''}
          <div class="row"><button class="btn" id="logout">Выйти</button><a class="btn ghost" href="#/admin">Вход для преподавателя</a></div>
          <p class="muted" style="font-size:.85rem;margin-bottom:0">«Выйти» завершает вход на этом устройстве. Прогресс остаётся на сервере: войдите снова по email и паролю.</p></div>`;
      })()}
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
    const lo = ui.$('#logout'); if (lo) lo.onclick = async () => { if (!confirm('Выйти на этом устройстве? Прогресс сохранён на сервере, вход — по email и паролю.')) return; if (JP.cloud && JP.cloud.hasAccess()) { await JP.cloud.flush(); await JP.cloud.logoutStudent(); } JP.store.reset(); JP.E.invalidate(); location.hash = '#/login'; location.reload(); };
    const cp = ui.$('#savechpw'); if (cp) cp.onclick = async () => {
      const m = ui.$('#cmsg'), v = id => ui.$('#' + id).value; m.style.color = 'var(--bad)';
      if (!v('op')) { m.textContent = 'Введите текущий пароль.'; return; }
      if (v('n1').length < 8) { m.textContent = 'Новый пароль должен быть не короче 8 символов.'; return; }
      if (v('n1') !== v('n2')) { m.textContent = 'Новые пароли не совпадают.'; return; }
      if (v('n1') === v('op')) { m.textContent = 'Новый пароль совпадает с текущим.'; return; }
      cp.disabled = true; m.textContent = '';
      try { await JP.cloud.changePassword(v('op'), v('n1')); ['op', 'n1', 'n2'].forEach(id => { ui.$('#' + id).value = ''; }); m.style.color = 'var(--ok)'; m.textContent = 'Пароль изменён ✓'; U.toast('Пароль изменён'); }
      catch (x) { m.textContent = /bad_credentials/.test(x.message) ? 'Текущий пароль указан неверно.' : JP.cloud.err(x); }
      cp.disabled = false;
    };
    const sl = ui.$('#sendlink'); if (sl) sl.onclick = async () => {
      const m = ui.$('#lmsg'), v = id => ui.$('#' + id).value.trim(); const em = v('le').toLowerCase(), pw = ui.$('#lp').value;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { m.textContent = 'Проверьте адрес email.'; return; } if (pw.length < 8) { m.textContent = 'Пароль должен быть не короче 8 символов.'; return; } if (pw !== ui.$('#lp2').value) { m.textContent = 'Пароли не совпадают.'; return; }
      sl.disabled = true; m.textContent = '';
      try { const r = await JP.cloud.linkEmail(em, pw); U.toast(r.confirmed ? 'Email привязан' : 'Письмо отправлено'); ui.dispatch(); } catch (x) { m.textContent = JP.cloud.err(x); sl.disabled = false; }
    };
    const fl = ui.$('#finlink'); if (fl) fl.onclick = async () => { const m = ui.$('#lmsg'); fl.disabled = true; m.textContent = '';
      try { await JP.cloud.finishLink(ui.$('#lp').value); U.toast('Email привязан. Теперь входите по email и паролю'); ui.dispatch(); } catch (x) { m.textContent = JP.cloud.err(x); fl.disabled = false; } };
    const cl = ui.$('#cancellink'); if (cl) cl.onclick = () => { localStorage.removeItem('b1.pending'); ui.dispatch(); };
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
  function reportBlock() {
      return `<div class="card"><div class="row"><button class="btn small" id="copy">📋 Скопировать краткий отчёт</button></div><pre class="report" id="txt">${esc(textReport())}</pre></div>
        ${suggestions()}${reportHtml(true)}${profileBlock()}`;
    }
  // отчёт по произвольным данным ученика (из файла или из базы)
  JP.teacherReport = obj => { const restore = JP.store.swap(obj); E.invalidate(); try { return reportBlock(); } finally { restore(); E.invalidate(); } };
  // полный дашборд ученика для кабинета преподавателя
  JP.studentDashboard = obj => { const restore = JP.store.swap(obj); E.invalidate(); try { return dashHtml(true); } finally { restore(); E.invalidate(); } };
  JP.studentSummary = obj => {
    const restore = JP.store.swap(obj); E.invalidate();
    try {
      const p = S().profile; if (!p) return { onboarded: false };
      const wk = E.weekStats(), last = Object.keys(S().days).filter(d => (S().days[d].minutes || 0) > 0).sort().pop() || null;
      const st = E.currentStage();
      return { onboarded: true, progress: E.progress(), stage: st, level: D.stages[st - 1].level, streak: E.streak(), weekMin: wk.minutes, goalMin: wk.goalMin, acc: E.avgAccuracy(), weak: E.weakTopics().length, done: Object.values(S().units).filter(u => u.status === 'done').length, writings: S().writings.length, lastStudy: last, placed: !!(S().placement && S().placement.done), words: E.learnedWords() };
    } finally { restore(); E.invalidate(); }
  };
  ui.route('/teacher', () => {
    const has = !!S().profile;
    ui.set(`<a href="#/" class="muted">← на главную</a><h1>Кабинет преподавателя</h1>
      <div class="card soft"><b>Как это работает.</b> Прогресс ученика хранится в его браузере. Чтобы увидеть его, она нажимает «Скачать прогресс» (раздел «Ещё»), отправляет вам файл, а вы загружаете его здесь. Ничего не уходит на сторонние серверы.</div>
      <div class="card"><h3>Загрузить отчёт ученицы</h3><input type="file" id="f" accept=".json"><p class="muted" id="msg"></p></div>
      <div id="rep">${has ? '<h2>Данные этого устройства</h2>' + reportBlock() : ''}</div>`);
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
