(function (JP) {
  // Режим просмотра (из кабинета преподавателя): отдельное хранилище, без связи с сервером
  let previewInfo = null;
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('preview')) { previewInfo = { kind: q.get('preview'), name: q.get('as') || '' }; sessionStorage.setItem('b1.preview', JSON.stringify(previewInfo)); history.replaceState(null, '', location.pathname + location.hash); }
    else { const p = sessionStorage.getItem('b1.preview'); if (p) previewInfo = JSON.parse(p); }
  } catch (e) {}
  JP.preview = previewInfo;
  const KEY = previewInfo ? 'b1.preview.v1' : 'b1.platform.v1';
  const defaults = () => ({
    v: 1, createdAt: Date.now(),
    profile: null,        // answers of the questionnaire
    placement: null,      // diagnostic result
    units: {},            // id -> {status, score, doneAt, step, next, weak, tries}
    cards: {},            // wordId -> {box, due, seen, ok}
    vocabLearned: {},     // vocab unit id -> date
    days: {},             // date -> {tasks:[], minutes, extra}
    writings: [],         // {date, id, title, text}
    checkpoints: [],      // {date, type, stage, score, n}
    stageTests: {},       // stage -> {passed, score, waived}
    settings: { sound: true },
    seen: {}              // misc one-off flags (welcome messages etc.)
  });
  let state = load(); let swapped = false;
  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return Object.assign(defaults(), JSON.parse(s)); } catch (e) {}
    return defaults();
  }
  JP.store = {
    get: () => state,
    save() { if (swapped) return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} },
    blank: () => defaults(),
    reset() { state = defaults(); this.save(); },
    // временно подставить чужие данные (кабинет преподавателя); возвращает функцию отката
    swap(obj) { const old = state; state = Object.assign(defaults(), obj); swapped = true; return () => { state = old; swapped = false; }; },
    isSwapped: () => swapped,
    importObj(obj) { state = Object.assign(defaults(), obj); this.save(); },
    exportJSON() { return JSON.stringify(state, null, 1); },
    importJSON(txt) { const o = JSON.parse(txt); if (!o || typeof o !== 'object' || !('units' in o)) throw new Error('bad'); state = Object.assign(defaults(), o); this.save(); }
  };
})(window.JP);
