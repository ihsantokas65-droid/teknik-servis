import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { HeroVisual } from "@/components/HeroVisual";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { getCityCoordinates } from "@/lib/coords";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, geoMeta, localBusinessJsonLdForArea, faqPageJsonLd } from "@/lib/seo";
import { buildCityLandingContent, buildCityBrandLandingContent } from "@/lib/content";
import { getCity, type City } from "@/lib/geo";
import { getBrands, getBrand, type Brand } from "@/lib/brands";
import { services } from "@/lib/services";
import type { Metadata } from "next";
import { getReviewsForKey } from "@/lib/reviews.server";
import { createRng, pickOne } from "@/lib/variation";
import { PriceEstimator } from "@/components/PriceEstimator";
import { DynamicQa } from "@/components/DynamicQa";
import { FaqList } from "@/components/FaqList";
import { BrandsGrid } from "@/components/BrandsGrid";
import { RelatedLinks } from "@/components/RelatedLinks";
import { site } from "@/lib/site";
import { PhoneCall, ScrollText, Settings, Tag, Zap, Flame, Snowflake, WashingMachine, Building2, CloudSun, Thermometer, ShieldCheck, Clock, Shield, Star } from "lucide-react";
import Image from "next/image";
import { getCityContext } from "@/data/city-metadata";

