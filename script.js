// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });

  // Close menu when clicking on a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPosition = target.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Order form
const orderForm = document.querySelector('#contact-form form');
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
