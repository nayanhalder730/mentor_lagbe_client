"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  Users,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClientYear } from "@/hooks/use-client-year";
import { authClient } from "@/lib/auth-client";

type Role = "student" | "tutor";
type FieldName = "name" | "email" | "password" | "confirmPassword" | "terms";
type FormErrors = Partial<Record<FieldName, string>>;

const roles: { value: Role; title: string; desc: string; icon: typeof User }[] =
  [
    {
      value: "student",
      title: "Student",
      desc: "Find a tutor",
      icon: GraduationCap,
    },
    {
      value: "tutor",
      title: "Tutor",
      desc: "Teach & earn",
      icon: Users,
    },
  ];

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4
}

const strengthMeta = [
  { label: "Too short", color: "bg-slate-200", text: "text-slate-400" },
  { label: "Weak", color: "bg-red-400", text: "text-red-500" },
  { label: "Fair", color: "bg-amber-400", text: "text-amber-500" },
  { label: "Good", color: "bg-emerald-400", text: "text-emerald-600" },
  { label: "Strong", color: "bg-[#0b927e]", text: "text-[#087f75]" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
      <span className="h-1 w-1 rounded-full bg-red-500" />
      {message}
    </p>
  );
}

type SocialProvider = "google" | "github";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const providers: Array<{
  id: SocialProvider;
  label: string;
  icon: ReactNode;
}> = [
  { id: "google", label: "Google", icon: <GoogleIcon /> },
  { id: "github", label: "GitHub", icon: <GitHubIcon /> },
];

