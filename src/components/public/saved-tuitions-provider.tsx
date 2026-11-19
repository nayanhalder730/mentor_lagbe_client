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
  savedIds: Set<string>;
  pendingIds: Set<string>;
  toggle: (tuitionId: string) => Promise<void>;
  refresh: () => void;
};

const SavedTuitionsContext = createContext<SavedContextValue | null>(null);

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
  const [reloadKey, setReloadKey] = useState(0);
  const pendingRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (role !== "student") return;

    let active = true;

    listSavedTuitions({ page: 1, limit: 100 })
      .then((data) => {
        if (!active) return;

        setSavedIds(new Set(data.tuitions.map((tuition) => tuition.id)));
      })
      .catch(() => {
        if (!active) return;

        setSavedIds(new Set());
      })
      .finally(() => {
        if (active) setLoading(false);
      });

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
          isApiError(error) && error.status === 409
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
