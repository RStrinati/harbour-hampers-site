# Harbour Hampers – Booking Request Demo

This demo lets a host load an iCal feed of bookings, choose which stays need hampers and submit the selection to an API.

## Files

- `index.html`, `styles.css`, `script.js` – front end.
- `server/worker.js` – Cloudflare Worker proxy that fetches and parses `.ics` files.

## Setup

1. **Deploy the worker**
   - Create a new Cloudflare Worker and paste in `server/worker.js`.
   - Publish and note the Worker URL (e.g. `https://example.workers.dev`).
2. **Configure the front end**
   - In `script.js`, set:
     ```js
     const WORKER_BASE = 'https://example.workers.dev';
     const SUBMIT_ENDPOINT = 'https://your-api.example.com/hamper-requests';
     ```
3. Serve `index.html` from any static host or open it directly in your browser.

## Usage

1. Paste an Airbnb/VRBO iCal URL and click **Load bookings**.
2. Upcoming events are listed with a checkbox and optional note field.
3. Select one or more bookings and click **Submit selected**.
4. The page sends a `POST` request to `SUBMIT_ENDPOINT` with JSON:
   ```json
   {
     "ical_source": "<original url>",
     "selected_bookings": [
       {
         "start": "2025-09-13T14:00:00Z",
         "end": "2025-09-15T10:00:00Z",
         "summary": "Reserved",
         "note": "Please deliver after 1pm"
       }
     ]
   }
   ```

## Testing

- Use a real Airbnb iCal export for manual testing.
- Point `SUBMIT_ENDPOINT` to a request catcher (e.g., https://webhook.site) to verify the payload.
- The Worker parser handles all-day events and timed events with/without `Z`.

## Booking requests via iCal
The page also lets hosts load an iCal feed of bookings, tick which stays need hampers and submit the selection to an API.

1. **Deploy the worker**
   - Create a Cloudflare Worker and paste in `server/worker.js`.
   - Publish and note the Worker URL (e.g. `https://example.workers.dev`).
2. **Configure the front end**
   - In `script.js`, set:
     ```js
     const WORKER_BASE = 'https://example.workers.dev';
     const SUBMIT_ENDPOINT = 'https://your-api.example.com/hamper-requests';
     ```
3. Paste an Airbnb/VRBO iCal URL on the page and load bookings. Select one or more events and submit to send a JSON payload to your endpoint.

## Local development

No build step is required. Start a simple static file server (e.g., `python -m http.server 8000`) or open `index.html` directly.
