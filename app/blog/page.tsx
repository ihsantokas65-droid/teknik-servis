import Link from "next/link";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { getBlogIndexSlugs, getArticlesByCategory, BlogCategory } from "@/lib/blog";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Kombi, klima ve beyaz eşya kullanıcılarının sık sorduğu sorulara SEO uyumlu rehber yazılar.",
  path: "/blog"
});

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/blog", label: "Blog" }
  ];

  const categories: Array<{ id: BlogCategory; label: string }> = [
    { id: "kombi", label: "Kombi Servis Rehberi" },
    { id: "klima", label: "Klima & İklimlendirme" },
    { id: "beyaz-esya", label: "Beyaz Eşya Tamiri" },
    { id: "genel", label: "Teknik Servis & Fiyatlar" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="ld-breadcrumb-blog" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id="ld-localbusiness-blog"
          data={localBusinessJsonLdForArea({
            pageName: "Blog",
            pageUrlPath: "/blog",
            areaName: "Türkiye",
            coords: null,
            serviceName: "Teknik servis blog",
            omitAddress: true
          })}
        />

        <div className="card hero" style={{ padding: 22 }}>
          <div className="badge">Blog • Uzman Çözüm Rehberleri</div>
          <h1 className="h1" style={{ marginTop: 12, fontSize: 36 }}>
            Blog & Teknik Rehber
          </h1>
          <p className="muted" style={{ maxWidth: 920, marginTop: 10 }}>
            Kombi, klima ve beyaz eşya kullanıcılarının en sık karşılaştığı sorunlar için profesyonel çözüm önerileri. 
            Binlerce içerik arasından özenle seçilmiş teknik rehberlerimizi inceleyin.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <Link className="btn focus-ring" href="/servis-bolgeleri">
              Hizmet Bölgeleri
            </Link>
            <Link className="btn secondary focus-ring" href="/iletisim">
              Hemen Randevu Al
            </Link>
          </div>
        </div>

        {categories.map((cat) => {
          const articles = getArticlesByCategory(cat.id, 48);
          if (articles.length === 0) return null;

          return (
            <div key={cat.id} style={{ marginTop: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <h2 className="h2" style={{ fontSize: 24, margin: 0 }}>{cat.label}</h2>
                <div className="badge" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>{articles.length}+ yazı</div>
              </div>
              <div className="grid" style={{ marginTop: 16 }}>
                {articles.map((art) => (
                  <Link 
                    key={art.slug} 
                    href={`/blog/${art.slug}`} 
                    className="card hover focus-ring" 
                    style={{ gridColumn: "span 4", padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                  >
                    <div>
                      <div className="muted" style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", marginBottom: 6 }}>
                        {cat.id.replaceAll("-", " ")}
                      </div>
                      <h3 className="h3" style={{ fontWeight: 950, fontSize: 15, lineHeight: 1.4 }}>
                        {art.title.split("|")[0].trim()}
                      </h3>
                    </div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 12, display: "flex", alignItems: "center", gap: 4 }}>
                       Devamını oku <span style={{ fontSize: 16 }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </Container>
    </section>
  );
}
