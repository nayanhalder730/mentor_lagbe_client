import { Suspense } from "react";

import PricingView from "@/components/public/pricing-view";

export const metadata = {
  title: "Pricing | MentorLagbe",
  description:
    "Compare Free and Pro plans for students and tutors on MentorLagbe.",
};

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="mx-auto w-full max-w-6xl px-4 py-20 text-center text-sm text-[#075b55]/60 dark:text-[#f5f5ed]/60"
        >
          Loading pricing…
        </div>
      }
    >
      <PricingView />
    </Suspense>
  );
}
