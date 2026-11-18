"use client";

import { useEffect, useMemo, useState } from "react";
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
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
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

export default function SignUpPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [role, setRole] = useState<Role>("student");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Read the current year after mount so prerendering stays stable.
  const [year, setYear] = useState(2026);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

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
      router.push("/");
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