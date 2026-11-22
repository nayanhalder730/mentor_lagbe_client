"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, RefreshCw, Trash2, Upload } from "lucide-react";

import {
  PageHeading,
  SectionCard,
} from "@/components/dashboard/overview/overview-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api";
import { createTuition } from "@/lib/api-endpoints";
import {
  ImgBbError,
  isImgBbConfigured,
  uploadImageToImgBb,
  validateImageFile,
} from "@/lib/imgbb";
import type { CreateTuitionInput, TuitionMode } from "@/types/api";

type FormState = {
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  description: string;
  bannerImage: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "Online",
  location: "",
  monthlyFee: "",
  daysPerWeek: "",
  description: "",
  bannerImage: "",
};

/** Mirrors POST /api/tuitions validation for the required content fields. */
function validateForm(form: FormState): string | null {
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

function toCreateInput(form: FormState): CreateTuitionInput {
  return {
    title: form.title.trim(),
    subject: form.subject.trim(),
    classLevel: form.classLevel.trim(),
    mode: form.mode,
    location: form.location.trim(),
    monthlyFee: Number(form.monthlyFee),
    daysPerWeek: Number(form.daysPerWeek),
    description: form.description.trim(),
    bannerImage: form.bannerImage.trim() === "" ? null : form.bannerImage.trim(),
  };
}

export default function PostTuitionView() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const imgbbConfigured = isImgBbConfigured();
  const busy = uploading || submitting;

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setUploadError(null);

    if (file) {
      const validationError = validateImageFile(file);

      if (validationError) {
        setUploadError(validationError);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || busy) return;

    setUploading(true);
    setUploadError(null);

    try {
      const url = await uploadImageToImgBb(selectedFile);

      updateField("bannerImage", url);
      toast.success("Banner image uploaded");
    } catch (error) {
      const message =
        error instanceof ImgBbError
          ? error.message
          : "Image upload failed. Please try again.";

      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (busy) return;

    updateField("bannerImage", "");
    setSelectedFile(null);
    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Ref guard is synchronous: two submit events in one React batch cannot
    // both start a request before setSubmitting() re-renders the button.
    if (busy || submittingRef.current) return;

    const validationError = validateForm(form);

    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }

    setFormError(null);
    submittingRef.current = true;
    setSubmitting(true);

    let created = false;

    try {
      await createTuition(toCreateInput(form));
      created = true;

      toast.success("Tuition created and submitted for approval");

      setForm(INITIAL_FORM);
      setSelectedFile(null);
      setUploadError(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const message = isApiError(error)
        ? error.message
        : "Could not create your tuition. Please try again.";

      setFormError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }

    // Navigation is separate from creation: a failure here must never be
    // reported as a failed insert, which already returned 201.
    if (created) {
      try {
        router.push("/dashboard/tutor/my-tuitions");
        router.refresh();
      } catch {
        toast.message("Tuition saved. Open My Tuitions to view it.");
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Post a tuition"
        description="Create a tuition listing for students. New posts start pending admin review."
      />

      <p className="rounded-xl border border-[#087f75]/20 bg-[#087f75]/5 px-4 py-3 text-xs text-[#075b55]/75 dark:border-[#087f75]/30 dark:text-[#f5f5ed]/65">
        Free tutors can publish up to 2 tuitions; Pro tutors have no limit. The
        limit is enforced by the server, and approval/visibility are decided by
        admins after you submit.
      </p>

      <SectionCard
        title="Tuition details"
        description="All fields are required except the banner image."
        icon={BookOpen}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset disabled={busy} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="e.g. HSC Physics Concept Batch"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(event) => updateField("subject", event.target.value)}
                  placeholder="e.g. Physics"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="classLevel">Class level</Label>
                <Input
                  id="classLevel"
                  value={form.classLevel}
                  onChange={(event) =>
                    updateField("classLevel", event.target.value)
                  }
                  placeholder="e.g. HSC"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mode">Mode</Label>
                <select
                  id="mode"
                  value={form.mode}
                  onChange={(event) =>
                    updateField("mode", event.target.value as TuitionMode)
                  }
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="e.g. Dhanmondi, Dhaka"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="monthlyFee">Monthly fee</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  min={0}
                  max={1000000}
                  value={form.monthlyFee}
                  onChange={(event) =>
                    updateField("monthlyFee", event.target.value)
                  }
                  placeholder="e.g. 3000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="daysPerWeek">Days per week</Label>
                <Input
                  id="daysPerWeek"
                  type="number"
                  min={1}
                  max={7}
                  value={form.daysPerWeek}
                  onChange={(event) =>
                    updateField("daysPerWeek", event.target.value)
                  }
                  placeholder="1–7"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe the syllabus, schedule, and teaching approach."
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bannerImage">Banner image</Label>

                {!imgbbConfigured ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600 dark:text-red-400"
                  >
                    Image uploads are unavailable. Set NEXT_PUBLIC_IMGBB_API_KEY
                    in your environment and restart the app.
                  </p>
                ) : null}

                <input
                  ref={fileInputRef}
                  id="bannerImage"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                  onChange={(event) =>
                    handleFileChange(event.target.files?.[0] ?? null)
                  }
                  className="block w-full min-w-0 text-xs text-[#075b55]/70 file:mr-3 file:rounded-lg file:border-0 file:bg-[#087f75]/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#075b55] hover:file:bg-[#087f75]/15 dark:text-[#f5f5ed]/65 dark:file:bg-[#087f75]/20 dark:file:text-[#7fe0d2]"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedFile || busy || !imgbbConfigured}
                    onClick={handleUpload}
                  >
                    {uploading ? (
                      <RefreshCw className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload aria-hidden="true" />
                    )}
                    {uploading ? "Uploading…" : "Upload image"}
                  </Button>
                  <span className="text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                    JPG, PNG, GIF, WEBP or BMP · up to 32 MB
                  </span>
                </div>

                {uploadError ? (
                  <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                    {uploadError}
                  </p>
                ) : null}

                {form.bannerImage ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[#075b55]/10 p-3 dark:border-white/10">
                    <div
                      role="img"
                      aria-label="Banner image preview"
                      className="size-20 shrink-0 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url("${form.bannerImage}")` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                        Banner ready
                      </p>
                      <p
                        className="truncate text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45"
                        title={form.bannerImage}
                      >
                        {form.bannerImage}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy}
                      onClick={handleRemoveImage}
                      aria-label="Remove banner image"
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </fieldset>

          {formError ? (
            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-[#075b55]/10 pt-4 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setForm(INITIAL_FORM);
                setSelectedFile(null);
                setUploadError(null);
                setFormError(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={busy}>
              {submitting ? (
                <RefreshCw className="animate-spin" aria-hidden="true" />
              ) : (
                <BookOpen aria-hidden="true" />
              )}
              {submitting ? "Publishing…" : "Publish tuition"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
