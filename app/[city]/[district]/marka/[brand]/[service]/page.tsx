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
import { getDistrictCoordinates } from "@/lib/coords";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, geoMeta, localBusinessJsonLdForArea, faqPageJsonLd } from "@/lib/seo";
import { getBrand } from "@/lib/brands";
import { ExpertNote } from "@/components/ExpertNote";
import { EeatBadge } from "@/components/EeatBadge";
import { buildLocalServicePageContent } from "@/lib/content";
import { getArticlesForBrandAndCategory } from "@/lib/blog";
import { getCity } from "@/lib/geo";
import { serviceKindFromSlug, services } from "@/lib/services";
import type { Metadata } from "next";
import { getReviewsForKey } from "@/lib/reviews.server";
import { createRng, pickOne } from "@/lib/variation";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { city: string; district: string; brand: string; service: string } }) {
  const city = getCity(params.city);
  const district = city?.districts.find((d) => d.slug === params.district);
  const brand = getBrand(params.brand);
  const kind = serviceKindFromSlug(params.service);
  if (!city || !district || !brand || !kind) return {};

  const label = services.find((s) => s.kind === kind)?.label ?? params.service;
  const coords = getDistrictCoordinates(city.slug, district.slug);
  const heroUrl = absoluteUrl(
    `/api/hero?city=${encodeURIComponent(city.name)}&district=${encodeURIComponent(district.name)}&brand=${encodeURIComponent(brand.name)}&service=${encodeURIComponent(params.service)}`
  );
  const content = buildLocalServicePageContent({ city, district, brand, serviceKind: kind });

  const base = buildMetadata({
    title: content.title,
    description: content.description,
    path: `/${city.slug}/${district.slug}/marka/${brand.slug}/${params.service}`
  });

  return {
    ...base,
    other: {
      ...(base.other ?? {}),
      ...geoMeta(coords, `${city.name} ${district.name} ${brand.name}`)
    },
    openGraph: {
      ...base.openGraph,
      images: [{ url: heroUrl, width: 1200, height: 630, alt: `${city.name} ${district.name} ${brand.name} ${label}` }]
    },
    twitter: {
      ...base.twitter,
      images: [heroUrl]
    }
  } satisfies Metadata;
}

export default async function Page({ params }: { params: { city: string; district: string; brand: string; service: string } }) {
  const city = getCity(params.city);
  const district = city?.districts.find((d) => d.slug === params.district);
  const brand = getBrand(params.brand);
  const kind = serviceKindFromSlug(params.service);
  if (!city || !district || !brand || !kind) notFound();

  const label = services.find((s) => s.kind === kind)?.label ?? params.service;
  const content = buildLocalServicePageContent({ city, district, brand, serviceKind: kind });

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-bolgeleri", label: "Servis Bölgeleri" },
    { href: `/${city.slug}`, label: city.name },
    { href: `/${city.slug}/${district.slug}`, label: district.name },
    { href: `/${city.slug}/${district.slug}/marka/${brand.slug}/${params.service}`, label: `${brand.name} ${label}` }
  ];

  const coords = getDistrictCoordinates(city.slug, district.slug);
  const pageKey = `/${city.slug}/${district.slug}/marka/${brand.slug}/${params.service}`;
  const reviews = await getReviewsForKey(pageKey, {
    city: city.name,
    district: district.name,
    serviceLabel: `${brand.name} ${label}`
  });
  const rng = createRng(pageKey);
  const guideTitle = pickOne(rng, [
    `${brand.name} ${label} Icin Uzman Rehberler`,
    `${district.name} ${brand.name} Kullanicilari Icin Rehberler`,
    `${label} Hakkinda One Cikan Uzman Icerikler`
  ]);

  const issuesTitle = pickOne(rng, [
    `${district.name}’de Sık Görülen ${brand.name} ${label} Arızaları`,
    `${district.name} ${brand.name} ${label}: Yaygın Sorunlar`,
  ]);

  return (
    <main>
      <JsonLd id="ld-crumbs" data={breadcrumbJsonLd(crumbs)} />
      <JsonLd 
        id="ld-local" 
        data={localBusinessJsonLdForArea({ 
          pageName: content.title,
          pageUrlPath: pageKey,
          areaName: `${city.name} ${district.name}`,
          coords,
          serviceName: `${brand.name} ${label}`,
          reviews
        })} 
      />
      <JsonLd id="ld-faq-local" data={faqPageJsonLd(content.faqs)} />

      <section className="section" style={{ background: "white", padding: "40px 0" }}>
        <Container>
          <Breadcrumbs items={crumbs} />
          
          <div className="grid" style={{ marginTop: 24, alignItems: "center" }}>
            <div style={{ gridColumn: "span 7" }}>
              <div className="badge">{city.name} • {district.name} • {brand.name} • {label}</div>
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
                district={district.name} 
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

      {content.districtProfileTitle && content.districtProfileBullets?.length ? (
        <section className="section" style={{ background: "white", paddingTop: 0 }}>
          <Container>
            <div className="card" style={{ padding: 24 }}>
              <h2 className="h2" style={{ fontSize: 24 }}>{content.districtProfileTitle}</h2>
              <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
                {content.districtProfileBullets.map((item) => (
                  <li key={item} style={{ marginTop: 6 }}>{item}</li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      ) : null}

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
                district={district.name}
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

      <NearbyAreas city={city} currentDistrict={district} serviceSlug={params.service} serviceLabel={`${brand.name} ${label}`} />
    </main>
  );
}
