# Fuego VIP Lounge — Website

Static site for Fuego VIP Lounge (Tampa nightclub + hookah lounge). Guest-list opt-in landing page with a Firebase-backed admin dashboard.

**Stack:** Vanilla HTML/CSS/JS, Firebase (Firestore + Auth), deployed on Vercel.

## Files

- `index.html` — public landing page (hero, opt-in form, perks, events, social proof)
- `admin.html` — password-protected admin dashboard (guest list + content editing)
- `firebase-config.js` — shared Firebase config, used by both pages
- `firestore.rules` — security rules (public can submit to guest list; only signed-in admins can read/edit)
- `vercel.json` — deploy config

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

> There's no self-serve signup on `admin.html` on purpose — admin accounts are only created by you, inside the Firebase console. Keep that login private.

### 4. Push to GitHub
```bash
git init
git add .
git commit -m "Initial Fuego VIP site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fuego-vip.git
git push -u origin main
```

### 5. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the GitHub repo.
2. Framework preset: **Other** (it's a static site, no build step needed).
3. Deploy. Your site will be live at `your-project.vercel.app` — connect a custom domain from the Vercel dashboard whenever you're ready.

## Using the admin dashboard

Go to `yoursite.com/admin.html`, sign in with the admin account you created in step 3.

- **Guest List tab:** see every signup in real time, mark people as contacted, delete entries, or export the whole list as a CSV.
- **Site Content tab:** edit the hero headline/subheadline, CTA button text, address, hours, Instagram handle, phone number, and this week's events. Click **Save Changes** — the public site picks it up on next page load.

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

- The opt-in form and admin dashboard both work even if Firebase isn't configured yet — the public page just falls back to default hardcoded content, and the form will show an error message until Firestore is live.
- Everything is on Firebase's free Spark plan at this scale (guest list signups + one admin editing content) — no billing required.
