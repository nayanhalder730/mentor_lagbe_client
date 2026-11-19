import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  MapPin,
  Wallet,
} from "lucide-react";

import type { Tuition } from "@/types/api";

const numberFormatter = new Intl.NumberFormat("en-US");

/** Shared public catalogue card used by Home and Browse Tuitions. */
export default function TuitionCard({ tuition }: { tuition: Tuition }) {
  return (
    <Link
      href={`/tuitions/${tuition.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#075b55]/10 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:border-white/10 dark:bg-[#081715]"
    >
      <div
        role="img"
        aria-label={`Banner for ${tuition.title}`}
        className="relative h-40 w-full bg-cover bg-center"
        style={
          tuition.bannerImage
            ? { backgroundImage: `url("${tuition.bannerImage}")` }
            : undefined
        }
      >
        {!tuition.bannerImage ? (
          <div className="flex h-full w-full items-center justify-center bg-[#087f75]/10 text-[#087f75] dark:bg-[#087f75]/20 dark:text-[#7fe0d2]">
            <BookOpen className="size-9" aria-hidden="true" />
          </div>
        ) : null}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#075b55] shadow-sm dark:bg-[#081715]/90 dark:text-[#f5f5ed]">
          {tuition.subject}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
          {tuition.title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-[#075b55]/65 dark:text-[#f5f5ed]/60">
          <p className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
            Class {tuition.classLevel} · {tuition.mode}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{tuition.location}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            {tuition.daysPerWeek} day{tuition.daysPerWeek === 1 ? "" : "s"} per
            week
          </p>
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
            Posted{" "}
            {tuition.createdAt
              ? new Date(tuition.createdAt).toLocaleDateString("en-US")
              : "—"}
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#075b55]/10 pt-4 dark:border-white/10">
          <div className="min-w-0">
            <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
              {tuition.tutorName}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-[#075b55] dark:text-[#f5f5ed]">
              <Wallet
                className="size-4 text-[#087f75] dark:text-[#7fe0d2]"
                aria-hidden="true"
              />
              {numberFormatter.format(tuition.monthlyFee)}
              <span className="text-[11px] font-medium text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                / month
              </span>
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#087f75] transition-transform group-hover:translate-x-0.5 dark:text-[#7fe0d2]">
            Details
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
