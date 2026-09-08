const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertConfigured() {
  if (!supabaseUrl || !serviceRoleKey) {
    const error = new Error('Supabase environment variables are missing');
    error.code = 'SUPABASE_CONFIG_MISSING';
    error.status = 503;
    throw error;
  }
}

async function request(table, options = {}) {
  assertConfigured();
  const { headers = {}, ...fetchOptions } = options;
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...headers
    },
    ...fetchOptions
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(body?.message || body?.error || `Supabase request failed with status ${response.status}`);
    error.status = response.status;
    error.code = body?.code;
    throw error;
  }
  return body;
}

function query(table, params) {
  const search = new URLSearchParams(params);
  return request(`${table}?${search}`);
}

export const supabaseStore = {
  getHoldings: () => query('holdings', { select: '*', order: 'name.asc' }),
  getHolding: ticker => query('holdings', { select: '*', ticker: `eq.${ticker}` }).then(rows => rows[0] || null),
  insertHolding: payload => request('holdings', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload) }).then(rows => rows[0]),
  updateHolding: (ticker, payload) => request(`holdings?ticker=eq.${encodeURIComponent(ticker)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload) }).then(rows => rows[0] || null),
  deleteHolding: ticker => request(`holdings?ticker=eq.${encodeURIComponent(ticker)}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } }).then(rows => rows.length),
  getTransactions: () => query('transactions', { select: '*', order: 'traded_at.desc' }),
  getTransaction: id => query('transactions', { select: '*', id: `eq.${id}` }).then(rows => rows[0] || null),
  insertTransaction: payload => request('transactions', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload) }).then(rows => rows[0]),
  deleteTransaction: id => request(`transactions?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } }).then(rows => rows.length),
  getWatchlist: () => query('watchlist', { select: '*', order: 'name.asc' }),
  insertWatchlist: payload => request('watchlist', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload) }).then(rows => rows[0]),
  deleteWatchlist: ticker => request(`watchlist?ticker=eq.${encodeURIComponent(ticker)}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } }).then(rows => rows.length),
  health: () => query('holdings', { select: 'id', limit: '1' })
};