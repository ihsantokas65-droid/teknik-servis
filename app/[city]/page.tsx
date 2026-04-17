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

        <div className="card hero" style={{ padding: 22 }}>
          <div className="grid" style={{ alignItems: "center" }}>
            <div style={{ gridColumn: "span 7" }}>
              <div className="badge">{city.name} • {city.districts.length} ilçe • 3 hizmet</div>
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
              <HeroVisual city={city.name} serviceKind={null} />
            </div>
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
      </Container>

      <div style={{ marginTop: 40 }}>
        <Container>
          <h2 className="h2" style={{ fontWeight: 950 }}>{city.name}’da Popüler Marka Servisleri</h2>
        <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
          Markanıza özel uzman servis sayfasına ulaşın:
        </p>
        <div className="grid" style={{ marginTop: 16 }}>
          {getBrands().slice(0, 18).map((b) => (
            <div key={b.slug} className="card" style={{ gridColumn: "span 3", padding: 12, textAlign: "center" }}>
              <div style={{ fontWeight: 900, color: "var(--brand-900)" }}>{b.name}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {b.supportedServices.map((s, idx) => (
                   <Link key={s} href={`/${city.slug}/marka/${b.slug}/${s === 'kombi' ? 'kombi-servisi' : s === 'klima' ? 'klima-servisi' : s === 'beyaz-esya' ? 'beyaz-esya-servisi' : 'kurumsal-cozumler'}`}>
                     {idx > 0 && " • "}{s === 'kombi' ? 'Kombi' : s === 'klima' ? 'Klima' : s === 'beyaz-esya' ? 'B. Eşya' : 'Arıza'}
                   </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
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
