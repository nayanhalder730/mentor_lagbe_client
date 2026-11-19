"use client";

import { useCallback, useEffect, useState } from "react";

import { isApiError } from "@/lib/api";
import { getDashboardOverview } from "@/lib/api-endpoints";
import type { UserRole } from "@/lib/roles";
import type {
  AdminDashboardOverview,
  StudentDashboardOverview,
  TutorDashboardOverview,
} from "@/types/api";

type OverviewDataByRole = {
  student: StudentDashboardOverview;
  tutor: TutorDashboardOverview;
  admin: AdminDashboardOverview;
};

type OverviewData<R extends UserRole> = OverviewDataByRole[R];

type OverviewState<R extends UserRole> =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: OverviewData<R>; error: null };

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "We couldn't load your dashboard. Please try again.";
}

/**
 * Loads `GET /api/dashboard/overview` and returns only the payload that matches
 * the dashboard being rendered.
 *
 * The bearer-token client calls the backend from the browser, so the request
 * runs after mount. Server-side `requireRole(...)` guards still decide which
 * dashboard page can render in the first place; the `role` field in the
 * response is an additional check that the payload matches this page.
 */
export function useDashboardOverview<R extends UserRole>(role: R) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<OverviewState<R>>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;

    getDashboardOverview()
      .then((response) => {
        if (!active) return;

        if (response.role !== role) {
          setState({
            status: "error",
            data: null,
            error:
              "This dashboard is not available for your account. Please sign in again or refresh the page.",
          });
          return;
        }

        // The role check above guarantees the matching payload; the cast only
        // works around TypeScript not narrowing a generic union member.
        setState({
          status: "ready",
          data: response.data as OverviewData<R>,
          error: null,
        });
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
  }, [reloadKey, role]);

  const retry = useCallback(() => {
    setState({ status: "loading", data: null, error: null });
    setReloadKey((key) => key + 1);
  }, []);

  return { ...state, retry };
}
