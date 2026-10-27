// Демонстрационный ученик для режима просмотра: заполненный прогресс, повторения, письмо, проверки.
(function (JP) {
  const U = JP.U, E = JP.E, D = JP.data;
  JP.demoState = () => {
    const t = U.today(), s = JP.store.blank();
    s.profile = { name: 'Тестовый ученик', reasons: ['travel', 'work'], selfLevel: 'base', difficulties: ['speaking'], daysPerWeek: 5, studyDays: [1, 2, 3, 4, 5], minutesPerDay: 30, bestTime: 'evening', device: 'phone', formats: ['quick', 'cards'], liveLessons: 1, liveDays: [3], deadline: null, hasBooks: 'all', tone: 'soft', startedAt: U.addDays(t, -45) };
    s.placement = { done: true, stage: 1, by: { A1: { n: 8, ok: 6 }, A2: { n: 10, ok: 3 }, 'A2+': { n: 6, ok: 1 }, B1: { n: 6, ok: 0 } }, wrong: [], takenAt: U.addDays(t, -45) };
    const restore = JP.store.swap(s); E.invalidate();
    try {
      const scores = [0.95, 0.9, 0.85, 0.7, 0.55, 0.9, 0.8, 0.95];
      E.items().slice(0, 26).forEach((it, i) => {
        E.completeUnit(it.id, it.kind === 'write' ? 1 : scores[i % scores.length]);
        const u = s.units[it.id]; u.doneAt = U.addDays(t, -(26 - i)); if (it.kind === 'vocab') { E.addCards(it.id); } if (it.kind === 'irregular') E.addIrrCards(it.n);
        if (u.next) u.next = U.addDays(t, (i % 6) - 2);
      });
      Object.values(s.cards).forEach((c, i) => { c.box = 1 + (i % 5); c.due = U.addDays(t, (i % 4) - 1); c.seen = 3; c.ok = 2; });
      for (let i = 0; i < 80; i++) if (i % 4 !== 3) { const g = 10 + (i * 5) % 20, m = g + 14; s.days[U.addDays(t, -i)] = { tasks: [], minutes: m, cat: { grammar: g, words: 8, writing: i % 9 === 0 ? 10 : 0, review: m - g - 8 - (i % 9 === 0 ? 10 : 0) } }; }
      s.writings.push({ date: U.addDays(t, -9), id: 'w-1', title: 'Расскажи о себе', prompt: 'Напиши 5–6 предложений о себе.', text: 'My name is Test. I am a student. I like music and travel. I live in a big city. I want to speak English well.' });
      s.checkpoints.push({ date: U.addDays(t, -6), type: 'weekly', stage: null, score: 0.8, n: 10 }, { date: U.addDays(t, -1), type: 'irregular', stage: null, score: 0.7, n: 30 });
    } finally { restore(); E.invalidate(); }
    return s;
  };
})(window.JP);
