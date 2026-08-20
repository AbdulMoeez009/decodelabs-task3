import { $ } from './dom.js';

export function initShortcuts() {
  const avatar = $('#avatarBtn');
  const goToProfile = () => $('nav .nav-link[data-view="profile"]').click();
  avatar.addEventListener('click', goToProfile);
  avatar.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToProfile();
    }
  });
}