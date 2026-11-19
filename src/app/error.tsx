"use client";

import Link from "next/link";
import { ArrowRight, RefreshCw, TriangleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const showDetails = process.env.NODE_ENV === "development";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-300">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#075b55] sm:text-3xl dark:text-[#f5f5ed]">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#075b55]/65 dark:text-[#f5f5ed]/60">
        We couldn&apos;t load this page right now. Please try again — your data
        has not been changed by this error.
      </p>

      {showDetails ? (
        <pre className="mt-4 w-full overflow-x-auto rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-left text-xs whitespace-pre-wrap text-red-700 dark:text-red-300">
          {error.message}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={reset}
          className="bg-[#075b55] text-white hover:bg-[#0b6b62]"
        >
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
        <Link
          href="/"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to home
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
