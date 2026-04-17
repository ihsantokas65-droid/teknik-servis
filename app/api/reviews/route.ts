import { NextResponse } from "next/server";
import { addReview, getReviewsForKey } from "@/lib/reviews.server";

export const runtime = "nodejs";

function isValidKey(key: string) {
  // pathname-like key
  if (key === "/") return true;
  return /^\/[a-z0-9\-\/]+$/i.test(key) && !key.includes("..");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = (searchParams.get("key") ?? "").trim();
  if (!isValidKey(key)) return NextResponse.json({ error: "invalid_key" }, { status: 400 });

  const city = searchParams.get("city") || undefined;
  const district = searchParams.get("district") || undefined;
  const brand = searchParams.get("brand") || undefined;
  const serviceLabel = searchParams.get("serviceLabel") || undefined;

  const context = (city && district && serviceLabel) 
    ? { city, district, brand, serviceLabel } 
    : undefined;

  const reviews = await getReviewsForKey(key, context);
  return NextResponse.json({ reviews }, { status: 200 });
}

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const key = String(body?.key ?? "").trim();
  const name = String(body?.name ?? "").trim();
  const comment = String(body?.comment ?? "").trim();
  const rating = Number(body?.rating ?? 0);
  const trap = String(body?.company ?? "").trim(); // honeypot

  if (trap) return NextResponse.json({ ok: true }, { status: 200 });
  if (!isValidKey(key)) return NextResponse.json({ error: "invalid_key" }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "invalid_rating" }, { status: 400 });
  if (comment.length < 10) return NextResponse.json({ error: "invalid_comment" }, { status: 400 });

  const review = await addReview({ key, name, rating, comment });
  return NextResponse.json({ review }, { status: 201 });
}
