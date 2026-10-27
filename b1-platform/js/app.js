(function (JP) {
  // при возврате на вкладку обновляем главную (смена дня)
  document.addEventListener('visibilitychange', () => { if (!document.hidden && /^(#\/)?$/.test(location.hash)) JP.ui.dispatch(); });
  // сначала узнаём, вошёл ли пользователь (сессия, подтверждённый email), но не дольше 4 секунд
  const wait = JP.cloud && JP.cloud.ready ? Promise.race([JP.cloud.ready, new Promise(r => setTimeout(r, 4000))]) : Promise.resolve();
  wait.catch(() => {}).then(() => JP.ui.dispatch());
})(window.JP);
