import { redirect } from "next/navigation";

/**
 * Stripe success_url target. The pricing page verifies the current plan from
 * the backend before displaying any active-subscription status.
 */
export default function PaymentSuccessPage() {
  redirect("/pricing?checkout=returned");
}
