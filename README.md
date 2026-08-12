# Fuego VIP Lounge — Website

Static site for Fuego VIP Lounge (Tampa nightclub + hookah lounge). VIP section reservations and a paid monthly membership portal, with a Firebase-backed admin dashboard.

**Stack:** Vanilla HTML/CSS/JS, Firebase (Firestore + Auth), Stripe Payment Links, deployed on Vercel.

## Files

- `index.html` — public landing page (hero, VIP section pricing, membership plans, perks, events, social proof)
- `admin.html` — password-protected admin dashboard (guest list, site content editing, gallery, door scan-in, portal member visit tracking)
- `portal-signup.html` — private page (not linked from the public site) that paying members land on after Stripe checkout, to activate their portal account
- `portal.html` — the member portal itself: membership status, visit cap for the current 30-day cycle, personal check-in QR code, and the member photo gallery
- `firebase-config.js` — shared Firebase config, used by all pages
- `firestore.rules` — security rules (see below for what each collection allows)

## Setup (do this before going live)

### 1. Create a Firebase project (free)
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Once created, click the **Web** icon (`</>`) to register a web app. Copy the config object it gives you.
3. Paste those values into `firebase-config.js`, replacing the `YOUR_...` placeholders.

### 2. Turn on Firestore
1. In the Firebase console, go to **Build → Firestore Database → Create database**.
2. Start in production mode (we're supplying our own rules).
3. Go to the **Rules** tab and paste in the contents of `firestore.rules` from this repo, then **Publish**.

### 3. Turn on Authentication (for admin login)
1. Go to **Build → Authentication → Get started**.
2. Enable the **Email/Password** sign-in method.
3. Go to the **Users** tab → **Add user**. Create yourself (or Rasheed) an admin login with email + password. This is the login you'll use at `/admin.html`.
4. In Firestore, create a new document at `admins/{ADMIN_UID}` where `{ADMIN_UID}` is the Firebase Auth UID for that admin user. The document can be empty; its existence is used to verify admin permissions.

> There's no self-serve signup on `admin.html` on purpose — admin accounts are only created by you, inside the Firebase console. Keep that login private.

### 4. Set up the membership portal

The two membership buttons on the site (VIP $100/month, Super ELITE $200/month) are Stripe Payment Links. After someone pays, Stripe needs to hand them off to `portal-signup.html` so they can set a password and activate their portal account.

1. In the Stripe Dashboard, open each Payment Link → **Edit** → **After payment** → choose **Redirect customers to your website**.
2. For the **$100/month VIP** link, set the redirect URL to:
   `https://yourdomain.com/portal-signup.html?tier=vip100&session_id={CHECKOUT_SESSION_ID}`
3. For the **$200/month Super ELITE** link, set the redirect URL to:
   `https://yourdomain.com/portal-signup.html?tier=elite200&session_id={CHECKOUT_SESSION_ID}`
4. Swap `yourdomain.com` for your real deployed domain.

**How verification works (and its tradeoff):** `portal-signup.html` only lets someone create an account if it's opened with a valid `?tier=` value — it doesn't otherwise re-check with Stripe that a payment actually happened. In practice, the only way to reach that URL is by completing checkout on the matching Payment Link, since it isn't linked anywhere on the public site. If you ever want stronger guarantees (e.g. someone could theoretically share the link before creating their account), that requires a Stripe webhook + a small serverless function to verify payment server-side, which also means moving off Firebase's free Spark plan onto the pay-as-you-go Blaze plan. Not set up here — ask if you want it added later.

**Firestore composite indexes:** the portal and admin dashboard both query visits by member and date. The first time each query runs, Firestore will throw an error in the browser console with a **"create index"** link — click it, accept the default, and wait a minute or two for it to build. This only needs to happen once per query shape.

### 5. Push to GitHub
```bash
git init
git add .
git commit -m "Initial Fuego VIP site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fuego-vip.git
git push -u origin main
```

### 6. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the GitHub repo.
2. Framework preset: **Other** (it's a static site, no build step needed).
3. Deploy. Your site will be live at `your-project.vercel.app` — connect a custom domain from the Vercel dashboard whenever you're ready.

## Using the admin dashboard

Go to `yoursite.com/admin.html`, sign in with the admin account you created in step 3.

- **Guest List tab:** view any legacy signups already collected (there's no longer a public opt-in form on the site).
- **Site Content tab:** edit the hero headline/subheadline, address, hours, Instagram handle, phone number, and this week's events. Click **Save Changes** — the public site picks it up on next page load.
- **Gallery tab:** add/remove photos shown in the members-only gallery on `portal.html` (and the free gallery-unlock on `index.html`).
- **Scan-In tab:** open on any staff phone/tablet browser at the door. Tap **Start Camera** and hold a member's portal QR code in frame to log their visit — or use the manual code field if the camera isn't practical. Shows the member's name, tier, and visits used this cycle immediately, with a warning if they're over their monthly cap.
- **Portal Members tab:** every paying member who's activated their portal account, with their tier and visits used in the current rolling 30-day cycle.

## TODOs before launch

- [ ] Fill in real Firebase config in `firebase-config.js`
- [ ] Create the admin user in Firebase Authentication
- [ ] Publish `firestore.rules` in the Firebase console
- [x] Logo added (`images/logo.jpg`) — used in nav, hero background watermark, and favicon
- [x] Friday/Saturday flyer added (`images/flyer-fri-sat.jpg`) to the events section
- [ ] One gallery photo is in (`images/gallery-1.jpg`) — the second "Feel The Room" slot is still a placeholder. Send more shots from the FUEGO PHOTOS folder to fill it in.
- [ ] Swap the 3 testimonials for real reviews once you have them
- [x] Address, hours, phone confirmed against the real flyer (2104 W Busch Blvd, Fri–Sat 2PM–6AM)
- [ ] Confirm 21+ / age-verification language matches your actual door policy
- [x] Real Instagram handle (@fuegoviplounge) linked in footer

## Notes

- The site and admin dashboard both work even if Firebase isn't configured yet — the public page just falls back to default hardcoded content.
- Everything is on Firebase's free Spark plan at this scale — no billing required, unless you later add the webhook-based payment verification mentioned above.
- A member's "30-day cycle" is a rolling window (the last 30 days from right now), not tied to their actual Stripe billing date — there's no webhook syncing subscription renewal dates into Firestore in this setup.
