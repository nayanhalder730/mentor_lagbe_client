"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api";
import { createCheckoutSession, getMyProfile } from "@/lib/api-endpoints";
import { useSession } from "@/lib/auth-client";
import { normalizeRole, type UserRole } from "@/lib/roles";
import type { Plan } from "@/types/api";

type StatusNotice = {
  tone: "info" | "success" | "warning";
  text: string;
};

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Checkout could not be started. Please try again.";
}

/** Only https Stripe URLs are followed; nothing is guessed or hardcoded. */
function isCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function PlanSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid gap-5 lg:grid-cols-3">
      <span className="sr-only">Loading your plan…</span>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#081715]"
        >
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-5 h-10 w-24" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <Skeleton className="mt-8 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function PricingView() {
  const searchParams = useSearchParams();
  const checkoutSignal = searchParams.get("checkout");
  const { data: session, isPending, refetch } = useSession();

  const userId = session?.user?.id;
  const role: UserRole | null = userId
    ? normalizeRole(session?.user.role)
    : null;

  const [profilePlan, setProfilePlan] = useState<Plan | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState<StatusNotice | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      // Defer state updates out of the effect body.
      await Promise.resolve();

      if (checkoutSignal === "cancelled") {
        setNotice({
          tone: "info",
          text: "Checkout was cancelled. No plan change was made.",
        });
      }

      if (!userId) {
        setProfilePlan(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      try {
        if (checkoutSignal === "returned") {
          await refetch();
        }

        // Backend-verified plan from the user document, not a query parameter.
        const profile = await getMyProfile();

        if (!active) return;

        setProfilePlan(profile.plan);

        if (checkoutSignal === "returned") {
          setNotice(
            profile.plan === "pro"
              ? {
                  tone: "success",
                  text: "Your Pro plan is active.",
                }
              : {
                  tone: "warning",
                  text: "We could not confirm an active Pro plan yet. Payment updates may still be processing.",
                },
          );
        }
      } catch {
        if (!active) return;

        setProfilePlan(null);

        if (checkoutSignal === "returned") {
          setNotice({
            tone: "warning",
            text: "We could not verify your plan right now. Please check again shortly.",
          });
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [userId, checkoutSignal, refetch]);

  const sessionPlan: Plan | null =
    userId && session?.user.plan === "pro" ? "pro" : userId ? "free" : null;
  const currentPlan: Plan | null = profilePlan ?? sessionPlan;

  const refreshPlan = async () => {
    try {
      const profile = await getMyProfile();

      setProfilePlan(profile.plan);
      await refetch();
    } catch {
      // Keep the last known plan; no false status is shown.
    }
  };

  const handleUpgrade = async () => {
    if (processing) return;

    setProcessing(true);

    try {
      const checkout = await createCheckoutSession();

      if (!isCheckoutUrl(checkout.url)) {
        toast.error(
          "The checkout session did not return a valid Stripe URL. Please try again.",
        );
        return;
      }

      toast.success(`${checkout.planName} checkout is ready`);
      window.location.assign(checkout.url);
    } catch (error) {
      toast.error(describeError(error));

      if (isApiError(error) && error.status === 409) {
        void refreshPlan();
      }
    } finally {
      setProcessing(false);
    }
  };

  const upgradeButton = (cardRole: Extract<UserRole, "student" | "tutor">) => {
    if (isPending || profileLoading) {
      return <Skeleton className="h-10 w-full" />;
    }

    if (!userId) {
      return (
        <Link
          href="/sign-in?callbackUrl=%2Fpricing"
          className={buttonVariants({
            className: "w-full bg-[#075b55] text-white hover:bg-[#0b6b62]",
          })}
        >
          Sign in to upgrade
          <ArrowRight aria-hidden="true" />
        </Link>
      );
    }

    if (role === "admin") return null;

    if (role !== cardRole) {
      return (
        <p className="rounded-xl border border-[#075b55]/10 px-4 py-2.5 text-center text-xs text-[#075b55]/55 dark:border-white/10 dark:text-[#f5f5ed]/50">
          Available for {cardRole}s
        </p>
      );
    }

    if (currentPlan === "pro") {
      return (
        <p className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <CircleCheck className="size-4" aria-hidden="true" />
          Current plan
        </p>
      );
    }

    return (
      <Button
        type="button"
        onClick={handleUpgrade}
        disabled={processing}
        className="w-full bg-[#075b55] text-white hover:bg-[#0b6b62]"
      >
        {processing ? (
          <RefreshCw className="animate-spin" aria-hidden="true" />
        ) : (
          <Wallet aria-hidden="true" />
        )}
        {processing ? "Opening Stripe…" : "Upgrade to Pro"}
      </Button>
    );
  };

  const noticeStyles =
    notice?.tone === "success"
      ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
      : notice?.tone === "warning"
        ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"
        : "border-[#087f75]/20 bg-[#087f75]/5 text-[#075b55] dark:text-[#f5f5ed]";

  return (
    <main className="bg-[#f5f5ed] dark:bg-[#06110f]">
      <section
        aria-labelledby="pricing-title"
        className="border-b border-[#075b55]/10 bg-white dark:border-white/10 dark:bg-[#081715]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
              Plans
            </p>
            <h1
              id="pricing-title"
              className="mt-3 text-4xl font-extrabold tracking-tight text-[#075b55] sm:text-5xl dark:text-[#f5f5ed]"
            >
              Simple pricing for students and tutors
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#075b55]/70 dark:text-[#f5f5ed]/65">
              Start with a free account. Pro subscriptions are priced by role,
              and the final plan is determined by the server using your verified
              account.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {role === "admin" ? (
          <div className="mb-6 rounded-2xl border border-[#d5b36a]/30 bg-[#d5b36a]/5 px-5 py-4 text-sm text-[#8a6a28] dark:text-[#e8cf99]">
            Admin accounts do not purchase subscriptions. This page is shown
            for information only.
          </div>
        ) : null}

        {notice ? (
          <div
            role="status"
            className={`mb-6 flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm ${noticeStyles}`}
          >
            {notice.tone === "warning" ? (
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            {notice.text}
          </div>
        ) : null}

        {isPending || profileLoading ? (
          <PlanSkeleton />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Free */}
            <section
              aria-labelledby="free-plan-title"
              className="flex h-full flex-col rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#081715]"
            >
              <div className="flex items-center justify-between">
                <h2
                  id="free-plan-title"
                  className="text-lg font-bold text-[#075b55] dark:text-[#f5f5ed]"
                >
                  Free
                </h2>
                <span className="rounded-full bg-[#075b55]/5 px-2.5 py-1 text-[11px] font-semibold text-[#075b55]/70 dark:bg-white/5 dark:text-[#f5f5ed]/65">
                  For everyone
                </span>
              </div>

              <p className="mt-5 text-3xl font-extrabold text-[#075b55] dark:text-[#f5f5ed]">
                $0
              </p>
              <p className="mt-1 text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                Free account
              </p>

              <ul className="mt-6 space-y-3 text-sm text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                {[
                  "Browse available tuitions",
                  "Apply to tuitions (Student)",
                  "Basic tuition management (Tutor)",
                  "Tutors can post at most 2 tuitions",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-[#087f75] dark:text-[#7fe0d2]"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {role === "student" || role === "tutor" ? (
                  <p className="rounded-xl border border-[#075b55]/10 px-4 py-2.5 text-center text-xs text-[#075b55]/55 dark:border-white/10 dark:text-[#f5f5ed]/50">
                    {currentPlan === "free" ? "Your current plan" : "Included with your account"}
                  </p>
                ) : role === "admin" ? (
                  <p className="rounded-xl border border-[#075b55]/10 px-4 py-2.5 text-center text-xs text-[#075b55]/55 dark:border-white/10 dark:text-[#f5f5ed]/50">
                    Included with your account
                  </p>
                ) : (
                  <Link
                    href="/sign-up"
                    className={buttonVariants({ variant: "outline", className: "w-full" })}
                  >
                    Create free account
                  </Link>
                )}
              </div>
            </section>

            {/* Student Pro */}
            <section
              aria-labelledby="student-pro-title"
              className="flex h-full flex-col rounded-2xl border border-[#087f75]/25 bg-white p-6 shadow-sm dark:border-[#087f75]/30 dark:bg-[#081715]"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
                  <Users className="size-4" aria-hidden="true" />
                </span>
                <h2
                  id="student-pro-title"
                  className="text-lg font-bold text-[#075b55] dark:text-[#f5f5ed]"
                >
                  Student Pro
                </h2>
              </div>

              <p className="mt-5 text-3xl font-extrabold text-[#075b55] dark:text-[#f5f5ed]">
                $10
                <span className="ml-1 text-sm font-medium text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                  / month
                </span>
              </p>
              <p className="mt-1 text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                Pro student subscription
              </p>

              <ul className="mt-6 space-y-3 text-sm text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                {[
                  "Pro student subscription",
                  "Plan status verified by the backend",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-[#087f75] dark:text-[#7fe0d2]"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">{upgradeButton("student")}</div>
            </section>

            {/* Tutor Pro */}
            <section
              aria-labelledby="tutor-pro-title"
              className="flex h-full flex-col rounded-2xl border border-[#d5b36a]/45 bg-[#075b55] p-6 text-white shadow-lg dark:border-[#d5b36a]/35"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-[#d5b36a]">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </span>
                  <h2
                    id="tutor-pro-title"
                    className="text-lg font-bold text-white"
                  >
                    Tutor Pro
                  </h2>
                </div>
                <span className="rounded-full bg-[#d5b36a] px-2.5 py-1 text-[11px] font-bold text-[#0b1f1c]">
                  More posts
                </span>
              </div>

              <p className="mt-5 text-3xl font-extrabold text-[#d5b36a]">
                $15
                <span className="ml-1 text-sm font-medium text-white/60">
                  / month
                </span>
              </p>
              <p className="mt-1 text-xs text-white/60">
                Pro tutor subscription
              </p>

              <ul className="mt-6 space-y-3 text-sm text-white/80">
                {[
                  "Pro tutor subscription",
                  "Unlimited tuition posting",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-[#d5b36a]"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {role === "tutor" && currentPlan !== "pro" && !processing ? (
                  <Button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={processing}
                    className="w-full bg-[#d5b36a] text-[#0b1f1c] hover:bg-[#e3c585]"
                  >
                    <Wallet aria-hidden="true" />
                    Upgrade to Pro
                  </Button>
                ) : (
                  upgradeButton("tutor")
                )}
              </div>
            </section>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Free to explore",
              text: "Browsing approved tuition listings does not require a paid plan.",
            },
            {
              icon: ShieldCheck,
              title: "Server-side authority",
              text: "Prices and plan changes are decided by the backend, never by the browser.",
            },
            {
              icon: CircleCheck,
              title: "Verified status",
              text: "Pro status is read from your account after payment processing completes.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
            >
              <Icon
                className="size-5 text-[#087f75] dark:text-[#7fe0d2]"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-sm font-bold text-[#075b55] dark:text-[#f5f5ed]">
                {title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
