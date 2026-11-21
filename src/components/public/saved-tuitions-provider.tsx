"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { isApiError } from "@/lib/api";
import {
  listSavedTuitions,
  saveTuition,
  unsaveTuition,
} from "@/lib/api-endpoints";
import { useSession } from "@/lib/auth-client";
import { normalizeRole, type UserRole } from "@/lib/roles";

type SavedContextValue = {
  role: UserRole | null;
  sessionPending: boolean;
  loading: boolean;
  error: string | null;
  savedIds: Set<string>;
  pendingIds: Set<string>;
  toggle: (tuitionId: string) => Promise<void>;
  refresh: () => void;
};

const SavedTuitionsContext = createContext<SavedContextValue | null>(null);

const SAVED_PAGE_SIZE = 100;

function readPositiveInteger(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 1
  ) {
    return null;
  }

  return value;
}

/**
 * Walks every page of the existing paginated endpoint. A page failure rejects
 * the whole load so incomplete data is never presented as a complete list.
 */
async function fetchAllSavedTuitionIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  const first = await listSavedTuitions({
    page: 1,
    limit: SAVED_PAGE_SIZE,
  });

  for (const tuition of first.tuitions) {
    ids.add(tuition.id);
  }

  const pagination = first.pagination;
  const reportedPages = readPositiveInteger(pagination?.totalPages);
  const total = readPositiveInteger(pagination?.total);
  const limit = readPositiveInteger(pagination?.limit) ?? SAVED_PAGE_SIZE;

  if (reportedPages === null && total === null) {
    throw new Error("Saved tuition pagination metadata is unavailable.");
  }

  const derivedPages =
    total === null ? reportedPages : Math.max(1, Math.ceil(total / limit));
  const pageCount = Math.max(reportedPages ?? 1, derivedPages ?? 1);

  for (let page = 2; page <= pageCount; page += 1) {
    const data = await listSavedTuitions({ page, limit });

    if (data.tuitions.length === 0) {
      throw new Error("Saved tuition results ended before all pages loaded.");
    }

    for (const tuition of data.tuitions) {
      ids.add(tuition.id);
    }
  }

  return ids;
}

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Could not update your saved tuitions. Please try again.";
}

/** Fetches the student's saved ids once per page and shares them with buttons. */
export function SavedTuitionsProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const role: UserRole | null = session?.user
    ? normalizeRole(session.user.role)
    : null;

  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const pendingRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      await Promise.resolve();

      if (!active) return;

      if (role !== "student") {
        setSavedIds(new Set());
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const ids = await fetchAllSavedTuitionIds();

        if (!active) return;

        setSavedIds(ids);
      } catch (loadError) {
        if (!active) return;

        // Keep the last known ids; an incomplete load must not look empty.
        setError(describeError(loadError));
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [role, reloadKey]);

  const toggle = useCallback(
    async (tuitionId: string) => {
      if (pendingRef.current.has(tuitionId)) return;

      const wasSaved = savedIds.has(tuitionId);

      pendingRef.current.add(tuitionId);
      setPendingIds(new Set(pendingRef.current));

      // Optimistic update; rolled back below if the backend rejects it.
      setSavedIds((current) => {
        const next = new Set(current);

        if (wasSaved) next.delete(tuitionId);
        else next.add(tuitionId);

        return next;
      });

      try {
        if (wasSaved) await unsaveTuition(tuitionId);
        else await saveTuition(tuitionId);

        toast.success(wasSaved ? "Removed from saved" : "Tuition saved");
      } catch (error) {
        setSavedIds((current) => {
          const next = new Set(current);

          if (wasSaved) next.add(tuitionId);
          else next.delete(tuitionId);

          return next;
        });

        toast.error(
          isApiError(error) && error.code === "FREE_BOOKMARK_LIMIT"
            ? error.message
            : isApiError(error) && error.status === 409
              ? "This tuition is already saved"
              : describeError(error),
        );
      } finally {
        pendingRef.current.delete(tuitionId);
        setPendingIds(new Set(pendingRef.current));
      }
    },
    [savedIds],
  );

  return (
    <SavedTuitionsContext.Provider
      value={{
        role,
        sessionPending: isPending,
        loading,
        error,
        savedIds,
        pendingIds,
        toggle,
        refresh,
      }}
    >
      {children}
    </SavedTuitionsContext.Provider>
  );
}

export function useSavedTuitions() {
  const context = useContext(SavedTuitionsContext);

  if (!context) {
    throw new Error(
      "useSavedTuitions must be used inside SavedTuitionsProvider",
    );
  }

  return context;
}
