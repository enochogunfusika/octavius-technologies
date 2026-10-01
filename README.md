# Octavius Technologies — HNG15 Lesson 2 (Individual Task)

An online shop with a checkout page, built with Next.js.

- **Database:** Supabase (users, products, orders, order items)
- **Auth:** Google sign-in via Google Cloud Console + Auth.js
- **Emails:** order confirmation emails via Mailgun

## Pages

| Page | What it does |
|---|---|
| `/` | Product catalogue loaded from Supabase |
| `/cart` | Cart with quantity controls (kept in the browser) |
| `/checkout` | Requires Google sign-in, collects delivery details, places the order |
| `/success` | Order confirmation |
| `/orders` | The signed-in user's order history |

## Setup

### 1. Install
```bash
npm install
cp .env.example .env.local
npx auth secret      # writes AUTH_SECRET into .env.local
```

### 2. Supabase
1. Create a project at https://supabase.com
2. Open **SQL Editor**, paste all of `supabase/schema.sql`, and run it. This creates the tables and adds 8 starter products.
3. From **Project Settings → API**, copy the **Project URL** into `SUPABASE_URL` and the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Google sign-in (Google Cloud Console)
1. Go to https://console.cloud.google.com and create a project.
2. **APIs & Services → OAuth consent screen**: choose External, fill in the app name ("Octavius Technologies") and your email, and add yourself (and your reviewers) as **test users**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → Web application.
4. Under **Authorized redirect URIs** add:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-VERCEL-URL/api/auth/callback/google` (after you deploy)
5. Copy the Client ID into `AUTH_GOOGLE_ID` and the Client Secret into `AUTH_GOOGLE_SECRET`.

### 4. Mailgun
1. Sign up at https://mailgun.com and open **Sending → Domains**. Use the sandbox domain.
2. **Important:** the sandbox only sends to *authorized recipients*. Add every email address you will check out with (yours and your mentor's) and click the verification link Mailgun sends.
3. Copy your API key into `MAILGUN_API_KEY` and the sandbox domain (e.g. `sandboxXXXX.mailgun.org`) into `MAILGUN_DOMAIN`.
4. If your Mailgun account is in the EU region, set `MAILGUN_API_URL=https://api.eu.mailgun.net`.

### 5. Run it
```bash
npm run dev
```
Open http://localhost:3000, add items to the cart, check out, and check your inbox.

## Deploy to Vercel
1. Push this folder to GitHub (`.env.local` is git-ignored, so your keys stay private).
2. Import the repo at https://vercel.com/new.
3. Add every variable from `.env.local` under **Settings → Environment Variables**.
4. Add the Vercel callback URL to your Google OAuth client (step 3.4).
5. Redeploy.

## How it works
- On every Google sign-in, the user is saved/updated in the `users` table.
- The cart lives in the browser (localStorage) until checkout.
- At checkout, a server action re-reads prices and stock from the database (so prices can't be tampered with in the browser), saves the order and its items, lowers stock, then sends the confirmation email through Mailgun.
- If the email fails, the order is still saved and `email_sent` stays `false`.
- Row Level Security is on for every table and the app only talks to Supabase from the server, so the database isn't publicly readable.
