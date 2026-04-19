import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PriceEstimator } from "@/components/PriceEstimator";
import { FaqList } from "@/components/FaqList";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { DynamicQa } from "@/components/DynamicQa";
import { getCity } from "@/lib/geo";
import { getBrand } from "@/lib/brands";
import { buildCityBrandLandingContent } from "@/lib/content";
import { services } from "@/lib/services";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, faqPageJsonLd, localBusinessJsonLdForArea, buildMetadata } from "@/lib/seo";
import { PhoneCall, Flame, Snowflake, WashingMachine, ShieldCheck, Clock, Shield, Star } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { city: string; brand: string } }) {
  const city = getCity(params.city);
  const brand = getBrand(params.brand);
  if (!city || !brand) return {};

  const content = buildCityBrandLandingContent(city, brand);
  return buildMetadata({
    title: content.title,
    description: content.description,
    path: `/${city.slug}/marka/${brand.slug}`
  }) satisfies Metadata;
}

export default async function Page({ params }: { params: { city: string; brand: string } }) {
  const city = getCity(params.city);
  const brand = getBrand(params.brand);
  if (!city || !brand) notFound();

  const content = buildCityBrandLandingContent(city, brand);
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-bolgeleri", label: "Servis Bölgeleri" },
    { href: `/${city.slug}`, label: city.name },
    { href: `/${city.slug}/marka/${brand.slug}`, label: `${brand.name} Servisi` }
  ];

  const pageKey = `/${city.slug}/marka/${brand.slug}`;

  return (
    <article className="section">
      <Container>
        <JsonLd id="ld-crumbs-cb" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd id="ld-faq-cb" data={faqPageJsonLd(content.faqs)} />
        <JsonLd 
          id="ld-local-cb" 
          data={localBusinessJsonLdForArea({
            pageName: `${city.name} ${brand.name} Teknik Servis`,
            pageUrlPath: pageKey,
            areaName: city.name,
            serviceName: `${brand.name} Teknik Servis`,
            reviews: []
          })} 
        />
        <Breadcrumbs items={crumbs} />

        {/* 1. PREMIUM CITY-BRAND HERO */}
        <div className="city-hero" style={{ 
          background: "white", 
          padding: "40px", 
          borderRadius: "24px", 
          border: "1px solid var(--border)",
          marginBottom: "60px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "100%", background: "radial-gradient(circle at 100% 0%, rgba(242, 101, 34, 0.05) 0%, transparent 40%)", pointerEvents: "none" }}></div>
          
          <div className="grid" style={{ alignItems: "center" }}>
            <div style={{ gridColumn: "span 7" }}>
              <div className="badge" style={{ marginBottom: 16 }}>{brand.name.toUpperCase()} {city.name.toUpperCase()} YETKİLİ ÖZEL SERVİS</div>
              <h1 className="h1" style={{ fontSize: 48, lineHeight: 1.1, color: "var(--brand-900)" }}>
                {city.name} {brand.name} Teknik Servisi <br />
                <span style={{ color: "var(--brand)" }}>Hızlı, Garantili ve Ekonomik.</span>
              </h1>
              <p className="muted" style={{ fontSize: 18, marginTop: 24, lineHeight: 1.6, maxWidth: 580 }}>
                {content.intro}
              </p>
              
              <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 40, flexWrap: "wrap" }}>
                <Link href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="btn shadow-lg" style={{ padding: "16px 32px", fontSize: 17 }}>
                  Hemen Randevu Al
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--brand-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-900)" }}>
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>LOKAL MARKA HATTI</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "var(--brand-900)" }}>{site.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: "span 5" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-alt)" }}>
                <Image 
                  src="/images/home-one-img1.webp" 
                  alt={`${city.name} ${brand.name} Servisi`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. SPECIFIC SERVICE CARDS FOR BREND */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 className="h2" style={{ fontWeight: 900 }}>{city.name} {brand.name} Uzmanlık Alanlarımız</h2>
            <p className="muted">Parça değişimlerinde 1 yıl garanti ve markaya özel teknik çözümler.</p>
          </div>
          <div className="grid">
            {services.map((s, idx) => (
              <Link 
                key={s.slug} 
                href={`/${city.slug}/marka/${brand.slug}/${s.slug}`}
                className="card hover"
                style={{ gridColumn: "span 4", padding: 32, textAlign: "center" }}
              >
                <div style={{ fontSize: 48, marginBottom: 20, height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)" }}>
                  {idx === 0 ? <Flame size={48} /> : idx === 1 ? <Snowflake size={48} /> : <WashingMachine size={48} />}
                </div>
                <h3 className="h3" style={{ marginBottom: 12 }}>{brand.name} {s.label}</h3>
                <p className="muted" style={{ fontSize: 14 }}>
                  {city.name} genelinde {brand.name} marka {s.label.toLowerCase()} arızalarında profesyonel müdahale.
                </p>
                <div style={{ marginTop: 20, fontSize: 13, fontWeight: 700, color: "var(--brand)" }}>Hizmet Detayları →</div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. PRICE ESTIMATOR (BRAND PRE-SELECTED) */}
        <section style={{ marginBottom: 60, padding: "60px 0", background: "#f8fafc", borderRadius: "32px", border: "1px solid var(--border)" }}>
           <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 className="h2" style={{ fontWeight: 900 }}>{brand.name} Servis Ücreti Hesaplama</h2>
              <p className="muted">{city.name} için arıza türüne göre güncel fiyat aralıklarını öğrenin.</p>
            </div>
            <PriceEstimator initialBrand={brand.name} />
          </div>
        </section>

        {/* 4. TRUST FACTORS (LOCALIZED) */}
        <div className="grid" style={{ marginBottom: 60 }}>
          <TrustCard icon={<ShieldCheck size={32} />} title="Orijinal Parça Garantisi" desc={`${brand.name} cihazlarda sadece onaylı ve garantili parça kullanıyoruz.`} />
          <TrustCard icon={<Clock size={32} />} title="30 Dakikada Servis" desc={`${city.name} merkez ve ilçelere en hızlı mobil ulaşım ağı.`} />
          <TrustCard icon={<Shield size={32} />} title="1 Yıl Servis Güvencesi" desc="Yaptığımız her işlem ve değişen her parça kayıt altındadır." />
          <TrustCard icon={<Star size={32} />} title="Uzman Teknisyenler" desc={`${brand.name} ürün gamına hakim, sertifikalı teknik kadro.`} />
        </div>

        {/* 5. FAQ & REVIEWS */}
        <div className="grid" style={{ gap: 40, marginBottom: 60 }}>
          <div style={{ gridColumn: "span 7" }}>
            <h2 className="h1" style={{ fontSize: 32, marginBottom: 24 }}>Sıkça Sorulan Sorular</h2>
            <FaqList items={content.faqs} />
          </div>
          <div style={{ gridColumn: "span 5" }}>
            <h2 className="h1" style={{ fontSize: 32, marginBottom: 24 }}>Müşteri Yorumları</h2>
            <Reviews pageKey={pageKey} city={city.name} serviceLabel={`${brand.name} Teknik Servis`} brand={brand.name} />
          </div>
        </div>

        {/* DYNAMIC QA */}
        <DynamicQa city={city.name} district="Merkez" serviceLabel={`${brand.name} Servisi`} />
      </Container>
    </article>
  );
}

function TrustCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="card" style={{ gridColumn: "span 3", padding: 24, textAlign: "center", background: "white", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ color: "var(--brand)" }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--brand-900)" }}>{title}</h3>
      <p className="muted" style={{ fontSize: 13 }}>{desc}</p>
    </div>
  );
}
