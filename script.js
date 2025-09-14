const WORKER_BASE = 'https://<your-worker>.workers.dev';

// set footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// lead form
const leadForm = document.getElementById('lead-form');
const leadStatus = document.getElementById('lead-status');
const leadEndpoint = document.getElementById('form-endpoint').value;
if (leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    leadStatus.textContent = 'Sending…';
    leadStatus.className = 'status';
    try {
      const res = await fetch(leadEndpoint, {
        method: 'POST',
        body: new FormData(leadForm),
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error();
      leadForm.reset();
      leadStatus.textContent = 'Thanks! Check your inbox.';
      leadStatus.className = 'status ok';
    } catch {
      leadStatus.textContent = 'Something went wrong.';
      leadStatus.className = 'status err';
    }
  });
}

// calendar loading and submission
const loadBtn = document.getElementById('load-btn');
const icalInput = document.getElementById('ical-url');
const loadStatus = document.getElementById('load-status');
const hamperForm = document.getElementById('hamper-form');
const eventsList = document.getElementById('events-list');
const hamperStatus = document.getElementById('hamper-status');
const hamperEndpoint = document.getElementById('hamper-endpoint').value;
const deliveryPrefs = document.getElementById('delivery-prefs');
const consent2 = document.getElementById('consent2');
let events = [];

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
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    const now = new Date();
    events = (data.events || [])
      .map(ev => ({ ...ev, start: new Date(ev.start), end: new Date(ev.end) }))
      .filter(ev => ev.end >= now)
      .sort((a,b) => a.start - b.start);

    eventsList.innerHTML = '';
    if (events.length === 0) {
      hamperForm.classList.add('hidden');
      loadStatus.textContent = 'No upcoming bookings found.';
      return;
    }
    events.forEach((ev, idx) => {
      const li = document.createElement('li');
      const label = document.createElement('label');
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'check';
      check.dataset.index = idx;
      const summary = document.createElement('span');
      summary.className = 'summary';
      summary.textContent = ev.summary || 'Booking';
      const dates = document.createElement('span');
      dates.className = 'dates';
      dates.textContent = formatRange(ev.start, ev.end);
      label.append(check, summary, dates);
      const note = document.createElement('input');
      note.type = 'text';
      note.placeholder = 'Note (optional)';
      note.className = 'note';
      li.append(label, note);
      eventsList.appendChild(li);
    });
    hamperForm.classList.remove('hidden');
    loadStatus.textContent = '';
  } catch (err) {
    hamperForm.classList.add('hidden');
    loadStatus.textContent = 'Could not load calendar.';
    loadStatus.className = 'status err';
  }
});

hamperForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hamperStatus.textContent = '';
  hamperStatus.className = 'status';
  if (!consent2.checked) {
    hamperStatus.textContent = 'Consent required.';
    hamperStatus.className = 'status err';
    return;
  }
  const selected = [];
  eventsList.querySelectorAll('li').forEach(li => {
    const check = li.querySelector('.check');
    if (check.checked) {
      const idx = Number(check.dataset.index);
      const ev = events[idx];
      const note = li.querySelector('.note').value.trim();
      selected.push({
        start: ev.start.toISOString(),
        end: ev.end.toISOString(),
        summary: ev.summary,
        note
      });
    }
  });
  if (selected.length === 0) {
    hamperStatus.textContent = 'Select at least one booking.';
    hamperStatus.className = 'status err';
    return;
  }
  hamperStatus.textContent = 'Submitting…';
  try {
    const fd = new FormData();
    fd.append('selected_bookings_json', JSON.stringify(selected));
    fd.append('delivery_prefs', deliveryPrefs.value.trim());
    const res = await fetch(hamperEndpoint, { method: 'POST', body: fd, headers:{'Accept':'application/json'} });
    if (!res.ok) throw new Error();
    hamperForm.reset();
    hamperStatus.textContent = 'Submitted!';
    hamperStatus.className = 'status ok';
  } catch {
    hamperStatus.textContent = 'Submission failed.';
    hamperStatus.className = 'status err';
  }
});

function formatRange(start, end) {
  const startStr = start.toLocaleString(undefined, { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
  const endStr = end.toLocaleString(undefined, { hour:'2-digit', minute:'2-digit' });
  return `${startStr} → ${endStr}`;
}
