# MentorLagbe

**Smart Tuition & Mentorship Platform** — an EdTech platform that connects students with verified tutors for subject-wise tuition batches and 1-on-1 mentorship (online & offline), with role-based dashboards, admin moderation, Stripe subscriptions and ImgBB image uploads.

---

## 🔗 Submission Details

| Item | Value |
| --- | --- |
| **Live Site** | `https://<your-app>.vercel.app` — *update after deployment* |
| **Client Repository** | https://github.com/nayanhalder730/mentor_lagbe_client |
| **Server Repository** | https://github.com/nayanhalder730/mentor_lagbe_server |

### Demo Credentials

> These accounts are provisioned by the seed script / admin setup. Replace with the real deployed credentials before submission.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@mentorlagbe.com` | *set during admin seeding* |
| Tutor | `tutor@mentorlagbe.com` | *set during tutor seeding* |
| Student | `student@mentorlagbe.com` | *set during student seeding* |

**Default registration behaviour:** every new account signs up with `role: "student"` (unless "Tutor" is selected on the sign-up form) and `plan: "free"`. The `plan` field is server-controlled and can only be upgraded through a successful Stripe payment.

---

## 🎯 Purpose

Students and parents struggle to find verified tutors by subject, class level, mode and monthly budget, while skilled tutors lack a structured place to showcase batches and manage enrolments. MentorLagbe solves both in one ecosystem:

- **Students** browse approved tuitions, apply, track application status and upgrade to Pro for priority booking.
- **Tutors** post tuition batches, manage applicants, and upgrade to Pro for unlimited posts and a verified badge.
- **Admins** moderate listings, manage roles and track Stripe revenue.

---

## 🧩 Key Features

- Role-based authentication (Student / Tutor / Admin) with **BetterAuth** + MongoDB adapter
- Email & password sign-up/sign-in with validation and toast notifications
- Server-enforced defaults: `role: 'student'`, `plan: 'free'`
- Public Home, Browse Tuitions (search + server-side filter), Tuition Details and Pricing pages
- Student application flow with duplicate prevention and status tracking
- Tutor CRUD for tuition posts with admin approval workflow
- Admin dashboard: users, tuition approvals and Stripe transactions
- Stripe Checkout for Pro plans (Tutor $15 / Student $10) with webhook sync
- ImgBB direct image upload for profile pictures and tuition banners
- JWT verification with role-based middleware on protected API routes
- Responsive dashboard layout with collapsible sidebar
- Loading, error and 404 pages; sonner toasts across all actions

### Data model (4 MongoDB collections)

`users` · `tuitions` · `applications` · `payments`

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn UI |
| Auth | BetterAuth + MongoDB adapter |
| Backend | Node.js, Express.js, MongoDB, JWT |
| Payments / Media | Stripe Checkout + Webhooks, ImgBB API |
| Notifications | sonner |

---

## 📦 npm Packages Used

**Client:** `next`, `react`, `react-dom`, `better-auth`, `@better-auth/mongo-adapter`, `mongodb`, `sonner`, `lucide-react`, `class-variance-authority`, `clsx`/`tailwind-merge` (via `cn`), `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `recharts`, `@base-ui/react`, `@shadcn/react`, `shadcn`, `tw-animate-css`, `shiki`, plus dev tools `tailwindcss`, `@tailwindcss/turbopack`, `typescript`, `eslint`, `eslint-config-next`.

**Server:** `express`, `cors`, `dotenv`, `mongodb`, `jsonwebtoken`, `stripe`, `better-auth`, `nodemon`.

---

## ⚙️ Environment Setup

Frontend secrets go in **`mentor_lagbe_client/.env.local`**:

```env
MONGODB_URI=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_IMGBB_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
GITHUB_CLIENT_ID=          # optional social login
GITHUB_CLIENT_SECRET=      # optional social login
```

Backend secrets go in **`mentor_lagbe_server/.env`** (never committed):

```env
PORT=8000
MONGODB_URI=
JWT_SECRET=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
IMGBB_KEY=
```

---

## 🚀 Getting Started

```bash
# Client
cd mentor_lagbe_client
npm install
npm run dev        # http://localhost:3000

# Server
cd ../mentor_lagbe_server
npm install
npm run dev        # http://localhost:8000
```

Build for production with `npm run build` and `npm start` (client) / `npm start` (server).

---

## 📁 Project Structure (client)

```
src/app/
  (auth)/sign-in/page.tsx     # email + password sign-in
  (auth)/sign-up/page.tsx     # role selection, defaults to free plan
  api/auth/[...all]/route.ts  # BetterAuth handler
  layout.tsx                  # fonts, metadata, global toaster
  page.tsx                    # home
src/lib/
  auth.ts                     # BetterAuth + MongoDB adapter + user fields
  auth-client.ts              # typed browser auth client
src/components/ui/            # shadcn UI primitives
```
