# Vault — Crypto Portfolio Tracker

## Project Structure

```text
crypto-tracker.html  # Static application entry point
css/style.css        # All application styling and responsive rules
js/
	script.js          # Thin ES module bootstrap
	state.js           # Shared app state and portfolio data
	dom.js             # DOM query helpers
	toast.js           # Shared toast feedback
	modal-a11y.js      # Modal focus trapping and Escape handling
	theme.js           # Theme switching
	navigation.js      # View navigation and contextual search/filtering
	coin-modal.js      # Holding details and sell interaction
	watchlist.js       # Watchlist add/remove behavior
	notifications.js   # Notification panel and detail modal
	trades.js          # Trade modal and overview stat cards
	profile.js         # Profile editing
	settings.js        # Settings toggles and save behavior
	shortcuts.js       # Avatar profile shortcut
README.md            # Project documentation
```

No framework, package install, or build step is required. Because the JavaScript uses native ES modules, serve the folder over HTTP:

```powershell
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/crypto-tracker.html`.