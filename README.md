# Marketing Plan Builder

Static website for generating country/product marketing-plan decks from IQVIA MAT and YTD data.

## Version 3 update

Non-placeholder slides are now generated from the selected brand and country. The intentionally blank slides remain: Executive Summary, Products Prices, Competition analysis, Actions based on strategies, Plan timeline, Main events, and Financials.

## What is included

- `index.html` – open locally or deploy to GitHub Pages / Cloudflare Pages.
- `app.js` – app logic, product manager permissions, product definitions, therapy-path analysis, slide rendering, and PowerPoint export.
- `styles.css` – Dar Aldawa-inspired teal/dark visual system with country flag headers.
- `data/iqvia-data.js` – compact IQVIA data generated from the uploaded Excel files.
- `vendor/pptxgen.bundle.js` – local PowerPoint export library, so no CDN is needed.
- `tools/convert_iqvia_to_json.py` – monthly update converter for new IQVIA Excel extracts.

## Main updates in this version

- Market-analysis slides now follow the selected brand's therapeutic pathway:
  - Total Market / ATC1
  - ATC2 inside the selected ATC1
  - ATC3 inside the selected ATC2
  - ATC4 inside the selected ATC3
  - Molecule inside the selected ATC4
  - Product analysis inside the selected molecule market
- Every analytical table now has a total parent row above the first ranked row.
- Ranking columns were added for PY and CY, closer to the reference PowerPoint structure.
- Product tables now include PY/CY units, PY/CY USD, growth, and market share columns.
- Comments are now written as strategic interpretation text instead of repeating visible table numbers.
- Sidebar navigation is grouped into categories and subcategories.
- The visual style was upgraded using a Dar Aldawa-inspired dark/teal palette, while retaining country flag headers.

## Login / access

- Azhar Said: Mixif - Murex, Ciprodar - Qurex, Hairgrow
- Abdallah Nasser: Matador, Clavodar
- Isam Aljundi: Deplazine, Glunorm, Glunorm M, Rozzita, Gizlan
- Admin: all products and admin panel

Default Admin password inside `app.js`: `Azzz1990`

Important: this is a static front-end password, suitable for presentation/prototype use, not for confidential deployment. For production, protect the site behind real authentication.

## Countries

The dropdown includes JO, KSA, UAE, IRQ, ALG. The uploaded IQVIA ZIP included JO/KSA/UAE only, so IRQ and ALG are prepared as pending countries until their files are added.

## Applied IQVIA filters

The converter keeps only rows where:

- `Sector = RETAIL`
- `Formula Type = Medicine Formulas`

It excludes Hospitals, Others, and Other Formulas as requested.

## Monthly IQVIA update

1. Put the updated country files into one folder. Recommended names: `JO-MAT-04.xlsx`, `JO-YTD-04.xlsx`, `KSA-MAT-04.xlsx`, etc.
2. From the project folder run:

```bash
python tools/convert_iqvia_to_json.py ./your_iqvia_folder ./data/iqvia-data.js
```

3. Re-upload the full folder to GitHub / Cloudflare.

## PowerPoint export

Inside the website, select Product Manager → Country → Product, then click **Download editable PowerPoint**. The exported deck uses editable text, tables, and shapes rather than screenshots.

## Notes

The following slides are intentionally generated as empty placeholders with the same visual structure so they can be filled manually:

- Executive Summary
- Products Prices
- Competition analysis
- Actions based on strategies
- Plan timeline
- Main events
- Financials

## V7 data publishing update

This version no longer depends on Firebase Storage for IQVIA JSON publishing. The upload workflow parses Excel locally in the browser, filters Retail + Medicine Formulas rows, and stores the converted dataset in Firestore using chunked documents under:

- `iqviaData/{COUNTRY}_{PERIOD}`
- `iqviaData/{COUNTRY}_{PERIOD}/chunks/{chunkIndex}`
- `marketingPlan/dataManifest`

This avoids the Firebase Storage `storage/retry-limit-exceeded` issue during monthly IQVIA updates. Large files are split into chunks below the Firestore document size limit. New monthly uploads replace the previous chunks for the same country and period, then update the shared manifest so all users load the latest data.



## V8 Firestore row-format fix

V8 fixes Firestore error `Nested arrays are not supported` by storing IQVIA rows inside map-wrapped records (`{ v: [...] }`) instead of direct array-inside-array values. This follows Firestore's restriction that arrays cannot directly contain another array. Monthly uploads still replace previous chunks for the same country and period.


## V11 update
- Removed therapeutic pathway smart-art blocks from market table slides for speed and cleaner storytelling.
- Market slides now show table + Findings / Actions / Recommendations only.
- Added prominent country flag badge on every slide header and dashboard topbar.
- Added data cache to reduce repeated IQVIA parsing and make dashboard smoother.
- Reworked premium cockpit dashboard style with Dar Aldawa green headers, neon borders, and lighter DOM per slide.


