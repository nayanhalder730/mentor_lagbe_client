import type { UserRole } from "@/lib/roles";

/**
 * Shared response and resource types for the MentorLagbe Express API.
 *
 * Field names mirror the backend's safe response projections exactly. MongoDB
 * ObjectId values are serialized to strings and Date values to ISO strings.
 * Internal fields (auth records, ownership ids, Stripe internal ids) are
 * intentionally absent.
 */

export type Plan = "free" | "pro";

export type TuitionMode = "Online" | "Offline";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApplicationStatus = "pending" | "accepted" | "rejected";

/* -------------------------------------------------------------------------- */
/* Response envelopes                                                         */
/* -------------------------------------------------------------------------- */

export type ApiSuccessResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

export type ApiMessageResponse = {
  success: true;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/* -------------------------------------------------------------------------- */
/* Users & profile                                                            */
/* -------------------------------------------------------------------------- */

export type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  plan: Plan;
  createdAt: string | null;
};

export type UpdateProfileInput = Partial<{
  name: string;
  image: string | null;
  phone: string | null;
  bio: string | null;
}>;

export type UserListData = {
  users: User[];
  pagination: Pagination;
};

export type UserListQuery = {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
};

/* -------------------------------------------------------------------------- */
/* Tuitions                                                                   */
/* -------------------------------------------------------------------------- */

export type Tuition = {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage: string | null;
  description: string;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  createdAt: string | null;
};

export type TuitionListData = {
  tuitions: Tuition[];
  pagination: Pagination;
};

export type MyTuitionListData = {
  tuitions: Tuition[];
};

export type TuitionListQuery = {
  page?: number;
  limit?: number;
  mode?: TuitionMode;
  subject?: string;
  classLevel?: string;
  location?: string;
  minFee?: number;
  maxFee?: number;
  search?: string;
};

export type AdminTuitionListQuery = {
  page?: number;
  limit?: number;
  approvalStatus?: ApprovalStatus;
  search?: string;
};

export type CreateTuitionInput = {
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage?: string | null;
  description: string;
};

export type UpdateTuitionInput = Partial<CreateTuitionInput>;

/* -------------------------------------------------------------------------- */
/* Applications                                                               */
/* -------------------------------------------------------------------------- */

export type Application = {
  id: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorName: string | null;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  studentNote: string | null;
  status: ApplicationStatus;
  appliedAt: string | null;
};

export type ApplicationListData = {
  applications: Application[];
  pagination: Pagination;
};

export type ApplicationListQuery = {
  page?: number;
  limit?: number;
};

export type TutorApplicationListQuery = ApplicationListQuery & {
  status?: ApplicationStatus;
};

export type CreateApplicationInput = {
  tuitionId: string;
  preferredSchedule: string;
  studentPhone: string;
  studentNote?: string | null;
};

export type ReviewApplicationInput = {
  status: "accepted" | "rejected";
};

/* -------------------------------------------------------------------------- */
/* Payments                                                                   */
/* -------------------------------------------------------------------------- */

export type Payment = {
  id: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string | null;
  stripeSessionId: string | null;
  paymentStatus: string;
  paidAt: string | null;
};

export type PaymentListData = {
  payments: Payment[];
  pagination: Pagination;
};

export type PaymentListQuery = {
  page?: number;
  limit?: number;
};

export type CheckoutSessionData = {
  url: string;
  sessionId: string;
  planName: string;
  amount: number;
  currency: string;
};

/* -------------------------------------------------------------------------- */
/* Admin tuition moderation                                                   */
/* -------------------------------------------------------------------------- */

export type ReviewTuitionApprovalInput = {
  approvalStatus: "approved" | "rejected";
};

export type SetTuitionActiveInput = {
  isActive: boolean;
};

/* -------------------------------------------------------------------------- */
/* Dashboard overview                                                         */
/* -------------------------------------------------------------------------- */

export type RecentStudentApplication = {
  id: string;
  tuitionId: string | null;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  status: ApplicationStatus;
  appliedAt: string | null;
};

export type RecentTutorApplication = RecentStudentApplication & {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  studentNote: string | null;
};

export type RecentAdminApplication = {
  id: string;
  tuitionId: string | null;
  tuitionTitle: string;
  subject: string;
  studentName: string;
  studentEmail: string;
  status: ApplicationStatus;
  appliedAt: string | null;
};

export type RecentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string | null;
};

export type RecentTuition = {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  monthlyFee: number;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  createdAt: string | null;
};

export type RecentPayment = {
  id: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  planName: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paidAt: string | null;
};

export type StudentDashboardStats = {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
};

export type TutorDashboardStats = {
  totalTuitions: number;
  pendingTuitions: number;
  approvedTuitions: number;
  rejectedTuitions: number;
  activeTuitions: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
};

export type AdminDashboardStats = {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalAdmins: number;
  totalTuitions: number;
  pendingTuitions: number;
  approvedTuitions: number;
  rejectedTuitions: number;
  activeTuitions: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalPayments: number;
  totalRevenue: number;
};

export type StudentDashboardOverview = {
  stats: StudentDashboardStats;
  recentActivity: {
    applications: RecentStudentApplication[];
  };
};

export type TutorDashboardOverview = {
  stats: TutorDashboardStats;
  recentActivity: {
    applications: RecentTutorApplication[];
  };
};

export type AdminDashboardOverview = {
  stats: AdminDashboardStats;
  recentActivity: {
    users: RecentUser[];
    tuitions: RecentTuition[];
    applications: RecentAdminApplication[];
    payments: RecentPayment[];
  };
};

export type DashboardOverview =
  | StudentDashboardOverview
  | TutorDashboardOverview
  | AdminDashboardOverview;

/**
 * The dashboard endpoint derives the role from the authenticated database user
 * and returns it alongside the role-specific payload.
 */
export type DashboardOverviewResponse =
  | {
      success: true;
      message: string;
      role: "student";
      data: StudentDashboardOverview;
    }
  | {
      success: true;
      message: string;
      role: "tutor";
      data: TutorDashboardOverview;
    }
  | {
      success: true;
      message: string;
      role: "admin";
      data: AdminDashboardOverview;
    };
