// Неправильные глаголы: инфинитив | Past Simple | Past Participle | перевод.
// Несколько вариантов формы разделены «/». Порядок — от самых частотных к редким; по 10 в наборе.
window.JP = window.JP || {};
JP.data = JP.data || { lessons: {} };
JP.data.irregular = [];
(function () {
  const raw = `
be|was/were|been|быть
have|had|had|иметь
do|did|done|делать
go|went|gone/been|идти, ехать
come|came|come|приходить
get|got|got/gotten|получать, становиться
make|made|made|делать, создавать
take|took|taken|брать
see|saw|seen|видеть
know|knew|known|знать
give|gave|given|давать
say|said|said|говорить, сказать
tell|told|told|рассказывать
think|thought|thought|думать
find|found|found|находить
leave|left|left|уходить, покидать
feel|felt|felt|чувствовать
put|put|put|класть
bring|brought|brought|приносить
buy|bought|bought|покупать
eat|ate|eaten|есть, кушать
drink|drank|drunk|пить
write|wrote|written|писать
read|read|read|читать
speak|spoke|spoken|говорить
sit|sat|sat|сидеть
stand|stood|stood|стоять
run|ran|run|бегать
begin|began|begun|начинать
sleep|slept|slept|спать
lose|lost|lost|терять, проигрывать
pay|paid|paid|платить
meet|met|met|встречать
win|won|won|выигрывать
send|sent|sent|отправлять
sell|sold|sold|продавать
build|built|built|строить
spend|spent|spent|тратить, проводить (время)
understand|understood|understood|понимать
keep|kept|kept|держать, хранить
wear|wore|worn|носить (одежду)
break|broke|broken|ломать
choose|chose|chosen|выбирать
drive|drove|driven|водить (машину)
fly|flew|flown|летать
forget|forgot|forgotten|забывать
fall|fell|fallen|падать
grow|grew|grown|расти, выращивать
draw|drew|drawn|рисовать
swim|swam|swum|плавать
sing|sang|sung|петь
ride|rode|ridden|ехать верхом
wake|woke|woken|просыпаться, будить
hear|heard|heard|слышать
teach|taught|taught|преподавать
catch|caught|caught|ловить
lend|lent|lent|одалживать (кому-то)
let|let|let|позволять
cut|cut|cut|резать
hit|hit|hit|ударять
hold|held|held|держать
hide|hid|hidden|прятать
lead|led|led|вести
learn|learnt/learned|learnt/learned|учить, узнавать
mean|meant|meant|означать
shut|shut|shut|закрывать
set|set|set|устанавливать
steal|stole|stolen|красть
throw|threw|thrown|бросать
become|became|become|становиться
lie|lay|lain|лежать
lay|laid|laid|класть, укладывать
rise|rose|risen|подниматься
ring|rang|rung|звонить
shake|shook|shaken|трясти
shine|shone|shone|светить
show|showed|shown|показывать
sink|sank|sunk|тонуть
stick|stuck|stuck|приклеивать, застревать
strike|struck|struck|ударять, бастовать
swear|swore|sworn|клясться, ругаться
sweep|swept|swept|мести
tear|tore|torn|рвать
bite|bit|bitten|кусать
blow|blew|blown|дуть
burn|burnt/burned|burnt/burned|гореть, жечь
cost|cost|cost|стоить
deal|dealt|dealt|иметь дело
dig|dug|dug|копать
dream|dreamt/dreamed|dreamt/dreamed|мечтать, видеть сон
feed|fed|fed|кормить
fight|fought|fought|драться, бороться
forgive|forgave|forgiven|прощать
freeze|froze|frozen|замерзать
hang|hung|hung|вешать
hurt|hurt|hurt|причинять боль
light|lit|lit|зажигать
quit|quit|quit|бросать, уходить
seek|sought|sought|искать
shoot|shot|shot|стрелять
smell|smelt/smelled|smelt/smelled|пахнуть, нюхать
spell|spelt/spelled|spelt/spelled|произносить по буквам
spill|spilt/spilled|spilt/spilled|проливать
split|split|split|раскалывать
spread|spread|spread|распространять
beat|beat|beaten|бить, побеждать
bend|bent|bent|гнуть
bet|bet|bet|держать пари
bind|bound|bound|связывать
bleed|bled|bled|кровоточить
breed|bred|bred|разводить (животных)
broadcast|broadcast|broadcast|транслировать
cast|cast|cast|бросать, отливать
cling|clung|clung|цепляться
creep|crept|crept|ползти, красться
flee|fled|fled|убегать
fling|flung|flung|швырять
grind|ground|ground|молоть
lean|leant/leaned|leant/leaned|наклоняться, опираться
leap|leapt/leaped|leapt/leaped|прыгать
overcome|overcame|overcome|преодолевать
overtake|overtook|overtaken|обгонять
prove|proved|proved/proven|доказывать
rid|rid|rid|избавлять
sew|sewed|sewn/sewed|шить
shed|shed|shed|сбрасывать, проливать
shrink|shrank|shrunk|садиться (о ткани), сокращаться
slide|slid|slid|скользить
spin|spun|spun|вращать, прясть
spit|spat|spat|плевать
thrust|thrust|thrust|толкать
tread|trod|trodden|ступать
undertake|undertook|undertaken|предпринимать
upset|upset|upset|расстраивать
withdraw|withdrew|withdrawn|снимать (деньги), отводить
wring|wrung|wrung|выжимать
weep|wept|wept|плакать
swing|swung|swung|качаться
forbid|forbade|forbidden|запрещать
mistake|mistook|mistaken|ошибаться, принимать за другое
`;
  raw.trim().split('\n').forEach((l, i) => { const [b, p, pp, ru] = l.split('|'); JP.data.irregular.push({ b, p, pp, ru, set: Math.floor(i / 10) + 1 }); });
  JP.data.irregularSets = Math.ceil(JP.data.irregular.length / 10);
})();
