import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { HeroVisual } from "@/components/HeroVisual";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { getDistrictCoordinates } from "@/lib/coords";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, geoMeta, localBusinessJsonLdForArea } from "@/lib/seo";
import { buildDistrictLandingContent } from "@/lib/content";
import { getCity } from "@/lib/geo";
import { services } from "@/lib/services";
import type { Metadata } from "next";
import { getReviewsForKey } from "@/lib/reviews.server";
import { createRng, pickOne } from "@/lib/variation";
import { DynamicQa } from "@/components/DynamicQa";
import { FaqList } from "@/components/FaqList";
import { faqPageJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { city: string; district: string } }) {
  const city = getCity(params.city);
  const district = city?.districts.find((d) => d.slug === params.district);
  if (!city || !district) return {};

  const coords = getDistrictCoordinates(city.slug, district.slug);
  const heroUrl = absoluteUrl(
    `/api/hero?city=${encodeURIComponent(city.name)}&district=${encodeURIComponent(district.name)}`
  );
  const landing = buildDistrictLandingContent(city, district);

  const base = buildMetadata({
    title: landing.title,
    description: landing.description,
    path: `/${city.slug}/${district.slug}`
  });

  return {
    ...base,
    other: {
      ...(base.other ?? {}),
      ...geoMeta(coords, `${city.name} ${district.name}`)
    },
    openGraph: {
      ...base.openGraph,
      images: [{ url: heroUrl, width: 1200, height: 630, alt: `${city.name} ${district.name} teknik servis` }]
    },
    twitter: {
      ...base.twitter,
      images: [heroUrl]
    }
  } satisfies Metadata;
}

export default async function Page({ params }: { params: { city: string; district: string } }) {
  const city = getCity(params.city);
  const district = city?.districts.find((d) => d.slug === params.district);
  if (!city || !district) notFound();
  const landing = buildDistrictLandingContent(city, district);

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-bolgelerimiz", label: "Servis Bölgeleri" },
    { href: `/${city.slug}`, label: city.name },
    { href: `/${city.slug}/${district.slug}`, label: district.name }
  ];

  const coords = getDistrictCoordinates(city.slug, district.slug);
  const pageKey = `/${city.slug}/${district.slug}`;
  const reviews = await getReviewsForKey(pageKey);
  const rng = createRng(pageKey);

  const servicesTitle = pickOne(rng, [
    `${district.name} İçin Hizmet Seçin`,
    `${district.name} Teknik Servis Hizmetleri`,
    `${district.name} Bölgesi – Servis Kategorileri`
  ]);
  const servicesIntro = pickOne(rng, [
    "Hizmet türünü seçerek ilgili sayfaya gidin. İçerik blokları hizmete göre farklılaşır.",
    "Kombi/klima/beyaz eşya için sayfayı seçin. Bölgeye göre dinamik başlık ve SSS görürsünüz.",
    "Aşağıdaki kategorilerden birini seçin; randevu ve süreç bilgilerine ulaşın."
  ]);
  const cardSuffix = pickOne(rng, [
    "Hızlı servis kaydı →",
    "Randevu oluştur →",
    "Bölgeye özel sayfa →"
  ]);

  return (
    <section className="section">
      <Container>
        <JsonLd id={`ld-breadcrumb-${city.slug}-${district.slug}`} data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id={`ld-localbusiness-${city.slug}-${district.slug}`}
          data={localBusinessJsonLdForArea({
            pageName: `${district.name} Teknik Servis`,
            pageUrlPath: `/${city.slug}/${district.slug}`,
            areaName: `${city.name} ${district.name}`,
            coords,
            reviews,
            types: ["LocalBusiness", "HomeAndConstructionBusiness"],
            serviceTypes: services.map((s) => `${district.name} ${s.label}`),
            address: {
              addressLocality: district.name,
              addressRegion: city.name,
              addressCountry: "TR"
            },
            areaServed: [city.name, district.name, ...city.districts.slice(0, 5).map((d) => d.name)]
          })}
        />
        <JsonLd id={`ld-faq-${city.slug}-${district.slug}`} data={faqPageJsonLd(landing.faqs)} />
        <Breadcrumbs items={crumbs} />

        <div className="card hero" style={{ padding: 22 }}>
          <div className="grid" style={{ alignItems: "center" }}>
            <div style={{ gridColumn: "span 7" }}>
              <div className="badge">{city.name} • {district.name}</div>
              <h1 className="h1" style={{ marginTop: 12, fontSize: 36 }}>
                {landing.h1}
              </h1>
              <p className="muted" style={{ marginTop: 10, maxWidth: 900 }}>
                {landing.intro}
              </p>
              <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
                {landing.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div style={{ gridColumn: "span 5" }}>
              <HeroVisual city={city.name} district={district.name} serviceKind={null} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h2 className="h2" style={{ fontSize: 22 }}>
            {servicesTitle}
          </h2>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
            {servicesIntro}
          </div>
        </div>

        <div className="grid" style={{ marginTop: 16 }}>
          {services.map((s) => (
            <Link key={s.slug} href={`/${city.slug}/${district.slug}/${s.slug}`} className="card" style={{ gridColumn: "span 4", padding: 16 }}>
              <div style={{ fontWeight: 900 }}>{s.label}</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
                {district.name} {s.label}
              </div>
              <div className="muted" style={{ marginTop: 10, fontWeight: 800 }}>
                {cardSuffix}
              </div>
            </Link>
          ))}
        </div>

        {/* FAQ - SEO RANKING BOOSTER */}
        <section style={{ marginTop: 60, marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 className="h2" style={{ fontWeight: 900 }}>Sıkça Sorulan Sorular</h2>
            <p className="muted" style={{ fontSize: 16 }}>{district.name} teknik servis süreçlerimiz hakkında merak edilenler.</p>
          </div>
          <FaqList items={landing.faqs} />
        </section>
      </Container>

      <DynamicQa city={city.name} district={district.name} serviceLabel="Teknik Servis" />

      <Reviews 
        pageKey={pageKey}  
        city={city.name} 
        district={district.name} 
        serviceLabel="Teknik Servis" 
      />
    </section>
  );
}
