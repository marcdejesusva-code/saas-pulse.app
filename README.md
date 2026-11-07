# EHZ Security System Service — Registration Tracker

Internal cost + compliance tracker for the business registration of **EHZ Security System Service** (owner: **John Henry L. Yson**), prepared by **De Jesus Virtual Assistant Service**.

> This is the working internal copy. The client-facing output is the print/PDF view (header → *Print / PDF*).

## Run it

No build step, no dependencies:

```bash
python3 serve.py            # PORT=8000 by default
# open http://localhost:8000
```

`serve.py` is a small `ThreadingHTTPServer` wrapper: it serves assets in
parallel over HTTP/1.1, sends `Cache-Control: no-store` and ignores
conditional requests (so an edited `app.js` is never served stale from a
`304`), answers `/favicon.ico` with an inline SVG, and binds `0.0.0.0` so the
sandbox preview proxy can reach it. `python3 -m http.server` also works but is
single-threaded and lets the browser cache assets.

`index.html` + `assets/styles.css` + `assets/app.js`. Works from `file://` too, but the print view is cleaner over HTTP.

## What it does

- **Government fees table** — 11 line items across DTI, Barangay Tagpos, Binangonan BPLO/BFP/CHO, BIR RDO, and notarization. Each row tracks *paid so far*, a live *balance*, a status chip (Not started → In progress → **Partial** → Paid), a paid date, and a note.
- **Partial payments** — enter any amount below an estimate and the row automatically becomes **Partial** with the remaining balance shown in red; top it up to the estimate and it flips to **Paid**. Clearing the amount releases the booking. Overpayments are kept as entered and clamp the balance at zero. Marking a row Paid with no amount settles the full estimate.
- **VA fee table** — the four service scopes (DTI, local government, BIR, business portfolio) with the same status tracking, plus an editable package professional fee (₱18,000) and a "fee collected" toggle.
- **Live totals** — Paid in full / Partially paid / Still to fund, plus *received to date* and *outstanding balance*, recomputed on every edit. The invariant `received + balance = total` is maintained to the centavo, including fractional partial payments. Progress is value-weighted, so a half-paid permit moves the bar by its real share rather than a flat 50%.
- **Pipeline** — six-step view: DTI → Barangay → BPLO → BFP/sanitary → BIR → notarized SPA.
- **Client update log** — dated internal notes on what was sent to Mr. Yson.
- **Export** — CSV of the full breakdown, JSON backup, and a print stylesheet for a clean PDF.

State is saved in `localStorage`. *Reset tracker* restores the original estimates but keeps log entries. Payment state is internal bookkeeping — it is not synced anywhere.

## The numbers (verified)

| Block | Amount |
| --- | --- |
| Government official fees | ₱33,460.00 |
| De Jesus VA handling fee | ₱18,000.00 |
| **Total** | **₱51,460.00** |

Payment state: a row is **Paid** when booked amount ≥ estimate, **Partial** when 0 < booked < estimate, where booked = the amount entered, or the estimate if the row was marked paid without an amount.

Government breakdown: DTI ₱1,030 (✅ completed) · Barangay clearance ₱500 · Mayor's permit ₱20,000 · BFP ₱2,000 · sanitary/zoning ₱2,000 · Cedula ₱600 · BIR 0605 ₱1,000 · loose DST ₱30 · ATP ₱5,000 · Books of Accounts ₱800 · SPA notarization ₱500.

## Engagement facts

| | |
| --- | --- |
| Registered name | EHZ Security System Service (Regional) |
| Owner | John Henry L. Yson |
| Address | 1183 Sitio Malitlit Phase 1, Tagpos, Binangonan, Rizal |
| Scope | Region IV-A CALABARZON |
| DTI validity | 5 Nov 2026 – 5 Nov 2031 |
| Client email | dejesusvirtualassistantservice@gmail.com |
| Social brand | EHZ Security System Services – CALABARZON |

Registered services: CCTV installation, solar panel installation, fiber optic cabling, public address system, face recognition access control, electric fence, automatic gate & boom barrier integration, turnstile systems, structured cabling.
