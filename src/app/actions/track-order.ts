"use server";

import { trackOrderByCodeAndPhone as queryTrackOrder } from "@/lib/queries";

export async function trackOrderAction(orderCode: string, last4Phone: string) {
  return await queryTrackOrder(orderCode, last4Phone);
}
