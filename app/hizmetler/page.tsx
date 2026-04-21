import Link from "next/link";
import { Container } from "@/components/Container";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, localBusinessJsonLdForArea } from "@/lib/seo";
import { services } from "@/lib/services";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Footer } from "@/components/Footer";
import { getRelatedBlogsForContext } from "@/lib/blog";
import { site } from "@/lib/site";


export const metadata = buildMetadata({
  title: 'Hizmetler | Kombi, Klima ve Beyaz Eşya Kategorileri',
  description: 'Yetkili Kombi Servisi markası, kombi, klima ve beyaz eşya için bağımsız özel servis hizmeti sağlıyor; bakım, onarım ve arıza tespiti kategorilerini inceleyin.',
  path: '/hizmetler',
  keywords: ['hizmetler', 'kombi servisi', 'klima servisi', 'beyaz eşya servisi'],
  geo: {
    lat: site.coordinates.lat,
    lon: site.coordinates.lon,
    placeName: "Van"
  }
});

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/hizmetler", label: "Hizmetler" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="ld-breadcrumb-hizmetler" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id="ld-localbusiness-hizmetler"
          data={localBusinessJsonLdForArea({
            pageName: "Hizmetler",
            pageUrlPath: "/hizmetler",
            areaName: "Türkiye",
            coords: site.coordinates,
            serviceName: "Kombi, klima, beyaz eşya servisi",
            omitAddress: false
          })}
        />
        <h1 className="h1" style={{ fontSize: 36, color: "var(--brand-900)", fontWeight: 900 }}>
          Hizmetlerimiz
        </h1>
        <p className="muted" style={{ maxWidth: 820, marginTop: 12 }}>
          Profesyonel teknik servis kadromuzla kombi, klima ve beyaz eşyalarınız için yerinde arıza tespiti ve onarım hizmeti sunuyoruz.
        </p>

        <div className="grid" style={{ marginTop: 32 }}>
          {services.map((s) => (
            <Link key={s.slug} href={`/hizmetler/${s.slug}`} className="card hover" style={{ gridColumn: "span 4", padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>
                {s.kind === "kombi" ? "🔥" : s.kind === "klima" ? "❄️" : "🧺"}
              </div>
              <div className="h2" style={{ fontSize: 22, fontWeight: 900, color: "var(--brand-900)" }}>
                {s.label}
              </div>
              <div className="muted" style={{ fontSize: 14, marginTop: 10 }}>
                {s.label} için bölgenizi seçerek uzman ekibimize ulaşabilirsiniz.
              </div>
              <div style={{ marginTop: 20, color: "var(--brand)", fontWeight: 800, fontSize: 14 }}>
                Servis Bölgeleri →
              </div>
            </Link>
          ))}
        </div>

        <RelatedLinks
          title="Bu Sayfadan Diğer Servislere Geçin"
          intro="Hizmet sayfaları, marka sayfaları ve bölge sayfaları arasında düzenli bir bağlantı ağı kurduk. Böylece kullanıcı tek bir sayfada kalmadan doğru konuya ilerleyebiliyor."
          links={[
            {
              href: "/markalar",
              label: "Markalar",
              description: "Servis verdiğimiz markaların tamamını inceleyin."
            },
            {
              href: "/servis-bolgeleri",
              label: "Servis Bölgeleri",
              description: "Şehir ve ilçe sayfalarına hızlı geçiş yapın."
            },
            {
              href: "/blog",
              label: "Blog",
              description: "Bakım ipuçları ve teknik rehber içeriklerine göz atın."
            },
            {
              href: "/ariza-kodlari",
              label: "Arıza Kodları",
              description: "Hata kodları ve çözüm adımlarını görüntüleyin."
            },
            {
              href: "/iletisim",
              label: "İletişim",
              description: "Servis kaydı için doğrudan iletişim kurun."
            },
            {
              href: "/servis-ucretleri",
              label: "Servis Ücretleri",
              description: "Ortalama ücret ve maliyet bilgilerine ulaşın."
            }
          ]}
        />

        <div className="card" style={{ padding: 24, marginTop: 32, background: "var(--brand-soft)", border: "1px solid var(--brand)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-900)" }}>Hızlı Servis Kaydı</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                Şehir ve ilçenizi seçerek size en yakın teknisyenimizi yönlendirmemizi sağlayın.
              </div>
            </div>
            <Link className="btn" href="/servis-bolgeleri">
              Tüm Bölgeleri Gör
            </Link>
          </div>
        </div>
      </Container>
      
      <Reviews 
        pageKey="/hizmetler" 
        city="Türkiye" 
        district="Genel" 
        serviceLabel="Teknik Servis" 
      />
      <Footer relatedBlogs={getRelatedBlogsForContext({ limit: 4 })} />
    </section>

  );
}
