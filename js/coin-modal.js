import { $, $$ } from './dom.js';
import { coinData } from './state.js';
import { api } from './api.js';

export function initCoinModal({ showToast, modalA11y }) {
  const modal = $('#coinModal');
  let activeCoin = null;

  function closeCoinModal() {
    modal.classList.remove('open');
    activeCoin = null;
    modalA11y.close(modal);
  }

  function openCoinModal(ticker) {
    const coin = coinData[ticker];
    if (!coin) return;
    activeCoin = ticker;
    $('#modalIcon').textContent = coin.icon;
    $('#modalName').textContent = coin.name;
    $('#modalTicker').textContent = ticker;
    $('#modalAmount').textContent = coin.amount;
    $('#modalPrice').textContent = coin.price;
    $('#modalValue').textContent = coin.value;
    $('#modalChange').textContent = coin.change;
    $('#modalChange').style.color = coin.up ? 'var(--gain)' : 'var(--loss)';
    modal.classList.add('open');
    modalA11y.open(modal, closeCoinModal);
  }

  document.addEventListener('click', event => {
    const row = event.target.closest('.holding-row[data-coin]');
    if (row) openCoinModal(row.dataset.coin);
  });
  document.addEventListener('keydown', event => {
    const row = event.target.closest('.holding-row[data-coin]');
    if (row && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openCoinModal(row.dataset.coin);
    }
  });
  $$('.holding-row[data-coin]').forEach(row => {
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'button');
  });

  $('#modalClose').addEventListener('click', closeCoinModal);
  $('#modalCancel').addEventListener('click', closeCoinModal);
  modal.addEventListener('click', event => { if (event.target === modal) closeCoinModal(); });

  $('#modalSell').addEventListener('click', async () => {
    if (!activeCoin) return;
    const ticker = activeCoin;
    const name = coinData[ticker].name;
    const button = $('#modalSell');
    button.disabled = true;
    try {
      await api.deleteHolding(ticker);
      $$(`.holding-row[data-coin="${ticker}"]`).forEach(row => {
        row.style.transition = 'opacity .3s, transform .3s';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-12px)';
        setTimeout(() => row.remove(), 300);
      });
      closeCoinModal();
      setTimeout(() => showToast(`${name} (${ticker}) sold and removed from holdings`), 320);
    } catch (error) {
      showToast(error.status === 409 ? 'Cannot delete holding with linked transactions' : 'Could not update the database');
    } finally {
      button.disabled = false;
    }
  });

  return { openCoinModal };
}