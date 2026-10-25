(function (JP) {
  // небольшой хук: при возврате на вкладку обновляем главную (смена дня)
  document.addEventListener('visibilitychange', () => { if (!document.hidden && /^(#\/)?$/.test(location.hash)) JP.ui.dispatch(); });
  JP.ui.dispatch();
})(window.JP);
