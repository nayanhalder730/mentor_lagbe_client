import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service | MentorLagbe",
  description:
    "Terms governing accounts, tuition listings, applications and Pro subscriptions on MentorLagbe.",
};

const sections = [
  {
    title: "1. Accounts and roles",
    body: "MentorLagbe supports three roles: Student, Tutor and Admin. You may register only as a Student or a Tutor. Role and subscription-plan values are controlled by the platform and cannot be changed through profile updates. You are responsible for the accuracy of the information you provide and for keeping your account credentials secure.",
  },
  {
    title: "2. Tuition listings",
    body: "Tutors may publish tuition batches and 1-on-1 mentorship listings. New listings start with pending approval and are not publicly visible until an Admin approves them and the listing is active. Listings may be edited, closed or deleted by their owner. Free Tutors may maintain up to two posts; Pro Tutors have no post limit.",
  },
  {
    title: "3. Applications",
    body: "Only Students may apply to approved, active listings. An application records the tuition, tutor and student details together with the student's preferred schedule and an optional note. Duplicate applications to the same tuition are prevented. Free Students may have two active applications; Pro Students have no limit. Tutors may accept or reject applications, and Students may withdraw a still-pending application.",
  },
  {
    title: "4. Pro subscriptions and payments",
    body: "Pro Plans are optional paid upgrades billed through Stripe Checkout. Payment records are stored in the platform's payments collection, and a verified successful subscription upgrades the account plan to Pro. Prices, limits and plan benefits are shown on the Pricing page before checkout. Cancellation or failed renewal may return an account to the Free plan and its associated limits.",
  },
  {
    title: "5. Acceptable use",
    body: "Do not publish false or misleading tuition information, impersonate another person, attempt to gain unauthorised access to accounts or dashboards, interfere with the service, or use the platform for unlawful purposes. Administrators may reject listings or restrict accounts that breach these terms.",
  },
  {
    title: "6. Content and availability",
    body: "You retain ownership of the text and images you submit, and grant the platform permission to display them as part of normal operation. Listings and images are provided by their authors; the platform does not guarantee their accuracy. The service is provided as-is and may change or be unavailable at times.",
  },
  {
    title: "7. Changes to these terms",
    body: "These terms may be updated as the platform evolves. The current version is always the one published on this page. Continuing to use MentorLagbe after a change means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-[#f5f5ed] dark:bg-[#06110f]">
      <section className="border-b border-[#075b55]/10 bg-white py-14 dark:border-white/10 dark:bg-[#081715] sm:py-20">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#075b55] text-white dark:bg-[#d5b36a] dark:text-[#0b1f1c]">
            <Scale className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]">
            Terms of Service
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#075b55]/65 dark:text-[#f5f5ed]/60">
            These terms describe how MentorLagbe accounts, tuition listings,
            applications and Pro subscriptions work. They reflect the
            behaviour implemented by the platform.
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
          <Link href="/privacy" className={buttonVariants({ variant: "outline" })}>
            Read privacy policy
          </Link>
        </div>
      </section>
    </main>
  );
}
