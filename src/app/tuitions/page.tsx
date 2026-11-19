import { Suspense } from "react";

import BrowseTuitionsView from "@/components/public/browse-tuitions-view";

export const metadata = {
  title: "Browse Tuitions | MentorLagbe",
  description:
    "Search approved and active tuition listings by subject, class level, mode, location, and fee.",
};

export default function TuitionsPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="mx-auto w-full max-w-6xl px-4 py-20 text-center text-sm text-[#075b55]/60 dark:text-[#f5f5ed]/60"
        >
          Loading tuitions…
        </div>
      }
    >
      <BrowseTuitionsView />
    </Suspense>
  );
}
