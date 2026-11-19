"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleCheck,
  Clock,
  Receipt,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  EmptyActivity,
  formatCurrency,
  formatDate,
  OverviewError,
  PageHeading,
  paymentStatusTone,
  roleTone,
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
import { listAllPayments } from "@/lib/api-endpoints";
import type { PaymentListData } from "@/types/api";

const PAGE_SIZE = 10;

type ListState =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: PaymentListData; error: null };

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Could not load transactions. Please try again.";
}

function TransactionsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading transactions…</span>

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

export default function TransactionsView() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ListState>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;

    listAllPayments({ page, limit: PAGE_SIZE })
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

  const payments = useMemo(
    () => (state.status === "ready" ? state.data.payments : []),
    [state],
  );

  const pageCounts = useMemo(
    () => ({
      paid: payments.filter((item) => item.paymentStatus === "paid").length,
      other: payments.filter((item) => item.paymentStatus !== "paid").length,
    }),
    [payments],
  );

  const pagination = state.status === "ready" ? state.data.pagination : null;
  const rangeStart = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const rangeEnd = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  const amountCell = (payment: (typeof payments)[number]) => (
    <div>
      <p className="font-semibold text-[#075b55] dark:text-[#f5f5ed]">
        {formatCurrency(payment.amount, payment.currency)}
      </p>
      <p className="text-[11px] text-[#075b55]/45 uppercase dark:text-[#f5f5ed]/40">
        {payment.currency}
      </p>
    </div>
  );

  const idCell = (payment: (typeof payments)[number]) => (
    <div className="space-y-0.5 text-[11px]">
      <p className="text-[#075b55]/65 dark:text-[#f5f5ed]/60">
        <span className="mr-1">Txn</span>
        <span className="font-mono" title={payment.transactionId ?? undefined}>
          {payment.transactionId ?? "—"}
        </span>
      </p>
      {payment.stripeSessionId ? (
        <p className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
          <span className="mr-1">Session</span>
          <span
            className="font-mono"
            title={payment.stripeSessionId}
          >
            {payment.stripeSessionId}
          </span>
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Transactions"
        description="Verified subscription payments recorded by the billing system."
      />

      {state.status === "loading" ? <TransactionsSkeleton /> : null}

      {state.status === "error" ? (
        <OverviewError
          title="We couldn't load transactions"
          message={state.error}
          onRetry={handleRetry}
        />
      ) : null}

      {state.status === "ready" && pagination ? (
        <>
          <StatGrid>
            <StatCard
              label="Total transactions"
              value={pagination.total}
              icon={Receipt}
              tone="teal"
              hint="All records (from pagination)"
            />
            <StatCard
              label="Records on this page"
              value={payments.length}
              icon={Wallet}
              tone="gold"
            />
            <StatCard
              label="Paid on this page"
              value={pageCounts.paid}
              icon={CircleCheck}
              tone="green"
            />
            <StatCard
              label="Other statuses on this page"
              value={pageCounts.other}
              icon={Clock}
              tone="amber"
            />
          </StatGrid>

          <section className="rounded-2xl border border-[#075b55]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#081715]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#075b55]/10 p-5 dark:border-white/10">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
                  Payment records
                </h2>
                <p className="mt-0.5 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                  {pagination.total === 0
                    ? "No transactions recorded"
                    : `Showing ${rangeStart}–${rangeEnd} of ${pagination.total}`}
                </p>
              </div>
              <span className="text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="p-5">
                <EmptyActivity
                  title="No transactions yet"
                  description="Verified payments will appear here once a subscription is completed."
                />
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-5">User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>References</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="max-w-[14rem] pl-5">
                            <p
                              className="truncate font-semibold text-[#075b55] dark:text-[#f5f5ed]"
                              title={payment.userName}
                            >
                              {payment.userName}
                            </p>
                            <p
                              className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50"
                              title={payment.userEmail}
                            >
                              {payment.userEmail}
                            </p>
                            <div className="mt-1">
                              <StatusBadge tone={roleTone(payment.userRole)}>
                                {titleCase(payment.userRole)}
                              </StatusBadge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {payment.planName}
                          </TableCell>
                          <TableCell>{amountCell(payment)}</TableCell>
                          <TableCell>
                            <StatusBadge tone={paymentStatusTone(payment.paymentStatus)}>
                              {titleCase(payment.paymentStatus)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(payment.paidAt)}
                          </TableCell>
                          <TableCell className="max-w-[14rem]">
                            {idCell(payment)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <ul className="space-y-3 p-4 md:hidden">
                  {payments.map((payment) => (
                    <li
                      key={payment.id}
                      className="rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                            {payment.userName}
                          </p>
                          <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                            {payment.userEmail}
                          </p>
                        </div>
                        <StatusBadge tone={paymentStatusTone(payment.paymentStatus)}>
                          {titleCase(payment.paymentStatus)}
                        </StatusBadge>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge tone={roleTone(payment.userRole)}>
                          {titleCase(payment.userRole)}
                        </StatusBadge>
                        <span className="text-xs text-[#075b55]/65 dark:text-[#f5f5ed]/60">
                          {payment.planName}
                        </span>
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Amount
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatCurrency(payment.amount, payment.currency)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Paid
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(payment.paidAt)}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-3 border-t border-[#075b55]/10 pt-3 dark:border-white/10">
                        {idCell(payment)}
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
    </div>
  );
}
