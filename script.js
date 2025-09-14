// Basic enhancements & form submission to Formspree
document.getElementById('year').textContent = new Date().getFullYear();

const leadForm = document.getElementById('lead-form');
const statusEl = document.getElementById('form-status');
const endpoint = document.getElementById('form-endpoint').value;

leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.className = 'status';
  statusEl.textContent = 'Sending…';

  // Simple required consent check (also enforced by required attribute)
  const consent = document.getElementById('consent');
  if(!consent.checked){
    statusEl.classList.add('err');
    statusEl.textContent = 'Please tick the consent box to continue.';
    return;
  }

    const data = new FormData(leadForm);

  try{
    const res = await fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      leadForm.reset();
      statusEl.classList.add('ok');
      statusEl.textContent = 'Thanks! We\'ll be in touch to schedule your sample.';
    } else {
      const body = await res.json().catch(() => ({}));
      statusEl.classList.add('err');
      statusEl.textContent = body.error || 'Something went wrong. Please try again later.';
    }
  }catch(err){
    statusEl.classList.add('err');
    statusEl.textContent = 'Network error. Please check your connection and try again.';
  }
});

// Booking request logic
const WORKER_BASE = 'https://<your-worker>.workers.dev';
const SUBMIT_ENDPOINT = 'https://example.com/api/hamper-requests';

const loadBtn = document.getElementById('load-btn');
const icalInput = document.getElementById('ical-url');
const loadStatus = document.getElementById('load-status');
const bookingForm = document.getElementById('booking-form');
const list = document.getElementById('events-list');
const submitStatus = document.getElementById('submit-status');

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
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    const now = new Date();
    loadedEvents = (data.events || [])
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
      li.dataset.index = i;

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
  list.querySelectorAll('li').forEach(li => {
    const check = li.querySelector('.check');
    if (check.checked) {
      const idx = Number(li.dataset.index);
      const ev = loadedEvents[idx];
      const note = li.querySelector('.note').value.trim();
      selections.push({
        start: ev.start.toISOString(),
        end: ev.end.toISOString(),
        summary: ev.summary,
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
    const res = await fetch(SUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ical_source: icalInput.value.trim(),
        selected_bookings: selections
      })
    });
    if (!res.ok) throw new Error();
    submitStatus.textContent = 'Submitted!';
    submitStatus.className = 'status ok';
  } catch (err) {
    submitStatus.textContent = 'Submission failed.';
    submitStatus.className = 'status err';
  }
});

function formatDateRange(start, end) {
  const opts = { day: 'numeric', month: 'short' };
  const startStr = start.toLocaleDateString(undefined, opts);
  const endOpts = { day: 'numeric', month: 'short', year: 'numeric' };
  const endStr = end.toLocaleDateString(undefined, endOpts);
  return `${startStr} – ${endStr}`;
}
