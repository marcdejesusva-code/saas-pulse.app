# EHZ Security System Service — Registration Tracker

Internal cost + compliance tracker for the business registration of **EHZ Security System Service** (owner: **John Henry L. Yson**), prepared by **De Jesus Virtual Assistant Service**.

> This is the working internal copy. The client-facing output is the print/PDF view (header → *Print / PDF*).

## Run it

No build step, no dependencies:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
# open http://localhost:8000
```

`index.html` + `assets/styles.css` + `assets/app.js`. Works from `file://` too, but the print view is cleaner over HTTP.

## What it does

- **Government fees table** — 11 line items across DTI, Barangay Tagpos, Binangonan BPLO/BFP/CHO, BIR RDO, and notarization. Each row has an editable *actual paid* amount, a status chip (Not started → In progress → Paid), a paid date, and a note.
- **VA fee table** — the four service scopes (DTI, local government, BIR, business portfolio) with the same status tracking, plus an editable package professional fee (₱18,000) and a "fee collected" toggle.
- **Live totals** — estimates vs. actual paid vs. still-to-fund, recomputed on every edit.
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
