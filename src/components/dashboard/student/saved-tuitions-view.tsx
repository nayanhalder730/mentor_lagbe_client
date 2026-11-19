"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookOpen, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from "lucide-react";

import {
  EmptyActivity,
  OverviewError,
  PageHeading,
  StatCard,
  StatGrid,
} from "@/components/dashboard/overview/overview-primitives";
import TuitionCard from "@/components/public/tuition-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api";
import { listSavedTuitions, unsaveTuition } from "@/lib/api-endpoints";
import type { Tuition, TuitionListData } from "@/types/api";

const PAGE_SIZE = 12;

type ListState =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: TuitionListData; error: null };

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Could not update your saved tuitions. Please try again.";
}

function SavedSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading saved tuitions…</span>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-[#075b55]/10 bg-white dark:border-white/10 dark:bg-[#081715]"
          >
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SavedTuitionsView() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ListState>({
    status: "loading",
    data: null,
    error: null,
  });
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listSavedTuitions({ page, limit: PAGE_SIZE })
      .then((data) => {
        if (!active) return;

        setState({ status: "ready", data, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({
          status: "error",
          data: null,
          error: describeError(error),
        });
      });

    return () => {
      active = false;
    };
  }, [page, reloadKey]);

  const showLoading = useCallback(() => {
    setState({ status: "loading", data: null, error: null });
  }, []);

  const handleRetry = () => {
    showLoading();
    setReloadKey((key) => key + 1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;

    showLoading();
    setPage(nextPage);
  };

  const handleRemove = async (tuition: Tuition) => {
    if (removingId) return;

    setRemovingId(tuition.id);

    try {
      await unsaveTuition(tuition.id);

      toast.success("Removed from saved tuitions");
      showLoading();
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setRemovingId(null);
    }
  };

  const pagination = state.status === "ready" ? state.data.pagination : null;
  const tuitions = state.status === "ready" ? state.data.tuitions : [];
  const rangeStart = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const rangeEnd = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Saved tuitions"
        description="Tuitions you saved while browsing, ready to revisit whenever you like."
      />

      {state.status === "loading" ? <SavedSkeleton /> : null}

      {state.status === "error" ? (
        <OverviewError
          title="We couldn't load your saved tuitions"
          message={state.error}
          onRetry={handleRetry}
        />
      ) : null}

      {state.status === "ready" && pagination ? (
        <>
          <StatGrid>
            <StatCard
              label="Saved tuitions"
              value={pagination.total}
              icon={BookOpen}
              tone="teal"
              hint="Approved and active only"
            />
            <StatCard
              label="Showing"
              value={tuitions.length}
              icon={BookOpen}
              tone="gold"
              hint="On this page"
            />
          </StatGrid>

          <section
            aria-labelledby="saved-list-title"
            className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  id="saved-list-title"
                  className="text-base font-semibold text-[#075b55] dark:text-[#f5f5ed]"
                >
                  Your saved list
                </h2>
                <p className="mt-0.5 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                  {pagination.total === 0
                    ? "Nothing saved yet"
                    : `Showing ${rangeStart}–${rangeEnd} of ${pagination.total}`}
                </p>
              </div>
              {pagination.totalPages > 1 ? (
                <span className="text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              ) : null}
            </div>

            {tuitions.length === 0 ? (
              <div className="mt-5">
                <EmptyActivity
                  title="No saved tuitions yet"
                  description="Save a tuition while browsing to keep it here for later."
                  action={
                    <Link
                      href="/tuitions"
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Browse Tuitions
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tuitions.map((tuition) => (
                  <div key={tuition.id} className="relative">
                    <TuitionCard tuition={tuition} />
                    <div className="absolute top-3 right-3 z-10">
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        disabled={removingId !== null}
                        onClick={() => handleRemove(tuition)}
                        aria-label={`Remove ${tuition.title} from saved`}
                        className="bg-white/90 text-red-600 hover:bg-red-50 dark:bg-[#081715]/90 dark:text-red-400"
                      >
                        {removingId === tuition.id ? (
                          <RefreshCw className="animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 aria-hidden="true" />
                        )}
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#075b55]/10 pt-4 dark:border-white/10">
                <p className="text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <ChevronLeft aria-hidden="true" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
