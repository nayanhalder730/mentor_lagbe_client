import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Handshake,
  Layers,
  LayoutDashboard,
  PlusCircle,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserPlus,
  Users,
  UserRoundCog,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "About MentorLagbe | MentorLagbe",
  description:
    "Learn how MentorLagbe connects students with tutors through approved tuition listings, applications, and role-based dashboards.",
};

type WorkflowStep = {
  icon: LucideIcon;
  title: string;
  text: string;
};

type RoleInfo = {
  icon: LucideIcon;
  name: string;
  summary: string;
  capabilities: string[];
  accent: "teal" | "gold" | "dark";
};

const studentWorkflow: WorkflowStep[] = [
  {
    icon: UserPlus,
    title: "Create an Account",
    text: "Sign up as a student with email and password or a supported social option.",
  },
  {
    icon: Search,
    title: "Browse Available Tuitions",
    text: "Search approved and active listings by subject, class level, mode, location, and fee.",
  },
  {
    icon: FileText,
    title: "Apply with Your Preferred Schedule",
    text: "Share your phone, preferred schedule, and an optional note with the tutor.",
  },
  {
    icon: ClipboardCheck,
    title: "Track Your Application",
    text: "See pending, accepted, or rejected status from your student dashboard.",
  },
];

const tutorWorkflow: WorkflowStep[] = [
  {
    icon: UserRoundCog,
    title: "Create a Tutor Account",
    text: "Register with the tutor role to unlock tuition management tools.",
  },
  {
    icon: PlusCircle,
    title: "Post a Tuition",
    text: "Add subject, class level, mode, location, fee, schedule, and description. A banner image can be uploaded before publishing.",
  },
  {
    icon: ShieldCheck,
    title: "Wait for Admin Approval",
    text: "New posts enter pending review. Only approved, active listings appear in public search.",
  },
  {
    icon: LayoutDashboard,
    title: "Manage Applicants and Tuition Status",
    text: "Review applicants, accept or reject them, and manage active status for approved tuitions.",
  },
];

const features = [
  {
    icon: Users,
    title: "Role-based Accounts",
    text: "Student, tutor, and admin accounts each have their own dashboard and permissions.",
  },
  {
    icon: Search,
    title: "Tuition Search and Filters",
    text: "Search by title or subject, then refine by class level, mode, location, and fee.",
  },
  {
    icon: Layers,
    title: "Tutor Tuition Management",
    text: "Tutors can create, edit, delete, and manage active status for their own approved tuitions.",
  },
  {
    icon: FileText,
    title: "Student Applications",
    text: "Students apply with a preferred schedule and follow application status in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Moderation",
    text: "Admins approve or reject new posts before they become publicly visible.",
  },
  {
    icon: Wallet,
    title: "Free and Pro Plans",
    text: "Plan-based limits are enforced by the backend. Full plan details live on the pricing page.",
  },
];

const roles: RoleInfo[] = [
  {
    icon: GraduationCap,
    name: "Student",
    summary: "Find a tuition that fits your subject, schedule, and location.",
    capabilities: [
      "Browse and search approved tuitions",
      "Apply with a preferred schedule",
      "Track application status",
      "Update profile and photo",
    ],
    accent: "teal",
  },
  {
    icon: BookOpen,
    name: "Tutor",
    summary: "Offer your teaching batch and manage the students who apply.",
    capabilities: [
      "Post and manage your own tuitions",
      "Upload a tuition banner image",
      "Review and respond to applicants",
      "Manage approved tuition active state",
    ],
    accent: "gold",
  },
  {
    icon: ShieldCheck,
    name: "Admin",
    summary: "Keep the marketplace trustworthy and the catalogue accurate.",
    capabilities: [
      "Review pending tuition posts",
      "Approve or reject new listings",
      "Manage student and tutor roles",
      "Oversee users and payment records",
    ],
    accent: "dark",
  },
];

