window.JP = window.JP || {};
(function (JP) {
  const U = {};
  U.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.pad = n => String(n).padStart(2, '0');
  U.dstr = d => d.getFullYear() + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate());
  U.today = () => U.dstr(new Date());
  U.parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  U.addDays = (s, n) => { const d = U.parse(s); d.setDate(d.getDate() + n); return U.dstr(d); };
  U.diffDays = (a, b) => Math.round((U.parse(b) - U.parse(a)) / 86400000);
  U.dow = s => U.parse(s).getDay();
  U.fmt = (s, o) => U.parse(s).toLocaleDateString('ru-RU', o || { day: 'numeric', month: 'long' });
  U.fmtLong = s => U.parse(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  U.mondayOf = s => { const d = U.parse(s); const k = (d.getDay() + 6) % 7; return U.addDays(s, -k); };
  U.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  U.pick = (a, n) => U.shuffle(a).slice(0, n);
  U.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  U.uid = () => Math.random().toString(36).slice(2, 9);
  U.DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  U.DAYS_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  U.plural = (n, a, b, c) => { n = Math.abs(n) % 100; const m = n % 10; if (n > 10 && n < 20) return c; if (m > 1 && m < 5) return b; if (m === 1) return a; return c; };

  // Normalisation for typed answers: case, punctuation, contractions are ignored.
  const CONTR = [[/\bcan't\b/g, 'can not'], [/\bcannot\b/g, 'can not'], [/\bwon't\b/g, 'will not'], [/\bshan't\b/g, 'shall not'],
    [/n't\b/g, ' not'], [/'m\b/g, ' am'], [/'re\b/g, ' are'], [/'ve\b/g, ' have'], [/'ll\b/g, ' will'], [/\blet's\b/g, 'let us']];
  U.norm = s => {
    s = String(s).toLowerCase().replace(/[’‘`]/g, "'");
    CONTR.forEach(([r, t]) => { s = s.replace(r, t); });
    return s.replace(/[.,!?;:"«»]/g, ' ').replace(/\s+/g, ' ').trim();
  };
  U.lev = (a, b) => {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  };

  // Text to speech (browser built-in)
  let voice = null;
  const pickVoice = () => {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  };
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  U.canSpeak = () => 'speechSynthesis' in window;
  U.say = (text, rate) => {
    try {
      if (!U.canSpeak()) return false;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/_{2,}/g, '...'));
      u.lang = voice ? voice.lang : 'en-GB'; if (voice) u.voice = voice;
      u.rate = rate || 0.9;
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  };
  U.toast = msg => {
    const t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(U._tt); U._tt = setTimeout(() => t.classList.remove('show'), 2600);
  };
  JP.U = U;
})(window.JP);
