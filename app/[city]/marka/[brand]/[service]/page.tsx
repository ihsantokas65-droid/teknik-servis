import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { HeroVisual } from "@/components/HeroVisual";
const FaqList = dynamic(() => import("@/components/FaqList").then(mod => mod.FaqList));
const Reviews = dynamic(() => import("@/components/Reviews").then(mod => mod.Reviews));
const NearbyAreas = dynamic(() => import("@/components/NearbyAreas").then(mod => mod.NearbyAreas));
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, localBusinessJsonLdForArea, faqPageJsonLd } from "@/lib/seo";
import { getBrand } from "@/lib/brands";
import { ExpertNote } from "@/components/ExpertNote";
import { EeatBadge } from "@/components/EeatBadge";
import { buildLocalServicePageContent } from "@/lib/content";
import { getArticlesForBrandAndCategory } from "@/lib/blog";
import { getCity } from "@/lib/geo";
import { LocalDiscountBanner } from "@/components/LocalDiscountBanner";
import { serviceKindFromSlug, services } from "@/lib/services";
import type { Metadata } from "next";
import { getReviewsForKey } from "@/lib/reviews.server";
import { createRng, pickOne } from "@/lib/variation";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { city: string; brand: string; service: string } }) {
  const city = getCity(params.city);
  const brand = getBrand(params.brand);
  const kind = serviceKindFromSlug(params.service);
  if (!city || !brand || !kind) return {};

  const label = services.find((s) => s.kind === kind)?.label ?? params.service;
  const heroUrl = absoluteUrl(
    `/api/hero?city=${encodeURIComponent(city.name)}&brand=${encodeURIComponent(brand.name)}&service=${encodeURIComponent(params.service)}`
  );
  const content = buildLocalServicePageContent({ city, brand, serviceKind: kind });

  const base = buildMetadata({
    title: content.title,
    description: content.description,
    path: `/${city.slug}/marka/${brand.slug}/${params.service}`
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [{ url: heroUrl, width: 1200, height: 630, alt: `${city.name} ${brand.name} ${label}` }]
    },
    twitter: {
      ...base.twitter,
      images: [heroUrl]
    }
  } satisfies Metadata;
}

