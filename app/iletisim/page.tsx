import Link from "next/link";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, localBusinessJsonLdForArea, contactPageJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Footer } from "@/components/Footer";
import { getRelatedBlogsForContext } from "@/lib/blog";


export const metadata = buildMetadata({
  title: 'İletişim | Servis Kaydı ve Hızlı Destek',
  description: 'Yetkili Kombi Servisi markası, servis kaydı, randevu ve hızlı destek için bağımsız özel servis hizmeti sağlıyor. Telefon, WhatsApp ve e-posta iletişim bilgilerimiz.',
  path: '/iletisim',
  keywords: ['iletişim', 'servis kaydı', 'randevu', 'telefon', 'whatsapp'],
  geo: {
    lat: site.coordinates.lat,
    lon: site.coordinates.lon,
    placeName: "Van"
  }
});

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/iletisim", label: "İletişim" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="ld-breadcrumb-iletisim" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd id="ld-contact" data={contactPageJsonLd()} />
        <JsonLd
          id="ld-localbusiness-iletisim"
          data={localBusinessJsonLdForArea({
            pageName: "İletişim",
            pageUrlPath: "/iletisim",
            areaName: "Türkiye",
            coords: site.coordinates,
            serviceName: "Teknik servis iletişim",
            omitAddress: false
          })}
        />

        <h1 className="h1" style={{ fontSize: 36 }}>
          İletişim
        </h1>
        <p className="muted" style={{ maxWidth: 820 }}>
          Servis kaydı için arızanın belirtisini ve cihaz modelini paylaşmanız yeterli. Bölge sayfaları üzerinden
          bulunduğunuz şehir/ilçeyi seçip ilgili hizmet sayfasına da gidebilirsiniz.
        </p>

        <div className="grid" style={{ marginTop: 16 }}>
          <div className="card" style={{ gridColumn: "span 7", padding: 16 }}>
            <h2 className="h2" style={{ fontSize: 20, fontWeight: 900 }}>
              Hızlı İletişim
            </h2>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <InfoRow label="Telefon" value={site.phone} />
              <InfoRow label="WhatsApp" value={site.whatsapp} />
              <InfoRow label="E-posta" value={site.email} />
              <InfoRow label="Çalışma saatleri" value={site.workingHours} />
              <InfoRow label="Merkez Adres" value={`${site.address.street} ${site.address.city}/${site.address.region}`} />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
              <Link className="btn" href={`tel:${site.phone.replace(/\s+/g, "")}`}>
                Hemen Ara
              </Link>
              <Link
                className="btn secondary"
                href={`https://wa.me/${site.whatsapp.replace(/[^\d+]/g, "").replace("+", "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </Link>
              <Link className="btn secondary" href={`mailto:${site.email}`}>
                E-posta Gönder
              </Link>
            </div>
          </div>

          <div className="card" style={{ gridColumn: "span 5", padding: 16 }}>
            <h2 className="h2" style={{ fontSize: 20, fontWeight: 900 }}>
              Merkez Ofis Konumu
            </h2>
            <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3122.3988788506485!2d43.375358175770515!3d38.501510571811124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4012707200502a49%3A0x1da89ecc636aa36e!2sAlipa%C5%9Fa%2C%20Suvaro%C4%9Flu%20Cd%20No%3A6%2C%2065130%20Van%20Merkez%2FVan!5e0!3m2!1str!2str!4v1776280064609!5m2!1str!2str" 
                width="100%" 
                height="300" 
                style={{ border: 0 }} 
                allowFullScreen={true}
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <RelatedLinks
          title="İletişim Sayfasını Ana Servis Sayfalarıyla Bağlayın"
          intro="İletişim sayfası, kullanıcıyı doğru hizmete ve doğru bölgeye yönlendiren ana kapılardan biri olmalı."
          links={[
            { href: "/servis-bolgeleri", label: "Servis Bölgeleri", description: "Şehir ve ilçe sayfalarından servis kaydı başlatın." },
            { href: "/hizmetler", label: "Hizmetler", description: "Kombi, klima ve beyaz eşya kategorilerine gidin." },
            { href: "/markalar", label: "Markalar", description: "Marka bazlı servis sayfalarına geçiş yapın." },
            { href: "/servis-ucretleri", label: "Servis Ücretleri", description: "Fiyat bilgisi alan kullanıcıları bu sayfaya yönlendirin." },
            { href: "/blog", label: "Blog", description: "Sorun hakkında önce rehber okumak isteyenler için." },
            { href: "/ariza-kodlari", label: "Arıza Kodları", description: "Hata kodu arayan kullanıcıları bilgi sayfasına taşıyın." }
          ]}
        />
      </Container>
      <Footer relatedBlogs={getRelatedBlogsForContext({ limit: 4 })} />
    </section>

  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="card"
      style={{
        background: "rgba(255,255,255,.04)",
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        gap: 12
      }}
    >
      <div className="muted" style={{ fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,.04)", padding: 12 }}>
      <div style={{ fontWeight: 900 }}>{q}</div>
      <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
        {a}
      </div>
    </div>
  );
}
