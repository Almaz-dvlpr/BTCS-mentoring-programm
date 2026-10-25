// Карта курса. Нумерация уроков = нумерация в книгах преподавателя.
// EG = Essential Grammar in Use (115 уроков, A1–A2+)
// MU = Raymond Murphy, English Grammar in Use, 5th ed. (145 уроков, B1–B2)
// VOC = English Vocabulary in Use: Elementary (60 тем) — данные в vocab.js
window.JP = window.JP || {};
JP.data = JP.data || { lessons: {} };

JP.data.egTitles = [
  'am / is / are', 'am / is / are: вопросы', "I'm scared / late / tired… (be + прилагательное)", 'I am doing (Present Continuous)',
  'Are you doing? (Present Continuous: вопросы)', 'I do / work / like (Present Simple)', "I don't… (Present Simple: отрицание)", 'Do you…? (Present Simple: вопросы)',
  'Present Continuous и Present Simple', "I have… / I've got…", 'was / were', 'worked / got / went (Past Simple)',
  "I didn't… / Did you…? (Past Simple: отрицание и вопросы)", 'I was doing (Past Continuous)', 'Past Continuous и Past Simple', 'I have done (Present Perfect 1)',
  "I've just… / already / yet (Present Perfect 2)", 'Have you ever…? (Present Perfect 3)', 'How long have you…? (Present Perfect 4)', 'for, since, ago',
  'Present Perfect и Past Simple', 'is done / was done (пассив 1)', 'is being done / has been done (пассив 2)', 'be / have / do в настоящем и прошедшем',
  'Правильные и неправильные глаголы', 'What are you doing tomorrow? (будущее)', "I'm going to…", 'will / shall 1',
  'will / shall 2', 'might', 'can и could', "must, mustn't, don't need to",
  'should', 'I have to…', "Would you like…? I'd like…", "Do this! Don't do that! Let's…! (повелительное)",
  'I used to…', 'there is / there are', 'there was / were, there has been, there will be', 'It…',
  "I am, I don't… (краткие ответы)", "Have you? Are you? Don't you? (ответные реплики)", 'too / either; so am I / neither do I', "isn't, haven't, don't… (отрицания)",
  'Вопросы 1: is it…? have you…? do they…?', 'Who saw you? Who did you see? (вопросы 2)', 'Who is she talking to? What is it like? (вопросы 3)', 'What…? Which…? How…? (вопросы 4)',
  'How long does it take…?', "Do you know where…? / I don't know what… (косвенные вопросы)", 'She said that… / He told me that… (косвенная речь)', 'work / working, go / going, do / doing',
  'to… (I want to do) и -ing (I enjoy doing)', 'I want you to… / I told you to…', 'I went to the shop to… (цель)', 'go to… / go on… / go for… / go -ing',
  'get', 'do и make', 'have', 'I / me, he / him, they / them',
  'my / his / their', "Whose is this? It's mine / yours / hers", 'I / me / my / mine', 'myself / yourself / themselves',
  "-'s (Kate's camera, my brother's car)", 'a / an', 'train(s), bus(es) (единственное и множественное число)', 'a bottle / some water (исчисляемые и неисчисляемые 1)',
  'a cake / some cake / some cakes (исчисляемые и неисчисляемые 2)', 'a / an и the', 'the…', 'go to work, go home, go to the cinema',
  'I like music, I hate exams', 'the… с географическими названиями', 'this / that / these / those', 'one / ones',
  'some и any', 'not + any, no, none', 'nobody / no-one / nothing (not + anybody…)', 'somebody / anything / nowhere…',
  'every и all', 'all, most, some, any, no / none', 'both, either, neither', 'a lot, much, many',
  '(a) little, (a) few', 'old / nice / interesting (прилагательные)', 'quickly / badly / suddenly (наречия)', 'old → older, expensive → more expensive',
  'older than…, more expensive than…', 'not as … as', 'the oldest, the most expensive', 'enough',
  'too', 'He caught a big fish (порядок слов 1)', 'always / usually / often (порядок слов 2)', 'still, yet, already',
  'Give me that book! Give it to me!', 'and, but, or, so, because', 'When… / If…', 'If I had…, If we went… (условные)',
  'a person who…, a thing that / which… (определительные придаточные 1)', 'the people we met, the hotel you stayed at (определительные 2)', 'at 8 o\'clock, on Monday, in April', 'from… to, until, since, for',
  'before, after, during, while', 'in, at, on (место 1)', 'in, at, on (место 2)', 'to, in, at (место 3)',
  'under, behind, opposite…', 'up, over, through…', 'on, at, by, with, about', 'full of…, good at… + -ing',
  'listen to…, look at… (глагол + предлог)', 'go in, fall off, run away (фразовые глаголы 1)', 'put on your shoes / put your shoes on (фразовые глаголы 2)'
];

