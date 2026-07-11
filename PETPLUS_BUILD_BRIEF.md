# Pet Plus — Build Brief for Claude Code

You are building **Pet Plus**, a subscription mobile app for pet owners.
Customers pay a **monthly or yearly subscription** and get **unlimited AI chat**
about their pets' **nutrition** (diet, feeding, safe/unsafe foods, weight
management) and **medical** questions (symptoms, preventive care, when to see a
vet). When the AI advises seeing a veterinarian, the app helps the user **find
nearby vets** and contact them directly.

Build everything described here, verify it (typecheck + tests + run the app),
and commit as you go.

---

## 1. Tech stack & repo layout

Monorepo with npm workspaces:

```
/
├── package.json          # workspaces: ["api", "mobile"], proxy scripts
├── api/                  # Cloudflare Worker backend
│   ├── wrangler.jsonc    # D1 binding, vars; nodejs_compat flag
│   ├── migrations/       # D1 SQL migrations
│   └── src/
│       ├── index.ts      # Hono app, CORS on *, route mounting
│       ├── types.ts      # Env bindings + row types
│       ├── middleware/auth.ts
│       ├── lib/          # password, jwt, stripe, anthropic, vets
│       └── routes/       # auth, pets, chat, billing, vets, webhooks
└── mobile/               # Expo / React Native app (iOS + Android + web)
    ├── app.json          # scheme "petplus", plugins, extra.apiBaseUrl
    ├── index.ts          # registerRootComponent entry
    ├── App.tsx
    └── src/
        ├── config.ts     # API base URL resolution
        ├── theme.ts      # colors/spacing/radius tokens
        ├── types.ts
        ├── api/client.ts
        ├── lib/tokenStorage.ts
        ├── context/AuthContext.tsx
        ├── navigation/RootNavigator.tsx
        ├── components/   # PrimaryButton, ChatBubble, ChipSelector, PetAvatar
        └── screens/      # Login, Signup, PetList, AddPet, Chat, Subscribe, Account, FindVet
```

- **API**: Cloudflare Workers + [Hono](https://hono.dev) + **D1** (SQLite) +
  Stripe (subscriptions) + Anthropic Messages API (chat). TypeScript strict.
  Tests with Vitest (plain node environment; test pure lib functions).
- **Mobile**: Expo SDK (latest; this brief was written against SDK 57) +
  React Navigation native-stack. TypeScript strict. Also runs on **web** via
  `react-native-web` (used for browser preview during development).
- Dependencies used: `hono`, `jose`, `stripe` (API); `expo`, `expo-constants`,
  `expo-image-picker`, `expo-linking`, `expo-location`, `expo-secure-store`,
  `expo-status-bar`, `expo-web-browser`, `react-native-safe-area-context`,
  `react-native-screens`, `@react-navigation/native`,
  `@react-navigation/native-stack`, `react-dom`, `react-native-web`,
  `@expo/metro-runtime` (mobile). Match Expo module versions to the SDK via
  `expo/bundledNativeModules.json` if `expo install` has no network access.

### Known pitfalls (already hit once — avoid them)

1. **Workspace entry point**: `"main": "node_modules/expo/AppEntry.js"` fails
   in a hoisted npm workspace. Use `"main": "index.ts"` with
   `registerRootComponent(App)`.
2. **SecureStore is native-only**: on web it throws and hangs the app at the
   loading spinner. Wrap token storage: `Platform.OS === "web"` → localStorage,
   else `expo-secure-store`.
3. **Placeholder API URL**: `app.json` ships with
   `extra.apiBaseUrl = "https://your-worker-subdomain.workers.dev"`. The config
   must treat that placeholder as *unset*: precedence is
   `process.env.EXPO_PUBLIC_API_URL` → real configured `extra.apiBaseUrl` →
   `http://localhost:8787` (local `wrangler dev`).
4. **Nominatim requires a User-Agent** header identifying the app, or it 403s.
5. **Photo size**: pet photos are stored inline in D1 as data URIs — compress
   client-side (square crop, quality ~0.4) and cap server-side (~700 KB).

---

## 2. Data model (D1)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                          -- crypto.randomUUID()
  email TEXT NOT NULL UNIQUE,                   -- stored lowercase
  password_hash TEXT NOT NULL,                  -- PBKDF2-SHA256, 100k iters, hex
  password_salt TEXT NOT NULL,                  -- 16 random bytes, hex
  stripe_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive',
    -- 'inactive' | 'active' | 'trialing' | 'past_due' | 'canceled'
  subscription_plan TEXT,                       -- 'monthly' | 'yearly' | NULL
  subscription_current_period_end INTEGER,
  created_at INTEGER NOT NULL                   -- Date.now() ms
);
CREATE INDEX idx_users_stripe_customer_id ON users (stripe_customer_id);

