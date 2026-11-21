"use client";

import { useEffect, useState } from "react";
import { CircleCheck, CircleX, Clock, FileText, Wallet } from "lucide-react";

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
  StatGrid,
  StatusBadge,
  titleCase,
} from "./overview-primitives";

export default function StudentOverview() {
  const { status, data, error, retry } = useDashboardOverview("student");
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
        title="Student overview"
        description="A quick look at your tuition applications and recent activity."
      />

      {status === "loading" ? (
        <OverviewSkeleton statCount={4} sectionCount={1} />
      ) : null}

      {status === "error" ? (
        <OverviewError message={error} onRetry={retry} />
      ) : null}

      {status === "ready" && data ? (
        <>
          <StatGrid>
            <StatCard
              label="Total applications"
              value={data.stats.totalApplications}
              icon={FileText}
              tone="teal"
              hint="Applications you have submitted"
            />
            <StatCard
              label="Pending"
              value={data.stats.pendingApplications}
              icon={Clock}
              tone="amber"
              hint="Awaiting a tutor's review"
            />
            <StatCard
              label="Accepted"
              value={data.stats.acceptedApplications}
              icon={CircleCheck}
              tone="green"
              hint="Approved by the tutor"
            />
            <StatCard
              label="Rejected"
              value={data.stats.rejectedApplications}
              icon={CircleX}
              tone="red"
              hint="Not selected"
            />
            <StatCard
              label="Current plan"
              value={plan ? titleCase(plan) : "—"}
              icon={Wallet}
              tone="gold"
              hint="Verified from your profile"
            />
          </StatGrid>

          <SectionCard
            title="Recent applications"
            description="Your latest applications, newest first."
            icon={FileText}
          >
            {data.recentActivity.applications.length === 0 ? (
              <EmptyActivity
                title="No applications yet"
                description="Once you apply to a tuition, it will show up here."
              />
            ) : (
              <ActivityList>
                {data.recentActivity.applications.map((application) => (
                  <ActivityItem
                    key={application.id}
                    title={application.tuitionTitle}
                    description={
                      <>
                        {application.subject}
                        <span aria-hidden="true"> · </span>
                        Fee {formatNumber(application.monthlyFee)}
                      </>
                    }
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
        </>
      ) : null}
    </div>
  );
}
