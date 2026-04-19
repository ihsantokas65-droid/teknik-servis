import Link from "next/link";
import { Container } from "@/components/Container";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, localBusinessJsonLdForArea } from "@/lib/seo";
import { services } from "@/lib/services";
import { LazyReviews as Reviews } from "@/components/LazyReviews";

export const metadata = buildMetadata({
  title: 'Hizmetler | Kombi, Klima ve Beyaz Eşya Kategorileri',
  description: 'Kombi, klima ve beyaz eşya için sunduğumuz bakım, onarım ve arıza tespiti hizmet kategorilerini inceleyin.',
  path: '/hizmetler',
  keywords: ['hizmetler', 'kombi servisi', 'klima servisi', 'beyaz eşya servisi']
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
            coords: null,
            serviceName: "Kombi, klima, beyaz eşya servisi",
            omitAddress: true
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
    </section>
  );
}
