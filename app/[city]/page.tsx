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
import { PhoneCall, ScrollText, Settings, Tag, Zap, Flame, Snowflake, WashingMachine, Building2 } from "lucide-react";
import Image from "next/image";

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

        <div className="card hero" style={{ padding: 40, marginBottom: 40, background: "white", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          {/* Subtle background decoration like homepage */}
          <div style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "100%", background: "radial-gradient(circle at 100% 0%, rgba(242, 101, 34, 0.05) 0%, transparent 40%)", pointerEvents: "none" }}></div>
          
          <div className="grid" style={{ alignItems: "center", position: "relative", zIndex: 1 }}>
            <div style={{ gridColumn: "span 7" }}>
              <div className="badge" style={{ marginBottom: 16 }}>{city.name.toUpperCase()} BÖLGESEL TEKNİK SERVİS AĞI</div>
              <h1 className="h1" style={{ marginTop: 12, fontSize: 52, color: "var(--brand-900)" }}>
                {city.name} Servis <br />
                <span style={{ color: "var(--brand)" }}>30 Dakikada Kapınızda.</span>
              </h1>
              <p className="muted" style={{ fontSize: 19, marginTop: 24, lineHeight: 1.6, maxWidth: 600 }}>
                {landing.intro}
              </p>
              
              <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 40, flexWrap: "wrap" }}>
                <Link href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="btn" style={{ padding: "18px 40px", fontSize: 18 }}>
                  Hemen Randevu Al
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--brand-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-900)" }}>
                    <PhoneCall size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>LOKAL SERVİS HATTI</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--brand-900)" }}>{site.phone}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ gridColumn: "span 5" }}>
              <HeroVisual city={city.name} serviceKind={null} />
            </div>
          </div>
        </div>

        {/* PRICE ESTIMATOR - TRUST BOOSTER */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 className="h2" style={{ fontWeight: 900 }}>{city.name} Servis Ücreti Hesaplama</h2>
            <p className="muted" style={{ fontSize: 16 }}>Arıza türünü seçin, maliyeti anında öğrenin.</p>
          </div>
          <div className="grid">
            <div style={{ gridColumn: "span 10", gridColumnStart: 2 }}>
              <PriceEstimator />
            </div>
          </div>
        </section>

        {/* SERVICES CARDS - EXACTLY LIKE HOMEPAGE */}
        <section style={{ marginBottom: 60 }}>
           <div className="grid" style={{ gap: 24 }}>
            {services.map((s, idx) => (
              <Link 
                key={s.slug} 
                href={`/${city.slug}/tum-ilceler/${s.slug}-servisi`}
                className="card hover"
                style={{ gridColumn: "span 4", padding: 32, textAlign: "center" }}
              >
                <div style={{ 
                  fontSize: 48, marginBottom: 20, 
                  height: 80, display: "flex", alignItems: "center", justifyContent: "center" 
                }}>
                  {idx === 0 ? <Flame size={48} strokeWidth={1.5} /> : 
                   idx === 1 ? <Snowflake size={48} strokeWidth={1.5} /> : 
                   <WashingMachine size={48} strokeWidth={1.5} />}
                </div>
                <h3 className="h3" style={{ marginBottom: 12 }}>{city.name} {s.label}</h3>
                <p className="muted" style={{ fontSize: 14 }}>
                  {idx === 0 ? "Bakım, tamir ve petek temizliği çözümleri." : 
                   idx === 1 ? "Montaj, gaz dolumu ve filtre temizliği." : 
                   "Buzdolabı, çamaır ve bulaşık makinesi onarımı."}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* WHY US (TRUST FACTORS) - FROM HOMEPAGE */}
        <section style={{ marginBottom: 60, background: "white", padding: 40, borderRadius: 24, border: "1px solid var(--border)" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 className="h2" style={{ fontWeight: 900 }}>NEDEN {city.name.toUpperCase()} SERVİSUZMANI?</h2>
          </div>
          <div className="grid">
            <TrustItem icon={<ScrollText size={32} strokeWidth={1.5} />} title="Sertifikalı Teknisyenler" desc="Tüm ekibimiz yetki belgelidir." />
            <TrustItem icon={<Settings size={32} strokeWidth={1.5} />} title="Orijinal Yedek Parçalar" desc="Cihazınız için en iyi parçalar." />
            <TrustItem icon={<Tag size={32} strokeWidth={1.5} />} title="Şeffaf Fiyatlandırma" desc="Onayınız olmadan işlem yok." />
            <TrustItem icon={<Zap size={32} strokeWidth={1.5} />} title="Hızlı Müdahale" desc="Van geneli 30 dakikada servis." />
          </div>
        </section>

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

function TrustItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="card" style={{ gridColumn: "span 3", padding: 24, display: "flex", gap: 16, alignItems: "flex-start", background: "var(--bg)", border: "none" }}>
      <div style={{ color: "var(--brand)" }}>{icon}</div>
      <div>
        <h4 style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{title}</h4>
        <p className="muted" style={{ fontSize: 13 }}>{desc}</p>
      </div>
    </div>
  );
}
