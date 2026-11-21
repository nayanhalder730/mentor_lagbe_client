"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  EmptyActivity,
  formatDate,
  OverviewError,
  PageHeading,
  roleTone,
  StatCard,
  StatGrid,
  StatusBadge,
  titleCase,
} from "@/components/dashboard/overview/overview-primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isApiError } from "@/lib/api";
import { deleteUser, listUsers, updateUserRole } from "@/lib/api-endpoints";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { AssignableRole, User, UserListData } from "@/types/api";

const PAGE_SIZE = 10;

type RoleFilter = "all" | UserRole;

const FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "student", label: "Student" },
  { value: "tutor", label: "Tutor" },
  { value: "admin", label: "Admin" },
];

type RoleTarget = {
  user: User;
  role: AssignableRole;
};

type ListState =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: UserListData; error: null };

function describeLoadError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "We couldn't load users. Please try again.";
}

function describeRoleError(error: unknown) {
  if (isApiError(error)) {
    if (error.status === 404) {
      return "That user no longer exists. The list will refresh.";
    }

    if (error.message.trim() !== "") {
      return error.message;
    }
  }

  return "Could not change this user's role. Please try again.";
}

function shouldRefreshAfterRoleError(error: unknown) {
  return isApiError(error) && (error.status === 404 || error.status === 409);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function UserAvatar({ user }: { user: User }) {
  return (
    <Avatar className="size-9 shrink-0">
      {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
      <AvatarFallback className="bg-[#087f75]/10 text-xs font-semibold text-[#075b55] dark:bg-[#087f75]/25 dark:text-[#a7f3d0]">
        {getInitials(user.name) || <UserRound className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );
}

function UsersSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading users…</span>

      <div
        aria-hidden="true"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="rounded-2xl border border-[#075b55]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#081715]"
      >
        <Skeleton className="h-5 w-32" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UsersView({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ListState>({
    status: "loading",
    data: null,
    error: null,
  });
  const [roleTarget, setRoleTarget] = useState<RoleTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listUsers({
      page,
      limit: PAGE_SIZE,
      role: filter === "all" ? undefined : filter,
      search: search === "" ? undefined : search,
    })
      .then((data) => {
        if (!active) return;

        setState({ status: "ready", data, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({ status: "error", data: null, error: describeLoadError(error) });
      });

    return () => {
      active = false;
    };
  }, [page, filter, search, reloadKey]);

  const showLoading = useCallback(() => {
    setState({ status: "loading", data: null, error: null });
  }, []);

  const handleRetry = () => {
    showLoading();
    setReloadKey((key) => key + 1);
  };

  const handleFilterChange = (next: RoleFilter) => {
    if (next === filter) return;

    showLoading();
    setFilter(next);
    setPage(1);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextSearch = searchInput.trim();

    if (nextSearch === search) return;

    showLoading();
    setSearch(nextSearch);
    setPage(1);
  };

  const handleClearSearch = () => {
    if (searchInput === "" && search === "") return;

    showLoading();
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;

    showLoading();
    setPage(nextPage);
  };

  const handleRoleRequest = (user: User, role: AssignableRole) => {
    if (
      processingId ||
      user.id === currentUserId ||
      user.role === role
    ) {
      return;
    }

    setRoleTarget({ user, role });
  };

  const handleConfirmRoleChange = async () => {
    if (!roleTarget || processingId) return;

    const { user, role } = roleTarget;

    setProcessingId(user.id);

    try {
      const updated = await updateUserRole(user.id, role);

      setState((current) =>
        current.status === "ready"
          ? {
              ...current,
              data: {
                ...current.data,
                users: current.data.users.map((item) =>
                  item.id === updated.id ? updated : item,
                ),
              },
            }
          : current,
      );

      toast.success(`${updated.name} is now a ${updated.role}`);
      setRoleTarget(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(describeRoleError(error));

      if (shouldRefreshAfterRoleError(error)) {
        setReloadKey((key) => key + 1);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || processingId) return;

    setProcessingId(deleteTarget.id);

    try {
      await deleteUser(deleteTarget.id);
      toast.success(`${deleteTarget.name} was deleted. Payment history was preserved.`);
      setDeleteTarget(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(describeRoleError(error));
      setReloadKey((key) => key + 1);
    } finally {
      setProcessingId(null);
    }
  };

  const users = useMemo(
    () => (state.status === "ready" ? state.data.users : []),
    [state],
  );

  const roleCounts = useMemo(
    () => ({
      student: users.filter((user) => user.role === "student").length,
      tutor: users.filter((user) => user.role === "tutor").length,
      admin: users.filter((user) => user.role === "admin").length,
    }),
    [users],
  );

  const pagination = state.status === "ready" ? state.data.pagination : null;
  const rangeStart = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const rangeEnd = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  const roleAction = (user: User) => {
    if (user.id === currentUserId) {
      return (
        <span className="text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
          You
        </span>
      );
    }

    const options: AssignableRole[] = ["student", "tutor", "admin"].filter(
      (role) => role !== user.role
    ) as AssignableRole[];

    return (
      <div className="flex flex-wrap justify-end gap-1">
        {options.map((role) => (
          <Button
            key={role}
            type="button"
            size="xs"
            variant="outline"
            disabled={processingId !== null}
            onClick={() => handleRoleRequest(user, role)}
          >
            {processingId === user.id ? (
              <RefreshCw className="animate-spin" aria-hidden="true" />
            ) : null}
            Make {titleCase(role)}
          </Button>
        ))}
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={processingId !== null}
          onClick={() => setDeleteTarget(user)}
          className="text-red-600 hover:text-red-700 dark:text-red-400"
          aria-label={`Delete ${user.name}`}
        >
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Users"
        description="Find registered users and manage student, tutor, and admin roles."
      />

      {state.status === "loading" ? <UsersSkeleton /> : null}

      {state.status === "error" ? (
        <OverviewError
          title="We couldn't load users"
          message={state.error}
          onRetry={handleRetry}
        />
      ) : null}

      {state.status === "ready" && pagination ? (
        <>
          <StatGrid>
            <StatCard
              label={filter === "all" ? "Total users" : `${titleCase(filter)} results`}
              value={pagination.total}
              icon={Users}
              tone="teal"
              hint={filter === "all" ? "All registered users" : "Selected filter"}
            />
            <StatCard
              label="Students on this page"
              value={roleCounts.student}
              icon={UserRound}
              tone="amber"
            />
            <StatCard
              label="Tutors on this page"
              value={roleCounts.tutor}
              icon={UserRound}
              tone="green"
            />
            <StatCard
              label="Admins on this page"
              value={roleCounts.admin}
              icon={UserRound}
              tone="gold"
            />
          </StatGrid>

          <section className="rounded-2xl border border-[#075b55]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#081715]">
            <div className="flex flex-col gap-4 border-b border-[#075b55]/10 p-5 dark:border-white/10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
                    Registered users
                  </h2>
                  <p className="mt-0.5 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                    {pagination.total === 0
                      ? "No users match this filter"
                      : `Showing ${rangeStart}–${rangeEnd} of ${pagination.total}`}
                  </p>
                </div>
                <span className="text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#075b55]/40 dark:text-[#f5f5ed]/40"
                      aria-hidden="true"
                    />
                    <Input
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search name or email"
                      aria-label="Search users by name or email"
                      className="w-full pl-8 sm:w-64"
                    />
                  </div>
                  <Button type="submit" size="sm" variant="outline">
                    Search
                  </Button>
                  {search || searchInput ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleClearSearch}
                      aria-label="Clear search"
                    >
                      <X aria-hidden="true" />
                    </Button>
                  ) : null}
                </form>

                <div
                  role="group"
                  aria-label="Filter users by role"
                  className="flex flex-wrap gap-2"
                >
                  {FILTERS.map(({ value, label }) => {
                    const active = filter === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleFilterChange(value)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f75]/50",
                          active
                            ? "bg-[#075b55] text-white ring-[#075b55] dark:bg-[#d5b36a] dark:text-[#0b1f1c] dark:ring-[#d5b36a]"
                            : "bg-white text-[#075b55]/70 ring-[#075b55]/15 hover:bg-[#087f75]/5 dark:bg-transparent dark:text-[#f5f5ed]/65 dark:ring-white/15 dark:hover:bg-white/5",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {users.length === 0 ? (
              <div className="p-5">
                <EmptyActivity
                  title={search ? "No matching users" : "No users found"}
                  description={
                    search
                      ? "Try a different name, email, or role filter."
                      : "Registered users will appear here."
                  }
                />
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-5">User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="pr-5 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="pl-5">
                            <div className="flex items-center gap-3">
                              <UserAvatar user={user} />
                              <div className="min-w-0">
                                <p
                                  className="truncate font-semibold text-[#075b55] dark:text-[#f5f5ed]"
                                  title={user.name}
                                >
                                  {user.name}
                                </p>
                                <p
                                  className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50"
                                  title={user.email}
                                >
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge tone={roleTone(user.role)}>
                              {titleCase(user.role)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              tone={user.plan === "pro" ? "gold" : "neutral"}
                            >
                              {titleCase(user.plan)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell className="pr-5 text-right">
                            {roleAction(user)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <ul className="space-y-3 p-4 md:hidden">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      className="rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <UserAvatar user={user} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge tone={roleTone(user.role)}>
                          {titleCase(user.role)}
                        </StatusBadge>
                        <StatusBadge
                          tone={user.plan === "pro" ? "gold" : "neutral"}
                        >
                          {titleCase(user.plan)}
                        </StatusBadge>
                        <span className="text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                          Joined {formatDate(user.createdAt)}
                        </span>
                      </div>

                      <div className="mt-3 text-right">{roleAction(user)}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {pagination.totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#075b55]/10 px-5 py-4 dark:border-white/10">
                <p className="text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <ChevronLeft aria-hidden="true" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      <AlertDialog
        open={roleTarget !== null}
        onOpenChange={(open) => {
          if (!open && !processingId) {
            setRoleTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change this user&apos;s role?</AlertDialogTitle>
            <AlertDialogDescription>
              {roleTarget
                ? `${roleTarget.user.name} will change from ${roleTarget.user.role} to ${roleTarget.role}. The last admin account cannot be demoted.`
                : "This user's role will be updated."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingId !== null}>
              Keep role
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={processingId !== null}
              onClick={handleConfirmRoleChange}
            >
              {processingId ? "Saving…" : "Change role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !processingId) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `${deleteTarget.name} (${deleteTarget.email}) will be removed along with their tuitions, related applications and saved-tuition references. Payment history is preserved. This cannot be undone.`
                : "This account will be permanently removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={processingId !== null}
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {processingId ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
