import Link from "next/link";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, localBusinessJsonLdForArea } from "@/lib/seo";
import { getCities } from "@/lib/geo";
import { services } from "@/lib/services";
import { LazyReviews as Reviews } from "@/components/LazyReviews";

export const metadata = buildMetadata({
  title: 'Servis Bölgeleri | Şehir Seçin ve En Yakın Ekibe Ulaşın',
  description: '81 il ve ilçe için hazırlanmış servis bölgeleri listesi. Şehrinizi seçin, size en yakın teknik servis sayfasına hızlıca geçin.',
  path: '/servis-bolgeleri',
  keywords: ['servis bölgeleri', '81 il', 'şehir seçimi', 'teknik servis', 'yerinde servis']
});

export default function Page() {
  const cities = getCities();
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-bolgeleri", label: "Servis Bölgeleri" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="ld-breadcrumb-servis-bolgeleri" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id="ld-localbusiness-servis-bolgeleri"
          data={localBusinessJsonLdForArea({
            pageName: "Servis Bölgeleri",
            pageUrlPath: "/servis-bolgeleri",
            areaName: "Türkiye",
            coords: null,
            serviceName: "Teknik servis",
            omitAddress: true
          })}
        />
        <h1 className="h1" style={{ fontSize: 36, color: "var(--brand-900)", fontWeight: 900 }}>
          Servis Bölgeleri
        </h1>
        <p className="muted" style={{ maxWidth: 860, marginTop: 12 }}>
          81 ilde hizmet veren teknik servis ağımızla yanınızdayız. Şehrinizi seçerek size en yakın ekibimize ulaşın.
        </p>

        <div className="grid" style={{ marginTop: 32 }}>
          {cities.map((c) => (
            <div key={c.slug} className="card hover" style={{ gridColumn: "span 4", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <Link href={`/${c.slug}`} style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-900)" }}>
                  {c.name}
                </Link>
                <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
                  {c.districts.length} İlçe
                </span>
              </div>

              <div style={{ fontSize: 14, marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10 }}>
                {services.map((s) => (
                  <Link key={s.slug} href={`/${c.slug}/${c.districts[0]?.slug ?? "merkez"}/${s.slug}`} style={{ color: "var(--brand)", fontWeight: 700 }}>
                    #{s.label}
                  </Link>
                ))}
              </div>

              <div className="muted" style={{ fontSize: 13, marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                Öne Çıkanlar:{" "}
                {c.districts.slice(0, 3).map((d, idx) => (
                  <span key={d.slug}>
                    {idx > 0 ? ", " : ""}
                    <Link href={`/${c.slug}/${d.slug}`} style={{ color: "var(--text)" }}>{d.name}</Link>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>

      <Reviews 
        pageKey="/servis-bolgeleri" 
        city="Türkiye" 
        district="Tüm İller" 
        serviceLabel="Teknik Servis" 
      />
    </section>
  );
}
