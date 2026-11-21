"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  Wallet,
} from "lucide-react";

import TuitionCard from "@/components/public/tuition-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDashboardOverview } from "@/hooks/use-dashboard-overview";
import { getMyProfile, listTuitions } from "@/lib/api-endpoints";
import type { Tuition } from "@/types/api";

import {
  ActivityItem,
  ActivityList,
  applicationStatusTone,
  EmptyActivity,
  formatDate,
  formatNumber,
  OverviewError,
  OverviewSkeleton,
  PageHeading,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  titleCase,
} from "./overview-primitives";

export default function StudentOverview() {
  const { status, data, error, retry } = useDashboardOverview("student");
  const [plan, setPlan] = useState<string | null>(null);
  const [available, setAvailable] = useState<{
    status: "loading" | "ready" | "error";
    tuitions: Tuition[];
    error: string | null;
  }>({ status: "loading", tuitions: [], error: null });

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((profile) => {
        if (active) setPlan(profile.plan);
      })
      .catch(() => {
        if (active) setPlan(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const [availableReloadKey, setAvailableReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    listTuitions({ page: 1, limit: 6 })
      .then((data) => {
        if (!active) return;

        setAvailable({ status: "ready", tuitions: data.tuitions, error: null });
      })
      .catch(() => {
        if (!active) return;

        setAvailable({
          status: "error",
          tuitions: [],
          error: "Available tuitions could not be loaded right now.",
        });
      });

    return () => {
      active = false;
    };
  }, [availableReloadKey]);

  const retryAvailable = () => {
    setAvailable({ status: "loading", tuitions: [], error: null });
    setAvailableReloadKey((key) => key + 1);
  };

  const isPro = plan === "pro";
  const applicationCount = data?.stats.totalApplications ?? 0;
  const atFreeLimit = !isPro && plan !== null && applicationCount >= 2;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Student overview"
        description="A quick look at your tuition applications and recent activity."
      />

      {status === "loading" ? (
        <OverviewSkeleton statCount={6} sectionCount={2} />
      ) : null}

      {status === "error" ? (
        <OverviewError message={error} onRetry={retry} />
      ) : null}

      {status === "ready" && data ? (
        <>
          <StatGrid>
            <StatCard
              label="Total applications"
              value={data.stats.totalApplications}
              icon={FileText}
              tone="teal"
              hint="Applications you have submitted"
            />
            <StatCard
              label="Pending"
              value={data.stats.pendingApplications}
              icon={Clock}
              tone="amber"
              hint="Awaiting a tutor's review"
            />
            <StatCard
              label="Accepted"
              value={data.stats.acceptedApplications}
              icon={CircleCheck}
              tone="green"
              hint="Approved by the tutor"
            />
            <StatCard
              label="Rejected"
              value={data.stats.rejectedApplications}
              icon={CircleX}
              tone="red"
              hint="Not selected"
            />
            <StatCard
              label="Current plan"
              value={plan ? titleCase(plan) : "—"}
              icon={Wallet}
              tone="gold"
              hint="Verified from your profile"
            />
            <StatCard
              label="Application usage"
              value={
                plan === null
                  ? "—"
                  : isPro
                    ? "Unlimited"
                    : `${applicationCount} / 2`
              }
              icon={FileText}
              tone={atFreeLimit ? "red" : "teal"}
              hint={isPro ? "Student Pro benefits" : "Free Student limit"}
            />
          </StatGrid>

          {atFreeLimit ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-[#d5b36a]/40 bg-[#d5b36a]/10 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#d5b36a]/30 dark:bg-[#d5b36a]/5">
              <div>
                <h2 className="text-sm font-bold text-[#075b55] dark:text-[#f5f5ed]">
                  You have used all Free Student applications
                </h2>
                <p className="mt-1 text-xs text-[#075b55]/65 dark:text-[#f5f5ed]/60">
                  Upgrade to Student Pro to apply to unlimited tuitions without losing your existing applications.
                </p>
              </div>
              <Link
                href="/pricing"
                className={buttonVariants({
                  className: "bg-[#075b55] text-white hover:bg-[#0b6b62]",
                })}
              >
                Upgrade to Pro
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : null}

          <SectionCard
            title="Available tuitions"
            description="Approved and active tuition posts from tutors."
            icon={BookOpen}
          >
            {available.status === "loading" ? (
              <div role="status" aria-live="polite" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <span className="sr-only">Loading available tuitions…</span>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-56 animate-pulse rounded-xl bg-[#075b55]/10 dark:bg-white/10" />
                ))}
              </div>
            ) : null}

            {available.status === "error" ? (
              <div role="alert" className="rounded-xl border border-red-500/20 p-4">
                <p className="text-sm text-[#075b55] dark:text-[#f5f5ed]">
                  {available.error}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={retryAvailable}
                  className="mt-3"
                >
                  Try again
                </Button>
              </div>
            ) : null}

            {available.status === "ready" && available.tuitions.length === 0 ? (
              <EmptyActivity
                title="No tuitions available yet"
                description="Approved and active tutor posts will appear here."
              />
            ) : null}

            {available.status === "ready" && available.tuitions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {available.tuitions.map((tuition) => (
                  <TuitionCard key={tuition.id} tuition={tuition} />
                ))}
              </div>
            ) : null}

            <div className="mt-4">
              <Link
                href="/tuitions"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Browse all tuitions
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </SectionCard>

          <SectionCard
            title="Recent applications"
            description="Your latest applications, newest first."
            icon={FileText}
          >
            {data.recentActivity.applications.length === 0 ? (
              <EmptyActivity
                title="No applications yet"
                description="Once you apply to a tuition, it will show up here."
              />
            ) : (
              <ActivityList>
                {data.recentActivity.applications.map((application) => (
                  <ActivityItem
                    key={application.id}
                    title={application.tuitionTitle}
                    description={
                      <>
                        {application.subject}
                        <span aria-hidden="true"> · </span>
                        Fee {formatNumber(application.monthlyFee)}
                      </>
                    }
                    meta={`Applied ${formatDate(application.appliedAt)}`}
                    trailing={
                      <StatusBadge
                        tone={applicationStatusTone(application.status)}
                      >
                        {titleCase(application.status)}
                      </StatusBadge>
                    }
                  />
                ))}
              </ActivityList>
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
