import { $, $$ } from './dom.js';
import { watchIcons } from './state.js';

export function initWatchlist({ showToast }) {
  const watchGrid = $('#watchGrid');

  function bindWatchRemove(card) {
    card.querySelector('.watch-remove').addEventListener('click', () => {
      const ticker = card.dataset.ticker;
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

  $$('.watch-card').forEach(bindWatchRemove);
  $$('#browseList .add-watch-btn').forEach(button => button.addEventListener('click', () => {
    const row = button.closest('.browse-row');
    const ticker = row.dataset.ticker;
    if (button.classList.contains('added')) return;
    const name = $('.coin-name', row).textContent;
    const tickerLine = $('.coin-ticker', row).textContent;
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