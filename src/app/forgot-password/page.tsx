import Link from "next/link";
import { ArrowLeft, Info, LockKeyhole } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Reset Password | MentorLagbe",
  description:
    "Password reset availability for MentorLagbe accounts and the configuration required to enable it.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5ed] px-4 py-16 dark:bg-[#06110f]">
      <div className="w-full max-w-xl rounded-3xl border border-[#075b55]/10 bg-white p-7 shadow-sm sm:p-10 dark:border-white/10 dark:bg-[#081715]">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#075b55] text-white dark:bg-[#d5b36a] dark:text-[#0b1f1c]">
          <LockKeyhole className="size-6" aria-hidden="true" />
        </span>

        <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-[#087f75] uppercase dark:text-[#7fe0d2]">
          Account access
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#075b55] dark:text-[#f5f5ed]">
          Reset your password
        </h1>

        <div
          role="status"
          className="mt-6 rounded-2xl border border-[#d5b36a]/40 bg-[#d5b36a]/10 p-5 dark:border-[#d5b36a]/25 dark:bg-[#d5b36a]/5"
        >
          <p className="flex items-start gap-2 text-sm font-semibold text-[#8a6a28] dark:text-[#e8cf99]">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Automated password reset is not enabled yet
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#075b55]/75 dark:text-[#f5f5ed]/70">
            MentorLagbe uses Better Auth for email/password accounts. Password
            reset emails require an outbound email provider to be configured in
            the deployment. That provider is not configured here, so no reset
            link can be delivered and we will not pretend one was sent.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[#075b55]/60 dark:text-[#f5f5ed]/55">
            To enable self-service resets, configure an email provider and the
            Better Auth <code>sendResetPassword</code> handler in the deployed
            environment, then expose this form with Better Auth&apos;s
            <code> requestPasswordReset</code> flow.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-in"
            className={buttonVariants({
              className: "bg-[#075b55] text-white hover:bg-[#0b6b62]",
            })}
          >
            <ArrowLeft aria-hidden="true" />
            Back to sign in
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
