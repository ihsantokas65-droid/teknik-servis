import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, localBusinessJsonLdForArea } from "@/lib/seo";
import { serviceOfferings } from "@/lib/services";
import { LazyReviews as Reviews } from "@/components/LazyReviews";

export const metadata = buildMetadata({
  title: 'Beyaz Eşya Servisi | Buzdolabı, Çamaşır ve Bulaşık',
  description: 'Buzdolabı, çamaşır makinesi ve bulaşık makinesi onarımı için şehir ve ilçe bazlı servis sayfaları.',
  path: '/hizmetler/beyaz-esya-servisi',
  keywords: ['beyaz eşya servisi', 'buzdolabı servisi', 'çamaşır makinesi servisi', 'bulaşık makinesi servisi']
});

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/hizmetler", label: "Hizmetler" },
    { href: "/hizmetler/beyaz-esya-servisi", label: "Beyaz Eşya Servisi" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="ld-breadcrumb-beyaz-esya-servisi" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id="ld-localbusiness-beyaz-esya-servisi"
          data={localBusinessJsonLdForArea({
            pageName: "Beyaz Eşya Servisi",
            pageUrlPath: "/hizmetler/beyaz-esya-servisi",
            areaName: "Türkiye",
            coords: null,
            serviceName: "Beyaz eşya servisi",
            omitAddress: true
          })}
        />
        <h1 className="h1" style={{ fontSize: 36, color: "var(--brand-900)", fontWeight: 900 }}>
          Beyaz Eşya Servisi
        </h1>
        <p className="muted" style={{ maxWidth: 820, marginTop: 12 }}>
          Buzdolabı, çamaşır makinesi, bulaşık makinesi ve fırın gibi beyaz eşyalarınız için garantili onarım ve bakım hizmeti sağlıyoruz. 
        </p>

        <div className="grid" style={{ marginTop: 32 }}>
          {serviceOfferings["beyaz-esya"].map((x: { title: string; points: string[] }) => (
            <div key={x.title} className="card hover" style={{ gridColumn: "span 4", padding: 24 }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-900)", marginBottom: 12 }}>{x.title}</div>
              <ul className="muted" style={{ margin: "0 0 0 18px", fontSize: 14 }}>
                {x.points.map((p: string) => (
                  <li key={p} style={{ marginTop: 6 }}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link className="btn" href="/servis-bolgeleri" style={{ padding: "16px 40px" }}>
            Hemen Bölgenizi Seçin
          </Link>
        </div>
      </Container>

      <Reviews 
        pageKey="/hizmetler/beyaz-esya-servisi" 
        city="Türkiye" 
        district="Genel" 
        serviceLabel="Beyaz Eşya Servisi" 
      />
    </section>
  );
}
