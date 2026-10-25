(function () {
  const { gap, mc, ord, L } = JP;

  L('eg-38', 'A2', `
<p><b>There is / There are</b> — «имеется, есть». <b>There is</b> + единственное число и неисчисляемые: <q>There is a bank near here.</q> <b>There are</b> + множественное: <q>There are two cats in the garden.</q></p>
<p>Отрицание: <q>There isn't</q> / <q>There aren't</q>. Вопрос: <q>Is there a bank near here?</q> <q>Are there any shops?</q> Ответы: <q>Yes, there is.</q> / <q>No, there aren't.</q></p>`, [
    gap('There ___ a bank near here.', 'is'),
    gap('There ___ two cats in the garden.', 'are'),
    gap('___ there a supermarket in your street?', 'Is'),
    mc('There ___ any milk in the fridge.', ["isn't", "aren't", "doesn't"], 0),
    ord('Are there any shops near here?'),
    mc('There ___ some people at the door.', ['is', 'are', 'be'], 1),
    gap('“Is there a bus to the airport?” “Yes, there ___.”', 'is'),
    gap('There ___ any eggs left. (negative)', "aren't|are not")
  ], 'Опиши свою комнату или свой район: There is… There are… There isn\'t…');

  L('eg-43', 'A2', `
<p>Согласиться с утверждением: <b>so + вспомогательный глагол + подлежащее</b>: <q>“I'm tired.” “So am I.”</q> <q>“I like pizza.” “So do I.”</q></p>
<p>Согласиться с отрицанием: <b>neither + вспомогательный + подлежащее</b>: <q>“I don't smoke.” “Neither do I.”</q></p>
<p>Вспомогательный глагол повторяет тот, что в первой фразе (am / do / did / have / can). <b>too</b> — «тоже» в утверждении, <b>either</b> — «тоже» в отрицании: <q>I like it too.</q> <q>I don't like it either.</q></p>`, [
    gap('“I like pizza.” “I like it ___.”', 'too'),
    gap('“I don\'t like cold weather.” “I don\'t like it ___.”', 'either'),
    mc('“I\'m hungry.” “So ___ I.”', ['do', 'am', 'have'], 1),
    mc('“I don\'t smoke.” “Neither ___ I.”', ['am', 'do', 'did'], 1),
    gap('“I went to the party.” “So ___ I.”', 'did'),
    gap('“She can\'t swim.” “Neither ___ he.”', 'can'),
    ord('I love music, and so does my sister.'),
    mc('“I haven\'t seen the film.” “___.”', ["I haven't either", "So haven't I", 'Neither I have'], 0)
  ]);

  L('eg-46', 'A2', `
<p>Если вопросительное слово — <b>подлежащее</b> (кто / что сделало действие), вспомогательный глагол <b>не нужен</b>: <q>Who saw you?</q> <q>What happened?</q> <q>Who lives here?</q></p>
<p>Если вопросительное слово — <b>дополнение</b> (кого / что), нужен do / does / did: <q>Who did you see?</q> <q>What do you want?</q></p>`, [
    mc('Who ___ the window? (someone broke it)', ['broke', 'did break', 'did broke'], 0),
    mc('Who ___ you meet yesterday?', ['did', 'does', 'was'], 0),
    gap('What ___ at the party last night? (happen)', 'happened'),
    mc('Who ___ in this house?', ['lives', 'does live', 'do live'], 0),
    mc('What ___ you want for lunch?', ['do', 'does', 'are'], 0),
    ord('Who did you call?'),
    gap('Who ___ (phone) you last night?', 'phoned'),
    gap('What ___ she buy?', 'did')
  ]);

  L('eg-50', 'A2', `
<p>Вежливые вопросы: <q>Do you know where…?</q> <q>Can you tell me what…?</q> <q>I don't know why…</q> — после вводной фразы порядок слов <b>как в утверждении</b> и <b>без do / does / did</b>.</p>
<p><q>Where is the station?</q> → <q>Do you know where the station is?</q><br><q>What time does it start?</q> → <q>Can you tell me what time it starts?</q></p>`, [
    mc('Do you know where ___?', ['is the bank', 'the bank is', 'does the bank'], 1),
    mc('Can you tell me what time ___?', ['it is', 'is it', 'does it'], 0),
    gap("I don't know where she ___ (live).", 'lives'),
    ord("I don't know what he wants."),
    mc('Do you know ___?', ['how much does it cost', 'how much it costs', 'how much it cost'], 1),
    gap('Could you tell me where the toilets ___? (be)', 'are'),
    mc('I wonder ___ he did that.', ['why', 'why did', 'why does'], 0),
    gap('Do you know if he ___ (come) tomorrow?', 'is coming|comes|will come')
  ]);

  L('eg-51', 'A2', `
<p><b>Косвенная речь</b>: пересказываем чужие слова. Глагол «сдвигается» на шаг в прошлое:</p>
<table class="t"><tr><th>Прямая речь</th><th>Косвенная</th></tr>
<tr><td>“I <b>am</b> tired.”</td><td>She said she <b>was</b> tired.</td></tr>
<tr><td>“I <b>work</b> here.”</td><td>He said he <b>worked</b> there.</td></tr>
<tr><td>“I <b>have</b> finished.”</td><td>She said she <b>had</b> finished.</td></tr>
<tr><td>“I <b>will</b> call.”</td><td>He said he <b>would</b> call.</td></tr></table>
<p><b>said</b> (без «кому») и <b>told</b> + кому: <q>He told me that he was busy.</q></p>`, [
    mc('“I am tired.” → She said she ___ tired.', ['is', 'was', 'were'], 1),
    mc('“I like pizza.” → He said he ___ pizza.', ['liked', 'likes', 'like'], 0),
    gap('“I will call you.” → She said she ___ call me.', 'would'),
    mc('He ___ me that he was busy.', ['said', 'told', 'says'], 1),
    gap('“We are happy.” → They said they ___ happy.', 'were'),
    ord('She said that she was tired.'),
    mc('“I have finished.” → He said he ___ finished.', ['has', 'had', 'have'], 1),
    gap('“I live in Rome.” → He said he ___ in Rome.', 'lived')
  ]);

  L('eg-53', 'A2', `
<p>После одних глаголов — <b>to + глагол</b>: want, need, decide, hope, plan, learn, try, promise: <q>I want to go.</q> <q>We decided to leave.</q></p>
<p>После других — <b>глагол-ing</b>: enjoy, finish, stop, mind, suggest, keep, avoid: <q>I enjoy swimming.</q> <q>Would you mind closing the door?</q></p>
<p>После любого предлога — тоже -ing: <q>I'm thinking of changing my job.</q></p>`, [
    mc('I want ___ a new phone.', ['buying', 'to buy', 'buy'], 1),
    mc('She enjoys ___ to music.', ['to listen', 'listening', 'listen'], 1),
    gap('We decided ___ (go) by train.', 'to go'),
    gap('He has finished ___ (write) the report.', 'writing'),
    mc("I'm thinking ___ a new job.", ['of finding', 'to find', 'find'], 0),
    ord('I hope to see you soon.'),
    mc('Would you mind ___ the door?', ['to close', 'closing', 'close'], 1),
    gap('I need ___ (buy) some bread.', 'to buy')
  ]);

  L('eg-55', 'A2', `
<p>Цель действия — «чтобы…» — выражаем <b>to + глагол</b>: <q>I went to the shop to buy bread.</q> <q>She called me to ask about the homework.</q></p>
<p>Нельзя: ~~for buy~~. <b>for</b> используется с существительным: <q>I went out for a walk.</q> <q>We stopped for lunch.</q></p>`, [
    mc('I went to the bank ___ some money.', ['for get', 'to get', 'for getting'], 1),
    gap('She called me ___ (ask) about the homework.', 'to ask'),
    mc('We use a dictionary ___ new words.', ['for find', 'to find', 'find'], 1),
    gap("I'm saving money ___ buy a bike.", 'to'),
    ord('He went to London to study English.'),
    mc('“Why did you go there?” “___ see a friend.”', ['For', 'To', 'Because'], 1),
    gap('She went out ___ a walk.', 'for'),
    mc('Which is correct?', ['I came here for learn English.', 'I came here to learn English.', 'I came here for to learn English.'], 1)
  ]);

  L('eg-68', 'A2', `
<p><b>Исчисляемые</b> существительные можно посчитать: a bottle, two bottles. <b>Неисчисляемые</b> — нельзя: water, milk, money, bread, rice, music, <b>information, advice, news, luggage, hair, furniture</b>. У них нет множественного числа и нет a / an.</p>
<p>Считаем «порциями»: <q>a glass of water</q>, <q>a piece of advice</q>, <q>a loaf of bread</q>.</p>`, [
    mc('I need some ___.', ['advices', 'advice', 'an advice'], 1),
    mc('We have a lot of ___.', ['luggages', 'luggage', 'a luggage'], 1),
    gap('Can I have a glass ___ water?', 'of'),
    mc('That is good ___.', ['news', 'a news', 'newses'], 0),
    mc('How ___ money do you have?', ['many', 'much', 'a few'], 1),
    gap('She gave me a piece of ___.', 'advice|information'),
    ord('The news is very good.'),
    mc('Which is correct?', ['She has long hairs.', 'She has long hair.', 'She has a long hairs.'], 1)
  ]);

  L('eg-70', 'A2', `
<p><b>a / an</b> — первое упоминание, «один из многих»: <q>I saw a man.</q> <b>the</b> — собеседник знает, о чём речь, или предмет единственный: <q>The man was tall.</q> <q>The sun is hot.</q></p>
<p>Ещё <b>the</b>: с превосходной степенью (<q>the best</q>), с музыкальными инструментами (<q>play the guitar</q>). <b>an</b> — перед гласным <i>звуком</i>: an apple, an hour.</p>`, [
    gap('I saw ___ man and a dog. The man was old.', 'a'),
    gap('She has ___ umbrella.', 'an'),
    gap('Could you close ___ door, please? (it is known which one)', 'the'),
    mc('___ sun is hot today.', ['A', 'The', 'An'], 1),
    mc('He is ___ best player in the team.', ['a', 'the', 'an'], 1),
    mc('I have ___ idea.', ['a', 'an', 'the'], 1),
    ord('I need a pen and a notebook.'),
    gap('We had lunch in a nice café. ___ café was near the sea.', 'The')
  ]);

  L('eg-77', 'A2', `
<p><b>some</b> — в утверждениях: <q>I have some friends.</q> <b>any</b> — в отрицаниях и вопросах: <q>I don't have any friends.</q> <q>Do you have any questions?</q></p>
<p>Но в предложениях и просьбах, где ждём ответ «да», — some: <q>Would you like some tea?</q> <q>Can I have some water?</q></p>`, [
    gap('I have ___ questions.', 'some'),
    gap("We don't have ___ bread.", 'any'),
    gap('Do you need ___ help?', 'any'),
    mc('Would you like ___ coffee?', ['any', 'some', 'a'], 1),
    mc("There aren't ___ chairs.", ['some', 'any', 'a'], 1),
    gap('Can I have ___ water, please?', 'some'),
    ord('Is there any milk in the fridge?'),
    mc('She bought ___ apples yesterday.', ['any', 'some', 'an'], 1)
  ]);

  L('eg-84', 'A2', `
<p><b>many</b> + исчисляемые во мн. числе (many people); <b>much</b> + неисчисляемые (much money). Они чаще в вопросах и отрицаниях: <q>How many people came?</q> <q>I don't have much time.</q></p>
<p><b>a lot of / lots of</b> — подходит ко всему и в утверждениях: <q>I have a lot of friends.</q> <q>She has lots of money.</q></p>`, [
    mc('How ___ people came to the party?', ['much', 'many', 'a lot'], 1),
    mc('How ___ sugar do you take?', ['much', 'many', 'few'], 0),
    gap("There isn't ___ time.", 'much'),
    gap('She has ___ of friends.', 'a lot|lots'),
    mc("I don't have ___ books.", ['much', 'many', 'a lot'], 1),
    ord("We don't have much money."),
    mc('Were there ___ cars on the road?', ['much', 'many', 'a lot'], 1),
    gap('How ___ does it cost?', 'much')
  ]);

  L('eg-88', 'A2', `
<p><b>Сравнительная степень</b>. Короткие прилагательные + <b>-er</b>: old → older, tall → taller, big → big<b>g</b>er, happy → happ<b>i</b>er. Длинные: <b>more</b> + прилагательное: more expensive, more interesting.</p>
<p>Исключения: good → <b>better</b>, bad → <b>worse</b>, far → <b>further</b>. Сравниваем с <b>than</b>: <q>She is taller than me.</q></p>`, [
    gap('My brother is ___ (tall) than me.', 'taller'),
    gap('This book is ___ (interesting) than that one.', 'more interesting'),
    gap('Today is ___ (hot) than yesterday.', 'hotter'),
    gap('Her English is ___ (good) than mine.', 'better'),
    mc('London is ___ than Paris.', ['more big', 'bigger', 'biger'], 1),
    mc('This exercise is ___ than the last one.', ['easier', 'more easy', 'easyer'], 0),
    ord('The train is faster than the bus.'),
    gap('The weather is ___ (bad) today.', 'worse')
  ]);

  L('eg-89', 'A2', `
<p>Сравнение: <b>A is older than B</b>. Усилить: <b>much / far</b> (намного) и ослабить: <b>a bit / a little</b> (чуть-чуть): <q>It is much warmer today.</q> <q>This is a bit more expensive.</q></p>
<p>Двойное сравнение запрещено: ~~more taller~~. И после than — «than me» (в разговоре) или «than I am».</p>`, [
    mc('She is older ___ me.', ['that', 'than', 'then'], 1),
    gap('This phone is ___ (cheap) than that one.', 'cheaper'),
    mc('It is ___ warmer today.', ['very', 'much', 'more'], 1),
    gap('He runs ___ (fast) than I do.', 'faster'),
    ord('This is a bit more expensive than that.'),
    mc('Which is correct?', ['She is more tall than me.', 'She is taller than me.', 'She is more taller than me.'], 1),
    gap('My flat is ___ (big) than yours.', 'bigger'),
    gap('A car is ___ expensive than a bicycle.', 'more')
  ]);

  L('eg-91', 'A2', `
<p><b>Превосходная степень</b>: <b>the + -est</b> (the tallest, the biggest, the happiest) или <b>the most + длинное прилагательное</b> (the most beautiful). Исключения: <b>the best, the worst</b>.</p>
<p><q>She is the tallest girl in the class.</q> <q>It was the worst day of my life.</q> После превосходной степени — <b>in</b> (in the class, in the world) или <b>of</b> (of all).</p>`, [
    gap('She is ___ (tall) girl in the class.', 'the tallest'),
    gap('This is ___ (interesting) book I have read.', 'the most interesting'),
    gap('It was ___ (bad) day of my life.', 'the worst'),
    mc('Everest is ___ mountain in the world.', ['higher', 'the highest', 'most high'], 1),
    mc('Who is ___ in your family?', ['the oldest', 'oldest', 'more old'], 0),
    ord('This is the best restaurant in town.'),
    gap('He is ___ (good) player in the team.', 'the best'),
    mc('She is the ___ person I know.', ['kindest', 'kinder', 'most kind'], 0)
  ]);

  L('eg-92', 'A2', `
<p><b>enough</b> = «достаточно». После прилагательного: <q>She is old enough to drive.</q> <q>Is the water warm enough?</q> Перед существительным: <q>We have enough time.</q> <q>I haven't got enough money.</q></p>
<p>Схема: прилагательное + <b>enough</b> (не ~~enough old~~); <b>enough</b> + существительное.</p>`, [
    mc("She isn't ___ to drive.", ['enough old', 'old enough', 'enough older'], 1),
    mc("We don't have ___ time.", ['enough', 'enough of', 'too'], 0),
    gap('Is the water warm ___ to swim?', 'enough'),
    ord('He is tall enough to reach the shelf.'),
    mc('Is there ___ food for everyone?', ['enough', 'enoughly', 'enough of'], 0),
    gap("I can't buy it. I haven't got ___ money.", 'enough'),
    mc('Is it big ___?', ['enough', 'enoughly', 'too'], 0),
    gap('The soup is not hot ___.', 'enough')
  ]);

  L('eg-93', 'A2', `
<p><b>too</b> = «слишком» (обычно плохо, больше, чем нужно): <q>It's too cold to swim.</q> <q>The bag is too heavy for me.</q></p>
<p><b>too much</b> + неисчисляемое (too much traffic), <b>too many</b> + исчисляемое (too many people). Не путай: <b>very</b> = «очень» (нейтрально), <b>too</b> = «слишком» (проблема).</p>`, [
    mc('It is ___ cold to swim today.', ['too', 'very', 'enough'], 0),
    mc('I have ___ homework tonight.', ['too many', 'too much', 'too'], 1),
    gap('There are ___ people in this room. (слишком много)', 'too many'),
    gap('This coffee is ___ hot to drink.', 'too'),
    ord('The bag is too heavy for me.'),
    mc("We can't go. It's ___ late.", ['too', 'enough', 'very'], 0),
    mc('Which is correct?', ['She is too tired to work.', 'She is too much tired.', 'She is tired too to work.'], 0),
    mc("There's ___ traffic. We'll be late.", ['too many', 'too much', 'too'], 1)
  ]);

  L('eg-98', 'A2', `
<p>Союзы связывают части предложения:</p>
<ul><li><b>and</b> — и: <q>I like tea and coffee.</q></li><li><b>but</b> — но: <q>I like tea, but I don't like coffee.</q></li><li><b>or</b> — или: <q>Tea or coffee?</q></li>
<li><b>so</b> — поэтому (следствие): <q>I was tired, so I went to bed.</q></li><li><b>because</b> — потому что (причина): <q>I went to bed because I was tired.</q></li></ul>`, [
    mc('I was tired, ___ I went to bed early.', ['because', 'so', 'but'], 1),
    mc('I went to bed early ___ I was tired.', ['because', 'so', 'but'], 0),
    gap("I like tea, ___ I don't like coffee.", 'but'),
    gap('Do you want tea ___ coffee?', 'or'),
    mc('She is rich ___ unhappy.', ['and', 'but', 'so'], 1),
    ord('I stayed at home because it was raining.'),
    gap('It was cold, ___ we put on our coats.', 'so'),
    mc('He studied hard ___ he passed the exam.', ['but', 'and', 'or'], 1)
  ], 'Напиши 5 предложений о своём дне, используя and / but / so / because.');

  L('eg-99', 'A2', `
<p>Когда речь о будущем, после <b>when, if, while, before, after, until, as soon as</b> глагол стоит в <b>Present Simple</b>, а не с will: <q>If it rains tomorrow, we will stay at home.</q> <q>I'll call you when I get home.</q></p>
<p>Нельзя: ~~If it will rain~~, ~~when I will get home~~.</p>`, [
    mc('If it ___ tomorrow, we will stay at home.', ['rains', 'will rain', 'rain'], 0),
    mc("I'll call you when I ___ home.", ['get', 'will get', 'am getting'], 0),
    gap('If she ___ (come), I will be happy.', 'comes'),
    gap('I ___ (help) you if you ask me.', "will help|'ll help"),
    ord('When I arrive, I will call you.'),
    mc('Which is correct?', ['If I will see him, I will tell him.', 'If I see him, I will tell him.', 'If I saw him, I will tell him.'], 1),
    gap('We will go for a walk if the weather ___ (be) nice.', 'is'),
    gap('Please wait here until I ___ (come) back.', 'come')
  ]);

  L('eg-100', 'A2', `
<p><b>Нереальное условие</b> (сейчас или в будущем, маловероятно): <b>If + Past Simple, would + глагол</b>.</p>
<p><q>If I had a car, I would drive to work.</q> (но у меня нет машины) <q>What would you do if you won a million?</q></p>
<p>С <b>to be</b> в этом условии принято <b>were</b> для всех лиц: <q>If I were you, I would go.</q></p>`, [
    mc('If I ___ more money, I would buy a house.', ['have', 'had', 'will have'], 1),
    gap('If she knew the answer, she ___ tell us.', 'would'),
    gap('If I ___ (be) you, I would go.', 'were|was'),
    mc('What ___ you do if you won a million?', ['would', 'will', 'do'], 0),
    ord('If I had time, I would travel more.'),
    gap("I wouldn't do that if I ___ you.", 'were|was'),
    mc('If he ___ here, he would help us.', ['is', 'were', 'will be'], 1),
    gap('If we lived by the sea, we ___ swim every day.', 'would')
  ], 'Напиши 3 предложения: «Что бы ты сделала, если бы…» (If I had… / If I could…, I would…).');

  L('eg-101', 'A2', `
<p>Определительные придаточные уточняют, о ком или о чём речь. <b>who</b> — люди, <b>which</b> — вещи, <b>that</b> — и люди, и вещи, <b>where</b> — место, <b>whose</b> — чей.</p>
<p><q>The woman who lives next door is a doctor.</q> <q>A key is a thing that opens a door.</q> <q>The hotel where we stayed was nice.</q></p>`, [
    mc('The woman ___ lives next door is a doctor.', ['who', 'which', 'whose'], 0),
    mc('This is the book ___ I told you about.', ['who', 'that', 'where'], 1),
    gap('A waiter is a person ___ works in a restaurant.', 'who|that'),
    gap('A key is a thing ___ opens a door.', 'which|that'),
    ord('The man who called you is my brother.'),
    mc('The hotel ___ we stayed was very nice.', ['where', 'who', 'which'], 0),
    mc('The people ___ live here are friendly.', ['which', 'who', 'where'], 1),
    gap('I like films ___ make me laugh.', 'which|that')
  ]);

  L('eg-102', 'A2', `
<p>Если слово <b>who / which / that</b> — <i>дополнение</i> в придаточном, его можно <b>опустить</b>: <q>The people (who) we met were nice.</q> <q>The film (that) I saw was boring.</q></p>
<p>Если оно — <i>подлежащее</i>, опускать нельзя: <q>The man <b>who</b> lives next door</q>. Предлог остаётся в конце: <q>The hotel we stayed <b>at</b>.</q> <b>whose</b> — «чей»: <q>That is the man whose car was stolen.</q></p>`, [
    mc('Which sentence is NOT correct?', ['The book I read was good.', 'The woman lives here is a doctor.', 'The man I saw was tall.'], 1),
    gap('The shoes ___ I bought are too small.', 'that|which'),
    mc('The people we met ___ very friendly.', ['was', 'were', 'is'], 1),
    ord('The hotel we stayed at was nice.'),
    mc('This is the girl I told you ___.', ['about', 'about her', 'of'], 0),
    gap('The film we watched ___ boring.', 'was'),
    gap('That is the man ___ car was stolen.', 'whose'),
    mc('The shop I went ___ was closed.', ['to', 'to it', 'at it'], 0)
  ]);

  L('eg-103', 'A2', `
<table class="t"><tr><th>Предлог</th><th>Когда</th><th>Примеры</th></tr>
<tr><td><b>at</b></td><td>точное время, ночь</td><td>at 8 o'clock, at night, at the weekend</td></tr>
<tr><td><b>on</b></td><td>дни и даты</td><td>on Monday, on 5 May, on Friday morning</td></tr>
<tr><td><b>in</b></td><td>месяцы, годы, сезоны, части дня</td><td>in April, in 2020, in summer, in the morning</td></tr></table>`, [
    gap("The lesson starts ___ 9 o'clock.", 'at'),
    gap('My birthday is ___ 5 May.', 'on'),
    gap('We go skiing ___ winter.', 'in'),
    gap('I usually get up early ___ the morning.', 'in'),
    mc('See you ___ Friday!', ['at', 'on', 'in'], 1),
    mc('He was born ___ 1995.', ['at', 'on', 'in'], 2),
    ord('I will see you at the weekend.'),
    mc('She works ___ night.', ['at', 'in', 'on'], 0)
  ]);

  L('eg-106', 'A2', `
<table class="t"><tr><th>Предлог</th><th>Значение</th><th>Примеры</th></tr>
<tr><td><b>in</b></td><td>внутри</td><td>in a room, in London, in a car, in the box</td></tr>
<tr><td><b>at</b></td><td>точка, место события</td><td>at the bus stop, at work, at a party, at the door</td></tr>
<tr><td><b>on</b></td><td>на поверхности, линии</td><td>on the table, on the wall, on the second floor, on a bus / train</td></tr></table>`, [
    gap('She lives ___ London.', 'in'),
    gap('Wait for me ___ the bus stop.', 'at'),
    gap('The keys are ___ the table.', 'on'),
    mc('I met him ___ a party.', ['in', 'at', 'on'], 1),
    mc('There is a picture ___ the wall.', ['in', 'at', 'on'], 2),
    mc('He is ___ work now.', ['at', 'in', 'on'], 0),
    ord('The book is on the shelf.'),
    mc('We were ___ the train when it stopped.', ['in', 'at', 'on'], 2)
  ]);

  L('eg-115', 'A2', `
<p>У <b>фразовых глаголов</b> (put on, turn off, pick up) есть два порядка слов, если дополнение — существительное: <q>Put on your shoes.</q> = <q>Put your shoes on.</q></p>
<p>Если дополнение — <b>местоимение</b> (it, them, me), оно стоит <b>между</b>: <q>Put them on.</q> <q>Pick it up.</q> Нельзя: ~~Put on them~~.</p>`, [
    mc('Here are your shoes. Put ___.', ['on them', 'them on', 'on they'], 1),
    gap('Turn ___ the light, please. (выключить)', 'off'),
    gap('Please turn the TV ___. (включить)', 'on'),
    mc('She took ___ her coat.', ['off', 'of', 'out'], 0),
    ord('Please pick it up.'),
    mc('Which is correct?', ['Throw away it.', 'Throw it away.', 'Throw away them.'], 1),
    gap("I'm looking ___ my keys. (искать)", 'for'),
    mc('I need to look ___ my little brother tonight.', ['after', 'at', 'up'], 0)
  ]);
})();
