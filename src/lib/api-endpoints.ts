import { apiFetch } from "@/lib/api";
import type {
  AdminApplicationListQuery,
  ApiMessageResponse,
  ApiSuccessResponse,
  Application,
  ApplicationCheckData,
  ApplicationListData,
  ApplicationListQuery,
  AssignableRole,
  CheckoutSessionData,
  CreateApplicationInput,
  CreateTuitionInput,
  DashboardOverviewResponse,
  MyTuitionListData,
  PaymentListData,
  PaymentListQuery,
  ReviewApplicationInput,
  ReviewTuitionApprovalInput,
  SavedTuitionListQuery,
  SavedTuitionMutationData,
  SetTuitionActiveInput,
  Tuition,
  TuitionFilterOptions,
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

/** Student's saved tuitions. Backend filters to approved + active listings. */
export function listSavedTuitions(query?: SavedTuitionListQuery) {
  return apiFetch<ApiSuccessResponse<TuitionListData>>(
    "/api/users/me/saved-tuitions",
    { query },
  ).then((response) => response.data);
}

export function saveTuition(tuitionId: string) {
  return apiFetch<ApiSuccessResponse<SavedTuitionMutationData>>(
    resourcePath("/api/users/me/saved-tuitions", tuitionId),
    { method: "POST" },
  ).then((response) => response.data);
}

export function unsaveTuition(tuitionId: string) {
  return apiFetch<ApiSuccessResponse<SavedTuitionMutationData>>(
    resourcePath("/api/users/me/saved-tuitions", tuitionId),
    { method: "DELETE" },
  ).then((response) => response.data);
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

/** Public filter options derived from approved, active tuitions only. */
export function getTuitionFilterOptions() {
  return apiFetch<ApiSuccessResponse<TuitionFilterOptions>>(
    "/api/tuitions/filters",
    { auth: false }
  ).then((response) => response.data);
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

/**
 * Tutor-owned active status toggle. Only `isActive` is sent; ownership and
 * approval are enforced by the backend.
 */
export function updateTuitionActiveStatus(id: string, isActive: boolean) {
  const body: SetTuitionActiveInput = { isActive };

  return apiFetch<ApiSuccessResponse<Tuition>>(
    resourcePath("/api/tuitions", id) + "/status",
    {
      method: "PATCH",
      body,
    },
  ).then((response) => response.data);
}

/** Cleanup counts are returned for observability; the UI only needs success. */
export async function deleteTuition(id: string): Promise<void> {
  await apiFetch<ApiMessageResponse>(resourcePath("/api/tuitions", id), {
    method: "DELETE",
  });
}

/* -------------------------------------------------------------------------- */
/* Applications                                                               */
/* -------------------------------------------------------------------------- */

/** Efficient authenticated check for one tuition; no application list fetch. */
export function checkTuitionApplication(tuitionId: string) {
  return apiFetch<ApiSuccessResponse<ApplicationCheckData>>(
    "/api/applications/check",
    { query: { tuitionId } },
  ).then((response) => response.data);
}

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

/** Admin-only view of every application in the platform. */
export function listAllApplications(query?: AdminApplicationListQuery) {
  return apiFetch<ApiSuccessResponse<ApplicationListData>>(
    "/api/admin/applications",
    { query },
  ).then((response) => response.data);
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

/** Cancels a pending application. Ownership is enforced by the backend. */
export async function cancelApplication(id: string): Promise<void> {
  await apiFetch<ApiMessageResponse>(resourcePath("/api/applications", id), {
    method: "DELETE",
  });
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

/** Admin-only role change. Only student/tutor roles are assignable. */
export function updateUserRole(id: string, role: AssignableRole) {
  return apiFetch<ApiSuccessResponse<User>>(
    resourcePath("/api/users", id) + "/role",
    {
      method: "PATCH",
      body: { role },
    },
  ).then((response) => response.data);
}

/** Admin-only account deletion. Payment history is preserved by the server. */
export async function deleteUser(id: string): Promise<void> {
  await apiFetch<ApiMessageResponse>(resourcePath("/api/users", id), {
    method: "DELETE",
  });
}

export function listAdminTuitions(query?: AdminTuitionListQuery) {
  return apiFetch<ApiSuccessResponse<TuitionListData>>(
    "/api/admin/tuitions",
    { query },
  ).then((response) => response.data);
}

/** Admin-only removal of an inappropriate tuition post. */
export async function adminDeleteTuition(id: string): Promise<void> {
  await apiFetch<ApiMessageResponse>(resourcePath("/api/admin/tuitions", id), {
    method: "DELETE",
  });
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
