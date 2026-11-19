# MentorLagbe — Client

Next.js frontend for **MentorLagbe**, a role-based tuition marketplace connecting students with tutors through approved tuition listings, applications, admin moderation and Pro subscriptions.

> Deployment URL: **TODO — add the verified live frontend URL here after deployment.**
> No live URL is committed in this repository.

Repository links documented in the previous README:

- Client: https://github.com/nayanhalder730/mentor_lagbe_client
- Server: https://github.com/nayanhalder730/mentor_lagbe_server

---

## Key Features

- Role-based platform for **Students, Tutors and Admins**, guarded on the server.
- Public Home, Browse Tuitions, Tuition Details, About and Pricing pages.
- Tuition search by title/subject plus backend-supported filters for class level, mode, location and fee range.
- Student application flow: submit with preferred schedule, track status, cancel pending applications.
- Tutor tuition management: create, edit, delete, upload banner images, and toggle active state for approved posts.
- Admin moderation: approve/reject tuitions, manage user roles, oversee users, payments and platform data.
- Student **Saved Tuitions** stored in the existing user document.
- Profile updates with direct ImgBB image upload and avatar fallback.
- Stripe Checkout for Student Pro / Tutor Pro subscriptions; pricing and plan status are server-authoritative.
- Global loading, error and not-found boundaries, plus Sonner toasts across all actions.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, cache components), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/Base UI primitives, lucide-react icons |
| Auth | Better Auth with MongoDB adapter and JWT plugin |
| Notifications | Sonner |
| Payments | Stripe Checkout (server-created sessions; browser redirect only) |
| Media | ImgBB direct browser upload |

---

## Prerequisites

- Node.js 20+ (recommended for Next.js 16)
- npm
- A running MentorLagbe Express API (see the server README)
- A MongoDB database reachable by the Next.js server for Better Auth

---

## Installation

```bash
cd mentor_lagbe_client
npm install
cp .env.example .env.local
# Fill in the values described below. Never commit .env.local.
npm run dev
```

The development server runs at `http://localhost:3000` by default.

---

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

---

## Environment Variables

Place local values in `mentor_lagbe_client/.env.local`. Only `NEXT_PUBLIC_API_URL` is present in `.env.example`; the rest are read by the application and must be supplied for the features described.

| Variable | Scope | Required for | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser | All backend API calls | Local value: `http://localhost:8000`. No production fallback is hardcoded. |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Browser | Better Auth client | Usually the deployed client origin. |
| `BETTER_AUTH_URL` | Server | Better Auth handler | Base URL used for issuer/audience and auth routes. |
| `BETTER_AUTH_SECRET` | Server | Better Auth | Secret; never expose to the browser. |
| `MONGODB_URI` | Server | Better Auth MongoDB adapter | Used by the Next.js auth route. |
| `MONGODB_DB_NAME` | Server | Optional database override | Defaults to `mentor_lagbe`. |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Browser | Direct image upload | Required for profile/tuition image upload. There is no fallback key. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Server | Optional GitHub login | Provider is registered only when both are set. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Server | Optional Google login | Provider is registered only when both are set. |

There is **no** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in this project. Checkout sessions are created by the backend and the browser only follows the returned Stripe URL.

---

## Authentication

- Better Auth is configured in `src/lib/auth.ts` with the MongoDB adapter, email/password auth, optional GitHub/Google providers, and the JWT plugin.
- Sign-up may select `student` or `tutor`; public admin registration falls back to `student`.
- `role` and `plan` are server-controlled additional fields. The client cannot set them through profile updates.
- Browser code reads the session through `src/lib/auth-client.ts` (`useSession`).
- Backend-protected routes receive the JWT as `Authorization: Bearer <token>` from `getJwtToken()`.

---

## ImgBB Setup

1. Create an ImgBB API key.
2. Set `NEXT_PUBLIC_IMGBB_API_KEY` in `.env.local`.
3. Restart the dev server after changing public environment variables.
4. Selected images are validated (type and 32 MB limit) and uploaded directly from the browser through `src/lib/imgbb.ts`. The resulting public URL is stored as `image` (profile) or `bannerImage` (tuition). Image files are never sent to Express.

If the key is missing, the UI shows a configuration message; no fake key is used.

---

## Stripe Checkout Overview

- Pricing is displayed for Free, Student Pro (`$10/month`) and Tutor Pro (`$15/month`).
- The browser calls `POST /api/payments/create-checkout-session` **without a body**. The backend derives the plan from the authenticated database user.
- The client validates the returned HTTPS checkout URL and redirects to Stripe. No secret key or publishable key lives in client code.
- Stripe redirects to `/payment/success` or `/payment/cancel`; these routes return to `/pricing`, which re-checks the verified plan via `GET /api/users/me`. No payment success is claimed from a query parameter.

Live Stripe checkout/webhook testing is not documented here and should be performed in Stripe test mode before production use.

---

## Backend Connection

Set `NEXT_PUBLIC_API_URL` to the Express API origin. The shared client in `src/lib/api.ts`:

- attaches the Better Auth JWT for authenticated requests,
- sends `cache: "no-store"` and `credentials: "omit"`,
- normalizes backend errors into a typed `ApiError`,
- retries once on `401` with a fresh JWT.

No API helper duplicates this logic; endpoint wrappers live in `src/lib/api-endpoints.ts`.

---

## Deployment (Vercel)

1. Import this repository into Vercel.
2. Framework preset: **Next.js**. Build command: `npm run build`.
3. Add the environment variables from the table above in the Vercel project settings.
4. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` to the deployed frontend origin.
5. Set `NEXT_PUBLIC_API_URL` to the deployed Express API origin.
6. Ensure the backend's `CLIENT_URL` includes this frontend origin so CORS and Stripe redirects work.
7. Configure Stripe webhook URLs on the backend, not in this project.

---

## Screenshots

No verified screenshot assets are committed in this repository, so none are shown here.
