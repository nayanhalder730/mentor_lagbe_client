import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BadgeCheck,
  BookOpen,
  Check,
  Code2,
  Compass,
  GraduationCap,
  Languages,
  MessageCircle,
  Quote,
  Rocket,
  ShieldCheck,
  Sigma,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import HomeSearch from "@/components/public/home-search";
import LatestTuitions from "@/components/public/latest-tuitions";
import { buttonVariants } from "@/components/ui/button";

const subjects = [
  {
    name: "Mathematics",
    icon: Sigma,
    description: "School, HSC and higher maths batches.",
  },
  {
    name: "Physics",
    icon: Atom,
    description: "Concepts, numerics and exam preparation.",
  },
  {
    name: "Programming",
    icon: Code2,
    description: "Hands-on coding and problem solving.",
  },
  {
    name: "IELTS",
    icon: Languages,
    description: "Band-focused reading, writing and speaking.",
  },
];

const studentSteps = [
  {
    icon: Compass,
    title: "Find a tuition",
    text: "Search approved listings by subject, mode, and location.",
  },
  {
    icon: MessageCircle,
    title: "Connect and apply",
    text: "Review a tuition and submit your application with your schedule.",
  },
  {
    icon: BookOpen,
    title: "Start learning",
    text: "Once accepted, follow the plan your tutor has prepared.",
  },
];

const tutorSteps = [
  {
    icon: Rocket,
    title: "Post your tuition",
    text: "Describe your batch, fee, schedule, and teaching approach.",
  },
  {
    icon: Users,
    title: "Connect with students",
    text: "Review applicants and accept the students who fit your batch.",
  },
  {
    icon: Sparkles,
    title: "Start teaching",
    text: "Keep your listing active and run your sessions with confidence.",
  },
];

const highlights = [
  {
    icon: ShieldCheck,
    title: "Admin-reviewed listings",
    text: "Public tuition posts are visible only after approval.",
  },
  {
    icon: BadgeCheck,
    title: "Verified ownership",
    text: "Tutors manage only the tuitions they created.",
  },
  {
    icon: GraduationCap,
    title: "Role-based dashboards",
    text: "Separate spaces for students, tutors, and administrators.",
  },
  {
    icon: Wallet,
    title: "Transparent billing",
    text: "Plan upgrades are handled through a hosted checkout.",
  },
];

const valueStatements = [
  "A clear weekly plan makes it easier to stay consistent between sessions.",
  "Seeing the fee, mode, and schedule up front helps students choose confidently.",
  "A focused batch keeps questions relevant and progress easier to track.",
];

function subjectHref(subject: string) {
  return `/tuitions?subject=${encodeURIComponent(subject)}`;
}

