import Link from "next/link";
import { Container } from "@/components/Container";
import { getCities } from "@/lib/geo";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Site Haritası",
  description: "Servis bölgelerimiz ve hizmetlerimizin hiyerarşik listesi.",
  path: "/sitemap"
});

export default function Page() {
  const cities = getCities();

  return (
    <section className="section" style={{ background: "white" }}>
      <Container>
        <h1 className="h1" style={{ fontSize: 42, marginBottom: 12 }}>Site Haritası</h1>
        <p className="muted" style={{ marginBottom: 40, maxWidth: 800 }}>
          Tüm Türkiye genelindeki servis ağımıza aşağıdaki bağlantılardan ulaşabilir, 
          il ve ilçe bazlı teknik servis taleplerinizi oluşturabilirsiniz.
        </p>

        <div 
          className="grid" 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "16px" 
          }}
        >
          {cities.map((city) => (
            <div key={city.slug} className="card" style={{ padding: "16px" }}>
              <Link 
                href={`/${city.slug}`} 
                style={{ fontWeight: 900, fontSize: 16, color: "var(--brand-900)" }}
              >
                {city.name} Servis
              </Link>
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
                {city.districts.length} İlçe • 3+ Hizmet
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 60, borderTop: "1px solid var(--border)", paddingTop: 40 }}>
          <h2 className="h2" style={{ fontSize: 24, marginBottom: 20 }}>Statik Sayfalar</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <Link href="/" className="muted">Ana Sayfa</Link>
            <Link href="/hakkimizda" className="muted">Hakkımızda</Link>
            <Link href="/iletisim" className="muted">İletişim</Link>
            <Link href="/hizmetler" className="muted">Tüm Hizmetler</Link>
            <Link href="/markalar" className="muted">Markalar</Link>
            <Link href="/servis-bolgeleri" className="muted">Servis Bölgeleri</Link>
            <Link href="/blog" className="muted">Teknik Blog</Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
