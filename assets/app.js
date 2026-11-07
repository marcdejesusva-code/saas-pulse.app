/* ── EHZ Security System Service — registration tracker ─────
   Plain ES2017, no build step, no dependencies.
   State lives in localStorage; every edit recomputes all totals.
   ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var STORE_KEY = 'ehz-tracker-v1';

  /* ── seed data (from the client email) ─────────────────── */
  var SEED = {
    vaFee: 18000,
    vaCollected: false,
    log: [
      { date: '2026-11-05', text: 'DTI Business Name Registration approved — EHZ Security System Service, Regional scope, valid Nov 5 2026 – Nov 5 2031.' },
      { date: '2026-11-07', text: 'Sent updated cost breakdown v2 to Mr. Yson, now including Barangay Tagpos, Binangonan BPLO/BFP and BIR line items. Total ₱51,460.00.' }
    ],
    gov: [
      { id: 'dti',      agency: 'DTI',                        item: 'Regional Scope Business Name Registration & DST', est: 1030,  status: 'paid', date: '2026-11-05', note: 'Completed — certificate released' },
      { id: 'brgy',     agency: 'Barangay Tagpos, Binangonan', item: 'Business Barangay Clearance',                     est: 500,   status: 'todo', date: '', note: '' },
      { id: 'mayor',    agency: 'Binangonan BPLO',            item: "Mayor's / Business Permit Fee",                    est: 20000, status: 'todo', date: '', note: 'Largest single line — confirm bracket with BPLO' },
      { id: 'bfp',      agency: 'Binangonan BFP',             item: 'Fire Safety Inspection Certificate',               est: 2000,  status: 'todo', date: '', note: '' },
      { id: 'sanitary', agency: 'Binangonan CHO / OBO',       item: 'Sanitary & Engineering / Zoning Fees',             est: 2000,  status: 'todo', date: '', note: '' },
      { id: 'cedula',   agency: 'Binangonan Treasurer',       item: 'Community Tax Certificate (Cedula)',               est: 600,   status: 'todo', date: '', note: '' },
      { id: 'bir0605',  agency: 'BIR — RDO',                  item: 'Annual Registration Fee (BIR Form 0605)',          est: 1000,  status: 'todo', date: '', note: '' },
      { id: 'dst',      agency: 'BIR — RDO',                  item: 'Loose Documentary Stamp Tax (DST)',                est: 30,    status: 'todo', date: '', note: '' },
      { id: 'atp',      agency: 'BIR — RDO',                  item: 'Authority to Print (ATP) Receipts / Invoices',     est: 5000,  status: 'todo', date: '', note: 'Printer quote may vary' },
      { id: 'books',    agency: 'BIR — RDO',                  item: 'Books of Accounts Stamp / Setup',                  est: 800,   status: 'todo', date: '', note: '' },
      { id: 'notary',   agency: 'Notary Public',              item: 'Special Power of Attorney (SPA) Notarization',     est: 500,   status: 'todo', date: '', note: '' }
    ],
    va: [
      { id: 'va-dti',   scope: 'DTI Filing Assistance',       covers: 'Form completion, system encoding, payment processing, certificate retrieval', status: 'paid',   date: '2026-11-05', note: 'Completed' },
      { id: 'va-lgu',   scope: 'Local Government Processing',  covers: "On-site filing & coordination — Barangay Clearance, BPLO Mayor's Permit, BFP inspection in Binangonan", status: 'todo', date: '', note: '' },
      { id: 'va-bir',   scope: 'BIR Registration Assistance',  covers: 'BIR Form 1901 submission, COR (2303) pickup, ATP receipts setup, Books of Accounts stamping', status: 'todo', date: '', note: '' },
      { id: 'va-port',  scope: 'Business Portfolio',           covers: 'Setup and documentation support', status: 'todo', date: '', note: '' }
    ],
    scope: [
      'CCTV Installation', 'Solar Panel Installation', 'Fiber Optic Cabling',
      'Public Address System', 'Face Recognition Access Control', 'Electric Fence',
      'Automatic Gate & Boom Barrier Integration', 'Turnstile Systems', 'Structured Cabling'
    ]
  };

  var STATUSES = ['todo', 'progress', 'paid'];
  var STATUS_LABEL = { todo: 'Not started', progress: 'In progress', paid: 'Paid' };

  /* ── storage ───────────────────────────────────────────── */
  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return clone(SEED);
      var parsed = JSON.parse(raw);
      return migrate(parsed);
    } catch (e) {
      return clone(SEED);
    }
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // Fill in any rows added to SEED after a saved state was written.
  function migrate(saved) {
    var out = clone(SEED);
    if (typeof saved.vaFee === 'number') out.vaFee = saved.vaFee;
    if (typeof saved.vaCollected === 'boolean') out.vaCollected = saved.vaCollected;
    if (Array.isArray(saved.log)) out.log = saved.log;
    ['gov', 'va'].forEach(function (key) {
      if (!Array.isArray(saved[key])) return;
      saved[key].forEach(function (row) {
        var target = out[key].filter(function (r) { return r.id === row.id; })[0];
        if (target) {
          if (typeof row.est === 'number') target.est = row.est;
          if (typeof row.actual === 'number') target.actual = row.actual;
          if (STATUSES.indexOf(row.status) !== -1) target.status = row.status;
          if (typeof row.date === 'string') target.date = row.date;
          if (typeof row.note === 'string') target.note = row.note;
        }
      });
    });
    return out;
  }

  var saveTimer = null;
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
    var el = document.getElementById('saveState');
    el.textContent = 'Saved';
    el.style.opacity = '1';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      el.textContent = 'Saved locally';
      el.style.opacity = '.6';
    }, 1200);
  }

  /* ── formatting ────────────────────────────────────────── */
  var peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 });
  function fmt(n) { return peso.format(Number(n) || 0).replace('PHP', '₱').replace(/\s/g, ''); }
  function fmtShort(n) { return '₱' + (Number(n) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    if (p.length !== 3) return iso;
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── totals ────────────────────────────────────────────── */
  function govEstimateTotal() { return state.gov.reduce(function (s, r) { return s + r.est; }, 0); }
  function govActualTotal() { return state.gov.reduce(function (s, r) { return s + (r.status === 'paid' ? (r.actual != null ? r.actual : r.est) : 0); }, 0); }
  function govSettledEstimate() { return state.gov.reduce(function (s, r) { return s + (r.status === 'paid' ? r.est : 0); }, 0); }
  function vaPaid() { return state.vaCollected ? state.vaFee : 0; }

  /* ── render: government table ──────────────────────────── */
  function renderGov() {
    var body = document.getElementById('govBody');
    body.innerHTML = state.gov.map(function (r) {
      var paid = r.status === 'paid';
      var actual = r.actual != null ? r.actual : (paid ? r.est : '');
      return '<tr class="' + (paid ? 'is-paid' : '') + '" data-row="' + r.id + '" data-kind="gov">' +
        '<td class="agency">' + esc(r.agency) + '</td>' +
        '<td class="item"><strong>' + esc(r.item) + '</strong>' +
          (paid && r.id === 'dti' ? '<span class="tag-done">Completed</span>' : '') + '</td>' +
        '<td class="col-amt"><strong>' + fmtShort(r.est) + '</strong></td>' +
        '<td class="col-actual"><input class="amt-input" type="number" min="0" step="0.01" inputmode="decimal" ' +
          'value="' + (actual === '' ? '' : actual) + '" placeholder="—" aria-label="Actual paid for ' + esc(r.item) + '" ' +
          'data-field="actual"></td>' +
        '<td class="col-status"><button class="chip" type="button" data-s="' + r.status + '" data-action="cycle" ' +
          'aria-label="Status: ' + STATUS_LABEL[r.status] + ' — click to change">' + STATUS_LABEL[r.status] + '</button></td>' +
        '<td class="col-date"><input class="date-input" type="date" value="' + esc(r.date) + '" aria-label="Date paid for ' + esc(r.item) + '" data-field="date"></td>' +
        '<td class="col-note"><input class="note-input" type="text" value="' + esc(r.note) + '" placeholder="add note…" aria-label="Note for ' + esc(r.item) + '" data-field="note"></td>' +
        '</tr>';
    }).join('');

    document.getElementById('govSubtotal').textContent = fmtShort(govEstimateTotal());
    document.getElementById('govFootEst').textContent = fmtShort(govEstimateTotal());
    document.getElementById('govFootAct').textContent = fmtShort(govActualTotal());
  }

  /* ── render: VA table ──────────────────────────────────── */
  function renderVa() {
    var body = document.getElementById('vaBody');
    body.innerHTML = state.va.map(function (r) {
      return '<tr class="' + (r.status === 'paid' ? 'is-paid' : '') + '" data-row="' + r.id + '" data-kind="va">' +
        '<td class="item"><strong>' + esc(r.scope) + '</strong>' +
          (r.status === 'paid' ? '<span class="tag-done">Done</span>' : '') + '</td>' +
        '<td class="agency">' + esc(r.covers) + '</td>' +
        '<td class="col-status"><button class="chip" type="button" data-s="' + r.status + '" data-action="cycle" ' +
          'aria-label="Status: ' + STATUS_LABEL[r.status] + ' — click to change">' + STATUS_LABEL[r.status] + '</button></td>' +
        '<td class="col-date"><input class="date-input" type="date" value="' + esc(r.date) + '" aria-label="Date for ' + esc(r.scope) + '" data-field="date"></td>' +
        '<td class="col-note"><input class="note-input" type="text" value="' + esc(r.note) + '" placeholder="add note…" aria-label="Note for ' + esc(r.scope) + '" data-field="note"></td>' +
        '</tr>';
    }).join('');
    document.getElementById('vaSubtotal').textContent = fmtShort(state.vaFee);
  }

  /* ── render: summary ───────────────────────────────────── */
  function renderSummary() {
    var gov = govEstimateTotal();
    var va = state.vaFee;
    var total = gov + va;
    var settled = govSettledEstimate() + vaPaid();
    var due = total - settled;

    document.getElementById('kTotal').textContent = fmtShort(total);
    document.getElementById('kGov').textContent = fmtShort(gov);
    document.getElementById('kGovSub').textContent = state.gov.length + ' line items';
    document.getElementById('kVaFee').textContent = fmtShort(va);
    document.getElementById('kPaid').textContent = fmtShort(settled);
    document.getElementById('kPaidSub').textContent = Math.round(settled / total * 100) + '% of total';
    document.getElementById('kDue').textContent = fmtShort(due);
    document.getElementById('kDueSub').textContent = 'excludes unsettled actuals';

    document.getElementById('tGov').textContent = fmtShort(gov);
    document.getElementById('tVa').textContent = fmtShort(va);
    document.getElementById('tGrand').textContent = fmtShort(total);

    var rows = state.gov.concat(state.va);
    var done = rows.filter(function (r) { return r.status === 'paid'; }).length;
    var partial = rows.reduce(function (s, r) { return s + (r.status === 'progress' ? 0.5 : 0); }, 0);
    var pct = Math.round((done + partial) / rows.length * 100);
    document.getElementById('barFill').style.width = pct + '%';
    var bar = document.getElementById('bar');
    bar.setAttribute('aria-valuenow', String(pct));
    document.getElementById('progressLabel').textContent = done + ' of ' + rows.length + ' steps complete';

    renderPipeline();
  }

  function renderPipeline() {
    var steps = [
      { label: 'DTI registration', rows: state.gov.filter(function (r) { return r.id === 'dti'; }) },
      { label: 'Barangay clearance', rows: state.gov.filter(function (r) { return r.id === 'brgy'; }) },
      { label: "Mayor's permit / BPLO", rows: state.gov.filter(function (r) { return r.id === 'mayor'; }) },
      { label: 'BFP + sanitary/zoning', rows: state.gov.filter(function (r) { return r.id === 'bfp' || r.id === 'sanitary'; }) },
      { label: 'BIR registration', rows: state.gov.filter(function (r) { return r.agency.indexOf('BIR') === 0; }) },
      { label: 'Notarized SPA', rows: state.gov.filter(function (r) { return r.id === 'notary'; }) }
    ];
    document.getElementById('pipeline').innerHTML = steps.map(function (s) {
      var allPaid = s.rows.every(function (r) { return r.status === 'paid'; });
      var anyStarted = s.rows.some(function (r) { return r.status !== 'todo'; });
      var status = allPaid ? 'paid' : anyStarted ? 'progress' : 'todo';
      return '<li data-s="' + status + '"><span class="dot"></span>' + esc(s.label) + '</li>';
    }).join('');
  }

  /* ── render: log ───────────────────────────────────────── */
  function renderLog() {
    var list = document.getElementById('logList');
    if (!state.log.length) {
      list.innerHTML = '<li class="empty">No updates logged yet.</li>';
      return;
    }
    list.innerHTML = state.log.map(function (entry, i) {
      return '<li><time datetime="' + esc(entry.date) + '">' + esc(fmtDate(entry.date) || '—') + '</time>' +
        '<span class="txt">' + esc(entry.text) + '</span>' +
        '<button class="del" type="button" data-action="del-log" data-idx="' + i + '" aria-label="Delete entry">&times;</button></li>';
    }).join('');
  }

  function renderScope() {
    document.getElementById('scopeList').innerHTML = state.scope.map(function (s) {
      return '<li>' + esc(s) + '</li>';
    }).join('');
  }

  function renderAll() {
    renderGov();
    renderVa();
    renderSummary();
    renderLog();
    document.getElementById('vaFee').value = String(state.vaFee);
    var vc = document.getElementById('vaCollected');
    vc.setAttribute('data-s', state.vaCollected ? 'paid' : 'todo');
    vc.textContent = state.vaCollected ? 'Fee collected' : 'Fee not yet collected';
    vc.setAttribute('aria-pressed', state.vaCollected ? 'true' : 'false');
  }

  /* ── events ────────────────────────────────────────────── */
  function findRow(el) {
    var tr = el.closest('tr[data-row]');
    if (!tr) return null;
    var list = tr.getAttribute('data-kind') === 'gov' ? state.gov : state.va;
    return list.filter(function (r) { return r.id === tr.getAttribute('data-row'); })[0] || null;
  }

  document.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-action="cycle"]');
    if (chip) {
      var row = findRow(chip);
      if (row) {
        var next = STATUSES[(STATUSES.indexOf(row.status) + 1) % STATUSES.length];
        row.status = next;
        if (next === 'paid' && !row.date) row.date = new Date().toISOString().slice(0, 10);
        if (next === 'todo') row.date = '';
        save();
        renderAll();
      }
      return;
    }

    if (e.target.closest('#vaCollected')) {
      state.vaCollected = !state.vaCollected;
      save();
      renderSummary();
      renderAll();
      return;
    }

    var del = e.target.closest('[data-action="del-log"]');
    if (del) {
      state.log.splice(Number(del.getAttribute('data-idx')), 1);
      save();
      renderLog();
      return;
    }

    var btn = e.target.closest('[data-btn]');
    if (!btn) return;
    var action = btn.getAttribute('data-btn');
    if (action === 'print') window.print();
    if (action === 'csv') exportCsv();
    if (action === 'json') backupJson();
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    var row = findRow(t);
    if (!row) return;
    var field = t.getAttribute('data-field');
    if (field === 'actual') {
      var v = t.value === '' ? null : Math.max(0, parseFloat(t.value) || 0);
      row.actual = v;
      t.setAttribute('data-dirty', v != null && v !== row.est ? '1' : '0');
    } else if (field === 'date') {
      row.date = t.value;
    } else if (field === 'note') {
      row.note = t.value;
    }
    save();
    renderSummary();
    if (field === 'actual') {
      document.getElementById('govFootAct').textContent = fmtShort(govActualTotal());
      document.getElementById('govSubtotal').textContent = fmtShort(govEstimateTotal());
    }
  });

  document.getElementById('vaFee').addEventListener('input', function (e) {
    var v = Math.max(0, parseFloat(e.target.value) || 0);
    state.vaFee = v;
    save();
    renderSummary();
    document.getElementById('vaSubtotal').textContent = fmtShort(v);
  });

  document.getElementById('logForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var dateEl = document.getElementById('logDate');
    var textEl = document.getElementById('logText');
    var text = textEl.value.trim();
    if (!text) return;
    state.log.unshift({ date: dateEl.value || new Date().toISOString().slice(0, 10), text: text });
    state.log.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    textEl.value = '';
    save();
    renderLog();
  });

  /* ── export / backup ───────────────────────────────────── */
  function exportCsv() {
    var rows = [['Section', 'Agency / Service', 'Item', 'Estimate (PHP)', 'Actual paid (PHP)', 'Status', 'Date', 'Note']];
    state.gov.forEach(function (r) {
      rows.push(['Government', r.agency, r.item, r.est, r.status === 'paid' ? (r.actual != null ? r.actual : r.est) : '', STATUS_LABEL[r.status], r.date, r.note]);
    });
    rows.push([]);
    state.va.forEach(function (r) {
      rows.push(['VA Service', r.scope, r.covers, '', '', STATUS_LABEL[r.status], r.date, r.note]);
    });
    rows.push([]);
    rows.push(['TOTALS', '', 'Government subtotal', govEstimateTotal(), govActualTotal(), '', '', 'Actual = paid rows only']);
    rows.push(['TOTALS', '', 'VA handling fee', state.vaFee, '', state.vaCollected ? 'Collected' : 'Not yet collected']);
    rows.push(['TOTALS', '', 'Grand total', govEstimateTotal() + state.vaFee]);

    var csv = rows.map(function (r) {
      return r.map(function (cell) {
        var s = String(cell == null ? '' : cell);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\r\n');

    download(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }), 'ehz-registration-costs.csv');
    toast('CSV downloaded');
  }

  function backupJson() {
    download(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }), 'ehz-tracker-backup.json');
    toast('Backup downloaded');
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  /* ── wiring for the topbar buttons ─────────────────────── */
  document.getElementById('btnPrint').setAttribute('data-btn', 'print');
  document.getElementById('btnCsv').setAttribute('data-btn', 'csv');
  document.getElementById('btnJson').setAttribute('data-btn', 'json');

  document.getElementById('btnReset').addEventListener('click', function () {
    if (!confirm('Reset all statuses, actual amounts and notes back to the original estimates? Log entries are kept.')) return;
    var log = state.log;
    state = clone(SEED);
    state.log = log;
    save();
    renderAll();
    toast('Tracker reset');
  });

  document.getElementById('logDate').value = new Date().toISOString().slice(0, 10);

  renderScope();
  renderAll();
})();
