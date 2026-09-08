import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabaseStore } from './supabase-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100kb' }));
app.use(express.static(__dirname));

function sendError(res, status, message, details) {
  res.status(status).json({ error: message, ...(details ? { details } : {}) });
}
function requireObject(body) { return body && typeof body === 'object' && !Array.isArray(body); }
function requireText(value, field) {
  if (typeof value !== 'string' || value.trim().length < 1 || value.trim().length > 80) return `${field} must be a non-empty string up to 80 characters`;
  return null;
}
function requireNumber(value, field, minimum = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum) return `${field} must be a number greater than or equal to ${minimum}`;
  return null;
}
function validateHolding(body) {
  if (!requireObject(body)) return ['Request body must be a JSON object'];
  return [requireText(body.ticker, 'ticker'), requireText(body.name, 'name'), requireNumber(body.amount, 'amount'), requireNumber(body.price, 'price'), requireNumber(body.changePercent ?? 0, 'changePercent')].filter(Boolean);
}
function validateTransaction(body) {
  if (!requireObject(body)) return ['Request body must be a JSON object'];
  const errors = [requireText(body.ticker, 'ticker'), requireNumber(body.amount, 'amount', Number.MIN_VALUE), requireNumber(body.price, 'price')].filter(Boolean);
  if (!['buy', 'sell'].includes(body.type)) errors.push('type must be either buy or sell');
  return errors;
}
function validateWatchlist(body) {
  if (!requireObject(body)) return ['Request body must be a JSON object'];
  return [requireText(body.ticker, 'ticker'), requireText(body.name, 'name'), requireNumber(body.price, 'price')].filter(Boolean);
}
function handleDatabaseError(res, error) {
  if (error.code === 'SUPABASE_CONFIG_MISSING') return sendError(res, 503, 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel settings.');
  if (error.code === '23505' || error.status === 409) return sendError(res, 409, 'Resource conflicts with an existing record');
  if (error.code === '23503') return sendError(res, 409, 'Holding has linked transactions');
  console.error(error);
  return sendError(res, 500, 'Database operation failed');
}
function normalizeHolding(body) {
  return { ticker: body.ticker.trim().toUpperCase(), name: body.name.trim(), amount: body.amount, price: body.price, change_percent: body.changePercent ?? 0 };
}

app.get('/api/health', async (_req, res) => {
  try { await supabaseStore.health(); res.json({ status: 'ok', service: 'vault-api', database: 'supabase' }); }
  catch (error) { handleDatabaseError(res, error); }
});
app.get('/api/docs', (_req, res) => res.json({ name: 'Vault API', database: 'Supabase PostgreSQL', endpoints: { holdings: ['GET /api/holdings', 'POST /api/holdings', 'PUT /api/holdings/:ticker', 'DELETE /api/holdings/:ticker'], transactions: ['GET /api/transactions', 'POST /api/transactions', 'DELETE /api/transactions/:id'], watchlist: ['GET /api/watchlist', 'POST /api/watchlist', 'DELETE /api/watchlist/:ticker'] } }));

app.get('/api/holdings', async (_req, res) => { try { res.json(await supabaseStore.getHoldings()); } catch (error) { handleDatabaseError(res, error); } });
app.post('/api/holdings', async (req, res) => {
  const errors = validateHolding(req.body); if (errors.length) return sendError(res, 400, 'Validation failed', errors);
  try { res.status(201).json(await supabaseStore.insertHolding(normalizeHolding(req.body))); } catch (error) { handleDatabaseError(res, error); }
});
app.put('/api/holdings/:ticker', async (req, res) => {
  const errors = validateHolding(req.body); if (errors.length) return sendError(res, 400, 'Validation failed', errors);
  try { const holding = await supabaseStore.updateHolding(req.params.ticker.toUpperCase(), normalizeHolding(req.body)); if (!holding) return sendError(res, 404, 'Holding not found'); res.json(holding); } catch (error) { handleDatabaseError(res, error); }
});
app.delete('/api/holdings/:ticker', async (req, res) => {
  try { const changes = await supabaseStore.deleteHolding(req.params.ticker.toUpperCase()); if (!changes) return sendError(res, 404, 'Holding not found'); res.status(204).send(); } catch (error) { handleDatabaseError(res, error); }
});

app.get('/api/transactions', async (_req, res) => { try { res.json(await supabaseStore.getTransactions()); } catch (error) { handleDatabaseError(res, error); } });
app.post('/api/transactions', async (req, res) => {
  const errors = validateTransaction(req.body); if (errors.length) return sendError(res, 400, 'Validation failed', errors);
  const ticker = req.body.ticker.trim().toUpperCase();
  try {
    if (!await supabaseStore.getHolding(ticker)) return sendError(res, 404, 'Holding ticker not found');
    const transaction = await supabaseStore.insertTransaction({ ticker, type: req.body.type, amount: req.body.amount, price: req.body.price, ...(req.body.tradedAt ? { traded_at: req.body.tradedAt } : {}) });
    res.status(201).json(transaction);
  } catch (error) { handleDatabaseError(res, error); }
});
app.delete('/api/transactions/:id', async (req, res) => { try { const changes = await supabaseStore.deleteTransaction(Number(req.params.id)); if (!changes) return sendError(res, 404, 'Transaction not found'); res.status(204).send(); } catch (error) { handleDatabaseError(res, error); } });

app.get('/api/watchlist', async (_req, res) => { try { res.json(await supabaseStore.getWatchlist()); } catch (error) { handleDatabaseError(res, error); } });
app.post('/api/watchlist', async (req, res) => {
  const errors = validateWatchlist(req.body); if (errors.length) return sendError(res, 400, 'Validation failed', errors);
  try { res.status(201).json(await supabaseStore.insertWatchlist({ ticker: req.body.ticker.trim().toUpperCase(), name: req.body.name.trim(), price: req.body.price })); } catch (error) { handleDatabaseError(res, error); }
});
app.delete('/api/watchlist/:ticker', async (req, res) => { try { const changes = await supabaseStore.deleteWatchlist(req.params.ticker.toUpperCase()); if (!changes) return sendError(res, 404, 'Watchlist coin not found'); res.status(204).send(); } catch (error) { handleDatabaseError(res, error); } });

app.use('/api', (_req, res) => sendError(res, 404, 'API route not found'));
app.use((error, _req, res, next) => { if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') return sendError(res, 400, 'Request body must contain valid JSON'); return next(error); });

export default app;

if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Vault running at http://127.0.0.1:${port}/crypto-tracker.html (Supabase)`));
}