function SectionIntro({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[#075b55]/65 sm:text-base dark:text-[#f5f5ed]/60">
        {description}
      </p>
    </div>
  );
}

function WorkflowColumn({
  title,
  description,
  icon: Icon,
  steps,
  tone,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  steps: WorkflowStep[];
  tone: "teal" | "gold";
}) {
  const isTeal = tone === "teal";

  return (
    <div className="rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#081715]">
      <div className="flex items-start gap-4">
        <span
          className={
            isTeal
              ? "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#075b55] text-white dark:bg-[#087f75]"
              : "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#d5b36a] text-[#0b1f1c]"
          }
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-xl font-bold text-[#075b55] dark:text-[#f5f5ed]">
            {title}
          </h3>
          <p className="mt-1 text-sm text-[#075b55]/60 dark:text-[#f5f5ed]/55">
            {description}
          </p>
        </div>
      </div>

      <ol className="mt-8 space-y-0">
        {steps.map((step, index) => {
          const StepIcon = step.icon;

          return (
            <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-9 left-[17px] h-[calc(100%-2rem)] w-px bg-[#075b55]/15 dark:bg-white/15"
                />
              ) : null}
              <span
                className={
                  isTeal
                    ? "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#087f75]/10 text-sm font-bold text-[#087f75] ring-4 ring-white dark:bg-[#087f75]/20 dark:text-[#7fe0d2] dark:ring-[#081715]"
                    : "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d5b36a]/20 text-sm font-bold text-[#8a6a28] ring-4 ring-white dark:bg-[#d5b36a]/15 dark:text-[#e8cf99] dark:ring-[#081715]"
                }
              >
                {index + 1}
              </span>
              <div className="pt-1">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                  <StepIcon
                    className={
                      isTeal
                        ? "size-4 text-[#087f75] dark:text-[#7fe0d2]"
                        : "size-4 text-[#8a6a28] dark:text-[#e8cf99]"
                    }
                    aria-hidden="true"
                  />
                  {step.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                  {step.text}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  name,
  summary,
  capabilities,
  accent,
}: {
  icon: LucideIcon;
  name: string;
  summary: string;
  capabilities: string[];
  accent: "teal" | "gold" | "dark";
}) {
  const iconClass =
    accent === "dark"
      ? "bg-[#075b55] text-white dark:bg-[#d5b36a] dark:text-[#0b1f1c]"
      : accent === "gold"
        ? "bg-[#d5b36a]/20 text-[#8a6a28] dark:bg-[#d5b36a]/15 dark:text-[#e8cf99]"
        : "bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#081715]">
      <span
        className={`flex size-11 items-center justify-center rounded-2xl ${iconClass}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-[#075b55] dark:text-[#f5f5ed]">
        {name}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-[#075b55]/60 dark:text-[#f5f5ed]/55">
        {summary}
      </p>

      <ul className="mt-5 space-y-2.5">
        {capabilities.map((capability) => (
          <li
            key={capability}
            className="flex items-start gap-2 text-xs text-[#075b55]/70 dark:text-[#f5f5ed]/65"
          >
            <Check
              className="mt-0.5 size-3.5 shrink-0 text-[#087f75] dark:text-[#7fe0d2]"
              aria-hidden="true"
            />
            {capability}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="bg-[#f5f5ed] dark:bg-[#06110f]">
      {/* About hero */}
      <section
        aria-labelledby="about-title"
        className="border-b border-[#075b55]/10 bg-white dark:border-white/10 dark:bg-[#081715]"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
              Our purpose
            </p>
            <h1
              id="about-title"
              className="mt-3 text-4xl leading-tight font-extrabold tracking-tight text-[#075b55] sm:text-5xl dark:text-[#f5f5ed]"
            >
              About MentorLagbe
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#075b55]/70 dark:text-[#f5f5ed]/65">
              MentorLagbe is a tuition marketplace that brings students and
              tutors into one clear, role-based workspace. It was built to make
              subject-wise tuition easier to discover, review, and apply for —
              without scattering details across messages and spreadsheets.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#075b55]/65 dark:text-[#f5f5ed]/60">
              Students can explore approved listings and apply with their
              preferred schedule. Tutors can publish and manage their own
              batches. Admins keep the catalogue trustworthy through a simple
              approval workflow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/tuitions"
                className={buttonVariants({
                  size: "lg",
                  className: "bg-[#075b55] text-white hover:bg-[#0b6b62]",
                })}
              >
                Browse Tuitions
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Join MentorLagbe
              </Link>
            </div>
          </div>

          <div
            aria-label="Platform overview"
            className="relative overflow-hidden rounded-3xl border border-[#087f75]/15 bg-[#f5f5ed] p-7 shadow-lg dark:border-[#087f75]/25 dark:bg-[#061b18]"
          >
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 size-56 rounded-full bg-[#d5b36a]/20 blur-3xl"
            />
            <div className="relative">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#075b55] text-white dark:bg-[#d5b36a] dark:text-[#0b1f1c]">
                <Sparkles className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-bold text-[#075b55] dark:text-[#f5f5ed]">
                One platform, three clear roles
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                Each role has a focused dashboard and only the tools it needs.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  { icon: GraduationCap, label: "Students discover & apply" },
                  { icon: BookOpen, label: "Tutors publish & manage" },
                  { icon: ShieldCheck, label: "Admins review & approve" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-[#075b55]/10 bg-white/80 px-4 py-3 text-sm font-medium text-[#075b55] dark:border-white/10 dark:bg-white/5 dark:text-[#f5f5ed]"
                  >
                    <Icon
                      className="size-4 text-[#087f75] dark:text-[#7fe0d2]"
                      aria-hidden="true"
                    />
                    {label}
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[11px] text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                Public listings are limited to approved, active tuitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section
        aria-labelledby="mission-title"
        className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <SectionIntro
          eyebrow="Our mission"
          title="Make tuition discovery straightforward"
          description="We focus on the practical steps that help the right student and the right tutor find each other."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: "For students",
              text: "Help students find a tutor who matches their subject, level, mode, and location.",
            },
            {
              icon: Handshake,
              title: "For tutors",
              text: "Give tutors a simple place to present their batches and reach interested learners.",
            },
            {
              icon: Route,
              title: "For the process",
              text: "Keep discovery, applications, and status tracking clear from one dashboard.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#081715]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[#075b55] dark:text-[#f5f5ed]">
                {title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        aria-labelledby="about-how-title"
        className="border-y border-[#075b55]/10 bg-white py-16 lg:py-24 dark:border-white/10 dark:bg-[#081715]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="How it works"
            title="Two workflows, one connected platform"
            description="These steps reflect the actual role-based flows implemented in MentorLagbe."
            centered
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <WorkflowColumn
              title="For Students"
              description="From account creation to tracking a submitted application."
              icon={GraduationCap}
              steps={studentWorkflow}
              tone="teal"
            />
            <WorkflowColumn
              title="For Tutors"
              description="From posting a tuition to managing approved listings and applicants."
              icon={BookOpen}
              steps={tutorWorkflow}
              tone="gold"
            />
          </div>
        </div>
      </section>

      {/* Platform features */}
      <section
        aria-labelledby="features-title"
        className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <SectionIntro
          eyebrow="Platform features"
          title="What you can do today"
          description="Capabilities below are drawn from the features already implemented in the project."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#081715]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#075b55]/5 text-[#075b55] transition-colors group-hover:bg-[#087f75]/10 dark:bg-white/5 dark:text-[#f5f5ed]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-[#075b55] dark:text-[#f5f5ed]">
                {title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* User roles */}
      <section
        aria-labelledby="roles-title"
        className="border-y border-[#075b55]/10 bg-white py-16 lg:py-24 dark:border-white/10 dark:bg-[#081715]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="User roles"
            title="Built around three responsibilities"
            description="Permissions stay server-side, while each dashboard surfaces only the relevant tools."
            centered
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <RoleCard key={role.name} {...role} />
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#d5b36a]/30 bg-[#d5b36a]/5 p-5 text-xs leading-relaxed text-[#8a6a28] dark:border-[#d5b36a]/25 dark:text-[#e8cf99]">
            <strong className="font-bold">Approval workflow:</strong> a new
            tuition starts with pending approval. It appears in Browse Tuitions
            only after an admin approves it and the listing is active. Pending
            and rejected posts stay out of public results.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        aria-labelledby="about-cta-title"
        className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <SectionIntro
          eyebrow="Get started"
          title="Choose your next step"
          description="Explore the catalogue, join as a tutor, or review the available plans."
          centered
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Students",
              text: "Find an approved tuition that fits your goal.",
              href: "/tuitions",
              label: "Explore Tuitions",
              icon: Search,
            },
            {
              title: "Tutors",
              text: "Create your tutor account and post a batch.",
              href: "/sign-up",
              label: "Start Teaching",
              icon: PlusCircle,
            },
            {
              title: "Plans",
              text: "Compare Free and Pro options for each role.",
              href: "/pricing",
              label: "View Pricing",
              icon: Wallet,
            },
          ].map(({ title, text, href, label, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:border-white/10 dark:bg-[#081715]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[#075b55] dark:text-[#f5f5ed]">
                {title}
              </h3>
              <p className="mt-1.5 text-xs text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                {text}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#087f75] dark:text-[#7fe0d2]">
                {label}
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