export async function generateMetadata({ params }: { params: { city: string } }) {
  const match = params.city.match(/^(.+)-(.+)-servisi$/);
  
  if (match) {
    const [_, citySlug, brandSlug] = match;
    const city = getCity(citySlug);
    const brand = getBrand(brandSlug);
    if (city && brand) {
      return buildMetadata({
        title: `${city.name} ${brand.name} Servisi | Marka Bazlı Yönlendirme`,
        description: `${city.name} içinde ${brand.name} cihazlar için servis yönlendirmesi, ilçe seçimi ve marka bazlı çözüm adımları. Hızlı kayıt ve net süreç.`,
        path: `/${params.city}`,
        keywords: [city.name, brand.name, "servis", "teknik servis", "marka servisi", "randevu"]
      });
    }
  }

  const city = getCity(params.city);
  if (!city) return {};

  const coords = getCityCoordinates(city.slug);
  const heroUrl = absoluteUrl(`/api/hero?city=${encodeURIComponent(city.name)}`);
  const landing = buildCityLandingContent(city);

  const base = buildMetadata({
    title: `${city.name} Teknik Servis | İlçe Bazlı Kombi, Klima ve Beyaz Eşya`,
    description: `${city.name} genelinde kombi, klima ve beyaz eşya için ilçe bazlı servis yönlendirmesi. Size en yakın sayfayı seçip hızlıca kayıt oluşturun.`,
    path: `/${city.slug}`,
    keywords: [city.name, "teknik servis", "kombi servisi", "klima servisi", "beyaz eşya servisi"]
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
  const match = params.city.match(/^(.+)-(.+)-servisi$/);
  
  if (match) {
    const [_, citySlug, brandSlug] = match;
    const city = getCity(citySlug);
    const brand = getBrand(brandSlug);
    if (city && brand) {
      return <CityBrandLayout city={city} brand={brand} slug={params.city} />;
    }
  }

  const city = getCity(params.city);
  if (!city) notFound();
  const landing = buildCityLandingContent(city);

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-bolgelerimiz", label: "Servis Bölgeleri" },
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
        <JsonLd id={`ld-faq-${city.slug}`} data={faqPageJsonLd(landing.faqs)} />
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

        <style dangerouslySetInnerHTML={{ __html: `
          .city-hero {
            padding: 40px;
            margin-bottom: 40px;
            background: white;
            border: 1px solid var(--border);
            position: relative;
            overflow: hidden;
            border-radius: 24px;
          }
          .city-hero-grid {
            display: flex;
            align-items: center;
            gap: 40px;
            position: relative;
            z-index: 1;
          }
          .hero-left { flex: 7; }
          .hero-right { flex: 5; }
          .hero-ctas {
            display: flex;
            gap: 20px;
            align-items: center;
            margin-top: 32px;
            flex-wrap: wrap;
          }
          .hero-visual-box {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
          }
          @media (max-width: 900px) {
            .city-hero { padding: 24px 16px; border-radius: 16px; margin-bottom: 32px; }
            .city-hero-grid { flex-direction: column; gap: 24px; text-align: center; }
            .hero-left { order: 1; }
            .hero-right { order: 2; width: 100%; }
            .hero-ctas { flex-direction: column; align-items: stretch; gap: 12px; }
            .hero-ctas .btn { width: 100%; justify-content: center; }
            .hero-visual-box { aspect-ratio: 2/1; }
            .hero-phone-item { justify-content: center; width: 100%; margin-top: 8px; }
            .h1-responsive { font-size: 32px !important; }
          }
        `}} />

        <div className="city-hero">
          <div style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "100%", background: "radial-gradient(circle at 100% 0%, rgba(242, 101, 34, 0.05) 0%, transparent 40%)", pointerEvents: "none" }}></div>
          
          <div className="city-hero-grid">
            <div className="hero-left">
              <div className="badge" style={{ marginBottom: 16 }}>{city.name.toUpperCase()} BÖLGESEL TEKNİK SERVİS AĞI</div>
              <h1 className="h1 h1-responsive" style={{ 
                marginTop: 12, 
                fontSize: 52, 
                lineHeight: 1.1,
                color: "var(--brand-900)",
                letterSpacing: "-1px"
              }}>
                {city.name} Servis <br />
                <span style={{ color: "var(--brand)" }}>30 Dakikada Kapınızda.</span>
              </h1>
              <p className="muted" style={{ 
                fontSize: 18, 
                marginTop: 20, 
                lineHeight: 1.6, 
                maxWidth: 540 
              }}>
                {landing.intro}
              </p>
              
              <div className="hero-ctas">
                <Link href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="btn shadow-lg" style={{ padding: "16px 32px", fontSize: 17 }}>
                  Hemen Randevu Al
                </Link>
                <div className="hero-phone-item" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--brand-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-900)" }}>
                    <PhoneCall size={20} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>LOKAL SERVİS HATTI</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "var(--brand-900)" }}>{site.phone}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hero-right">
              <div className="hero-visual-box">
                <Image 
                  src="/images/home-one-img1.webp" 
                  alt={`${city.name} Teknik Servis`}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* REGIONAL TECHNICAL HUB - SEO BOOSTER */}
        <div className="grid" style={{ marginBottom: 60 }}>
          <div className="card" style={{ gridColumn: "span 6", padding: 32, borderLeft: "4px solid var(--brand)", background: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ color: "var(--brand)" }}><CloudSun size={24} /></div>
              <h2 className="h3" style={{ fontWeight: 900 }}>Bölgesel İklim Değerlendirmesi</h2>
            </div>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
               {getCityContext(city.slug).climateNote}
            </p>
          </div>
          <div className="card" style={{ gridColumn: "span 6", padding: 32, borderLeft: "4px solid var(--accent)", background: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ color: "var(--accent)" }}><Thermometer size={24} /></div>
              <h2 className="h3" style={{ fontWeight: 900 }}>Teknik Bakım Önerisi</h2>
            </div>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
               {getCityContext(city.slug).technicalTip}
            </p>
          </div>
        </div>

        {/* PRICE ESTIMATOR - TRUST BOOSTER */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 className="h2" style={{ fontWeight: 900 }}>{city.name} Servis Ücreti Hesaplama</h2>
            <p className="muted" style={{ fontSize: 16 }}>Arıza türünü seçin, maliyeti anında öğrenin.</p>
          </div>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <PriceEstimator />
          </div>
        </section>

        {/* SERVICES CARDS - EXACTLY LIKE HOMEPAGE */}
        <section style={{ marginBottom: 60 }}>
           <div className="grid" style={{ gap: 24 }}>
            {services.map((s, idx) => (
              <Link 
                key={s.slug} 
                href={`/${city.slug}/${s.slug}`}
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
                   "Buzdolabı, çamaşır ve bulaşık makinesi onarımı."}
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
            <TrustItem icon={<Zap size={32} strokeWidth={1.5} />} title="Hızlı Müdahale" desc={`${city.name} geneli 30 dakikada servis.`} />
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

        {/* FAQ - SEO RANKING BOOSTER */}
        <section style={{ marginTop: 60, marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 className="h2" style={{ fontWeight: 900 }}>Sıkça Sorulan Sorular</h2>
            <p className="muted" style={{ fontSize: 16 }}>{city.name} teknik servis süreçlerimiz hakkında merak edilenler.</p>
          </div>
          <FaqList items={landing.faqs} />
        </section>

        {/* DYNAMIC QA - LOCALIZED UGC */}
        <DynamicQa city={city.name} district="Merkez" serviceLabel="Teknik Servis" />
      </Container>

      <div style={{ background: "white", padding: "80px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 className="h2" style={{ fontWeight: 950, fontSize: 36 }}>{city.name} Popüler Marka Servisleri</h2>
            <p className="muted" style={{ fontSize: 18, marginTop: 12 }}>{city.name} genelinde hızlı arıza kaydı oluşturabileceğiniz tüm markalarımız.</p>
          </div>
          <BrandsGrid brands={getBrands().slice(0, 80)} citySlug={city.slug} />
        </Container>
      </div>

      <RelatedLinks
        title={`${city.name} Sayfasını Ana Konu Sayfalarıyla Bağlayın`}
        intro="Şehir sayfası; hizmet, marka ve bilgi içeriklerine doğal geçiş yaptığında Google site mimarisini daha iyi anlar."
        links={[
          {
            href: "/servis-bolgeleri",
            label: "Servis Bölgeleri",
            description: "Tüm şehir ve ilçe bazlı servis sayfalarını listeler."
          },
          {
            href: "/hizmetler",
            label: "Hizmetler",
            description: "Kombi, klima ve beyaz eşya servis kategorilerini açar."
          },
          {
            href: "/markalar",
            label: "Markalar",
            description: "Bu şehirde servis verdiğimiz marka sayfalarına geçiş sağlar."
          },
          {
            href: "/blog",
            label: "Blog",
            description: "Teknik rehberleri ve bakım içeriklerini gösterir."
          },
          {
            href: "/ariza-kodlari",
            label: "Arıza Kodları",
            description: "Hata kodu ve çözüm rehberlerini açar."
          },
          {
            href: "/iletisim",
            label: "İletişim",
            description: "Servis kaydı ve hızlı dönüş için iletişim noktasıdır."
          }
        ]}
      />

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

function CityBrandLayout({ city, brand, slug }: { city: City, brand: Brand, slug: string }) {
  const content = buildCityBrandLandingContent(city, brand);
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-bolgeleri", label: "Servis Bölgeleri" },
    { href: `/${city.slug}`, label: city.name },
    { href: `/${slug}`, label: `${brand.name} Servisi` }
  ];

  const coords = getCityCoordinates(city.slug);

  return (
    <article className="section">
      <Container>
        <JsonLd id="ld-crumbs-cb" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd id="ld-faq-cb" data={faqPageJsonLd(content.faqs)} />
        <JsonLd 
          id="ld-local-cb" 
          data={localBusinessJsonLdForArea({
            pageName: `${city.name} ${brand.name} Teknik Servis`,
            pageUrlPath: `/${slug}`,
            areaName: city.name,
            coords,
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
              <h1 className="h1" style={{ fontSize: 40, lineHeight: 1.1, color: "var(--brand-900)" }}>
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
                href={`/${city.slug}-${brand.slug}-servisi`}
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
          <TrustItem icon={<ShieldCheck size={32} />} title="Orijinal Parça Garantisi" desc={`${brand.name} cihazlarda sadece onaylı ve garantili parça kullanıyoruz.`} />
          <TrustItem icon={<Clock size={32} />} title="30 Dakikada Servis" desc={`${city.name} merkez ve ilçelere en hızlı mobil ulaşım ağı.`} />
          <TrustItem icon={<Shield size={32} />} title="1 Yıl Servis Güvencesi" desc="Yaptığımız her işlem ve değişen her parça kayıt altındadır." />
          <TrustItem icon={<Star size={32} />} title="Uzman Teknisyenler" desc={`${brand.name} ürün gamına hakim, sertifikalı teknik kadro.`} />
        </div>

        {/* 5. FAQ & REVIEWS */}
        <div className="grid" style={{ gap: 40, marginBottom: 60 }}>
          <div style={{ gridColumn: "span 7" }}>
            <h2 className="h2" style={{ marginBottom: 32 }}>Sıkça Sorulan Sorular</h2>
            <FaqList items={content.faqs} />
          </div>
          <div style={{ gridColumn: "span 5" }}>
            <h2 className="h2" style={{ marginBottom: 32 }}>Müşteri Yorumları</h2>
            <Reviews pageKey={`/${slug}`} city={city.name} serviceLabel={`${brand.name} Teknik Servis`} brand={brand.name} />
          </div>
        </div>

        {/* DYNAMIC QA */}
        <DynamicQa city={city.name} district="Merkez" serviceLabel={`${brand.name} Servisi`} />
      </Container>
    </article>
  );
}
