import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, localBusinessJsonLdForArea } from "@/lib/seo";
import { serviceOfferings } from "@/lib/services";
import { LazyReviews as Reviews } from "@/components/LazyReviews";

export const metadata = buildMetadata({
  title: "Klima Servisi",
  description: "Klima bakım, onarım ve montajı için şehir/ilçe bazlı servis sayfaları.",
  path: "/hizmetler/klima-servisi"
});

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/hizmetler", label: "Hizmetler" },
    { href: "/hizmetler/klima-servisi", label: "Klima Servisi" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="ld-breadcrumb-klima-servisi" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id="ld-localbusiness-klima-servisi"
          data={localBusinessJsonLdForArea({
            pageName: "Klima Servisi",
            pageUrlPath: "/hizmetler/klima-servisi",
            areaName: "Türkiye",
            coords: null,
            serviceName: "Klima servisi",
            omitAddress: true
          })}
        />
        <h1 className="h1" style={{ fontSize: 36, color: "var(--brand-900)", fontWeight: 900 }}>
          Klima Servisi
        </h1>
        <p className="muted" style={{ maxWidth: 820, marginTop: 12 }}>
          Klima montajı, bakım, onarım ve gaz şarjı hizmetlerimizle dört mevsim konforunuz için çalışıyoruz. Bölgenizi seçerek uzman ekibimize ulaşın.
        </p>

        <div className="grid" style={{ marginTop: 32 }}>
          {serviceOfferings.klima.map((x: { title: string; points: string[] }) => (
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
        pageKey="/hizmetler/klima-servisi" 
        city="Türkiye" 
        district="Genel" 
        serviceLabel="Klima Servisi" 
      />
    </section>
  );
}
