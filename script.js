// Basic enhancements & form submission to Formspree
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('lead-form');
const statusEl = document.getElementById('form-status');
const endpoint = document.getElementById('form-endpoint').value;

form.addEventListener('submit', async (e) => {
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

  const data = new FormData(form);

  try{
    const res = await fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      form.reset();
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
