import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | MentorLagbe",
  description:
    "What data MentorLagbe stores, why it is used, and which services process it.",
};

const sections = [
  {
    title: "1. Information we store",
    body: "Account data includes your name, email address, role, subscription plan and, optionally, a profile image, phone number and bio. Tutor listings store tuition details and banner images. Applications store the tuition reference together with the student's name, email, phone, preferred schedule and note. Pro purchases store payment records such as amount, currency, payment status and Stripe identifiers.",
  },
  {
    title: "2. How information is used",
    body: "Account data provides authentication and role-based access. Listing and application data power public browsing, moderation, applicant management and status tracking. Payment records are used to verify Pro upgrades and to show transaction history to administrators. The platform does not sell personal data.",
  },
  {
    title: "3. Service providers",
    body: "Data is processed by the infrastructure and services the platform depends on: MongoDB Atlas for storage, Vercel for hosting, Stripe for subscription checkout and webhooks, ImgBB when you choose to upload an image, and Google or GitHub only if you use those optional sign-in providers. Each provider applies its own privacy practices.",
  },
  {
    title: "4. Cookies and sessions",
    body: "Better Auth sets an encrypted session cookie so you stay signed in. The Express API uses short-lived JWTs sent as bearer tokens rather than browser cookies. A local preference key stores your light/dark theme choice in your browser.",
  },
  {
    title: "5. Visibility of your information",
    body: "Approved, active tuition listings and the tutor name shown on them are public. Application details are visible to the student who submitted them and to the tutor who owns the listing. Administrators can view accounts, listings and payment records to perform moderation and support tasks.",
  },
  {
    title: "6. Retention and your choices",
    body: "You may update your profile, delete pending applications, and delete your own tuition posts from the relevant dashboards. Removing an account requires contacting the project owner because it also affects related listings, applications and payment history.",
  },
  {
    title: "7. Changes to this policy",
    body: "This policy may be updated as the platform changes. The current version is always published on this page.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-[#f5f5ed] dark:bg-[#06110f]">
      <section className="border-b border-[#075b55]/10 bg-white py-14 dark:border-white/10 dark:bg-[#081715] sm:py-20">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#075b55] text-white dark:bg-[#d5b36a] dark:text-[#0b1f1c]">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]">
            Privacy Policy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#075b55]/65 dark:text-[#f5f5ed]/60">
            This policy explains what MentorLagbe stores, why it is needed and
            which services are involved. It describes the data handled by the
            features available today.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="space-y-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#081715]"
            >
              <h2 className="text-base font-bold text-[#075b55] dark:text-[#f5f5ed]">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                {section.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className={buttonVariants({
              className: "bg-[#075b55] text-white hover:bg-[#0b6b62]",
            })}
          >
            <ArrowLeft aria-hidden="true" />
            Back to home
          </Link>
          <Link href="/terms" className={buttonVariants({ variant: "outline" })}>
            Read terms of service
          </Link>
        </div>
      </section>
    </main>
  );
}
