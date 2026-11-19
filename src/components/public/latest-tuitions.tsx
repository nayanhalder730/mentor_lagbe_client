"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  MapPin,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api";
import { listTuitions } from "@/lib/api-endpoints";
import type { Tuition } from "@/types/api";

const numberFormatter = new Intl.NumberFormat("en-US");

type ListState =
  | { status: "loading"; tuitions: Tuition[]; error: null }
  | { status: "error"; tuitions: Tuition[]; error: string }
  | { status: "ready"; tuitions: Tuition[]; error: null };

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Latest tuitions could not be loaded right now. Please try again.";
}

function TuitionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#075b55]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#081715]">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function LatestTuitions() {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ListState>({
    status: "loading",
    tuitions: [],
    error: null,
  });

  useEffect(() => {
    let active = true;

    listTuitions({ page: 1, limit: 6 })
      .then((data) => {
        if (!active) return;

        setState({ status: "ready", tuitions: data.tuitions, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({
          status: "error",
          tuitions: [],
          error: describeError(error),
        });
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setState({ status: "loading", tuitions: [], error: null });
    setReloadKey((key) => key + 1);
  };

  return (
    <section
      id="latest-tuitions"
      aria-labelledby="latest-tuitions-title"
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
            Explore
          </p>
          <h2
            id="latest-tuitions-title"
            className="mt-2 text-3xl font-bold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]"
          >
            Latest approved tuitions
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#075b55]/65 sm:text-base dark:text-[#f5f5ed]/60">
            Real listings from tutors, shown only after admin approval. Find a
            subject, compare the details, and open a tuition to learn more.
          </p>
        </div>

        <Link
          href="/tuitions"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          View all tuitions
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      {state.status === "loading" ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <span className="sr-only">Loading latest tuitions…</span>
          {Array.from({ length: 6 }).map((_, index) => (
            <TuitionCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          role="alert"
          className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-red-500/20 bg-white p-6 shadow-sm sm:flex-row sm:items-center dark:border-red-400/25 dark:bg-[#081715]"
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[#075b55] dark:text-[#f5f5ed]">
              We couldn&apos;t load the latest tuitions
            </h3>
            <p className="mt-1 text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
              {state.error}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <RefreshCw aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : null}

      {state.status === "ready" && state.tuitions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#075b55]/20 p-10 text-center dark:border-white/15">
          <BookOpen
            className="mx-auto size-8 text-[#087f75] dark:text-[#7fe0d2]"
            aria-hidden="true"
          />
          <h3 className="mt-3 text-base font-semibold text-[#075b55] dark:text-[#f5f5ed]">
            No approved tuitions yet
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#075b55]/60 dark:text-[#f5f5ed]/55">
            Once tutors publish and admins approve a listing, it will appear
            here. No sample listings are shown in its place.
          </p>
        </div>
      ) : null}

      {state.status === "ready" && state.tuitions.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {state.tuitions.map((tuition) => (
            <Link
              key={tuition.id}
              href={`/tuitions/${tuition.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#075b55]/10 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:border-white/10 dark:bg-[#081715]"
            >
              <div
                role="img"
                aria-label={`Banner for ${tuition.title}`}
                className="relative h-40 w-full bg-cover bg-center"
                style={
                  tuition.bannerImage
                    ? { backgroundImage: `url("${tuition.bannerImage}")` }
                    : undefined
                }
              >
                {!tuition.bannerImage ? (
                  <div className="flex h-full w-full items-center justify-center bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
                    <BookOpen className="size-9" aria-hidden="true" />
                  </div>
                ) : null}
                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#075b55] shadow-sm dark:bg-[#081715]/90 dark:text-[#f5f5ed]">
                  {tuition.subject}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
                  {tuition.title}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-[#075b55]/65 dark:text-[#f5f5ed]/60">
                  <p className="flex items-center gap-1.5">
                    <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
                    Class {tuition.classLevel} · {tuition.mode}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{tuition.location}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                    {tuition.daysPerWeek} day
                    {tuition.daysPerWeek === 1 ? "" : "s"} per week
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                    Posted {tuition.createdAt ? new Date(tuition.createdAt).toLocaleDateString("en-US") : "—"}
                  </p>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#075b55]/10 pt-4 dark:border-white/10">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                      {tuition.tutorName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-[#075b55] dark:text-[#f5f5ed]">
                      <Wallet className="size-4 text-[#087f75] dark:text-[#7fe0d2]" aria-hidden="true" />
                      {numberFormatter.format(tuition.monthlyFee)}
                      <span className="text-[11px] font-medium text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                        / month
                      </span>
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#087f75] transition-transform group-hover:translate-x-0.5 dark:text-[#7fe0d2]">
                    Details
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
