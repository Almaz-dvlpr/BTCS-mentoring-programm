// Экраны занятий: грамматический урок, слова, письмо, книга, повторения, проверки.
(function (JP) {
  const U = JP.U, E = JP.E, A = JP.amy, ui = JP.ui, S = () => JP.store.get(), D = JP.data, esc = U.esc;

  // Соответствие уроков Essential Grammar → Murphy (для углубления)
  const MURPHY = { 4: 1, 5: 1, 6: 2, 7: 2, 8: 2, 9: 3, 10: 17, 12: 5, 13: 5, 14: 6, 15: 6, 16: 7, 17: 8, 18: 8, 19: 11, 20: 12, 21: 13, 22: 42, 23: 43, 27: 20, 28: 21, 30: 29, 31: 26, 32: 32, 33: 33, 34: 31, 37: 18, 50: 50, 51: 47, 53: 53, 55: 64, 68: 69, 70: 72, 77: 85, 84: 87, 88: 105, 89: 107, 91: 108, 92: 103, 93: 103, 99: 25, 100: 38, 101: 92, 102: 93, 103: 121, 106: 123, 114: 137, 115: 138 };

  const ctxNew = (type, ref, task) => ({ type, ref, task, t0: Date.now() });
  function finishTask(ctx) {
    const mins = U.clamp(Math.round((Date.now() - ctx.t0) / 60000), 1, 45);
    const it = ctx.type === 'unit' ? E.item(ctx.ref) : null;
    E.addMinutes(mins, it ? (it.kind === 'vocab' ? 'words' : it.kind === 'write' ? 'writing' : 'grammar') : ctx.type === 'srs' ? 'words' : 'review');
    if (ctx.task) { ctx.task.done = true; JP.store.save(); } else E.markTask(ctx.type, ctx.ref);
  }
  const nextCta = () => { const t = E.nextTask(); return t ? `<a class="btn primary block" href="#/do/${t.id}">Дальше: ${esc(t.title)}</a><a class="btn ghost block" style="margin-top:8px" href="#/">На главную</a>` : `<a class="btn primary block" href="#/">На главную</a>`; };
  function resultScreen(o) {
    ui.set(`<div class="center"><div class="emoji-xl">${o.emoji || '🎉'}</div><h1>${o.title}</h1>${o.score != null ? `<div class="chip" style="font-size:1rem">${Math.round(o.score * 100)}% верных</div>` : ''}</div>
      <div class="card"><div class="amy"><div class="avatar">🙂</div><div class="bubble">${o.msg}</div></div></div>${o.html || ''}<div style="margin:16px 0 24px">${o.cta || nextCta()}</div>`);
    if (o.score != null && o.score >= 0.85) ui.confetti();
  }
  const mistakes = res => {
    const bad = res.filter(r => !r.ok); if (!bad.length) return '';
    return `<div class="card"><h3>Разбор ошибок</h3>${bad.map(r => { const q = r.q; const corr = q.t === 'mc' || q.t === 'vmc' ? q.o[q.a] : q.t === 'ord' ? q.s : q.a[0];
      return `<div class="word" style="display:block"><div class="muted">${(q.q || '').replace('___', '<b>___</b>')}</div><div>Твой ответ: <s class="bad">${esc(r.user || '—')}</s> → <b>${esc(corr)}</b></div>${q.e ? `<div class="fe">${q.e}</div>` : ''}</div>`; }).join('')}</div>`;
  };
  const bookName = it => it.book === 'eg' ? 'Essential Grammar in Use' : 'English Grammar in Use (Murphy)';
  const bookLine = it => {
    if (it.kind === 'vocab') return `📖 В книге: <b>English Vocabulary in Use Elementary</b>, Unit ${it.n}`;
    let s = `📖 В книге: <b>${bookName(it)}</b>, ${it.book === 'eg' ? 'урок' : 'Unit'} ${it.n}`;
    if (it.book === 'eg' && MURPHY[it.n]) s += `<br>Углубиться: Murphy, Unit ${MURPHY[it.n]}`;
    return s;
  };

  // ---------- Маршруты занятий ----------
  ui.route('/do/:id', ({ id }) => {
    const task = E.day(U.today()).tasks.find(t => t.id === id);
    if (!task) return ui.go('#/');
    dispatch(task);
  });
  ui.route('/unit/:id', ({ id }) => startUnit(id, null));
  function dispatch(task) {
    if (task.type === 'unit') return startUnit(task.ref, task);
    if (task.type === 'srs') return startSrs(task);
    if (task.type === 'greview') return startReview(task.ref, task);
    return startQuiz(task.type, task);
  }

  function startUnit(id, task) {
    const it = E.item(id); if (!it) return ui.set('<div class="card">Урок не найден</div>');
    if (it.stage > E.unlockedStage()) return ui.set(`<div class="card center"><div class="emoji-xl">🔒</div><h1>Этап ${it.stage} пока закрыт</h1><p>Он откроется после итогового теста предыдущего этапа.</p><a class="btn primary" href="#/plan">К плану</a></div>`);
    const ctx = ctxNew('unit', id, task);
    if (it.kind === 'vocab') return vocabUnit(it, ctx);
    if (it.kind === 'write') return writeUnit(it, ctx);
    if (D.lessons[id]) return grammarLesson(it, D.lessons[id], ctx);
    return bookOnly(it, ctx);
  }

  // ---------- Грамматический урок ----------
  function grammarLesson(it, L, ctx) {
    const redo = E.isDone(it.id);
    const intro = () => {
      ui.set(`<a href="#/plan" class="muted">← к плану</a>
        <div class="row between" style="margin-top:6px"><span class="chip">${esc(L.level)}</span><span class="chip gray">~${it.minutes} мин</span></div>
        <h1>${esc(it.title)}</h1>
        <div class="card lesson-rule"><div class="muted" style="font-size:.85rem;margin-bottom:4px">Правило <span class="muted">(нажми на пример — услышишь)</span></div>${ui.rule(L.rule)}</div>
        <div class="book">${bookLine(it)}<br><small>Совет: прочитай урок в книге до или после упражнений на платформе.</small></div>
        <button class="btn primary block" id="go" style="margin:16px 0 24px">${redo ? 'Повторить упражнения' : 'К упражнениям'} (${L.ex.length})</button>`);
      ui.$('#go').onclick = () => practice(L.ex.map((q, i) => Object.assign({ unit: it.id, k: it.id + '#' + i }, q)), false);
    };
    const practice = (qs, retry) => {
      ui.set('<div id="qz"></div><details class="card" style="margin-top:16px"><summary>Показать правило ещё раз</summary><div class="lesson-rule">' + ui.rule(L.rule) + '</div></details>');
      JP.runQuiz(ui.$('#qz'), qs, { label: retry ? 'Работа над ошибками' : '', speakOnOk: S().settings.sound, onDone: res => retry ? retryDone(res) : firstDone(res) });
    };
    const firstDone = res => {
      const score = res.filter(r => r.ok).length / res.length;
      if (!redo || (S().units[it.id] && S().units[it.id].status === 'skipped')) E.completeUnit(it.id, score); else { const u = S().units[it.id]; u.score = Math.max(score, 0) ; u.tries = (u.tries || 0) + 1; E.gradeReview(it.id, score); }
      finishTask(ctx);
      const bad = res.filter(r => !r.ok).length;
      resultScreen({
        emoji: score >= 0.85 ? '🎉' : score >= 0.6 ? '👍' : '💪', title: `${res.length - bad} из ${res.length}`, score,
        msg: A.praise(score) + (bad ? ' Давай сразу разберём ошибки.' : ''),
        html: mistakes(res) + (L.write ? `<div class="card"><h3>✍️ Мини-письмо (по желанию)</h3><p>${esc(L.write)}</p><textarea id="wr" placeholder="Пиши здесь…"></textarea><div class="row" style="margin-top:8px"><button class="btn" id="wsave">Сохранить для преподавателя</button><small class="muted" id="wmsg"></small></div></div>` : ''),
        cta: (bad ? '<button class="btn accent block" id="fix" style="margin-bottom:8px">Исправить ошибки</button>' : '') + nextCta()
      });
      const fix = ui.$('#fix'); if (fix) fix.onclick = () => practice(res.filter(r => !r.ok).map(r => r.q), true);
      const ws = ui.$('#wsave'); if (ws) ws.onclick = () => { const t = ui.$('#wr').value.trim(); if (t.length < 8) return U.toast('Напиши хотя бы одно предложение'); S().writings.push({ date: U.today(), id: it.id, title: it.title, prompt: L.write, text: t }); JP.store.save(); ui.$('#wmsg').textContent = 'Сохранено ✓'; ws.disabled = true; };
    };
    const retryDone = res => {
      const ok = res.filter(r => r.ok).length;
      resultScreen({ emoji: '🔁', title: `Исправлено: ${ok} из ${res.length}`, msg: ok === res.length ? 'Теперь всё верно! Ошибки — лучший способ запомнить. Тема вернётся в повторение, чтобы закрепиться.' : 'Часть ошибок осталась — вернись к правилу выше и перечитай. Тема придёт на повторение завтра.', html: mistakes(res) });
    };
    intro();
  }

  // ---------- Урок «по книге» ----------
  function bookOnly(it, ctx) {
    const hasBooks = S().profile.hasBooks;
    ui.set(`<a href="#/plan" class="muted">← к плану</a>
      <div class="row between" style="margin-top:6px"><span class="chip">${it.book === 'mu' ? 'B1' : 'Книга'}</span><span class="chip gray">~${it.minutes} мин</span></div>
      <h1>${esc(it.title)}</h1>
      <div class="card"><div class="book">${bookLine(it)}</div>
      <ol style="padding-left:1.2em"><li>Прочитай объяснение в книге (до 10 минут). Пример вслух — обязательно.</li><li>Сделай упражнения. Пиши ответы в тетради, не только «в уме».</li><li>Проверь себя по ключу в конце книги.</li><li>Отметь ниже, как получилось — от этого зависит, когда тема вернётся в повторение.</li></ol>
      ${hasBooks === 'none' ? '<p class="muted">Книги под рукой нет? Напиши преподавателю — он пришлёт страницы этого урока.</p>' : ''}</div>
      <div class="card"><h3>Как получилось?</h3><div class="opts">
        <button class="opt" data-s="0.97">😀 Всё или почти всё верно</button><button class="opt" data-s="0.85">🙂 Пара ошибок</button><button class="opt" data-s="0.65">😐 Много ошибок</button><button class="opt" data-s="0.4">😕 Почти ничего не получилось</button></div></div>`);
    ui.$$('[data-s]').forEach(b => b.onclick = () => {
      const s = +b.dataset.s; E.completeUnit(it.id, s, { book: true }); finishTask(ctx);
      resultScreen({ emoji: s >= .85 ? '✅' : '📚', title: 'Урок отмечен', msg: s >= .85 ? 'Отлично! Эта тема пройдена. Повторим её через несколько дней.' : 'Спасибо, что честно. Эта тема вернётся завтра, и мы вместе перечитаем правило. Если что-то совсем непонятно, запиши вопрос — разберёте с преподавателем.' });
    });
  }

  // ---------- Слова: тема ----------
  function vocabUnit(it, ctx) {
    const v = D.vocab.find(x => x.id === it.id);
    const all = E.allWords();
    const learn = () => {
      ui.set(`<a href="#/plan" class="muted">← к плану</a><div class="row between" style="margin-top:6px"><span class="chip warm">Слова</span><span class="chip gray">${v.words.length} слов</span></div><h1>${esc(v.title)}</h1><p class="muted">${esc(v.ru)}</p>
        <div class="card"><div class="words">${v.words.map(w => `<div class="word"><div><b>${esc(w.en)}</b><br><span class="muted">${esc(w.ru)}</span></div>${U.canSpeak() ? `<button class="icon-btn" data-say="${esc(w.en)}" aria-label="Произнести ${esc(w.en)}">🔊</button>` : ''}</div>`).join('')}</div></div>
        <div class="book">${bookLine(it)}<br><small>Сначала посмотри картинки и примеры в книге, затем вернись и проверь себя.</small></div>
        <div class="card soft"><b>Как учить:</b> произнеси каждое слово вслух, выбери 5 самых нужных и запиши в словарную тетрадь с примером — своим предложением.</div>
        <button class="btn primary block" id="go" style="margin:16px 0 24px">Проверить себя</button>`);
      ui.$$('[data-say]').forEach(b => b.onclick = () => U.say(b.dataset.say));
      ui.$('#go').onclick = quiz;
    };
    const quiz = () => {
      const pool = v.words.length >= 6 ? v.words.concat(U.pick(all, 8)) : all;
      const qs = U.shuffle(v.words.map(w => JP.vq.mc(w, pool, Math.random() < .5 ? 'en2ru' : 'ru2en')));
      const typ = U.pick(v.words.filter(JP.vq.typable), 6).map(w => JP.vq.type(w));
      const list = qs.concat(typ);
      ui.set('<div id="qz"></div>');
      JP.runQuiz(ui.$('#qz'), list, { label: v.title, onDone: res => {
        const score = res.filter(r => r.ok).length / res.length;
        E.addCards(it.id);
        res.forEach(r => { if (!r.ok && S().cards[r.wid]) { S().cards[r.wid].due = U.today(); S().cards[r.wid].box = 1; } });
        E.completeUnit(it.id, score, { next: null }); finishTask(ctx);
        const missed = [...new Set(res.filter(r => !r.ok).map(r => r.wid))].map(id => E.wordById(id)).filter(Boolean);
        resultScreen({ emoji: score >= .85 ? '🎉' : '👍', title: `${v.words.length} новых слов`, score, msg: A.praise(score) + ' Слова добавлены в повторение: они вернутся в разделе «Слова» по системе интервалов.',
          html: missed.length ? `<div class="card"><h3>Слова, которые стоит повторить</h3><div class="words">${missed.map(w => `<div class="word"><div><b>${esc(w.en)}</b> — ${esc(w.ru)}</div></div>`).join('')}</div></div>` : '' });
      } });
    };
    learn();
  }

  // ---------- Письменный проект ----------
  function writeUnit(it, ctx) {
    const w = D.writing.find(x => x.id === it.id);
    ui.set(`<a href="#/plan" class="muted">← к плану</a><div class="row between" style="margin-top:6px"><span class="chip warm">Письмо</span><span class="chip gray">~20 мин</span></div><h1>${esc(w.title)}</h1>
      <div class="card"><p>${esc(w.prompt)}</p><details><summary>Чек-лист: проверь себя перед отправкой</summary>${w.check.map((c, i) => `<label class="check"><input type="checkbox" data-c="${i}"><span>${esc(c)}</span></label>`).join('')}</details></div>
      <textarea id="wr" placeholder="Пиши по-английски…" style="min-height:220px"></textarea>
      <div class="row between" style="margin:6px 0"><small class="muted" id="cnt">0 слов</small><button class="icon-btn" id="hear" aria-label="Прослушать текст">🔊 Прослушать</button></div>
      <p class="muted">Совет: прочитай текст вслух перед отправкой. Если звучит странно — скорее всего, ошибка где-то рядом.</p>
      <button class="btn primary block" id="send" style="margin:12px 0 24px">Сохранить и отправить преподавателю</button>`);
    const ta = ui.$('#wr'); const draftKey = 'w_' + it.id;
    ta.value = (S().seen[draftKey]) || '';
    const upd = () => { const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0; ui.$('#cnt').textContent = n + ' ' + U.plural(n, 'слово', 'слова', 'слов'); S().seen[draftKey] = ta.value; JP.store.save(); };
    ta.oninput = upd; upd();
    ui.$('#hear').onclick = () => U.say(ta.value);
    ui.$('#send').onclick = () => {
      const t = ta.value.trim(); if (t.split(/\s+/).length < 12) return U.toast('Напиши хотя бы 12 слов — так преподавателю будет что разбирать');
      S().writings.push({ date: U.today(), id: it.id, title: w.title, prompt: w.prompt, text: t }); delete S().seen[draftKey];
      E.completeUnit(it.id, 1, { write: true, next: null }); finishTask(ctx);
      resultScreen({ emoji: '✍️', title: 'Текст сохранён', msg: 'Отличная работа! Я сохранила текст в твоём портфолио — преподаватель увидит его в отчёте и даст обратную связь. Письмо — самый быстрый способ превратить правила в живой язык.' });
    };
  }

  // ---------- Повторение слов ----------
  ui.route('/words', () => {
    const due = E.dueCards().length, learned = E.learnedWords(), known = E.knownWords();
    const next = E.nextItems(8).filter(i => i.kind === 'vocab')[0];
    const doneUnits = D.vocab.filter(v => S().vocabLearned[v.id]);
    const nextDue = Object.values(S().cards).map(c => c.due).filter(d => d > U.today()).sort()[0];
    ui.set(`<h1>Слова</h1>
      <div class="grid3"><div class="card stat"><b>${learned}</b><small>слов изучено</small></div><div class="card stat"><b>${known}</b><small>запомнено крепко</small></div><div class="card stat"><b>${due}</b><small>ждут повторения</small></div></div>
      <div class="card">${due ? `<h3>Пора повторить ${due} ${U.plural(due, 'слово', 'слова', 'слов')}</h3><p class="muted">Это займёт около ${Math.max(2, Math.ceil(Math.min(due, 25) / 3))} минут. Повторяем в удачный момент — перед тем, как забыть.</p><button class="btn primary block" id="srs">Повторить сейчас</button>`
        : learned ? `<h3>На сегодня всё повторено 🎉</h3><p class="muted">${nextDue ? 'Следующее повторение — ' + U.fmt(nextDue) + '.' : ''}</p><button class="btn block" id="srs">Потренировать ещё 10 случайных слов</button>`
        : `<h3>Пока нет изученных слов</h3><p class="muted">Они появятся после первой темы со словами.</p>${next ? `<a class="btn primary block" href="#/unit/${next.id}">Открыть: ${esc(next.title)}</a>` : ''}`}</div>
      ${doneUnits.length ? `<div class="card"><h3>Изученные темы</h3>${doneUnits.map(v => `<div class="list-item"><span class="badge-done">✓</span><div class="grow">${esc(v.title)}<br><small class="muted">${esc(v.ru)} · ${v.words.length} слов</small></div><a class="btn small ghost" href="#/vocab/${v.id}">Слова</a></div>`).join('')}</div>` : ''}
      <details class="card"><summary>Как работает система повторения</summary><p>Каждое слово лежит в одной из 5 «коробок». Правильный ответ — слово переходит в следующую коробку и вернётся позже (через 1, 3, 7, 16, 35 дней). Ошибка — слово возвращается в первую коробку. Так ты тратишь время на то, что действительно забывается.</p></details>`);
    const b = ui.$('#srs'); if (b) b.onclick = () => startSrs(null);
  });
  ui.route('/vocab/:id', ({ id }) => {
    const v = D.vocab.find(x => x.id === id); if (!v) return ui.go('#/words');
    ui.set(`<a href="#/words" class="muted">← слова</a><h1>${esc(v.title)}</h1><p class="muted">${esc(v.ru)}</p><div class="card"><div class="words">${v.words.map(w => { const c = S().cards[w.id]; return `<div class="word"><div><b>${esc(w.en)}</b><br><span class="muted">${esc(w.ru)}</span></div><div class="row"><small class="chip ${c && c.box >= 3 ? '' : 'gray'}">коробка ${c ? c.box : '—'}</small><button class="icon-btn" data-say="${esc(w.en)}">🔊</button></div></div>`; }).join('')}</div></div>`);
    ui.$$('[data-say]').forEach(b => b.onclick = () => U.say(b.dataset.say));
  });

  function startSrs(task) {
    const ctx = ctxNew('srs', null, task);
    let ids = E.dueCards();
    const n = task ? task.n : 20;
    ids = ids.slice(0, Math.max(n, 8));
    if (!ids.length) { // свободная тренировка
      ids = U.pick(Object.keys(S().cards), 10);
      if (!ids.length) return ui.set('<div class="card center"><h1>Пока нечего повторять</h1><p>Сначала пройди тему со словами.</p><a class="btn primary" href="#/">На главную</a></div>');
    }
    const pool = E.allWords();
    const qs = ids.map(id => {
      const w = E.wordById(id), c = S().cards[id];
      if (c.box <= 1) return JP.vq.mc(w, pool, 'en2ru');
      if (c.box === 2 || !JP.vq.typable(w)) return JP.vq.mc(w, pool, 'ru2en');
      return JP.vq.type(w);
    });
    ui.set('<div id="qz"></div>');
    JP.runQuiz(ui.$('#qz'), qs, { label: 'Слова', onDone: res => {
      res.forEach(r => E.gradeCard(r.wid, r.ok));
      const score = res.filter(r => r.ok).length / res.length;
      if (task) finishTask(ctx); else E.addMinutes(Math.max(1, Math.round(res.length / 4)), 'words');
      const missed = [...new Set(res.filter(r => !r.ok).map(r => r.wid))].map(E.wordById);
      resultScreen({ emoji: score >= .85 ? '🧠' : '👍', title: 'Повторение завершено', score, msg: A.praise(score) + ' ' + (E.dueCards().length ? 'Ещё осталось ' + E.dueCards().length + ' карточек — можно повторить позже сегодня.' : 'Все карточки на сегодня повторены.'),
        html: missed.length ? `<div class="card"><h3>Повтори эти слова</h3><div class="words">${missed.map(w => `<div class="word"><div><b>${esc(w.en)}</b> — ${esc(w.ru)}</div><button class="icon-btn" data-say="${esc(w.en)}">🔊</button></div>`).join('')}</div></div>` : '' });
      ui.$$('[data-say]').forEach(b => b.onclick = () => U.say(b.dataset.say));
    } });
  }

  // ---------- Повторение темы ----------
  function startReview(id, task) {
    const L = D.lessons[id], it = E.item(id), ctx = ctxNew('greview', id, task);
    if (!L) { if (task) finishTask(ctx); return ui.go('#/'); }
    const qs = U.pick(L.ex.map((q, i) => Object.assign({ unit: id, k: id + '#' + i }, q)), 5);
    ui.set('<div id="qz"></div><details class="card" style="margin-top:16px"><summary>Подсмотреть правило</summary><div class="lesson-rule">' + ui.rule(L.rule) + '</div></details>');
    JP.runQuiz(ui.$('#qz'), qs, { label: 'Повторение: ' + it.title, onDone: res => {
      const score = res.filter(r => r.ok).length / res.length;
      E.gradeReview(id, score); finishTask(ctx);
      resultScreen({ emoji: score >= .8 ? '🔁' : '📚', title: 'Повторили: ' + esc(it.title), score, msg: score >= .8 ? 'Тема держится крепко — следующее повторение будет реже.' : 'Тема ещё шатается. Перечитай правило — оно в уроке, — и мы повторим её завтра.', html: mistakes(res) + (score < .8 ? `<a class="btn block" href="#/unit/${id}">Открыть урок «${esc(it.title)}»</a>` : '') });
    } });
  }

  // ---------- Проверки ----------
  function startQuiz(type, task) {
    const ctx = ctxNew(type, task && task.ref, task);
    let qs, label, n;
    if (type === 'mix') { qs = E.quiz('all', 5); label = 'Разминка'; }
    else if (type === 'checkpoint') { qs = E.quiz('recent', 10); label = 'Недельная проверка'; }
    else if (type === 'stagetest') { qs = E.quiz({ stage: +task.ref }, +task.ref === 4 ? 20 : 15); label = +task.ref === 4 ? 'Итоговый тест B1' : 'Итоговый тест этапа ' + task.ref; }
    if (!qs || (qs.length < (type === 'stagetest' ? 8 : 3))) {
      if (type === 'stagetest') { S().stageTests[task.ref] = { waived: true, reason: 'little content', date: U.today() }; }
      finishTask(ctx);
      return resultScreen({ emoji: '✅', title: 'Проверка пропущена', msg: 'Пока недостаточно упражнений для проверки — идём дальше.' });
    }
    ui.set('<div id="qz"></div>');
    JP.runQuiz(ui.$('#qz'), qs, { label, onDone: res => {
      const score = res.filter(r => r.ok).length / res.length;
      // проблемные темы возвращаются в повторение
      const byUnit = {}; res.forEach(r => { (byUnit[r.unit] = byUnit[r.unit] || []).push(r.ok); });
      const weakUnits = Object.entries(byUnit).filter(([, a]) => a.some(x => !x)).map(([u]) => u);
      weakUnits.forEach(u => { const x = S().units[u]; if (x && x.status === 'done') { x.next = U.today(); x.step = 0; x.weak = true; } });
      let extra = '', cta;
      if (type !== 'mix') S().checkpoints.push({ date: U.today(), type, stage: task.ref || null, score, n: res.length });
      if (type === 'stagetest') {
        const stg = +task.ref; const prev = S().stageTests[stg] || {}; const tries = (prev.tries || 0) + 1;
        const pass = score >= 0.7;
        S().stageTests[stg] = { passed: pass, waived: !pass && tries >= 2, score, tries, date: U.today() };
        extra = pass && stg === 4 ? `<div class="card soft"><h3>🎓 Ты прошла весь маршрут к B1!</h3><p>Что дальше: пробный экзамен уровня B1 (например, Cambridge B1 Preliminary), разговорная практика с преподавателем и следующий уровень — English Vocabulary in Use: Pre-intermediate and Intermediate.</p></div>`
          : pass ? `<div class="card soft"><b>Этап ${stg} пройден!</b> Открывается этап ${stg + 1}: «${esc(D.stages[stg].title)}».</div>`
          : tries >= 2 ? `<div class="card warm">Результат пока ниже 70%, но мы пойдём дальше: слабые темы уже в повторении, и они будут возвращаться.</div>`
            : `<div class="card warm">Нужно 70%, чтобы открыть следующий этап. Слабые темы я поставила на повторение — через пару дней пересдадим тест.</div>`;
        if (pass) setTimeout(() => ui.confetti(), 300);
      }
      finishTask(ctx);
      const names = weakUnits.map(u => (E.item(u) || {}).title).filter(Boolean);
      resultScreen({ emoji: type === 'stagetest' && score >= .7 ? '🏆' : '📝', title: label + ': готово', score,
        msg: A.praise(score) + (names.length ? ' Вернём в повторение: ' + names.slice(0, 4).map(esc).join('; ') + '.' : ''), html: extra + mistakes(res) });
    } });
  }
})(window.JP);
