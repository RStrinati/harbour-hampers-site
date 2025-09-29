export async function onRequestPost({ request, env }) {
  console.log('Function called with env:', Object.keys(env));
  console.log('RESEND_API_KEY present:', !!env.RESEND_API_KEY);
  
  try {
    const formData = await request.formData();

    // Extract form fields
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const propertyType = formData.get('property-type');
    const address = formData.get('address');
    const guestsPerMonth = formData.get('guests-per-month');
    const message = formData.get('message');

    // Basic spam protection - check honeypot field
    if (formData.get('_gotcha')) {
      return new Response(JSON.stringify({ success: false, error: 'Spam detected' }), {
        status: 400,
        headers: getCorsHeaders(),
      });
    }

    // Basic validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Name, email, and message are required' }), {
        status: 400,
        headers: getCorsHeaders(),
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email format' }), {
        status: 400,
        headers: getCorsHeaders(),
      });
    }

    // Check if API key is available
    if (!env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not found in environment');
      return new Response(JSON.stringify({ success: false, error: 'Email service not configured' }), {
        status: 500,
        headers: getCorsHeaders(),
      });
    }

    // Send email using Resend API directly
    const emailPayload = {
      from: 'hello@farefinder.pro', // From your verified domain
      to: 'r.strinati@strinatidesign.com', // Your receiving email
      subject: 'New Welcome Hamper Inquiry',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Property Type:</strong> ${propertyType || 'Not specified'}</p>
        <p><strong>Property Address:</strong> ${address || 'Not provided'}</p>
        <p><strong>Guests Per Month:</strong> ${guestsPerMonth || 'Not specified'}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Submitted on: ${new Date().toISOString()}</small></p>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', response.status, errorText);
      return new Response(JSON.stringify({ success: false, error: 'Failed to send email' }), {
        status: 500,
        headers: getCorsHeaders(),
      });
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(JSON.stringify({ success: true, message: 'Thank you! We\'ll be in touch within 24 hours.' }), {
      headers: getCorsHeaders(),
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: getCorsHeaders(),
    });
  }
}export async function onRequestOptions() {
  return new Response(null, {
    headers: getCorsHeaders()
  });
}

function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}
