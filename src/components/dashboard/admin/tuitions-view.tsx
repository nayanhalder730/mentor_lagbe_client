"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  approvalStatusTone,
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
import { Input } from "@/components/ui/input";
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
import {
  adminDeleteTuition,
  listAdminTuitions,
  reviewTuitionApproval,
  setTuitionActive,
} from "@/lib/api-endpoints";
import { cn } from "@/lib/utils";
import type {
  ApprovalStatus,
  Tuition,
  TuitionListData,
} from "@/types/api";

const PAGE_SIZE = 10;

type StatusFilter = "all" | ApprovalStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type ModerationAction =
  | {
      kind: "approval";
      tuition: Tuition;
      approvalStatus: Extract<ApprovalStatus, "approved" | "rejected">;
    }
  | { kind: "status"; tuition: Tuition; isActive: boolean };

type ListState =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: TuitionListData; error: null };

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "The request could not be completed. Please try again.";
}

function shouldRefreshAfterError(error: unknown) {
  return isApiError(error) && (error.status === 404 || error.status === 409);
}

function TuitionsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading tuitions…</span>

      <div
        aria-hidden="true"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
          >
            <Skeleton className="h-4 w-24" />
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
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminTuitionsView() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ListState>({
    status: "loading",
    data: null,
    error: null,
  });
  const [action, setAction] = useState<ModerationAction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tuition | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listAdminTuitions({
      page,
      limit: PAGE_SIZE,
      approvalStatus: filter === "all" ? undefined : filter,
      search: search === "" ? undefined : search,
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
  }, [page, filter, search, reloadKey]);

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

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextSearch = searchInput.trim();

    if (nextSearch === search) return;

    showLoading();
    setSearch(nextSearch);
    setPage(1);
  };

  const handleClearSearch = () => {
    if (searchInput === "" && search === "") return;

    showLoading();
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;

    showLoading();
    setPage(nextPage);
  };

  const applyUpdatedTuition = useCallback((updated: Tuition) => {
    setState((current) =>
      current.status === "ready"
        ? {
            ...current,
            data: {
              ...current.data,
              tuitions: current.data.tuitions.map((item) =>
                item.id === updated.id ? updated : item,
              ),
            },
          }
        : current,
    );
  }, []);

  const handleConfirmAction = async () => {
    if (!action || processingId) return;

    const tuitionId = action.tuition.id;

    setProcessingId(tuitionId);

    try {
      const updated =
        action.kind === "approval"
          ? await reviewTuitionApproval(tuitionId, {
              approvalStatus: action.approvalStatus,
            })
          : await setTuitionActive(tuitionId, { isActive: action.isActive });

      applyUpdatedTuition(updated);
      toast.success(
        action.kind === "approval"
          ? action.approvalStatus === "approved"
            ? "Tuition approved"
            : "Tuition rejected"
          : action.isActive
            ? "Tuition activated"
            : "Tuition deactivated",
      );
      setAction(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(describeError(error));

      if (shouldRefreshAfterError(error)) {
        setReloadKey((key) => key + 1);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || processingId) return;

    setProcessingId(deleteTarget.id);

    try {
      await adminDeleteTuition(deleteTarget.id);
      toast.success("Tuition deleted successfully");
      setDeleteTarget(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(describeError(error));
      setReloadKey((key) => key + 1);
    } finally {
      setProcessingId(null);
    }
  };

  const tuitions = useMemo(
    () => (state.status === "ready" ? state.data.tuitions : []),
    [state],
  );

  const counts = useMemo(
    () => ({
      pending: tuitions.filter((item) => item.approvalStatus === "pending")
        .length,
      approved: tuitions.filter((item) => item.approvalStatus === "approved")
        .length,
      rejected: tuitions.filter((item) => item.approvalStatus === "rejected")
        .length,
      active: tuitions.filter((item) => item.isActive).length,
    }),
    [tuitions],
  );

  const pagination = state.status === "ready" ? state.data.pagination : null;
  const rangeStart = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const rangeEnd = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  const moderationButtons = (tuition: Tuition) => {
    if (tuition.approvalStatus === "pending") {
      return (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={processingId !== null}
            onClick={() =>
              setAction({
                kind: "approval",
                tuition,
                approvalStatus: "approved",
              })
            }
            className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
          >
            <Check aria-hidden="true" />
            Approve
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={processingId !== null}
            onClick={() =>
              setAction({
                kind: "approval",
                tuition,
                approvalStatus: "rejected",
              })
            }
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <X aria-hidden="true" />
            Reject
          </Button>
        </div>
      );
    }

    if (tuition.approvalStatus === "approved") {
      return (
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={processingId !== null}
          onClick={() =>
            setAction({
              kind: "status",
              tuition,
              isActive: !tuition.isActive,
            })
          }
        >
          {processingId === tuition.id ? (
            <RefreshCw className="animate-spin" aria-hidden="true" />
          ) : null}
          {tuition.isActive ? "Deactivate" : "Activate"}
        </Button>
      );
    }

    return (
      <span className="text-[11px] text-[#075b55]/45 dark:text-[#f5f5ed]/40">
        Rejected — no moderation actions
      </span>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Tuitions"
        description="Review pending posts, approve or reject them, and manage active listings."
      />

      {state.status === "loading" ? <TuitionsSkeleton /> : null}

      {state.status === "error" ? (
        <OverviewError
          title="We couldn't load tuitions"
          message={state.error}
          onRetry={handleRetry}
        />
      ) : null}

      {state.status === "ready" && pagination ? (
        <>
          <StatGrid>
            <StatCard
              label={filter === "all" ? "Total tuitions" : `${titleCase(filter)} results`}
              value={pagination.total}
              icon={BookOpen}
              tone="teal"
              hint={filter === "all" ? "All submitted posts" : "Selected filter"}
            />
            <StatCard
              label="Pending on this page"
              value={counts.pending}
              icon={BookOpen}
              tone="amber"
            />
            <StatCard
              label="Approved on this page"
              value={counts.approved}
              icon={BookOpen}
              tone="green"
            />
            <StatCard
              label="Rejected on this page"
              value={counts.rejected}
              icon={BookOpen}
              tone="red"
            />
            <StatCard
              label="Active on this page"
              value={counts.active}
              icon={BookOpen}
              tone="gold"
            />
          </StatGrid>

          <section className="rounded-2xl border border-[#075b55]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#081715]">
            <div className="flex flex-col gap-4 border-b border-[#075b55]/10 p-5 dark:border-white/10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
                    Tuition moderation
                  </h2>
                  <p className="mt-0.5 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                    {pagination.total === 0
                      ? "No tuitions match this filter"
                      : `Showing ${rangeStart}–${rangeEnd} of ${pagination.total}`}
                  </p>
                </div>
                <span className="text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#075b55]/40 dark:text-[#f5f5ed]/40"
                      aria-hidden="true"
                    />
                    <Input
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search title, subject, tutor"
                      aria-label="Search tuitions"
                      className="w-full pl-8 sm:w-64"
                    />
                  </div>
                  <Button type="submit" size="sm" variant="outline">
                    Search
                  </Button>
                  {search || searchInput ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleClearSearch}
                      aria-label="Clear search"
                    >
                      <X aria-hidden="true" />
                    </Button>
                  ) : null}
                </form>

                <div
                  role="group"
                  aria-label="Filter tuitions by approval status"
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
            </div>

            {tuitions.length === 0 ? (
              <div className="p-5">
                <EmptyActivity
                  title={search ? "No matching tuitions" : "No tuitions found"}
                  description={
                    search
                      ? "Try a different search term or approval filter."
                      : "Submitted tuitions will appear here for review."
                  }
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
                        <TableHead>Details</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Approval</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="pr-5 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tuitions.map((tuition) => (
                        <TableRow key={tuition.id}>
                          <TableCell className="max-w-[13rem] pl-5">
                            <p
                              className="truncate font-semibold text-[#075b55] dark:text-[#f5f5ed]"
                              title={tuition.title}
                            >
                              {tuition.title}
                            </p>
                            <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                              {tuition.subject}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[13rem]">
                            <p
                              className="truncate text-sm text-[#075b55] dark:text-[#f5f5ed]"
                              title={tuition.tutorName}
                            >
                              {tuition.tutorName}
                            </p>
                            <p
                              className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50"
                              title={tuition.tutorEmail ?? undefined}
                            >
                              {tuition.tutorEmail}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[14rem] text-xs text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                            <p>
                              Class {tuition.classLevel} · {tuition.mode}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5">
                              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                              <span className="truncate" title={tuition.location}>
                                {tuition.location}
                              </span>
                            </p>
                            <p className="mt-0.5">
                              {tuition.daysPerWeek} day
                              {tuition.daysPerWeek === 1 ? "" : "s"} / week
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatNumber(tuition.monthlyFee)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge tone={approvalStatusTone(tuition.approvalStatus)}>
                              {titleCase(tuition.approvalStatus)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              tone={tuition.isActive ? "green" : "neutral"}
                            >
                              {tuition.isActive ? "Active" : "Inactive"}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(tuition.createdAt)}
                          </TableCell>
                          <TableCell className="pr-5 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {moderationButtons(tuition)}
                            <Button
                              type="button"
                              size="xs"
                              variant="ghost"
                              disabled={processingId !== null}
                              onClick={() => setDeleteTarget(tuition)}
                              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                              aria-label={`Delete ${tuition.title}`}
                            >
                              <Trash2 aria-hidden="true" />
                              Delete
                            </Button>
                          </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <ul className="space-y-3 p-4 md:hidden">
                  {tuitions.map((tuition) => (
                    <li
                      key={tuition.id}
                      className="rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                            {tuition.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                            {tuition.subject}
                          </p>
                        </div>
                        <StatusBadge tone={approvalStatusTone(tuition.approvalStatus)}>
                          {titleCase(tuition.approvalStatus)}
                        </StatusBadge>
                      </div>

                      <p className="mt-2 truncate text-xs text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                        {tuition.tutorName} · {tuition.tutorEmail}
                      </p>

                      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Class level
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {tuition.classLevel}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Mode
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {tuition.mode}
                          </dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Location
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {tuition.location}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Monthly fee
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatNumber(tuition.monthlyFee)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Days / week
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {tuition.daysPerWeek}
                          </dd>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5 text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                          <CalendarDays className="size-3.5" aria-hidden="true" />
                          Created {formatDate(tuition.createdAt)}
                        </div>
                      </dl>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge
                          tone={tuition.isActive ? "green" : "neutral"}
                        >
                          {tuition.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </div>

                      <div className="mt-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {moderationButtons(tuition)}
                            <Button
                              type="button"
                              size="xs"
                              variant="ghost"
                              disabled={processingId !== null}
                              onClick={() => setDeleteTarget(tuition)}
                              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                              aria-label={`Delete ${tuition.title}`}
                            >
                              <Trash2 aria-hidden="true" />
                              Delete
                            </Button>
                          </div>
                      </div>
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
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !processingId) {
            setAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action?.kind === "approval"
                ? action.approvalStatus === "approved"
                  ? "Approve this tuition?"
                  : "Reject this tuition?"
                : action?.isActive
                  ? "Activate this tuition?"
                  : "Deactivate this tuition?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action
                ? `"${action.tuition.title}" by ${action.tuition.tutorName} will be ${
                    action.kind === "approval"
                      ? action.approvalStatus
                      : action.isActive
                        ? "activated"
                        : "deactivated"
                  }.`
                : "This tuition will be updated."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant={
                action?.kind === "approval" && action.approvalStatus === "rejected"
                  ? "destructive"
                  : "default"
              }
              disabled={processingId !== null}
              onClick={handleConfirmAction}
            >
              {processingId ? "Saving…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !processingId) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tuition?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.title}" and its applications and saved-tuition references will be removed from the database. This cannot be undone.`
                : "This tuition will be permanently removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={processingId !== null}
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {processingId ? "Deleting…" : "Delete tuition"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
