"use client";

import {
  Activity,
  BookOpen,
  CircleCheck,
  CircleDollarSign,
  CircleX,
  Clock,
  FileText,
  GraduationCap,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { useDashboardOverview } from "@/hooks/use-dashboard-overview";

import {
  ActivityItem,
  ActivityList,
  applicationStatusTone,
  approvalStatusTone,
  EmptyActivity,
  formatCurrency,
  formatDate,
  OverviewError,
  OverviewSkeleton,
  PageHeading,
  paymentStatusTone,
  roleTone,
  SectionCard,
  StatCard,
  StatGroup,
  StatusBadge,
  titleCase,
} from "./overview-primitives";

export default function AdminOverview() {
  const { status, data, error, retry } = useDashboardOverview("admin");

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Admin overview"
        description="Monitor users, tuitions, applications, and payments across MentorLagbe."
      />

      {status === "loading" ? (
        <OverviewSkeleton statCount={8} sectionCount={2} />
      ) : null}

      {status === "error" ? (
        <OverviewError message={error} onRetry={retry} />
      ) : null}

      {status === "ready" && data ? (
        <>
          <StatGroup title="Users" description="Everyone with a MentorLagbe account.">
            <StatCard
              label="Total users"
              value={data.stats.totalUsers}
              icon={Users}
              tone="teal"
            />
            <StatCard
              label="Students"
              value={data.stats.totalStudents}
              icon={GraduationCap}
              tone="gold"
            />
            <StatCard
              label="Tutors"
              value={data.stats.totalTutors}
              icon={BookOpen}
              tone="amber"
            />
            <StatCard
              label="Admins"
              value={data.stats.totalAdmins}
              icon={ShieldCheck}
              tone="slate"
            />
          </StatGroup>

          <StatGroup
            title="Tuitions"
            description="Posted tuitions and their moderation state."
          >
            <StatCard
              label="Total tuitions"
              value={data.stats.totalTuitions}
              icon={BookOpen}
              tone="teal"
            />
            <StatCard
              label="Pending review"
              value={data.stats.pendingTuitions}
              icon={Clock}
              tone="amber"
            />
            <StatCard
              label="Approved"
              value={data.stats.approvedTuitions}
              icon={CircleCheck}
              tone="green"
            />
            <StatCard
              label="Rejected"
              value={data.stats.rejectedTuitions}
              icon={CircleX}
              tone="red"
            />
            <StatCard
              label="Active"
              value={data.stats.activeTuitions}
              icon={Activity}
              tone="gold"
            />
          </StatGroup>

          <StatGroup
            title="Applications"
            description="Student applications across all tuitions."
          >
            <StatCard
              label="Total applications"
              value={data.stats.totalApplications}
              icon={FileText}
              tone="teal"
            />
            <StatCard
              label="Pending"
              value={data.stats.pendingApplications}
              icon={Clock}
              tone="amber"
            />
            <StatCard
              label="Accepted"
              value={data.stats.acceptedApplications}
              icon={CircleCheck}
              tone="green"
            />
            <StatCard
              label="Rejected"
              value={data.stats.rejectedApplications}
              icon={CircleX}
              tone="red"
            />
          </StatGroup>

          <StatGroup
            title="Payments"
            description="Verified paid plan purchases."
          >
            <StatCard
              label="Total payments"
              value={data.stats.totalPayments}
              icon={Receipt}
              tone="teal"
            />
            <StatCard
              label="Total revenue"
              value={formatCurrency(data.stats.totalRevenue, "USD")}
              icon={CircleDollarSign}
              tone="gold"
              hint="Sum of verified paid amounts"
            />
          </StatGroup>

          <div className="grid gap-4 xl:grid-cols-2">
            <SectionCard
              title="Newest users"
              description="The five most recent sign-ups."
              icon={Users}
            >
              {data.recentActivity.users.length === 0 ? (
                <EmptyActivity
                  title="No users yet"
                  description="New accounts will appear here."
                />
              ) : (
                <ActivityList>
                  {data.recentActivity.users.map((user) => (
                    <ActivityItem
                      key={user.id}
                      title={user.name}
                      description={user.email}
                      meta={`${titleCase(user.plan)} plan · Joined ${formatDate(
                        user.createdAt,
                      )}`}
                      trailing={
                        <StatusBadge tone={roleTone(user.role)}>
                          {titleCase(user.role)}
                        </StatusBadge>
                      }
                    />
                  ))}
                </ActivityList>
              )}
            </SectionCard>

            <SectionCard
              title="Newest tuitions"
              description="Recently posted tuitions and their approval state."
              icon={BookOpen}
            >
              {data.recentActivity.tuitions.length === 0 ? (
                <EmptyActivity
                  title="No tuitions yet"
                  description="Tuitions posted by tutors will appear here."
                />
              ) : (
                <ActivityList>
                  {data.recentActivity.tuitions.map((tuition) => (
                    <ActivityItem
                      key={tuition.id}
                      title={tuition.title}
                      description={`${tuition.subject} · ${tuition.classLevel} · ${tuition.mode}`}
                      meta={`${tuition.tutorName} · Created ${formatDate(
                        tuition.createdAt,
                      )}`}
                      trailing={
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusBadge
                            tone={approvalStatusTone(tuition.approvalStatus)}
                          >
                            {titleCase(tuition.approvalStatus)}
                          </StatusBadge>
                          <StatusBadge
                            tone={tuition.isActive ? "green" : "neutral"}
                          >
                            {tuition.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>
                      }
                    />
                  ))}
                </ActivityList>
              )}
            </SectionCard>

            <SectionCard
              title="Newest applications"
              description="The latest student applications."
              icon={FileText}
            >
              {data.recentActivity.applications.length === 0 ? (
                <EmptyActivity
                  title="No applications yet"
                  description="Applications submitted by students will appear here."
                />
              ) : (
                <ActivityList>
                  {data.recentActivity.applications.map((application) => (
                    <ActivityItem
                      key={application.id}
                      title={application.tuitionTitle}
                      description={`${application.studentName} · ${application.subject}`}
                      meta={`Applied ${formatDate(application.appliedAt)}`}
                      trailing={
                        <StatusBadge
                          tone={applicationStatusTone(application.status)}
                        >
                          {titleCase(application.status)}
                        </StatusBadge>
                      }
                    />
                  ))}
                </ActivityList>
              )}
            </SectionCard>

            <SectionCard
              title="Recent payments"
              description="The newest verified plan payments."
              icon={Wallet}
            >
              {data.recentActivity.payments.length === 0 ? (
                <EmptyActivity
                  title="No payments yet"
                  description="Verified payments will appear here."
                />
              ) : (
                <ActivityList>
                  {data.recentActivity.payments.map((payment) => (
                    <ActivityItem
                      key={payment.id}
                      title={payment.userName}
                      description={`${payment.userEmail} · ${payment.planName}`}
                      meta={`${formatCurrency(payment.amount, payment.currency)} · Paid ${formatDate(
                        payment.paidAt,
                      )}`}
                      trailing={
                        <StatusBadge
                          tone={paymentStatusTone(payment.paymentStatus)}
                        >
                          {titleCase(payment.paymentStatus)}
                        </StatusBadge>
                      }
                    />
                  ))}
                </ActivityList>
              )}
            </SectionCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
