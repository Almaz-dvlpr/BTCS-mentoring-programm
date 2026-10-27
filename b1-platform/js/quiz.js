// Проигрыватель упражнений: gap / mc / ord / vmc / vtype / listen.
(function (JP) {
  const U = JP.U;
  const typeLabel = { gap: 'Впиши слово', mc: 'Выбери вариант', ord: 'Собери предложение', vmc: 'Выбери перевод', vtype: 'Напиши по-английски', listen: 'Напиши, что услышишь' };
  const blank = '<span class="blank">&nbsp;</span>';

  function sentenceOf(q) {
    if (q.t === 'ord') return q.s;
    if (q.t === 'gap') return q.q.replace(/<[^>]+>/g, '').replace(/\s*\([^)]*\)\s*$/, '').replace(/_{3}/, q.a[0]);
    if (q.t === 'mc') return /___/.test(q.q) ? q.q.replace(/<[^>]+>/g, '').replace(/___/, q.o[q.a]) : '';
    return q.say || '';
  }

  // opts: {onDone(results), label, speakOnOk}
  JP.runQuiz = function (root, questions, opts) {
    opts = opts || {};
    const total = questions.length; let i = 0; const results = [];
    const lockedByEnter = { v: false };

    function head() {
      return `<div class="qbar"><div class="qfill" style="width:${Math.round(i / total * 100)}%"></div></div>
        <div class="qcount"><span>${opts.label ? U.esc(opts.label) + ' · ' : ''}Вопрос ${i + 1} из ${total}</span><span class="qok">✓ ${results.filter(r => r.ok).length}</span></div>`;
    }

    function show() {
      const q = questions[i]; let answered = false;
      let body = '';
      if (q.t === 'gap') {
        body = `<div class="qtext">${q.q.replace('___', blank)}</div><input class="qinput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="впиши ответ">`;
      } else if (q.t === 'vtype') {
        body = `<div class="qtext big">${U.esc(q.q)}</div><div class="qsub">${U.esc(q.sub || 'Напиши это слово по-английски')}</div><input class="qinput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="по-английски">`;
      } else if (q.t === 'listen') {
        body = `<div class="qtext"><button class="btn big-play" data-act="play">🔊 Послушать</button> <button class="btn ghost small" data-act="slow">🐢 Медленно</button></div>
          <input class="qinput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="напиши, что услышала">`;
      } else if (q.t === 'mc' || q.t === 'vmc') {
        const speaker = q.t === 'vmc' && q.say ? ` <button class="icon-btn" data-act="play" aria-label="Произнести">🔊</button>` : '';
        const qt = q.t === 'vmc' ? `<div class="qtext big">${U.esc(q.q)}${speaker}</div>` : `<div class="qtext">${q.q.replace('___', blank)}</div>`;
        body = qt + `<div class="opts">${q.o.map((o, k) => `<button class="opt" data-k="${k}">${U.esc(o)}</button>`).join('')}</div>`;
      } else if (q.t === 'ord') {
        const words = U.shuffle(q.s.split(' ').map((w, k) => ({ w, k })));
        body = `<div class="qtext">${U.esc(q.q)}</div><div class="line" id="aline" aria-label="Твой ответ"></div><div class="pool" id="pool">${words.map(o => `<button class="tile" data-k="${o.k}">${U.esc(o.w)}</button>`).join('')}</div>`;
      }
      root.innerHTML = `<div class="quiz">${head()}<div class="qcard"><div class="qtype">${typeLabel[q.t]}</div>${body}<div class="qfeed" aria-live="polite"></div>
        <div class="qactions"><button class="btn primary" data-act="check" ${q.t === 'mc' || q.t === 'vmc' ? 'hidden' : ''}>Проверить</button></div></div></div>`;

      const $ = s => root.querySelector(s);
      const input = $('.qinput'); if (input) setTimeout(() => input.focus(), 30);
      if (q.t === 'listen' || (q.t === 'vmc' && q.say)) setTimeout(() => U.say(q.say), 150);
      root.querySelectorAll('[data-act=play]').forEach(b => b.onclick = () => U.say(q.say));
      root.querySelectorAll('[data-act=slow]').forEach(b => b.onclick = () => U.say(q.say, 0.6));

      function finish(ok, userText, note) {
        if (answered) return; answered = true;
        results.push({ k: q.k, unit: q.unit, wid: q.wid, ok, user: userText, q });
        const correctShown = q.t === 'mc' || q.t === 'vmc' ? q.o[q.a] : q.t === 'ord' ? q.s : q.a[0] + (q.a.length > 1 && q.t !== 'vtype' ? '' : '');
        const sent = sentenceOf(q);
        const speaker = sent && U.canSpeak() ? ` <button class="icon-btn" data-act="say" aria-label="Послушать">🔊</button>` : '';
        $('.qfeed').innerHTML = ok
          ? `<div class="fb ok"><b>✓ Верно!</b>${note ? ' ' + U.esc(note) : ''}${speaker}${q.e ? `<div class="fe">${q.e}</div>` : ''}</div>`
          : `<div class="fb bad"><b>✗ Правильно:</b> <span class="ans">${U.esc(correctShown)}</span>${speaker}${q.e ? `<div class="fe">${q.e}</div>` : ''}</div>`;
        const fs = $('[data-act=say]'); if (fs) fs.onclick = () => U.say(sent);
        const act = $('.qactions'); act.innerHTML = `<button class="btn primary" data-act="next">${i + 1 < total ? 'Дальше' : 'Результат'}</button>`;
        const nb = act.querySelector('[data-act=next]'); nb.onclick = next; nb.focus();
        if (input) input.disabled = true;
        root.querySelectorAll('.opt').forEach((b, k) => { b.disabled = true; if (k === q.a) b.classList.add('right'); });
        if (opts.speakOnOk && ok && sent) U.say(sent);
      }
      function next() { i++; if (i >= total) { opts.onDone && opts.onDone(results); } else show(); window.scrollTo(0, 0); }

      if (q.t === 'mc' || q.t === 'vmc') {
        root.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          const k = +b.dataset.k; const ok = k === q.a;
          b.classList.add(ok ? 'right' : 'wrong'); finish(ok, q.o[k]);
        });
      } else if (q.t === 'ord') {
        const line = $('#aline'), pool = $('#pool'); const chosen = [];
        const sync = () => { $('[data-act=check]').disabled = chosen.length === 0; };
        pool.addEventListener('click', e => { const b = e.target.closest('.tile'); if (!b || answered) return; line.appendChild(b); chosen.push(b); sync(); });
        line.addEventListener('click', e => { const b = e.target.closest('.tile'); if (!b || answered) return; pool.appendChild(b); chosen.splice(chosen.indexOf(b), 1); sync(); });
        sync();
        $('[data-act=check]').onclick = () => {
          const user = chosen.map(b => b.textContent).join(' ');
          finish(U.norm(user) === U.norm(q.s), user);
          line.classList.add('done');
        };
      } else {
        const check = () => {
          if (answered) return;
          const user = input.value.trim(); if (!user) { input.focus(); return; }
          const n = U.norm(user); const answers = q.a.map(U.norm);
          if (answers.includes(n)) return finish(true, user);
          const near = q.t === 'vtype' && answers.some(a => a.length >= 5 && U.lev(a, n) === 1);
          if (near) return finish(true, user, 'Почти! Следи за написанием: ' + q.a[0]);
          finish(false, user);
        };
        $('[data-act=check]').onclick = check;
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      }
    }
    show();
  };

  // ---- Вопросы по словам ----
  JP.vq = {
    mc(word, pool, dir) {
      const others = U.pick(pool.filter(w => w.id !== word.id && w.ru !== word.ru), 3);
      const correct = dir === 'ru2en' ? word.en : word.ru;
      const opts = U.shuffle([correct].concat(others.map(w => dir === 'ru2en' ? w.en : w.ru)));
      return dir === 'ru2en'
        ? { t: 'vmc', q: word.ru, o: opts, a: opts.indexOf(correct), wid: word.id, say: word.en, k: word.id }
        : { t: 'vmc', q: word.en, o: opts, a: opts.indexOf(correct), wid: word.id, say: word.en, k: word.id };
    },
    typable: w => /^[a-z' -]+$/i.test(w.en) && w.en.split(' ').length <= 3,
    type(word) { return { t: 'vtype', q: word.ru, a: [word.en], wid: word.id, say: word.en, k: word.id }; }
  };
})(window.JP);
