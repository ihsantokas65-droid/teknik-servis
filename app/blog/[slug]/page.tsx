import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { BlogCover } from "@/components/BlogCover";
import { ShareBar } from "@/components/ShareBar";
import { TableOfContents } from "@/components/TableOfContents";
import { ExpertNote } from "@/components/ExpertNote";
import { PeopleAlsoAsk } from "@/components/PeopleAlsoAsk";
import { buildBlogArticle, getPopularServiceRegions, categoryMeta } from "@/lib/blog";
import { buildMetadata, absoluteUrl, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo";

function anchorId(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = buildBlogArticle(params.slug);
  if (!article) return {};

  const img = absoluteUrl(`/api/blog-image?slug=${encodeURIComponent(article.slug)}`);
    const base = buildMetadata({
    title: `${article.title} | Teknik Servis Blogu`,
    description: article.description,
    path: `/blog/${article.slug}`,
    keywords: article.keywords
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [{ url: img, width: 1200, height: 630, alt: article.title }]
    },
    twitter: {
      ...base.twitter,
      images: [img]
    }
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const article = buildBlogArticle(params.slug);
  if (!article) notFound();

  const url = absoluteUrl(`/blog/${article.slug}`);
  const imageUrl = `/api/blog-image?slug=${encodeURIComponent(article.slug)}`;
  const tocItems = article.sections.map((s) => ({ id: anchorId(s.h2), label: s.h2 }));

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/blog", label: "Blog" },
    { href: `/blog/${article.slug}`, label: article.title }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id={`ld-breadcrumb-blog-${article.slug}`} data={breadcrumbJsonLd(crumbs)} />
        <JsonLd id={`ld-blogposting-${article.slug}`} data={article.jsonLd} />
        {article.faqs.length > 0 && (
          <JsonLd id={`ld-faq-blog-${article.slug}`} data={faqPageJsonLd(article.faqs)} />
        )}
        <Breadcrumbs items={crumbs} />

        <div className="card hero" style={{ padding: 22 }}>
          <div className="articleGrid">
            <div className="articleMain">
              <div className="badge">Blog • {article.category}</div>
              <h1 className="h1" style={{ marginTop: 12, fontSize: 36 }}>
                {article.h1}
              </h1>
              <p className="muted" style={{ marginTop: 10, maxWidth: 920 }}>
                {article.description}
              </p>

              <div className="muted" style={{ marginTop: 12, fontSize: 13, display: "flex", gap: 12, flexWrap: "wrap", fontWeight: 800 }}>
                <span>Okuma süresi: {article.readingMinutes} dk</span>
                <span aria-hidden>•</span>
                <span>{article.wordCount} kelime</span>
              </div>
            </div>

            <div className="articleSide" style={{ position: "static" }}>
              <Image
                src={imageUrl}
                alt={`${article.title} – ${article.category.replaceAll("-", " ")} rehberi ve çözüm önerileri`}
                width={1200}
                height={630}
                priority
                unoptimized
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 18,
                  border: "1px solid var(--border)"
                }}
              />
              <div style={{ marginTop: 10 }}>
                <BlogCover title={article.title} subtitle="Rehber" />
              </div>
            </div>
          </div>
        </div>

        <div className="articleGrid" style={{ marginTop: 16 }}>
          <article className="articleMain">
            <div className="card" style={{ padding: 16 }}>
              <div className="prose">
                {article.sections.map((s, index) => {
                  const id = anchorId(s.h2);
                  return (
                    <section key={s.h2} id={id} style={{ scrollMarginTop: 110 }}>
                      <h2>{s.h2}</h2>
                      {s.paragraphs.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                      {s.bullets?.length ? (
                        <ul>
                          {s.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      ) : null}
                      
                      {/* Insert natural expert note after the first section if it exists */}
                      {index === 0 && article.expertNote && (
                        <ExpertNote 
                          title={article.expertNote.title} 
                          content={article.expertNote.content} 
                        />
                      )}
                    </section>
                  );
                })}
              </div>
            </div>

            {article.peopleAlsoAsk && article.peopleAlsoAsk.length > 0 && (
              <PeopleAlsoAsk items={article.peopleAlsoAsk} />
            )}

            <div className="card" style={{ padding: 16, marginTop: 14 }}>
              <h2 className="h2" style={{ fontSize: 22 }}>
                SSS
              </h2>
              <FaqList items={article.faqs} />
            </div>

            <div className="card" style={{ padding: 16, marginTop: 14 }}>
              <h2 className="h2" style={{ fontSize: 22 }}>
                İlgili yazılar
              </h2>
              <div className="grid" style={{ marginTop: 12 }}>
                {article.relatedSlugs.map((s) => (
                  <Link key={s} href={`/blog/${s}`} className="card hover focus-ring" style={{ gridColumn: "span 4", padding: 14 }}>
                    <h3 className="h3" style={{ fontWeight: 900, fontSize: 15 }}>{s.replaceAll("-", " ")}</h3>
                    <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                      Oku →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </article>

          <aside className="articleSide">
            <div className="card" style={{ padding: 16 }}>
              <TableOfContents items={tocItems} />
            </div>
            <div className="card" style={{ padding: 16 }}>
              <ShareBar url={url} title={article.title} />
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 950 }}>Servis kaydı</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 8 }}>
                Arıza belirtisini ve cihaz bilgilerini paylaşın; en hızlı yönlendirmeyi yapalım.
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <Link className="btn focus-ring" href="/iletisim">
                  İletişim
                </Link>
                <Link className="btn secondary focus-ring" href="/servis-bolgeleri">
                  Bölge seç
                </Link>
              </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 950 }}>Hizmet Bölgeleri</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                {article.category.charAt(0).toUpperCase() + article.category.slice(1).replaceAll("-", " ")} hizmeti için en popüler bölgelerimiz:
              </div>
              <div className="chips" style={{ marginTop: 12 }}>
                {getPopularServiceRegions().map((r) => {
                  const serviceSlug = article.category === "kombi" ? "kombi-servisi"
                    : article.category === "klima" ? "klima-servisi"
                    : article.category === "beyaz-esya" ? "beyaz-esya-servisi"
                    : "kombi-servisi"; // Fallback for genel/endustriyel
                  return (
                    <Link
                      key={r.city}
                      href={`/${r.city}`}
                      className="chip focus-ring"
                      style={{ fontSize: 12 }}
                    >
                      {r.name} {article.category === "genel" ? "Teknik Servis" : categoryMeta[article.category].label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div className="muted" style={{ fontSize: 13, fontWeight: 950 }}>
                Anahtar kelimeler
              </div>
              <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                {article.keywords.join(" • ")}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
