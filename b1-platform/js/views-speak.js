// Речевая практика «Скажи вслух»: повтор → подстановка → своя речь (PPP: объяснение → практика → продукция).
(function (JP) {
  const U = JP.U, E = JP.E, A = JP.amy, ui = JP.ui, S = () => JP.store.get(), D = JP.data, esc = U.esc;
  const RATES = [['😀', 'Легко', 1], ['😐', 'С запинкой', 0.5], ['😕', 'Не получилось', 0]];
  const FAST_SEC = 6; // в повторе «на скорость» на каждый ответ даётся столько секунд

  const wordsN = s => s.split(/\s+/).filter(Boolean).length;
  const tidy = s => { s = s.replace(/\s+/g, ' ').trim(); if (!s) return ''; s = s[0].toUpperCase() + s.slice(1); return /[.!?]$/.test(s) ? s : s + '.'; };
  // образцы из упражнений урока: правильные ответы, 3–14 слов, без повторов
  function autoSentences(L) {
    const out = [], seen = new Set();
    (L.ex || []).forEach(q => {
      const s = tidy(JP.sentenceOf(q).replace(/\s*\(.*?\)\s*/g, ' ')), n = wordsN(s);
      if (s && n >= 3 && n <= 14 && !/___/.test(s) && !seen.has(s)) { seen.add(s); out.push(s); }
    });
    return out;
  }
  // сценарий занятия: ручной (data/speak.js) или собранный из упражнений
  JP.speak = {
    build(id) {
      const L = D.lessons[id]; if (!L) return null;
      const man = (D.speak || {})[id], auto = autoSentences(L);
      const say = (man ? man.say : auto).slice(0, 4);
      if (say.length < 2) return null;
      const items = [];
      say.forEach(m => items.push({ r: 1, kind: 'repeat', m }));
      if (man && man.subs) man.subs.forEach(x => items.push({ r: 2, kind: 'sub', p: x.c, m: x.m }));
      else (auto.length > 4 ? auto.slice(4, 8) : say.slice().reverse().slice(0, 3)).forEach(m => items.push({ r: 2, kind: 'recall', m }));
      if (man && man.tasks) man.tasks.forEach(x => items.push({ r: 3, kind: 'free', p: x.p, m: x.m }));
      else if (L.write) items.push({ r: 3, kind: 'free', p: L.write.replace(/^Напиши/, 'Скажи вслух').replace(/^Опиши/, 'Расскажи вслух'), m: '' });
      return { id, items, manual: !!man };
    }
  };

  const say = t => { if (U.canSpeak()) U.say(t); };
  function start(id, task) {
    const sc = JP.speak.build(id), it = E.item(id);
    if (!sc || !it) return ui.set('<div class="card center"><p>Для этого урока речевая практика пока недоступна.</p><a class="btn primary" href="#/">На главную</a></div>');
    const prev = (S().units[id] || {}).speak, again = !!(prev && prev.runs), t0 = Date.now();
    const rounds = {
      1: ['Повтор', 'Послушай и повтори вслух три раза. Так фраза «ложится» в память.'],
      2: [again ? 'Скорость' : 'Подстановка', again ? `Отвечай за ${FAST_SEC} секунд, не подбирая слова.` : 'Меняй слова в той же конструкции. Скажи вслух, потом сверься с образцом.'],
      3: ['Своя речь', 'Говори от себя, 20–30 секунд. Ошибаться можно: главное, не останавливаться.']
    };
    const ratings = [], times = []; let idx = 0, timer = null;

    const intro = () => {
      ui.set(`<a href="#/" class="muted">← на главную</a>
        <div class="row between" style="margin-top:6px"><span class="chip">🗣 Скажи вслух</span><span class="chip gray">~5 мин</span></div>
        <h1>${esc(it.title)}</h1>
        <div class="card"><div class="amy"><div class="avatar">🙂</div><div class="bubble">${esc(A.speakIntro(it.title, again))}</div></div></div>
        <div class="card"><ol style="padding-left:1.2em;margin:0"><li><b>Повтор</b>: слушаешь образец и повторяешь вслух.</li><li><b>${again ? 'Скорость' : 'Подстановка'}</b>: та же конструкция с другими словами.</li><li><b>Своя речь</b>: рассказываешь о себе, используя тему.</li></ol></div>
        <p class="muted">Говори вслух, а не про себя: в речи работает мышечная память.</p>
        <button class="btn primary block" id="go" style="margin-top:12px">Начать</button>
        <button class="btn ghost block" id="skip" style="margin-top:8px">Пропустить сегодня</button>`);
      ui.$('#go').onclick = step;
      ui.$('#skip').onclick = () => { if (!confirm('Пропустить речевую практику? Без неё тема закрепляется хуже.')) return; E.saveSpeak(id, null); finish(true); };
    };

    const step = () => {
      clearInterval(timer);
      if (idx >= sc.items.length) return done();
      const x = sc.items[idx], first = idx === 0 || sc.items[idx - 1].r !== x.r;
      const total = sc.items.filter(y => y.r === x.r).length, n = sc.items.slice(0, idx + 1).filter(y => y.r === x.r).length;
      const head = `<a href="#/" class="muted">← выйти</a><div class="row between" style="margin-top:6px"><span class="chip">Раунд ${x.r}: ${rounds[x.r][0]}</span><span class="chip gray">${n} из ${total}</span></div>${ui.bar(idx / sc.items.length)}${first ? `<p class="muted">${rounds[x.r][1]}</p>` : ''}`;
      const snd = U.canSpeak() ? '<button class="icon-btn" id="play" aria-label="Послушать" style="font-size:1.4rem">🔊</button>' : '';
      if (x.kind === 'repeat') {
        let c = 0;
        ui.set(`${head}<div class="card center"><div style="font-size:1.35rem;font-weight:700;margin:8px 0">${esc(x.m)}</div>${snd}
          <p class="muted">Скажи вслух 3 раза</p><button class="btn primary block" id="said">Сказано (0/3)</button></div>`);
        const pl = ui.$('#play'); if (pl) pl.onclick = () => say(x.m);
        say(x.m);
        ui.$('#said').onclick = e => {
          c++;
          if (c > 3) { idx++; step(); } else e.target.textContent = c === 3 ? 'Дальше' : `Сказано (${c}/3)`;
        };
        return;
      }
      const hint = x.kind === 'recall' ? esc(x.m.split(' ').slice(0, 2).join(' ')) + ' …' : esc(x.p);
      const label = x.kind === 'recall' ? 'Скажи фразу целиком по памяти' : x.kind === 'sub' ? 'Скажи по-английски' : 'Скажи вслух';
      const hasModel = !!x.m, fast = again && x.kind !== 'free';
      ui.set(`${head}<div class="card"><div class="muted">${label}</div><div style="font-size:1.25rem;font-weight:700;margin:6px 0">${hint}</div>
        ${fast ? `<div id="tm" class="muted">⏱ ${FAST_SEC}</div>` : ''}
        <div id="rv"></div><button class="btn primary block" id="show" style="margin-top:8px">${hasModel ? 'Показать образец' : 'Я сказал(а)'}</button></div>`);
      const shownAt = Date.now();
      ui.$('#show').onclick = () => {
        clearInterval(timer); times.push(Math.round((Date.now() - shownAt) / 100) / 10);
        ui.$('#show').hidden = true; const tm = ui.$('#tm'); if (tm) tm.hidden = true;
        ui.$('#rv').innerHTML = `${hasModel ? `<div class="card soft" style="margin:8px 0"><b>${esc(x.m)}</b> ${U.canSpeak() ? '<button class="icon-btn" id="pl2" aria-label="Послушать">🔊</button>' : ''}</div>` : ''}
          <div class="muted" style="margin:8px 0 4px">Как получилось сказать?</div><div class="opts">${RATES.map(([e, l, v]) => `<button class="opt" data-v="${v}">${e} ${l}</button>`).join('')}</div>`;
        const p2 = ui.$('#pl2'); if (p2) p2.onclick = () => say(x.m);
        if (hasModel) say(x.m);
        ui.$$('[data-v]').forEach(b => b.onclick = () => { ratings.push(+b.dataset.v); idx++; step(); });
      };
      if (fast) {
        let left = FAST_SEC;
        timer = setInterval(() => { left--; const tm = ui.$('#tm'); if (tm) tm.textContent = left > 0 ? '⏱ ' + left : '⏱ Время вышло'; if (left <= 0) clearInterval(timer); }, 1000);
      }
    };

    const done = () => {
      const f = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0.5;
      const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length * 10) / 10 : null;
      E.saveSpeak(id, f, avg ? Math.round(avg * 1000) : null);
      finish(false, `<div class="center"><div class="emoji-xl">${f >= 0.8 ? '🎤' : f >= 0.5 ? '👍' : '💪'}</div><h1>Речевая практика пройдена</h1><div class="chip" style="font-size:1rem">Уверенность: ${Math.round(f * 100)}%</div></div>
        <div class="card"><div class="amy"><div class="avatar">🙂</div><div class="bubble">${esc(A.speakDone(f))}</div></div></div>
        ${avg != null ? `<p class="muted center">Среднее время до образца: ${avg} с. Цель: меньше ${FAST_SEC} с.</p>` : ''}`, f < 0.6);
    };

    const finish = (skipped, html, hard) => {
      const mins = U.clamp(Math.round((Date.now() - t0) / 60000), 1, 30);
      if (!skipped) E.addMinutes(mins, 'speaking');
      if (task) { task.done = true; JP.store.save(); } else E.markTask('speak', id);
      const nx = E.nextTask();
      ui.set(`${html || '<div class="card center"><p>Пропущено. Тема останется без речевой практики.</p></div>'}
        <div style="margin:16px 0 24px">${hard ? `<a class="btn accent block" style="margin-bottom:8px" href="#/unit/${esc(id)}">Повторить правило и упражнения</a>` : ''}${nx ? `<a class="btn primary block" href="#/do/${nx.id}">Дальше: ${esc(nx.title)}</a><a class="btn ghost block" style="margin-top:8px" href="#/">На главную</a>` : '<a class="btn primary block" href="#/">На главную</a>'}</div>`);
      if (!skipped && !hard) ui.confetti();
    };
    intro();
  }
  JP.speakStart = start;
  ui.route('/speak/:id', ({ id }) => start(id, null));
})(window.JP);
