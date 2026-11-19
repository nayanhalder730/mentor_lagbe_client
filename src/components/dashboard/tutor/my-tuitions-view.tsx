"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  approvalStatusTone,
  EmptyActivity,
  formatDate,
  formatNumber,
  OverviewError,
  PageHeading,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  titleCase,
} from "@/components/dashboard/overview/overview-primitives";
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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api";
import {
  deleteTuition,
  listMyTuitions,
  updateTuition,
} from "@/lib/api-endpoints";
import type { Tuition, TuitionMode, UpdateTuitionInput } from "@/types/api";

type TuitionForm = {
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  bannerImage: string;
  description: string;
};

type ListState =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: Tuition[]; error: null };

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function toForm(tuition: Tuition): TuitionForm {
  return {
    title: tuition.title,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode: tuition.mode,
    location: tuition.location,
    monthlyFee: String(tuition.monthlyFee),
    daysPerWeek: String(tuition.daysPerWeek),
    bannerImage: tuition.bannerImage ?? "",
    description: tuition.description,
  };
}

/** Mirrors the backend's required content fields and limits. */
function validateForm(form: TuitionForm): string | null {
  const title = form.title.trim();
  const subject = form.subject.trim();
  const classLevel = form.classLevel.trim();
  const location = form.location.trim();
  const description = form.description.trim();
  const bannerImage = form.bannerImage.trim();

  if (title.length < 5 || title.length > 150) {
    return "Title must be between 5 and 150 characters.";
  }

  if (subject.length < 2 || subject.length > 80) {
    return "Subject must be between 2 and 80 characters.";
  }

  if (classLevel.length < 1 || classLevel.length > 50) {
    return "Class level must be between 1 and 50 characters.";
  }

  if (location.length < 2 || location.length > 120) {
    return "Location must be between 2 and 120 characters.";
  }

  if (description.length < 10 || description.length > 2000) {
    return "Description must be between 10 and 2000 characters.";
  }

  if (form.mode !== "Online" && form.mode !== "Offline") {
    return "Mode must be Online or Offline.";
  }

  const monthlyFee = Number(form.monthlyFee);

  if (
    form.monthlyFee.trim() === "" ||
    !Number.isFinite(monthlyFee) ||
    monthlyFee < 0 ||
    monthlyFee > 1000000
  ) {
    return "Monthly fee must be a number between 0 and 1000000.";
  }

  const daysPerWeek = Number(form.daysPerWeek);

  if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
    return "Days per week must be an integer between 1 and 7.";
  }

  if (bannerImage.length > 2048) {
    return "Banner image URL must be at most 2048 characters.";
  }

  if (bannerImage !== "") {
    try {
      const url = new URL(bannerImage);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "Banner image must be an http(s) URL.";
      }
    } catch {
      return "Banner image must be a valid URL.";
    }
  }

  return null;
}

function toUpdateInput(form: TuitionForm): UpdateTuitionInput {
  return {
    title: form.title.trim(),
    subject: form.subject.trim(),
    classLevel: form.classLevel.trim(),
    mode: form.mode,
    location: form.location.trim(),
    monthlyFee: Number(form.monthlyFee),
    daysPerWeek: Number(form.daysPerWeek),
    bannerImage: form.bannerImage.trim() === "" ? null : form.bannerImage.trim(),
    description: form.description.trim(),
  };
}

function TuitionsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading your tuitions…</span>

      <div
        aria-hidden="true"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: 5 }).map((_, index) => (
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
        <Skeleton className="h-5 w-40" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyTuitionsView() {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ListState>({
    status: "loading",
    data: null,
    error: null,
  });
  const [editing, setEditing] = useState<Tuition | null>(null);
  const [form, setForm] = useState<TuitionForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Tuition | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listMyTuitions()
      .then((tuitions) => {
        if (!active) return;

        setState({ status: "ready", data: tuitions, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({ status: "error", data: null, error: describeError(error) });
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const showLoading = useCallback(() => {
    setState({ status: "loading", data: null, error: null });
  }, []);

  const handleRetry = () => {
    showLoading();
    setReloadKey((key) => key + 1);
  };

  const handleEdit = (tuition: Tuition) => {
    if (processingId) return;

    setEditing(tuition);
    setForm(toForm(tuition));
    setFormError(null);
  };

  const handleSave = async () => {
    if (!editing || !form || processingId) return;

    const validationError = validateForm(form);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const tuitionId = editing.id;
    const wasReviewed = editing.approvalStatus !== "pending";

    setProcessingId(tuitionId);

    try {
      await updateTuition(tuitionId, toUpdateInput(form));

      toast.success(
        wasReviewed
          ? "Tuition updated and resubmitted for review"
          : "Tuition updated",
      );

      setEditing(null);
      setForm(null);
      setFormError(null);
      showLoading();
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting || processingId) return;

    const tuitionId = deleting.id;

    setProcessingId(tuitionId);

    try {
      await deleteTuition(tuitionId);

      toast.success("Tuition deleted");
      setDeleting(null);
      showLoading();
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setProcessingId(null);
    }
  };

  const tuitions = state.status === "ready" ? state.data : [];

  const counts = {
    total: tuitions.length,
    approved: tuitions.filter((item) => item.approvalStatus === "approved")
      .length,
    pending: tuitions.filter((item) => item.approvalStatus === "pending")
      .length,
    rejected: tuitions.filter((item) => item.approvalStatus === "rejected")
      .length,
    active: tuitions.filter((item) => item.isActive).length,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="My tuitions"
        description="Manage the tuitions you have posted, track approval, and update their details."
      />

      {state.status === "loading" ? <TuitionsSkeleton /> : null}

      {state.status === "error" ? (
        <OverviewError
          title="We couldn't load your tuitions"
          message={state.error}
          onRetry={handleRetry}
        />
      ) : null}

      {state.status === "ready" ? (
        <>
          <StatGrid>
            <StatCard
              label="Total tuitions"
              value={counts.total}
              icon={BookOpen}
              tone="teal"
            />
            <StatCard
              label="Approved"
              value={counts.approved}
              icon={BookOpen}
              tone="green"
            />
            <StatCard
              label="Pending review"
              value={counts.pending}
              icon={Clock}
              tone="amber"
            />
            <StatCard
              label="Rejected"
              value={counts.rejected}
              icon={BookOpen}
              tone="red"
            />
            <StatCard
              label="Active"
              value={counts.active}
              icon={BookOpen}
              tone="gold"
            />
          </StatGrid>

          <p className="rounded-xl border border-[#d5b36a]/30 bg-[#d5b36a]/5 px-4 py-3 text-xs text-[#8a6a28] dark:border-[#d5b36a]/25 dark:text-[#e8cf99]">
            Active status is controlled by admins. A tuition can be activated
            only after approval. Editing an approved or rejected tuition sends
            it back to pending review and makes it inactive until re-approved.
          </p>

          <SectionCard
            title="Your tuitions"
            description={`${counts.total} tuition${counts.total === 1 ? "" : "s"} posted, newest first.`}
            icon={BookOpen}
          >
            {tuitions.length === 0 ? (
              <EmptyActivity
                title="No tuitions yet"
                description="Post your first tuition to start receiving student applications."
                action={
                  <Link
                    href="/dashboard/tutor/post-tuition"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Post a tuition
                  </Link>
                }
              />
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-5">Tuition</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="pr-5 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tuitions.map((tuition) => (
                        <TableRow key={tuition.id}>
                          <TableCell className="max-w-[14rem] pl-5">
                            <p
                              className="truncate font-semibold text-[#075b55] dark:text-[#f5f5ed]"
                              title={tuition.title}
                            >
                              {tuition.title}
                            </p>
                            <p className="truncate text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                              {tuition.subject}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[16rem] text-xs text-[#075b55]/70 dark:text-[#f5f5ed]/65">
                            <p>Class {tuition.classLevel} · {tuition.mode}</p>
                            <p className="mt-0.5 flex items-center gap-1.5">
                              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                              <span className="truncate" title={tuition.location}>
                                {tuition.location}
                              </span>
                            </p>
                            <p className="mt-0.5">
                              {tuition.daysPerWeek} day
                              {tuition.daysPerWeek === 1 ? "" : "s"} / week
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatNumber(tuition.monthlyFee)}
                          </TableCell>
                          <TableCell className="text-sm text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(tuition.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-start gap-1.5">
                              <StatusBadge
                                tone={approvalStatusTone(tuition.approvalStatus)}
                              >
                                {titleCase(tuition.approvalStatus)}
                              </StatusBadge>
                              <StatusBadge
                                tone={tuition.isActive ? "green" : "neutral"}
                              >
                                {tuition.isActive ? "Active" : "Inactive"}
                              </StatusBadge>
                            </div>
                          </TableCell>
                          <TableCell className="pr-5 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={processingId !== null}
                                onClick={() => handleEdit(tuition)}
                                aria-label={`Edit ${tuition.title}`}
                              >
                                <Pencil aria-hidden="true" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={processingId !== null}
                                onClick={() => setDeleting(tuition)}
                                aria-label={`Delete ${tuition.title}`}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                              >
                                <Trash2 aria-hidden="true" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <ul className="space-y-3 p-4 md:hidden">
                  {tuitions.map((tuition) => (
                    <li
                      key={tuition.id}
                      className="rounded-xl border border-[#075b55]/10 p-4 dark:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                            {tuition.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                            {tuition.subject}
                          </p>
                        </div>
                        <StatusBadge tone={approvalStatusTone(tuition.approvalStatus)}>
                          {titleCase(tuition.approvalStatus)}
                        </StatusBadge>
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Class level
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {tuition.classLevel}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Mode
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {tuition.mode}
                          </dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Location
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {tuition.location}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Monthly fee
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatNumber(tuition.monthlyFee)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            Days / week
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {tuition.daysPerWeek}
                          </dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="flex items-center gap-1.5 text-[#075b55]/45 dark:text-[#f5f5ed]/40">
                            <CalendarDays className="size-3.5" aria-hidden="true" />
                            Created
                          </dt>
                          <dd className="text-[#075b55]/75 dark:text-[#f5f5ed]/70">
                            {formatDate(tuition.createdAt)}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-3 flex items-center gap-2">
                        <StatusBadge tone={tuition.isActive ? "green" : "neutral"}>
                          {tuition.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={processingId !== null}
                          onClick={() => handleEdit(tuition)}
                          className="flex-1"
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={processingId !== null}
                          onClick={() => setDeleting(tuition)}
                          className="flex-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <Trash2 aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </SectionCard>
        </>
      ) : null}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open && !processingId) {
            setEditing(null);
            setForm(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit tuition</DialogTitle>
            <DialogDescription>
              Update the content of your tuition. Approved or rejected posts
              return to pending review after an edit.
            </DialogDescription>
          </DialogHeader>

          {form ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSave();
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="tuition-title">Title</Label>
                  <Input
                    id="tuition-title"
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tuition-subject">Subject</Label>
                  <Input
                    id="tuition-subject"
                    value={form.subject}
                    onChange={(event) =>
                      setForm({ ...form, subject: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tuition-class-level">Class level</Label>
                  <Input
                    id="tuition-class-level"
                    value={form.classLevel}
                    onChange={(event) =>
                      setForm({ ...form, classLevel: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tuition-mode">Mode</Label>
                  <select
                    id="tuition-mode"
                    value={form.mode}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        mode: event.target.value as TuitionMode,
                      })
                    }
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tuition-location">Location</Label>
                  <Input
                    id="tuition-location"
                    value={form.location}
                    onChange={(event) =>
                      setForm({ ...form, location: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tuition-fee">Monthly fee</Label>
                  <Input
                    id="tuition-fee"
                    type="number"
                    min={0}
                    max={1000000}
                    value={form.monthlyFee}
                    onChange={(event) =>
                      setForm({ ...form, monthlyFee: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tuition-days">Days per week</Label>
                  <Input
                    id="tuition-days"
                    type="number"
                    min={1}
                    max={7}
                    value={form.daysPerWeek}
                    onChange={(event) =>
                      setForm({ ...form, daysPerWeek: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="tuition-banner">Banner image URL (optional)</Label>
                  <Input
                    id="tuition-banner"
                    value={form.bannerImage}
                    onChange={(event) =>
                      setForm({ ...form, bannerImage: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="tuition-description">Description</Label>
                  <Textarea
                    id="tuition-description"
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                  />
                </div>
              </div>

              {formError ? (
                <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                  {formError}
                </p>
              ) : null}

              <DialogFooter>
                <DialogClose render={<Button variant="outline" type="button" disabled={processingId !== null} />}>
                  Cancel
                </DialogClose>
                <Button type="submit" disabled={processingId !== null}>
                  {processingId ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open && !processingId) {
            setDeleting(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tuition?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `${deleting.title} will be permanently removed. Existing applications are not deleted.`
                : "This tuition will be permanently removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingId !== null}>
              Keep tuition
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={processingId !== null}
              onClick={handleDelete}
            >
              {processingId ? "Deleting…" : "Delete tuition"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
