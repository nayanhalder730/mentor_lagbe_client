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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8f7] px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-7 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Supportive Education Mentorship Emblem.png"
              alt="MentorLagbe Logo"
              width={46}
              height={46}
              className="object-contain"
            />
            <span className="text-2xl font-extrabold tracking-tight text-[#173f38]">
              Mentor<span className="text-[#0b927e]">Lagbe</span>
            </span>
          </Link>
        </div>

        {/* Signup Card */}
        <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-slate-200/60">
          <CardContent className="p-6 sm:p-9">

            {/* Heading */}
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f6f1] text-[#087f75]">
                <GraduationCap size={29} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Create Account
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Join MentorLagbe and start your journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Account Type */}
              <div>
                <Label className="mb-3 block text-sm font-semibold text-slate-700">
                  I want to join as a
                </Label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      role === "student"
                        ? "border-[#087f75] bg-[#effaf6] ring-1 ring-[#087f75]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <BookOpen
                      size={21}
                      className={
                        role === "student"
                          ? "text-[#087f75]"
                          : "text-slate-400"
                      }
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Student
                      </p>
                      <p className="text-xs text-slate-500">Find a tutor</p>
                    </div>
                    {role === "student" && (
                      <Check size={16} className="ml-auto text-[#087f75]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("tutor")}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      role === "tutor"
                        ? "border-[#087f75] bg-[#effaf6] ring-1 ring-[#087f75]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <GraduationCap
                      size={22}
                      className={
                        role === "tutor"
                          ? "text-[#087f75]"
                          : "text-slate-400"
                      }
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Tutor
                      </p>
                      <p className="text-xs text-slate-500">Teach students</p>
                    </div>
                    {role === "tutor" && (
                      <Check size={16} className="ml-auto text-[#087f75]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    className="h-12 rounded-xl pl-10"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    className="h-12 rounded-xl pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    className="h-12 rounded-xl pl-10 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#087f75]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-red-500">{errors.password}</p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Password must be at least 8 characters.
                  </p>
                )}
              </div>

              {/* Free Plan */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Free Starter Plan
                  </p>
                  <p className="text-xs text-slate-500">
                    Upgrade to Pro anytime
                  </p>
                </div>
                <span className="text-lg font-bold text-[#087f75]">$0</span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl bg-[#087f75] text-base font-semibold hover:bg-[#06665f] disabled:opacity-70"
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

            {/* Sign In */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-[#087f75] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          © MentorLagbe. All rights reserved.
        </p>
      </div>
    </main>
  );
}
