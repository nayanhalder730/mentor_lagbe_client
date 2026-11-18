"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { authClient } from "@/lib/auth-client";

type FormErrors = Partial<Record<"email" | "password", string>>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
      <span className="h-1 w-1 rounded-full bg-red-500" />
      {message}
    </p>
  );
}

export default function SignInPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(true);

  // Read the current year after mount so prerendering stays stable.
  const [year, setYear] = useState(2026);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((current) => ({ ...current, [e.target.name]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
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
      const { error } = await authClient.signIn.email({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }

      toast.success("Signed in successfully. Welcome back!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    "h-12 rounded-xl border-slate-200/80 bg-white/70 pl-11 text-sm shadow-sm shadow-slate-900/[0.02] transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-[#0b927e] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#0b927e]/15";
  const errorRing =
    "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100";
  const iconBase =
    "pointer-events-none absolute left-4 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0b927e]";
  const labelCls = "text-[13px] font-semibold text-slate-700";

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

        {/* Right sign-in section (no inner card/border) */}
        <section className="relative flex w-full items-center justify-center bg-white px-6 py-8 sm:px-10 lg:w-1/2 lg:px-12 lg:py-6">
          <div className="w-full max-w-[420px]">
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
            <div className="mb-6">
              <h1 className="text-[1.9rem] font-extrabold leading-tight tracking-tight text-[#173f38]">
                Welcome{" "}
                <span className="bg-gradient-to-r from-[#087f75] to-[#22b99a] bg-clip-text text-transparent">
                  back
                </span>
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to pick up right where you left off with your mentors,
                sessions and progress.
              </p>
            </div>

            {/* Social login (renders its own divider) */}
            <div className="mb-5">
              <SocialLoginButtons />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
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
                    className={`${inputBase} pr-4 ${errors.email ? errorRing : ""}`}
                  />
                </div>
                <FieldError message={errors.email} />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className={labelCls}>
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#087f75] transition hover:text-[#065f56] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="group relative">
                  <LockKeyhole className={iconBase} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    className={`${inputBase} pr-12 ${errors.password ? errorRing : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#087f75]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FieldError message={errors.password} />
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#087f75]"
                />
                Keep me signed in
              </label>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="group h-12 w-full rounded-xl bg-gradient-to-r from-[#087f75] to-[#0fa58d] text-sm font-bold text-white shadow-lg shadow-[#087f75]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#087f75]/30 hover:brightness-105 active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign-up link */}
            <p className="mt-5 text-center text-sm text-slate-500">
              New to MentorLagbe?{" "}
              <Link
                href="/sign-up"
                className="font-bold text-[#087f75] transition hover:text-[#065f56] hover:underline"
              >
                Create an account
              </Link>
            </p>

            {/* Trust note + footer */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
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