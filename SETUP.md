# HAMPA Form Setup - Cloudflare Worker Guide

## ✅ What's Been Done
- Modified your existing Cloudflare Worker to handle form submissions
- Updated the HTML form to use your worker endpoint
- Enhanced JavaScript for better error handling
- Added spam protection and validation

## 🚀 Setup Options (Choose One)

### Option 1: Simple Webhook (Easiest - 5 minutes)
1. **Create a Zapier Webhook** (recommended):
   - Go to [zapier.com](https://zapier.com) → Create new Zap
   - Trigger: "Webhook by Zapier" → "Catch Hook"
   - Copy the webhook URL they give you
   - Action: "Email by Zapier" → Send to hello@hampa.com.au
   - Test and activate

2. **Update Worker Environment Variable**:
   ```bash
   wrangler secret put WEBHOOK_URL
   # Paste your Zapier webhook URL when prompted
   ```

### Option 2: Resend API (Professional - 10 minutes)
1. **Sign up for Resend** (resend.com):
   - Free tier: 3,000 emails/month
   - Get your API key from dashboard

2. **Set up environment variables**:
   ```bash
   wrangler secret put RESEND_API_KEY
   # Paste your Resend API key when prompted
   ```

3. **Verify domain** (optional but recommended):
   - Add DNS records in your domain provider
   - Verify in Resend dashboard

### Option 3: Other Email Services
Replace the `sendEmail` function in `worker.js` with:
- **SendGrid**: Use their API
- **Mailgun**: Use their API  
- **SMTP**: Use Cloudflare Email Workers

## 🛠 Deploy Steps

1. **Navigate to your worker directory**:
   ```bash
   cd server
   ```

2. **Deploy your updated worker**:
   ```bash
   wrangler deploy
   ```

3. **Test the form** on your live site

## 🔧 Environment Variables Needed

In your Cloudflare dashboard, set these environment variables:

### For Webhook Option:
- `WEBHOOK_URL` - Your Zapier/Make/IFTTT webhook URL

### For Resend Option:
- `RESEND_API_KEY` - Your Resend API key

## 📧 What Happens When Someone Submits

1. Form data is validated on the client side
2. Cloudflare Worker receives and validates the submission
3. Email is sent to hello@hampa.com.au with all form details
4. User sees success message and is redirected to thank-you page
5. You get a nicely formatted email with the enquiry

## 🛡 Security Features Included

- ✅ Honeypot spam protection
- ✅ Email format validation
- ✅ Required field validation
- ✅ CORS headers properly configured
- ✅ Rate limiting (can be added if needed)

## 🎯 Benefits Over Formspree

- ✅ **Free** (no monthly limits)
- ✅ **Full control** over email formatting
- ✅ **Custom validation** rules
- ✅ **No external dependencies**
- ✅ **Professional email templates**
- ✅ **Easy to extend** with additional features

## 🚨 Quick Test Commands

Test your worker locally:
```bash
wrangler dev
# Then submit the form on localhost
```

Test form submission directly:
```bash
curl -X POST https://your-worker-url.workers.dev/submit-form \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "message=Test message"
```

## 📞 Need Help?

If you run into issues:
1. Check Cloudflare Worker logs in the dashboard
2. Verify environment variables are set
3. Test webhook URL manually
4. Check browser console for JavaScript errors

The setup is much simpler than it looks - you just need to choose your email delivery method and set one environment variable!
