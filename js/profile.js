import { $ } from './dom.js';

export function initProfile({ showToast }) {
  const editButton = $('#editProfileBtn');
  const infoList = $('#profileInfoList');
  const editForm = $('#profileEditForm');

  editButton.addEventListener('click', () => {
    const opening = !editForm.classList.contains('open');
    editForm.classList.toggle('open', opening);
    infoList.style.display = opening ? 'none' : '';
    editButton.textContent = opening ? 'Cancel' : 'Edit Profile';
  });

  editForm.addEventListener('submit', event => {
    event.preventDefault();
    $('#pv-name').textContent = $('#editName').value;
    $('#pv-email').textContent = $('#editEmail').value;
    $('#pv-phone').textContent = $('#editPhone').value;
    $('#pv-country').textContent = $('#editCountry').value;
    editForm.classList.remove('open');
    infoList.style.display = '';
    editButton.textContent = 'Edit Profile';
    showToast('Profile updated');
  });
}