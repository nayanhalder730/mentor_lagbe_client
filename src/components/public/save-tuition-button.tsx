"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, RefreshCw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useSavedTuitions } from "@/components/public/saved-tuitions-provider";

/** Student-only save/unsave control backed by the shared saved-state context. */
export default function SaveTuitionButton({
  tuitionId,
  compact = false,
}: {
  tuitionId: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const { role, sessionPending, loading, savedIds, pendingIds, toggle } =
    useSavedTuitions();

  if (sessionPending || (role === "student" && loading)) {
    return (
      <Button
        type="button"
        size={compact ? "xs" : "sm"}
        variant="outline"
        disabled
        className={compact ? "" : "w-full"}
      >
        <RefreshCw className="animate-spin" aria-hidden="true" />
        Loading
      </Button>
    );
  }

  if (!role) {
    return (
      <Link
        href={`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`}
        className={buttonVariants({
          variant: "outline",
          size: compact ? "xs" : "sm",
          className: compact ? "" : "w-full",
        })}
      >
        <Bookmark aria-hidden="true" />
        Sign in to save
      </Link>
    );
  }

  if (role !== "student") return null;

  const saved = savedIds.has(tuitionId);
  const pending = pendingIds.has(tuitionId);

  return (
    <Button
      type="button"
      size={compact ? "xs" : "sm"}
      variant={saved ? "secondary" : "outline"}
      disabled={pending}
      onClick={() => void toggle(tuitionId)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved tuitions" : "Save tuition"}
      className={compact ? "" : "w-full"}
    >
      {pending ? (
        <RefreshCw className="animate-spin" aria-hidden="true" />
      ) : (
        <Bookmark
          className={saved ? "fill-current" : ""}
          aria-hidden="true"
        />
      )}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
