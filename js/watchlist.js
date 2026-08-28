import { $, $$ } from './dom.js';
import { watchIcons } from './state.js';
import { api } from './api.js';

export function initWatchlist({ showToast }) {
  const watchGrid = $('#watchGrid');

  function bindWatchRemove(card) {
    card.dataset.watchBound = 'true';
    card.querySelector('.watch-remove').addEventListener('click', async () => {
      const ticker = card.dataset.ticker;
      const button = card.querySelector('.watch-remove');
      button.disabled = true;
      try {
        await api.deleteWatchlist(ticker);
      } catch (error) {
        button.disabled = false;
        showToast('Could not update the database');
        return;
      }
      card.style.transition = 'opacity .3s, transform .3s';
      card.style.opacity = '0';
      card.style.transform = 'scale(.9)';
      setTimeout(() => card.remove(), 300);
      const browseButton = $(`#browseList .browse-row[data-ticker="${ticker}"] .add-watch-btn`);
      if (browseButton) {
        browseButton.textContent = '+ Add';
        browseButton.classList.remove('added');
      }
    });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('#watchGrid .watch-remove');
    const card = button?.closest('.watch-card');
    if (card && card.dataset.watchBound !== 'true') {
      bindWatchRemove(card);
      button.click();
    }
  });

  $$('.watch-card').forEach(bindWatchRemove);
  $$('#browseList .add-watch-btn').forEach(button => button.addEventListener('click', async () => {
    const row = button.closest('.browse-row');
    const ticker = row.dataset.ticker;
    if (button.classList.contains('added')) return;
    const name = $('.coin-name', row).textContent;
    const tickerLine = $('.coin-ticker', row).textContent;
    const price = Number(tickerLine.match(/\$([\d.]+)/)?.[1]);
    button.disabled = true;
    try {
      await api.addWatchlist({ ticker, name, price });
    } catch (error) {
      button.disabled = false;
      showToast(error.status === 409 ? `${name} is already on your watchlist` : 'Could not update the database');
      return;
    }
    const card = document.createElement('article');
    card.className = 'watch-card';
    card.dataset.ticker = ticker;
    card.dataset.name = `${name} ${ticker}`.toLowerCase();
    card.innerHTML = `<div class="coin-info"><span class="coin-icon">${watchIcons[ticker] || '●'}</span><div><div class="coin-name">${name}</div><div class="coin-ticker">${tickerLine}</div></div></div><button class="watch-remove">Remove</button>`;
    card.style.opacity = '0';
    card.style.transform = 'translateY(8px)';
    watchGrid.appendChild(card);
    requestAnimationFrame(() => {
      card.style.transition = 'opacity .3s, transform .3s';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
    bindWatchRemove(card);
    button.textContent = 'Added ✓';
    button.classList.add('added');
    showToast(`${name} added to watchlist`);
  }));
}