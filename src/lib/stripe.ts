import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Use placeholder for now as requested
  // throw new Error("STRIPE_SECRET_KEY is missing");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-01-27-acacia" as any,
});
