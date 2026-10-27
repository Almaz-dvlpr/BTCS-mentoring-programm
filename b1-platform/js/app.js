(function (JP) {
  // при возврате на вкладку обновляем главную (смена дня)
  document.addEventListener('visibilitychange', () => { if (!document.hidden && /^(#\/)?$/.test(location.hash)) JP.ui.dispatch(); });
  // режим просмотра из кабинета преподавателя: заметная полоса сверху
  if (JP.preview) {
    const P = JP.preview, label = P.kind === 'student' ? 'Просмотр глазами ученика: ' + (P.name || '') + ' (изменения не сохраняются на сервере)' : P.kind === 'new' ? 'Тестовый ученик: начало с нуля' : 'Тестовый ученик с прогрессом, все этапы открыты';
    const bar = document.createElement('div'); bar.id = 'previewbar';
    bar.innerHTML = '<span>👁 ' + JP.U.esc(label) + '</span><span class="pv-actions">' + (P.kind === 'student' ? '' : '<button id="pvreset">Сбросить</button>') + '<button id="pvexit">Выйти из просмотра</button></span>';
    document.body.prepend(bar); document.body.classList.add('has-preview');
    document.getElementById('pvexit').onclick = () => { try { sessionStorage.removeItem('b1.preview'); } catch (e) {} if (window.opener) { window.close(); } setTimeout(() => { location.href = location.pathname + '#/admin'; location.reload(); }, 50); };
    const r = document.getElementById('pvreset'); if (r) r.onclick = () => { if (!confirm('Сбросить тестового ученика?')) return; try { localStorage.setItem('b1.preview.v1', P.kind === 'demo' ? JSON.stringify(JP.demoState()) : ''); if (P.kind !== 'demo') localStorage.removeItem('b1.preview.v1'); } catch (e) {} location.hash = '#/'; location.reload(); };
  }
  // сначала узнаём, вошёл ли пользователь (сессия, подтверждённый email), но не дольше 4 секунд
  const wait = JP.cloud && JP.cloud.ready ? Promise.race([JP.cloud.ready, new Promise(r => setTimeout(r, 4000))]) : Promise.resolve();
  wait.catch(() => {}).then(() => JP.ui.dispatch());
})(window.JP);
