"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, FileText, Layers, RefreshCw, X } from "lucide-react";

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
import { listAllApplications } from "@/lib/api-endpoints";
import type { AdminApplicationListQuery, Application, ApplicationListData, ApplicationStatus } from "@/types/api";

const PAGE_SIZE = 10;
const STATUSES: Array<ApplicationStatus | ""> = ["", "pending", "accepted", "rejected"];

type ListState =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: ApplicationListData; error: null };

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") return error.message;
  return "Applications could not be loaded right now. Please try again.";
}

function ApplicationRows({ applications }: { applications: Application[] }) {
  return (
    <>
      {applications.map((application) => (
        <TableRow key={application.id}>
          <TableCell className="font-semibold text-[#075b55] dark:text-[#f5f5ed]">
            {application.tuitionTitle}
          </TableCell>
          <TableCell>
            <p className="text-sm font-medium text-[#075b55] dark:text-[#f5f5ed]">
              {application.studentName}
            </p>
            <p className="text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
              {application.studentEmail}
            </p>
          </TableCell>
          <TableCell>
            <p className="text-sm text-[#075b55] dark:text-[#f5f5ed]">
              {application.tutorEmail}
            </p>
          </TableCell>
          <TableCell>
            <StatusBadge tone={applicationStatusTone(application.status)}>
              {titleCase(application.status)}
            </StatusBadge>
          </TableCell>
          <TableCell className="text-xs text-[#075b55]/60 dark:text-[#f5f5ed]/55">
            {formatDate(application.appliedAt)}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function ApplicationsView() {
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ListState>({
    status: "loading",
    data: null,
    error: null,
  });

  const setLoading = () =>
    setState({ status: "loading", data: null, error: null });

  useEffect(() => {
    let active = true;

    const query: AdminApplicationListQuery = { page, limit: PAGE_SIZE };
    if (status) query.status = status;

    listAllApplications(query)
      .then((data) => {
        if (active) setState({ status: "ready", data, error: null });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: "error", data: null, error: describeError(error) });
      });

    return () => {
      active = false;
    };
  }, [status, page, reloadKey]);

  const applications = useMemo(
    () => (state.status === "ready" ? state.data.applications : []),
    [state],
  );
  const pagination = state.status === "ready" ? state.data.pagination : null;
  const counts = useMemo(() => {
    const list = applications;
    return {
      total: pagination?.total ?? 0,
      pending: list.filter((item) => item.status === "pending").length,
      accepted: list.filter((item) => item.status === "accepted").length,
      rejected: list.filter((item) => item.status === "rejected").length,
    };
  }, [applications, pagination]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Applications"
        description="Review every student application and its current status across all tutors."
      />

      <StatGrid>
        <StatCard label="Total applications" value={formatNumber(counts.total)} icon={Layers} />
        <StatCard label="Pending (page)" value={formatNumber(counts.pending)} icon={FileText} />
        <StatCard label="Accepted (page)" value={formatNumber(counts.accepted)} icon={Check} />
        <StatCard label="Rejected (page)" value={formatNumber(counts.rejected)} icon={X} />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((value) => (
          <Button
            key={value || "all"}
            type="button"
            size="sm"
            variant={status === value ? "default" : "outline"}
            onClick={() => {
              setLoading();
              setStatus(value);
              setPage(1);
            }}
            className={status === value ? "bg-[#075b55] text-white" : undefined}
          >
            {value ? titleCase(value) : "All"}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setLoading();
            setReloadKey((key) => key + 1);
          }}
          aria-label="Refresh applications"
        >
          <RefreshCw aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {state.status === "loading" ? (
        <div className="space-y-2" role="status" aria-live="polite">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <OverviewError
          title="Applications unavailable"
          message={state.error}
          onRetry={() => {
            setLoading();
            setReloadKey((key) => key + 1);
          }}
        />
      ) : null}

      {state.status === "ready" && applications.length === 0 ? (
        <EmptyActivity
          title="No applications found"
          description="No applications match the selected status."
        />
      ) : null}

      {state.status === "ready" && applications.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-[#075b55]/10 bg-white lg:block dark:border-white/10 dark:bg-[#081715]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tuition</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Tutor email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <ApplicationRows applications={applications} />
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 lg:hidden">
            {applications.map((application) => (
              <li
                key={application.id}
                className="rounded-2xl border border-[#075b55]/10 bg-white p-4 dark:border-white/10 dark:bg-[#081715]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                    {application.tuitionTitle}
                  </p>
                  <StatusBadge tone={applicationStatusTone(application.status)}>
                    {titleCase(application.status)}
                  </StatusBadge>
                </div>
                <p className="mt-2 text-xs text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                  {application.studentName} · {application.studentEmail}
                </p>
                <p className="text-xs text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                  Tutor: {application.tutorEmail}
                </p>
                <p className="mt-1 text-[11px] text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                  {formatDate(application.appliedAt)}
                </p>
              </li>
            ))}
          </ul>

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#075b55]/10 bg-white p-4 dark:border-white/10 dark:bg-[#081715]">
              <p className="text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => {
                    setLoading();
                    setPage((value) => value - 1);
                  }}
                >
                  <ChevronLeft aria-hidden="true" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => {
                    setLoading();
                    setPage((value) => value + 1);
                  }}
                >
                  Next
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
