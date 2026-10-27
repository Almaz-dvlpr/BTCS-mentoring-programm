// Движок: дорожная карта, оценка срока, ежедневный план, интервальные повторения, серии и отчёты.
(function (JP) {
  const U = JP.U, S = () => JP.store.get(), D = JP.data;
  const E = {};
  const MIN = { grammar: 30, vocab: 20, write: 20, irregular: 15 };
  const IRR_STAGES = { 1: [1, 2, 3], 2: [4, 5, 6, 7, 8], 3: [9, 10, 11, 12], 4: [13, 14] };
  const PM = { grammar: 20, vocab: 12, write: 20, irregular: 12 }; // минуты именно на платформе (остальное — работа с книгой)
  const GRAMMAR_INTERVALS = [1, 3, 7, 14, 30];
  const CARD_INTERVALS = [0, 1, 3, 7, 16, 35]; // по коробкам 1..5 (0 — сегодня)

  // ---------- Дорожная карта ----------
  let roadmap = null, flat = null, byId = null;
  E.invalidate = () => { roadmap = flat = byId = null; };

  function interleave(g, v, w) {
    const out = [], total = g.length + v.length + w.length;
    let gi = 0, vi = 0, wi = 0;
    for (let k = 0; k < total; k++) {
      const fg = g.length ? gi / g.length : 2, fv = v.length ? vi / v.length : 2, fw = w.length ? (wi + 0.5) / w.length : 2;
      const m = Math.min(fg, fv, fw);
      if (m === fg && gi < g.length) out.push(g[gi++]);
      else if (m === fv && vi < v.length) out.push(v[vi++]);
      else if (wi < w.length) out.push(w[wi++]);
      else if (gi < g.length) out.push(g[gi++]);
      else out.push(v[vi++]);
    }
    return out;
  }
  function build() {
    const reasons = (S().profile && S().profile.reasons) || [];
    const tagMap = { work: 'work', travel: 'travel', study: 'study', relocation: 'travel', friends: 'family', hobby: 'family', self: 'family' };
    const want = reasons.map(r => tagMap[r]).filter(Boolean);
    roadmap = D.stages.map(st => {
      let g = [], v = [];
      const items = [];
      if (st.eg) {
        for (let n = st.eg[0]; n <= st.eg[1]; n++) g.push({ id: 'eg-' + n, kind: 'grammar', book: 'eg', n, title: D.egTitles[n - 1], minutes: MIN.grammar, pm: PM.grammar });
        v = D.vocab.filter(x => x.n >= st.voc[0] && x.n <= st.voc[1]).map(x => ({ id: x.id, kind: 'vocab', n: x.n, title: x.title + ' — ' + x.ru, minutes: MIN.vocab, pm: PM.vocab, tags: x.tags }));
        // слова, подходящие под цели ученицы, идут раньше внутри этапа (мягкая сортировка)
        v = v.map((x, i) => ({ x, i, p: x.tags.some(t => want.includes(t)) ? 0 : 1 })).sort((a, b) => a.p - b.p || a.i - b.i).map(o => o.x);
      } else {
        g = D.muList.map(([n, title]) => ({ id: 'mu-' + n, kind: 'grammar', book: 'mu', n, title, minutes: MIN.grammar, pm: PM.grammar }));
      }
      // наборы неправильных глаголов равномерно вплетаются в этап
      const irr = (IRR_STAGES[st.n] || []).map(n => ({ id: 'irr-' + n, kind: 'irregular', n, title: 'Неправильные глаголы: набор ' + n + ' (' + D.irregular.filter(x => x.set === n).slice(0, 3).map(x => x.b).join(', ') + '…)', minutes: MIN.irregular, pm: PM.irregular }));
      if (irr.length) { const merged = v.slice(); irr.forEach((it, k) => merged.splice(Math.min(merged.length, Math.round((k + 1) * (merged.length + irr.length) / (irr.length + 1))), 0, it)); v = merged; }
      const w = D.writing.filter(x => x.stage === st.n).map(x => ({ id: x.id, kind: 'write', title: x.title, minutes: MIN.write, pm: PM.write }));
      g.forEach(it => { it.interactive = !!D.lessons[it.id]; });
      interleave(g, v, w).forEach(it => { it.stage = st.n; items.push(it); });
      return Object.assign({}, st, { items });
    });
    flat = roadmap.flatMap(s => s.items);
    byId = {}; flat.forEach(it => { byId[it.id] = it; });
  }
  E.roadmap = () => { if (!roadmap) build(); return roadmap; };
  E.items = () => { if (!flat) build(); return flat; };
  E.item = id => { if (!byId) build(); return byId[id]; };

  // ---------- Статус уроков ----------
  const unit = id => S().units[id];
  E.unit = unit;
  E.isDone = id => { const u = unit(id); return !!u && (u.status === 'done' || u.status === 'skipped'); };
  const stageTestOk = n => { const t = S().stageTests[n]; return !!t && !!(t.passed || t.waived); };
  E.stageDone = n => E.roadmap()[n - 1].items.every(it => E.isDone(it.id));
  E.unlockedStage = () => {
    let n = 1;
    while (n < 4 && E.stageDone(n) && stageTestOk(n)) n++;
    return n;
  };
  E.pendingStageTest = () => {
    for (let n = 1; n <= 4; n++) if (E.stageDone(n) && !stageTestOk(n)) return n;
    return null;
  };
  E.nextItems = k => {
    const lim = E.unlockedStage();
    return E.items().filter(it => it.stage <= lim && !E.isDone(it.id)).slice(0, k || 1);
  };
  E.currentStage = () => { const it = E.items().find(i => !E.isDone(i.id)); return it ? it.stage : 4; };

  E.completeUnit = (id, score, extra) => {
    const st = S(); const prev = st.units[id] || {};
    const step = score >= 0.85 ? 1 : 0;
    st.units[id] = Object.assign({}, prev, {
      status: 'done', score, tries: (prev.tries || 0) + 1, doneAt: U.today(), step,
      next: U.addDays(U.today(), GRAMMAR_INTERVALS[step]), weak: score < 0.7
    }, extra || {});
    JP.store.save();
  };
  E.applyPlacementSkips = (startStage, wrong) => {
    // пройденное по диагностике пропускаем; темы, где была ошибка, возвращаем как «пробелы» — в виде мини-повторения с правилом
    E.items().forEach(it => {
      if (it.stage >= startStage || E.isDone(it.id)) return;
      if ((wrong || []).includes(it.id) && D.lessons[it.id]) S().units[it.id] = { status: 'done', score: 0.5, step: 0, next: U.today(), weak: true, doneAt: U.today(), fromTest: true };
      else S().units[it.id] = { status: 'skipped', doneAt: U.today(), score: null };
    });
    for (let n = 1; n < startStage; n++) S().stageTests[n] = { waived: true, reason: 'placement' };
    JP.store.save();
  };

  // ---------- Повторения грамматики ----------
  E.dueReviews = () => {
    const t = U.today();
    return Object.entries(S().units).filter(([id, u]) => u.status === 'done' && u.next && u.next <= t && D.lessons[id]).sort((a, b) => a[1].next.localeCompare(b[1].next)).map(([id]) => id);
  };
  E.gradeReview = (id, score) => {
    const u = S().units[id]; if (!u) return;
    if (score >= 0.75) u.step = Math.min((u.step || 0) + 1, GRAMMAR_INTERVALS.length - 1); else u.step = 0;
    u.next = U.addDays(U.today(), GRAMMAR_INTERVALS[u.step]);
    u.weak = score < 0.7; JP.store.save();
  };

  // ---------- Карточки со словами ----------
  E.allWords = () => D.vocab.flatMap(v => v.words.map(w => Object.assign({ unit: v.id }, w)));
  E.wordById = id => { if (!E._w) { E._w = {}; E.allWords().forEach(w => { E._w[w.id] = w; }); } return E._w[id]; };
  E.addCards = unitId => {
    const v = D.vocab.find(x => x.id === unitId); if (!v) return;
    v.words.forEach(w => { if (!S().cards[w.id]) S().cards[w.id] = { box: 1, due: U.addDays(U.today(), 1), seen: 0, ok: 0 }; });
    S().vocabLearned[unitId] = U.today(); JP.store.save();
  };
  E.dueCards = () => { const t = U.today(); return Object.entries(S().cards).filter(([, c]) => c.due <= t).sort((a, b) => a[1].due.localeCompare(b[1].due) || a[1].box - b[1].box).map(([id]) => id); };
  E.gradeCard = (id, ok) => {
    const c = S().cards[id]; if (!c) return;
    c.seen++; if (ok) { c.ok++; c.box = Math.min(c.box + 1, 5); } else c.box = 1;
    c.due = U.addDays(U.today(), CARD_INTERVALS[c.box]); JP.store.save();
  };
  const isIrr = id => id.startsWith('irr:');
  E.knownWords = () => Object.entries(S().cards).filter(([id, c]) => !isIrr(id) && c.box >= 3).length;
  E.learnedWords = () => Object.keys(S().cards).filter(id => !isIrr(id)).length;
  // неправильные глаголы: две карточки на глагол (2-я и 3-я форма)
  E.irrCardIds = b => ['irr:' + b + ':p', 'irr:' + b + ':pp'];
  E.addIrrCards = setNo => {
    D.irregular.filter(v => v.set === setNo).forEach(v => E.irrCardIds(v.b).forEach(id => { if (!S().cards[id]) S().cards[id] = { box: 1, due: U.addDays(U.today(), 1), seen: 0, ok: 0 }; }));
    S().vocabLearned['irr-' + setNo] = U.today(); JP.store.save();
  };
  E.irrStats = () => {
    let learned = 0, known = 0;
    D.irregular.forEach(v => { const c = E.irrCardIds(v.b).map(id => S().cards[id]); if (c[0] && c[1]) { learned++; if (c[0].box >= 3 && c[1].box >= 3) known++; } });
    return { total: D.irregular.length, learned, known };
  };

  // ---------- Оценка срока ----------
  E.weeklyMinutes = () => { const p = S().profile; return p ? p.daysPerWeek * p.minutesPerDay : 0; };
  E.remainingMinutes = () => Math.round(E.items().filter(it => !E.isDone(it.id)).reduce((a, it) => a + it.minutes, 0) * 1.12);
  E.totalMinutes = () => E.items().reduce((a, it) => a + it.minutes, 0);
  E.progress = () => {
    const tot = E.totalMinutes(); const done = E.items().filter(it => E.isDone(it.id)).reduce((a, it) => a + it.minutes, 0);
    return tot ? done / tot : 0;
  };
  E.estimate = (override) => {
    const p = Object.assign({}, S().profile, override || {});
    const weekly = p.daysPerWeek * p.minutesPerDay; const rem = E.remainingMinutes();
    const weeks = weekly ? Math.ceil(rem / weekly) : 999;
    const eta = U.addDays(U.today(), weeks * 7);
    const out = { remaining: rem, weekly, weeks, eta, deadline: p.deadline || null };
    if (p.deadline) {
      const wLeft = Math.max(1, Math.floor(U.diffDays(U.today(), p.deadline) / 7));
      out.needWeekly = Math.ceil(rem / wLeft); out.ok = out.needWeekly <= weekly * 1.05; out.weeksLeft = wLeft;
      out.needPerDay = Math.ceil(out.needWeekly / p.daysPerWeek);
    }
    return out;
  };

  // ---------- Дни, серии, минуты ----------
  E.day = d => { const st = S(); if (!st.days[d]) st.days[d] = { tasks: [], minutes: 0, built: false }; return st.days[d]; };
  E.addMinutes = (m, cat) => { const d = E.day(U.today()); d.minutes = (d.minutes || 0) + m; d.cat = d.cat || {}; cat = cat || 'grammar'; d.cat[cat] = (d.cat[cat] || 0) + m; JP.store.save(); };
  E.isStudyDay = d => { const p = S().profile; return !!p && p.studyDays.includes(U.dow(d)); };
  E.didStudy = d => { const x = S().days[d]; return !!x && ((x.minutes || 0) > 0 || (x.tasks || []).some(t => t.done)); };
  E.streak = () => {
    // серия по запланированным дням; незапланированные дни серию не рвут и не продлевают
    let s = 0, d = U.today();
    if (E.isStudyDay(d) && !E.didStudy(d)) d = U.addDays(d, -1);
    for (let i = 0; i < 400; i++) {
      if (E.didStudy(d)) s++;
      else if (E.isStudyDay(d)) break;
      d = U.addDays(d, -1);
    }
    return s;
  };
  E.weekStats = () => {
    const mon = U.mondayOf(U.today()); let minutes = 0, days = 0;
    for (let i = 0; i < 7; i++) { const x = S().days[U.addDays(mon, i)]; if (x) { minutes += x.minutes || 0; if (E.didStudy(U.addDays(mon, i))) days++; } }
    const p = S().profile; return { minutes, days, goalMin: p.daysPerWeek * p.minutesPerDay, goalDays: p.daysPerWeek };
  };
  E.missedScheduledDays = () => {
    // сколько подряд запланированных дней пропущено (до сегодня, не включая)
    const start = S().profile.startedAt || U.today();
    let n = 0, d = U.addDays(U.today(), -1);
    for (let i = 0; i < 30 && d >= start; i++) { if (E.isStudyDay(d)) { if (E.didStudy(d)) break; n++; } d = U.addDays(d, -1); }
    return n;
  };
  E.unitsDoneSince = date => Object.values(S().units).filter(u => u.status === 'done' && u.doneAt && u.doneAt >= date).length;

  // ---------- План дня ----------
  E.checkpointDue = () => {
    const last = S().checkpoints.length ? S().checkpoints[S().checkpoints.length - 1].date : null;
    const since = last || '0000-00-00';
    const n = Object.values(S().units).filter(u => u.status === 'done' && u.doneAt > since && u.score != null).length;
    const poolOk = E.quizPool('recent').length >= 8;
    return n >= 5 && poolOk && (!last || U.diffDays(last, U.today()) >= 5);
  };
  const BOOK = { eg: 'Essential Grammar', mu: 'Murphy' };
  function unitTask(it, m) {
    let desc;
    if (it.kind === 'vocab') desc = 'Новые слова';
    else if (it.kind === 'irregular') desc = '10 неправильных глаголов';
    else if (it.kind === 'write') desc = 'Письменное задание';
    else if (!it.interactive) desc = BOOK[it.book] + ', урок ' + it.n + ' · по книге';
    else desc = BOOK[it.book] + ', урок ' + it.n + ' · ' + it.pm + ' мин на платформе' + (m > it.pm ? ' + ' + (m - it.pm) + ' по книге' : '');
    return { type: 'unit', ref: it.id, title: it.title, desc, minutes: m, kind: it.kind };
  }
  E.buildDay = (budgetOverride, force) => {
    const d = E.day(U.today());
    if (d.built && !force) return d;
    const p = S().profile; const rest = !E.isStudyDay(U.today());
    const budget = budgetOverride || (rest ? 10 : p.minutesPerDay);
    const keepDone = d.tasks.filter(t => t.done);
    const tasks = [];
    let used = keepDone.reduce((a, t) => a + (t.minutes || 0), 0);
    const add = t => { t.id = U.uid(); t.done = false; tasks.push(t); used += t.minutes; };

    // повторения занимают не больше ~30% времени
    const reviewBudget = Math.max(5, Math.round(budget * 0.3)); let rb = 0;
    const st = E.pendingStageTest();
    const dr = E.dueReviews();
    if (dr.length) { const it = E.item(dr[0]); add({ type: 'greview', ref: dr[0], title: 'Повторение: ' + (it ? it.title : dr[0]), desc: 'Мини-тест из 5 вопросов', minutes: 5 }); rb += 5; }
    const dueC = E.dueCards().length;
    if (dueC) { const room = Math.max(3, reviewBudget - rb); const n = Math.min(dueC, room * 3); add({ type: 'srs', title: 'Слова: повторение', desc: n + ' ' + U.plural(n, 'карточка', 'карточки', 'карточек'), n, minutes: Math.max(3, Math.ceil(n / 3)) }); }

    if (st) {
      add({ type: 'stagetest', ref: st, title: st === 4 ? 'Итоговый тест B1' : 'Итоговый тест этапа ' + st, desc: 'Проверим, всё ли закрепилось' + (st < 4 ? ' и откроем следующий этап' : ''), minutes: 15 });
    } else if (budget <= 12) {
      if (!tasks.length && !rest) {
        if (E.quizPool('all').length >= 5) add({ type: 'mix', title: 'Быстрая разминка', desc: '5 вопросов по пройденному', minutes: 5 });
        else { const it = E.nextItems(1)[0]; if (it) add(unitTask(it, it.pm)); }
      }
    } else {
      if (E.checkpointDue()) add({ type: 'checkpoint', title: 'Недельная проверка', desc: '10 вопросов по последним темам', minutes: 10 });
      let first = true;
      for (const it of E.nextItems(6)) {
        const room = budget - used;
        if (!first && room < it.minutes) break;
        add(unitTask(it, first ? U.clamp(room, it.pm, it.minutes) : it.minutes)); first = false;
        if (budget - used < 10) break;
      }
    }
    d.tasks = keepDone.concat(tasks); d.built = true; d.budget = budget; JP.store.save();
    return d;
  };
  E.addExtraTask = () => {
    const d = E.day(U.today()); const it = E.nextItems(1)[0];
    if (!it) return null;
    if (d.tasks.some(t => t.type === 'unit' && t.ref === it.id && !t.done)) return null;
    const t = Object.assign(unitTask(it, it.minutes), { id: U.uid(), done: false }); t.desc = 'Дополнительно · ' + t.desc; d.tasks.push(t);
    JP.store.save(); return t;
  };
  E.syncDay = () => {
    const d = E.day(U.today());
    d.tasks.forEach(t => { if (t.type === 'unit' && !t.done && E.isDone(t.ref)) t.done = true; });
    JP.store.save(); return d;
  };
  E.markTask = (type, ref) => {
    const d = E.day(U.today());
    const t = d.tasks.find(x => !x.done && x.type === type && (ref == null || x.ref === ref));
    if (t) t.done = true; JP.store.save(); return t;
  };
  E.nextTask = () => E.day(U.today()).tasks.find(t => !t.done);

  // ---------- Пул вопросов для проверок ----------
  E.quizPool = mode => {
    let ids;
    if (mode === 'recent') {
      const t = U.addDays(U.today(), -21);
      ids = Object.entries(S().units).filter(([id, u]) => u.status === 'done' && u.doneAt >= t && D.lessons[id]).map(([id]) => id);
    } else if (mode === 'all') ids = Object.keys(S().units).filter(id => S().units[id].status === 'done' && D.lessons[id]);
    else if (mode && mode.stage) ids = E.roadmap()[mode.stage - 1].items.filter(it => D.lessons[it.id]).map(it => it.id);
    else ids = [];
    return ids.flatMap(id => D.lessons[id].ex.map((q, i) => Object.assign({}, q, { unit: id, k: id + '#' + i })));
  };
  E.quiz = (mode, n) => {
    let pool = E.quizPool(mode);
    // не более 2 вопросов с одного урока, чтобы проверка была широкой
    const per = {}; const out = [];
    U.shuffle(pool).forEach(q => { per[q.unit] = (per[q.unit] || 0) + 1; if (per[q.unit] <= 2 && out.length < n) out.push(q); });
    return out;
  };

  // ---------- Слабые места ----------
  E.weakTopics = () => {
    const out = [];
    Object.entries(S().units).forEach(([id, u]) => { if (u.status === 'done' && u.score != null && u.score < 0.7) out.push({ id, title: (E.item(id) || {}).title || id, score: u.score }); });
    (S().placement && S().placement.wrong || []).forEach(id => { const u = S().units[id]; if (E.item(id) && !(u && u.status === 'done') && !out.find(o => o.id === id)) out.push({ id, title: E.item(id).title, score: null, fromTest: true }); });
    return out;
  };
  E.avgAccuracy = () => {
    const v = Object.values(S().units).filter(u => u.status === 'done' && u.score != null).map(u => u.score);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };

  // ---------- Календарь ----------
  E.icsFor = () => {
    const p = S().profile; const hours = { morning: [8, 0], day: [13, 0], evening: [19, 0], late: [21, 30] }[p.bestTime] || [19, 0];
    const BY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const pad = U.pad; const now = new Date(); const stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + '00Z';
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Put k B1//RU', 'CALSCALE:GREGORIAN'];
    const mk = (title, dayIdx, h, m, durMin, uid, desc) => {
      // ближайший такой день недели, начиная с сегодня
      let d = U.today(); while (U.dow(d) !== dayIdx) d = U.addDays(d, 1);
      const start = d.replace(/-/g, '') + 'T' + pad(h) + pad(m) + '00';
      const endTotal = h * 60 + m + durMin; const end = d.replace(/-/g, '') + 'T' + pad(Math.floor(endTotal / 60) % 24) + pad(endTotal % 60) + '00';
      lines.push('BEGIN:VEVENT', 'UID:' + uid + '@put-k-b1', 'DTSTAMP:' + stamp, 'DTSTART:' + start, 'DTEND:' + end, 'RRULE:FREQ=WEEKLY;BYDAY=' + BY[dayIdx],
        'SUMMARY:' + title, 'DESCRIPTION:' + desc, 'BEGIN:VALARM', 'TRIGGER:-PT10M', 'ACTION:DISPLAY', 'DESCRIPTION:' + title, 'END:VALARM', 'END:VEVENT');
    };
    p.studyDays.forEach(dw => mk('English: занятие с Эми (' + p.minutesPerDay + ' мин)', dw, hours[0], hours[1], p.minutesPerDay, 'study' + dw, 'Открой платформу «Путь к B1» и выполни план на сегодня.'));
    (p.liveDays || []).forEach(dw => mk('English: занятие с преподавателем', dw, hours[0], hours[1], 60, 'live' + dw, 'Индивидуальное занятие. Возьми книги и тетрадь для слов.'));
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  };

  JP.E = E;
})(window.JP);
