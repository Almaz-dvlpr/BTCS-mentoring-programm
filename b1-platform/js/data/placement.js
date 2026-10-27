// Диагностический тест: 30 вопросов, 4 уровня. u = урок, к которому вернёмся, если ответ неверный.
window.JP = window.JP || {};
JP.data = JP.data || { lessons: {} };
JP.data.placement = [
  // A1
  { l: 'A1', q: 'She ___ a teacher.', o: ['am', 'is', 'are'], a: 1, u: 'eg-1' },
  { l: 'A1', q: '___ you like coffee?', o: ['Do', 'Does', 'Are'], a: 0, u: 'eg-8' },
  { l: 'A1', q: "I ___ TV at the moment.", o: ['watch', 'am watching', 'watches'], a: 1, u: 'eg-4' },
  { l: 'A1', q: 'There ___ two chairs in the room.', o: ['is', 'are', 'be'], a: 1, u: 'eg-38' },
  { l: 'A1', q: 'Yesterday I ___ to the cinema.', o: ['go', 'went', 'goed'], a: 1, u: 'eg-12' },
  { l: 'A1', q: 'He ___ like fish.', o: ["don't", "doesn't", "isn't"], a: 1, u: 'eg-7' },
  { l: 'A1', q: 'This is ___ book. It is mine.', o: ['my', 'me', 'I'], a: 0, u: 'eg-61' },
  { l: 'A1', q: '___ is your phone number?', o: ['What', 'Who', 'Where'], a: 0, u: 'eg-48' },
  // A2
  { l: 'A2', q: 'I have lived here ___ 2019.', o: ['for', 'since', 'ago'], a: 1, u: 'eg-20' },
  { l: 'A2', q: 'We ___ dinner when the phone rang.', o: ['had', 'were having', 'have'], a: 1, u: 'eg-15' },
  { l: 'A2', q: 'Look at the sky! It ___ rain.', o: ['will', 'is going to', 'shall'], a: 1, u: 'eg-27' },
  { l: 'A2', q: "You ___ wear a seatbelt. It's the law.", o: ['should', 'have to', 'might'], a: 1, u: 'eg-34' },
  { l: 'A2', q: "'I can't find my keys.' – 'I ___ you look for them.'", o: ['help', 'will help', 'am helping'], a: 1, u: 'eg-28' },
  { l: 'A2', q: 'My sister is ___ than me.', o: ['tall', 'taller', 'more tall'], a: 1, u: 'eg-88' },
  { l: 'A2', q: 'Have you ___ been to London?', o: ['ever', 'yet', 'already'], a: 0, u: 'eg-18' },
  { l: 'A2', q: "There isn't ___ milk in the fridge.", o: ['some', 'any', 'no'], a: 1, u: 'eg-77' },
  { l: 'A2', q: 'The window ___ by the wind last night.', o: ['broke', 'was broken', 'has broken'], a: 1, u: 'eg-22' },
  { l: 'A2', q: 'How ___ people were at the party?', o: ['much', 'many', 'a lot'], a: 1, u: 'eg-84' },
  // A2+
  { l: 'A2+', q: 'If I ___ more money, I would buy a bigger flat.', o: ['have', 'had', 'will have'], a: 1, u: 'eg-100' },
  { l: 'A2+', q: 'The man ___ lives next door is a doctor.', o: ['who', 'which', 'whose'], a: 0, u: 'eg-101' },
  { l: 'A2+', q: 'She said she ___ tired.', o: ['is', 'was', 'were'], a: 1, u: 'eg-51' },
  { l: 'A2+', q: "I'm looking forward to ___ you.", o: ['see', 'seeing', 'saw'], a: 1, u: 'eg-112' },
  { l: 'A2+', q: 'Do you know where ___?', o: ['is the station', 'the station is', 'does the station'], a: 1, u: 'eg-50' },
  { l: 'A2+', q: 'I used to ___ in a small village.', o: ['live', 'living', 'lived'], a: 0, u: 'eg-37' },
  // B1
  { l: 'B1', q: 'I ___ here for three hours. Where is he?', o: ['have been waiting', 'am waiting', 'wait'], a: 0, u: 'mu-9' },
  { l: 'B1', q: 'When we arrived, the film ___ already started.', o: ['has', 'had', 'was'], a: 1, u: 'mu-15' },
  { l: 'B1', q: 'If I ___ harder, I would have passed the exam.', o: ['studied', 'had studied', 'would study'], a: 1, u: 'mu-40' },
  { l: 'B1', q: "I'm not used to ___ up early.", o: ['get', 'getting', 'got'], a: 1, u: 'mu-61' },
  { l: 'B1', q: 'He asked me ___ I was doing there.', o: ['what', 'that', 'if'], a: 0, u: 'mu-47' },
  { l: 'B1', q: "I'd rather ___ at home tonight.", o: ['stay', 'to stay', 'staying'], a: 0, u: 'mu-59' }
];
