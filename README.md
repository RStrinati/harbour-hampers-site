# Harbour Hampers – One‑Page Site

Static, single‑page site for a Sydney Airbnb host hamper service. Built with vanilla HTML/CSS/JS so it works on GitHub Pages with **no backend**.

## Live on GitHub Pages
1. Create a new GitHub repo (e.g., `harbour-hampers-site`).
2. Upload these files (or clone + push).
3. In **Settings → Pages**, set:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` (or `master`) / `/root`
4. Wait for Pages to build; your site will be available at `https://<your-username>.github.io/<repo>/`.

## Form handling (no server)
This template uses **Formspree** for form submissions.

- Sign up at https://formspree.io
- Create a form and copy the form ID (looks like `https://formspree.io/f/xxxxxx`)
- Open `index.html` and replace `YOUR_FORMSPREE_ID` in the hidden input:
  ```html
  <input type="hidden" id="form-endpoint" value="https://formspree.io/f/YOUR_FORMSPREE_ID">
  ```

> Tip: In Formspree, set a confirmation email and webhook if you want to pipe leads to a Google Sheet/CRM later.

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
Just open `index.html` in your browser. For a simple local server:
```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

## Customisation
- **Branding:** Replace `assets/logo.svg` and update brand name in the header/footer.
- **Content:** Update sections in `index.html` (hero copy, features, inventory, etc.).
- **Styles:** Tweak `styles.css` to match your palette (brand blue is `#1f6feb`).

## Compliance (AU)
- The form has a **required consent checkbox** and a **Privacy Notice** block.
- Update the notice with your legal name/email and retention practices.
- Always maintain an unsubscribe mechanism in your outreach.

## License
MIT — free to use and adapt.
