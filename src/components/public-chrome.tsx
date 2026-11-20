"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import { useClientYear } from "@/hooks/use-client-year";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

// Genuine project link from README.md. No other social URLs are documented.
const CLIENT_REPOSITORY_URL =
  "https://github.com/nayanhalder730/mentor_lagbe_client";

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.215-6.822L4.92 21.75H1.61l7.73-8.835L1.064 2.25h6.825l4.713 6.231 5.642-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

const footerLinkClass =
  "rounded transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a7f3d0]/50";

function Footer() {
  const year = useClientYear();

  return (
    <footer className="border-t border-[#173f38]/10 bg-[#173f38] text-white/70">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="max-w-sm sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a7f3d0]/50">
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

        <div>
          <h3 className="text-sm font-semibold text-white">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLinkClass}>
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
              <Link href="/sign-in" className={footerLinkClass}>
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/sign-up" className={footerLinkClass}>
                Sign Up
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed">
              <li>Email: TODO — add verified support email</li>
              <li>Phone: TODO — add verified contact number</li>
              <li>Address: TODO — add verified address</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Follow</h3>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span
                aria-label="X profile URL pending"
                title="TODO: add verified X profile URL"
                aria-disabled="true"
                className="flex size-9 cursor-not-allowed items-center justify-center rounded-full border border-white/15 text-white/50"
              >
                <XLogo className="size-4" />
              </span>
              <span className="text-[11px] text-white/45">X: TODO</span>

              <a
                href={CLIENT_REPOSITORY_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-3 py-2 font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a7f3d0]/50"
              >
                GitHub
              </a>
            </div>
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
