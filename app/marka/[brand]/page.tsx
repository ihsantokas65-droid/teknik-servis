import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { HeroVisual } from "@/components/HeroVisual";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, localBusinessJsonLdForArea, absoluteUrl, faqPageJsonLd } from "@/lib/seo";
import { getBrand } from "@/lib/brands";
import { buildBrandLandingContent } from "@/lib/content";
import { services } from "@/lib/services";
import { getCities } from "@/lib/geo";
import { FaqList } from "@/components/FaqList";
import { site } from "@/lib/site";
import type { Metadata } from "next";
import { PriceEstimator } from "@/components/PriceEstimator";
import { PhoneCall, ShieldCheck, Clock, Shield, Star, Flame, Snowflake, WashingMachine } from "lucide-react";
import Image from "next/image";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Footer } from "@/components/Footer";
import { getRelatedBlogsForContext } from "@/lib/blog";
import { QuickSummary } from "@/components/QuickSummary";


export async function generateMetadata({ params }: { params: { brand: string } }) {
  const brand = getBrand(params.brand);
  if (!brand) return {};

  const heroUrl = absoluteUrl(`/api/hero?brand=${encodeURIComponent(brand.name)}`);
  const content = buildBrandLandingContent(brand);

  const base = buildMetadata({
    title: `${brand.name} Servisi | Türkiye Geneli Teknik Destek`,
    description: `${brand.name} cihazlar için Türkiye genelinde teknik destek, servis yönlendirmesi ve marka bazlı çözüm sayfaları. Hızlı kayıt ve net süreç.`,
    path: `/marka/${brand.slug}`,
    keywords: [brand.name, "servis", "teknik servis", "marka servisi", "Türkiye geneli"]
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
  const content = buildBrandLandingContent(brand);

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/markalar", label: "Markalar" },
    { href: `/marka/${brand.slug}`, label: brand.name }
  ];

  const pageKey = `/marka/${brand.slug}`;

  return (
    <article className="section">
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
            areaServed: ["Türkiye", "81 il"]
          })}
        />
        <JsonLd id={`ld-faq-brand-${brand.slug}`} data={faqPageJsonLd(content.faqs)} />
        <Breadcrumbs items={crumbs} />

        {/* 1. PREMIUM BRAND HERO */}
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
              <div className="badge" style={{ marginBottom: 16 }}>{brand.name.toUpperCase()} KURUMSAL TEKNİK DESTEK</div>
              <h1 className="h1" style={{ fontSize: 48, lineHeight: 1.1, color: "var(--brand-900)" }}>
                Profesyonel {brand.name} <br />
                <span style={{ color: "var(--brand)" }}>Servis Hizmetleri.</span>
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
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>MERKEZ DESTEK HATTI</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "var(--brand-900)" }}>{site.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: "span 5" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-alt)" }}>
                <Image 
                  src="/images/home-one-img1.webp" 
                  alt={`${brand.name} Servisi`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {content.quickSummary && (
          <div style={{ marginBottom: 60 }}>
            <QuickSummary 
              title={content.quickSummary.title}
              items={content.quickSummary.items}
              answer={content.quickSummary.answer}
            />
          </div>
        )}

        {/* 2. BRAND SPECIALIZED SERVICES */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 className="h2" style={{ fontWeight: 900 }}>{brand.name} Uzmanlık Alanlarımız</h2>
            <p className="muted">Türkiye genelinde yaygın mobil servis ağı ile markaya özel teknik çözümler.</p>
          </div>
          <div className="grid">
            {services
              .filter((s) => brand.supportedServices.includes(s.kind))
              .map((s, idx) => (
                <Link 
                  key={s.slug} 
                  href={`/marka/${brand.slug}/${s.slug}`}
                  className="card hover"
                  style={{ gridColumn: "span 4", padding: 32, textAlign: "center" }}
                >
                  <div style={{ fontSize: 48, marginBottom: 20, height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)" }}>
                    {idx === 0 ? <Flame size={48} /> : idx === 1 ? <Snowflake size={48} /> : <WashingMachine size={48} />}
                  </div>
                  <h3 className="h3" style={{ marginBottom: 12 }}>{brand.name} {s.label}</h3>
                  <p className="muted" style={{ fontSize: 14 }}>
                    {brand.name} marka {s.label.toLowerCase()} cihazlarda orijinal yedek parça ve yerinde servis imkanı.
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
              <p className="muted">Bulunduğunuz bölgeye göre tahmini servis ve işçilik maliyetlerini hesaplayın.</p>
            </div>
            <PriceEstimator initialBrand={brand.name} />
          </div>
        </section>

        {/* 4. TRUST FACTORS */}
        <div className="grid" style={{ marginBottom: 60 }}>
          <TrustCard icon={<ShieldCheck size={32} />} title="Resmi Parça Garantisi" desc={`${brand.name} tarafından onaylanmış veya dengi yüksek kaliteli parçalar kullanılır.`} />
          <TrustCard icon={<Clock size={32} />} title="Aynı Gün Servis" desc="Geniş mobil ağımız sayesinde talepleriniz genellikle aynı gün içinde karşılanır." />
          <TrustCard icon={<Shield size={32} />} title="Kurumsal İşçilik" desc="Tüm teknik müdahaleler sertifikalı teknisyenlerimiz tarafından yapılır." />
          <TrustCard icon={<Star size={32} />} title="Müşteri Memnuniyeti" desc={`Binlerce başarılı ${brand.name} servis kaydı ve mutlu müşteriler.`} />
        </div>

        {/* 5. FAQ & REVIEWS */}
        <div className="grid" style={{ gap: 40, marginBottom: 60 }}>
          <div style={{ gridColumn: "span 7" }}>
            <h2 className="h1" style={{ fontSize: 32, marginBottom: 24 }}>Sıkça Sorulan Sorular</h2>
            <FaqList items={content.faqs} />
          </div>
          <div style={{ gridColumn: "span 5" }}>
            <h2 className="h1" style={{ fontSize: 32, marginBottom: 24 }}>Müşteri Deneyimleri</h2>
            <Reviews pageKey={pageKey} brand={brand.name} serviceLabel={`${brand.name} Teknik Servis`} />
          </div>
        </div>

        {/* 6. REGIONAL LINKS - SEO POWER-UP */}
        <section style={{ marginTop: 80, marginBottom: 40, borderTop: "1px solid var(--border)", paddingTop: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 className="h2" style={{ fontWeight: 900 }}>{brand.name} Bölgesel Servis Ağımız</h2>
            <p className="muted">Hizmet almak istediğiniz ili seçerek o bölgeye özel teknik destek sayfasına gidebilirsiniz.</p>
          </div>
          <div className="grid" style={{ gap: "12px" }}>
            {getCities().map((city) => (
              <Link 
                key={city.slug} 
                href={`/${city.slug}-${brand.slug}-servisi`}
                className="card"
                style={{ 
                  gridColumn: "span 2", 
                  padding: "12px 16px", 
                  fontSize: 14, 
                  textAlign: "center",
                  fontWeight: 600,
                  color: "var(--brand-900)",
                  background: "#f8fafc",
                  border: "1px solid transparent",
                  transition: "all 0.2s ease"
                }}
              >
                {city.name} {brand.name} Servisi
              </Link>
            ))}
          </div>
        </section>

        <RelatedLinks
          title="Bu Marka Sayfasını Diğer İçeriklerle Bağlayın"
          intro="Marka, hizmet ve bölge sayfaları arasında kurulan bağlantılar arama motoruna tek bir konu etrafında birleşen bir site yapısı gösterir."
          links={[
            {
              href: "/markalar",
              label: "Tüm Markalar",
              description: "Marka listesinin tamamına geri dönün."
            },
            {
              href: "/servis-bolgeleri",
              label: "Servis Bölgeleri",
              description: "Şehir ve ilçe bazlı servis ağını inceleyin."
            },
            {
              href: "/hizmetler",
              label: "Hizmetler",
              description: "Kombi, klima ve beyaz eşya kategorilerini açın."
            },
            {
              href: "/blog",
              label: "Blog",
              description: "Markaya ve hizmete bağlı teknik yazıları okuyun."
            },
            {
              href: "/ariza-kodlari",
              label: "Arıza Kodları",
              description: "Bu markayla ilişkili hata kodu rehberlerine gidin."
            },
            {
              href: "/iletisim",
              label: "İletişim",
              description: "Marka bazlı servis kaydı için iletişim kurun."
            }
          ]}
        />
      </Container>
        <Footer 
          brand={brand} 
          variant="brand" 
          relatedBlogs={getRelatedBlogsForContext({ brandSlug: brand.slug, category: "genel", limit: 4 })} 
        />
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
