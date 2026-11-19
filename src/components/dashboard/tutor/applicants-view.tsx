"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Phone,
  Users,
  X,
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
import { Button } from "@/components/ui/button";
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
import { listTutorApplications, reviewApplication } from "@/lib/api-endpoints";
import { cn } from "@/lib/utils";
import type {
  Application,
  ApplicationListData,
  ApplicationStatus,
} from "@/types/api";

const PAGE_SIZE = 10;

type StatusFilter = "all" | ApplicationStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

type ReviewAction = Extract<ApplicationStatus, "accepted" | "rejected">;

type ReviewTarget = {
  application: Application;
  action: ReviewAction;
};

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

function ApplicantsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading applicants…</span>

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
        <Skeleton className="h-5 w-40" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ApplicantsView() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ListState>({
    status: "loading",
    data: null,
    error: null,
  });
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listTutorApplications({
      page,
      limit: PAGE_SIZE,
      status: filter === "all" ? undefined : filter,
    })
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
  }, [page, filter, reloadKey]);

  const showLoading = useCallback(() => {
    setState({ status: "loading", data: null, error: null });
  }, []);

  const handleRetry = () => {
    showLoading();
    setReloadKey((key) => key + 1);
  };

  const handleFilterChange = (next: StatusFilter) => {
    if (next === filter) return;

    showLoading();
    setFilter(next);
    setPage(1);
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
      pending: pageApplications.filter((item) => item.status === "pending")
        .length,
      accepted: pageApplications.filter((item) => item.status === "accepted")
        .length,
      rejected: pageApplications.filter((item) => item.status === "rejected")
        .length,
    }),
    [pageApplications],
  );

  const handleReviewRequest = (
    application: Application,
    action: ReviewAction,
  ) => {
    if (processingId) return;

    setReviewTarget({ application, action });
  };

  const handleConfirmReview = async () => {
    if (!reviewTarget || processingId) return;

    const { application, action } = reviewTarget;

    setProcessingId(application.id);

    try {
      await reviewApplication(application.id, { status: action });

      toast.success(
        action === "accepted"
          ? "Application accepted"
          : "Application rejected",
      );

      const wasLastOnPage = pageApplications.length === 1;

      setReviewTarget(null);
      showLoading();

      if (wasLastOnPage && page > 1) {
        setPage(page - 1);
      } else {
        setReloadKey((key) => key + 1);
      }
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setProcessingId(null);
    }
  };

  const pagination = state.status === "ready" ? state.data.pagination : null;
  const rangeStart = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const rangeEnd = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  const reviewButtons = (application: Application) => {
    if (application.status !== "pending") {
      return (
        <span className="text-xs text-[#075b55]/40 dark:text-[#f5f5ed]/35">
          —
        </span>
      );
    }

    return (
      <div className="flex items-center justify-end gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={processingId !== null}
          onClick={() => handleReviewRequest(application, "accepted")}
          aria-label={`Accept application from ${application.studentName}`}
          className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
        >
          <Check aria-hidden="true" />
          Accept
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={processingId !== null}
          onClick={() => handleReviewRequest(application, "rejected")}
          aria-label={`Reject application from ${application.studentName}`}
          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <X aria-hidden="true" />
          Reject
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Applicants"
        description="Review students who applied to your tuitions and accept or reject pending applications."
      />

      {state.status === "loading" ? <ApplicantsSkeleton /> : null}

      {state.status === "error" ? (
        <OverviewError
          title="We couldn't load your applicants"
          message={state.error}
          onRetry={handleRetry}
        />
      ) : null}

      {state.status === "ready" && pagination ? (
        <>
          <StatGrid>
            <StatCard
              label={
                filter === "all"
                  ? "Total applications"
                  : `${titleCase(filter)} applications`
              }
              value={pagination.total}
              icon={Users}
              tone="teal"
              hint={filter === "all" ? "Across all tuitions" : "Selected status"}
            />
            <StatCard
              label="Pending on this page"
              value={statusCounts.pending}
              icon={Users}
              tone="amber"
            />
            <StatCard
              label="Accepted on this page"
              value={statusCounts.accepted}
              icon={Check}
              tone="green"
            />
            <StatCard
              label="Rejected on this page"
              value={statusCounts.rejected}
              icon={X}
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
                      ? "No applications for this filter"
                      : `Showing ${rangeStart}–${rangeEnd} of ${pagination.total}`}
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
                      onClick={() => handleFilterChange(value)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50",
                        active
                          ? "bg-[#075b55] text-white ring-[#075b55] dark:bg-[#d5b36a] dark:text-[#0b1f1c] dark:ring-[#d5b36a]"
                          : "bg-white text-[#075b55]/70 ring-[#075b55]/15 hover:bg-[#087f75]/5 dark:bg-transparent dark:text-[#f5f5ed]/65 dark:ring-white/15 dark:hover:bg-white/5",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {pageApplications.length === 0 ? (
              <div className="p-5">
                <EmptyActivity
                  title={
                    filter === "all"
                      ? "No applicants yet"
                      : `No ${filter} applications`
                  }
                  description={
                    filter === "all"
                      ? "When a student applies to one of your tuitions, it will appear here."
                      : "Try another status filter to see more applications."
                  }
                />
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-5">Student</TableHead>
                        <TableHead>Tuition</TableHead>
                        <TableHead>Contact &amp; schedule</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="pr-5 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="max-w-[14rem] pl-5">
                            <p
                              className="truncate font-semibold text-[#075b55] dark:text-[#f5f5ed]"
                              title={application.studentName}
                            >
                              {application.studentName}
                            </p>
                            <p
                              className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50"
                              title={application.studentEmail}
                            >
                              {application.studentEmail}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[14rem]">
                            <p
                              className="truncate font-medium text-[#075b55] dark:text-[#f5f5ed]"
                              title={application.tuitionTitle}
                            >
                              {application.tuitionTitle}
                            </p>
                            <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                              {application.subject}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[14rem]">
                            <span className="flex items-center gap-1.5 text-xs text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                              <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                              <span className="truncate" title={application.studentPhone}>
                                {application.studentPhone}
                              </span>
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50" title={application.preferredSchedule}>
                              {application.preferredSchedule}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[12rem]">
                            {application.studentNote ? (
                              <span
                                className="block truncate text-xs text-[#075b55]/70 dark:text-[#f5f5ed]/65"
                                title={application.studentNote}
                              >
                                {application.studentNote}
                              </span>
                            ) : (
                              <span className="text-xs text-[#075b55]/40 dark:text-[#f5f5ed]/35">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatNumber(application.monthlyFee)}
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(application.appliedAt)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge tone={applicationStatusTone(application.status)}>
                              {titleCase(application.status)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="pr-5 text-right">
                            {reviewButtons(application)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <ul className="space-y-3 p-4 md:hidden">
                  {pageApplications.map((application) => (
                    <li
                      key={application.id}
                      className="rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                            {application.studentName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                            {application.studentEmail}
                          </p>
                        </div>
                        <StatusBadge tone={applicationStatusTone(application.status)}>
                          {titleCase(application.status)}
                        </StatusBadge>
                      </div>

                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#087f75]/5 p-3 dark:bg-white/5">
                        <BookOpen className="mt-0.5 size-4 shrink-0 text-[#087f75] dark:text-[#7fe0d2]" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#075b55] dark:text-[#f5f5ed]">
                            {application.tuitionTitle}
                          </p>
                          <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                            {application.subject}
                          </p>
                        </div>
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div className="min-w-0">
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Phone
                          </dt>
                          <dd className="truncate text-[#075b55]/75 dark:text-[#f5f5ed]/70" title={application.studentPhone}>
                            {application.studentPhone}
                          </dd>
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
                            Preferred schedule
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {application.preferredSchedule}
                          </dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="flex items-center gap-1.5 text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            <CalendarDays className="size-3.5" aria-hidden="true" />
                            Applied
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(application.appliedAt)}
                          </dd>
                        </div>
                        {application.studentNote ? (
                          <div className="col-span-2">
                            <dt className="flex items-center gap-1.5 text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                              <MessageSquareText className="size-3.5" aria-hidden="true" />
                              Student note
                            </dt>
                            <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                              {application.studentNote}
                            </dd>
                          </div>
                        ) : null}
                      </dl>

                      {application.status === "pending" ? (
                        <div className="mt-4 flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={processingId !== null}
                            onClick={() => handleReviewRequest(application, "accepted")}
                            className="flex-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                          >
                            <Check aria-hidden="true" />
                            Accept
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={processingId !== null}
                            onClick={() => handleReviewRequest(application, "rejected")}
                            className="flex-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            <X aria-hidden="true" />
                            Reject
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  ))}
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
        open={reviewTarget !== null}
        onOpenChange={(open) => {
          if (!open && !processingId) {
            setReviewTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewTarget?.action === "accepted"
                ? "Accept this application?"
                : "Reject this application?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewTarget
                ? `${reviewTarget.application.studentName}'s application to ${reviewTarget.application.tuitionTitle} will be ${reviewTarget.action}. This cannot be undone.`
                : "This application will be updated."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingId !== null}>
              Keep pending
            </AlertDialogCancel>
            <AlertDialogAction
              variant={
                reviewTarget?.action === "rejected" ? "destructive" : "default"
              }
              disabled={processingId !== null}
              onClick={handleConfirmReview}
            >
              {processingId
                ? "Saving…"
                : reviewTarget?.action === "accepted"
                  ? "Accept application"
                  : "Reject application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
