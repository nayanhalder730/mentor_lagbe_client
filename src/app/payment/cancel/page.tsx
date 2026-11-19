import { redirect } from "next/navigation";

/** Stripe cancel_url target. No plan change is claimed here. */
export default function PaymentCancelPage() {
  redirect("/pricing?checkout=cancelled");
}
