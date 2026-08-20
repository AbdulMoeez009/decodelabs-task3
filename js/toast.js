import { $ } from './dom.js';

export function createToast() {
  const toast = $('#toast');
  let hideTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  return { showToast };
}