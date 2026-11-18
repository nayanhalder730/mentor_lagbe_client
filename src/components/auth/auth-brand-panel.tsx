import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Video,
  MapPin,
  Star,
  Quote,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified tutors",
    description: "Every profile is reviewed before going live.",
  },
  {
    icon: Video,
    title: "Online & offline",
    description: "Learn the way that suits your schedule.",
  },
  {
    icon: MapPin,
    title: "Local to global",
    description: "Find mentors near you or anywhere online.",
  },
];

const stats = [
  { value: "12k+", label: "Students" },
  { value: "1.8k", label: "Tutors" },
  { value: "4.9/5", label: "Avg. rating" },
];

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden w-[46%] max-w-[620px] shrink-0 overflow-hidden bg-linear-to-br from-[#063b36] via-[#087f75] to-[#0b927e] p-9 text-white lg:flex lg:flex-col xl:p-14">
      {/* Decorative glows + dot grid */}
      <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#5eead4]/20 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-10">
        {/* Brand */}
        <Link href="/" className="flex w-fit items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <Image
              src="/Supportive Education Mentorship Emblem.png"
              alt="MentorLagbe Logo"
              width={30}
              height={30}
              className="object-contain"
            />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">
            Mentor<span className="text-[#a7f3d0]">Lagbe</span>
          </span>
        </Link>

        {/* Hero copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#d1fae5] backdrop-blur-sm">
            <GraduationCap size={15} />
            SMART TUITION & MENTORSHIP
          </span>

          <h2 className="mt-6 text-4xl leading-[1.1] font-bold tracking-tight xl:text-[3.25rem]">
            Find your <span className="text-[#a7f3d0]">ideal tutor</span>
            <br />
            — or become one.
          </h2>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 xl:text-base">
            Subject-wise batches, 1-on-1 mentorship and a booking flow that
            just works. Your next breakthrough starts right here.
          </p>

          <ul className="mt-8 space-y-4">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icon size={17} className="text-[#a7f3d0]" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-white/60">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats + testimonial */}
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold xl:text-2xl">{stat.value}</p>
                <p className="text-[11px] tracking-wide text-white/60 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md xl:block">
            <Quote size={20} className="text-[#a7f3d0]" />
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              “I found a physics mentor in ten minutes. One semester later my
              results completely changed.”
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-medium text-white/70">
                Ayesha R. — Student
              </span>
              <span className="flex gap-0.5 text-[#fde68a]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={13} fill="currentColor" />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
