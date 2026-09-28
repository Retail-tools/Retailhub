# Audit HUB Pro v6

A Digital Command Center for Retail Operations, Inventory Audits & Business Intelligence.

## Adding a new tool
1. Copy `tools/_template` to `tools/<your-tool>` and build the tool as `index.html` inside it.
2. Fill in `tool.json` (id, name, description, category, icon, version, tags, capabilities, bestFor, stages, dates, badge, featured).
   - category: audit, inventory, analytics, reporting, finance, gst, operations, utilities
   - icon: a key from `assets/js/icons.js` (barcode, clipboard, invoice, store, report, coins, percent, archive, route, scan, box, qr, wrench...)
   - stages (optional): prepare, scan, analyze, reconcile, report, decide. Puts the tool in the workflow section.
3. Run `node scripts/build-tools.js` (or `build.sh` / `build.bat`). Use `--strict` to fail on errors (for CI).
4. Run `node scripts/inject-shell.js` once so the new tool page gets the "Back to Audit HUB Pro" pill and recently-used tracking.

The build checks for: missing index.html or tool.json, invalid JSON, placeholder text ("Your Tool Name"), duplicate ids and names, invalid category or badge, unknown icon, bad dates. Tools with errors are listed in the terminal and are NOT shown on the site. The browser also re-checks the registry and hides any broken entry.

## Files
- `index.html`, `assets/css/hub.css`, `assets/js/hub.js`: the portal
- `data/tools.js`: generated registry (do not hand-edit)
- `assets/js/hub-shell.js`: shared pill for tool pages
- `about.html` and `assets/css/style.css`: older about page, unchanged
- `.nojekyll`, `vercel.json`: GitHub Pages / Vercel deploy files
