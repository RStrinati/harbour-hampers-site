export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }
    const url = new URL(request.url);
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

function cors() {
  return {
    'Content-Type':'application/json',
    'Access-Control-Allow-Origin':'*'
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
