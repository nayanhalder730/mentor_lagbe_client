import Link from "next/link";
import { ArrowRight, BookOpen, Compass } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
        <Compass className="size-7" aria-hidden="true" />
      </span>

      <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#075b55] sm:text-4xl dark:text-[#f5f5ed]">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#075b55]/65 dark:text-[#f5f5ed]/60">
        The page you are looking for does not exist or has moved. You can head
        back home or keep exploring available tuition listings.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className={buttonVariants({
            className: "bg-[#075b55] text-white hover:bg-[#0b6b62]",
          })}
        >
          Back to home
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link
          href="/tuitions"
          className={buttonVariants({ variant: "outline" })}
        >
          <BookOpen aria-hidden="true" />
          Browse Tuitions
        </Link>
      </div>
    </div>
  );
}
