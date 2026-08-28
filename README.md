# Vault — Crypto Portfolio Tracker

DecodeLabs Full Stack Internship training project covering:

- **Project 2: Backend API Development** — Express REST endpoints, request validation, JSON responses, RESTful naming, and HTTP status codes.
- **Project 3: Database Integration** — SQLite persistence, schema constraints, CRUD operations, foreign keys, and parameterized SQL queries.

## Run Locally

Requirements: Node.js 22.5+ (Node.js 24 recommended) and npm. Node's built-in `node:sqlite` driver is used, so Visual Studio C++ tooling is not required.

```powershell
npm install
npm start
```

Open `http://127.0.0.1:3000/crypto-tracker.html` in a browser. The server also exposes the API at `http://127.0.0.1:3000/api`.

For development with automatic restarts:

```powershell
npm run dev
```

## REST API

All request bodies must be JSON. Invalid or incomplete data returns `400 Bad Request` with a `details` array.

| Method | Endpoint | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/api/health` | Service health check | `200` |
| GET | `/api/docs` | Endpoint overview | `200` |
| GET | `/api/holdings` | List portfolio holdings | `200` |
| POST | `/api/holdings` | Create a holding | `201` |
| PUT | `/api/holdings/:ticker` | Replace a holding | `200` |
| DELETE | `/api/holdings/:ticker` | Delete a holding | `204` |
| GET | `/api/transactions` | List transactions | `200` |
| POST | `/api/transactions` | Create a transaction | `201` |
| DELETE | `/api/transactions/:id` | Delete a transaction | `204` |
| GET | `/api/watchlist` | List watchlist coins | `200` |
| POST | `/api/watchlist` | Add a watchlist coin | `201` |
| DELETE | `/api/watchlist/:ticker` | Remove a watchlist coin | `204` |

Example request:

```powershell
curl.exe -X POST http://127.0.0.1:3000/api/holdings `
  -H "Content-Type: application/json" `
  -d '{"ticker":"AVAX","name":"Avalanche","amount":12,"price":28.05,"changePercent":1.4}'
```

The API also returns `404` for missing resources, `409` for unique-key conflicts, and `500` for unexpected database errors.

## Live Frontend Persistence

The frontend reads holdings and watchlist records from the API on startup. Holding sell/delete, watchlist add, and watchlist remove actions wait for the database response before changing the screen. Failed requests show an error toast and leave the current UI state unchanged. Holdings created directly through the API are rendered after reload, so the browser view reflects the SQLite database rather than only the original demo HTML.

## Database Design

The server creates `vault.db` on first run. It contains:

- `holdings`: unique ticker, non-negative amount/price, and market change percentage.
- `transactions`: buy/sell check constraint, positive amount, and a foreign key to `holdings.ticker`.
- `watchlist`: unique ticker and non-negative price.

All SQL writes use prepared statements. This prevents SQL injection and keeps user input separate from executable SQL. Schema constraints provide a second integrity layer instead of trusting client-side validation alone.

## Project Structure

```text
crypto-tracker.html  # Static application entry point
server.js            # Express API, validation, SQLite schema, seed data, and static hosting
package.json         # Runtime scripts and dependencies
vault.db             # Local SQLite database, generated and git-ignored
css/style.css        # Application styling and responsive rules
js/                   # Frontend modules, API client, live sync, and interactions
  api.js              # Fetch wrapper and API error handling
  data-sync.js        # Hydrates holdings/watchlist from SQLite on startup
README.md             # Project 2/3 documentation
```

## HTTP Status Code Contract

- `200 OK`: successful reads and updates
- `201 Created`: new resource created
- `204 No Content`: successful deletion
- `400 Bad Request`: malformed or incomplete input
- `404 Not Found`: resource or related holding does not exist
- `409 Conflict`: duplicate unique resource
- `500 Internal Server Error`: unexpected server/database failure