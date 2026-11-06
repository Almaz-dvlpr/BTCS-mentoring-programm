// Сценарии речевой практики («Скажи вслух») для ключевых тем B1.
// SP(id, { say: [...], subs: [{c, m}], tasks: [{p, m}] })
//   say   — образцы для повторения вслух (раунд 1);
//   subs  — подстановка: c = подсказка, m = образец ответа (раунд 2);
//   tasks — мини-ситуации для свободной речи: p = задание, m = пример ответа (раунд 3).
// Для тем без сценария дриллы собираются автоматически из упражнений урока.
(function () {
  const SP = JP.data.speak = {};
  const def = (id, o) => { SP[id] = o; };

  def('mu-9', {
    say: ["I've been waiting here for an hour.", 'How long have you been learning English?', "She's tired because she has been working all day.", "It's been raining since morning."],
    subs: [
      { c: 'ждать — два часа', m: "I've been waiting for two hours." },
      { c: 'учить английский — с января', m: "I've been learning English since January." },
      { c: 'он — работать — весь день', m: 'He has been working all day.' },
      { c: 'вопрос: как давно ты живёшь здесь?', m: 'How long have you been living here?' }
    ],
    tasks: [
      { p: 'Расскажи, что ты делаешь давно: учёба, работа, хобби (3 предложения).', m: "I've been studying English for two years. I've been working at a school since 2022. I've been running every morning for a month." },
      { p: 'Друг выглядит уставшим. Спроси его, чем он занимался, и объясни, почему ты сам(а) устал(а).', m: "You look tired. What have you been doing? I've been studying all night." }
    ]
  });
  def('mu-15', {
    say: ['When we arrived, the film had already started.', 'She said she had seen it before.', "I didn't know him because I had never met him.", 'After he had eaten dinner, he watched TV.'],
    subs: [
      { c: 'я пришёл(ла) — поезд уже ушёл', m: 'When I arrived, the train had already left.' },
      { c: 'он сказал — он уже был там', m: 'He said he had been there before.' },
      { c: 'мы не поели до того, как пришли', m: "We hadn't eaten before we came." },
      { c: 'после того как она позвонила — мы ушли', m: 'After she had called, we left.' }
    ],
    tasks: [
      { p: 'Расскажи о дне, когда ты опоздал(а): что уже случилось до твоего прихода (3 предложения).', m: 'I was late for the lesson. When I arrived, the lesson had already started. The teacher had already explained the new topic.' },
      { p: 'Опиши, что ты уже успел(а) сделать до сегодняшнего обеда.', m: 'By lunch I had already answered all my emails. I had also gone to the gym.' }
    ]
  });
  def('mu-24', {
    say: ["This time tomorrow I'll be flying to Paris.", 'By Friday I will have finished the report.', "In ten years I'll have learned three languages.", "Don't call at eight. I'll be sleeping."],
    subs: [
      { c: 'в это время завтра — я — работать', m: "This time tomorrow I'll be working." },
      { c: 'к воскресенью — я — закончить проект', m: 'By Sunday I will have finished the project.' },
      { c: 'к 2030 году — она — выучить английский', m: 'By 2030 she will have learned English.' },
      { c: 'в восемь вечера — мы — ужинать', m: "At eight tonight we'll be having dinner." }
    ],
    tasks: [
      { p: 'Расскажи, где ты будешь и что будешь делать в это время через год.', m: "This time next year I'll be living in a new flat. I'll be working in a bigger company." },
      { p: 'Назови три цели, которые ты выполнишь к концу года.', m: 'By the end of the year I will have reached B1. I will have saved some money. I will have read ten books.' }
    ]
  });
  def('mu-28', {
    say: ['He has worked twelve hours. He must be tired.', "That can't be Tom. He's in Spain.", 'She might be at home, but I am not sure.', "You've just eaten. You can't be hungry."],
    subs: [
      { c: 'он — наверняка дома (вывод)', m: 'He must be at home.' },
      { c: 'это не может быть правдой', m: "That can't be true." },
      { c: 'возможно, они заняты', m: 'They might be busy.' },
      { c: 'свет горит — наверняка кто-то дома', m: 'The light is on. Somebody must be at home.' }
    ],
    tasks: [
      { p: 'Ты видишь незнакомую машину у дома соседа. Выскажи три предположения.', m: 'It must be his brother. It might be a friend. It can\'t be a delivery.' },
      { p: 'Друг не отвечает на звонки весь день. Сделай выводы.', m: "He must be busy. He might be sleeping. He can't be at work today." }
    ]
  });
  def('mu-39', {
    say: ['If I knew, I would tell you.', 'If I had more time, I would learn Spanish.', 'I wish I had more time.', 'I wish I were taller.'],
    subs: [
      { c: 'если бы у меня были деньги — я бы поехал(а)', m: 'If I had money, I would travel.' },
      { c: 'жаль, что я не живу у моря', m: 'I wish I lived near the sea.' },
      { c: 'если бы она знала — она бы сказала', m: 'If she knew, she would tell us.' },
      { c: 'жаль, что у меня нет машины', m: 'I wish I had a car.' }
    ],
    tasks: [
      { p: 'Что бы ты сделал(а), если бы выиграл(а) миллион? (3 предложения)', m: 'If I won a million, I would buy a house. I would travel around the world. I would help my family.' },
      { p: 'Назови три вещи, о которых ты сожалеешь в настоящем (I wish…).', m: 'I wish I had more free time. I wish I spoke English better. I wish I lived closer to work.' }
    ]
  });
  def('mu-40', {
    say: ['If I had studied harder, I would have passed the exam.', 'If she had left earlier, she would have caught the train.', "We wouldn't have been late if we had taken a taxi.", 'If it hadn\'t rained, we would have gone to the park.'],
    subs: [
      { c: 'если бы я проснулся(лась) раньше — я бы не опоздал(а)', m: "If I had woken up earlier, I wouldn't have been late." },
      { c: 'если бы они знали — они бы пришли', m: 'If they had known, they would have come.' },
      { c: 'если бы мы не потеряли ключи — мы бы вошли', m: "If we hadn't lost the keys, we would have got in." },
      { c: 'если бы он спросил — я бы помог(ла)', m: 'If he had asked, I would have helped him.' }
    ],
    tasks: [
      { p: 'Вспомни ошибку из прошлого и скажи, что изменилось бы, если бы ты поступил(а) иначе.', m: 'If I had prepared better, I would have passed the test. I would have been happier.' },
      { p: 'Расскажи о хорошем решении и что было бы, если бы ты его не принял(а).', m: "If I hadn't moved to this city, I wouldn't have met my friends." }
    ]
  });
  def('mu-43', {
    say: ['The room is cleaned every day.', 'The bridge was built in 1990.', 'The report has been finished.', 'English is spoken all over the world.'],
    subs: [
      { c: 'этот дом построили в 1950 году', m: 'This house was built in 1950.' },
      { c: 'письма отправляют каждый день', m: 'Letters are sent every day.' },
      { c: 'машину уже починили', m: 'The car has already been repaired.' },
      { c: 'завтра меня встретят в аэропорту', m: 'I will be met at the airport tomorrow.' }
    ],
    tasks: [
      { p: 'Расскажи, что делают в твоей стране или городе и чем он известен (пассив, 3 предложения).', m: 'Tea is drunk every day. A lot of cars are made here. The city is visited by many tourists.' },
      { p: 'Опиши, что уже было сделано в твоём доме или на работе за неделю.', m: 'The kitchen has been painted. The windows have been cleaned. The old sofa was sold.' }
    ]
  });
  def('mu-47', {
    say: ['She asked me where I lived.', 'He asked if I wanted some coffee.', 'The teacher told us to open our books.', 'She asked me not to be late.'],
    subs: [
      { c: '«Где ты работаешь?» — он спросил', m: 'He asked me where I worked.' },
      { c: '«Ты любишь кофе?» — она спросила', m: 'She asked me if I liked coffee.' },
      { c: '«Закрой дверь», — попросил он', m: 'He asked me to close the door.' },
      { c: '«Не звони поздно», — сказала она', m: 'She told me not to call late.' }
    ],
    tasks: [
      { p: 'Перескажи короткий разговор с другом: о чём он тебя спросил (3 вопроса).', m: 'He asked me how I was. He asked me where I was going. He asked if I wanted to join him.' },
      { p: 'Перескажи просьбы или указания, которые тебе сегодня давали.', m: 'My boss told me to send the report. She asked me to call the client.' }
    ]
  });
  def('mu-56', {
    say: ['I remember locking the door.', "Remember to lock the door when you leave.", 'He stopped smoking last year.', 'We stopped to buy some water.'],
    subs: [
      { c: 'я помню, как был(а) там (помню сам факт)', m: 'I remember being there.' },
      { c: 'не забудь позвонить маме', m: "Don't forget to call your mother." },
      { c: 'она перестала курить', m: 'She stopped smoking.' },
      { c: 'мы остановились, чтобы отдохнуть', m: 'We stopped to rest.' }
    ],
    tasks: [
      { p: 'Расскажи, что ты помнишь из детства (remember + -ing, 3 предложения).', m: 'I remember playing in the yard. I remember going to school with my sister. I remember eating ice cream in summer.' },
      { p: 'Что ты должен(на) не забыть сделать завтра? (remember / forget to)', m: "I must remember to buy bread. I mustn't forget to send the email." }
    ]
  });
  def('mu-61', {
    say: ["I'm used to getting up early.", "I'm getting used to the cold.", 'It took me a long time to get used to driving on the left.', "She isn't used to working at night."],
    subs: [
      { c: 'я привык(ла) жить один/одна', m: "I'm used to living alone." },
      { c: 'он привыкает к новой работе', m: "He's getting used to his new job." },
      { c: 'мы не привыкли к жаре', m: "We aren't used to the heat." },
      { c: 'мне было трудно привыкнуть к шуму', m: 'It was hard to get used to the noise.' }
    ],
    tasks: [
      { p: 'К чему ты уже привык(ла) в своём городе, а к чему нет? (3 предложения)', m: "I'm used to the traffic. I'm used to getting up early. I'm not used to the cold winters." },
      { p: 'Расскажи о чём-то новом в твоей жизни, к чему ты сейчас привыкаешь.', m: "I'm getting used to my new schedule. I'm getting used to speaking English every day." }
    ]
  });
  def('mu-95', {
    say: ['My brother, who lives in Paris, is a doctor.', 'Anna, whose husband is a pilot, works here.', 'This book, which I bought yesterday, is great.', 'We stayed in Rome, which is a beautiful city.'],
    subs: [
      { c: 'моя сестра — она живёт в Лондоне — врач', m: 'My sister, who lives in London, is a doctor.' },
      { c: 'этот фильм — я смотрел(а) его вчера — отличный', m: 'This film, which I watched yesterday, is great.' },
      { c: 'Том — его мама учительница — мой друг', m: 'Tom, whose mother is a teacher, is my friend.' },
      { c: 'мы были в Алматы — это большой город', m: 'We were in Almaty, which is a big city.' }
    ],
    tasks: [
      { p: 'Расскажи о двух близких людях, добавив к каждому дополнительную информацию (who / whose).', m: 'My mother, who is a nurse, works a lot. My friend Dana, whose brother lives in Berlin, loves travelling.' },
      { p: 'Расскажи о своём городе и о каком-то месте в нём (which).', m: 'I live in Astana, which is the capital. Baiterek, which is in the centre, is famous.' }
    ]
  });
  def('mu-113', {
    say: ['Although it was cold, we went swimming.', 'In spite of the rain, we went out.', 'Despite being tired, she kept working.', 'He was happy even though he had lost.'],
    subs: [
      { c: 'хотя я устал(а) — я пошёл/пошла', m: 'Although I was tired, I went.' },
      { c: 'несмотря на дождь — мы гуляли', m: 'Despite the rain, we walked.' },
      { c: 'хотя она богата — она не счастлива', m: "Although she is rich, she isn't happy." },
      { c: 'несмотря на то что он болен — он работает', m: 'In spite of being ill, he works.' }
    ],
    tasks: [
      { p: 'Расскажи о случае, когда тебе было трудно, но ты всё равно справился(лась).', m: 'Although it was difficult, I finished the course. Despite being busy, I studied every day.' },
      { p: 'Назови три вещи, которые ты делаешь, хотя они тебе не нравятся.', m: "Although I don't like the gym, I go there. Despite the early start, I get up at six." }
    ]
  });
})();
