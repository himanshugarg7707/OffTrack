(function () {
  'use strict';
  let session;
  try {
    session = JSON.parse(sessionStorage.getItem('offtrackDemoSession') || 'null');
  } catch (error) {
    session = null;
  }
  if (!session || !session.email || !session.role) {
    window.location.replace('index.html');
    return;
  }

  const chip = document.getElementById('session-user-chip');
  if (chip) chip.textContent = `${session.role} · ${session.email}`;
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem('offtrackDemoSession');
    window.location.replace('index.html');
  });
})();
