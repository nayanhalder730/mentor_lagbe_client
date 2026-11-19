import type { ReactNode } from "react";
import {
  Inbox,
  RefreshCw,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApplicationStatus, ApprovalStatus } from "@/types/api";
import { cn } from "@/lib/utils";

/**
 * Presentational building blocks shared by the three role overviews.
 * Everything here uses the dashboard's existing palette and spacing.
 */

const numberFormatter = new Intl.NumberFormat("en-US");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return dateFormatter.format(date);
}

export function formatCurrency(amount: number, currency: string) {
  const code = currency.trim().toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${formatNumber(amount)} ${code}`.trim();
  }
}

export function titleCase(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

/* -------------------------------------------------------------------------- */
/* Page heading                                                               */
/* -------------------------------------------------------------------------- */

export function PageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[#075b55] sm:text-3xl dark:text-[#f5f5ed]">
        {title}
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm text-[#075b55]/60 dark:text-[#f5f5ed]/55">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat cards                                                                 */
/* -------------------------------------------------------------------------- */

export type StatTone = "teal" | "gold" | "amber" | "green" | "red" | "slate";

const statToneClasses: Record<StatTone, string> = {
  teal: "bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]",
  gold: "bg-[#d5b36a]/20 text-[#8a6a28] dark:bg-[#d5b36a]/15 dark:text-[#e8cf99]",
  amber:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300",
  green:
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300",
  red: "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-300",
  slate:
    "bg-[#075b55]/10 text-[#075b55]/70 dark:bg-white/10 dark:text-[#f5f5ed]/70",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "teal",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: StatTone;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#075b55]/10 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5 dark:border-white/10 dark:bg-[#081715]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[#075b55]/65 dark:text-[#f5f5ed]/60">
          {label}
        </p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            statToneClasses[tone],
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold tracking-tight text-[#075b55] sm:text-3xl dark:text-[#f5f5ed]">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>

      {hint ? (
        <p className="mt-1 text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
  );
}

export function StatGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-[#075b55]/75 uppercase dark:text-[#f5f5ed]/65">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
            {description}
          </p>
        ) : null}
      </div>
      <StatGrid>{children}</StatGrid>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Status badges                                                              */
/* -------------------------------------------------------------------------- */

export type BadgeTone = "neutral" | "teal" | "gold" | "amber" | "green" | "red";

const badgeToneClasses: Record<BadgeTone, string> = {
  neutral:
    "bg-[#075b55]/10 text-[#075b55] ring-[#075b55]/15 dark:bg-white/10 dark:text-[#f5f5ed] dark:ring-white/20",
  teal: "bg-[#087f75]/10 text-[#075b55] ring-[#087f75]/20 dark:bg-[#087f75]/20 dark:text-[#7fe0d2] dark:ring-[#087f75]/30",
  gold: "bg-[#d5b36a]/20 text-[#8a6a28] ring-[#d5b36a]/40 dark:bg-[#d5b36a]/15 dark:text-[#e8cf99] dark:ring-[#d5b36a]/30",
  amber:
    "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-400/25",
  green:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/25",
  red: "bg-red-500/10 text-red-700 ring-red-500/25 dark:bg-red-400/15 dark:text-red-300 dark:ring-red-400/25",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ring-1 ring-inset",
        badgeToneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function applicationStatusTone(status: ApplicationStatus): BadgeTone {
  switch (status) {
    case "accepted":
      return "green";
    case "rejected":
      return "red";
    default:
      return "amber";
  }
}

export function approvalStatusTone(status: ApprovalStatus): BadgeTone {
  switch (status) {
    case "approved":
      return "green";
    case "rejected":
      return "red";
    default:
      return "amber";
  }
}

export function roleTone(role: string): BadgeTone {
  if (role === "admin") return "gold";
  if (role === "tutor") return "teal";

  return "neutral";
}

export function paymentStatusTone(status: string): BadgeTone {
  if (status === "paid") return "green";
  if (status === "unpaid" || status === "failed") return "red";

  return "amber";
}

/* -------------------------------------------------------------------------- */
/* Activity sections                                                          */
/* -------------------------------------------------------------------------- */

export function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ActivityList({ children }: { children: ReactNode }) {
  return (
    <ul className="divide-y divide-[#075b55]/10 dark:divide-white/10">
      {children}
    </ul>
  );
}

export function ActivityItem({
  title,
  description,
  meta,
  trailing,
}: {
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <li className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
          {title}
        </p>
        {description ? (
          <p className="mt-0.5 truncate text-xs text-[#075b55]/60 dark:text-[#f5f5ed]/55">
            {description}
          </p>
        ) : null}
        {meta ? (
          <p className="mt-0.5 truncate text-xs text-[#075b55]/45 dark:text-[#f5f5ed]/40">
            {meta}
          </p>
        ) : null}
      </div>

      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </li>
  );
}

export function EmptyActivity({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#075b55]/20 px-4 py-10 text-center dark:border-white/15">
      <span className="flex size-10 items-center justify-center rounded-full bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-[#075b55] dark:text-[#f5f5ed]">
        {title}
      </p>
      <p className="max-w-sm text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading and error states                                                   */
/* -------------------------------------------------------------------------- */

export function OverviewSkeleton({
  statCount = 8,
  sectionCount = 2,
}: {
  statCount?: number;
  sectionCount?: number;
}) {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading dashboard data…</span>

      <div
        aria-hidden="true"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: statCount }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
          >
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>

      <div aria-hidden="true" className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: sectionCount }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-500/20 bg-white p-5 shadow-sm sm:p-6 dark:border-red-400/25 dark:bg-[#081715]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-300">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
            We couldn&apos;t load your dashboard
          </h2>
          <p className="mt-1 text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
            {message}
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            <RefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
