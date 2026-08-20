import { $, $$ } from './dom.js';

export function initSettings({ showToast }) {
  $$('[data-mini-toggle]').forEach(button => button.addEventListener('click', () => {
    const isOn = button.classList.toggle('is-on');
    const knob = $('.knob', button);
    knob.style.transform = isOn ? 'translateX(24px)' : 'translateX(0)';
    knob.textContent = isOn ? '✓' : '';
  }));

  $('#settingsForm').addEventListener('submit', event => {
    event.preventDefault();
    showToast('Changes saved');
  });
}