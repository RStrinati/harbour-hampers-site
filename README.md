# HAMPA marketing page

Static one-pager for HAMPA welcome hampers.

## Files

- `index.html` – landing page and forms.
- `styles.css` – minimal theme.
- `script.js` – Formspree submits and iCal loader.
- `assets/` – logo; add your own `og.png` for social sharing.
- `server/worker.js` – Cloudflare Worker proxy for iCal → JSON.

## Setup

1. **Deploy the worker**
   - In Cloudflare dashboard create a Worker and paste `server/worker.js`.
   - Publish and note the public URL (e.g. `https://example.workers.dev`).
2. **Formspree endpoints**
   - Create two forms in [Formspree](https://formspree.io).
   - Replace the values of the hidden inputs `#form-endpoint` and `#hamper-endpoint` in `index.html` with the form URLs.
3. **Configure `script.js`**
   - Set `WORKER_BASE` to your Worker URL.
4. **GitHub Pages**
   - Push this repo to GitHub.
   - In repository settings → Pages, choose the main branch root as the source.
   - The site will be served from `https://<user>.github.io/<repo>/`.

## Usage

1. Open the page via GitHub Pages or a local file server.
2. Fill out the sample request form. Required fields and consent must be checked.
3. For bookings, paste an Airbnb/VRBO/Booking.com iCal URL and click **Load bookings**.
4. Select upcoming events, add notes and delivery preferences, confirm consent and submit.
5. Both forms send `POST` requests to their Formspree endpoints and show inline success/error messages.

## Worker endpoint

`GET /ical?url=<encoded_ics_url>` → `{ "events": [{"start":"...","end":"...","summary":"..."}] }`

Only calendars from `airbnb.com`, `airbnb.com.au`, `abnb.me`, `vrbo.com` and `booking.com` are proxied. CORS header `Access-Control-Allow-Origin: *` allows browser use.

## Development

No build step is required. Serve the repo with any static server, e.g.:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
