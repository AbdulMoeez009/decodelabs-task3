import { $, $$ } from './dom.js';
import { appState, searchPlaceholders } from './state.js';

export function initNavigation() {
  const navLinks = $$('nav .nav-link[data-view]');
  const views = $$('.view');
  const searchInput = $('.search input');

  function filterGroup(selector, emptyId) {
    const query = searchInput.value.trim().toLowerCase();
    const items = $$(selector);
    let visibleCount = 0;
    items.forEach(item => {
      const show = !item.dataset.name || item.dataset.name.includes(query);
      item.classList.toggle('hidden-row', !show);
      item.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });
    const empty = $(`#${emptyId}`);
    if (empty) empty.style.display = visibleCount === 0 && query ? 'block' : 'none';
  }

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    if (appState.currentView === 'overview') {
      const rows = $$('#holdingsList .holding-row[data-name]');
      let visibleCount = 0;
      rows.forEach(row => {
        const show = row.dataset.name.includes(query) && (appState.currentFilter === 'all' || row.dataset.trend === appState.currentFilter);
        row.classList.toggle('hidden-row', !show);
        if (show) visibleCount++;
      });
      $('#holdingsEmpty').style.display = visibleCount === 0 ? 'block' : 'none';
    } else if (appState.currentView === 'holdings') {
      filterGroup('#holdingsListFull .holding-row[data-name]', 'holdingsFullEmpty');
    } else if (appState.currentView === 'transactions') {
      filterGroup('#txList .tx-row[data-name]', 'txEmpty');
    } else if (appState.currentView === 'watchlist') {
      filterGroup('#watchGrid .watch-card[data-name]', 'watchEmpty');
      filterGroup('#browseList .browse-row[data-name]', 'browseEmpty');
    }
  }

  navLinks.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    $$('.modal-overlay.open').forEach(modal => modal.dispatchEvent(new Event('a11y-escape')));
    navLinks.forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    const target = link.dataset.view;
    views.forEach(view => view.classList.toggle('active', view.id === `view-${target}`));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    appState.currentView = target;
    searchInput.placeholder = searchPlaceholders[target] || 'Search…';
    searchInput.value = '';
    applyFilters();
  }));

  searchInput.addEventListener('input', applyFilters);
  $$('#filterPills .pill').forEach(pill => pill.addEventListener('click', () => {
    $$('#filterPills .pill').forEach(item => item.classList.remove('active'));
    pill.classList.add('active');
    appState.currentFilter = pill.dataset.filter;
    applyFilters();
  }));

  return { applyFilters };
}