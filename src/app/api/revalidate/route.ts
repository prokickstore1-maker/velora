import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    revalidateTag("products", "max");
    revalidateTag("settings", "max");
    revalidateTag("reviews", "max");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ revalidated: false, error: msg }, { status: 500 });
  }
}
