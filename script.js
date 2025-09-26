// Order form
const orderForm = document.querySelector('#order-form form');
if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    try {
      const res = await fetch(orderForm.action, {
        method: 'POST',
        body: new FormData(orderForm),
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error();
      orderForm.reset();
      alert('Thanks! We\'ll be in touch soon.');
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}
