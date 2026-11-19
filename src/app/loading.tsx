import { BookOpen } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading page…</span>

      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#075b55] text-white shadow-lg dark:bg-[#087f75]">
        <BookOpen className="size-7 animate-pulse" aria-hidden="true" />
      </span>

      <p className="mt-5 text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
        Loading MentorLagbe…
      </p>

      <div
        aria-hidden="true"
        className="mt-8 w-full max-w-2xl space-y-3 rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#081715]"
      >
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid gap-3 pt-3 sm:grid-cols-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
