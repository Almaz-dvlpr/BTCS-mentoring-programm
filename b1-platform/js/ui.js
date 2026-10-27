// Каркас интерфейса: маршрутизация, вкладки, общие вспомогательные функции.
(function (JP) {
  const U = JP.U; const S = () => JP.store.get();
  const ui = { routes: [] };
  ui.$ = (s, r) => (r || document).querySelector(s);
  ui.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  ui.root = () => document.getElementById('app');
  ui.tabs = [
    { h: '#/', ic: '🏠', t: 'Сегодня', m: p => p === '/' || p.startsWith('/do/') },
    { h: '#/plan', ic: '🗺️', t: 'План', m: p => p === '/plan' || p.startsWith('/unit/') },
    { h: '#/words', ic: '🔤', t: 'Слова', m: p => p === '/words' },
    { h: '#/progress', ic: '📈', t: 'Прогресс', m: p => p === '/progress' },
    { h: '#/more', ic: '👤', t: 'Профиль', m: p => p === '/more' }
  ];
  ui.set = (html, o) => {
    o = o || {};
    ui.root().innerHTML = html;
    document.body.classList.toggle('no-tabs', !!o.noTabs);
    const t = document.getElementById('tabs'); t.hidden = !!o.noTabs;
    if (!o.keepScroll) window.scrollTo(0, 0);
    // озвучка примеров в тексте
    ui.$$('q', ui.root()).forEach(q => { q.title = 'Нажми, чтобы послушать'; q.onclick = () => U.say(q.textContent); });
  };
  ui.renderTabs = path => {
    document.getElementById('tabs').innerHTML = ui.tabs.map(t => `<a href="${t.h}" class="${t.m(path) ? 'on' : ''}"><span>${t.ic}</span>${t.t}</a>`).join('');
  };
  ui.route = (pattern, fn, o) => {
    const keys = []; const re = new RegExp('^' + pattern.replace(/:([a-z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    ui.routes.push({ re, keys, fn, o: o || {} });
  };
  ui.go = h => { if (location.hash === h) ui.dispatch(); else location.hash = h; };
  ui.dispatch = () => {
    let path = decodeURIComponent((location.hash || '#/').replace(/^#/, '').split('?')[0]) || '/';
    const st = S();
    const open = p => p === '/login' || p === '/recover' || p.startsWith('/admin');
    const C = JP.cloud; const needLogin = !!(C && C.enabled && !C.hasAccess());
    if (!st.profile && !open(path) && path !== '/welcome') { path = needLogin ? '/login' : '/welcome'; history.replaceState(null, '', '#' + path); }
    else if (!st.profile && path === '/welcome' && needLogin) { path = '/login'; history.replaceState(null, '', '#/login'); }
    else if (st.profile && !(st.placement && st.placement.done) && !open(path) && path !== '/placement') { path = '/placement'; history.replaceState(null, '', '#/placement'); }
    for (const r of ui.routes) {
      const m = path.match(r.re); if (!m) continue;
      const params = {}; r.keys.forEach((k, i) => { params[k] = m[i + 1]; });
      ui.renderTabs(path);
      try { r.fn(params); } catch (e) { console.error(e); ui.set(`<div class="card"><h1>Что-то пошло не так</h1><p class="muted">${U.esc(e.message)}</p><a class="btn" href="#/">На главную</a></div>`); }
      return;
    }
    ui.set('<div class="card"><h1>Страница не найдена</h1><a class="btn primary" href="#/">На главную</a></div>');
  };
  ui.confetti = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('div'); c.className = 'confetti';
    const cols = ['#0d9488', '#f08a3c', '#facc15', '#ec4899', '#6366f1'];
    for (let i = 0; i < 40; i++) { const e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.background = cols[i % cols.length]; e.style.animationDelay = Math.random() * .6 + 's'; e.style.transform = `rotate(${Math.random() * 360}deg)`; c.appendChild(e); }
    document.body.appendChild(c); setTimeout(() => c.remove(), 2800);
  };
  ui.download = (name, text, type) => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  ui.bar = (p, cls) => `<div class="bar ${cls || ''}"><i style="width:${Math.round(U.clamp(p, 0, 1) * 100)}%"></i></div>`;
  ui.rule = html => html.replace(/~~(.+?)~~/g, '<s class="bad">$1</s>');
  JP.ui = ui;
  window.addEventListener('hashchange', ui.dispatch);
})(window.JP);
