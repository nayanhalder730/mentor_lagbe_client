"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { authClient } from "@/lib/auth-client";

type UserRole = "student" | "tutor";
type FormErrors = Partial<Record<"name" | "email" | "password", string>>;

export default function SignUpPage() {
  const router = useRouter();

  // Default role is Student; the plan is always "free" at sign-up (set on server).
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const passwordStrength = formData.password.length >= 12 ? 3 : formData.password.length >= 8 ? 2 : formData.password.length > 0 ? 1 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((current) => ({ ...current, [e.target.name]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
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
      const { error } = await authClient.signUp.email({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role, // "student" | "tutor" — plan defaults to "free" on the server
      });

      if (error) {
        toast.error(error.message || "Could not create your account.");
        return;
      }

      toast.success(`Welcome to MentorLagbe! You are registered as a ${role}.`);
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#f6faf9]">
      <AuthBrandPanel />

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          {/* Mobile brand */}
          <Link href="/" className="mb-7 flex items-center justify-center gap-3 lg:hidden">
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

          <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_24px_70px_-30px_rgba(6,59,54,0.35)] sm:p-9">
            {/* Heading */}
            <div className="mb-6">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9f6f1] text-[#087f75]">
                <Sparkles size={22} />
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-[#123a35]">
                Create your account
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Join MentorLagbe and start your learning journey.
              </p>
            </div>

            <SocialLoginButtons />

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Role segmented control */}
              <div>
                <Label className="mb-2.5 block text-sm font-semibold text-slate-700">
                  I want to join as a
                </Label>
                <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-[#f2f7f6] p-1.5">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                      role === "student"
                        ? "bg-white text-[#087f75] shadow-sm ring-1 ring-[#0b927e]/20"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <BookOpen size={16} />
                    Student
                    {role === "student" && <Check size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("tutor")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                      role === "tutor"
                        ? "bg-white text-[#087f75] shadow-sm ring-1 ring-[#0b927e]/20"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <GraduationCap size={16} />
                    Tutor
                    {role === "tutor" && <Check size={14} />}
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahim Ahmed"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 text-sm focus-visible:border-[#0b927e] focus-visible:ring-[#0b927e]/20"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 text-sm focus-visible:border-[#0b927e] focus-visible:ring-[#0b927e]/20"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 pr-11 text-sm focus-visible:border-[#0b927e] focus-visible:ring-[#0b927e]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#087f75]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Strength meter */}
                <div className="flex gap-1.5 pt-0.5">
                  {[1, 2, 3].map((segment) => (
                    <span
                      key={segment}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= segment
                          ? passwordStrength === 1
                            ? "bg-red-400"
                            : passwordStrength === 2
                              ? "bg-amber-400"
                              : "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                {errors.password ? (
                  <p className="text-xs text-red-500">{errors.password}</p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Use 8+ characters for a stronger account.
                  </p>
                )}
              </div>

              {/* Free plan notice */}
              <div className="flex items-center justify-between rounded-xl border border-[#d6efe8] bg-[#f2faf7] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#123a35]">Free Starter Plan</p>
                  <p className="text-xs text-slate-500">Upgrade to Pro anytime</p>
                </div>
                <span className="text-lg font-bold text-[#087f75]">$0</span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl bg-linear-to-r from-[#087f75] to-[#0b927e] text-sm font-semibold text-white shadow-lg shadow-[#087f75]/25 transition hover:-translate-y-0.5 hover:from-[#06665f] hover:to-[#087f75] disabled:translate-y-0 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-[#087f75] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © MentorLagbe. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
