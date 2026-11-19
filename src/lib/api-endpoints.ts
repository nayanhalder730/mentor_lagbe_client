import { apiFetch } from "@/lib/api";
import type {
  ApiMessageResponse,
  ApiSuccessResponse,
  Application,
  ApplicationListData,
  ApplicationListQuery,
  CheckoutSessionData,
  CreateApplicationInput,
  CreateTuitionInput,
  DashboardOverviewResponse,
  MyTuitionListData,
  PaymentListData,
  PaymentListQuery,
  ReviewApplicationInput,
  ReviewTuitionApprovalInput,
  SetTuitionActiveInput,
  Tuition,
  TuitionListData,
  TuitionListQuery,
  AdminTuitionListQuery,
  UpdateProfileInput,
  UpdateTuitionInput,
  User,
  UserListData,
  UserListQuery,
  TutorApplicationListQuery,
} from "@/types/api";

/**
 * Typed wrappers around the MentorLagbe Express API.
 *
 * Every helper is a thin layer over `apiFetch`: it builds the path, forwards
 * validated query/body values, and unwraps the `{ success, message, data }`
 * envelope. Authorization is always enforced by the backend; nothing here
 * sends roles or user ids as a substitute for a valid Bearer token.
 */

function resourcePath(base: string, id: string) {
  return `${base}/${encodeURIComponent(id)}`;
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

export function getMyProfile() {
  return apiFetch<ApiSuccessResponse<User>>("/api/users/me").then(
    (response) => response.data,
  );
}

export function updateMyProfile(input: UpdateProfileInput) {
  return apiFetch<ApiSuccessResponse<User>>("/api/users/me", {
    method: "PATCH",
    body: input,
  }).then((response) => response.data);
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export function getDashboardOverview() {
  return apiFetch<DashboardOverviewResponse>("/api/dashboard/overview");
}

/* -------------------------------------------------------------------------- */
/* Tuitions                                                                   */
/* -------------------------------------------------------------------------- */

/** Public catalogue. No Bearer token is attached. */
export function listTuitions(query?: TuitionListQuery) {
  return apiFetch<ApiSuccessResponse<TuitionListData>>("/api/tuitions", {
    query,
    auth: false,
  }).then((response) => response.data);
}

/** Public tuition detail. No Bearer token is attached. */
export function getTuition(id: string) {
  return apiFetch<ApiSuccessResponse<Tuition>>(resourcePath("/api/tuitions", id), {
    auth: false,
  }).then((response) => response.data);
}

/** The authenticated tutor's own tuitions (no pagination on this endpoint). */
export function listMyTuitions() {
  return apiFetch<ApiSuccessResponse<MyTuitionListData>>("/api/tuitions/my").then(
    (response) => response.data.tuitions,
  );
}

export function createTuition(input: CreateTuitionInput) {
  return apiFetch<ApiSuccessResponse<Tuition>>("/api/tuitions", {
    method: "POST",
    body: input,
  }).then((response) => response.data);
}

export function updateTuition(id: string, input: UpdateTuitionInput) {
  return apiFetch<ApiSuccessResponse<Tuition>>(
    resourcePath("/api/tuitions", id),
    {
      method: "PATCH",
      body: input,
    },
  ).then((response) => response.data);
}

/** Returns nothing: the backend responds with a message but no `data`. */
export async function deleteTuition(id: string): Promise<void> {
  await apiFetch<ApiMessageResponse>(resourcePath("/api/tuitions", id), {
    method: "DELETE",
  });
}

/* -------------------------------------------------------------------------- */
/* Applications                                                               */
/* -------------------------------------------------------------------------- */

export function listMyApplications(query?: ApplicationListQuery) {
  return apiFetch<ApiSuccessResponse<ApplicationListData>>(
    "/api/applications/my",
    { query },
  ).then((response) => response.data);
}

export function createApplication(input: CreateApplicationInput) {
  return apiFetch<ApiSuccessResponse<Application>>("/api/applications", {
    method: "POST",
    body: input,
  }).then((response) => response.data);
}

export function listTutorApplications(query?: TutorApplicationListQuery) {
  return apiFetch<ApiSuccessResponse<ApplicationListData>>(
    "/api/applications/tutor",
    { query },
  ).then((response) => response.data);
}

export function reviewApplication(id: string, input: ReviewApplicationInput) {
  return apiFetch<ApiSuccessResponse<Application>>(
    resourcePath("/api/applications", id) + "/status",
    {
      method: "PATCH",
      body: input,
    },
  ).then((response) => response.data);
}

/* -------------------------------------------------------------------------- */
/* Payments                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Starts a Stripe Checkout session for the plan derived server-side from the
 * authenticated user's role. The backend rejects any request body, so none is
 * sent.
 */
export function createCheckoutSession() {
  return apiFetch<ApiSuccessResponse<CheckoutSessionData>>(
    "/api/payments/create-checkout-session",
    { method: "POST" },
  ).then((response) => response.data);
}

export function listMyPayments(query?: PaymentListQuery) {
  return apiFetch<ApiSuccessResponse<PaymentListData>>("/api/payments/my", {
    query,
  }).then((response) => response.data);
}

export function listAllPayments(query?: PaymentListQuery) {
  return apiFetch<ApiSuccessResponse<PaymentListData>>("/api/admin/payments", {
    query,
  }).then((response) => response.data);
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

export function listUsers(query?: UserListQuery) {
  return apiFetch<ApiSuccessResponse<UserListData>>("/api/users", {
    query,
  }).then((response) => response.data);
}

export function listAdminTuitions(query?: AdminTuitionListQuery) {
  return apiFetch<ApiSuccessResponse<TuitionListData>>(
    "/api/admin/tuitions",
    { query },
  ).then((response) => response.data);
}

export function reviewTuitionApproval(
  id: string,
  input: ReviewTuitionApprovalInput,
) {
  return apiFetch<ApiSuccessResponse<Tuition>>(
    resourcePath("/api/admin/tuitions", id) + "/approval",
    {
      method: "PATCH",
      body: input,
    },
  ).then((response) => response.data);
}

export function setTuitionActive(id: string, input: SetTuitionActiveInput) {
  return apiFetch<ApiSuccessResponse<Tuition>>(
    resourcePath("/api/admin/tuitions", id) + "/status",
    {
      method: "PATCH",
      body: input,
    },
  ).then((response) => response.data);
}
