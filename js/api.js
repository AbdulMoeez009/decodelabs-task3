const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(body?.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.details = body?.details || [];
    throw error;
  }
  return body;
}

export const api = {
  getHoldings: () => request('/holdings'),
  deleteHolding: ticker => request(`/holdings/${encodeURIComponent(ticker)}`, { method: 'DELETE' }),
  getWatchlist: () => request('/watchlist'),
  addWatchlist: payload => request('/watchlist', { method: 'POST', body: JSON.stringify(payload) }),
  deleteWatchlist: ticker => request(`/watchlist/${encodeURIComponent(ticker)}`, { method: 'DELETE' })
};

export function formatMoney(value) {
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
