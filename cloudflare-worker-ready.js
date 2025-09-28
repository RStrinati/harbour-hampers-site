export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }
    
    const url = new URL(request.url);
    
    // Handle form submissions
    if (url.pathname === '/submit-form' && request.method === 'POST') {
      return handleFormSubmission(request);
    }
    
    // Handle iCal parsing (existing functionality)
    if (url.pathname === '/ical') {
      const icsUrl = url.searchParams.get('url');
      const headers = cors();
      if (!icsUrl) return new Response(JSON.stringify({error:'Missing url'}), { status:400, headers });
      let remote;
      try { remote = new URL(icsUrl); } catch { return new Response(JSON.stringify({error:'Invalid url'}), { status:400, headers }); }
      const allowed = ['airbnb.com','airbnb.com.au','abnb.me','vrbo.com','booking.com'];
      if (!allowed.some(h => remote.hostname === h || remote.hostname.endsWith('.'+h))) {
        return new Response(JSON.stringify({error:'Host not allowed'}), { status:400, headers });
      }
      try {
        const resp = await fetch(icsUrl);
        if (!resp.ok) return new Response(JSON.stringify({error:'Upstream error'}), { status:502, headers });
        const text = await resp.text();
        const events = parseICS(text);
        return new Response(JSON.stringify({events}), { headers });
      } catch {
        return new Response(JSON.stringify({error:'Fetch failed'}), { status:500, headers });
      }
    }
    
    return new Response('Not found', { status:404, headers: cors() });
  }
};

async function handleFormSubmission(request) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    // Basic spam protection - check honeypot field
    if (data._gotcha) {
      return new Response(JSON.stringify({error: 'Spam detected'}), { 
        status: 400, 
        headers: cors() 
      });
    }
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({error: 'Missing required fields'}), { 
        status: 400, 
        headers: cors() 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({error: 'Invalid email format'}), { 
        status: 400, 
        headers: cors() 
      });
    }
    
    // Send to Zapier webhook
    const webhookResult = await sendToZapier(data);
    
    if (webhookResult.success) {
      return new Response(JSON.stringify({
        success: true, 
        message: 'Thank you! We\'ll be in touch within 24 hours to discuss your welcome hamper needs.'
      }), { 
        headers: cors() 
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
      headers: cors() 
    });
  }
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
        source: 'HAMPA Website',
        userAgent: formData.userAgent || 'Unknown'
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

function cors() {
  return {
    'Content-Type':'application/json',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function parseICS(text) {
  const events = [];
  const blocks = text.split('BEGIN:VEVENT').slice(1);
  for (const block of blocks) {
    const body = block.split('END:VEVENT')[0];
    const lines = body.split(/\r?\n/);
    let start,end,summary;
    for (const line of lines) {
      if (line.startsWith('DTSTART')) {
        const [,v] = line.split(':');
        start = parseDate(v.trim());
      } else if (line.startsWith('DTEND')) {
        const [,v] = line.split(':');
        end = parseDate(v.trim());
      } else if (line.startsWith('SUMMARY')) {
        const [,v] = line.split(':');
        summary = v.trim();
      }
    }
    if (start && end) events.push({ start, end, summary });
  }
  return events;
}

function parseDate(str) {
  if (/^\d{8}$/.test(str)) {
    return `${str.slice(0,4)}-${str.slice(4,6)}-${str.slice(6,8)}T00:00:00`;
  }
  if (/^\d{8}T\d{6}Z$/.test(str)) {
    return `${str.slice(0,4)}-${str.slice(4,6)}-${str.slice(6,8)}T${str.slice(9,11)}:${str.slice(11,13)}:${str.slice(13,15)}Z`;
  }
  if (/^\d{8}T\d{6}$/.test(str)) {
    return `${str.slice(0,4)}-${str.slice(4,6)}-${str.slice(6,8)}T${str.slice(9,11)}:${str.slice(11,13)}:${str.slice(13,15)}`;
  }
  return str;
}
