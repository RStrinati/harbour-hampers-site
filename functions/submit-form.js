export async function onRequestPost({ request, env }) {
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
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Name, email, and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send email using Resend API directly
    const emailPayload = {
      from: 'r.strinati@strinatidesign.com',
      to: 'r.strinati@strinatidesign.com',
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
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(JSON.stringify({ success: true, message: 'Thank you! We\'ll be in touch within 24 hours.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
