"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  Users,
  Wallet,
} from "lucide-react";

import { useDashboardOverview } from "@/hooks/use-dashboard-overview";
import { getMyProfile } from "@/lib/api-endpoints";

import {
  ActivityItem,
  ActivityList,
  applicationStatusTone,
  EmptyActivity,
  formatDate,
  formatNumber,
  OverviewError,
  OverviewSkeleton,
  PageHeading,
  SectionCard,
  StatCard,
  StatGroup,
  StatusBadge,
  titleCase,
} from "./overview-primitives";

export default function TutorOverview() {
  const { status, data, error, retry } = useDashboardOverview("tutor");
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((profile) => {
        if (active) setPlan(profile.plan);
      })
      .catch(() => {
        if (active) setPlan(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Tutor overview"
        description="Track your tuition posts, applicant activity, and approval status."
      />

      {status === "loading" ? <OverviewSkeleton statCount={8} /> : null}

      {status === "error" ? (
        <OverviewError message={error} onRetry={retry} />
      ) : null}

      {status === "ready" && data ? (
        <>
          <StatGroup
            title="Tuitions"
            description="Every tuition you have posted and where it stands."
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
              hint="Approved and visible to students"
            />
          </StatGroup>

          <StatGroup
            title="Applications"
            description="Applications students have submitted to your tuitions."
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
              icon={Users}
              tone="green"
            />
            <StatCard
              label="Rejected"
              value={data.stats.rejectedApplications}
              icon={CircleX}
              tone="red"
            />
            <StatCard
              label="Current plan"
              value={plan ? titleCase(plan) : "—"}
              icon={Wallet}
              tone="gold"
              hint="Verified from your profile"
            />
          </StatGroup>

          <SectionCard
            title="Recent applicants"
            description="The newest applications across your tuitions."
            icon={Users}
          >
            {data.recentActivity.applications.length === 0 ? (
              <EmptyActivity
                title="No applicants yet"
                description="Applications to your tuitions will appear here."
              />
            ) : (
              <ActivityList>
                {data.recentActivity.applications.map((application) => (
                  <ActivityItem
                    key={application.id}
                    title={application.studentName}
                    description={
                      <>
                        {application.tuitionTitle}
                        <span aria-hidden="true"> · </span>
                        {application.subject}
                      </>
                    }
                    meta={`${application.studentEmail} · Applied ${formatDate(
                      application.appliedAt,
                    )}`}
                    trailing={
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge
                          tone={applicationStatusTone(application.status)}
                        >
                          {titleCase(application.status)}
                        </StatusBadge>
                        <span className="text-[11px] whitespace-nowrap text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                          Fee {formatNumber(application.monthlyFee)}
                        </span>
                      </div>
                    }
                  />
                ))}
              </ActivityList>
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
