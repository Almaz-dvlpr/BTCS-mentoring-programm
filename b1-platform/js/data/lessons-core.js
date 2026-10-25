// Конструкторы упражнений. Каждое упражнение — объект {t, q, ...}.
window.JP = window.JP || {};
JP.data = JP.data || { lessons: {} };
(function () {
  const lessons = JP.data.lessons;
  // gap: впиши слово(а). a — варианты через «|»
  JP.gap = (q, a, e) => ({ t: 'gap', q, a: a.split('|'), e: e || '' });
  // mc: выбери вариант. i — индекс верного
  JP.mc = (q, o, i, e) => ({ t: 'mc', q, o, a: i, e: e || '' });
  // ord: собери предложение из слов
  JP.ord = (s, e) => ({ t: 'ord', q: 'Собери предложение', s, e: e || '' });
  // L: добавить урок с интерактивной частью
  JP.L = (id, level, rule, ex, write) => { lessons[id] = { id, level, rule, ex, write: write || '' }; };
})();
