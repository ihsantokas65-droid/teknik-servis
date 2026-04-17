import Link from "next/link";
import { PhoneCall, Flame, Snowflake, WashingMachine, Building2, ScrollText, Settings, Tag, Zap } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/Container";
import { CategoryStrip } from "@/components/CategoryStrip";
import { FaqList } from "@/components/FaqList";
import { LocationPicker } from "@/components/LocationPicker";
import { PriceEstimator } from "@/components/PriceEstimator";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { BrandsGrid } from "@/components/BrandsGrid";
import { getBrands } from "@/lib/brands";
import { getCities } from "@/lib/geo";
import { services } from "@/lib/services";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata, webSiteJsonLd, faqPageJsonLd, organizationJsonLd } from "@/lib/seo";

export const revalidate = 86400; // Cache for 24 hours (ISR)

export const metadata = buildMetadata({
  title: "Evinizin Konforu, Profesyonel Ellerde",
  path: "/"
});

export default function Page() {
  const allCities = getCities();
  const brands = getBrands().slice(0, 18);

  const homeFaq = [
    { q: "Servis kaydı nasıl oluşturulur?", a: "İletişim sayfasından arayabilir veya bölgenizi seçip ilgili servis sayfasından ilerleyebilirsiniz." },
    { q: "Aynı gün servis mümkün mü?", a: "Yoğunluk ve lokasyona göre değişir. Uygunluk varsa 2 saat içinde müdahale ediyoruz." }
  ];

  return (
    <>
      <JsonLd id="ld-website" data={webSiteJsonLd()} />
      <JsonLd id="ld-org" data={organizationJsonLd()} />
      <JsonLd id="ld-faq-home" data={faqPageJsonLd(homeFaq)} />

      {/* 1. PREMIUM HERO SECTION */}
      <section className="hero" style={{ background: "white", padding: "60px 0", overflow: "hidden" }}>
        <Container>
          <div className="grid" style={{ alignItems: "center" }}>
            <div style={{ gridColumn: "span 7" }}>
              <div className="badge" style={{ marginBottom: 20 }}>TÜRKİYE GENELİ TEKNİK SERVİS AĞI</div>
              <h1 className="h1" style={{ color: "var(--brand-900)", fontSize: 64 }}>
                Evinizin Konforu,<br />
                <span style={{ color: "var(--brand)" }}>Profesyonel Ellerde.</span>
              </h1>
              <p className="muted" style={{ fontSize: 20, marginTop: 24, maxWidth: 640, lineHeight: 1.6 }}>
                Kombi, Klima ve Beyaz Eşyalarınız için aynı gün randevu, şeffaf fiyatlandırma ve 1 yıl parça garantisi.
              </p>
              
              <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 40, flexWrap: "wrap" }}>
                <Link className="btn" href="/iletisim" style={{ padding: "18px 40px", fontSize: 18 }}>
                  Hemen Randevu Al
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--brand-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-900)" }}>
                    <PhoneCall size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>İLETİŞİM NUMARASI</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--brand-900)" }}>{site.phone}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 40 }}>
                <LocationPicker cities={allCities} />
              </div>
            </div>

            <div style={{ gridColumn: "span 5", position: "relative" }}>
              <div style={{ 
                position: "relative", 
                width: "100%", 
                aspectRatio: "1/1"
              }}>
                <Image 
                  src="/images/branding/servisuzmani-hero.png" 
                  alt="Profesyonel Teknik Servis"
                  fill
                  priority
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. PRICE ESTIMATOR SECTION */}
      <section className="section" style={{ background: "#f8fafc", padding: "60px 0", borderBottom: "1px solid var(--border)" }}>
        <Container>
          <div className="grid">
            <div style={{ gridColumn: "span 10", gridColumnStart: 2 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 className="h2" style={{ fontWeight: 900 }}>Servis Ücreti Hesaplama</h2>
                <p className="muted" style={{ fontSize: 16, marginTop: 8 }}>Cihazınızdaki sorunu seçin, ortalama onarım maliyetini saniyeler içinde öğrenin.</p>
              </div>
              <PriceEstimator />
            </div>
          </div>
        </Container>
      </section>

      {/* 3. SERVICE CARDS (ICON ORIENTED) */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <Container>
          <div className="grid" style={{ gap: 24 }}>
            {services.map((s, idx) => (
              <Link 
                key={s.slug} 
                href={`/hizmetler/${s.slug}`}
                className="card hover"
                style={{ gridColumn: "span 3", padding: 32, textAlign: "center" }}
              >
                <div style={{ 
                  fontSize: 48, marginBottom: 20, 
                  height: 80, display: "flex", alignItems: "center", justifyContent: "center" 
                }}>
                  {idx === 0 ? <Flame size={48} strokeWidth={1.5} /> : 
                   idx === 1 ? <Snowflake size={48} strokeWidth={1.5} /> : 
                   idx === 2 ? <WashingMachine size={48} strokeWidth={1.5} /> : 
                   <Building2 size={48} strokeWidth={1.5} />}
                </div>
                <h3 className="h3" style={{ marginBottom: 12 }}>{s.label}</h3>
                <p className="muted" style={{ fontSize: 14 }}>
                  {idx === 0 ? "Bakım, tamir ve petek temizliği çözümleri." : 
                   idx === 1 ? "Montaj, gaz dolumu ve filtre temizliği." : 
                   idx === 2 ? "Buzdolabı, çamaşır ve bulaşık makinesi onarımı." : 
                   "Otel ve işletmeler için kurumsal periyodik bakım."}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. WHY US (TRUST FACTORS) */}
      <section className="section" style={{ background: "white" }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 className="h2" style={{ fontWeight: 900 }}>NEDEN SERVİSUZMANI?</h2>
          </div>
          <div className="grid">
            <TrustItem icon={<ScrollText size={32} strokeWidth={1.5} />} title="Sertifikalı Teknisyenler" desc="Tüm ekibimiz yetki belgelidir." />
            <TrustItem icon={<Settings size={32} strokeWidth={1.5} />} title="Orijinal Yedek Parçalar" desc="Cihazınızın ömrünü riske atmıyoruz." />
            <TrustItem icon={<Tag size={32} strokeWidth={1.5} />} title="Şeffaf Fiyatlandırma" desc="Sürpriz ücret yok, onayınız olmadan işlem yok." />
            <TrustItem icon={<Zap size={32} strokeWidth={1.5} />} title="Hızlı Müdahale" desc="Arıza kaydından sonra 2 saat içinde kapınızdayız." />
          </div>
        </Container>
      </section>

      <CategoryStrip limitPerService={5} />

      <Reviews pageKey="/" city="Türkiye" district="Geneli" serviceLabel="Teknik Servis" />
      
      <BrandsGrid />
    </>
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
