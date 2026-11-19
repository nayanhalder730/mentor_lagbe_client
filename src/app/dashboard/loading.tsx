import { LayoutDashboard } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center"
    >
      <span className="sr-only">Loading dashboard…</span>

      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#075b55] text-white dark:bg-[#087f75]">
        <LayoutDashboard className="size-6 animate-pulse" aria-hidden="true" />
      </span>

      <p className="mt-4 text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
        Loading your dashboard…
      </p>

      <div aria-hidden="true" className="mt-6 w-full max-w-2xl space-y-3">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-5/6" />
      </div>
    </div>
  );
}
