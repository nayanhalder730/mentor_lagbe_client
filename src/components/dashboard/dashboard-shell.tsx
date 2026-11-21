"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bookmark,
  BookOpen,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Receipt,
  Sun,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { signOut } from "@/lib/auth-client";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export type DashboardRole = UserRole;

type DashboardUser = {
  name: string;
  email: string;
  image?: string | null;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const roleDetails: Record<
  DashboardRole,
  { label: string; workspace: string; badge: string }
> = {
  student: {
    label: "Student",
    workspace: "Student workspace",
    badge:
      "bg-[#087f75]/10 text-[#075b55] ring-[#087f75]/20 dark:bg-[#087f75]/20 dark:text-[#7fe0d2] dark:ring-[#087f75]/30",
  },
  tutor: {
    label: "Tutor",
    workspace: "Tutor workspace",
    badge:
      "bg-[#d5b36a]/20 text-[#8a6a28] ring-[#d5b36a]/40 dark:bg-[#d5b36a]/15 dark:text-[#e8cf99] dark:ring-[#d5b36a]/30",
  },
  admin: {
    label: "Admin",
    workspace: "Admin workspace",
    badge:
      "bg-[#075b55] text-white ring-[#075b55]/30 dark:bg-[#d5b36a] dark:text-[#0b1f1c] dark:ring-[#d5b36a]/40",
  },
};

const navByRole: Record<DashboardRole, NavItem[]> = {
  student: [
    {
      href: "/dashboard/student",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/student/my-applications",
      label: "My Applications",
      icon: FileText,
    },
    {
      href: "/dashboard/student/saved-tuitions",
      label: "Saved Tuitions",
      icon: Bookmark,
    },
    {
      href: "/dashboard/profile",
      label: "Update Profile",
      icon: UserRound,
    },
  ],
  tutor: [
    {
      href: "/dashboard/tutor",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/tutor/post-tuition",
      label: "Post Tuition",
      icon: PlusCircle,
    },
    {
      href: "/dashboard/tutor/my-tuitions",
      label: "My Tuitions",
      icon: BookOpen,
    },
    {
      href: "/dashboard/tutor/applicants",
      label: "Applicants",
      icon: Users,
    },
    {
      href: "/dashboard/profile",
      label: "Update Profile",
      icon: UserRound,
    },
  ],
  admin: [
    {
      href: "/dashboard/admin",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/admin/users",
      label: "Users",
      icon: Users,
    },
    {
      href: "/dashboard/admin/tuitions",
      label: "Tuitions",
      icon: BookOpen,
    },
    {
      href: "/dashboard/admin/transactions",
      label: "Transactions",
      icon: Receipt,
    },
    {
      href: "/dashboard/profile",
      label: "Update Profile",
      icon: UserRound,
    },
  ],
};

/**
 * Finds the navigation item that best matches the current pathname.
 * Exact matches win; otherwise the longest href prefix wins, so nested routes
 * such as `/dashboard/tutor/applicants/<id>` still highlight their section.
 */
function findNavItem(items: NavItem[], pathname: string) {
  let match: NavItem | null = null;

  for (const item of items) {
    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`);

    if (matches && (!match || item.href.length > match.href.length)) {
      match = item;
    }
  }

  return match;
}

/**
 * Human-readable title for routes that have no navigation entry yet.
 */
function formatRouteTitle(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).at(-1);

  if (!segment) return "Dashboard";

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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
  role: DashboardRole;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1 ring-inset",
        roleDetails[role].badge,
        className
      )}
    >
      {roleDetails[role].label}
    </span>
  );
}

function UserAvatar({
  user,
  className,
}: {
  user: DashboardUser;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
      <AvatarFallback className="bg-[#087f75]/10 text-xs font-semibold text-[#075b55] dark:bg-[#087f75]/25 dark:text-[#a7f3d0]">
        {getInitials(user.name) || <UserRound className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );
}

function SidebarContent({
  role,
  user,
  activeHref,
  onNavigate,
  onSignOut,
  signingOut,
}: {
  role: DashboardRole;
  user: DashboardUser;
  activeHref: string | null;
  onNavigate: () => void;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const items = navByRole[role];
  const homeHref = items[0]?.href ?? "/dashboard";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[#075b55]/10 px-4 py-5 dark:border-white/10">
        <Link
          href={homeHref}
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50"
        >
          <Image
            src="/Supportive Education Mentorship Emblem.png"
            alt="MentorLagbe Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="text-lg font-extrabold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
            Mentor
            <span className="text-[#087f75] dark:text-[#7fe0d2]">Lagbe</span>
          </span>
        </Link>

        <p className="mt-3 text-xs font-medium tracking-wide text-[#075b55]/55 uppercase dark:text-[#f5f5ed]/50">
          {roleDetails[role].workspace}
        </p>
      </div>

      <nav
        aria-label={`${roleDetails[role].label} dashboard`}
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === activeHref;

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50",
                active
                  ? "bg-[#087f75]/10 text-[#075b55] dark:bg-[#087f75]/20 dark:text-[#a7f3d0]"
                  : "text-[#075b55]/70 hover:bg-[#087f75]/5 hover:text-[#075b55] dark:text-[#f5f5ed]/65 dark:hover:bg-white/5 dark:hover:text-[#f5f5ed]"
              )}
            >
              <Icon
                className={cn(
                  "size-4.5",
                  active
                    ? "text-[#087f75] dark:text-[#7fe0d2]"
                    : "text-[#075b55]/50 dark:text-[#f5f5ed]/50"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#075b55]/10 p-3 dark:border-white/10">
        <Link
          href="/"
          className="mb-3 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[#075b55]/70 transition-colors duration-200 hover:bg-[#087f75]/5 hover:text-[#075b55] dark:text-[#f5f5ed]/65 dark:hover:bg-white/5 dark:hover:text-[#f5f5ed]"
        >
          <Home className="size-4.5 text-[#075b55]/50 dark:text-[#f5f5ed]/50" />
          Back to website
        </Link>

        <div className="flex items-center gap-2.5 rounded-xl border border-[#075b55]/10 p-2.5 dark:border-white/10">
          <UserAvatar user={user} className="size-9" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
              {user.name}
            </p>
            <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
              {user.email}
            </p>
          </div>

          <RoleBadge role={role} />
        </div>

        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="size-4.5" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export default function DashboardShell({
  role,
  user,
  children,
}: {
  role: DashboardRole;
  user: DashboardUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const items = navByRole[role];
  const activeItem = findNavItem(items, pathname);
  const currentTitle = activeItem?.label ?? formatRouteTitle(pathname);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await signOut();
      toast.success("Signed out successfully.");
    } finally {
      closeSidebar();
      router.replace("/sign-in");
      router.refresh();
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5ed]/50 dark:bg-[#06110f]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#075b55]/10 bg-white lg:block dark:border-white/10 dark:bg-[#081715]">
        <SidebarContent
          role={role}
          user={user}
          activeHref={activeItem?.href ?? null}
          onNavigate={closeSidebar}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeSidebar}
            className="absolute inset-0 h-full w-full cursor-default bg-[#062d29]/45 backdrop-blur-sm"
          />

          <div
            id="dashboard-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-[#075b55]/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#081715]"
          >
            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close navigation"
              className="absolute top-4 right-3 flex size-9 items-center justify-center rounded-full text-[#075b55] transition-colors hover:bg-[#087f75]/5 dark:text-[#f5f5ed] dark:hover:bg-white/5"
            >
              <X className="size-5" />
            </button>

            <SidebarContent
              role={role}
              user={user}
              activeHref={activeItem?.href ?? null}
              onNavigate={closeSidebar}
              onSignOut={handleSignOut}
              signingOut={signingOut}
            />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        {/* Dashboard header */}
        <header className="sticky top-0 z-30 border-b border-[#075b55]/10 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#081715]/90">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                aria-controls="dashboard-sidebar"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#075b55]/15 text-[#075b55] transition-colors hover:bg-[#087f75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 lg:hidden dark:border-white/15 dark:text-[#f5f5ed] dark:hover:bg-white/5"
              >
                <Menu className="size-5" />
              </button>

              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-[#075b55]/50 uppercase dark:text-[#f5f5ed]/45">
                  {roleDetails[role].workspace}
                </p>
                <h1 className="truncate text-lg font-bold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
                  {currentTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RoleBadge role={role} className="hidden sm:inline-flex" />

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
                }
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="flex size-9 items-center justify-center rounded-full border border-[#075b55]/15 text-[#075b55] transition-colors hover:bg-[#087f75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:border-white/15 dark:text-[#f5f5ed] dark:hover:bg-white/5"
              >
                {theme === "dark" ? (
                  <Sun className="size-4" aria-hidden="true" />
                ) : (
                  <Moon className="size-4" aria-hidden="true" />
                )}
              </button>

              <Link
                href="/dashboard/profile"
                aria-label="Open profile"
                className="flex items-center gap-2 rounded-full border border-transparent p-1 transition-colors hover:bg-[#087f75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 dark:hover:bg-white/5"
              >
                <UserAvatar user={user} className="size-8" />
                <span className="hidden max-w-28 truncate text-sm font-semibold text-[#075b55] sm:block dark:text-[#f5f5ed]">
                  {user.name}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                aria-label="Sign out"
                className="flex size-9 items-center justify-center rounded-full border border-[#075b55]/15 text-[#075b55] transition-colors hover:bg-[#087f75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:text-[#f5f5ed] dark:hover:bg-white/5"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
