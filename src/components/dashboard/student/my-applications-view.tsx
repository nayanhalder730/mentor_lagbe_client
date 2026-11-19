"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
  Trash2,
} from "lucide-react";

import {
  applicationStatusTone,
  EmptyActivity,
  formatDate,
  formatNumber,
  OverviewError,
  PageHeading,
  StatCard,
  StatGrid,
  StatusBadge,
  titleCase,
} from "@/components/dashboard/overview/overview-primitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isApiError } from "@/lib/api";
import { cancelApplication, listMyApplications } from "@/lib/api-endpoints";
import { cn } from "@/lib/utils";
import type { Application, ApplicationListData, ApplicationStatus } from "@/types/api";

const PAGE_SIZE = 10;

type StatusFilter = "all" | ApplicationStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

type ListState =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: ApplicationListData; error: null };

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

/** Uses the real tutor name when present, otherwise the stored tutor email. */
function getTutorDisplayName(application: Application) {
  const name = application.tutorName?.trim();

  return name ? name : application.tutorEmail;
}

function ApplicationsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading applications…</span>

      <div
        aria-hidden="true"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
      >
        <Skeleton className="h-5 w-36" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyApplicationsView() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [state, setState] = useState<ListState>({
    status: "loading",
    data: null,
    error: null,
  });
  const [pendingCancel, setPendingCancel] = useState<Application | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listMyApplications({ page, limit: PAGE_SIZE })
      .then((data) => {
        if (!active) return;

        setState({ status: "ready", data, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({ status: "error", data: null, error: describeError(error) });
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

  const pageApplications = useMemo(
    () => (state.status === "ready" ? state.data.applications : []),
    [state],
  );

  const statusCounts = useMemo(
    () => ({
      all: pageApplications.length,
      pending: pageApplications.filter((item) => item.status === "pending")
        .length,
      accepted: pageApplications.filter((item) => item.status === "accepted")
        .length,
      rejected: pageApplications.filter((item) => item.status === "rejected")
        .length,
    }),
    [pageApplications],
  );

  const visibleApplications = useMemo(
    () =>
      filter === "all"
        ? pageApplications
        : pageApplications.filter((item) => item.status === filter),
    [filter, pageApplications],
  );

  const handleCancelRequest = (application: Application) => {
    if (cancellingId) return;

    setPendingCancel(application);
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancel || cancellingId) return;

    const applicationId = pendingCancel.id;

    setCancellingId(applicationId);

    try {
      await cancelApplication(applicationId);

      toast.success("Application cancelled");

      const wasLastOnPage = pageApplications.length === 1;

      setPendingCancel(null);
      showLoading();

      if (wasLastOnPage && page > 1) {
        setPage(page - 1);
      } else {
        setReloadKey((key) => key + 1);
      }
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setCancellingId(null);
    }
  };

  const pagination = state.status === "ready" ? state.data.pagination : null;
  const rangeStart = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const rangeEnd = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="My applications"
        description="Review the tuitions you applied to and cancel any application that is still pending."
      />

      {state.status === "loading" ? <ApplicationsSkeleton /> : null}

      {state.status === "error" ? (
        <OverviewError
          title="We couldn't load your applications"
          message={state.error}
          onRetry={handleRetry}
        />
      ) : null}

      {state.status === "ready" && pagination ? (
        <>
          <StatGrid>
            <StatCard
              label="Total applications"
              value={pagination.total}
              icon={FileText}
              tone="teal"
              hint="Across all pages"
            />
            <StatCard
              label="Pending on this page"
              value={statusCounts.pending}
              icon={FileText}
              tone="amber"
            />
            <StatCard
              label="Accepted on this page"
              value={statusCounts.accepted}
              icon={FileText}
              tone="green"
            />
            <StatCard
              label="Rejected on this page"
              value={statusCounts.rejected}
              icon={FileText}
              tone="red"
            />
          </StatGrid>

          <section className="rounded-2xl border border-[#075b55]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#081715]">
            <div className="flex flex-col gap-4 border-b border-[#075b55]/10 p-5 dark:border-white/10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
                    Applications
                  </h2>
                  <p className="mt-0.5 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                    {pagination.total === 0
                      ? "No applications yet"
                      : `Showing ${rangeStart}–${rangeEnd} of ${pagination.total}`}
                    {" · "}Status filters apply to this page only.
                  </p>
                </div>
                <span className="text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>

              <div
                role="group"
                aria-label="Filter applications by status"
                className="flex flex-wrap gap-2"
              >
                {FILTERS.map(({ value, label }) => {
                  const active = filter === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(value)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50",
                        active
                          ? "bg-[#075b55] text-white ring-[#075b55] dark:bg-[#d5b36a] dark:text-[#0b1f1c] dark:ring-[#d5b36a]"
                          : "bg-white text-[#075b55]/70 ring-[#075b55]/15 hover:bg-[#087f75]/5 dark:bg-transparent dark:text-[#f5f5ed]/65 dark:ring-white/15 dark:hover:bg-white/5",
                      )}
                    >
                      {label}
                      <span className="ml-1 opacity-70">
                        ({statusCounts[value]})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {pageApplications.length === 0 ? (
              <div className="p-5">
                <EmptyActivity
                  title="No applications yet"
                  description="When you apply to a tuition, it will appear here."
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
            ) : visibleApplications.length === 0 ? (
              <div className="p-5">
                <EmptyActivity
                  title={`No ${filter} applications on this page`}
                  description="Try another status filter or move to a different page."
                />
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-5">Tuition</TableHead>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Monthly fee</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="pr-5 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleApplications.map((application) => {
                        const tutorName = getTutorDisplayName(application);

                        return (
                        <TableRow key={application.id}>
                          <TableCell className="max-w-xs pl-5">
                            <p
                              className="truncate font-semibold text-[#075b55] dark:text-[#f5f5ed]"
                              title={application.tuitionTitle}
                            >
                              {application.tuitionTitle}
                            </p>
                            <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                              {application.subject}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-xs text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                              <span className="min-w-0">
                                <span
                                  className="block truncate font-medium"
                                  title={tutorName}
                                >
                                  {tutorName}
                                </span>
                                {tutorName !== application.tutorEmail ? (
                                  <span
                                    className="block truncate text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45"
                                    title={application.tutorEmail}
                                  >
                                    {application.tutorEmail}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatNumber(application.monthlyFee)}
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(application.appliedAt)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              tone={applicationStatusTone(application.status)}
                            >
                              {titleCase(application.status)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="pr-5 text-right">
                            {application.status === "pending" ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={cancellingId !== null}
                                onClick={() => handleCancelRequest(application)}
                                aria-label={`Cancel application to ${application.tuitionTitle}`}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                              >
                                <Trash2 aria-hidden="true" />
                                Cancel
                              </Button>
                            ) : (
                              <span className="text-xs text-[#075b55]/40 dark:text-[#f5f5ed]/35">
                                —
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <ul className="space-y-3 p-4 md:hidden">
                  {visibleApplications.map((application) => {
                    const tutorName = getTutorDisplayName(application);

                    return (
                    <li
                      key={application.id}
                      className="rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                            {application.tuitionTitle}
                          </p>
                          <p className="mt-0.5 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                            {application.subject}
                          </p>
                        </div>
                        <StatusBadge tone={applicationStatusTone(application.status)}>
                          {titleCase(application.status)}
                        </StatusBadge>
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div className="min-w-0">
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Tutor
                          </dt>
                          <dd className="truncate text-[#075b55]/75 dark:text-[#f5f5ed]/70" title={tutorName}>
                            {tutorName}
                          </dd>
                          {tutorName !== application.tutorEmail ? (
                            <dd className="truncate text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45" title={application.tutorEmail}>
                              {application.tutorEmail}
                            </dd>
                          ) : null}
                        </div>
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Monthly fee
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatNumber(application.monthlyFee)}
                          </dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Applied
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(application.appliedAt)}
                          </dd>
                        </div>
                      </dl>

                      {application.status === "pending" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={cancellingId !== null}
                          onClick={() => handleCancelRequest(application)}
                          className="mt-3 w-full text-red-600 dark:text-red-400"
                        >
                          <Trash2 aria-hidden="true" />
                          Cancel application
                        </Button>
                      ) : null}
                    </li>
                    );
                  })}
                </ul>
              </>
            )}

            {pagination.totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#075b55]/10 px-5 py-4 dark:border-white/10">
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

      <AlertDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => {
          if (!open && !cancellingId) {
            setPendingCancel(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingCancel
                ? `Your application to ${pendingCancel.tuitionTitle} will be removed. This cannot be undone.`
                : "This application will be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancellingId !== null}>
              Keep application
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancellingId !== null}
              onClick={handleConfirmCancel}
            >
              {cancellingId ? "Cancelling…" : "Cancel application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
