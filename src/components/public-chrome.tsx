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
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/terms" className={footerLinkClass}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={footerLinkClass}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Source</h3>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
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
