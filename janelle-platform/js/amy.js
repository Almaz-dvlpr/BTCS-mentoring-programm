// Голос виртуального ассистента Эми: сообщения зависят от режима, прогресса и тона общения.
(function (JP) {
  const U = JP.U, E = JP.E, S = () => JP.store.get();
  const tone = () => (S().profile && S().profile.tone) || 'soft';
  const pick = (o) => o[tone()] || o.soft;
  const A = {};
  A.name = () => (S().profile && S().profile.name) || 'Жанель';
  A.hello = () => { const h = new Date().getHours(); return h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'; };

  A.praise = score => {
    if (score >= 0.9) return pick({ soft: 'Отлично! Тема усвоена очень хорошо 🎉', firm: 'Отличный результат. Тема закрыта.', fun: 'Вот это да! Мои схемы дрожат от зависти 😎' });
    if (score >= 0.7) return pick({ soft: 'Хороший результат! Ошибки разберём и закрепим.', firm: 'Хорошо. Разбери ошибки, и тема закрыта.', fun: 'Почти блеск! Осталось отполировать пару ошибок ✨' });
    return pick({ soft: 'Тема пока даётся непросто — и это нормально. Я верну её в повторение завтра, и мы закрепим.', firm: 'Результат ниже нормы. Перечитай правило, завтра повторим.', fun: 'Эта тема пока выигрывает 1:0 — но реванш уже запланирован на завтра 😉' });
  };

  A.homeMessage = (day) => {
    const n = A.name(), p = S().profile, today = U.today();
    const open = day.tasks.filter(t => !t.done), mins = open.reduce((a, t) => a + t.minutes, 0);
    const streak = E.streak(), missed = E.missedScheduledDays();
    const firstEver = Object.keys(S().units).filter(k => S().units[k].status === 'done').length === 0 && !E.didStudy(today) && !Object.values(S().days).some(d => d.minutes > 0);
    const mile = [3, 7, 14, 21, 30, 50, 100].includes(streak) && E.didStudy(today) ? ` Кстати: серия ${streak} ${U.plural(streak, 'день', 'дня', 'дней')} подряд — это настоящая привычка!` : '';
    if (!E.isStudyDay(today) && !day.tasks.some(t => t.done) && E.pendingStageTest() == null && !day.forced) {
      return pick({ soft: `${n}, сегодня по плану отдых. Мозг как раз закрепляет вчерашнее. Если хочется — можно сделать короткую 10-минутную разминку.`, firm: `${n}, сегодня выходной по расписанию. Отдыхай. Разминка на 10 минут — по желанию.`, fun: `${n}, сегодня английский на диване 🛋️ — по расписанию отдых. Но разминку на 10 минут никто не отменял!` });
    }
    if (!open.length) {
      return pick({ soft: `${A.hello()}, ${n}! План на сегодня выполнен — ты молодец 🎉 Можешь отдохнуть или взять ещё один урок.${mile}`, firm: `План на сегодня выполнен. Дополнительный урок — по желанию.${mile}`, fun: `Всё сделано! Эми аплодирует стоя 👏 Хочешь ещё урок — без проблем.${mile}` });
    }
    if (firstEver) {
      return pick({ soft: `${A.hello()}, ${n}! Я Эми, и я буду вести тебя к B1. Сегодня в плане ${open.length} ${U.plural(open.length, 'шаг', 'шага', 'шагов')} — примерно ${mins} минут. Начнём с первого, всё объясню по ходу.`, firm: `${n}, начинаем. Сегодня ${open.length} ${U.plural(open.length, 'задача', 'задачи', 'задач')}, около ${mins} минут. Жми «Начать».`, fun: `Привет, ${n}! Эми на связи 🚀 Сегодня ${open.length} ${U.plural(open.length, 'шаг', 'шага', 'шагов')} (~${mins} мин). Поехали!` });
    }
    if (missed >= 2) {
      return pick({ soft: `${n}, давно не виделись 🙂 Я не копила «долги» — просто продолжаем с того места, где остановились. Сегодня мягкий вход: ~${mins} минут.`, firm: `${n}, пропущено ${missed} ${U.plural(missed, 'занятие', 'занятия', 'занятий')} подряд. Возвращаемся в график: сегодня ~${mins} минут.`, fun: `${n}, я уже начала скучать! 🥺 Возвращаемся без паники: сегодня всего ~${mins} минут.` });
    }
    if (missed === 1) {
      return pick({ soft: `${n}, вчера не получилось — бывает. Сегодня просто возвращаемся в ритм: ~${mins} минут.`, firm: `Вчерашнее занятие пропущено. Сегодня: ~${mins} минут, без пропусков.`, fun: `Вчера был «выходной от английского»? Бывает 😄 Сегодня ~${mins} минут — и мы в игре.` });
    }
    const wk = E.weekStats();
    const extra = streak >= 2 ? ` Серия: ${streak} ${U.plural(streak, 'день', 'дня', 'дней')} подряд 🔥.` : '';
    const left = Math.max(0, wk.goalMin - wk.minutes);
    return pick({
      soft: `${A.hello()}, ${n}! На сегодня ${open.length} ${U.plural(open.length, 'шаг', 'шага', 'шагов')}, ~${mins} минут.${extra}${left && left < 200 ? ` До недельной цели осталось ${left} мин.` : ''}${mile}`,
      firm: `${n}, план на сегодня: ${open.length} ${U.plural(open.length, 'задача', 'задачи', 'задач')}, ~${mins} минут.${extra}${mile}`,
      fun: `${A.hello()}, ${n}! ${open.length} ${U.plural(open.length, 'шаг', 'шага', 'шагов')} до звания «Королева английского» (~${mins} мин) 👑${extra}${mile}`
    });
  };

  A.afterTask = (score) => {
    const next = E.nextTask();
    const tail = next ? ' Дальше по плану: «' + next.title + '».' : ' На сегодня это всё — план выполнен!';
    return (score == null ? '' : A.praise(score) + ' ') + tail.trim();
  };
  JP.amy = A;
})(window.JP);
