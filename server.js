import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;
const db = new DatabaseSync(path.join(__dirname, 'vault.db'));

db.exec('PRAGMA foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    price REAL NOT NULL CHECK (price >= 0),
    change_percent REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
    amount REAL NOT NULL CHECK (amount > 0),
    price REAL NOT NULL CHECK (price >= 0),
    traded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker) REFERENCES holdings(ticker)
  );
  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const seedHolding = db.prepare(`
  INSERT OR IGNORE INTO holdings (ticker, name, amount, price, change_percent)
  VALUES (@ticker, @name, @amount, @price, @changePercent)
`);
[
  ['BTC', 'Bitcoin', 0.842, 61204, 2.14],
  ['ETH', 'Ethereum', 6.15, 3412, 12.4],
  ['SOL', 'Solana', 142, 148.2, -3.02],
  ['DOGE', 'Dogecoin', 18420, 0.184, -1.15],
  ['ADA', 'Cardano', 2140, 0.61, 5.8],
  ['LTC', 'Litecoin', 9.4, 92.1, -0.6],
  ['MATIC', 'Polygon', 3020, 0.72, 1.9]
].forEach(([ticker, name, amount, price, changePercent]) => seedHolding.run({ ticker, name, amount, price, changePercent }));

const seedTransaction = db.prepare(`
  INSERT INTO transactions (ticker, type, amount, price, traded_at)
  SELECT @ticker, @type, @amount, @price, @tradedAt
  WHERE NOT EXISTS (
    SELECT 1 FROM transactions
    WHERE ticker = @ticker AND type = @type AND amount = @amount AND price = @price AND traded_at = @tradedAt
  )
`);
[
  ['ETH', 'buy', 1.2, 3398.2, '2026-08-13 16:02:00'],
  ['SOL', 'sell', 40, 148.2, '2026-08-12 11:20:00'],
  ['BTC', 'buy', 0.05, 61204, '2026-08-10 09:15:00'],
  ['DOGE', 'sell', 2000, 0.184, '2026-08-08 18:47:00']
].forEach(([ticker, type, amount, price, tradedAt]) => seedTransaction.run({ ticker, type, amount, price, tradedAt }));

const seedWatchlist = db.prepare(`
  INSERT OR IGNORE INTO watchlist (ticker, name, price) VALUES (@ticker, @name, @price)
`);
[
  ['DOT', 'Polkadot', 6.42],
  ['LINK', 'Chainlink', 14.9],
  ['AVAX', 'Avalanche', 28.05]
].forEach(([ticker, name, price]) => seedWatchlist.run({ ticker, name, price }));

app.use(express.json({ limit: '100kb' }));
app.use(express.static(__dirname));

function sendError(res, status, message, details) {
  res.status(status).json({ error: message, ...(details ? { details } : {}) });
}

function requireObject(body) {
  return body && typeof body === 'object' && !Array.isArray(body);
}

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim().length < 1 || value.trim().length > 80) {
    return `${field} must be a non-empty string up to 80 characters`;
  }
  return null;
}

function requireNumber(value, field, minimum = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum) {
    return `${field} must be a number greater than or equal to ${minimum}`;
  }
  return null;
}

function requireFiniteNumber(value, field) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return `${field} must be a finite number`;
  return null;
}

function validateHolding(body) {
  if (!requireObject(body)) return ['Request body must be a JSON object'];
  return [
    requireText(body.ticker, 'ticker'),
    requireText(body.name, 'name'),
    requireNumber(body.amount, 'amount'),
    requireNumber(body.price, 'price'),
    requireFiniteNumber(body.changePercent ?? 0, 'changePercent')
  ].filter(Boolean);
}

function validateTransaction(body) {
  if (!requireObject(body)) return ['Request body must be a JSON object'];
  const errors = [
    requireText(body.ticker, 'ticker'),
    requireNumber(body.amount, 'amount', Number.MIN_VALUE),
    requireNumber(body.price, 'price')
  ].filter(Boolean);
  if (!['buy', 'sell'].includes(body.type)) errors.push('type must be either buy or sell');
  return errors;
}

function validateWatchlist(body) {
  if (!requireObject(body)) return ['Request body must be a JSON object'];
  return [requireText(body.ticker, 'ticker'), requireText(body.name, 'name'), requireNumber(body.price, 'price')].filter(Boolean);
}

