(function () {
  const { gap, mc, ord, L } = JP;

  L('eg-16', 'A2', `
<p><b>Present Perfect</b>: <b>have / has + 3-я форма глагола</b>. Говорим о прошлом, которое связано с настоящим: важен результат, а не когда это произошло.</p>
<p><q>I've lost my keys.</q> (и сейчас их нет) <q>She has finished her homework.</q> <q>They haven't seen this film.</q></p>
<p>Правильные глаголы: 3-я форма = -ed (worked). Неправильные учим: be → <b>been</b>, go → <b>gone</b>, see → <b>seen</b>, do → <b>done</b>, eat → <b>eaten</b>, write → <b>written</b>, take → <b>taken</b>, break → <b>broken</b>, buy → <b>bought</b>, have → <b>had</b>.</p>`, [
    gap("I ___ (lose) my keys. I can't open the door.", 'have lost'),
    gap('She ___ (finish) her homework.', 'has finished'),
    gap('They ___ (see) this film. (negative)', "haven't seen|have not seen"),
    mc('Tom has ___ his phone.', ['break', 'broke', 'broken'], 2),
    gap('We ___ (eat) all the cake.', 'have eaten'),
    ord('She has written a letter.'),
    mc('Which sentence is correct?', ['I have saw him.', 'I have seen him.', 'I have see him.'], 1),
    gap('My brother ___ (buy) a new car.', 'has bought')
  ]);

  L('eg-17', 'A2', `
<p>Три слова с Present Perfect:</p>
<ul><li><b>just</b> — «только что», стоит между have и 3-й формой: <q>I've just arrived.</q></li>
<li><b>already</b> — «уже»: <q>She has already left.</q></li>
<li><b>yet</b> — «ещё (не)», «уже?» — в конце отрицаний и вопросов: <q>I haven't finished yet.</q> <q>Have you finished yet?</q></li></ul>`, [
    gap("I've ___ eaten. I'm full. (только что)", 'just'),
    gap('"Is Tom here?" "No, he hasn\'t arrived ___."', 'yet'),
    mc('"Do you want lunch?" "No, thanks, I\'ve ___ had lunch."', ['yet', 'already', 'ever'], 1),
    ord('Have you finished your homework yet?'),
    gap("The film hasn't started ___.", 'yet'),
    mc('They have ___ left. (уже)', ['yet', 'already', 'since'], 1),
    gap('Have you cleaned your room ___?', 'yet'),
    ord('I have just seen Tom.')
  ]);

  L('eg-18', 'A2', `
<p><b>Have you ever…?</b> — «Ты когда-нибудь…?» (в течение всей жизни). Ответы: <q>Yes, I have.</q> / <q>No, I haven't.</q> / <q>I've never been to Japan.</q></p>
<p><b>been</b> и <b>gone</b>: <q>She has been to London.</q> (побывала и вернулась) — <q>She has gone to London.</q> (уехала и ещё там).</p>
<p>Часто: <q>It's the best film I've ever seen.</q> <q>It's the first time I've flown.</q></p>`, [
    gap('Have you ___ been to Spain?', 'ever'),
    gap("I've ___ eaten sushi. (никогда)", 'never'),
    mc("She's ___ to London twice.", ['gone', 'been', 'went'], 1, 'been = побывала и вернулась.'),
    ord('Have you ever met a famous person?'),
    gap('"Has he ever played golf?" "No, he ___."', "hasn't|has not"),
    mc('This is the best film I have ever ___.', ['saw', 'see', 'seen'], 2),
    gap("It's the first time I ___ (fly).", 'have flown'),
    gap('How many countries ___ you visited?', 'have')
  ], 'Напиши 4 предложения о том, где ты была и чего никогда не делала (I\'ve been to… I\'ve never…).');

  L('eg-19', 'A2', `
<p>Когда что-то началось в прошлом и <b>продолжается сейчас</b>, русский говорит в настоящем («Я живу здесь 5 лет»), а английский — в <b>Present Perfect</b>: <q>I have lived here for five years.</q></p>
<p><q>How long have you known Anna?</q> <q>She has been married for ten years.</q></p>
<p>Нельзя: ~~I live here for five years~~.</p>`, [
    mc('I ___ here since 2020.', ['live', 'am living', 'have lived'], 2),
    gap('How long ___ you known Anna?', 'have'),
    mc('She ___ married for ten years.', ['is', 'has been', 'was'], 1),
    gap('They ___ (be) friends since school.', 'have been'),
    ord('How long have you worked here?'),
    gap('He ___ (have) this car for two years.', 'has had'),
    mc('I have known him ___ a long time.', ['for', 'since', 'ago'], 0),
    gap('We ___ (not / see) each other for ages.', "haven't seen|have not seen")
  ]);

  L('eg-20', 'A2', `
<table class="t"><tr><th>Слово</th><th>Значение</th><th>Пример</th></tr>
<tr><td><b>for</b></td><td>длительность</td><td>for two years, for a week, for ages</td></tr>
<tr><td><b>since</b></td><td>точка начала</td><td>since 2019, since Monday, since I was a child</td></tr>
<tr><td><b>ago</b></td><td>назад (с Past Simple)</td><td>three years ago, an hour ago</td></tr></table>
<p><q>I have lived here for ten years.</q> = <q>I have lived here since 2015.</q> = <q>I came here ten years ago.</q></p>`, [
    gap('I have lived here ___ ten years.', 'for'),
    gap('She has worked here ___ 2018.', 'since'),
    gap('I met him two years ___.', 'ago'),
    mc('We have been friends ___ a long time.', ['since', 'for', 'ago'], 1),
    mc('They have been married ___ June.', ['since', 'for', 'ago'], 0),
    mc('He left the house an hour ___.', ['for', 'since', 'ago'], 2),
    gap('It has been raining ___ this morning.', 'since'),
    gap('Tom has been ill ___ three days.', 'for')
  ]);

  L('eg-21', 'A2', `
<p><b>Past Simple</b> — время в прошлом названо или понятно: <i>yesterday, last week, in 2010, when…</i> → <q>I lost my keys yesterday.</q></p>
<p><b>Present Perfect</b> — время не названо, или период ещё не закончился: <i>ever, never, already, just, today, this week</i> → <q>I've lost my keys.</q> <q>Have you seen Tom today?</q></p>
<p>Вопрос «Когда?» (<q>When did you…?</q>) всегда в Past Simple.</p>`, [
    mc('I ___ to Paris last year.', ['have been', 'went', 'have gone'], 1),
    mc('Have you ever ___ sushi?', ['eat', 'ate', 'eaten'], 2),
    gap('She ___ (visit) us yesterday.', 'visited'),
    gap('I ___ (not / finish) my report yet.', "haven't finished|have not finished"),
    mc('When ___ you buy that jacket?', ['did', 'have', 'do'], 0),
    gap('We ___ (move) here in 2015.', 'moved'),
    mc('He ___ his arm last summer.', ['has broken', 'broke', 'breaks'], 1),
    ord('I have never seen snow.')
  ]);

  L('eg-22', 'A2', `
<p><b>Пассив (страдательный залог)</b> — когда важно действие или результат, а не кто его сделал. Форма: <b>be + 3-я форма глагола</b>.</p>
<p>Настоящее: <q>English is spoken all over the world.</q> Прошедшее: <q>The bridge was built in 1990.</q> Исполнитель (если нужен): <b>by</b> — <q>The book was written by Orwell.</q></p>`, [
    gap('This car ___ (make) in Germany.', 'is made'),
    gap('The window ___ (break) last night.', 'was broken'),
    mc('These books ___ in many countries.', ['sell', 'are sold', 'is sold'], 1),
    gap('Many languages ___ (speak) in India.', 'are spoken'),
    ord('The room is cleaned every day.'),
    mc('The letters ___ yesterday.', ['were sent', 'are sent', 'sent'], 0),
    gap('This house ___ (build) in 1950.', 'was built'),
    mc('"They built this church in 1800." →', ['This church built in 1800.', 'This church was built in 1800.', 'This church is built in 1800.'], 1)
  ]);

  L('eg-26', 'A2', `
<p>О запланированном будущем (договорились, купили билет) говорим в <b>Present Continuous</b>: <q>I'm meeting Anna tomorrow.</q> <q>What are you doing this weekend?</q></p>
<p>О расписаниях (поезда, фильмы, магазины) — <b>Present Simple</b>: <q>The train leaves at 6.15.</q> <q>The shop opens at nine.</q></p>`, [
    gap('I ___ (meet) Anna tomorrow evening.', 'am meeting'),
    gap('What ___ you doing this weekend?', 'are'),
    gap('The shop ___ (open) at nine tomorrow. (timetable)', 'opens', 'Расписание — Present Simple.'),
    gap("We ___ (not / go) out tonight. We're staying at home.", "aren't going|are not going"),
    ord('I am working on Saturday.'),
    mc("Sorry, I can't come. I ___ the dentist at 5.", ['see', 'am seeing', 'saw'], 1),
    gap('Are you ___ anything on Sunday?', 'doing'),
    mc('The film ___ at 8 o\'clock. (cinema programme)', ['starts', 'is start', 'starting'], 0)
  ]);

  L('eg-27', 'A2', `
<p><b>be going to + глагол</b> — планы и намерения (решили заранее) и предсказание по очевидным признакам.</p>
<p><q>I'm going to learn Spanish next year.</q> <q>Look at those clouds! It's going to rain.</q> <q>What are you going to do tonight?</q></p>`, [
    gap('I ___ going to learn Spanish next year.', 'am'),
    gap("Look at the sky! It's ___ to rain.", 'going'),
    mc('What ___ you going to do tonight?', ['are', 'do', 'will'], 0),
    gap('She ___ going to buy a car. She has saved a lot of money.', 'is'),
    ord('We are going to visit our friends.'),
    mc('Be careful! You ___ fall.', ['will', 'are going to', 'go to'], 1),
    gap('They ___ not going to move.', 'are'),
    gap('Is he going ___ come?', 'to')
  ], 'Напиши 4 предложения о своих планах на ближайший месяц (I\'m going to…).');

  L('eg-28', 'A2', `
<p><b>will + глагол</b> — решение в момент речи, обещание, предложение помощи, предсказание. <q>I'll help you.</q> <q>I'll call you tomorrow.</q> <q>I think it will rain.</q></p>
<p>Отрицание: <b>won't</b> (will not). <b>Shall I…? / Shall we…?</b> — предложение: <q>Shall I open the window?</q> <q>Where shall we meet?</q></p>`, [
    gap('"I can\'t open the door." "I ___ help you."', 'will'),
    mc('"It\'s cold." "OK, I ___ close the window."', ['will', 'am going to', 'close'], 0),
    gap('___ I open the window?', 'Shall'),
    gap('I promise I ___ (not / tell) anyone.', "won't tell|will not tell"),
    ord('I will call you tomorrow.'),
    mc('Where ___ we meet?', ['shall', 'are', 'does'], 0),
    gap("Don't worry, I ___ be late.", "won't|will not"),
    mc('Which is correct?', ['I will to help you.', 'I will helping you.', 'I will help you.'], 2)
  ]);

  L('eg-30', 'A2', `
<p><b>might + глагол</b> — «возможно, может быть» (не уверена). <q>It might rain.</q> <q>I might go out tonight.</q> <q>She might not come.</q></p>
<p>Нельзя: ~~might to go~~, ~~mights~~. После might — глагол без to.</p>`, [
    mc('Take an umbrella. It ___ rain.', ['might', 'must', 'is'], 0),
    gap("I'm not sure. I ___ go to the party.", 'might'),
    gap('He ___ be at home. Call him.', 'might'),
    mc("She ___ come. I'm not sure.", ['might to', 'might', 'mights'], 1),
    ord('We might go to the beach.'),
    gap("They ___ not like it. (возможно, не понравится)", 'might'),
    mc("\"What are you doing tonight?\" \"I don't know. I ___ stay at home.\"", ['might', 'am', 'will to'], 0),
    gap("It's cloudy. It ___ snow later.", 'might')
  ]);

  L('eg-31', 'A2', `
<p><b>can</b> — умею, могу: <q>She can speak three languages.</q> Отрицание: <b>can't</b> (cannot). <b>could</b> — прошедшее от can (умела раньше) и вежливая просьба: <q>I could swim when I was five.</q> <q>Could you open the window, please?</q></p>
<p>После can / could — глагол без to: <q>I can swim</q> (не ~~I can to swim~~).</p>`, [
    gap('She ___ speak three languages.', 'can'),
    gap('I ___ swim when I was five.', 'could'),
    mc('___ you open the window, please?', ['Could', 'Do', 'Are'], 0),
    gap('Sorry, I ___ come to your party. I am busy.', "can't|cannot|can not"),
    ord('Can I use your phone?'),
    mc('When I was a child, I ___ ride a bike.', ['can', 'could', 'am able'], 1),
    gap('___ you help me with this bag?', 'Can|Could'),
    mc('Which is correct?', ['I can to swim.', 'I can swim.', 'I cans swim.'], 1)
  ]);

  L('eg-32', 'A2', `
<p><b>must</b> — «обязательно нужно» (я сама так считаю): <q>I must finish this today.</q></p>
<p><b>mustn't</b> — «нельзя!»: <q>You mustn't park here.</q></p>
<p><b>don't need to / needn't</b> — «не нужно, не обязательно»: <q>You don't need to come.</q> Внимание: mustn't ≠ don't need to!</p>`, [
    gap("You ___ park here. It's forbidden.", "mustn't|must not"),
    gap('You ___ come early. The meeting is at 10. (не нужно)', "don't need to|needn't|do not need to|need not"),
    mc('I ___ finish this today. It is very important.', ['must', "mustn't", "don't need"], 0),
    mc('Passengers ___ use phones during take-off.', ["mustn't", "don't need to", "needn't to"], 0),
    ord("You mustn't be late."),
    mc('"Shall I bring food?" "No, you ___. We have plenty."', ["mustn't", "don't need to", 'must'], 1),
    gap('We ___ hurry. We have lots of time.', "don't need to|needn't|do not need to"),
    gap('Children ___ play near the road.', "mustn't|must not")
  ]);

  L('eg-33', 'A2', `
<p><b>should + глагол</b> — совет, мнение «стоит, следует». <q>You look tired. You should go to bed.</q> <q>You shouldn't eat so much sugar.</q> <q>Should I call the police?</q></p>
<p>Без to: <q>You should rest</q> (не ~~should to rest~~). Без -s: <q>He should</q>.</p>`, [
    gap('You look tired. You ___ go to bed early.', 'should'),
    gap("You ___ eat so much sugar. It's bad for you.", "shouldn't|should not"),
    mc('___ I call the police?', ['Should', 'Do', 'Am'], 0),
    ord('You should drink more water.'),
    mc('What do you think I ___ do?', ['should', 'shoulds', 'should to'], 0),
    gap("He's got a bad cough. He ___ see a doctor.", 'should'),
    mc('Which is correct?', ['You should to rest.', 'You should rest.', 'You shoulds rest.'], 1),
    gap('I think you ___ study harder.', 'should')
  ]);

  L('eg-34', 'A2', `
<p><b>have to</b> — «приходится, обязана» (требование извне: правило, закон, обстоятельства). <q>I have to wear a uniform.</q> <q>He has to get up early.</q></p>
<p>Вопрос и отрицание — с do: <q>Do you have to go?</q> <q>She doesn't have to work.</q> (не обязана). Прошлое: <b>had to</b>: <q>I had to leave early.</q></p>`, [
    gap('She ___ to work on Saturdays.', 'has'),
    gap('We ___ to wear uniforms at school.', 'have'),
    gap('You ___ have to pay. It is free.', "don't|do not"),
    mc('___ you have to get up early?', ['Do', 'Does', 'Have'], 0),
    gap('I ___ to leave early yesterday.', 'had'),
    ord('Do you have to go now?'),
    mc('He ___ to wear a tie. It is the rule.', ['has', 'have', 'having'], 0),
    gap('___ she have to work tomorrow?', 'Does')
  ]);

  L('eg-35', 'A2', `
<p><b>Would you like…?</b> — вежливое предложение: <q>Would you like a coffee?</q> <q>Would you like to come with us?</q></p>
<p><b>I'd like…</b> (= I would like) — вежливо «хотела бы»: <q>I'd like a table for two, please.</q> <q>I'd like to book a room.</q></p>
<p>Не путай: <b>Do you like…?</b> — «Тебе нравится…?» (вообще), <b>Would you like…?</b> — «Хочешь…?» (сейчас).</p>`, [
    gap('___ you like some tea?', 'Would'),
    gap('I ___ like a coffee, please.', "would|'d"),
    mc('___ you like to come with us?', ['Do', 'Would', 'Are'], 1),
    ord('I would like a table for two.'),
    mc('What ___ you like to drink?', ['would', 'do', 'are'], 0),
    gap('"Would you like some cake?" "Yes, ___."', 'please'),
    mc('Which is correct?', ['I would like go.', 'I would like to go.', 'I would liking to go.'], 1),
    gap("I'd ___ to see the menu, please.", 'like')
  ]);

  L('eg-37', 'A2', `
<p><b>used to + глагол</b> — то, что было в прошлом регулярно или постоянно, но сейчас закончилось. <q>I used to smoke.</q> (теперь не курю) <q>We used to live in Paris.</q></p>
<p>Отрицание и вопрос — <b>did</b> + <b>use to</b> (без -d!): <q>I didn't use to like fish.</q> <q>Did you use to have a dog?</q></p>`, [
    gap('I ___ to live in Paris, but now I live in Rome.', 'used'),
    gap("She didn't ___ to like fish.", 'use'),
    mc('We ___ to play football every day.', ['used', 'use', 'were used'], 0),
    mc('Did you ___ to have a dog?', ['use', 'used', 'using'], 0),
    ord('He used to work in a bank.'),
    gap('There ___ to be a cinema here.', 'used'),
    mc('Which is correct?', ['I used to smoking.', 'I used to smoke.', 'I use to smoked.'], 1),
    gap('When I was a child, I ___ to be afraid of the dark.', 'used')
  ], 'Напиши 4 предложения о том, как ты жила раньше, а теперь всё иначе (I used to…).');
})();
