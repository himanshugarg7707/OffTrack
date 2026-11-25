(function () {
  'use strict';

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const roleInput = document.getElementById('login-role');
  const error = document.getElementById('login-error');

  document.getElementById('toggle-password').addEventListener('click', event => {
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    event.currentTarget.textContent = showing ? 'Show' : 'Hide';
    event.currentTarget.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    error.textContent = '';
    if (!emailInput.validity.valid || !emailInput.value.trim()) {
      error.textContent = 'Enter a valid email address.';
      emailInput.focus();
      return;
    }
    if (passwordInput.value.length < 6) {
      error.textContent = 'Enter a password with at least 6 characters.';
      passwordInput.focus();
      return;
    }

    try {
      sessionStorage.setItem('offtrackDemoSession', JSON.stringify({
        email: emailInput.value.trim(),
        role: roleInput.value
      }));
      window.location.replace('dashboard.html');
    } catch (storageError) {
      error.textContent = 'This browser could not start a demo session. Enable session storage and try again.';
    }
  });
})();
