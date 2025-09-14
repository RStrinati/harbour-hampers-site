// script.js

// ==============================
// Config (declare once)
// ==============================
const WORKER_BASE = 'https://<your-worker>.workers.dev';
const DEFAULT_SUBMIT_ENDPOINT = 'https://example.com/api/hamper-requests';

// Small helper
const $ = (sel) => document.querySelector(sel);

// ==============================
// Lead form (simple capture)
//  - Expects: #lead-form, #form-status, #consent, #form-endpoint (optional)
// ==============================
(() => {
  const leadForm   = $('#lead-form');
  const statusEl   = $('#form-status');
  const endpointEl = $('#form-endpoint'); // optional hidden input

  if (!leadForm || !statusEl) return; // If the lead form block doesn't exist on this page, skip.

  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.className = 'status';
    statusEl.textContent = 'Sending…';

    const consent = $('#consent');
    if (!consent || !consent.checked) {
      statusEl.classList.add('err');
      statusEl.textContent = 'Please tick the consent box to continue.';
      return; // IMPORTANT
    }

    const submitUrl = (endpointEl?.value || DEFAULT_SUBMIT_ENDPOINT).trim();
    const formData = new FormData(leadForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Submit failed');
      }

      leadForm.reset();
      statusEl.classList.add('ok');
      statusEl.textContent = 'Thanks! We\'ll be in touch to schedule your sample.';
    } catch (err) {
      statusEl.classList.add('err');
      statusEl.textContent = err.message || 'Something went wrong. Please try again later.';
    }
  });
})();

// ==============================
// Booking (iCal load + select + submit)
//  - Expects: #load-btn, #ical-url, #load-status
//             #booking-form, #events-list, #submit-status
// ==============================
(() => {
  const loadBtn      = $('#load-btn');
  const icalInput    = $('#ical-url');
  const loadStatus   = $('#load-status');
  const bookingForm  = $('#booking-form');
  const list         = $('#events-list');
  const submitStatus = $('#submit-status');

  // If any of the core booking elements is missing, skip wiring up this block.
  if (!loadBtn || !icalInput || !loadStatus || !bookingForm || !list || !submitStatus) return;

  let loadedEvents = [];

  loadBtn.addEventListener('click', async () => {
    const url = icalInput.value.trim();
    if (!url) {
      loadStatus.textContent = 'Please enter an iCal URL.';
      loadStatus.className = 'status err';
      return;
    }
    loadStatus.textContent = 'Loading…';
    loadStatus.className = 'status';

    try {
      const resp = await fetch(`${WORKER_BASE}/ical?url=${encodeURIComponent(url)}`);
      if (!resp.ok) throw new Error('Could not fetch calendar');
      const json = await resp.json();

      const now = new Date();
      loadedEvents = (json.events || [])
        .map(ev => ({ ...ev, start: new Date(ev.start), end: new Date(ev.end) }))
        .filter(ev => ev.end >= now)
        .sort((a, b) => a.start - b.start);

      list.innerHTML = '';
      if (loadedEvents.length === 0) {
        loadStatus.textContent = 'No upcoming bookings found.';
        bookingForm.classList.add('hidden');
        return;
      }

      loadedEvents.forEach((ev, i) => {
        const li = document.createElement('li');
        li.className = 'event';
        li.dataset.index = String(i);

        const top = document.createElement('div');
        top.className = 'top';

        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'check';

        const summary = document.createElement('span');
        summary.className = 'summary';
        summary.textContent = ev.summary || 'Booking';

        const dates = document.createElement('span');
        dates.className = 'dates';
        dates.textContent = formatDateRange(ev.start, ev.end);

        top.append(check, summary, dates);

        const note = document.createElement('input');
        note.type = 'text';
        note.className = 'note';
        note.placeholder = 'Note (optional)';

        li.append(top, note);
        list.appendChild(li);
      });

      bookingForm.classList.remove('hidden');
      loadStatus.textContent = '';
    } catch (err) {
      bookingForm.classList.add('hidden');
      loadStatus.textContent = 'Could not load calendar.';
      loadStatus.className = 'status err';
    }
  });

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitStatus.textContent = '';
    submitStatus.className = 'status';

    const selections = [];
    list.querySelectorAll('li.event').forEach(li => {
      const check = li.querySelector('.check');
      if (check && check.checked) {
        const idx = Number(li.dataset.index);
        const ev = loadedEvents[idx];
        if (!ev) return;
        const note = (li.querySelector('.note')?.value || '').trim();
        selections.push({
          start: ev.start.toISOString(),
          end: ev.end.toISOString(),
          summary: ev.summary || '',
          note
        });
      }
    });

    if (selections.length === 0) {
      submitStatus.textContent = 'Please select at least one booking.';
      submitStatus.className = 'status err';
      return;
    }

    submitStatus.textContent = 'Submitting…';
    try {
      const res = await fetch(DEFAULT_SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ical_source: icalInput.value.trim(),
          selected_bookings: selections
        })
      });
      if (!res.ok) throw new Error('Submission failed');

      submitStatus.textContent = 'Submitted!';
      submitStatus.className = 'status ok';
    } catch (err) {
      submitStatus.textContent = err.message || 'Submission failed.';
      submitStatus.className = 'status err';
    }
  });
})();

// ==============================
// Helpers
// ==============================
function formatDateRange(start, end) {
  const optsStart = { day: 'numeric', month: 'short' };
  const optsEnd   = { day: 'numeric', month: 'short', year: 'numeric' };
  const startStr  = start.toLocaleDateString(undefined, optsStart);
  const endStr    = end.toLocaleDateString(undefined, optsEnd);
  return `${startStr} – ${endStr}`;
}
