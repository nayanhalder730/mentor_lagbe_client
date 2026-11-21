"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import TuitionCard from "@/components/public/tuition-card";
import SaveTuitionButton from "@/components/public/save-tuition-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api";
import { listTuitions } from "@/lib/api-endpoints";
import type {
  Tuition,
  TuitionListData,
  TuitionListQuery,
  TuitionMode,
} from "@/types/api";

const PAGE_SIZE = 12;
const MAX_FEE = 1000000;

const TEXT_LIMITS = {
  search: 100,
  subject: 80,
  classLevel: 50,
  location: 120,
} as const;

type BrowseFilters = {
  search: string;
  subject: string;
  classLevel: string;
  mode: "" | TuitionMode;
  location: string;
  minFee: string;
  maxFee: string;
  page: number;
};

type DraftFilters = Omit<BrowseFilters, "page">;

type ListState =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: TuitionListData; error: null };

function readText(value: string | null, max: number) {
  return value ? value.trim().slice(0, max) : "";
}

function readFee(value: string | null) {
  if (!value || value.trim() === "") return "";

  const parsed = Number(value.trim());

  return Number.isFinite(parsed) && parsed >= 0 && parsed <= MAX_FEE
    ? String(parsed)
    : "";
}

function readPage(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return 1;

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

/** Compact page list: first, last, and a window around the current page. */
function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis-start");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis-end");
  items.push(total);

  return items;
}

function parseFilters(queryString: string): BrowseFilters {
  const params = new URLSearchParams(queryString);
  const mode = params.get("mode");

  return {
    search: readText(params.get("search"), TEXT_LIMITS.search),
    subject: readText(params.get("subject"), TEXT_LIMITS.subject),
    classLevel: readText(params.get("classLevel"), TEXT_LIMITS.classLevel),
    mode: mode === "Online" || mode === "Offline" ? mode : "",
    location: readText(params.get("location"), TEXT_LIMITS.location),
    minFee: readFee(params.get("minFee")),
    maxFee: readFee(params.get("maxFee")),
    page: readPage(params.get("page")),
  };
}

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Tuitions could not be loaded right now. Please try again.";
}

function ResultsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid gap-5 sm:grid-cols-2">
      <span className="sr-only">Loading tuitions…</span>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[#075b55]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#081715]"
        >
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterPanel({
  initial,
  onApply,
  onClear,
}: {
  initial: BrowseFilters;
  onApply: (changes: Record<string, string | number>) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState<DraftFilters>({
    search: initial.search,
    subject: initial.subject,
    classLevel: initial.classLevel,
    mode: initial.mode,
    location: initial.location,
    minFee: initial.minFee,
    maxFee: initial.maxFee,
  });
  const [open, setOpen] = useState(false);

  const update = (key: keyof DraftFilters, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onApply({
      search: draft.search.trim().slice(0, TEXT_LIMITS.search),
      subject: draft.subject.trim().slice(0, TEXT_LIMITS.subject),
      classLevel: draft.classLevel.trim().slice(0, TEXT_LIMITS.classLevel),
      mode: draft.mode,
      location: draft.location.trim().slice(0, TEXT_LIMITS.location),
      minFee: draft.minFee,
      maxFee: draft.maxFee,
    });
    setOpen(false);
  };

  const handleClearSearch = () => {
    update("search", "");
    onApply({ search: "" });
  };

  return (
    <div className="rounded-2xl border border-[#075b55]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#081715]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="browse-filters"
        className="flex w-full items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-[#075b55] lg:hidden dark:text-[#f5f5ed]"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters &amp; search
        </span>
        <span className="text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      <form
        id="browse-filters"
        onSubmit={handleSubmit}
        className={`${open ? "block" : "hidden"} border-t border-[#075b55]/10 p-5 lg:block lg:border-t-0 dark:border-white/10`}
      >
        <div className="hidden lg:block">
          <h2 className="text-base font-bold text-[#075b55] dark:text-[#f5f5ed]">
            Refine results
          </h2>
          <p className="mt-1 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
            All filters are applied by the backend together.
          </p>
        </div>

        <div className="mt-5 space-y-4 lg:mt-6">
          <div className="space-y-1.5">
            <Label htmlFor="browse-search">Search</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#075b55]/40"
                aria-hidden="true"
              />
              <Input
                id="browse-search"
                type="search"
                value={draft.search}
                maxLength={TEXT_LIMITS.search}
                onChange={(event) => update("search", event.target.value)}
                placeholder="Title or subject"
                className="pl-8 pr-8"
              />
              {draft.search ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-[#075b55]/50 hover:text-[#075b55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:text-[#f5f5ed]/50"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="browse-subject">Subject</Label>
            <Input
              id="browse-subject"
              value={draft.subject}
              maxLength={TEXT_LIMITS.subject}
              onChange={(event) => update("subject", event.target.value)}
              placeholder="e.g. Mathematics"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="browse-class-level">Class level</Label>
            <Input
              id="browse-class-level"
              value={draft.classLevel}
              maxLength={TEXT_LIMITS.classLevel}
              onChange={(event) => update("classLevel", event.target.value)}
              placeholder="e.g. HSC"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="browse-mode">Mode</Label>
            <select
              id="browse-mode"
              value={draft.mode}
              onChange={(event) => update("mode", event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">Any mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="browse-location">Location</Label>
            <Input
              id="browse-location"
              value={draft.location}
              maxLength={TEXT_LIMITS.location}
              onChange={(event) => update("location", event.target.value)}
              placeholder="e.g. Dhaka"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="browse-min-fee">Min fee</Label>
              <Input
                id="browse-min-fee"
                type="number"
                min={0}
                max={MAX_FEE}
                value={draft.minFee}
                onChange={(event) => update("minFee", event.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="browse-max-fee">Max fee</Label>
              <Input
                id="browse-max-fee"
                type="number"
                min={0}
                max={MAX_FEE}
                value={draft.maxFee}
                onChange={(event) => update("maxFee", event.target.value)}
                placeholder="Any"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button type="submit" className="w-full bg-[#075b55] text-white hover:bg-[#0b6b62]">
            Apply filters
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className="w-full text-[#075b55] dark:text-[#f5f5ed]"
          >
            <RefreshCw aria-hidden="true" />
            Clear all filters
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function BrowseTuitionsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const filters = useMemo(() => parseFilters(queryString), [queryString]);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ListState>({
    status: "loading",
    data: null,
    error: null,
  });

  const query = useMemo<TuitionListQuery>(
    () => ({
      page: filters.page,
      limit: PAGE_SIZE,
      search: filters.search || undefined,
      subject: filters.subject || undefined,
      classLevel: filters.classLevel || undefined,
      mode: filters.mode || undefined,
      location: filters.location || undefined,
      minFee: filters.minFee === "" ? undefined : Number(filters.minFee),
      maxFee: filters.maxFee === "" ? undefined : Number(filters.maxFee),
    }),
    [filters],
  );

  useEffect(() => {
    let active = true;

    listTuitions(query)
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
  }, [query, reloadKey]);

  // Keep the URL canonical so invalid values never reach the backend and
  // back/forward navigation restores a clean, shareable state.
  useEffect(() => {
    const raw = new URLSearchParams(queryString);
    const next = new URLSearchParams();

    for (const [key, max] of Object.entries(TEXT_LIMITS)) {
      const value = readText(raw.get(key), max);

      if (value) next.set(key, value);
    }

    const mode = raw.get("mode");

    if (mode === "Online" || mode === "Offline") next.set("mode", mode);

    for (const key of ["minFee", "maxFee"]) {
      const fee = readFee(raw.get(key));

      if (fee) next.set(key, fee);
    }

    const page = readPage(raw.get("page"));

    if (page > 1) next.set("page", String(page));

    const normalized = next.toString();

    if (normalized !== queryString) {
      router.replace(normalized ? `${pathname}?${normalized}` : pathname);
    }
  }, [queryString, pathname, router]);

  const applyChanges = (changes: Record<string, string | number>) => {
    const next = new URLSearchParams(queryString);

    for (const [key, value] of Object.entries(changes)) {
      const text = String(value).trim();

      if (text === "" || (key === "page" && text === "1")) {
        next.delete(key);
      } else {
        next.set(key, text);
      }
    }

    if (!("page" in changes)) {
      next.delete("page");
    }

    const normalized = next.toString();

    router.push(normalized ? `${pathname}?${normalized}` : pathname);
  };

  const handleRetry = () => {
    setState({ status: "loading", data: null, error: null });
    setReloadKey((key) => key + 1);
  };

  const handleClearAll = () => {
    router.push(pathname);
  };

  const pagination = state.status === "ready" ? state.data.pagination : null;

  return (
    <main>
      <section
        aria-labelledby="browse-title"
        className="bg-[#075b55] py-12 text-white dark:bg-[#061b18]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#a7f3d0] uppercase">
            Tuition catalogue
          </p>
          <h1
            id="browse-title"
            className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Browse Tuitions
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
            Explore approved, active tuition posts from tutors. Search by title
            or subject and narrow results with the filters below.
          </p>
          {state.status === "ready" && pagination ? (
            <p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#a7f3d0] ring-1 ring-inset ring-white/15">
              {pagination.total} result{pagination.total === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside aria-label="Tuition filters">
          <FilterPanel
            key={queryString}
            initial={filters}
            onApply={applyChanges}
            onClear={handleClearAll}
          />
        </aside>

        <section aria-label="Tuition results" className="min-w-0">
          {state.status === "loading" ? <ResultsSkeleton /> : null}

          {state.status === "error" ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-500/20 bg-white p-6 shadow-sm dark:border-red-400/25 dark:bg-[#081715]"
            >
              <h2 className="text-base font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                We couldn&apos;t load tuitions
              </h2>
              <p className="mt-1 text-sm text-[#075b55]/65 dark:text-[#f5f5ed]/60">
                {state.error}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="mt-4"
              >
                <RefreshCw aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : null}

          {state.status === "ready" && state.data.tuitions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#075b55]/20 p-10 text-center dark:border-white/15">
              <BookOpen
                className="mx-auto size-8 text-[#087f75] dark:text-[#7fe0d2]"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-base font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                No tuitions match these filters
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                Try a broader search or clear the filters to see all approved
                and active listings. No sample results are shown.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className={buttonVariants({ variant: "outline", size: "sm", className: "mt-5" })}
              >
                Clear filters
              </button>
            </div>
          ) : null}

          {state.status === "ready" && state.data.tuitions.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                {state.data.tuitions.map((tuition: Tuition) => (
                  <div key={tuition.id} className="relative">
                    <TuitionCard tuition={tuition} />
                    <div className="absolute top-3 right-3 z-10">
                      <SaveTuitionButton tuitionId={tuition.id} compact />
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 ? (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#075b55]/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#081715]">
                  <p className="text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <nav aria-label="Tuition pages" className="flex flex-wrap items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() =>
                        applyChanges({ page: pagination.page - 1 })
                      }
                    >
                      <ChevronLeft aria-hidden="true" />
                      Previous
                    </Button>

                    {buildPageItems(
                      pagination.page,
                      pagination.totalPages,
                    ).map((item) =>
                      typeof item === "number" ? (
                        <Button
                          key={item}
                          type="button"
                          size="sm"
                          variant={item === pagination.page ? "default" : "outline"}
                          aria-current={item === pagination.page ? "page" : undefined}
                          aria-label={`Go to page ${item}`}
                          className={
                            item === pagination.page
                              ? "bg-[#075b55] text-white hover:bg-[#0b6b62]"
                              : undefined
                          }
                          onClick={() => applyChanges({ page: item })}
                        >
                          {item}
                        </Button>
                      ) : (
                        <span
                          key={item}
                          aria-hidden="true"
                          className="px-1 text-xs text-[#075b55]/45 dark:text-[#f5f5ed]/40"
                        >
                          …
                        </span>
                      ),
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() =>
                        applyChanges({ page: pagination.page + 1 })
                      }
                    >
                      Next
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </nav>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
