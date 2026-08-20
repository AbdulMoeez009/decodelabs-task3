import { $, $$ } from './dom.js';

export function initNotifications({ modalA11y }) {
  const button = $('#notifBtn');
  const panel = $('#notifPanel');
  const badge = $('#notifBadge');
  const items = $$('.notif-item');
  const modal = $('#notifModal');

  function updateBadge() {
    const unread = $$('.notif-item.unread').length;
    badge.textContent = unread;
    badge.classList.toggle('hidden', unread === 0);
  }

  function closeDetail() {
    modal.classList.remove('open');
    modalA11y.close(modal);
  }

  button.addEventListener('click', event => {
    event.stopPropagation();
    const open = panel.classList.toggle('open');
    button.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', event => {
    if (!panel.contains(event.target) && event.target !== button) {
      panel.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }
  });

  items.forEach(item => {
    const openDetail = () => {
      $('#notifModalIcon').textContent = $('.notif-icon', item).textContent;
      $('#notifModalTitle').textContent = $('.notif-title', item).textContent;
      $('#notifModalTime').textContent = $('.notif-time', item).textContent;
      $('#notifModalText').textContent = $('.notif-detail', item).textContent.trim();
      modal.classList.add('open');
      modalA11y.open(modal, closeDetail);
      panel.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      item.classList.remove('unread');
      updateBadge();
    };
    item.addEventListener('click', openDetail);
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetail();
      }
    });
  });

  $('#notifModalClose').addEventListener('click', closeDetail);
  $('#notifModalOk').addEventListener('click', closeDetail);
  modal.addEventListener('click', event => { if (event.target === modal) closeDetail(); });
  modal.addEventListener('a11y-escape', closeDetail);
  $('#markAllRead').addEventListener('click', event => {
    event.stopPropagation();
    items.forEach(item => item.classList.remove('unread'));
    updateBadge();
  });
  updateBadge();
}