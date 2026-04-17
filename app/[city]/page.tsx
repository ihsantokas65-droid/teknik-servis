import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { HeroVisual } from "@/components/HeroVisual";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { getCityCoordinates } from "@/lib/coords";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, geoMeta, localBusinessJsonLdForArea } from "@/lib/seo";
import { buildCityLandingContent } from "@/lib/content";
import { getCity } from "@/lib/geo";
import { getBrands } from "@/lib/brands";
import { services } from "@/lib/services";
import type { Metadata } from "next";
import { getReviewsForKey } from "@/lib/reviews.server";
import { createRng, pickOne } from "@/lib/variation";
import { PriceEstimator } from "@/components/PriceEstimator";
import { DynamicQa } from "@/components/DynamicQa";
import { BrandsGrid } from "@/components/BrandsGrid";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: { city: string } }) {
  const city = getCity(params.city);
  if (!city) return {};

  const coords = getCityCoordinates(city.slug);
  const heroUrl = absoluteUrl(`/api/hero?city=${encodeURIComponent(city.name)}`);
  const landing = buildCityLandingContent(city);

  const base = buildMetadata({
    title: landing.title,
    description: landing.description,
    path: `/${city.slug}`
  });

  return {
    ...base,
    other: {
      ...(base.other ?? {}),
      ...geoMeta(coords, city.name)
    },
    openGraph: {
      ...base.openGraph,
      images: [{ url: heroUrl, width: 1200, height: 630, alt: `${city.name} teknik servis` }]
    },
    twitter: {
      ...base.twitter,
      images: [heroUrl]
    }
  } satisfies Metadata;
}

export default async function Page({ params }: { params: { city: string } }) {
  const city = getCity(params.city);
  if (!city) notFound();
  const landing = buildCityLandingContent(city);

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-bolgeleri", label: "Servis Bölgeleri" },
    { href: `/${city.slug}`, label: city.name }
  ];

  const coords = getCityCoordinates(city.slug);
  const pageKey = `/${city.slug}`;
  const reviews = await getReviewsForKey(pageKey);
  const rng = createRng(pageKey);

  const districtsTitle = pickOne(rng, [
    `${city.name} İlçelerinde Servis Bölgeleri`,
    `${city.name} İlçeleri (Hizmet Seçin)`,
    `${city.name} İçin İlçe Bazlı Servis`,
    `${city.name} Servis Bölgeleri – İlçeler`
  ]);
  const districtsIntro = pickOne(rng, [
    "İlçenizi seçin; ardından kombi/klima/beyaz eşya hizmet sayfasına gidin.",
    "Bulunduğunuz ilçeyi seçerek ilgili hizmet sayfasına hızlıca ilerleyin.",
    "İlçe bazlı yapı ile doğru sayfaya yönlenin; her hizmet sayfası dinamik içerik üretir."
  ]);
  const districtBadge = pickOne(rng, ["İlçe", "Bölge", "Servis bölgesi"]);
  const servicesHint = pickOne(rng, [
    "Hizmetler:",
    "Hızlı bağlantılar:",
    "Servis sayfaları:"
  ]);

  return (
    <article className="section">
      <Container>
        <JsonLd id={`ld-breadcrumb-${city.slug}`} data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id={`ld-localbusiness-${city.slug}`}
          data={localBusinessJsonLdForArea({
            pageName: `${city.name} Teknik Servis`,
            pageUrlPath: `/${city.slug}`,
            areaName: city.name,
            coords,
            reviews,
            types: ["LocalBusiness", "HomeAndConstructionBusiness"],
            serviceTypes: services.map((s) => s.label),
            address: {
              addressLocality: city.name,
              addressRegion: city.name,
              addressCountry: "TR"
            },
            areaServed: [city.name, ...city.districts.slice(0, 8).map((d) => d.name)]
          })}
        />
        <Breadcrumbs items={crumbs} />

        <div className="card hero" style={{ padding: 32, marginBottom: 32 }}>
          <div className="grid" style={{ alignItems: "center" }}>
            <div style={{ gridColumn: "span 7" }}>
              <div className="badge">{city.name} Servis Noktası</div>
              <h1 className="h1" style={{ marginTop: 16, fontSize: 44, marginBottom: 16 }}>
                {landing.h1}
              </h1>
              <p className="muted" style={{ fontSize: 18, lineHeight: 1.6 }}>
                {landing.intro}
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <Link href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="btn">
                  Hemen Ara: {site.phone}
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--brand-900)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#25D366" }}></div>
                  30 Dakikada Kapınızdayız
                </div>
              </div>
            </div>
            <div style={{ gridColumn: "span 5" }}>
              <HeroVisual city={city.name} serviceKind={null} />
            </div>
          </div>
        </div>

        {/* PRICE ESTIMATOR - TRUST BOOSTER */}
        <div className="grid" style={{ marginBottom: 40 }}>
           <div style={{ gridColumn: "span 10", gridColumnStart: 2 }}>
              <PriceEstimator />
           </div>
        </div>

        <div className="grid" style={{ marginTop: 16 }}>
          <div className="card" style={{ gridColumn: "span 12", padding: 16 }}>
            <h2 className="h2" style={{ fontSize: 22 }}>
              {districtsTitle}
            </h2>
            <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              {districtsIntro}
            </div>
          </div>

          {city.districts.map((d) => (
            <div key={d.slug} className="card" style={{ gridColumn: "span 4", padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <Link href={`/${city.slug}/${d.slug}`} style={{ fontWeight: 900 }}>
                  {d.name}
                </Link>
                <span className="muted" style={{ fontSize: 13 }}>
                  {districtBadge}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 10, fontWeight: 800 }}>
                {servicesHint}
              </div>
              <div className="muted" style={{ fontSize: 14, marginTop: 10 }}>
                {services.map((s, idx) => (
                  <span key={s.slug}>
                    {idx > 0 ? " • " : ""}
                    <Link href={`/${city.slug}/${d.slug}/${s.slug}`}>{s.label}</Link>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* DYNAMIC QA - LOCALIZED UGC */}
        <DynamicQa city={city.name} district="Merkez" serviceLabel="Teknik Servis" />
      </Container>

      <div style={{ marginTop: 40, background: "white", padding: "60px 0", borderTop: "1px solid var(--border)" }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 className="h2" style={{ fontWeight: 950 }}>{city.name} Popüler Marka Servisleri</h2>
            <p className="muted" style={{ fontSize: 16, marginTop: 10 }}>{city.name} genelinde arıza kaydı oluşturabileceğiniz markalarımız.</p>
          </div>
          <BrandsGrid brands={getBrands().slice(0, 18)} />
        </Container>
      </div>

      <Reviews 
        pageKey={pageKey} 
        city={city.name} 
        district="Merkez" 
        serviceLabel="Teknik Servis" 
      />
    </article>
  );
}