// Murphy: выбранные уроки для финального этапа «к B1» (в порядке изучения)
JP.data.muList = [
  [9, 'Present perfect continuous (I have been doing)'], [10, 'Present perfect continuous и simple'], [13, 'Present perfect и past simple 1'],
  [15, 'Past perfect (I had done)'], [16, 'Past perfect continuous (I had been doing)'], [24, 'will be doing и will have done'],
  [25, 'when I do и when I\'ve done; if и when'], [27, 'could (do) и could have (done)'], [28, "must и can't (уверенный вывод)"],
  [29, 'may и might 1'], [31, 'have to и must'], [36, 'would'],
  [38, 'if I do… и if I did…'], [39, 'if I knew… / I wish I knew…'], [40, 'if I had known… / I wish I had known…'],
  [43, 'Пассив 2 (be done / been done / being done)'], [44, 'Пассив 3'], [46, 'have something done'],
  [47, 'Косвенная речь 1 (he said that…)'], [48, 'Косвенная речь 2'], [50, 'Вопросы 2 (Do you know where…? / He asked me where…)'],
  [52, 'Question tags (do you? isn\'t it?)'], [53, 'Verb + -ing (enjoy doing / stop doing)'], [54, 'Verb + to… (decide to / forget to)'],
  [55, 'Verb + object + to… (I want you to…)'], [56, 'Verb + -ing или to… 1 (remember, regret)'], [57, 'Verb + -ing или to… 2 (try, need, help)'],
  [59, 'prefer и would rather'], [60, 'Предлог + -ing'], [61, 'be / get used to…'],
  [64, 'to…, for… и so that…'], [92, 'Relative clauses 1 (who / that / which)'], [93, 'Relative clauses 2 (без who / that / which)'],
  [94, 'Relative clauses 3 (whose / whom / where)'], [95, 'Relative clauses 4 (дополнительная информация)'], [97, '-ing и -ed clauses'],
  [98, 'Прилагательные на -ing и -ed (boring / bored)'], [102, 'so и such'], [104, 'quite, pretty, rather, fairly'],
  [113, 'although, though, in spite of, despite'], [114, 'in case'], [115, 'unless, as long as, provided'],
  [119, 'during, for, while'], [130, 'Прилагательное + предлог 1'], [133, 'Глагол + предлог 2 (about / for / of / after)'],
  [137, 'Фразовые глаголы 1 (введение)'], [140, 'Фразовые глаголы 4 (on / off)'], [143, 'Фразовые глаголы 7 (up)']
];

