# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run the server (`node server.js`), serves the app at http://localhost:3000
- `npm run dev` — run with nodemon (auto-restart on changes)
- Port configurable via `PORT` env var (defaults to 3000)

There is no build step, no linter, and no test suite. The frontend is plain JS served as static files — changes to `public/` only require a browser refresh (no server restart).

## Architecture

Node.js + Express backend (`server.js`, CommonJS) serving a vanilla JS frontend (`public/`: `index.html`, `styles.css`, `app.js`). No framework, no bundler, no TypeScript. All client logic lives in `public/app.js` (~1600 lines) using module-level globals (`currentQRData`, `qrHistory`, `uploadedLogo`) and `localStorage` (key `qrHistory`, max 20 items).

`server.js` exposes `node_modules/qr-code-styling/lib` at the `/lib` route; `index.html` loads the global `QRCodeStyling` from there before `app.js`.

### Two-stage QR rendering pipeline (the core non-obvious pattern)

1. **Library stage:** `buildQROptions(text)` (app.js:612) configures `QRCodeStyling`, which always generates the QR **black-on-white** regardless of user-selected colors. Output is read via `getRawData('png')` → `FileReader` → data URL. Dot styles ARE applied here via `dotStyleMap`.
2. **Canvas stage:** `renderQR(qrDataUrl)` (app.js:653) draws that PNG onto `#qrCanvas` and applies all styling by pixel manipulation: background → base QR → color/gradient → rounded corners → effects → logo → frame.

Colors and gradients are applied by luminance: `applyColorOnly` (app.js:746) and `applyGradientToQR` (app.js:770) walk `getImageData` and recolor only dark pixels (`brightness < 128`). Do not pass user colors to the library — that breaks this pipeline.

Both live preview and final generation converge on `refreshQRPreview({ saveHistory, showFeedback })` (app.js:543). `previewGenerationToken` (app.js:113) guards against race conditions between debounced preview renders — async callbacks discard stale results by comparing tokens.

### Backend endpoints

- `POST /api/export-pdf` — the only endpoint the frontend actually calls (`downloadPDFExport`, app.js:1358). Receives a PNG data URL, generates a PDF with `pdfkit`, streams it back. Body limit is 100mb.
- `POST /api/validate-qr` — defined but unused by the frontend; length validation (max 4296 chars) is duplicated client-side.

PNG/JPG/SVG exports happen entirely client-side via canvas.

## Known discrepancies and dead code

- `qrcode` and `canvas` in `package.json` are unused — actual QR generation uses `qr-code-styling` on the client.
- `applyColorToQR` (app.js:716), `applyDotStyle` (app.js:819), and `drawModule` (app.js:901) are dead code — not invoked by the current pipeline.
- README says SVG/PDF export are "en desarrollo", but both are implemented.
- README is in Spanish; UI text and code comments are also in Spanish. Keep user-facing strings in Spanish.