export default async function Page({ params }: { params: { city: string; brand: string; service: string } }) {
  const city = getCity(params.city);
  const brand = getBrand(params.brand);
  const kind = serviceKindFromSlug(params.service);
  if (!city || !brand || !kind) notFound();

  const label = services.find((s) => s.kind === kind)?.label ?? params.service;
  const content = buildLocalServicePageContent({ city, brand, serviceKind: kind });

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-bolgeleri", label: "Servis Bölgeleri" },
    { href: `/${city.slug}`, label: city.name },
    { href: `/${city.slug}/marka/${brand.slug}/${params.service}`, label: `${brand.name} ${label}` }
  ];

  const pageKey = `/${city.slug}/marka/${brand.slug}/${params.service}`;
  const reviews = await getReviewsForKey(pageKey, {
    city: city.name,
    serviceLabel: `${brand.name} ${label}`
  });
  const rng = createRng(pageKey);
  const guideTitle = pickOne(rng, [
    `${brand.name} ${label} Icin Uzman Rehberler`,
    `${brand.name} Kullanicilari Icin Faydali Rehberler`,
    `${label} Hakkinda One Cikan Uzman Icerikler`
  ]);

  const issuesTitle = pickOne(rng, [
    `${city.name}’de Sık Görülen ${brand.name} ${label} Arızaları`,
    `${city.name} ${brand.name} ${label}: Yaygın Sorunlar`,
  ]);

  return (
    <main>
      <JsonLd id="ld-crumbs" data={breadcrumbJsonLd(crumbs)} />
      <JsonLd 
        id="ld-local" 
        data={localBusinessJsonLdForArea({ 
          pageName: content.title,
          pageUrlPath: pageKey,
          areaName: city.name,
          coords: null,
          serviceName: `${brand.name} ${label}`,
          reviews
        })} 
      />
      <JsonLd 
        id="ld-faq-local" 
        data={faqPageJsonLd([
          ...content.faqs,
          ...(content.faultGuide?.map(f => ({ 
            q: `${brand.name} ${f.code} hatası nedir?`, 
            a: `${f.meaning}. Çözüm: ${f.solution}` 
          })) ?? [])
        ])} 
      />

      <section className="section" style={{ background: "white", padding: "40px 0" }}>
        <Container>
          <Breadcrumbs items={crumbs} />
          <LocalDiscountBanner city={city.name} district="" />
          
          <div className="grid" style={{ marginTop: 24, alignItems: "center" }}>
            <div style={{ gridColumn: "span 7" }}>
              <div className="badge">{city.name} • {brand.name} • {label}</div>
              <h1 className="h1" style={{ marginTop: 12, fontSize: 36 }}>
                {content.h1}
              </h1>
              <EeatBadge />
              <p className="muted" style={{ marginTop: 10, maxWidth: 920 }}>
                {content.intro}
              </p>
              {content.details.map((p, idx) => (
                <p key={idx} className="muted" style={{ marginTop: 8, maxWidth: 920 }}>
                  {p}
                </p>
              ))}
            </div>

            <div style={{ gridColumn: "span 5" }}>
              <HeroVisual 
                city={city.name} 
                brand={brand.name}
                serviceLabel={label} 
                serviceKind={kind} 
              />
            </div>
          </div>
        </Container>
      </section>

      {content.expertNote && (
        <ExpertNote 
          title={content.expertNote.title} 
          content={content.expertNote.content} 
        />
      )}

      {content.faultGuide && content.faultGuide.length > 0 && (
        <section className="section" style={{ background: "white", paddingTop: 0 }}>
          <Container>
            <div className="card" style={{ backgroundColor: "#fdfdfd" }}>
              <h2 className="h2" style={{ fontSize: 22, color: "#000" }}>🔧 {brand.name} Teknik Arıza Rehberi</h2>
              <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
                {brand.name} uzmanlarımız tarafından derlenen, en sık karşılaşılan hata kodları ve teknik çözümler.
              </p>
              <div className="grid">
                {content.faultGuide.map((f, idx) => (
                  <div key={idx} className="card" style={{ gridColumn: "span 6", padding: 12, border: "1px solid #eee", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ backgroundColor: "#155eef", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 900, fontSize: 12 }}>{f.code}</span>
                      <strong style={{ fontSize: 15 }}>{f.meaning}</strong>
                    </div>
                    <p className="muted" style={{ fontSize: 13 }}>{f.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      <section className="section" style={{ background: "white", paddingTop: 0 }}>
        <Container>
          <div className="grid">
            <div className="card" style={{ gridColumn: "span 6", padding: 24 }}>
              <h2 className="h2" style={{ fontSize: 24 }}>{content.serviceScopeTitle}</h2>
              <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
                {content.serviceScopeBullets.map((item) => (
                  <li key={item} style={{ marginTop: 6 }}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ gridColumn: "span 6", padding: 24 }}>
              <h2 className="h2" style={{ fontSize: 24 }}>{content.differentiationTitle}</h2>
              <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
                {content.differentiationBullets.map((item) => (
                  <li key={item} style={{ marginTop: 6 }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {content.brandFocusTitle && content.brandFocusBullets?.length ? (
        <section className="section" style={{ background: "var(--bg)", paddingTop: 0 }}>
          <Container>
            <div className="card" style={{ padding: 24 }}>
              <h2 className="h2" style={{ fontSize: 24 }}>{content.brandFocusTitle}</h2>
              <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
                {content.brandFocusBullets.map((item) => (
                  <li key={item} style={{ marginTop: 6 }}>{item}</li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      ) : null}

      {/* REVIEWS & FAQ */}
      <section className="section" style={{ background: "#f8fafc" }}>
        <Container>
          <div className="grid">
            <div style={{ gridColumn: "span 7" }}>
              <h2 className="h2" style={{ marginBottom: 24 }}>Müşteri Deneyimleri</h2>
              <Reviews 
                pageKey={pageKey} 
                city={city.name} 
                serviceLabel={`${brand.name} ${label}`} 
                brand={brand.name}
              />

              <h2 className="h2" style={{ marginTop: 48, marginBottom: 24 }}>Sıkça Sorulan Sorular</h2>
              <FaqList items={content.faqs} />
            </div>
            
            <div style={{ gridColumn: "span 5" }}>
               <h2 className="h2" style={{ marginBottom: 24 }}>{issuesTitle}</h2>
               <div className="card" style={{ padding: 24 }}>
                 <ul className="muted" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                   {content.commonIssues.map((issue, idx) => (
                     <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                       <span style={{ color: "var(--brand)", fontWeight: 900 }}>•</span>
                       {issue}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section" style={{ background: "white", paddingTop: 0 }}>
        <Container>
          <h2 className="h2" style={{ marginBottom: 16 }}>{guideTitle}</h2>
          <div className="grid">
            {getArticlesForBrandAndCategory({ brandSlug: brand.slug, category: kind, limit: 3 }).map((art) => (
              <Link key={art.slug} href={`/blog/${art.slug}`} className="card hover focus-ring" style={{ gridColumn: "span 4", padding: 16 }}>
                <div className="badge" style={{ marginBottom: 8 }}>Rehber</div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{art.title}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                  {art.description}
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <NearbyAreas city={city} serviceSlug={params.service} serviceLabel={`${brand.name} ${label}`} />
    </main>
  );
}