// Письменные/речевые проекты (результат уходит преподавателю)
JP.data.writing = [
  { id: 'w-1', stage: 1, title: 'Расскажи о себе', min: 40, prompt: 'Напиши 5–6 предложений о себе: имя, возраст, откуда ты, чем занимаешься, что любишь.', check: ['Каждое предложение начинается с заглавной буквы и заканчивается точкой', 'Я использовала am / is / are там, где нужно', 'Есть хотя бы 2 предложения с I like / I don\'t like'] },
  { id: 'w-2', stage: 2, title: 'Мой обычный день', min: 50, prompt: 'Опиши свой обычный день с утра до вечера (Present Simple). Используй always / usually / sometimes / never.', check: ['Глаголы с he/she/it — с окончанием -s (если я пишу про другого человека)', 'Есть слова-связки: then, after that, in the evening', 'Есть 1–2 отрицательных предложения с don\'t'] },
  { id: 'w-3', stage: 2, title: 'Что я делала на выходных', min: 50, prompt: 'Расскажи о прошлых выходных (Past Simple): 6–8 предложений. Что делала, с кем, где, как тебе понравилось.', check: ['Правильные глаголы с -ed, неправильные — в 2-й форме (went, saw, had…)', 'Есть минимум одно отрицание с didn\'t + глагол в начальной форме', 'Указаны слова времени: yesterday, last weekend, on Saturday'] },
  { id: 'w-4', stage: 3, title: 'Письмо другу', min: 60, prompt: 'Напиши письмо другу (60–80 слов): расскажи, где ты была, что нового, и пригласи его куда-нибудь. Используй Present Perfect и will/going to.', check: ['Приветствие (Hi …) и прощание (See you soon / Best wishes)', 'Есть Present Perfect (I\'ve been…, I\'ve just…)', 'Есть план на будущее (I\'m going to… / Let\'s…)', 'Есть приглашение (Would you like to…?)'] },
  { id: 'w-5', stage: 3, title: 'Мой город: плюсы и минусы', min: 60, prompt: 'Опиши свой город или район (70–90 слов): что там есть, что нравится, что хотелось бы изменить. Используй there is/are, сравнения и if-предложения.', check: ['There is / There are', 'Хотя бы одно сравнение (bigger, more interesting…)', 'Одно условное предложение: If I could…, I would…', 'Слова-связки: and, but, because, so'] },
  { id: 'w-6', stage: 4, title: 'Электронное письмо (неформальное)', min: 60, prompt: 'Напиши другу из-за границы (100–120 слов): расскажи о недавней поездке или событии, поделись впечатлениями и задай 2–3 вопроса.', check: ['Структура: приветствие → основная часть → вопросы → прощание', 'Прошедшие времена (Past Simple, Past Continuous, Past Perfect)', 'Хотя бы 2 вопроса к другу', 'Эмоции и оценки: it was amazing, I was really surprised…'] },
  { id: 'w-7', stage: 4, title: 'Моё мнение: за и против', min: 70, prompt: 'Выбери тему (например: «Работать из дома лучше, чем в офисе?») и напиши 120–150 слов: твоё мнение, 2 довода, возражение и вывод.', check: ['Есть вводная фраза: In my opinion… / I think that…', 'Два довода с because / so / for example', 'Есть контраст: although / however / but', 'Вывод: To sum up… / In conclusion…'] },
  { id: 'w-8', stage: 4, title: 'Рассказ о событии в прошлом', min: 70, prompt: 'Напиши 120–150 слов о ярком событии из жизни (день рождения, поездка, встреча), используя Past Simple, Past Continuous и Past Perfect.', check: ['Past Simple для основных событий', 'Past Continuous для фона (it was raining, we were walking)', 'Past Perfect для того, что было раньше (when we arrived, they had already left)', 'Есть завязка, кульминация и конец'] },
  { id: 'w-9', stage: 4, title: 'Финальный проект: Мой план на год', min: 70, prompt: 'Напиши 130–160 слов о своих планах и мечтах на ближайший год. Используй будущие формы, условные предложения и wish.', check: ['Есть will, going to и Present Continuous для будущего', 'Есть if-предложение (If I save money, I will…)', 'Есть I wish… / If I had more time, I would…', 'Текст разбит на 2–3 абзаца'] }
];

JP.data.stages = [
  { n: 1, level: 'A1', title: 'Фундамент', desc: 'Глагол to be, настоящее и прошедшее время, первые ~350 слов о людях, доме и еде.', eg: [1, 15], voc: [1, 13] },
  { n: 2, level: 'A2', title: 'Основы общения', desc: 'Present Perfect, будущее, модальные глаголы, вопросы, косвенная речь, слова о досуге и путешествиях.', eg: [16, 52], voc: [14, 37] },
  { n: 3, level: 'A2+', title: 'Уверенный A2', desc: 'Артикли, местоимения, степени сравнения, условные, определительные придаточные, предлоги и фразовые глаголы.', eg: [53, 115], voc: [38, 60] },
  { n: 4, level: 'B1', title: 'Финишная прямая к B1', desc: 'Present Perfect Continuous, Past Perfect, условные 2 и 3, пассив, косвенная речь, герундий/инфинитив, письменные проекты.', mu: true }
];
