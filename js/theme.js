import { $ } from './dom.js';

export function initTheme() {
  const toggle = $('#themeToggle');
  const root = document.documentElement;
  const knob = $('.knob', toggle);

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    knob.textContent = theme === 'dark' ? '☀' : '🌙';
    toggle.setAttribute('aria-pressed', theme === 'light');
  }

  toggle.addEventListener('click', () => {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  setTheme('dark');
}