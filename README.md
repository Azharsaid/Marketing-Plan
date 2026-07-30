# Dar Aldawa AI Marketing Plan Studio

Browser-based, AI-assisted marketing-plan generator for:

- Mixif (Cefixime)
- Ciprodar (Ciprofloxacin)
- Hairgrow (Minoxidil)
- UAE, Saudi Arabia, Jordan, and Iraq

## What it does

- Generates one plan or a complete brand–country batch.
- Parses MAT Units, MAT USD, YTD Units, and YTD USD Excel files locally in the browser.
- Detects the latest year and market hierarchy automatically.
- Extracts a competitor-price table from a one-slide PowerPoint and rebuilds it in the corporate design.
- Generates a connected 39-slide marketing-plan flow based on the supplied template and previous-plan strategy knowledge.
- Keeps all financial slides complete but intentionally blank.
- Uses Arial and the Dar Aldawa wide corporate layout.
- Supports slide-by-slide editing, history, locking, quality checks, sources, and targeted AI actions.
- Exports editable PowerPoint files individually or as a batch ZIP.

## Privacy and AI

Firebase is not required. Uploaded market data is processed locally and is not uploaded by this website.

No Gemini API key is committed to the repository. A user can enter a personal Gemini Developer API key in **AI Settings**. By default, it is kept only for the current browser session. Offline generation works without AI.

A public static website cannot safely hide a shared API key. A future confidential multi-user version should place Gemini calls behind a server-side proxy.

## Run locally

Open with a local web server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Public deployment

The repository is ready for GitHub Pages from the `main` branch root.
