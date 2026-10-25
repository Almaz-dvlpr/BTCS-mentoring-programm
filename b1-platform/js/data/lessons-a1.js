(function () {
  const { gap, mc, ord, L } = JP;

  L('eg-1', 'A1', `
<p>Глагол <b>to be</b> («быть») в настоящем времени. В английском предложении глагол нужен всегда: русское «Я студентка» — это <q>I am a student.</q></p>
<table class="t"><tr><th>Кто</th><th>Глагол</th><th>Кратко</th></tr>
<tr><td>I</td><td>am</td><td>I'm</td></tr>
<tr><td>he / she / it</td><td>is</td><td>he's / she's / it's</td></tr>
<tr><td>we / you / they</td><td>are</td><td>we're / you're / they're</td></tr></table>
<p>Отрицание — добавь <b>not</b>: <q>She is not (isn't) at home.</q> <q>I'm not tired.</q> Обрати внимание: <b>I amn't</b> не существует.</p>`, [
    gap('My name ___ Anna.', 'is', 'С he / she / it и с именем — is.'),
    gap('We ___ at home now.', 'are'),
    mc('They ___ my friends.', ['is', 'am', 'are'], 2),
    gap('Short form: <b>I am</b> → ___', "I'm|I am"),
    gap('The shops ___ open on Sunday. (negative)', "are not|aren't"),
    mc('___ is my brother.', ['He', 'They', 'I'], 0, 'He is — а с They нужно are, с I нужно am.'),
    ord('He is not at work.'),
    gap('It ___ cold today.', 'is')
  ], 'Напиши 3 предложения о себе: My name is… I am… I am from…');

  L('eg-2', 'A1', `
<p>В вопросе глагол <b>to be</b> выходит вперёд, перед подлежащим: <q>He is tired.</q> → <q>Is he tired?</q></p>
<p>Вопросы с вопросительным словом: <q>Where are you?</q> <q>What is this?</q> <q>Who is your teacher?</q></p>
<p>Краткие ответы: <q>Yes, I am.</q> <q>No, he isn't.</q> В утвердительном кратком ответе <b>нельзя</b> сокращать: Yes, <b>it is</b> (не Yes, it's).</p>`, [
    ord('Are you a student?'),
    gap('___ she at home? – Yes, she is.', 'Is'),
    mc('Where ___ your parents?', ['is', 'are', 'am'], 1),
    gap("'Are you tired?' – 'No, I ___.'", "am not|'m not"),
    gap('___ is your teacher? – Mr Brown.', 'Who'),
    gap('___ are the keys? – They are on the table.', 'Where'),
    mc('"Is it a good film?" "Yes, ___."', ["it's", 'it is', 'it be'], 1, 'В кратком утвердительном ответе — полная форма: it is.'),
    ord('Where is the station?')
  ]);

  L('eg-4', 'A1', `
<p><b>Present Continuous</b> — действие происходит <b>сейчас</b> или в этот период. Форма: <b>am / is / are + глагол-ing</b>.</p>
<p><q>I am reading a book.</q> <q>She is cooking dinner.</q> <q>They are watching TV.</q></p>
<p>Орфография: write → writ<b>ing</b> (убираем -e), run → ru<b>nn</b>ing (удваиваем), play → playing. Отрицание: <q>I'm not working.</q> Слова-подсказки: now, at the moment, today, Look!, Listen!</p>`, [
    gap('Look! It ___ (rain).', 'is raining'),
    gap('I ___ (not / watch) TV now.', "am not watching|'m not watching"),
    mc('Be quiet! The baby ___.', ['sleeps', 'is sleeping', 'sleeping'], 1),
    gap('They ___ (run) in the park.', 'are running', 'run → running (удваиваем n).'),
    gap('She ___ (make) dinner at the moment.', 'is making', 'make → making (убираем -e).'),
    ord('We are waiting for the bus.'),
    mc('Right now Anna ___ an email.', ['write', 'is writing', 'is writeing'], 1),
    gap('The children ___ (play) in the garden.', 'are playing')
  ], 'Опиши, что происходит вокруг тебя прямо сейчас: 3–4 предложения (I am… / My phone is…).');

  L('eg-5', 'A1', `
<p>Вопрос в Present Continuous: <b>Am / Is / Are + подлежащее + глагол-ing?</b></p>
<p><q>Are you listening?</q> <q>Is she working today?</q> <q>What are you doing?</q> <q>Where is he going?</q></p>
<p>Краткие ответы: <q>Yes, I am.</q> / <q>No, they aren't.</q></p>`, [
    gap('___ you listening to me?', 'Are'),
    ord('What are you doing?'),
    gap('Where ___ they going?', 'are'),
    mc('___ she working today?', ['Is', 'Does', 'Are'], 0),
    gap('Why ___ he laughing?', 'is'),
    ord('Is it raining now?'),
    gap('"Are they watching TV?" "No, they ___."', "aren't|are not"),
    mc('Who ___ you talking to?', ['are', 'do', 'is'], 0)
  ]);

  L('eg-6', 'A1', `
<p><b>Present Simple</b> — привычки, регулярные действия, факты. Слова-подсказки: always, usually, often, sometimes, never, every day.</p>
<p>I / you / we / they + глагол: <q>I work in a bank.</q> <b>He / she / it + глагол-s</b>: <q>She works in a bank.</q></p>
<p>Окончания: watch → watch<b>es</b>, study → stud<b>ies</b>, go → go<b>es</b>, have → <b>has</b>.</p>`, [
    gap('She ___ (work) in a bank.', 'works'),
    gap('My brother ___ (watch) football every weekend.', 'watches', 'После -ch / -sh / -s / -x добавляем -es.'),
    gap('They ___ (live) in London.', 'live'),
    gap('He ___ (study) English on Mondays.', 'studies', 'Согласная + y → ies.'),
    mc('Water ___ at 100 degrees.', ['boil', 'boils', 'boiling'], 1),
    gap('Anna ___ (have) breakfast at 7.', 'has'),
    ord('I usually get up at seven.'),
    mc('My parents ___ in the evening.', ['relaxes', 'relax', 'relaxing'], 1)
  ], 'Напиши 4–5 предложений о своём обычном дне. Используй usually / always / sometimes.');

  L('eg-7', 'A1', `
<p>Отрицание в Present Simple: <b>don't</b> (I, you, we, they) и <b>doesn't</b> (he, she, it) + глагол в <b>начальной форме</b>.</p>
<p><q>I don't like coffee.</q> <q>She doesn't like coffee.</q> — после doesn't окончание -s пропадает: ~~She doesn't likes~~.</p>`, [
    gap('He ___ (not / like) coffee.', "doesn't like|does not like"),
    gap('I ___ (not / understand) this word.', "don't understand|do not understand"),
    mc("She doesn't ___ meat.", ['eat', 'eats', 'eating'], 0),
    gap('They ___ (not / work) on Sundays.', "don't work|do not work"),
    ord("My sister doesn't drink tea."),
    mc('Which is correct?', ["He don't know.", "He doesn't knows.", "He doesn't know."], 2),
    gap('We ___ (not / have) a car.', "don't have|do not have"),
    gap('It ___ (not / rain) much here in summer.', "doesn't rain|does not rain")
  ]);

  L('eg-8', 'A1', `
<p>Вопрос в Present Simple: <b>Do</b> (I, you, we, they) / <b>Does</b> (he, she, it) + подлежащее + глагол в начальной форме.</p>
<p><q>Do you speak English?</q> <q>Does she work here?</q> <q>Where do you live?</q> <q>What time does the film start?</q></p>
<p>Краткие ответы: <q>Yes, I do.</q> <q>No, she doesn't.</q></p>`, [
    gap('___ you speak French?', 'Do'),
    gap('___ your brother play tennis?', 'Does'),
    ord('Where do you live?'),
    ord('What time does the lesson start?'),
    mc('How often ___ she go to the gym?', ['do', 'does', 'is'], 1),
    gap('"Do they live here?" "Yes, they ___."', 'do'),
    mc('Which is correct?', ['Does he works here?', 'Does he work here?', 'Do he work here?'], 1),
    gap('"Does Tom like pizza?" "No, he ___."', "doesn't|does not")
  ]);

  L('eg-9', 'A1', `
<p><b>Present Simple</b> — что происходит обычно, всегда. <b>Present Continuous</b> — что происходит сейчас или временно.</p>
<p><q>I usually walk to work, but today I'm taking the bus.</q></p>
<p>Глаголы состояния (<b>know, like, love, want, need, understand, believe</b>) обычно не используются в Continuous: <q>I know</q>, а не ~~I am knowing~~.</p>`, [
    mc('I ___ to work by bus every day.', ['go', 'am going', 'goes'], 0),
    mc('Listen! Someone ___ at the door.', ['knocks', 'is knocking', 'knock'], 1),
    gap('He ___ (play) the guitar every evening.', 'plays'),
    gap('She ___ (play) tennis now.', 'is playing'),
    mc('I ___ the answer.', ['am knowing', 'know', 'knowing'], 1, 'know — глагол состояния, в Continuous не употребляется.'),
    gap("Where's Tom? – He ___ (have) a shower.", 'is having'),
    gap('My sister ___ (not / eat) meat. She is a vegetarian.', "doesn't eat|does not eat"),
    mc('Jack is in London this week. He ___ at a hotel.', ['stays', 'is staying', 'stay'], 1, 'Временная ситуация — Continuous.')
  ]);

  L('eg-10', 'A1', `
<p><b>have</b> и <b>have got</b> — «иметь, у меня есть». Значение одинаковое, <i>have got</i> — разговорный британский вариант.</p>
<p><q>I've got two sisters.</q> <q>She has got blue eyes.</q> <q>Have you got a pen?</q> <q>I haven't got any money.</q></p>
<p>С <b>do</b>: <q>Do you have a car?</q> <q>I don't have time.</q> Нельзя: ~~She have~~, ~~Do you have got~~.</p>`, [
    gap('She ___ got two brothers.', 'has'),
    gap("I ___ got a headache. (negative)", "haven't|have not"),
    mc('___ you got a pen?', ['Have', 'Do', 'Are'], 0),
    gap('"Do you have a car?" "Yes, I ___."', 'do'),
    ord('He has got a new phone.'),
    mc('Which is correct?', ["She don't have a car.", "She hasn't a car got.", "She hasn't got a car."], 2),
    gap('___ your sister got blue eyes?', 'Has'),
    gap('We ___ (not / have) any milk.', "don't have|do not have|haven't got|have not got")
  ]);

  L('eg-11', 'A1', `
<p>Прошедшее время глагола <b>to be</b>: <b>I / he / she / it — was</b>, <b>we / you / they — were</b>.</p>
<p>Отрицание: <q>wasn't</q> / <q>weren't</q>. Вопрос: <q>Was he tired?</q> <q>Where were you yesterday?</q></p>`, [
    gap('I ___ at home yesterday.', 'was'),
    gap('They ___ in Paris last week.', 'were'),
    gap('The film ___ good. (negative)', "wasn't|was not"),
    mc('___ you tired last night?', ['Was', 'Were', 'Are'], 1),
    ord('Where were you yesterday?'),
    gap('"Was the hotel expensive?" "No, it ___."', "wasn't|was not"),
    mc('Last year we ___ on holiday in Spain.', ['was', 'were', 'are'], 1),
    gap('How old ___ you in 2010?', 'were')
  ]);

  L('eg-12', 'A1', `
<p><b>Past Simple</b> — действие закончилось в прошлом. Слова-подсказки: yesterday, last week, in 2019, two days ago.</p>
<p>Правильные глаголы: <b>+ -ed</b> (worked, played, studied, stopped). Неправильные — надо учить: go → <b>went</b>, have → <b>had</b>, see → <b>saw</b>, buy → <b>bought</b>, eat → <b>ate</b>, get → <b>got</b>, make → <b>made</b>, come → <b>came</b>, take → <b>took</b>, write → <b>wrote</b>.</p>`, [
    gap('We ___ (visit) our grandparents last Sunday.', 'visited'),
    gap('She ___ (go) to Rome two years ago.', 'went'),
    gap('I ___ (buy) a new phone yesterday.', 'bought'),
    gap('He ___ (study) all night.', 'studied'),
    mc('They ___ a great film last night.', ['seen', 'saw', 'see'], 1),
    gap('I ___ (have) a big breakfast this morning.', 'had'),
    ord('We ate pizza yesterday.'),
    mc("The bus ___ at 8 o'clock.", ['stoped', 'stopped', 'stopt'], 1, 'Короткий глагол с одной гласной перед согласной удваивает её: stop → stopped.')
  ], 'Напиши 5 предложений о том, что ты делала вчера (Past Simple).');

  L('eg-13', 'A1', `
<p>В отрицаниях и вопросах Past Simple используется вспомогательный глагол <b>did</b>, а основной глагол возвращается в <b>начальную форму</b>.</p>
<p><q>I didn't see him.</q> (не ~~didn't saw~~) <q>Did you enjoy the party?</q> <q>What did you do last night?</q></p>
<p>Краткие ответы: <q>Yes, I did.</q> <q>No, he didn't.</q> (С глаголом to be — was / were, did не нужен.)</p>`, [
    gap('I ___ (not / see) him yesterday.', "didn't see|did not see"),
    gap('___ you enjoy the party?', 'Did'),
    mc("She didn't ___ the phone.", ['answer', 'answered', 'answers'], 0),
    ord('What did you do last night?'),
    gap('"Did he call you?" "No, he ___."', "didn't|did not"),
    mc('Which is correct?', ['Did she went home?', 'Did she go home?', 'Did she goes home?'], 1),
    gap('Where ___ you go on holiday last year?', 'did'),
    gap('We ___ (not / have) time to eat.', "didn't have|did not have")
  ]);

  L('eg-14', 'A1', `
<p><b>Past Continuous</b>: <b>was / were + глагол-ing</b> — действие было «в процессе» в определённый момент в прошлом.</p>
<p><q>At 8 o'clock last night I was cooking.</q> <q>They were playing football at 5 pm.</q></p>
<p>Отрицание: <q>wasn't / weren't</q> + -ing. Вопрос: <q>What were you doing?</q></p>`, [
    gap("At 9 o'clock I ___ (watch) TV.", 'was watching'),
    gap('They ___ (play) football at 5 pm.', 'were playing'),
    mc('What ___ you doing at midnight?', ['was', 'were', 'did'], 1),
    gap('She ___ (not / sleep) when I called.', "wasn't sleeping|was not sleeping"),
    ord('It was raining all day.'),
    gap('Why ___ he running?', 'was'),
    mc('At this time yesterday we ___ in a traffic jam.', ['sit', 'were sitting', 'sat'], 1),
    gap('The children ___ (do) their homework at 6.', 'were doing')
  ]);

  L('eg-15', 'A1', `
<p>Длинное действие в прошлом — <b>Past Continuous</b> (фон), короткое событие, которое его прервало, — <b>Past Simple</b>.</p>
<p><q>I was walking home when I saw an accident.</q></p>
<p><b>while</b> + Past Continuous (<q>While we were having dinner…</q>), <b>when</b> — обычно Past Simple (<q>…when the phone rang.</q>)</p>`, [
    mc('I was walking home when I ___ an accident.', ['saw', 'was seeing', 'see'], 0),
    mc('While we ___ dinner, the lights went out.', ['had', 'were having', 'have'], 1),
    gap('She ___ (break) her arm while she was skiing.', 'broke'),
    gap('He was reading when the phone ___ (ring).', 'rang'),
    mc('Tom ___ a shower when the doorbell rang.', ['took', 'was taking', 'takes'], 1),
    ord('I was sleeping when you called.'),
    gap('When I arrived, they ___ (wait) outside.', 'were waiting'),
    mc('What ___ when you saw him?', ['did you do', 'were you doing', 'you were doing'], 1)
  ], 'Напиши историю из 4–5 предложений: «Когда случилось что-то неожиданное, я как раз делала…».');
})();
