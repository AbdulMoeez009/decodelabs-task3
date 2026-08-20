import { $, $$ } from './dom.js';
import { coinData, realizedTrades } from './state.js';

export function initTrades({ openCoinModal, modalA11y }) {
  const tradeModal = $('#tradeModal');
  const listModal = $('#listModal');

  function bindKeyboardActivation(element, handler) {
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler();
      }
    });
  }

  function closeTradeModal() {
    tradeModal.classList.remove('open');
    modalA11y.close(tradeModal);
  }

  function openTradeModal(index) {
    const trade = realizedTrades[index];
    if (!trade) return;
    $('#tradeModalIcon').textContent = trade.icon;
    $('#tradeModalName').textContent = trade.name;
    $('#tradeModalTicker').textContent = trade.coin;
    $('#tradeModalDate').textContent = trade.date;
    $('#tradeModalProceeds').textContent = trade.proceeds;
    const gain = $('#tradeModalGain');
    gain.textContent = trade.gainLabel;
    gain.style.color = trade.gain >= 0 ? 'var(--gain)' : 'var(--loss)';
    tradeModal.classList.add('open');
    modalA11y.open(tradeModal, closeTradeModal);
  }

  function closeListModal() {
    listModal.classList.remove('open');
    modalA11y.close(listModal);
  }

  function openListModal(title, items) {
    $('#listModalTitle').textContent = title;
    const body = $('#listModalBody');
    body.innerHTML = items.length
      ? items.map(item => `<div class="stat-card" data-key="${item.key}" style="cursor:pointer;padding:.8rem 1rem;"><span class="label">${item.label}</span><span class="value" style="font-size:1.1rem;${item.color ? `color:${item.color};` : ''}">${item.value}</span></div>`).join('')
      : '<p class="empty-state">Nothing to show.</p>';
    $$('[data-key]', body).forEach(element => element.addEventListener('click', () => {
      const item = items.find(entry => entry.key === element.dataset.key);
      closeListModal();
      item?.onClick?.();
    }));
    listModal.classList.add('open');
    modalA11y.open(listModal, closeListModal);
  }

  $('#tradeModalClose').addEventListener('click', closeTradeModal);
  tradeModal.addEventListener('click', event => { if (event.target === tradeModal) closeTradeModal(); });
  tradeModal.addEventListener('a11y-escape', closeTradeModal);
  $('#listModalClose').addEventListener('click', closeListModal);
  listModal.addEventListener('click', event => { if (event.target === listModal) closeListModal(); });
  listModal.addEventListener('a11y-escape', closeListModal);

  $$('#revenueTradesList .holding-row[data-trade]').forEach(row => {
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'button');
    row.addEventListener('click', () => openTradeModal(row.dataset.trade));
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openTradeModal(row.dataset.trade);
      }
    });
  });

  $('#statBestPerformer').addEventListener('click', () => openCoinModal('ETH'));
  bindKeyboardActivation($('#statBestPerformer'), () => openCoinModal('ETH'));
  $('#statVolume').addEventListener('click', () => openListModal('Recent Activity (24h)', [
    { key:'1', label:'Bought Ethereum', value:'+1.2 ETH', color:'var(--gain)', onClick:() => openCoinModal('ETH') },
    { key:'2', label:'Sold Solana', value:'−40 SOL', color:'var(--loss)', onClick:() => openTradeModal(0) },
    { key:'3', label:'Bought Bitcoin', value:'+0.05 BTC', color:'var(--gain)', onClick:() => openCoinModal('BTC') }
  ]));
  bindKeyboardActivation($('#statVolume'), () => $('#statVolume').click());
  $('#statAssets').addEventListener('click', () => openListModal('All Holdings', Object.keys(coinData).map(ticker => ({
    key: ticker,
    label: `${coinData[ticker].name} (${ticker})`,
    value: coinData[ticker].value,
    color: coinData[ticker].up ? 'var(--gain)' : 'var(--loss)',
    onClick: () => openCoinModal(ticker)
  }))));
  bindKeyboardActivation($('#statAssets'), () => $('#statAssets').click());

  function openRealizedList() {
    openListModal('Realized Trades (YTD)', realizedTrades.map((trade, index) => ({
      key: String(index),
      label: `${trade.name} — ${trade.date}`,
      value: trade.gainLabel,
      color: trade.gain >= 0 ? 'var(--gain)' : 'var(--loss)',
      onClick: () => openTradeModal(index)
    })));
  }

  $('#statRealizedPL').addEventListener('click', openRealizedList);
  bindKeyboardActivation($('#statRealizedPL'), openRealizedList);
  $('#statYtd').addEventListener('click', openRealizedList);
  bindKeyboardActivation($('#statYtd'), openRealizedList);
  $('#statBestTrade').addEventListener('click', () => openTradeModal(3));
  bindKeyboardActivation($('#statBestTrade'), () => openTradeModal(3));
  $('#statThisMonth').addEventListener('click', () => openListModal("This Month's Trades", [
    { key:'0', label:'Solana — Aug 12', value:'+$812', color:'var(--gain)', onClick:() => openTradeModal(0) },
    { key:'1', label:'Dogecoin — Aug 8', value:'−$204', color:'var(--loss)', onClick:() => openTradeModal(1) }
  ]));
  bindKeyboardActivation($('#statThisMonth'), () => $('#statThisMonth').click());

  return { openTradeModal };
}