# Pet Plus

Pet Plus is a subscription app for pet owners. Customers pay a monthly or yearly
subscription and get unlimited AI chat about their pets — nutrition questions
(diet, feeding, safe/unsafe foods, weight management) and general medical
questions (symptoms, preventive care, when to see a vet).

This repo is a monorepo with two workspaces:

- **`api/`** — Cloudflare Worker backend (Hono + D1 + Stripe + Claude)
- **`mobile/`** — Expo / React Native mobile app (iOS + Android)

## How it works

1. A user signs up / logs in (email + password, JWT session).
2. They add one or more pets (name, species, breed, age, weight, notes).
3. They subscribe monthly or yearly via Stripe Checkout.
4. Once subscribed, they get unlimited chat per pet. Each question is answered
   by Claude, using a system prompt tailored to that pet's profile, with a
   built-in reminder to consult a vet for diagnosis/treatment and to seek
   emergency care for urgent symptoms.
5. Stripe webhooks keep subscription status in sync (active / past due /
   canceled), and the billing portal lets users manage or cancel their plan.

**Pet Plus is not a substitute for veterinary care.** The assistant is
explicitly instructed to recommend contacting a vet for anything urgent,
severe, or ambiguous.

## API (`api/`)

Cloudflare Worker using [Hono](https://hono.dev), [D1](https://developers.cloudflare.com/d1/)
for storage, [Stripe](https://stripe.com) for billing, and the
[Anthropic Messages API](https://docs.anthropic.com/) for chat.

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | - | Create an account |
| POST | `/api/auth/login` | - | Log in, returns a JWT |
| GET | `/api/auth/me` | Bearer | Current user + subscription status |
| GET | `/api/pets` | Bearer | List the user's pets |
| POST | `/api/pets` | Bearer | Add a pet |
| GET/PUT/DELETE | `/api/pets/:id` | Bearer | Read/update/delete a pet |
| GET | `/api/chat/:petId/history` | Bearer | Chat history for a pet |
| POST | `/api/chat/:petId/messages` | Bearer + active subscription | Ask the assistant a question |
| POST | `/api/billing/checkout` | Bearer | Create a Stripe Checkout session (`{ plan: "monthly" \| "yearly" }`) |
| POST | `/api/billing/portal` | Bearer | Create a Stripe Billing Portal session |
| POST | `/api/webhooks/stripe` | Stripe signature | Subscription lifecycle events |

### Setup

```bash
cd api
npm install

# Create the D1 database and copy the resulting database_id into wrangler.jsonc
npx wrangler d1 create pet-plus-db

# Apply the schema
npm run db:migrate:local     # for local dev
npm run db:migrate:remote    # for the deployed database

# Secrets
npx wrangler secret put JWT_SECRET               # e.g. `openssl rand -hex 32`
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET

npm run dev      # local dev with wrangler
npm run deploy   # deploy to Cloudflare
```

Also set your real Stripe Price IDs for the monthly/yearly plans in
`api/wrangler.jsonc` under `vars.STRIPE_PRICE_MONTHLY` /
`vars.STRIPE_PRICE_YEARLY`, and point the Stripe webhook endpoint
(`/api/webhooks/stripe`) at your deployed worker URL in the Stripe Dashboard.

`APP_URL_SCHEME` (default `petplus`) controls the deep-link scheme used for
Checkout/Portal return URLs; it should match `mobile/app.json`'s `expo.scheme`.

### Tests

```bash
npm run test -w api
npm run typecheck -w api
```

## Mobile app (`mobile/`)

Expo / React Native app with email+password auth, pet management, per-pet
chat, and a subscribe/paywall flow that opens Stripe Checkout in an in-app
browser.

### Setup

```bash
cd mobile
npm install
```

Point the app at your deployed API by editing `apiBaseUrl` under `expo.extra`
in `mobile/app.json` (defaults to `http://localhost:8787` for local dev
against `wrangler dev`).

```bash
npm run start     # Expo dev server (scan the QR code with Expo Go)
npm run ios       # iOS simulator
npm run android   # Android emulator
```

### Typecheck

```bash
npm run typecheck -w mobile
```

## Local development end-to-end

```bash
# Terminal 1
cd api && npm run dev

# Terminal 2
cd mobile && npm run start
```

With `wrangler dev` running on `http://localhost:8787` (the mobile app's
default `apiBaseUrl`), sign up, add a pet, and use Stripe test mode
(`4242 4242 4242 4242`) to exercise the subscribe flow end-to-end.
