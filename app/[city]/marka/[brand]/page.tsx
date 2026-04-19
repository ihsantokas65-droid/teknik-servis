import { redirect } from "next/navigation";
import { getCity } from "@/lib/geo";
import { getBrand } from "@/lib/brands";

export default async function Page({ params }: { params: { city: string; brand: string } }) {
  const city = getCity(params.city);
  const brand = getBrand(params.brand);

  if (city && brand) {
    // 301 Redirect to the new flat SEO-friendly URL
    redirect(`/${city.slug}-${brand.slug}-servisi`);
  }

  // Fallback to not found if city/brand doesn't exist
  return null;
}
