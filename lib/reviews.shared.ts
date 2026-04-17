export type Review = {
  id: string;
  key: string;
  name: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string; // ISO
};

export function computeAggregate(reviews: Review[]) {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / reviews.length;
  const rounded = Math.round(avg * 10) / 10;
  return { ratingValue: rounded, reviewCount: reviews.length };
}

export function clampReviewsForSchema(reviews: Review[], max = 5) {
  return reviews.slice(0, max);
}