CREATE TABLE pets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  gender TEXT,                                  -- 'male' | 'female' | 'unknown' | NULL
  age_years REAL,
  weight_kg REAL,
  notes TEXT,
  photo TEXT,                                   -- data:image/... URI or NULL
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_pets_user_id ON pets (user_id);

CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  pet_id TEXT NOT NULL REFERENCES pets (id),
  role TEXT NOT NULL,                           -- 'user' | 'assistant'
  content TEXT NOT NULL,
  vet_referral INTEGER NOT NULL DEFAULT 0,      -- 1 when reply advises a vet
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_chat_messages_pet_id ON chat_messages (pet_id, created_at);
```

---

## 3. API specification

All routes under `/api/*`. CORS enabled for all origins. JSON in/out.
Errors are `{ "error": "human-readable message" }` with a proper status code.

### Auth

- **Passwords**: PBKDF2-SHA256 via Web Crypto (100k iterations, 256-bit,
  per-user random salt, constant-time compare). No external hashing libs.
- **Sessions**: JWT (HS256 via `jose`), `sub` = user id, 30-day expiry, secret
  from `JWT_SECRET`. Sent as `Authorization: Bearer <token>`.
- Middleware `requireAuth` validates the token and sets `userId` in context;
  401 on missing/invalid.

| Method | Path | Auth | Behavior |
|---|---|---|---|
| POST | `/api/auth/signup` | — | `{email, password}`. Validate email format, password ≥ 8 chars. 409 if email exists. Returns `{token, user}` (201). |
| POST | `/api/auth/login` | — | `{email, password}` → `{token, user}`. 401 on bad credentials (same message for unknown email vs wrong password). |
| GET | `/api/auth/me` | Bearer | Current user: `{id, email, subscriptionStatus, subscriptionPlan, subscriptionCurrentPeriodEnd}`. |

### Pets (all require auth; rows always scoped `WHERE user_id = ?`)

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/pets` | List user's pets, oldest first. |
| POST | `/api/pets` | Create. `name` + `species` required. Optional: `breed`, `gender` (must be male/female/unknown), `ageYears` (0–100), `weightKg`, `notes`, `photo` (must start `data:image/`, ≤ ~700 KB). 400 with a specific message on any validation failure. |
| GET/PUT/DELETE | `/api/pets/:id` | Read / partial update (same validation; `photo: null` clears it) / delete. 404 if not found **or not owned**. |

Pet JSON shape (camelCase): `{id, name, species, breed, gender, ageYears,
weightKg, notes, photo, createdAt}`.

### Chat (requires auth; **sending requires an active subscription**)

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/chat/:petId/history` | All messages for the pet, oldest first: `{id, role, content, vetReferral, createdAt}`. |
| POST | `/api/chat/:petId/messages` | `{message}`. **402** if `subscription_status` is not `active`/`trialing`. Stores the user message, calls Claude, stores + returns both: `{userMessage, assistantMessage}`. 502 with friendly message if the model call fails. |

**Claude integration** (`lib/anthropic.ts`):
- POST `https://api.anthropic.com/v1/messages`, model `claude-sonnet-4-5`,
  `max_tokens` 1024, header `anthropic-version: 2023-06-01`, key from
  `ANTHROPIC_API_KEY`. Send the last ~20 messages as history plus the new
  question.
- **System prompt** is built per pet and must include: the pet's species,
  breed, gender (omit if unknown), age, weight, and owner notes; scope =
  nutrition + general medical questions; a standing rule that it is **not a
  replacement for a licensed veterinarian** and must advise contacting a
  vet/emergency clinic for anything urgent, severe, or ambiguous; keep answers
  concise for mobile.
- **Vet-referral roadblock**: instruct the model — *"Whenever your answer
  advises seeing or contacting a veterinarian or emergency clinic, append the
  marker `[VET_REFERRAL]` on its own final line. The app removes it and shows
  the owner a find-a-vet shortcut — never mention the marker."* Server strips
  every occurrence from the text, trims, and stores/returns
  `vetReferral: true` on that assistant message.

### Vet finder (requires auth; **deliberately NOT subscription-gated** — safety feature)

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/vets/search` | Query: `lat`+`lon`, **or** `zip` (+ optional `country`, default `us`). Optional `radius` meters (default 20000, clamp 1000–50000). Returns `{origin: {lat, lon, label}, radiusKm, vets: [...]}`. |

- Geocode ZIP via **Nominatim** (`https://nominatim.openstreetmap.org/search`,
  `format=jsonv2&postalcode=&country=&limit=1`, identifying `User-Agent`
  header). 404 if the ZIP resolves to nothing.
- Find clinics via **Overpass API** (`https://overpass-api.de/api/interpreter`):
  query `node` + `way` with `["amenity"="veterinary"](around:R,lat,lon)`,
  `out center tags`. Normalize each element to
  `{id: "type/id", name, lat, lon, distanceKm, address, phone, email, website}` —
  name falls back `tags.name → tags.operator → "Veterinary clinic"`; contact
  fields check both `phone`/`email`/`website` and `contact:*` variants;
  address is assembled from `addr:housenumber/street/city/postcode`; way
  coordinates come from `center`. Sort by haversine distance, round to 0.1 km,
  limit 25. 400/404/502 with friendly messages on bad input / unknown ZIP /
  upstream failure.

### Billing (Stripe; requires auth)

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/billing/checkout` | `{plan: "monthly"\|"yearly"}`. Create (or reuse) the Stripe customer (store `stripe_customer_id`), create a subscription-mode Checkout Session for the matching price ID, `success_url`/`cancel_url` use the app deep-link scheme (`petplus://subscribe/success` etc.). Set `userId` in session + subscription metadata. Returns `{checkoutUrl}`. |
| POST | `/api/billing/portal` | Billing Portal session for the stored customer; 404 if the user has no customer yet. Returns `{portalUrl}`. |
| POST | `/api/webhooks/stripe` | Verify signature with `stripe.webhooks.constructEventAsync` (use `constructEventAsync` — Workers has no sync crypto) against `STRIPE_WEBHOOK_SECRET`. Handle `checkout.session.completed` (retrieve the subscription) and `customer.subscription.created/updated/deleted`: map price ID → plan, copy `status` and current period end onto the user row by `stripe_customer_id`. |

Use the `stripe` npm package with `Stripe.createFetchHttpClient()` (Workers
compatibility).

### Env / secrets (api)

| Name | Kind | Purpose |
|---|---|---|
| `JWT_SECRET` | secret | JWT signing (e.g. `openssl rand -hex 32`) |
| `ANTHROPIC_API_KEY` | secret | Claude |
| `STRIPE_SECRET_KEY` | secret | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | secret | Webhook signature check |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY` | wrangler var | Price IDs for the two plans |
| `APP_URL_SCHEME` | wrangler var, default `petplus` | Deep-link scheme for checkout/portal return URLs (must match `app.json` `expo.scheme`) |

`wrangler.jsonc` also needs the D1 binding (`DB`, database `pet-plus-db`,
`migrations_dir: "migrations"`) and `compatibility_flags: ["nodejs_compat"]`.

---

## 4. Mobile app specification

### Design tokens (`theme.ts`)

Primary green `#0F5132`, background `#F6FBF8`, surface white, border
`#DCE7E1`, text `#12241C`, muted `#5A6E64`, danger `#B3261E`, assistant chat
bubble `#EAF3EE` (user bubble = primary). Spacing scale 4/8/16/24/32, radii
8/12/20. Friendly, calm, vet-clinic-green identity; buttons are large filled
(primary) or outlined (secondary) with loading spinners.

### Auth & state

- `AuthContext`: holds `{token, user, isLoading}` + `signup/login/logout/refreshUser`.
  On mount, read the stored token, validate via `/api/auth/me`, drop it if
  invalid. Token storage via the platform wrapper (pitfall #2).
- `RootNavigator`: spinner while loading → auth stack (Login, Signup) when
  logged out → app stack (PetList, AddPet, Chat, Subscribe, Account, FindVet)
  when logged in.
- `api/client.ts`: tiny typed fetch wrapper; throws `ApiError(status, message)`
  using the server's `error` string; every screen shows those messages inline.

### Screens

1. **Login / Signup** — brand title, tagline ("Unlimited nutrition & medical
   Q&A for your pets."), email + password fields, inline error text, link to
   switch between the two.
2. **PetList** — header "Your pets" with **Find a vet** and **Account** links.
   If not subscribed: a tappable primary-green banner "Unlock unlimited pet
   chat" → Subscribe. Pet cards: circular avatar (photo, else initial-letter
   placeholder), name, meta line `species · breed · gender · age yr` (omit
   missing parts). Tap card → Chat **if subscribed**, else → Subscribe.
   Footer button "Add a pet". Refetch on focus.
3. **AddPet** — centered tappable avatar circle + "Add a profile photo" link:
   `expo-image-picker`, square crop (`allowsEditing`, aspect 1:1), quality
   ~0.4, `base64: true`, submit as `data:image/jpeg;base64,...`; "Remove
   photo" link once set. Labeled sections (small uppercase labels):
   - **Name** (text)
   - **Species** — chip row: Dog, Cat, Bird, Rabbit, Other (Other reveals a
     free-text field)
   - **Gender** — chips: Male / Female / Not sure
   - **Breed** — per-species suggestion chips (Dog: Labrador, Golden
     Retriever, German Shepherd, French Bulldog, Poodle, Mixed; Cat: Domestic
     Shorthair, Tabby, Siamese, Persian, Maine Coon, Mixed; Bird: Parakeet,
     Cockatiel, Canary, Parrot; Rabbit: Holland Lop, Netherland Dwarf,
     Lionhead, Mixed) **plus** an always-visible free-text field
   - **Age** (decimal years), **Weight** (kg), **Notes** (multiline, "for the
     assistant — allergies, conditions, etc.")
   Save disabled until name + species present. Build a reusable
   `ChipSelector` (selected = filled primary) and `PetAvatar` component.
4. **Chat** — per-pet thread (header = pet name). Bubbles: user right/green,
   assistant left/light. Loads history on mount; optimistic append of the
   user's message; auto-scroll. On **402** from send → navigate to Subscribe.
   When an assistant message has `vetReferral: true`, render a bordered card
   under the bubble: bold "This needs a veterinarian's eyes", body "Find
   nearby clinics with phone numbers and directions.", action link "**Find a
   vet near you**" → FindVet screen.
5. **FindVet** — top panel: safety note ("In an emergency, call the nearest
   clinic right away."), primary button **Use my location**
   (`expo-location` foreground permission → `getCurrentPositionAsync`,
   balanced accuracy; on denial show a friendly error suggesting ZIP), divider
   "or search by ZIP / postal code", ZIP + Country inputs side by side,
   secondary **Search** button. Results: "N results near {origin label}"
   header; per-clinic card with name, distance ("1.4 km", primary color,
   right-aligned), address, pill buttons that deep-link with
   `Linking.openURL`: **Call** (`tel:`), **Email** (`mailto:`), **Website**,
   **Map** (Apple Maps URL on iOS, `geo:` on Android, Google Maps URL on web)
   — render each pill only when the field exists (Map always). Phone number
   also shown as text. Empty state after a search with no hits.
6. **Subscribe** — two plan cards (Monthly / "Yearly — best value"), each with
   a subscribe button → `POST /api/billing/checkout` → open `checkoutUrl` with
   `expo-web-browser`, then `refreshUser()`. Footer disclaimer: payment by
   Stripe + "Pet Plus provides general information and is not a substitute for
   veterinary care."
7. **Account** — email, subscription status (+plan); if subscribed, **Manage
   billing** → portal URL in web browser; else **Subscribe**. **Log out**
   (secondary).

### app.json

`scheme: "petplus"`, iOS `bundleIdentifier` / Android `package`
`com.petplus.app`, plugins configured with permission strings for
`expo-image-picker` (photos + camera: profile pictures) and `expo-location`
(when-in-use: "find veterinarians near you"), `extra.apiBaseUrl` placeholder.

---

## 5. Verification (do all of this)

1. `tsc --noEmit` clean in **both** workspaces.
2. Vitest unit tests (pure functions, no network): password hash round-trip +
   reject + unique salts; JWT round-trip + wrong-secret + malformed; haversine
   (identical points = 0; NYC→Philadelphia ≈ 130 km); OSM normalization
   (node with contact tags, way with `center` + `contact:*` fallbacks, missing
   coords → null); address formatting (full/partial/none); Overpass query
   contents; `[VET_REFERRAL]` extraction (strips + flags; leaves normal text).
3. Live run: `wrangler dev` + local D1 migrations, then exercise with curl:
   signup → 201; duplicate → 409; bad login → 401; create pet with
   photo/gender → 201 and echoed back; invalid gender / non-image photo → 400;
   chat send while unsubscribed → 402; vets search without params → 400,
   without auth → 401.
4. Browser preview: `expo start --web` + Playwright/Chromium — sign up, add a
   pet through the form (chips), see avatars in the list, confirm
   paywall redirect, and (with a subscribed user flipped in D1) the chat and
   referral-card flow. Note: if the dev sandbox blocks openstreetmap.org,
   verify the FindVet UI by fulfilling `/api/vets/search` with fixture data at
   the network boundary — it works unmodified on deployed Workers.

## 6. Deploy / runbook (document in README)

```bash
# API
cd api
npx wrangler d1 create pet-plus-db          # put database_id in wrangler.jsonc
npm run db:migrate:local && npm run db:migrate:remote
npx wrangler secret put JWT_SECRET          # + ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
npm run deploy
# Stripe: create monthly + yearly prices, set IDs in wrangler.jsonc vars,
# point a webhook at https://<worker>/api/webhooks/stripe

# Mobile
cd mobile
# set extra.apiBaseUrl in app.json to the deployed worker URL
npm run start        # Expo Go / simulators; `npx expo start --web` for browser
```

## 7. Product rules (non-negotiable)

- Chat is **unlimited but gated** on an active/trialing subscription; the gate
  is enforced **server-side** (402), not just in the UI.
- Finding a vet is **never** paywalled.
- Every medical answer path reminds users the assistant is not a vet; urgent
  symptoms always get "contact a vet / emergency clinic now" plus the
  referral shortcut.
- Auth rows are always scoped by `user_id` — one user can never read another's
  pets or messages.
