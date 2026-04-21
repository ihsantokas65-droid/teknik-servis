import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { errorCodes } from "@/lib/errorCodes";
import { buildMetadata, breadcrumbJsonLd, localBusinessJsonLdForArea } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Wrench, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { getRelatedBlogsForContext } from "@/lib/blog";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: 'Arıza Kodları | Hata Kodları ve Çözüm Rehberleri',
  description: 'Yetkili Kombi Servisi markası, kombi, klima ve beyaz eşya için bağımsız özel servis hizmeti sağlıyor; arıza kodlarının anlamları, olası nedenleri ve çözüm önerileri.',
  path: '/ariza-kodlari',
  keywords: ['arıza kodları', 'hata kodları', 'kombi hata kodu', 'klima arıza kodu'],
  geo: {
    lat: site.coordinates.lat,
    lon: site.coordinates.lon,
    placeName: "Van"
  }
});

export default function ErrorCodesIndex() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/ariza-kodlari", label: "Arıza Kodları" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="ld-breadcrumb-ariza" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id="ld-localbusiness-ariza"
          data={localBusinessJsonLdForArea({
            pageName: "Arıza Kodları",
            pageUrlPath: "/ariza-kodlari",
            areaName: "Türkiye",
            coords: site.coordinates,
            serviceName: "Teknik rehber",
            omitAddress: false
          })}
        />
        <Breadcrumbs items={crumbs} />
        
        <div className="card" style={{ padding: 32, marginBottom: 32, textAlign: "center", background: "white" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--brand-soft)", color: "var(--brand-900)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wrench size={32} />
          </div>
          <h1 className="h1" style={{ fontSize: 36, marginBottom: 12 }}>
            Arıza Kodları <span style={{ color: "var(--brand)" }}>Bilgi Bankası</span>
          </h1>
          <p className="muted" style={{ maxWidth: 640, margin: "0 auto", fontSize: 16 }}>
            Kombi, klima ve beyaz eşyanızın ekranında beliren hata kodunun ne anlama geldiğini bulun. Hangi sorunları evde çözebileceğinizi, hangileri için mutlaka usta çağırmanız gerektiğini öğrenin.
          </p>
        </div>

        <div className="grid">
          {errorCodes.map(err => (
            <Link key={err.slug} href={`/ariza-kodlari/${err.slug}`} className="card hover focus-ring" style={{ gridColumn: "span 4", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div className="badge">{err.brandName}</div>
                {err.isFatal && <AlertTriangle size={18} color="var(--brand)" />}
              </div>
              <h2 className="h3" style={{ fontSize: 18, marginBottom: 8, color: "var(--brand-900)" }}>
                {err.code} Hatası
              </h2>
              <p className="muted" style={{ fontSize: 14, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {err.title}
              </p>
              <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                Kodu İncele →
              </div>
            </Link>
          ))}
        </div>
      </Container>
      <Footer relatedBlogs={getRelatedBlogsForContext({ limit: 4 })} />
    </section>
  );
}
