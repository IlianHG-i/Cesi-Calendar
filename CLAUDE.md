# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Chrome/Firefox Manifest V3 extension (vanilla JS, no build step) that scrapes the CESI ENT weekly timetable (`ent.cesi.fr/mon-emploi-du-temps`) and exports it as an iCal `.ics` file or pushes it to Google Calendar via OAuth2.

There is **no build, no bundler, no test runner, no lint config**. Changes ship by reloading the unpacked extension.

## Dev loop

- Chrome: `chrome://extensions/` → Developer mode → "Load unpacked" → select this directory. After edits, hit the reload icon on the extension card (and reload the ENT tab).
- Firefox: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on" → pick `manifest.json`.
- To debug the content script: DevTools on the ENT page. To debug the service worker: `chrome://extensions/` → "Service worker" link. To debug the popup: right-click the popup → Inspect.
- Google Calendar API path requires a real OAuth2 client ID placed in `manifest.json` under `oauth2.client_id` (placeholder `VOTRE_CLIENT_ID...` ships in the repo). See `GOOGLE_SETUP.md` for the Google Cloud Console steps.

## Architecture

Three execution contexts communicate via `chrome.runtime` messages:

1. **`scripts/content-script.js`** (runs on `ent.cesi.fr/mon-emploi-du-temps*`, `document_idle`) — the main driver. On page load it waits ~2s, checks a `localStorage` timestamp to skip re-exports within `CONFIG.EXPORT_DELAY_HOURS` (default 1h), then automates the FullCalendar UI: clicks the prev-week arrow back to Monday, and for each of 6 days (Mon–Sat) extracts DOM events and clicks "next day" with `LOAD_DELAY_MS` spacing. Aggregated events are passed to the ICS generator and the resulting blob is downloaded via an `<a download>` trigger. Also renders a fixed-position progress notification directly into the page.
2. **`scripts/background.js`** (service worker) — owns Google OAuth2. Exposes `getAuthToken` / `revokeAuthToken` message handlers that wrap `chrome.identity.getAuthToken`, validate via `oauth2/v1/tokeninfo`, and auto-refresh on invalid tokens.
3. **`scripts/popup.js` + `popup.html`** — manual fallback UI. Sends messages to the active tab's content script to trigger a single-day export, or to the background worker for Google Calendar push.

**`lib/ics-generator.js`** — standalone `ICSGenerator` class that emits RFC 5545 `VCALENDAR`/`VEVENT` text with `Europe/Paris` timezone and CRLF line endings. Used from the content script (and popup for manual export). No module system — it's a global loaded via script tag / injection.

### Key coupling points when editing

- DOM selectors for FullCalendar events and the prev/next-day buttons live in `content-script.js`. If CESI changes their ENT markup, extraction breaks here first.
- The "already exported recently" guard is a `localStorage` key written by the content script; clearing it forces a fresh run. `CONFIG.EXPORT_DELAY_HOURS` in `content-script.js` tunes the window.
- `manifest.json` `host_permissions` must cover both `ent.cesi.fr` (scraping) and `googleapis.com` (OAuth + Calendar API). Content script `matches` pattern controls auto-run.
- Timezone is hardcoded to `Europe/Paris` in the ICS output; dates parsed from the DOM are assumed local.

## Repo conventions

- User's global git rules (`~/.claude/CLAUDE.md`) apply: Conventional Commits, one feature per branch, no AI/Claude references anywhere in commits/PRs/code, no `--force` without explicit approval.
- French is the primary language for user-facing strings, logs, and docs (`README.md`, `QUICK_START.md`, `GOOGLE_SETUP.md`).
