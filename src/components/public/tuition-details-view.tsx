"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  RefreshCw,
  TriangleAlert,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  applicationStatusTone,
  formatDate,
  StatusBadge,
  titleCase,
} from "@/components/dashboard/overview/overview-primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { isApiError } from "@/lib/api";
import SaveTuitionButton from "@/components/public/save-tuition-button";
import {
  checkTuitionApplication,
  createApplication,
  getTuition,
} from "@/lib/api-endpoints";
import { normalizeRole } from "@/lib/roles";
import type { Application, Tuition } from "@/types/api";

const numberFormatter = new Intl.NumberFormat("en-US");

type DetailsState =
  | { status: "loading"; tuition: null; error: null }
  | { status: "error"; tuition: null; error: string }
  | { status: "notFound"; tuition: null; error: null }
  | { status: "ready"; tuition: Tuition; error: null };

type ApplicationState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "limitReached"; error: string }
  | { status: "applied"; application: Application | null }
  | { status: "notApplied" };

type ApplicationForm = {
  studentPhone: string;
  preferredSchedule: string;
  studentNote: string;
};

const EMPTY_FORM: ApplicationForm = {
  studentPhone: "",
  preferredSchedule: "",
  studentNote: "",
};

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Your request could not be completed. Please try again.";
}

function isApplicationLimitError(error: unknown) {
  if (!isApiError(error)) return false;

  return (
    error.code === "FREE_APPLICATION_LIMIT" ||
    (error.status === 403 &&
      /at most 2 applications|upgrade to student pro/i.test(error.message))
  );
}

function validateApplicationForm(form: ApplicationForm): string | null {
  const phone = form.studentPhone.trim();
  const schedule = form.preferredSchedule.trim();
  const note = form.studentNote.trim();

  if (phone.length < 6 || phone.length > 30) {
    return "Phone must be between 6 and 30 characters.";
  }

  if (schedule.length < 3 || schedule.length > 200) {
    return "Preferred schedule must be between 3 and 200 characters.";
  }

  if (note.length > 1000) {
    return "Student note must be at most 1000 characters.";
  }

  return null;
}

function DetailsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading tuition details…</span>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4 rounded-2xl border border-[#075b55]/10 bg-white p-6 dark:border-white/10 dark:bg-[#081715]">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="rounded-2xl border border-[#075b55]/10 bg-white p-6 dark:border-white/10 dark:bg-[#081715]">
          <Skeleton className="h-6 w-40" />
          <div className="mt-5 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#081715]">
      <h2 className="text-base font-bold text-[#075b55] dark:text-[#f5f5ed]">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
          {description}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function TuitionDetailsView({
  tuitionId,
}: {
  tuitionId: string;
}) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [reloadKey, setReloadKey] = useState(0);
  const [details, setDetails] = useState<DetailsState>({
    status: "loading",
    tuition: null,
    error: null,
  });
  const [application, setApplication] = useState<ApplicationState>({
    status: "loading",
  });
  const [applicationReloadKey, setApplicationReloadKey] = useState(0);
  const [form, setForm] = useState<ApplicationForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const user = session?.user;
  const role = user ? normalizeRole(user.role) : null;

  useEffect(() => {
    let active = true;

    getTuition(tuitionId)
      .then((tuition) => {
        if (!active) return;

        setDetails({ status: "ready", tuition, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;

        if (isApiError(error) && error.status === 404) {
          setDetails({ status: "notFound", tuition: null, error: null });
          return;
        }

        setDetails({
          status: "error",
          tuition: null,
          error: describeError(error),
        });
      });

    return () => {
      active = false;
    };
  }, [tuitionId, reloadKey]);

  useEffect(() => {
    if (role !== "student") return;

    let active = true;

    checkTuitionApplication(tuitionId)
      .then((data) => {
        if (!active) return;

        setApplication(
          data.hasApplied
            ? { status: "applied", application: null }
            : { status: "notApplied" },
        );
      })
      .catch((error: unknown) => {
        if (!active) return;

        // An unverifiable check must not be presented as "not applied".
        setApplication({ status: "error", error: describeError(error) });
      });

    return () => {
      active = false;
    };
  }, [role, tuitionId, applicationReloadKey]);

  const handleDetailsRetry = () => {
    setDetails({ status: "loading", tuition: null, error: null });
    setReloadKey((key) => key + 1);
  };

  const handleApplicationRetry = () => {
    setApplication({ status: "loading" });
    setApplicationReloadKey((key) => key + 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting || application.status !== "notApplied") return;

    const validationError = validateApplicationForm(form);

    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      const created = await createApplication({
        tuitionId,
        studentPhone: form.studentPhone.trim(),
        preferredSchedule: form.preferredSchedule.trim(),
        studentNote: form.studentNote.trim() === "" ? null : form.studentNote.trim(),
      });

      setApplication({ status: "applied", application: created });
      setForm(EMPTY_FORM);
      toast.success("Application submitted successfully");
      router.refresh();
    } catch (error) {
      const message = describeError(error);

      toast.error(message);

      if (isApplicationLimitError(error)) {
        setApplication({ status: "limitReached", error: message });
      } else if (isApiError(error) && (error.status === 409 || error.status === 404)) {
        setApplication({ status: "loading" });
        setApplicationReloadKey((key) => key + 1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = (
    <Link
      href="/tuitions"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#087f75] hover:underline dark:text-[#7fe0d2]"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to Browse Tuitions
    </Link>
  );

  return (
    <main className="bg-[#f5f5ed] dark:bg-[#06110f]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {backLink}

        <div className="mt-6">
          {details.status === "loading" ? <DetailsSkeleton /> : null}

          {details.status === "notFound" ? (
            <div className="rounded-2xl border border-[#075b55]/15 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-[#081715]">
              <TriangleAlert
                className="mx-auto size-9 text-[#d5b36a]"
                aria-hidden="true"
              />
              <h1 className="mt-4 text-2xl font-bold text-[#075b55] dark:text-[#f5f5ed]">
                Tuition not found
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
                This listing may not exist, or it is no longer approved and
                active. Only approved, active tuitions have a public details
                page.
              </p>
              <Link
                href="/tuitions"
                className={buttonVariants({ className: "mt-6" })}
              >
                Browse Tuitions
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : null}

          {details.status === "error" ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-500/20 bg-white p-8 text-center shadow-sm dark:border-red-400/25 dark:bg-[#081715]"
            >
              <TriangleAlert
                className="mx-auto size-9 text-red-500"
                aria-hidden="true"
              />
              <h1 className="mt-4 text-xl font-bold text-[#075b55] dark:text-[#f5f5ed]">
                We couldn&apos;t load this tuition
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
                {details.error}
              </p>
              <Button
                type="button"
                onClick={handleDetailsRetry}
                className="mt-5 bg-[#075b55] text-white hover:bg-[#0b6b62]"
              >
                <RefreshCw aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : null}

          {details.status === "ready" && details.tuition ? (
            <>
              <div
                role="img"
                aria-label={`Banner for ${details.tuition.title}`}
                className="relative h-56 w-full overflow-hidden rounded-2xl border border-[#075b55]/10 bg-cover bg-center shadow-sm sm:h-72 dark:border-white/10"
                style={
                  details.tuition.bannerImage
                    ? { backgroundImage: `url("${details.tuition.bannerImage}")` }
                    : undefined
                }
              >
                {!details.tuition.bannerImage ? (
                  <div className="flex h-full w-full items-center justify-center bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
                    <BookOpen className="size-14" aria-hidden="true" />
                  </div>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#062d29]/80 to-transparent p-5 pt-16">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#075b55] dark:bg-[#081715]/90 dark:text-[#f5f5ed]">
                      {details.tuition.subject}
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#075b55] dark:bg-[#081715]/90 dark:text-[#f5f5ed]">
                      {details.tuition.mode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-6">
                  <Panel
                    title={details.tuition.title}
                    description="Tuition details provided by the tutor."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10">
                        <BookOpen className="mt-0.5 size-4 shrink-0 text-[#087f75] dark:text-[#7fe0d2]" aria-hidden="true" />
                        <div>
                          <p className="text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45">Class level</p>
                          <p className="text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">{details.tuition.classLevel}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-[#087f75] dark:text-[#7fe0d2]" aria-hidden="true" />
                        <div>
                          <p className="text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45">Location</p>
                          <p className="text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">{details.tuition.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10">
                        <Clock className="mt-0.5 size-4 shrink-0 text-[#087f75] dark:text-[#7fe0d2]" aria-hidden="true" />
                        <div>
                          <p className="text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45">Days per week</p>
                          <p className="text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">{details.tuition.daysPerWeek}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10">
                        <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#087f75] dark:text-[#7fe0d2]" aria-hidden="true" />
                        <div>
                          <p className="text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45">Posted</p>
                          <p className="text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">{formatDate(details.tuition.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-[#087f75]/15 bg-[#087f75]/5 p-4 dark:border-[#087f75]/25">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-11 shrink-0">
                          {details.tuition.tutorImage ? (
                            <AvatarImage
                              src={details.tuition.tutorImage}
                              alt={details.tuition.tutorName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-[#087f75]/15 text-sm font-bold text-[#075b55] dark:bg-[#087f75]/25 dark:text-[#7fe0d2]">
                            {details.tuition.tutorName.trim().charAt(0).toUpperCase() || (
                              <UserRound className="size-4" aria-hidden="true" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs text-[#075b55]/60 dark:text-[#f5f5ed]/60">
                            Taught by
                          </p>
                          <p className="truncate text-sm font-bold text-[#075b55] dark:text-[#f5f5ed]">
                            {details.tuition.tutorName}
                          </p>
                        </div>
                      </div>
                      {details.tuition.tutorBio ? (
                        <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                          {details.tuition.tutorBio}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-bold text-[#075b55] dark:text-[#f5f5ed]">
                        About this tuition
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                        {details.tuition.description}
                      </p>
                    </div>
                  </Panel>

                  <Link
                    href="/tuitions"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Browse More Tuitions
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>

                <div className="lg:sticky lg:top-24 lg:self-start">
                  <Panel
                    title="Monthly fee"
                    description="Set by the tutor for this batch."
                  >
                    <p className="flex items-center gap-2 text-3xl font-extrabold text-[#075b55] dark:text-[#f5f5ed]">
                      <Wallet className="size-6 text-[#087f75] dark:text-[#7fe0d2]" aria-hidden="true" />
                      {numberFormatter.format(details.tuition.monthlyFee)}
                      <span className="text-sm font-medium text-[#075b55]/50 dark:text-[#f5f5ed]/45">/ month</span>
                    </p>
                  </Panel>

                  <div className="mt-4">
                    <SaveTuitionButton tuitionId={tuitionId} />
                  </div>

                  <div className="mt-4">
                    {sessionPending ? (
                      <Panel title="Application">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="mt-3 h-24 w-full" />
                      </Panel>
                    ) : role === null ? (
                      <Panel
                        title="Apply to this tuition"
                        description="Sign in as a student to submit an application."
                      >
                        <Link
                          href={`/sign-in?callbackUrl=${encodeURIComponent(`/tuitions/${tuitionId}`)}`}
                          className={buttonVariants({ className: "w-full bg-[#075b55] text-white hover:bg-[#0b6b62]" })}
                        >
                          Sign in to apply
                          <ArrowRight aria-hidden="true" />
                        </Link>
                        <p className="mt-3 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                          You&apos;ll return to this tuition after signing in.
                        </p>
                      </Panel>
                    ) : role === "tutor" ? (
                      <Panel title="Applications">
                        <p className="text-sm leading-relaxed text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                          You&apos;re signed in as a tutor. Tutors cannot apply
                          to tuition posts.
                        </p>
                      </Panel>
                    ) : role === "admin" ? (
                      <Panel title="Applications">
                        <p className="text-sm leading-relaxed text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                          Admins cannot apply to tuitions. Admin accounts are
                          for moderation only.
                        </p>
                      </Panel>
                    ) : application.status === "limitReached" ? (
                      <Panel
                        title="Free application limit reached"
                        description={application.error}
                      >
                        <Link
                          href="/pricing"
                          className={buttonVariants({
                            className: "w-full bg-[#075b55] text-white hover:bg-[#0b6b62]",
                          })}
                        >
                          Upgrade to Student Pro
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </Panel>
                    ) : application.status === "error" ? (
                      <Panel
                        title="Application status unavailable"
                        description={application.error}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleApplicationRetry}
                        >
                          <RefreshCw aria-hidden="true" />
                          Retry status check
                        </Button>
                      </Panel>
                    ) : application.status === "loading" ? (
                      <Panel title="Application">
                        <Skeleton className="h-16 w-full" />
                      </Panel>
                    ) : application.status === "applied" ? (
                      <Panel
                        title="Your application"
                        description="This tuition already has an application from your account."
                      >
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#087f75]/15 bg-[#087f75]/5 p-4 dark:border-[#087f75]/25">
                          <div>
                            <p className="text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                              Status
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                              {application.application
                                ? `Applied ${formatDate(application.application.appliedAt)}`
                                : "Already applied"}
                            </p>
                          </div>
                          <StatusBadge
                            tone={
                              application.application
                                ? applicationStatusTone(application.application.status)
                                : "amber"
                            }
                          >
                            {application.application
                              ? titleCase(application.application.status)
                              : "Applied"}
                          </StatusBadge>
                        </div>
                        <p className="mt-4 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                          Duplicate applications are handled by the backend.
                          This card only reflects your existing application.
                        </p>
                      </Panel>
                    ) : (
                      <Panel
                        title="Apply to this tuition"
                        description="Your name and email are taken from your verified session."
                      >
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <fieldset disabled={submitting} className="space-y-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="apply-phone">Student phone</Label>
                              <Input
                                id="apply-phone"
                                value={form.studentPhone}
                                maxLength={30}
                                onChange={(event) =>
                                  setForm((current) => ({
                                    ...current,
                                    studentPhone: event.target.value,
                                  }))
                                }
                                placeholder="e.g. 01700000000"
                              />
                              <p className="text-[11px] text-[#075b55]/45 dark:text-[#f5f5ed]/40">6–30 characters</p>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="apply-schedule">Preferred schedule</Label>
                              <Input
                                id="apply-schedule"
                                value={form.preferredSchedule}
                                maxLength={200}
                                onChange={(event) =>
                                  setForm((current) => ({
                                    ...current,
                                    preferredSchedule: event.target.value,
                                  }))
                                }
                                placeholder="e.g. Friday evenings, 6–8 PM"
                              />
                              <p className="text-[11px] text-[#075b55]/45 dark:text-[#f5f5ed]/40">3–200 characters</p>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="apply-note">Student note (optional)</Label>
                              <Textarea
                                id="apply-note"
                                rows={4}
                                value={form.studentNote}
                                maxLength={1000}
                                onChange={(event) =>
                                  setForm((current) => ({
                                    ...current,
                                    studentNote: event.target.value,
                                  }))
                                }
                                placeholder="Anything the tutor should know before your session."
                              />
                            </div>
                          </fieldset>

                          {formError ? (
                            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                              {formError}
                            </p>
                          ) : null}

                          <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#075b55] text-white hover:bg-[#0b6b62]"
                          >
                            {submitting ? (
                              <RefreshCw className="animate-spin" aria-hidden="true" />
                            ) : (
                              <Check aria-hidden="true" />
                            )}
                            {submitting ? "Submitting…" : "Submit application"}
                          </Button>
                        </form>
                      </Panel>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