function handleDatabaseError(res, error) {
  if ([275, 787, 1555, 2067].includes(error.errcode) || error.code?.includes('CONSTRAINT')) {
    return sendError(res, 409, error.errcode === 787 ? 'Holding has linked transactions' : 'Resource conflicts with an existing record');
  }
  console.error(error);
  return sendError(res, 500, 'Database operation failed');
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'vault-api' }));
app.get('/api/docs', (_req, res) => res.json({
  name: 'Vault API',
  endpoints: {
    holdings: ['GET /api/holdings', 'POST /api/holdings', 'PUT /api/holdings/:ticker', 'DELETE /api/holdings/:ticker'],
    transactions: ['GET /api/transactions', 'POST /api/transactions', 'DELETE /api/transactions/:id'],
    watchlist: ['GET /api/watchlist', 'POST /api/watchlist', 'DELETE /api/watchlist/:ticker']
  }
}));

app.get('/api/holdings', (_req, res) => res.json(db.prepare('SELECT * FROM holdings ORDER BY name').all()));
app.post('/api/holdings', (req, res) => {
  const errors = validateHolding(req.body);
  if (errors.length) return sendError(res, 400, 'Validation failed', errors);
  try {
    const result = db.prepare(`INSERT INTO holdings (ticker, name, amount, price, change_percent) VALUES (?, ?, ?, ?, ?)`).run(
      req.body.ticker.trim().toUpperCase(), req.body.name.trim(), req.body.amount, req.body.price, req.body.changePercent ?? 0
    );
    return res.status(201).json(db.prepare('SELECT * FROM holdings WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) { return handleDatabaseError(res, error); }
});
app.put('/api/holdings/:ticker', (req, res) => {
  const errors = validateHolding(req.body);
  if (errors.length) return sendError(res, 400, 'Validation failed', errors);
  const result = db.prepare(`UPDATE holdings SET ticker=?, name=?, amount=?, price=?, change_percent=? WHERE ticker=?`).run(
    req.body.ticker.trim().toUpperCase(), req.body.name.trim(), req.body.amount, req.body.price, req.body.changePercent ?? 0, req.params.ticker.toUpperCase()
  );
  if (!result.changes) return sendError(res, 404, 'Holding not found');
  return res.json(db.prepare('SELECT * FROM holdings WHERE ticker = ?').get(req.body.ticker.trim().toUpperCase()));
});
app.delete('/api/holdings/:ticker', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM holdings WHERE ticker = ?').run(req.params.ticker.toUpperCase());
    if (!result.changes) return sendError(res, 404, 'Holding not found');
    return res.status(204).send();
  } catch (error) { return handleDatabaseError(res, error); }
});

app.get('/api/transactions', (_req, res) => res.json(db.prepare('SELECT * FROM transactions ORDER BY traded_at DESC').all()));
app.post('/api/transactions', (req, res) => {
  const errors = validateTransaction(req.body);
  if (errors.length) return sendError(res, 400, 'Validation failed', errors);
  if (!db.prepare('SELECT 1 FROM holdings WHERE ticker = ?').get(req.body.ticker.trim().toUpperCase())) return sendError(res, 404, 'Holding ticker not found');
  try {
    const result = db.prepare(`INSERT INTO transactions (ticker, type, amount, price, traded_at) VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`).run(
      req.body.ticker.trim().toUpperCase(), req.body.type, req.body.amount, req.body.price, req.body.tradedAt || null
    );
    return res.status(201).json(db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) { return handleDatabaseError(res, error); }
});
app.delete('/api/transactions/:id', (req, res) => {
  const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return sendError(res, 404, 'Transaction not found');
  return res.status(204).send();
});

app.get('/api/watchlist', (_req, res) => res.json(db.prepare('SELECT * FROM watchlist ORDER BY name').all()));
app.post('/api/watchlist', (req, res) => {
  const errors = validateWatchlist(req.body);
  if (errors.length) return sendError(res, 400, 'Validation failed', errors);
  try {
    const result = db.prepare('INSERT INTO watchlist (ticker, name, price) VALUES (?, ?, ?)').run(req.body.ticker.trim().toUpperCase(), req.body.name.trim(), req.body.price);
    return res.status(201).json(db.prepare('SELECT * FROM watchlist WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) { return handleDatabaseError(res, error); }
});
app.delete('/api/watchlist/:ticker', (req, res) => {
  const result = db.prepare('DELETE FROM watchlist WHERE ticker = ?').run(req.params.ticker.toUpperCase());
  if (!result.changes) return sendError(res, 404, 'Watchlist coin not found');
  return res.status(204).send();
});

app.use('/api', (_req, res) => sendError(res, 404, 'API route not found'));
app.use((error, _req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Request body must contain valid JSON');
  }
  return next(error);
});
app.listen(port, () => console.log(`Vault running at http://127.0.0.1:${port}/crypto-tracker.html`));
