"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { signOut, useSession } from "@/lib/auth-client";
import { normalizeRole, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

const roleDetails: Record<
  UserRole,
  { label: string; badge: string; dashboard: string }
> = {
  student: {
    label: "Student",
    dashboard: "/dashboard/student",
    badge:
      "bg-[#087f75]/10 text-[#075b55] ring-[#087f75]/20 dark:bg-[#087f75]/20 dark:text-[#7fe0d2] dark:ring-[#087f75]/30",
  },
  tutor: {
    label: "Tutor",
    dashboard: "/dashboard/tutor",
    badge:
      "bg-[#d5b36a]/20 text-[#8a6a28] ring-[#d5b36a]/40 dark:bg-[#d5b36a]/15 dark:text-[#e8cf99] dark:ring-[#d5b36a]/30",
  },
  admin: {
    label: "Admin",
    dashboard: "/dashboard/admin",
    badge:
      "bg-[#075b55] text-white ring-[#075b55]/30 dark:bg-[#d5b36a] dark:text-[#0b1f1c] dark:ring-[#d5b36a]/40",
  },
};

function getInitials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (parts.length === 0) return "";

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function RoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  const details = roleDetails[role];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1 ring-inset",
        details.badge,
        className
      )}
    >
      {details.label}
    </span>
  );
}

