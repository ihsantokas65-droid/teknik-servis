import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { Review } from "@/lib/reviews.shared";
import { generateSyntheticReviews } from "@/lib/syntheticReviews";

const dataDir = path.join(process.cwd(), "data");
const reviewsFile = path.join(dataDir, "reviews.json");
const tmpFile = path.join(dataDir, "reviews.json.tmp");

let cache: Review[] | null = null;
let cacheLoadedAt = 0;

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

async function loadAll(): Promise<Review[]> {
  if (cache && Date.now() - cacheLoadedAt < 3_000) return cache;
  try {
    const txt = await readFile(reviewsFile, "utf8");
    const parsed = JSON.parse(txt) as Review[];
    cache = Array.isArray(parsed) ? parsed : [];
    cacheLoadedAt = Date.now();
    return cache;
  } catch {
    cache = [];
    cacheLoadedAt = Date.now();
    return [];
  }
}

async function saveAll(reviews: Review[]) {
  await ensureDataDir();
  await writeFile(tmpFile, JSON.stringify(reviews, null, 2), "utf8");
  await rename(tmpFile, reviewsFile);
  cache = reviews;
  cacheLoadedAt = Date.now();
}

export async function getReviewsForKey(key: string, context?: { city: string, district?: string | null, brand?: string, serviceLabel: string }) {
  const all = await loadAll();
  const real = all
    .filter((r) => r.key === key)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);

  // If we have fewer than 5 real reviews, fill with synthetic ones
  if (real.length < 5 && context) {
    const synthetic = generateSyntheticReviews(key, context);
    const combined = [...real, ...synthetic].slice(0, 10); // Keep it natural
    
    // Sort combined by date
    return combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return real;
}

export async function addReview(input: { key: string; name: string; rating: number; comment: string }) {
  const all = await loadAll();
  const now = new Date().toISOString();
  const review: Review = {
    id: crypto.randomUUID(),
    key: input.key,
    name: input.name.trim().slice(0, 40),
    rating: input.rating,
    comment: input.comment.trim().slice(0, 600),
    createdAt: now
  };
  const next = [review, ...all];
  await saveAll(next);
  return review;
}