export default function Home() {
  return (
    <main>
      {/* 1. Hero */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden bg-[#075b55] text-white dark:bg-[#061b18]"
      >
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-24 size-96 rounded-full bg-[#087f75]/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-20 size-96 rounded-full bg-[#d5b36a]/15 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#a7f3d0] ring-1 ring-inset ring-white/15">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Learn with a mentor who fits your goal
            </span>

            <h1
              id="hero-title"
              className="mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Find the right tuition.
              <span className="block text-[#d5b36a]">Grow with guidance.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              MentorLagbe connects students with subject-wise tuition batches
              and dedicated tutors. Browse approved listings, compare the
              details, and take the next step in your learning journey.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/tuitions"
                className={buttonVariants({
                  size: "lg",
                  className: "bg-white text-[#075b55] hover:bg-white/90",
                })}
              >
                Browse Tuitions
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className:
                    "border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white",
                })}
              >
                Get Started
              </Link>
            </div>

            <div className="mt-8">
              <HomeSearch />
              <p className="mt-2 text-xs text-white/55">
                Search by tuition title or subject to jump straight to filtered
                results.
              </p>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative hidden rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur lg:block"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#d5b36a] text-[#0b1f1c]">
                <GraduationCap className="size-6" />
              </span>
              <div>
                <p className="text-sm font-semibold">Mentor-led learning</p>
                <p className="text-xs text-white/60">Built around your goals</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {subjects.map(({ name, icon: Icon }) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <Icon className="size-4 text-[#d5b36a]" />
                  <span className="text-sm font-medium">{name}</span>
                  <span className="ml-auto size-1.5 rounded-full bg-[#a7f3d0]" />
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs leading-relaxed text-white/60">
              Public listings are limited to approved and active tuitions.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Latest Tuitions */}
      <LatestTuitions />

      {/* 3. Subjects */}
      <section
        id="subjects"
        aria-labelledby="subjects-title"
        className="border-y border-[#075b55]/10 bg-white py-16 sm:px-6 lg:px-8 lg:py-24 dark:border-white/10 dark:bg-[#081715]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-0">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
              Explore by topic
            </p>
            <h2
              id="subjects-title"
              className="mt-2 text-3xl font-bold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]"
            >
              Subjects students look for most
            </h2>
            <p className="mt-2 text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
              Pick a subject to open the matching filtered results on the
              Browse Tuitions page.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map(({ name, icon: Icon, description }) => (
              <Link
                key={name}
                href={subjectHref(name)}
                className="group rounded-2xl border border-[#075b55]/10 bg-[#f5f5ed]/60 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#087f75]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:border-white/10 dark:bg-white/5"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-[#075b55] dark:text-[#f5f5ed]">
                  {name}
                </h3>
                <p className="mt-1 text-xs text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                  {description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#087f75] dark:text-[#7fe0d2]">
                  Browse {name}
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-title"
        className="bg-[#f5f5ed] py-16 lg:py-24 dark:bg-[#06110f]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
              Simple by design
            </p>
            <h2
              id="how-it-works-title"
              className="mt-2 text-3xl font-bold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]"
            >
              How MentorLagbe works
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
              The same three clear steps, whether you are here to learn or to
              teach.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {[
              { label: "For students", icon: GraduationCap, steps: studentSteps },
              { label: "For tutors", icon: Rocket, steps: tutorSteps },
            ].map(({ label, icon: Icon, steps }) => (
              <div
                key={label}
                className="rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#081715]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#075b55] text-white dark:bg-[#d5b36a] dark:text-[#0b1f1c]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold text-[#075b55] dark:text-[#f5f5ed]">
                    {label}
                  </h3>
                </div>

                <ol className="mt-6 space-y-5">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;

                    return (
                      <li key={step.title} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#087f75]/10 text-sm font-bold text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
                            {index + 1}
                          </span>
                          {index < steps.length - 1 ? (
                            <span className="mt-1 w-px flex-1 bg-[#075b55]/15 dark:bg-white/15" />
                          ) : null}
                        </div>
                        <div className="pb-1">
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                            <StepIcon className="size-4 text-[#087f75] dark:text-[#7fe0d2]" aria-hidden="true" />
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                            {step.text}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing Preview */}
      <section
        id="pricing-preview"
        aria-labelledby="pricing-preview-title"
        className="bg-white py-16 lg:py-24 dark:bg-[#081715]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
              Pricing preview
            </p>
            <h2
              id="pricing-preview-title"
              className="mt-2 text-3xl font-bold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]"
            >
              Start free, upgrade when you need more
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
              Plan prices reflect the backend catalog. Checkout and full plan
              details live on the pricing page.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[#075b55]/10 bg-[#f5f5ed]/60 p-6 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-bold text-[#075b55] dark:text-[#f5f5ed]">
                Free
              </h3>
              <p className="mt-2 text-3xl font-extrabold text-[#075b55] dark:text-[#f5f5ed]">
                $0
              </p>
              <p className="mt-1 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                For students and tutors getting started
              </p>
              <ul className="mt-5 space-y-2 text-sm text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#087f75]" aria-hidden="true" />
                  Browse and apply to approved tuitions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#087f75]" aria-hidden="true" />
                  Tutors can post up to 2 tuitions
                </li>
              </ul>
              <Link
                href="/pricing"
                className={buttonVariants({ variant: "outline", className: "mt-6 w-full" })}
              >
                Pricing details
              </Link>
            </div>

            <div className="rounded-2xl border border-[#d5b36a]/50 bg-[#075b55] p-6 text-white shadow-lg dark:border-[#d5b36a]/40">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold">Pro</h3>
                <span className="rounded-full bg-[#d5b36a] px-2.5 py-1 text-[11px] font-bold text-[#0b1f1c]">
                  More room to grow
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-2xl font-extrabold text-[#d5b36a]">$10</p>
                  <p className="text-xs text-white/65">Student Pro / month</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#d5b36a]">$15</p>
                  <p className="text-xs text-white/65">Tutor Pro / month</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#d5b36a]" aria-hidden="true" />
                  Pro plan features for the selected role
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-[#d5b36a]" aria-hidden="true" />
                  Tutors get unlimited tuition posts
                </li>
              </ul>
              <Link
                href="/pricing"
                className={buttonVariants({
                  className: "mt-6 w-full bg-[#d5b36a] text-[#0b1f1c] hover:bg-[#e3c585]",
                })}
              >
                View pricing details
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Platform Highlights (non-numeric, no invented statistics) */}
      <section
        id="highlights"
        aria-labelledby="highlights-title"
        className="border-y border-[#075b55]/10 bg-[#f5f5ed] py-16 lg:py-24 dark:border-white/10 dark:bg-[#06110f]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
              Why MentorLagbe
            </p>
            <h2
              id="highlights-title"
              className="mt-2 text-3xl font-bold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]"
            >
              Platform highlights
            </h2>
            <p className="mt-2 text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
              These are design commitments, not invented counts or success
              rates. The public API does not expose verified aggregate metrics.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-[#075b55] dark:text-[#f5f5ed]">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonials placeholder — honest value statements, not user reviews */}
      <section
        id="learner-value"
        aria-labelledby="learner-value-title"
        className="bg-white py-16 lg:py-24 dark:bg-[#081715]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
              What to expect
            </p>
            <h2
              id="learner-value-title"
              className="mt-2 text-3xl font-bold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]"
            >
              Built for a better learning experience
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
              The cards below are illustrative value statements, not real user
              reviews or endorsements. No verified testimonials are available
              from the API.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {valueStatements.map((statement) => (
              <div
                key={statement}
                className="rounded-2xl border border-[#075b55]/10 bg-[#f5f5ed]/60 p-6 dark:border-white/10 dark:bg-white/5"
              >
                <Quote
                  className="size-6 text-[#d5b36a]"
                  aria-hidden="true"
                />
                <p className="mt-4 text-sm leading-relaxed text-[#075b55]/80 dark:text-[#f5f5ed]/75">
                  {statement}
                </p>
                <p className="mt-4 text-[11px] font-medium tracking-wide text-[#075b55]/45 uppercase dark:text-[#f5f5ed]/40">
                  Illustrative statement
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
