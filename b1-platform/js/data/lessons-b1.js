(function () {
  const { gap, mc, ord, L } = JP;

  L('mu-9', 'B1', `
<p><b>Present Perfect Continuous</b>: <b>have / has been + глагол-ing</b>. Действие началось в прошлом и <b>продолжается</b> до сейчас — или только что закончилось, и виден результат.</p>
<p><q>I've been waiting here for an hour.</q> <q>Why are your eyes red? — I've been crying.</q> <q>How long have you been learning English?</q></p>
<p><b>Continuous</b> — важен процесс, длительность. <b>Simple</b> — важен результат или количество: <q>I've read three books this month.</q></p>`, [
    gap('I ___ (wait) here for an hour.', 'have been waiting'),
    gap("She's tired because she ___ (work) all day.", 'has been working'),
    mc('How long have you ___ English?', ['learned', 'been learning', 'learn'], 1),
    mc('Her eyes are red. She ___.', ['cries', 'has been crying', 'is cry'], 1),
    gap('It ___ (rain) since morning.', 'has been raining'),
    ord('I have been studying for three hours.'),
    mc('I ___ three books this month.', ['have been reading', 'have read', 'read'], 1, 'Называем количество (три книги) — Present Perfect Simple.'),
    gap('They ___ (not / sleep) well recently.', "haven't been sleeping|have not been sleeping")
  ], 'Напиши 4 предложения о том, что ты делаешь давно: I have been… for/since…');

  L('mu-15', 'B1', `
<p><b>Past Perfect</b>: <b>had + 3-я форма</b>. Действие произошло <b>раньше</b> другого действия в прошлом.</p>
<p><q>When we arrived, the film had already started.</q> (сначала фильм начался, потом мы пришли) <q>She said she had seen it before.</q></p>
<p>Помогают слова: <i>already, before, after, by the time, never … before</i>.</p>`, [
    mc('When we arrived, the film ___ already started.', ['has', 'had', 'was'], 1),
    gap('I was late. The train ___ (leave) already.', 'had left'),
    mc('She was sad because she ___ her keys.', ['had lost', 'has lost', 'loses'], 0),
    gap('They ___ (not / eat) before they came.', "hadn't eaten|had not eaten"),
    ord('He told me he had seen that film.'),
    mc('After he ___ dinner, he watched TV.', ['had eaten', 'has eaten', 'eats'], 0),
    gap("I didn't know him because I ___ (never / meet) him before.", 'had never met'),
    mc('Which is correct?', ['When I arrived, she already left.', 'When I arrived, she had already left.', 'When I arrived, she has already left.'], 1)
  ], 'Напиши 4 предложения: «Когда я пришла/приехала, … уже …» (Past Perfect).');

  L('mu-24', 'B1', `
<p><b>will be + глагол-ing</b> — действие будет <b>в процессе</b> в определённый момент в будущем: <q>This time tomorrow I'll be flying to Paris.</q> <q>Don't call at 7. I'll be cooking.</q></p>
<p><b>will have + 3-я форма</b> — действие будет <b>завершено</b> к определённому моменту: <q>By Friday I will have finished the report.</q> <q>By 2030 I'll have learned English well.</q></p>`, [
    gap("This time tomorrow I ___ (fly) to Paris.", "will be flying|'ll be flying"),
    gap('By Friday I ___ (finish) the report.', "will have finished|'ll have finished"),
    mc('By the time you arrive, I ___ dinner.', ['will cook', 'will have cooked', 'am cooking'], 1),
    mc("Don't phone at 7. I ___ dinner.", ['will cook', 'will be cooking', 'will have cooked'], 1),
    ord('I will be working at eight.'),
    gap('By 2030 I ___ (learn) English well.', "will have learned|'ll have learned|will have learnt|'ll have learnt"),
    gap("In two years' time she ___ (graduate) from university.", "will have graduated|'ll have graduated"),
    mc('This time next week I ___ on the beach.', ['lie', 'will be lying', 'will have lain'], 1)
  ]);

  L('mu-28', 'B1', `
<p>Логический вывод: <b>must</b> — «наверняка да», <b>can't</b> — «наверняка нет», <b>might</b> — «возможно».</p>
<p><q>He has worked 12 hours. He must be tired.</q> <q>That can't be Tom. He's in Spain.</q></p>
<p>О прошлом: <b>must have + 3-я форма</b>, <b>can't have + 3-я форма</b>: <q>She must have left already.</q> <q>He can't have seen me.</q></p>`, [
    mc('He has worked 12 hours. He ___ be tired.', ['must', "can't", 'might'], 0),
    mc("It ___ be Tom. He's in Spain.", ['must', "can't", 'should'], 1),
    gap('The lights are on. They ___ be at home.', 'must'),
    gap('She has just eaten. She ___ be hungry.', "can't|cannot|can not"),
    mc("I can't find my wallet. I ___ left it at home.", ['must have', "can't have", 'must'], 0),
    ord('That must be the answer.'),
    mc('He ___ seen me. I was hidden.', ['must have', "can't have", 'might'], 1),
    gap("You've been walking all day. You ___ be exhausted.", 'must')
  ]);

  L('mu-39', 'B1', `
<p><b>Second conditional</b>: <b>If + Past Simple, would + глагол</b> — нереальная ситуация сейчас: <q>If I knew, I would tell you.</q></p>
<p><b>I wish + Past Simple</b> — сожаление о настоящем: <q>I wish I had more time.</q> <q>I wish I were taller.</q> <q>She wishes she lived in a bigger flat.</q></p>`, [
    mc('I wish I ___ more time.', ['have', 'had', 'will have'], 1),
    gap("If I ___ (know) the answer, I'd tell you.", 'knew'),
    gap('I wish I ___ (be) taller.', 'were|was'),
    mc('She wishes she ___ in a bigger flat.', ['lives', 'lived', 'will live'], 1),
    ord('I wish I could speak French.'),
    gap('If he ___ (have) a car, he would drive to work.', 'had'),
    mc('What would you do if you ___ rich?', ['are', 'were', 'will be'], 1),
    gap('I wish it ___ (be) summer now.', 'were|was')
  ], 'Напиши 4 предложения с I wish… о том, что бы ты хотела изменить в жизни.');

  L('mu-40', 'B1', `
<p><b>Third conditional</b> — нереальное прошлое («если бы тогда… то…»): <b>If + Past Perfect, would have + 3-я форма</b>.</p>
<p><q>If I had studied harder, I would have passed the exam.</q> (но я не училась и не сдала)</p>
<p><b>I wish I had + 3-я форма</b> — сожаление о прошлом: <q>I wish I had known.</q> Нельзя: ~~If I would have known~~.</p>`, [
    mc('If I ___ harder, I would have passed the exam.', ['studied', 'had studied', 'would study'], 1),
    gap('If she had left earlier, she ___ the train. (catch)', 'would have caught'),
    gap('If we ___ (not / miss) the bus, we would have been on time.', "hadn't missed|had not missed"),
    ord('If I had known, I would have helped.'),
    mc('I wish I ___ you before.', ['met', 'had met', 'meet'], 1),
    gap('He would have won if he ___ (run) faster.', 'had run'),
    mc('Which is correct?', ['If I would have known, I would have come.', 'If I had known, I would have come.', 'If I knew, I would have come.'], 1),
    gap("If it hadn't rained, we ___ (go) to the beach.", 'would have gone')
  ]);

  L('mu-43', 'B1', `
<p>Пассив в разных временах: <b>be</b> меняет форму, глагол остаётся в 3-й форме.</p>
<table class="t"><tr><th>Время</th><th>Пример</th></tr>
<tr><td>Present Continuous</td><td>The road <b>is being repaired</b>.</td></tr>
<tr><td>Past Continuous</td><td>The house <b>was being painted</b>.</td></tr>
<tr><td>Present Perfect</td><td>The work <b>has been finished</b>.</td></tr>
<tr><td>will</td><td>It <b>will be done</b> tomorrow.</td></tr>
<tr><td>can / must</td><td>It <b>can be solved</b>. It <b>must be done</b>.</td></tr></table>`, [
    gap('The road ___ (repair) at the moment.', 'is being repaired'),
    gap('My phone ___ (steal) yesterday.', 'was stolen'),
    gap('The work has ___ (finish) already.', 'been finished'),
    mc('The report must ___ by Friday.', ['finish', 'be finished', 'finished'], 1),
    gap('This problem can ___ (solve) easily.', 'be solved'),
    ord('The windows have been cleaned.'),
    mc('The new bridge ___ next year.', ['will build', 'will be built', 'is building'], 1),
    mc('The house ___ when we arrived.', ['was painting', 'was being painted', 'painted'], 1)
  ]);

  L('mu-47', 'B1', `
<p><b>Косвенная речь: вопросы и просьбы</b>.</p>
<ul><li>Вопросы с вопросительным словом: порядок слов как в утверждении, время «назад»: <q>“Where do you live?”</q> → <q>She asked me where I <b>lived</b>.</q></li>
<li>Вопросы да/нет: <b>if / whether</b>: <q>“Are you tired?”</q> → <q>He asked if I <b>was</b> tired.</q></li>
<li>Просьбы и приказы: <b>told / asked + кого + to + глагол</b>: <q>“Close the door.”</q> → <q>She told me <b>to close</b> the door.</q> Отрицание: <q>He told us <b>not to be</b> late.</q></li></ul>`, [
    mc('“Where do you live?” → She asked me where I ___.', ['live', 'lived', 'did live'], 1),
    mc('“Are you tired?” → He asked ___ I was tired.', ['that', 'if', 'what'], 1),
    gap('“Close the door.” → She told me ___ close the door.', 'to'),
    gap("“Don't be late.” → He told us ___ to be late.", 'not'),
    ord('She asked me where I worked.'),
    mc('“What are you doing?” → He asked me what I ___.', ['am doing', 'was doing', 'did do'], 1),
    gap('“Can you swim?” → She asked me ___ I could swim.', 'if|whether'),
    mc('Which is correct?', ['He asked me where did I live.', 'He asked me where I lived.', 'He asked me where I live did.'], 1)
  ]);

  L('mu-56', 'B1', `
<p>Некоторые глаголы меняют смысл в зависимости от формы после них:</p>
<table class="t"><tr><th>+ to do</th><th>+ doing</th></tr>
<tr><td>remember <b>to lock</b> — не забыть запереть</td><td>remember <b>locking</b> — помнить, как запирала</td></tr>
<tr><td>forget <b>to buy</b> — забыть купить</td><td>forget <b>seeing</b> — забыть, что видела</td></tr>
<tr><td>stop <b>to buy</b> — остановиться, чтобы купить</td><td>stop <b>working</b> — прекратить работать</td></tr>
<tr><td>try <b>to open</b> — пытаться</td><td>try <b>opening</b> — попробовать (как эксперимент)</td></tr></table>`, [
    mc('Remember ___ the door when you leave.', ['locking', 'to lock', 'lock'], 1),
    mc('I remember ___ him at the party last year.', ['meeting', 'to meet', 'meet'], 0),
    mc('He stopped ___ because he was tired.', ['working', 'to work', 'work'], 0),
    mc('We stopped ___ some water.', ['buying', 'to buy', 'buy'], 1),
    gap('I forgot ___ (buy) milk, so we have none.', 'to buy'),
    mc('Try ___ the window if you are too hot.', ['to open', 'opening', 'open'], 1),
    ord("Don't forget to call me."),
    gap("I'll never forget ___ (see) the Eiffel Tower for the first time.", 'seeing')
  ]);

  L('mu-61', 'B1', `
<p><b>be used to + -ing / существительное</b> — «привыкла, для меня это привычно»: <q>I'm used to getting up early.</q></p>
<p><b>get used to</b> — «привыкать»: <q>I'm getting used to the cold.</q> <q>It took me a long time to get used to driving on the left.</q></p>
<p><b>used to + глагол</b> — «раньше (но больше нет)»: <q>I used to live in the country.</q> Это три разные конструкции!</p>`, [
    mc("I'm not used to ___ up early.", ['get', 'getting', 'got'], 1),
    mc('She is used to ___ in a big city.', ['live', 'living', 'lived'], 1),
    gap('It took me a long time to get used to ___ (drive) on the left.', 'driving'),
    mc('I ___ to live in the country. Now I live in London.', ['used', 'am used', 'get used'], 0),
    mc('He ___ the cold weather now.', ['is used to', 'used to', 'use to'], 0),
    ord('I am getting used to this city.'),
    gap("We aren't used ___ spicy food.", 'to'),
    mc('Which sentence means «раньше»?', ['I used to play tennis.', 'I am used to playing tennis.', 'I got used to tennis.'], 0)
  ]);

  L('mu-95', 'B1', `
<p><b>Придаточные с дополнительной информацией</b> выделяются запятыми и не определяют, о ком речь: <q>My brother, who lives in Paris, is a doctor.</q> <q>Paris, which is the capital of France, is beautiful.</q></p>
<p>Здесь <b>that</b> использовать нельзя, и слово <b>who / which</b> опускать нельзя. <b>whose</b> — «чей»: <q>Anna, whose husband is a pilot, works here.</q> <b>which</b> может относиться ко всей фразе: <q>He was late, which annoyed me.</q></p>`, [
    mc('My sister, ___ lives in London, is a nurse.', ['that', 'who', 'which'], 1),
    mc('This book, ___ I bought yesterday, is great.', ['that', 'which', 'who'], 1),
    gap('Paris, ___ is the capital of France, is beautiful.', 'which'),
    ord('My brother, who is a doctor, lives in Rome.'),
    mc('Which sentence is correct?', ['My car, that is red, is new.', 'My car, which is red, is new.', 'My car which, is red, is new.'], 1),
    gap('Anna, ___ husband is a pilot, works here.', 'whose'),
    gap('He was late, ___ annoyed me.', 'which'),
    mc('Tokyo, ___ I visited last year, is huge.', ['where', 'which', 'that'], 1)
  ]);

  L('mu-113', 'B1', `
<p><b>although / though</b> + подлежащее и глагол: <q>Although it was cold, we went swimming.</q></p>
<p><b>in spite of / despite</b> + существительное или -ing: <q>In spite of the rain, we went out.</q> <q>Despite being tired, she kept working.</q> Нельзя: ~~despite of~~, ~~despite it was late~~.</p>
<p>Смысл один — «хотя, несмотря на»: что-то неожиданное, контраст.</p>`, [
    mc('___ it was cold, we went swimming.', ['Although', 'Despite', 'Because'], 0),
    mc('We went out ___ the rain.', ['although', 'in spite of', 'though'], 1),
    gap('He is happy ___ he has little money.', 'although|though'),
    mc('___ being tired, she kept working.', ['Although', 'Despite', 'But'], 1),
    ord('Although he was ill, he went to work.'),
    mc('Which is correct?', ['Despite it was late, we stayed.', 'Despite the late hour, we stayed.', 'Although the late hour, we stayed.'], 1),
    gap("She passed the exam ___ she hadn't studied much.", 'although|though'),
    mc('I like him, ___ he sometimes annoys me.', ['although', 'despite', 'in spite'], 0)
  ], 'Напиши 4 предложения с although / despite о чём-то неожиданном в твоей жизни.');
})();