function ThemeIcon({ className }: { className?: string }) {
  return (
    <>
      <Moon className={cn("size-4 dark:hidden", className)} />
      <Sun className={cn("hidden size-4 dark:block", className)} />
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const role = normalizeRole(user?.role);
  const roleInfo = roleDetails[role];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await signOut();
    } finally {
      setOpen(false);
      router.push("/sign-in");
      router.refresh();
      setSigningOut(false);
    }
  };

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#075b55]/10 bg-white/95 shadow-[0_1px_2px_rgba(7,91,85,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-[#081715]/95">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          aria-label="MentorLagbe home"
          onClick={closeMenu}
          className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#081715]"
        >
          <Image
            src="/Supportive Education Mentorship Emblem.png"
            alt="MentorLagbe Logo"
            width={40}
            height={40}
            priority
            className="h-10 w-10 shrink-0 object-contain"
          />
          <span className="truncate text-[1.3rem] leading-none font-extrabold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
            Mentor<span className="text-[#087f75] dark:text-[#7fe0d2]">Lagbe</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-0.5 lg:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50",
                isActive(link.href)
                  ? "bg-[#087f75]/10 text-[#075b55] dark:bg-[#087f75]/20 dark:text-[#a7f3d0]"
                  : "text-[#075b55]/70 hover:bg-[#087f75]/5 hover:text-[#075b55] dark:text-[#f5f5ed]/65 dark:hover:bg-white/5 dark:hover:text-[#f5f5ed]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            className="flex size-9 items-center justify-center rounded-full border border-[#075b55]/15 text-[#075b55] transition-colors duration-200 hover:border-[#087f75]/30 hover:bg-[#087f75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:border-white/15 dark:text-[#f5f5ed] dark:hover:bg-white/5"
          >
            <ThemeIcon />
          </button>

          {isPending ? (
            <div
              aria-hidden="true"
              className="size-9 animate-pulse rounded-full bg-[#075b55]/10 dark:bg-white/10"
            />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-full border border-[#075b55]/10 py-1 pr-2 pl-1 transition-colors duration-200 hover:bg-[#087f75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 data-[popup-open]:bg-[#087f75]/5 dark:border-white/10 dark:hover:bg-white/5 dark:data-[popup-open]:bg-white/5"
                aria-label={`Account menu for ${user.name}`}
              >
                <Avatar className="size-8">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-[#087f75]/10 text-xs font-semibold text-[#075b55] dark:bg-[#087f75]/25 dark:text-[#a7f3d0]">
                    {getInitials(user.name) || <UserRound className="size-4" />}
                  </AvatarFallback>
                </Avatar>

                <span className="hidden max-w-28 truncate text-sm font-semibold text-[#075b55] lg:block dark:text-[#f5f5ed]">
                  {user.name}
                </span>

                <RoleBadge role={role} className="hidden lg:inline-flex" />

                <ChevronDown className="size-4 text-[#075b55]/50 dark:text-[#f5f5ed]/50" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-64 rounded-2xl border border-[#075b55]/10 bg-white p-2 text-[#173f38] shadow-xl shadow-[#075b55]/10 dark:border-white/10 dark:bg-[#0d2320] dark:text-[#f5f5ed]"
              >
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <Avatar className="size-10">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-[#087f75]/10 text-sm font-semibold text-[#075b55] dark:bg-[#087f75]/25 dark:text-[#a7f3d0]">
                      {getInitials(user.name) || (
                        <UserRound className="size-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                      {user.email}
                    </p>
                  </div>

                  <RoleBadge role={role} />
                </div>

                <DropdownMenuSeparator className="my-1 bg-[#075b55]/10 dark:bg-white/10" />

                <DropdownMenuItem
                  onClick={() => router.push(roleInfo.dashboard)}
                  className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-sm font-medium focus:bg-[#087f75]/8 focus:text-[#075b55] dark:focus:bg-white/8 dark:focus:text-[#f5f5ed]"
                >
                  <LayoutDashboard className="size-4 text-[#087f75] dark:text-[#7fe0d2]" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                  className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-sm font-medium focus:bg-[#087f75]/8 focus:text-[#075b55] dark:focus:bg-white/8 dark:focus:text-[#f5f5ed]"
                >
                  <UserRound className="size-4 text-[#087f75] dark:text-[#7fe0d2]" />
                  Update Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-[#075b55]/10 dark:bg-white/10" />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={signingOut}
                  variant="destructive"
                  className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-600 data-disabled:cursor-not-allowed data-disabled:opacity-60 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-400"
                >
                  <LogOut className="size-4" />
                  {signingOut ? "Signing out…" : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-[#075b55] transition-colors duration-200 hover:bg-[#087f75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:text-[#f5f5ed] dark:hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-[#087f75] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#087f75]/20 transition-colors duration-200 hover:bg-[#075b55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#081715]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex size-10 items-center justify-center rounded-full border border-[#075b55]/15 text-[#075b55] transition-colors duration-200 hover:bg-[#087f75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 lg:hidden dark:border-white/15 dark:text-[#f5f5ed] dark:hover:bg-white/5"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile navigation */}
      {open ? (
        <div
          id="mobile-nav"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-[#075b55]/10 bg-white px-4 pt-3 pb-6 lg:hidden dark:border-white/10 dark:bg-[#081715]"
        >
          <nav aria-label="Mobile primary" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  isActive(link.href)
                    ? "bg-[#087f75]/10 text-[#075b55] dark:bg-[#087f75]/20 dark:text-[#a7f3d0]"
                    : "text-[#075b55]/75 hover:bg-[#087f75]/5 hover:text-[#075b55] dark:text-[#f5f5ed]/70 dark:hover:bg-white/5 dark:hover:text-[#f5f5ed]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 border-t border-[#075b55]/10 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-xl border border-[#075b55]/15 px-3 py-2.5 text-sm font-medium text-[#075b55] transition-colors duration-200 hover:bg-[#087f75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:border-white/15 dark:text-[#f5f5ed] dark:hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <ThemeIcon />
                <span className="dark:hidden">Dark mode</span>
                <span className="hidden dark:inline">Light mode</span>
              </span>
              <span className="text-xs font-normal text-[#075b55]/50 dark:text-[#f5f5ed]/50">
                Toggle
              </span>
            </button>

            {isPending ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#075b55]/10 p-3 dark:border-white/10">
                <div
                  aria-hidden="true"
                  className="size-10 animate-pulse rounded-full bg-[#075b55]/10 dark:bg-white/10"
                />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-[#075b55]/10 dark:bg-white/10" />
                  <div className="h-2.5 w-32 animate-pulse rounded-full bg-[#075b55]/10 dark:bg-white/10" />
                </div>
              </div>
            ) : user ? (
              <>
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#075b55]/10 p-3 dark:border-white/10">
                  <Avatar className="size-10">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-[#087f75]/10 text-sm font-semibold text-[#075b55] dark:bg-[#087f75]/25 dark:text-[#a7f3d0]">
                      {getInitials(user.name) || (
                        <UserRound className="size-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-[#075b55]/60 dark:text-[#f5f5ed]/55">
                      {user.email}
                    </p>
                  </div>

                  <RoleBadge role={role} />
                </div>

                <div className="mt-2 flex flex-col gap-1">
                  <Link
                    href={roleInfo.dashboard}
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#075b55] transition-colors duration-200 hover:bg-[#087f75]/5 dark:text-[#f5f5ed] dark:hover:bg-white/5"
                  >
                    <LayoutDashboard className="size-4 text-[#087f75] dark:text-[#7fe0d2]" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#075b55] transition-colors duration-200 hover:bg-[#087f75]/5 dark:text-[#f5f5ed] dark:hover:bg-white/5"
                  >
                    <UserRound className="size-4 text-[#087f75] dark:text-[#7fe0d2]" />
                    Update Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <LogOut className="size-4" />
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  onClick={closeMenu}
                  className="rounded-full border border-[#075b55]/15 px-4 py-2.5 text-center text-sm font-semibold text-[#075b55] transition-colors duration-200 hover:bg-[#087f75]/5 dark:border-white/15 dark:text-[#f5f5ed] dark:hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className="rounded-full bg-[#087f75] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#075b55]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
