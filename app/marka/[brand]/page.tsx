import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { HeroVisual } from "@/components/HeroVisual";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, localBusinessJsonLdForArea, absoluteUrl } from "@/lib/seo";
import { getBrand } from "@/lib/brands";
import { services } from "@/lib/services";
import { site } from "@/lib/site";
import type { Metadata } from "next";
import { getReviewsForKey } from "@/lib/reviews.server";

export async function generateMetadata({ params }: { params: { brand: string } }) {
  const brand = getBrand(params.brand);
  if (!brand) return {};

  const heroUrl = absoluteUrl(`/api/hero?brand=${encodeURIComponent(brand.name)}`);
  const base = buildMetadata({
    title: `${brand.name} Servisi | Kurumsal Teknik Destek | ${site.businessName}`,
    description: `${brand.name} için kombi/klima/beyaz eşya servis sayfaları. Hizmet türüne göre dinamik içerik, SSS ve süreç adımları.`,
    path: `/marka/${brand.slug}`
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [{ url: heroUrl, width: 1200, height: 630, alt: `${brand.name} servis` }]
    },
    twitter: {
      ...base.twitter,
      images: [heroUrl]
    }
  } satisfies Metadata;
}

export default async function Page({ params }: { params: { brand: string } }) {
  const brand = getBrand(params.brand);
  if (!brand) notFound();

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/markalar", label: "Markalar" },
    { href: `/marka/${brand.slug}`, label: brand.name }
  ];

  const pageKey = `/marka/${brand.slug}`;
  const reviews = await getReviewsForKey(pageKey, {
    city: "Türkiye",
    district: "Genel",
    brand: brand.name,
    serviceLabel: "Teknik Servis"
  });

  return (
    <section className="section">
      <Container>
        <JsonLd id={`ld-breadcrumb-brand-${brand.slug}`} data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id={`ld-localbusiness-brand-${brand.slug}`}
          data={localBusinessJsonLdForArea({
            pageName: `${brand.name} Servisi`,
            pageUrlPath: `/marka/${brand.slug}`,
            areaName: "Türkiye",
            coords: null,
            serviceName: `${brand.name} teknik servis`,
            omitAddress: true,
            reviews,
            areaServed: ["Türkiye", "81 il"]
          })}
        />
        <Breadcrumbs items={crumbs} />

        <h1 className="h1" style={{ fontSize: 36 }}>
          {brand.name} Servisi
        </h1>
        <p className="muted" style={{ maxWidth: 860 }}>
          Bu marka için desteklenen hizmet türlerini seçin. Sayfada başlık/açıklama/SSS blokları dinamik üretildiği için
          kopya içerik riski azaltılır.
        </p>

        <div style={{ marginTop: 14 }}>
          <HeroVisual city="Türkiye" brand={brand.name} serviceKind={null} />
        </div>

        <div className="grid" style={{ marginTop: 16 }}>
          {services
            .filter((s) => brand.supportedServices.includes(s.kind))
            .map((s) => (
              <Link key={s.slug} href={`/marka/${brand.slug}/${s.slug}`} className="card hover focus-ring" style={{ gridColumn: "span 4", padding: 16 }}>
                <div style={{ fontWeight: 900 }}>{s.label}</div>
                <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
                  {brand.name} {s.label}
                </div>
              </Link>
            ))}
        </div>
      </Container>

      <Reviews 
        pageKey={pageKey} 
        brand={brand.name} 
        serviceLabel="Teknik Servis" 
      />
    </section>
  );
}
