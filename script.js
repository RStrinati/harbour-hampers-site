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

// Enhanced form handling with Cloudflare Worker
const orderForm = document.querySelector('#contact-form form');
if (orderForm) {
  // Add form validation feedback
  const inputs = orderForm.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateField(input);
    });
  });

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    let isValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      showMessage('Please correct the highlighted errors before submitting.', 'error');
      return;
    }
    
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    
    try {
      const formData = new FormData(orderForm);
      
      // Use your Cloudflare Pages function endpoint
      const workerUrl = '/submit-form';
      
      const res = await fetch(workerUrl, {
        method: 'POST',
        body: formData,
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      const result = await res.json();
      
      if (res.ok && result.success) {
        orderForm.reset();
        showMessage(result.message || 'Thank you! We\'ll be in touch within 24 hours to discuss your welcome hamper needs.', 'success');
        
        // Optional: Redirect to thank you page after 2 seconds
        setTimeout(() => {
          window.location.href = 'thank-you.html';
        }, 2000);
        
      } else {
        throw new Error(result.error || 'Server error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showMessage('Something went wrong. Please try again or email us directly at hello@hampa.com.au', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  
  // Remove previous error styling
  field.classList.remove('error');
  
  // Check required fields
  if (field.hasAttribute('required') && !value) {
    field.classList.add('error');
    isValid = false;
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      field.classList.add('error');
      isValid = false;
    }
  }
  
  // Phone validation (Australian format)
  if (field.type === 'tel' && value) {
    const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      field.classList.add('error');
      isValid = false;
    }
  }
  
  return isValid;
}

function showMessage(message, type) {
  // Remove existing messages
  const existingMsg = document.querySelector('.form-message');
  if (existingMsg) existingMsg.remove();
  
  const msgEl = document.createElement('div');
  msgEl.className = `form-message ${type}`;
  msgEl.textContent = message;
  
  const form = document.querySelector('#contact-form form');
  form.insertBefore(msgEl, form.firstChild);
  
  // Auto-remove success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => msgEl.remove(), 5000);
  }
}
