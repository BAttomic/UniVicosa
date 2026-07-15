// Platform monetization: a 5% service fee is added on top of the ticket price
// and paid by the buyer (the organizer receives 100% of the ticket price).
// Kept dependency-free so it can be imported from both server and client code.

export const PLATFORM_FEE_RATE = 0.05;

export const PLATFORM_FEE_LABEL = "5%";

/** Service fee (in cents) charged on top of a subtotal (in cents). */
export function serviceFeeFor(subtotalCents: number): number {
  return Math.round(subtotalCents * PLATFORM_FEE_RATE);
}

/** Buyer-facing breakdown for a given subtotal (in cents). */
export function priceBreakdown(subtotalCents: number) {
  const serviceFee = serviceFeeFor(subtotalCents);
  return {
    subtotal: subtotalCents,
    serviceFee,
    total: subtotalCents + serviceFee,
  };
}
