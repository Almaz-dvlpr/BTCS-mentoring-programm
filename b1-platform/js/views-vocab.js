// Скрытый раздел «Словарь»: ежедневное изучение оцифрованного бумажного словаря по буквам,
// строго по алфавиту, без повторений. Отмеченные «Знаю» слова больше не показываются.
// Доступ: преподаватель (вход как в /admin) или пароль. Пароль — это просто ширма от случайных
// заходов обычных учеников, а не настоящая защита данных (как написано в README про /admin,
// данные защищены на сервере правилами базы, а не скрытием, и здесь данные личные, не серверные).
(function (JP) {
  const U = JP.U, ui = JP.ui, esc = U.esc, S = () => JP.store.get();
  const C = JP.cloud;
  const PASS = '111';
  const UNLOCK_KEY = 'b1.dict.unlocked';

  // словари по буквам: сейчас только A, остальные будут добавлены по мере оцифровки
  const LETTERS = [{ key: 'A', label: 'A', data: () => (JP.data.dictA || []) }];

  const unlocked = () => { try { return localStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; } };
  const unlock = () => { try { localStorage.setItem(UNLOCK_KEY, '1'); } catch (e) {} };
  async function isAdmin() {
    if (!C || !C.enabled) return false;
    try { const ses = await C.session(); return !!ses && await C.isTeacher(); } catch (e) { return false; }
  }

  function gate(msg) {
    ui.set(`<a href="#/words" class="muted">← слова</a>
      <div class="center" style="margin-top:20px"><div class="emoji-xl">🔒</div><h1>Словарь</h1><p class="muted">Этот раздел закрыт.</p></div>
      <form class="card" id="f"><label class="muted" for="pw">Пароль</label>
        <input type="password" id="pw" autocomplete="off" style="width:100%;font:inherit;border:2px solid var(--line);border-radius:12px;padding:11px 14px;min-height:46px;background:var(--card);color:var(--ink);margin-bottom:12px">
        <div id="msg" role="alert" style="min-height:1.4em;color:var(--bad)">${msg ? esc(msg) : ''}</div>
        <button class="btn primary block" type="submit">Войти</button>
        <p class="muted" style="font-size:.85rem;margin-bottom:0">Преподаватель может войти и без пароля — через <a href="#/admin">кабинет преподавателя</a>.</p>
      </form>`, { noTabs: true });
    ui.$('#f').onsubmit = e => {
      e.preventDefault();
      const v = ui.$('#pw').value;
      if (v === PASS) { unlock(); ui.go('#/vocab'); }
      else { ui.$('#msg').textContent = 'Неверный пароль.'; ui.$('#pw').value = ''; ui.$('#pw').focus(); }
    };
    ui.$('#pw').focus();
  }

  function knownMap() { const st = S(); st.dictKnown = st.dictKnown || {}; return st.dictKnown; }
  function dailyN() { const st = S(); return U.clamp(+st.dictDaily || 10, 1, 200); }

  ui.route('/vocab', async () => {
    ui.set('<p class="muted" style="margin-top:20px">Загружаю…</p>', { noTabs: true });
    if (!unlocked() && !(await isAdmin())) return gate();
    render();
  });

  function render(letterKey) {
    const letter = LETTERS.find(l => l.key === letterKey) || LETTERS[0];
    const all = letter.data();
    const known = knownMap();
    const total = all.length;
    const knownCount = all.filter(w => known[w.id]).length;
    const queue = all.filter(w => !known[w.id]);
    const n = dailyN();
    const batch = queue.slice(0, n);
    const pct = total ? Math.round(knownCount / total * 100) : 0;

    const letterTabs = LETTERS.length > 1
      ? `<div class="choices" style="margin-bottom:12px">${LETTERS.map(l => `<button class="choice ${l.key === letter.key ? 'on' : ''}" data-letter="${l.key}">${esc(l.label)}</button>`).join('')}</div>`
      : '';

    ui.set(`<a href="#/words" class="muted">← слова</a><h1>Словарь: буква ${esc(letter.key)}</h1>
      ${letterTabs}
      <div class="grid3"><div class="card stat"><b>${total}</b><small>всего слов</small></div><div class="card stat"><b>${knownCount}</b><small>знаю</small></div><div class="card stat"><b>${queue.length}</b><small>осталось</small></div></div>
      <div class="bar" style="margin:4px 0 16px"><i style="width:${pct}%"></i></div>
      <div class="card"><div class="row between" style="align-items:center">
          <label class="muted" for="daily" style="margin:0">Новых слов за раз</label>
          <input type="number" id="daily" min="1" max="200" value="${n}" style="width:72px;font:inherit;border:2px solid var(--line);border-radius:10px;padding:6px 8px;background:var(--card);color:var(--ink)">
        </div></div>
      <div id="list">${batch.length ? `<div class="card"><div class="words">${batch.map(wordRow).join('')}</div></div>` : `<div class="card center"><div class="emoji-xl">🎉</div><p>${queue.length === 0 ? 'Все слова на букву ' + esc(letter.key) + ' отмечены как изученные.' : 'Ничего не осталось показать — увеличьте число слов за раз.'}</p></div>`}</div>`);

    ui.$('#daily').onchange = () => {
      const st = S(); st.dictDaily = U.clamp(+ui.$('#daily').value || 10, 1, 200); JP.store.save(); render(letter.key);
    };
    ui.$$('[data-letter]').forEach(b => b.onclick = () => render(b.dataset.letter));
    ui.$$('#list [data-know]').forEach(btn => btn.onclick = () => {
      knownMap()[btn.dataset.know] = Date.now(); JP.store.save(); render(letter.key);
    });
    ui.$$('#list [data-say]').forEach(b => b.onclick = () => U.say(b.dataset.say));
  }

  function wordRow(w) {
    return `<div class="word" style="align-items:flex-start">
      <div><b>${esc(w.en)}</b>${w.pos ? ` <small class="muted">${esc(w.pos)}</small>` : ''}<br><span class="muted">${esc(w.ru)}</span></div>
      <div class="row" style="gap:6px;flex-shrink:0">${U.canSpeak() ? `<button class="icon-btn" data-say="${esc(w.en)}" aria-label="Произнести ${esc(w.en)}">🔊</button>` : ''}<button class="btn small" data-know="${esc(w.id)}">✓ Знаю</button></div>
    </div>`;
  }
})(window.JP);
