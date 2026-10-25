// Знакомство (опросник), диагностический тест и экран «Твой план».
(function (JP) {
  const U = JP.U, E = JP.E, ui = JP.ui, S = () => JP.store.get(), D = JP.data, esc = U.esc;

  // ---------------- Опросник ----------------
  const WHY = [['work', '💼 Работа и карьера'], ['travel', '✈️ Путешествия'], ['study', '🎓 Учёба / экзамен'], ['relocation', '🌍 Переезд'], ['friends', '💬 Общение с людьми'], ['hobby', '🎬 Фильмы, музыка, книги'], ['self', '🌱 Для себя']];
  const STEPS = [
    { key: 'name', type: 'text', ask: () => 'Привет! Я Эми — виртуальный ассистент твоего преподавателя 👋 Я буду вести тебя к уровню B1: подбирать уроки, напоминать о повторении и следить за прогрессом. Как к тебе обращаться?', def: '' },
    { key: 'reasons', type: 'multi', ask: a => `Приятно познакомиться, ${a.name}! Зачем тебе английский? Это нужно, чтобы я расставила акценты в словах. Можно выбрать несколько.`, options: WHY },
    { key: 'selfLevel', type: 'single', ask: () => 'Как ты сама оцениваешь свой английский сейчас?', options: [['zero', 'Почти с нуля'], ['base', 'Знаю базу, но путаюсь'], ['talk', 'Могу немного поговорить'], ['passive', 'Понимаю многое, но сама говорю мало']] },
    { key: 'difficulties', type: 'multi', ask: () => 'Что даётся тяжелее всего? Это поможет мне подобрать упражнения.', options: [['grammar', 'Грамматика'], ['words', 'Запоминать слова'], ['speaking', 'Говорить'], ['listening', 'Понимать на слух'], ['reading', 'Читать'], ['writing', 'Писать'], ['pron', 'Произношение'], ['fear', 'Страх ошибиться']] },
    { key: 'daysPerWeek', type: 'single', ask: () => 'Теперь о режиме — это самое важное. Сколько дней в неделю ты можешь заниматься самостоятельно, без пропусков? Лучше назвать меньше, но выполнить.', options: [[2, '2 дня'], [3, '3 дня'], [4, '4 дня'], [5, '5 дней'], [6, '6 дней'], [7, 'Каждый день']] },
    { key: 'studyDays', type: 'days', ask: a => `Какие именно дни? Выбери ${a.daysPerWeek} ${U.plural(a.daysPerWeek, 'день', 'дня', 'дней')} (можно изменить число).`, },
    { key: 'minutesPerDay', type: 'single', ask: () => 'Сколько минут в день ты готова уделять? Помни: 20 минут каждый день работают лучше, чем 2 часа раз в неделю.', options: [[15, '15 минут'], [20, '20 минут'], [30, '30 минут'], [45, '45 минут'], [60, '1 час'], [90, '1,5 часа']],
      react: a => { const w = a.daysPerWeek * a.minutesPerDay; return `Запомнила: ${a.daysPerWeek} × ${a.minutesPerDay} = ${w} минут в неделю (≈ ${(w / 60).toFixed(1).replace('.0', '')} ч). ${w < 90 ? 'Это щадящий режим — результат придёт, но медленнее.' : w < 240 ? 'Хороший, реалистичный режим.' : 'Серьёзный темп — главное, не перегореть. Я подстрахую повторением.'}`; } },
    { key: 'bestTime', type: 'single', ask: () => 'В какое время суток тебе удобнее заниматься? Я добавлю напоминания в календарь.', options: [['morning', '🌅 Утром (около 8:00)'], ['day', '☀️ Днём (около 13:00)'], ['evening', '🌆 Вечером (около 19:00)'], ['late', '🌙 Поздно вечером (около 21:30)']] },
    { key: 'device', type: 'single', ask: () => 'С какого устройства ты будешь заниматься чаще всего?', options: [['phone', '📱 Телефон'], ['laptop', '💻 Ноутбук / компьютер'], ['tablet', 'Планшет'], ['mix', 'По-разному']] },
    { key: 'formats', type: 'multi', ask: () => 'Какие форматы тебе нравятся? Выбери, что хочется видеть чаще.', options: [['quick', '⚡ Короткие упражнения'], ['cards', '🃏 Карточки со словами'], ['audio', '🎧 Аудио и произношение'], ['book', '📖 Работа с книгой'], ['writing', '✍️ Письменные задания'], ['teacher', '🗣️ Разговор с преподавателем']] },
    { key: 'liveLessons', type: 'single', ask: () => 'А сколько раз в неделю у тебя занятия с преподавателем вживую (онлайн или офлайн)? Они идут сверх самостоятельной работы.', options: [[0, 'Пока нет'], [1, '1 раз'], [2, '2 раза'], [3, '3 раза']] },
    { key: 'liveDays', type: 'days', optional: true, when: a => a.liveLessons > 0, ask: () => 'В какие дни занятия с преподавателем? Если пока не знаешь — нажми «Пропустить».' },
    { key: 'deadlineMode', type: 'single', ask: () => 'Есть ли срок, к которому нужен уровень B1?', options: [['none', 'Срока нет — иду в комфортном темпе'], ['date', 'Да, к определённой дате'], ['asap', 'Как можно скорее']] },
    { key: 'deadline', type: 'date', when: a => a.deadlineMode === 'date', ask: () => 'К какой дате? Я честно скажу, реально ли это при твоём режиме.' },
    { key: 'hasBooks', type: 'single', ask: () => 'Книги, по которым мы работаем (Essential Grammar in Use, Murphy и Vocabulary in Use Elementary), у тебя под рукой?', options: [['all', 'Да, все три'], ['some', 'Только часть'], ['none', 'Нет, только платформа']] },
    { key: 'tone', type: 'single', ask: () => 'И последнее: как мне с тобой общаться, когда нужно подбодрить или напомнить?', options: [['soft', '🤍 Мягко, без давления'], ['firm', '🎯 Чётко и по делу'], ['fun', '😄 С юмором']] }
  ];
  const DEFAULT_DAYS = { 2: [2, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6] };
  const labelOf = (step, v) => {
    if (step.type === 'text') return v;
    if (step.type === 'days') return v.length ? v.map(d => U.DAYS[d]).join(', ') : 'Пока не знаю';
    if (step.type === 'date') return U.fmtLong(v);
    const o = Object.fromEntries(step.options.map(x => [String(x[0]), x[1]]));
    return Array.isArray(v) ? v.map(x => o[String(x)]).join(', ') : o[String(v)];
  };

  ui.route('/welcome', () => {
    if (S().profile) return ui.go('#/');
    const answers = (S().seen.draft && S().seen.draft.answers) || {};
    let idx = 0;
    const nextIdx = from => { for (let k = from; k < STEPS.length; k++) { const s = STEPS[k]; if (!s.when || s.when(answers)) return k; } return STEPS.length; };
    ui.set(`<h1>Знакомство</h1><p class="muted">Короткий разговор (около 3 минут): я узнаю, как тебе удобно учиться. Ответы можно будет изменить позже.</p><div class="chat" id="chat"></div><div class="answer-area" id="ans"></div>`, { noTabs: true });
    const chat = ui.$('#chat'), ans = ui.$('#ans');
    const amy = (text, cb) => {
      const m = document.createElement('div'); m.className = 'msg'; m.innerHTML = '<div class="avatar">🙂</div><div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div>';
      chat.appendChild(m); ans.innerHTML = '';
      setTimeout(() => { if (!document.body.contains(ans)) return; m.querySelector('.bubble').textContent = text; m.scrollIntoView({ block: 'end', behavior: 'smooth' }); cb && cb(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
    };
    const me = text => { const m = document.createElement('div'); m.className = 'msg me'; m.innerHTML = '<div class="bubble me"></div>'; m.firstChild.textContent = text; chat.appendChild(m); };
    const save = () => { S().seen.draft = { answers }; JP.store.save(); };

    function ask(k) {
      idx = nextIdx(k);
      if (idx >= STEPS.length) return finish();
      const s = STEPS[idx];
      amy(s.ask(answers), () => widget(s));
    }
    function submit(s, v) {
      answers[s.key] = v;
      if (s.key === 'daysPerWeek' && !answers.studyDays) answers._defDays = DEFAULT_DAYS[v];
      if (s.key === 'studyDays') answers.daysPerWeek = v.length;
      me(labelOf(s, v)); save();
      if (s.react) { amy(s.react(answers), () => ask(idx + 1)); } else ask(idx + 1);
    }
    function widget(s) {
      if (s.type === 'text') {
        ans.innerHTML = `<div class="row"><input type="text" id="in" value="${esc(s.def || '')}" maxlength="40" aria-label="Ответ" class="grow"><button class="btn primary" id="ok">Дальше</button></div>`;
        const inp = ui.$('#in'); inp.focus(); inp.select();
        const go = () => { const v = inp.value.trim(); if (!v) { inp.focus(); return; } submit(s, v); };
        ui.$('#ok').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
      } else if (s.type === 'single') {
        ans.innerHTML = `<div class="choices">${s.options.map(o => `<button class="choice" data-v="${esc(o[0])}">${esc(o[1])}</button>`).join('')}</div>`;
        ui.$$('.choice', ans).forEach((b, i) => b.onclick = () => submit(s, s.options[i][0]));
      } else if (s.type === 'multi') {
        const on = new Set();
        ans.innerHTML = `<div class="choices">${s.options.map(o => `<button class="choice" data-v="${esc(o[0])}" aria-pressed="false">${esc(o[1])}</button>`).join('')}</div><div class="row" style="margin-top:12px"><button class="btn primary" id="ok" disabled>Дальше</button></div>`;
        ui.$$('.choice', ans).forEach((b, i) => b.onclick = () => { const v = s.options[i][0]; on.has(v) ? on.delete(v) : on.add(v); b.classList.toggle('on', on.has(v)); b.setAttribute('aria-pressed', on.has(v)); ui.$('#ok').disabled = on.size === 0; });
        ui.$('#ok').onclick = () => submit(s, s.options.map(o => o[0]).filter(v => on.has(v)));
      } else if (s.type === 'days') {
        const on = new Set(s.key === 'studyDays' ? (answers._defDays || DEFAULT_DAYS[answers.daysPerWeek] || [1, 3, 5]) : []);
        const order = [1, 2, 3, 4, 5, 6, 0];
        ans.innerHTML = `<div class="choices">${order.map(d => `<button class="choice day ${on.has(d) ? 'on' : ''}" data-d="${d}" aria-pressed="${on.has(d)}">${U.DAYS[d]}</button>`).join('')}</div><div class="row" style="margin-top:12px"><button class="btn primary" id="ok">Дальше</button>${s.optional ? '<button class="btn ghost" id="skip">Пропустить</button>' : ''}</div>`;
        const sync = () => { ui.$('#ok').disabled = !s.optional && on.size === 0; };
        ui.$$('.choice', ans).forEach(b => b.onclick = () => { const d = +b.dataset.d; on.has(d) ? on.delete(d) : on.add(d); b.classList.toggle('on', on.has(d)); b.setAttribute('aria-pressed', on.has(d)); sync(); });
        sync();
        ui.$('#ok').onclick = () => submit(s, order.filter(d => on.has(d)));
        if (s.optional) ui.$('#skip').onclick = () => submit(s, []);
      } else if (s.type === 'date') {
        const min = U.addDays(U.today(), 14);
        ans.innerHTML = `<div class="row"><input type="date" id="in" min="${min}" value="${U.addDays(U.today(), 180)}" class="grow" aria-label="Дата"><button class="btn primary" id="ok">Дальше</button></div>`;
        ui.$('#ok').onclick = () => { const v = ui.$('#in').value; if (v) submit(s, v); };
      }
    }
    function finish() {
      const a = answers;
      S().profile = {
        name: a.name || 'друг', reasons: a.reasons || [], selfLevel: a.selfLevel, difficulties: a.difficulties || [],
        daysPerWeek: a.studyDays.length, studyDays: a.studyDays, minutesPerDay: a.minutesPerDay, bestTime: a.bestTime, device: a.device,
        formats: a.formats || [], liveLessons: a.liveLessons || 0, liveDays: a.liveDays || [], deadline: a.deadline || null, asap: a.deadlineMode === 'asap',
        hasBooks: a.hasBooks, tone: a.tone || 'soft', startedAt: U.today()
      };
      delete S().seen.draft; E.invalidate(); JP.store.save();
      amy(`Спасибо, ${S().profile.name}! Теперь короткий диагностический тест: 30 вопросов, около 10 минут. Он покажет, с какого места начать, чтобы не тратить время на уже знакомое. Подсказки не нужны — если не знаешь, смело жми «Не знаю».`, () => {
        ans.innerHTML = '<button class="btn primary block" id="go">Начать тест</button>';
        ui.$('#go').onclick = () => ui.go('#/placement');
      });
    }
    // восстановление черновика
    const done = Object.keys(answers).filter(k => !k.startsWith('_'));
    if (done.length) {
      STEPS.forEach(s => { if (answers[s.key] !== undefined && (!s.when || s.when(answers))) { amy; const m = document.createElement('div'); m.className = 'msg'; m.innerHTML = '<div class="avatar">🙂</div><div class="bubble"></div>'; m.lastChild.textContent = s.ask(answers); chat.appendChild(m); me(labelOf(s, answers[s.key])); } });
    }
    ask(0 + (done.length ? STEPS.findIndex(s => answers[s.key] === undefined && (!s.when || s.when(answers))) : 0));
  });

  // ---------------- Диагностика ----------------
  function placementResult(res) {
    const by = {}; D.placement.forEach((q, i) => { (by[q.l] = by[q.l] || { n: 0, ok: 0 }); by[q.l].n++; if (res[i] === q.a) by[q.l].ok++; });
    const acc = l => by[l].ok / by[l].n;
    let stage = 4;
    if (acc('A1') < 0.75) stage = 1; else if (acc('A2') < 0.65) stage = 2; else if (acc('A2+') < 0.6) stage = 3; else if (acc('B1') < 0.5) stage = 4;
    const wrong = D.placement.filter((q, i) => res[i] !== q.a).map(q => q.u);
    return { by, stage, wrong };
  }
  const LEVEL_NAME = { 1: 'A1 — начальный', 2: 'A2 — элементарный', 3: 'уверенный A2', 4: 'почти B1' };
  JP.levelName = n => LEVEL_NAME[n];

  ui.route('/placement', () => {
    const st = S(); st.placement = st.placement || { answers: [], done: false };
    const P = st.placement;
    if (P.done) return ui.go('#/ready');
    const intro = () => {
      ui.set(`<div class="card"><div class="amy"><div class="avatar">🙂</div><div class="bubble"><b>Диагностический тест</b><p>30 вопросов от простых к сложным. Обратной связи по ходу не будет — так результат точнее. Если не знаешь ответ, выбери «Не знаю»: это нормальный и полезный ответ.</p><p class="muted">Время: ~10 минут. Не используй подсказки и переводчик.</p></div></div></div><button class="btn primary block" id="go">${P.answers.length ? 'Продолжить (вопрос ' + (P.answers.length + 1) + ')' : 'Начать'}</button>`, { noTabs: true });
      ui.$('#go').onclick = () => q(P.answers.length);
    };
    const q = i => {
      if (i >= D.placement.length) return finish();
      const it = D.placement[i];
      ui.set(`<div class="qbar"><div class="qfill" style="width:${Math.round(i / D.placement.length * 100)}%"></div></div><div class="qcount"><span>Вопрос ${i + 1} из ${D.placement.length}</span></div>
        <div class="qcard"><div class="qtype">Выбери правильный вариант</div><div class="qtext">${esc(it.q).replace('___', '<span class="blank">&nbsp;</span>')}</div>
        <div class="opts">${it.o.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}<button class="opt" data-k="-1" style="border-style:dashed;color:var(--muted)">Не знаю</button></div></div>`, { noTabs: true });
      ui.$$('.opt').forEach(b => b.onclick = () => { P.answers[i] = +b.dataset.k; JP.store.save(); q(i + 1); });
    };
    const finish = () => {
      const r = placementResult(P.answers);
      Object.assign(P, { done: true, stage: r.stage, by: r.by, wrong: r.wrong, takenAt: U.today() });
      E.applyPlacementSkips(r.stage, r.wrong); E.invalidate(); JP.store.save(); ui.go('#/ready');
    };
    intro();
  });

  // ---------------- Экран «Твой план» ----------------
  ui.route('/ready', () => {
    const P = S().placement, p = S().profile; if (!P || !P.done) return ui.go('#/placement');
    const est = E.estimate(); const weeks = est.weeks;
    const lv = ['A1', 'A2', 'A2+', 'B1'];
    const levelRows = lv.map(l => { const b = P.by[l]; return `<div class="row between" style="gap:12px"><span style="width:44px"><b>${l}</b></span><div class="grow">${ui.bar(b.ok / b.n, b.ok / b.n >= .6 ? '' : 'accent')}</div><small>${b.ok}/${b.n}</small></div>`; }).join('');
    const weak = E.weakTopics().slice(0, 5);
    let deadline = '';
    if (est.deadline) {
      deadline = est.ok
        ? `<div class="card soft"><b>Срок ${U.fmtLong(est.deadline)} реалистичен.</b> При твоём режиме мы закончим примерно к ${U.fmtLong(est.eta)}, то есть с запасом.</div>`
        : `<div class="card warm"><b>К ${U.fmtLong(est.deadline)} при текущем режиме не успеем</b> (по расчёту — к ${U.fmtLong(est.eta)}). Чтобы успеть, нужно около <b>${est.needWeekly} мин в неделю</b> (≈ ${est.needPerDay} мин в день при ${p.daysPerWeek} ${U.plural(p.daysPerWeek, 'дне', 'днях', 'днях')}). Можно увеличить время в разделе «Ещё» — или сдвинуть срок. Честнее сказать об этом сразу.</div>`;
    }
    const week = [1, 2, 3, 4, 5, 6, 0].map(d => `<div class="day-pill ${p.studyDays.includes(d) ? 'study' : ''} ${(p.liveDays || []).includes(d) ? 'live' : ''}">${U.DAYS[d]}<br>${p.studyDays.includes(d) ? p.minutesPerDay + '′' : '—'}${(p.liveDays || []).includes(d) ? '<br>👩‍🏫' : ''}</div>`).join('');
    ui.set(`
      <div class="center"><div class="emoji-xl">🧭</div><h1>${esc(p.name)}, вот твой маршрут к B1</h1></div>
      <div class="card"><h3>Стартовая точка: ${JP.levelName(P.stage)}</h3>${levelRows}
        <p class="muted" style="margin-top:10px">${P.stage === 1 ? 'Начинаем с самого фундамента — так будет надёжнее.' : P.stage === 4 ? 'База у тебя крепкая — идём сразу к материалу B1, а пробелы закроем по ходу.' : 'Начальные темы, которые ты уже знаешь, я отметила как пройденные (их можно открыть в любой момент в разделе «План»).'}</p>
        ${weak.length ? `<details><summary>Темы, которые стоит подтянуть (${weak.length})</summary><ul>${weak.map(w => `<li>${esc(w.title)}</li>`).join('')}</ul></details>` : ''}</div>
      <div class="card"><h3>Сколько это займёт</h3>
        <div class="grid3"><div class="stat"><b>${Math.round(est.remaining / 60)} ч</b><small>работы</small></div><div class="stat"><b>${weeks}</b><small>${U.plural(weeks, 'неделя', 'недели', 'недель')}</small></div><div class="stat"><b>${U.fmt(est.eta)}</b><small>примерная дата</small></div></div>
        <p class="muted" style="margin-top:10px">Расчёт при ${p.daysPerWeek} ${U.plural(p.daysPerWeek, 'дне', 'днях', 'днях')} в неделю по ${p.minutesPerDay} минут. Это ориентир: темп будет подстраиваться под твои результаты.</p></div>
      ${deadline}
      <div class="card"><h3>Твоя неделя</h3><div class="week">${week}</div>
        <p class="muted" style="margin-top:10px">Зелёным — самостоятельные занятия${(p.liveDays || []).length ? ', оранжевым — занятия с преподавателем' : ''}.</p>
        <button class="btn block" id="ics" style="margin-top:6px">📅 Добавить занятия в календарь (.ics)</button></div>
      <div class="card soft"><b>Как мы будем работать</b><ul><li>Каждый день на главной — короткий план: повторение → новый урок → практика.</li><li>Слова повторяются по системе интервалов, грамматика — через 1, 3, 7, 14 и 30 дней.</li><li>Раз в неделю — проверка, в конце каждого этапа — итоговый тест.</li><li>Письменные задания сохраняются для преподавателя.</li></ul></div>
      <a class="btn primary block" href="#/" style="margin-bottom:24px">Начать с первого занятия</a>`, { noTabs: true });
    ui.$('#ics').onclick = () => { ui.download('put-k-b1.ics', E.icsFor(), 'text/calendar'); U.toast('Файл календаря скачан — открой его, чтобы добавить занятия'); };
    ui.$$('.week .day-pill.study').forEach(el => { el.style.background = 'var(--brand)'; });
  });
})(window.JP);
