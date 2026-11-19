"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, Trash2, Upload, UserRound } from "lucide-react";

import {
  formatDate,
  OverviewError,
  PageHeading,
  roleTone,
  SectionCard,
  StatusBadge,
  titleCase,
} from "@/components/dashboard/overview/overview-primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api";
import { getMyProfile, updateMyProfile } from "@/lib/api-endpoints";
import {
  ImgBbError,
  isImgBbConfigured,
  uploadImageToImgBb,
  validateImageFile,
} from "@/lib/imgbb";
import type { UpdateProfileInput, User } from "@/types/api";

type ProfileForm = {
  name: string;
  phone: string;
  bio: string;
  image: string | null;
};

type ProfileState =
  | { status: "loading"; profile: null; error: null }
  | { status: "error"; profile: null; error: string }
  | { status: "ready"; profile: User; error: null };

const EMPTY_FORM: ProfileForm = { name: "", phone: "", bio: "", image: null };

function describeError(error: unknown) {
  if (isApiError(error) && error.message.trim() !== "") {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function toForm(profile: User): ProfileForm {
  return {
    name: profile.name,
    phone: profile.phone ?? "",
    bio: profile.bio ?? "",
    image: profile.image,
  };
}

/** Mirrors PATCH /api/users/me field validation exactly. */
function validateProfileForm(form: ProfileForm): string | null {
  const name = form.name.trim();

  if (name.length < 1 || name.length > 100) {
    return "Name must be between 1 and 100 characters.";
  }

  const phone = form.phone.trim();

  if (phone !== "" && (phone.length < 6 || phone.length > 30)) {
    return "Phone must be between 6 and 30 characters.";
  }

  const bio = form.bio.trim();

  if (bio.length > 500) {
    return "Bio must be at most 500 characters.";
  }

  if (form.image) {
    if (form.image.length > 2048) {
      return "Profile image URL must be at most 2048 characters.";
    }

    try {
      const url = new URL(form.image);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "Profile image must be an http(s) URL.";
      }
    } catch {
      return "Profile image must be a valid URL.";
    }
  }

  return null;
}

function toUpdateInput(form: ProfileForm): UpdateProfileInput {
  return {
    name: form.name.trim(),
    phone: form.phone.trim() === "" ? null : form.phone.trim(),
    bio: form.bio.trim() === "" ? null : form.bio.trim(),
    image: form.image,
  };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function ProfileSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading your profile…</span>

      <div
        aria-hidden="true"
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#081715]">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="size-24 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#075b55]/10 bg-white p-6 shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-[#081715]">
          <Skeleton className="h-5 w-40" />
          <div className="mt-5 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileView() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ProfileState>({
    status: "loading",
    profile: null,
    error: null,
  });
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const imgbbConfigured = isImgBbConfigured();
  const busy = uploading || saving;

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((profile) => {
        if (!active) return;

        setState({ status: "ready", profile, error: null });
        setForm(toForm(profile));
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({
          status: "error",
          profile: null,
          error: describeError(error),
        });
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setState({ status: "loading", profile: null, error: null });
    setReloadKey((key) => key + 1);
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

      setForm((current) => ({ ...current, image: url }));
      toast.success("Profile image uploaded");
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

    setForm((current) => ({ ...current, image: null }));
    setSelectedFile(null);
    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (busy) return;

    const validationError = validateProfileForm(form);

    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }

    setFormError(null);
    setSaving(true);

    try {
      const updated = await updateMyProfile(toUpdateInput(form));

      setState({ status: "ready", profile: updated, error: null });
      setForm(toForm(updated));
      setSelectedFile(null);
      setUploadError(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Profile updated");
      router.refresh();
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setSaving(false);
    }
  };

  const profile = state.status === "ready" ? state.profile : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title="Update profile"
        description="Manage your personal details and profile picture. Email, role, and plan are managed elsewhere."
      />

      {state.status === "loading" ? <ProfileSkeleton /> : null}

      {state.status === "error" ? (
        <OverviewError
          title="We couldn't load your profile"
          message={state.error}
          onRetry={handleRetry}
        />
      ) : null}

      {state.status === "ready" && profile ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Account overview"
            description="Your current account information."
            icon={UserRound}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="size-24">
                {form.image ? (
                  <AvatarImage src={form.image} alt={form.name} />
                ) : null}
                <AvatarFallback className="bg-[#087f75]/10 text-xl font-bold text-[#075b55] dark:bg-[#087f75]/25 dark:text-[#a7f3d0]">
                  {getInitials(form.name) || <UserRound className="size-7" />}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-lg font-semibold text-[#075b55] dark:text-[#f5f5ed]">
                  {profile.name}
                </p>
                <p className="text-sm text-[#075b55]/55 dark:text-[#f5f5ed]/50">
                  {profile.email}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <StatusBadge tone={roleTone(profile.role)}>
                  {titleCase(profile.role)}
                </StatusBadge>
                <StatusBadge
                  tone={profile.plan === "pro" ? "gold" : "neutral"}
                >
                  {titleCase(profile.plan)} plan
                </StatusBadge>
              </div>

              <p className="text-xs text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                Member since {formatDate(profile.createdAt)}
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-[#075b55]/10 p-4 text-xs text-[#075b55]/60 dark:border-white/10 dark:text-[#f5f5ed]/55">
              Email, role, and plan are read-only here. Contact an administrator
              if they need to change.
            </div>
          </SectionCard>

          <SectionCard
            title="Edit profile"
            description="Only name, image, phone, and bio can be changed."
            icon={UserRound}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <fieldset disabled={busy} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="profile-name">Name</Label>
                    <Input
                      id="profile-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      value={profile.email}
                      readOnly
                      disabled
                      className="opacity-70"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input
                      id="profile-phone"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="profile-bio">Bio</Label>
                    <Textarea
                      id="profile-bio"
                      rows={4}
                      value={form.bio}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          bio: event.target.value,
                        }))
                      }
                      placeholder="Tell students or tutors a little about yourself."
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="profile-image">Profile image</Label>

                    {!imgbbConfigured ? (
                      <p
                        role="alert"
                        className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600 dark:text-red-400"
                      >
                        Image uploads are unavailable. Set
                        NEXT_PUBLIC_IMGBB_API_KEY in your environment and restart
                        the app.
                      </p>
                    ) : null}

                    <input
                      ref={fileInputRef}
                      id="profile-image"
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

                      {form.image ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={handleRemoveImage}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 aria-hidden="true" />
                          Remove
                        </Button>
                      ) : null}

                      <span className="text-[11px] text-[#075b55]/50 dark:text-[#f5f5ed]/45">
                        JPG, PNG, GIF, WEBP or BMP · up to 32 MB
                      </span>
                    </div>

                    {uploadError ? (
                      <p
                        role="alert"
                        className="text-xs font-medium text-red-600 dark:text-red-400"
                      >
                        {uploadError}
                      </p>
                    ) : null}
                  </div>
                </div>
              </fieldset>

              {formError ? (
                <p
                  role="alert"
                  className="text-xs font-medium text-red-600 dark:text-red-400"
                >
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 border-t border-[#075b55]/10 pt-4 dark:border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setForm(toForm(profile));
                    setSelectedFile(null);
                    setUploadError(null);
                    setFormError(null);

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Discard changes
                </Button>
                <Button type="submit" disabled={busy}>
                  {saving ? (
                    <RefreshCw className="animate-spin" aria-hidden="true" />
                  ) : null}
                  {saving ? "Saving…" : "Save profile"}
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