function SocialLoginButtons() {
  const [pending, setPending] = useState<SocialProvider | null>(null);

  const handleSocialSignIn = async (provider: SocialProvider) => {
    if (pending) return;

    setPending(provider);

    try {
      // Do NOT sign out here. BetterAuth validates the existing session during
      // the OAuth callback when it links a social identity to an email account;
      // revoking it first causes "unable_to_link_account" after Authorize and
      // forces users to retry, which trips GitHub's sign-in rate limit.
      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/dashboard`,
        disableRedirect: true,
      });

      if (error) {
        toast.error(`Could not start ${provider} sign-in.`, {
          description: error.message || "Please try again.",
        });
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
      } else {
        toast.error("Unable to get authentication URL.");
      }
    } catch (error) {
      console.error("Social sign-in error:", error);
      toast.error("Could not start social sign-in. Please try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {providers.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            disabled={pending !== null}
            onClick={() => handleSocialSignIn(id)}
            className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#0b927e] hover:bg-[#f2faf7] hover:text-[#087f75] hover:shadow-md hover:shadow-[#087f75]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b927e] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {pending === id ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              icon
            )}
            {pending === id ? "Connecting..." : label}
          </button>
        ))}
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </>
  );
}

const brandFeatures = [
  {
    icon: ShieldCheck,
    title: "Admin-reviewed tuitions",
    description: "Public listings appear after approval.",
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

function AuthBrandPanel() {
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
            {brandFeatures.map(({ icon: Icon, title, description }) => (
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

        {/* Product value statements */}
        <div className="space-y-6 border-t border-white/15 pt-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#d1fae5] uppercase">
            What you can do here
          </p>
          <ul className="space-y-2 text-sm text-white/75">
            {[
              "Learn with the right mentor.",
              "Explore tuition opportunities.",
              "Manage your learning journey in one place.",
            ].map((statement) => (
              <li key={statement} className="flex items-start gap-2.5">
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#a7f3d0]"
                  aria-hidden="true"
                />
                {statement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default function SignUpPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [role, setRole] = useState<Role>("student");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const year = useClientYear();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const strength = useMemo(
    () => getStrength(formData.password),
    [formData.password],
  );
  const meta = formData.password
    ? strengthMeta[Math.max(strength, 1)]
    : strengthMeta[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((current) => ({ ...current, [e.target.name]: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};

    if (!formData.name.trim()) {
      next.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      next.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      next.password = "Password is required.";
    } else if (formData.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (formData.confirmPassword !== formData.password) {
      next.confirmPassword = "Passwords do not match.";
    }

    if (!acceptedTerms) {
      next.terms = "You must accept the terms to continue.";
    }

    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the highlighted fields and try again.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        // Requires `role` to be configured as an additionalField in better-auth.
        role,
      } as Parameters<typeof authClient.signUp.email>[0]);

      if (error) {
        toast.error(error.message || "Could not create your account.");
        return;
      }

      toast.success("Account created successfully. Welcome aboard!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    "h-11 rounded-xl border-slate-200/80 bg-white/70 pl-10 text-sm shadow-sm shadow-slate-900/[0.02] transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-[#0b927e] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#0b927e]/15";
  const errorRing =
    "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100";
  const iconBase =
    "pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0b927e]";
  const eyeBtn =
    "absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#087f75]";
  const labelCls = "text-xs font-semibold text-slate-700";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f3faf7] via-white to-[#eaf6f2] px-4 py-6 sm:px-6 lg:h-screen lg:px-10 lg:py-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(11,146,126,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      {/* Centered container: both panels joined together */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_40px_120px_-40px_rgba(11,146,126,0.45)] ring-1 ring-black/5 lg:h-full lg:max-h-[820px]">
        {/* Left brand panel */}
        <div className="hidden lg:flex lg:w-1/2 [&>*]:!h-full [&>*]:!min-h-0 [&>*]:!w-full [&>*]:!max-w-none">
          <AuthBrandPanel />
        </div>

        {/* Right sign-up section (no inner card/border) */}
        <section className="relative flex w-full items-center justify-center bg-white px-6 py-8 sm:px-10 lg:w-1/2 lg:px-12 lg:py-6">
          <div className="w-full max-w-[460px]">
            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-6 flex items-center justify-center gap-3 lg:hidden"
            >
              <Image
                src="/Supportive Education Mentorship Emblem.png"
                alt="MentorLagbe Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-2xl font-extrabold tracking-tight text-[#173f38]">
                Mentor<span className="text-[#0b927e]">Lagbe</span>
              </span>
            </Link>

            {/* Heading */}
            <div className="mb-4">
              <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-tight text-[#173f38]">
                Create your{" "}
                <span className="bg-gradient-to-r from-[#087f75] to-[#22b99a] bg-clip-text text-transparent">
                  free account
                </span>
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Start your learning journey in less than a minute.
              </p>
            </div>

            {/* Role selector */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              {roles.map(({ value, title, desc, icon: Icon }) => {
                const active = role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    aria-pressed={active}
                    className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                      active
                        ? "border-[#0b927e] bg-emerald-50/70 ring-4 ring-[#0b927e]/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? "bg-[#087f75] text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-[#087f75]"
                      }`}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold leading-tight text-[#173f38]">
                        {title}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {desc}
                      </span>
                    </span>
                    {active && (
                      <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#087f75] text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Social login (renders its own divider) */}
            <div className="mb-4">
              <SocialLoginButtons />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              {/* Name + Email */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className={labelCls}>
                    Full name
                  </Label>
                  <div className="group relative">
                    <User className={iconBase} />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      className={`${inputBase} pr-3 ${errors.name ? errorRing : ""}`}
                    />
                  </div>
                  <FieldError message={errors.name} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className={labelCls}>
                    Email address
                  </Label>
                  <div className="group relative">
                    <Mail className={iconBase} />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      className={`${inputBase} pr-3 ${errors.email ? errorRing : ""}`}
                    />
                  </div>
                  <FieldError message={errors.email} />
                </div>
              </div>

              {/* Password + Confirm */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className={labelCls}>
                    Password
                  </Label>
                  <div className="group relative">
                    <LockKeyhole className={iconBase} />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                      className={`${inputBase} pr-10 ${errors.password ? errorRing : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className={eyeBtn}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FieldError message={errors.password} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className={labelCls}>
                    Confirm password
                  </Label>
                  <div className="group relative">
                    <LockKeyhole className={iconBase} />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.confirmPassword)}
                      className={`${inputBase} pr-10 ${errors.confirmPassword ? errorRing : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                      className={eyeBtn}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FieldError message={errors.confirmPassword} />
                </div>
              </div>

              {/* Strength meter (single compact line) */}
              {formData.password && (
                <div className="flex items-center gap-3">
                  <div className="flex flex-1 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          strength >= step ? meta.color : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${meta.text}`}>
                    {meta.label}
                  </p>
                </div>
              )}

              {/* Terms */}
              <div className="space-y-1.5">
                <label className="flex cursor-pointer select-none items-start gap-2.5 text-[13px] leading-5 text-slate-600">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      setErrors((c) => ({ ...c, terms: undefined }));
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#087f75]"
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-semibold text-[#087f75] hover:underline"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-[#087f75] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <FieldError message={errors.terms} />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="group h-12 w-full rounded-xl bg-gradient-to-r from-[#087f75] to-[#0fa58d] text-sm font-bold text-white shadow-lg shadow-[#087f75]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#087f75]/30 hover:brightness-105 active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign-in link */}
            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-bold text-[#087f75] transition hover:text-[#065f56] hover:underline"
              >
                Sign in
              </Link>
            </p>

            {/* Trust note + footer */}
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={13} className="text-[#0b927e]" />
              <span>Encrypted &amp; secure</span>
              <span aria-hidden>·</span>
              <span>© {year} MentorLagbe</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}