"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Tuitions" },
  { href: "/pricing", label: "Pricing" },
];

function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-[#173f38]/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/Supportive Education Mentorship Emblem.png"
            alt="MentorLagbe Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="text-xl font-extrabold tracking-tight text-[#173f38]">
            Mentor<span className="text-[#0b927e]">Lagbe</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-[#0b927e]/10 text-[#0b927e]"
                  : "text-[#173f38]/70 hover:bg-[#173f38]/5 hover:text-[#173f38]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2 text-sm font-semibold text-[#173f38] transition-colors hover:bg-[#173f38]/5"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-[#0b927e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#087f75]"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#173f38] transition-colors hover:bg-[#173f38]/5 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#173f38]/10 bg-white px-4 pt-3 pb-5 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-[#0b927e]/10 text-[#0b927e]"
                    : "text-[#173f38]/70 hover:bg-[#173f38]/5 hover:text-[#173f38]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-[#173f38]/10 pt-4">
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[#173f38]/15 px-4 py-2.5 text-center text-sm font-semibold text-[#173f38] transition-colors hover:bg-[#173f38]/5"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="rounded-full bg-[#0b927e] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#087f75]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-[#173f38]/10 bg-[#173f38] text-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/Supportive Education Mentorship Emblem.png"
              alt="MentorLagbe Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="text-xl font-extrabold tracking-tight text-white">
              Mentor<span className="text-[#a7f3d0]">Lagbe</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed">
            Subject-wise batches, 1-on-1 mentorship and a booking flow that just
            works.
          </p>
        </div>

        <div className="flex gap-12 sm:gap-16">
          <div>
            <h3 className="text-sm font-semibold text-white">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Account</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/sign-in"
                  className="transition-colors hover:text-white"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="transition-colors hover:text-white"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-xs sm:px-6 lg:px-8">
          © {year ? `${year} ` : ""}MentorLagbe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
