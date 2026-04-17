import Link from "next/link";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, localBusinessJsonLdForArea } from "@/lib/seo";
import { getBrands } from "@/lib/brands";
import { services } from "@/lib/services";
import { LazyReviews as Reviews } from "@/components/LazyReviews";

export const metadata = buildMetadata({
  title: "Markalar",
  description: "Kombi, klima ve beyaz eşya için marka bazlı servis sayfaları.",
  path: "/markalar"
});

export default function Page() {
  const brands = getBrands();
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/markalar", label: "Markalar" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="ld-breadcrumb-markalar" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id="ld-localbusiness-markalar"
          data={localBusinessJsonLdForArea({
            pageName: "Markalar",
            pageUrlPath: "/markalar",
            areaName: "Türkiye",
            coords: null,
            serviceName: "Teknik servis markaları",
            omitAddress: true
          })}
        />
        <h1 className="h1" style={{ fontSize: 36, color: "var(--brand-900)", fontWeight: 900 }}>
          Markalar
        </h1>
        <p className="muted" style={{ maxWidth: 860, marginTop: 12 }}>
          Marka servis sayfanızı seçin. Her marka ve hizmet türü için özel teknisyen kadromuz mevcuttur.
        </p>

        <div className="grid" style={{ marginTop: 32 }}>
          {brands.slice(0, 150).map((b) => (
            <div key={b.slug} className="card hover" style={{ gridColumn: "span 4", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <Link href={`/marka/${b.slug}`}>
                  <h3 className="h3" style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-900)" }}>
                    {b.name}
                  </h3>
                </Link>
              </div>

              <div style={{ fontSize: 14, marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {services
                  .filter((s) => b.supportedServices.includes(s.kind))
                  .map((s) => (
                    <Link key={s.slug} href={`/marka/${b.slug}/${s.slug}`} style={{ color: "var(--brand)", fontWeight: 700 }}>
                      #{s.label}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {brands.length > 150 ? (
          <div className="muted" style={{ marginTop: 24, textAlign: "center", fontWeight: 700 }}>
            Listelenen: 150 / Toplam: {brands.length} marka
          </div>
        ) : null}
      </Container>

      <Reviews 
        pageKey="/markalar" 
        city="Türkiye" 
        district="Genel" 
        serviceLabel="Marka Servisi" 
      />
    </section>
  );
}
