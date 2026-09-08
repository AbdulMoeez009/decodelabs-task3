# Vault — Crypto Portfolio Tracker

DecodeLabs Full Stack Internship training project covering:

- **Project 2: Backend API Development** — Express REST endpoints, request validation, JSON responses, RESTful naming, and HTTP status codes.
- **Project 3: Database Integration** — SQLite persistence, schema constraints, CRUD operations, foreign keys, and parameterized SQL queries.
- **Project 4: Frontend & Backend Integration** — `fetch()` with `async`/`await`, dynamic DOM updates, REST status handling, JSON serialization, CORS concepts, and defensive error handling.

Production storage uses Supabase PostgreSQL. The legacy `server.js` SQLite implementation is retained for reference; the application starts `server-supabase.js`.

## Run Locally

Requirements: Node.js 22.5+ (Node.js 24 recommended), npm, and a Supabase project.

```powershell
npm install
npm start
```

Open `http://127.0.0.1:3000/crypto-tracker.html` in a browser. The server also exposes the API at `http://127.0.0.1:3000/api`.

For development with automatic restarts:

```powershell
npm run dev
```

## Supabase Setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste `supabase-schema.sql`, and run it.
3. Copy the project URL and service-role key into `.env`, using `.env.example` as a template.
4. Never expose the service-role key in frontend JavaScript or commit it to Git.

The API server uses the service-role key only on the server. Row Level Security is enabled on the tables, so direct browser access remains blocked unless explicit policies are later added.

## Public Deployment with Render

The repository includes `render.yaml` for a Node web service deployment. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` when Render prompts for their secret values.

1. Create a Render account and choose **New > Blueprint**.
2. Connect the GitHub repository `AbdulMoeez009/decodelabs-task3`.
3. Select the repository branch `main`; Render reads `render.yaml` automatically.
4. Deploy, then open the generated `.onrender.com/crypto-tracker.html` URL.
5. Confirm the generated `/api/health` endpoint returns `{ "status": "ok" }`.

Supabase stores the data independently of the web server, so redeployments do not reset holdings, transactions, or watchlist records.

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

## Project 4 Integration Checklist

- Frontend requests `/api/holdings` and `/api/watchlist` on startup with `Promise.all`.
- Create, delete, and watchlist actions wait for the API response before updating the interface.
- Non-2xx responses become user-visible error toasts through the shared fetch wrapper.
- API-backed values are inserted with DOM APIs and `textContent` rather than interpolated into `innerHTML`.
- The Project 4 training deck is available from the **Project 4** navigation item in `crypto-tracker.html`.

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