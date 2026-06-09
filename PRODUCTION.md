# Production Readiness Guide - MeetSync

## 1. Custom Domains (Vercel)
To add a professional domain to your Vercel deployment:
1. Go to your **Project Dashboard** in Vercel.
2. Navigate to **Settings > Domains**.
3. Type your domain (e.g., `schedule.yourname.com`) and click **Add**.
4. Follow the DNS instructions (adding an A record or CNAME) provided by Vercel in your domain registrar (GoDaddy, Namecheap, etc.).

## 2. Google OAuth Production Setup
When moving to production, you must update your Google Cloud Console settings:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project.
3. Go to **APIs & Services > Credentials**.
4. Edit your **OAuth 2.0 Client ID**.
5. Add your production URL to **Authorized JavaScript origins**:
   - `https://your-domain.com`
6. Add your callback URL to **Authorized redirect URIs**:
   - `https://your-domain.com/api/auth/callback/google`
   - (If using Clerk, this is usually handled via Clerk's own redirect URLs, so ensure your Clerk Dashboard production URLs are also updated).

## 3. Google App Verification
To remove the "This app is unverified" warning for your users:
1. Go to **APIs & Services > OAuth consent screen**.
2. Fill in all required fields (App logo, homepage, privacy policy).
3. Under **Scopes for Google APIs**, ensure you've only added `auth/calendar.events` if necessary.
4. Click **Submit for verification**.
   - *Note: This can take 3-7 days and may require a simple privacy policy page.*

## 4. Monitoring & Scaling
- **Error Tracking**: Consider adding [Sentry](https://sentry.io) for real-time error logging.
- **Analytics**: Use [PostHog](https://posthog.com) or [Vercel Web Analytics] to track booking conversion rates.
- **Database Backups**: Since you are using Neon/Supabase, verify that daily backups are enabled in their respective dashboards.

## 5. Stripe Production Setup
If you use paid meetings:
1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Toggle to **Production mode**.
3. Copy your **Secret Key** and **Publishable Key** to your production environment variables (e.g., in Vercel).
4. Go to **Developers > Webhooks**.
5. Add an endpoint: `https://your-domain.com/api/webhooks/stripe`.
6. Select the `checkout.session.completed` event.
7. Copy the **Signing secret** (starts with `whsec_`) and add it to your `STRIPE_WEBHOOK_SECRET` environment variable.