## V12 update
- Rebuilt login screen as username/password only.
- Enter key works because login is now a real form submit.
- Added Remember me checkbox.
- Added Show password checkbox and Show/Hide button.
- Username aliases supported: Admin, Azhar, Abdallah, Isam, or the full Firebase email.


## V13 login fix
- Login no longer re-renders the page during Firebase sign-in, so it will not get stuck visually at "Signing in...".
- Added inline error message and 15-second timeout.
- Added Firebase Auth persistence: Remember me uses browserLocalPersistence, otherwise browserSessionPersistence.
- Added clearer errors for disabled Email/Password, wrong credentials, timeout, and network failures.


## V14 hotfix
- Fixed login hang caused by missing slide functions after successful authentication.
- Restored cover, section, definitions, executive summary, and market table slide generators.
- Keeps V13 login behavior and V11 clean table/comments style.

## V15 update
- Faster rendering: slide content is now generated lazily only for the active slide.
- Removed selected-brand / brand-path instruction labels from all tables.
- Kept table row highlighting without visible labels.
- Replaced generic instruction boxes with richer Findings / Actions / Recommendations that do not restate table values.
- Generated competitor profile table from the selected molecule data.
- Added competitors to Customers chain analysis and improved the following brand-diagnosis content.
- Rebuilt definitions, market shape, market trend, CSF, positioning, and core strategy content using the provided definitions.

## V16 update
- Removed Definitions slide from the presentation.
- Added selected-brand competitor library as fallback when IQVIA brand-level competitor rows are incomplete.
- Competitors slide now explicitly shows selected-brand competitors.
- Customer chain analysis now shows competitors affecting the selected brand.
- Findings / Actions / Recommendations now refer to selected-brand competitors.

## V17 update
- Fixed Product Performance tables to show top 5 product competitors within the selected molecule + Others.
- Aggregation now uses actual IQVIA Products field instead of companyBrand/brandName, which previously collapsed rows into the selected brand.
- Selected brand row remains highlighted; competitor rows are shown explicitly.
- Competitor slide now pulls from actual Product-level competitors first.
- Product table Findings / Actions / Recommendations are now competitor-specific and richer.

## V18 update
- Rebuilt Customers chain analysis with a cleaner SVG diagram and better visual balance.
- Added richer, example-style Targeting / Segmentation / Messages content.
- Split segmentation content into two slides: indication-specific messages and general platform messages.
- Upgraded Supportive strategies to a more detailed, presentation-style table closer to the provided example.

## V19 update
- Full creative upgrade: new Brand Battlefield and Strategic Imperatives slides.
- Reworked SWOT into a detailed high-impact matrix.
- Rebuilt Market Shape with strategy interpretation and portfolio/SKU contribution views.
- Upgraded CSF, Positioning, Core Strategy, and Supportive Strategies with deeper pharma-style content.
- Added richer Mixif-specific brand plan logic and generic fallback logic for all other brands.

## V21 update
- PowerPoint export now renders every dashboard slide as a high-resolution image, so the downloaded PPT visually matches the dashboard design.
- Added an invisible text layer to each PowerPoint slide for search/copy while preserving exact dashboard visuals.
- Export button label changed to "Download dashboard-exact PowerPoint".
- Note: for exact design fidelity, edit slide content inside the dashboard first, then export.

## V22 update
- Every analysis slide now generates different Findings / Actions / Recommendations.
- ATC1, ATC2, ATC3, ATC4, Molecule, Product MAT, Product YTD, Market Shape Units, Market Shape Value, Market Trend, and Competitor Profile each have distinct strategic commentary.
- PowerPoint dashboard-exact export keeps the same visual comments as the dashboard.

## V23 update
- Analysis comments are now driven by the IQVIA Excel data loaded in the dashboard.
- Comments change by product, country, period, ATC level, molecule, competitor set, SKU mix, MAT/YTD trend, and product performance.
- Every analysis slide now has unique Findings / Actions / Recommendations based on the actual table behind that slide.
- Comment boxes use bullet-style strategic language closer to the supplied reference examples.

## V24 update
- Fixed sidebar navigation clickability.
- Subcategories now open/close cleanly and every slide item has a direct click handler.
- Added safe slide rendering: if one slide has a content error, the dashboard shows the error instead of blocking navigation.

## V25 hotfix
- Fixed the analysis slides error: `analysisTableNarrative is not defined`.
- Added a compatibility alias so cached/old references still work.
- Added a safe render wrapper so one broken slide cannot block the rest of the dashboard or PowerPoint export.
- Added `runDeckSelfTest()` in browser console to check all slides.
