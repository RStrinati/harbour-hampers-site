export async function onRequestPost(context) {
  try {
    const request = context.request;
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    // Basic spam protection - check honeypot field
    if (data._gotcha) {
      return new Response(JSON.stringify({error: 'Spam detected'}), { 
        status: 400, 
        headers: getCorsHeaders() 
      });
    }
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({error: 'Missing required fields'}), { 
        status: 400, 
        headers: getCorsHeaders() 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({error: 'Invalid email format'}), { 
        status: 400, 
        headers: getCorsHeaders() 
      });
    }
    
    // Send to Zapier webhook
    const webhookResult = await sendToZapier(data);
    
    if (webhookResult.success) {
      return new Response(JSON.stringify({
        success: true, 
        message: 'Thank you! We\'ll be in touch within 24 hours to discuss your welcome hamper needs.'
      }), { 
        headers: getCorsHeaders() 
      });
    } else {
      throw new Error('Webhook sending failed');
    }
    
  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(JSON.stringify({
      error: 'Something went wrong. Please try again or email us directly at hello@hampa.com.au'
    }), { 
      status: 500, 
      headers: getCorsHeaders() 
    });
  }
}

export async function onRequestOptions(context) {
  return new Response(null, { headers: getCorsHeaders() });
}

async function sendToZapier(formData) {
  const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/13533183/u10kbt4/';
  
  try {
    const response = await fetch(ZAPIER_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Form data
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        propertyType: formData['property-type'] || 'Not specified',
        address: formData.address || 'Not provided',
        guestsPerMonth: formData['guests-per-month'] || 'Not specified',
        message: formData.message,
        
        // Additional data for your records
        timestamp: new Date().toISOString(),
        source: 'HAMPA Website - Cloudflare Pages',
        referrer: formData.referrer || 'Unknown'
      })
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      console.error('Zapier webhook failed:', response.status, await response.text());
      return { success: false };
    }
  } catch (error) {
    console.error('Zapier webhook error:', error);
    return { success: false };
  }
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
