import { $, $$ } from './dom.js';
import { api, formatMoney } from './api.js';
import { coinData } from './state.js';

const icons = { BTC:'₿', ETH:'Ξ', SOL:'◎', DOGE:'Ð', ADA:'Ⓝ', LTC:'Ł', MATIC:'◆' };

function holdingRow(holding) {
  const positive = holding.change_percent >= 0;
  const row = document.createElement('article');
  row.className = 'holding-row';
  row.dataset.coin = holding.ticker;
  row.dataset.name = `${holding.name} ${holding.ticker}`.toLowerCase();
  row.dataset.trend = positive ? 'up' : 'down';
  row.innerHTML = `<div class="coin-info"><span class="coin-icon">${icons[holding.ticker] || '●'}</span><div><div class="coin-name">${holding.name}</div><div class="coin-ticker">${holding.ticker}</div></div></div><span class="amount col-hide-mobile">${holding.amount} ${holding.ticker}</span><span class="amount col-hide-mobile">${formatMoney(holding.price)}</span><span class="change ${positive ? 'up' : 'down'}">${positive ? '▲' : '▼'} ${Math.abs(holding.change_percent)}%</span>`;
  return row;
}

function syncHoldingRows(holdings) {
  const available = new Map(holdings.map(holding => [holding.ticker, holding]));
  $$('[data-coin]').forEach(row => {
    const holding = available.get(row.dataset.coin);
    if (!holding) {
      row.remove();
      return;
    }
    const amount = row.querySelector('.amount');
    const values = row.querySelectorAll('.amount');
    if (amount && values.length > 1) {
      values[0].textContent = `${holding.amount} ${holding.ticker}`;
      values[1].textContent = formatMoney(holding.price);
    }
    const change = row.querySelector('.change');
    if (change) {
      const positive = holding.change_percent >= 0;
      change.textContent = `${positive ? '▲' : '▼'} ${Math.abs(holding.change_percent)}%`;
      change.classList.toggle('up', positive);
      change.classList.toggle('down', !positive);
    }
  });

  ['#holdingsList', '#holdingsListFull'].forEach(selector => {
    const list = $(selector);
    if (!list) return;
    holdings.forEach(holding => {
      if (!list.querySelector(`[data-coin="${holding.ticker}"]`)) list.appendChild(holdingRow(holding));
    });
  });

  Object.keys(coinData).forEach(ticker => {
    if (!available.has(ticker)) delete coinData[ticker];
  });
  holdings.forEach(holding => {
    const positive = holding.change_percent >= 0;
    coinData[holding.ticker] = {
      name: holding.name,
      icon: icons[holding.ticker] || '●',
      amount: `${holding.amount} ${holding.ticker}`,
      price: formatMoney(holding.price),
      value: formatMoney(holding.amount * holding.price),
      change: `${positive ? '▲' : '▼'} ${Math.abs(holding.change_percent)}%`,
      up: positive
    };
  });
}

function syncWatchlistRows(watchlist) {
  const available = new Set(watchlist.map(item => item.ticker));
  $$('#watchGrid .watch-card[data-ticker]').forEach(card => {
    if (!available.has(card.dataset.ticker)) card.remove();
  });
  const grid = $('#watchGrid');
  watchlist.forEach(item => {
    if (grid.querySelector(`[data-ticker="${item.ticker}"]`)) return;
    const card = document.createElement('article');
    card.className = 'watch-card';
    card.dataset.ticker = item.ticker;
    card.dataset.name = `${item.name} ${item.ticker}`.toLowerCase();
    card.innerHTML = `<div class="coin-info"><span class="coin-icon">●</span><div><div class="coin-name">${item.name}</div><div class="coin-ticker">${item.ticker} · ${formatMoney(item.price)}</div></div></div><button class="watch-remove">Remove</button>`;
    grid.appendChild(card);
  });
}

export async function initDataSync({ showToast }) {
  try {
    const [holdings, watchlist] = await Promise.all([api.getHoldings(), api.getWatchlist()]);
    syncHoldingRows(holdings);
    syncWatchlistRows(watchlist);
  } catch (error) {
    showToast('Live database is unavailable; showing local data');
  }
}
