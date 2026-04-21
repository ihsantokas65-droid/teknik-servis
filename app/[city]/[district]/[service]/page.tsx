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
import { RelatedLinks } from "@/components/RelatedLinks";
import { getDistrictCoordinates } from "@/lib/coords";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, geoMeta, localBusinessJsonLdForArea, faqPageJsonLd } from "@/lib/seo";
import { getBrands } from "@/lib/brands";
import { ExpertNote } from "@/components/ExpertNote";
import { EeatBadge } from "@/components/EeatBadge";
import { PeopleAlsoAsk } from "@/components/PeopleAlsoAsk";
import { DynamicQa } from "@/components/DynamicQa";
import { getArticlesByCategory } from "@/lib/blog";
import { buildLocalServicePageContent } from "@/lib/content";
import { getCity } from "@/lib/geo";
import { QuickSummary } from "@/components/QuickSummary";
import { LocalDiscountBanner } from "@/components/LocalDiscountBanner";
import { serviceKindFromSlug, services } from "@/lib/services";
import { Footer } from "@/components/Footer";
import { getRelatedBlogsForContext } from "@/lib/blog";
import { site } from "@/lib/site";
import type { Metadata } from "next";
import { getReviewsForKey } from "@/lib/reviews.server";
import { createRng, pickOne } from "@/lib/variation";

export const revalidate = 86400; // Cache for 24 hours (ISR)

export async function generateMetadata({ params }: { params: { city: string; district: string; service: string } }) {
  const city = getCity(params.city);
  const district = city?.districts.find((d) => d.slug === params.district);
  const kind = serviceKindFromSlug(params.service);
  if (!city || !district || !kind) return {};

  const label = services.find((s) => s.kind === kind)?.label ?? params.service;
  const coords = getDistrictCoordinates(city.slug, district.slug);
  const heroUrl = absoluteUrl(
    `/api/hero?city=${encodeURIComponent(city.name)}&district=${encodeURIComponent(district.name)}&service=${encodeURIComponent(params.service)}`
  );
  const content = buildLocalServicePageContent({ city, district, serviceKind: kind });

  const base = buildMetadata({
    title: `${city.name} ${district.name} ${label} Servisi | Arıza, Bakım ve Onarım`,
    description: `${city.name} ${district.name} bölgesinde ${label.toLowerCase()} için arıza tespiti, bakım and onarım desteği. Şeffaf süreç, hızlı kayıt and yerinde müdahale.`,
    path: `/${city.slug}/${district.slug}/${params.service}`,
    keywords: [city.name, district.name, label, "servis", "bakım", "onarım", "arıza tespiti"]
  });

  return {
    ...base,
    other: {
      ...(base.other ?? {}),
      ...geoMeta(coords, `${city.name} ${district.name}`)
    },
    openGraph: {
      ...base.openGraph,
      images: [{ url: heroUrl, width: 1200, height: 630, alt: `${city.name} ${district.name} ${label}` }]
    },
    twitter: {
      ...base.twitter,
      images: [heroUrl]
    }
  } satisfies Metadata;
}

export default async function Page({ params }: { params: { city: string; district: string; service: string } }) {
  const city = getCity(params.city);
  const district = city?.districts.find((d) => d.slug === params.district);
  const kind = serviceKindFromSlug(params.service);
  if (!city || !district || !kind) notFound();

  const label = services.find((s) => s.kind === kind)?.label ?? params.service;
  const content = buildLocalServicePageContent({ city, district, serviceKind: kind });
  const brands = getBrands()
    .filter((b) => b.supportedServices.includes(kind))
    .slice(0, 12);

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-bolgeleri", label: "Servis Bölgeleri" },
    { href: `/${city.slug}`, label: city.name },
    { href: `/${city.slug}/${district.slug}`, label: district.name },
    { href: `/${city.slug}/${district.slug}/${params.service}`, label }
  ];

  const coords = getDistrictCoordinates(city.slug, district.slug);
  const pageKey = `/${city.slug}/${district.slug}/${params.service}`;
  const reviews = await getReviewsForKey(pageKey, {
    city: city.name,
    district: district.name,
    serviceLabel: label
  });
  const rng = createRng(pageKey);

  const issuesTitle = pickOne(rng, [
    `${district.name}’de Sık Görülen ${label} Arızaları`,
    `${district.name} ${label}: Yaygın Sorunlar ve Çözüm Yolları`,
    `${district.name} Bölgesi ${label} Arızaları ve Bakım Notları`
  ]);
  const brandsTitle = pickOne(rng, [
    `${district.name} ${label} İçin Hizmet Verdiğimiz Markalar`,
    `${district.name} Bölgesinde ${label} Markaları`,
    `${district.name} ${label}: Marka Bazlı Servis Sayfaları`
  ]);
  const semanticTitle = pickOne(rng, [
    `${district.name} ${label} İçin Semantik Terimler`,
    `${label} ile İlgili Terimler (SEO)`,
    `${district.name} ${label} Anahtar Kelimeler`
  ]);
  const faqTitle = pickOne(rng, [
    `${district.name} ${label} SSS`,
    `${label} Hakkında Sık Sorulan Sorular`,
    `${district.name} Bölgesi ${label} – SSS`
  ]);

  return (
    <article className="section">
      <Container>
        <JsonLd id={`ld-breadcrumb-${city.slug}-${district.slug}-${params.service}`} data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id={`ld-localbusiness-${city.slug}-${district.slug}-${params.service}`}
          data={localBusinessJsonLdForArea({
            pageName: content.h1,
            pageUrlPath: pageKey,
            areaName: `${city.name} ${district.name}`,
            coords,
            serviceName: label,
            reviews,
            types: kind === "beyaz-esya" ? ["LocalBusiness", "ApplianceRepairService"] : ["LocalBusiness", "HVACBusiness"],
            address: {
              addressLocality: district.name,
              addressRegion: city.name,
              addressCountry: "TR"
            },
            areaServed: [city.name, district.name]
          })}
        />
        <JsonLd id={`ld-faq-${city.slug}-${district.slug}-${params.service}`} data={faqPageJsonLd(content.faqs)} />
        <Breadcrumbs items={crumbs} />
        <LocalDiscountBanner city={city.name} district={district.name} />

        <div className="card hero" style={{ padding: 22, marginTop: 16 }}>
          <div className="grid" style={{ alignItems: "stretch" }}>
            <div style={{ gridColumn: "span 7" }}>
              <div className="badge">{city.name} • {district.name} • {label}</div>
              <h1 className="h1" style={{ marginTop: 12, fontSize: 36 }}>
                {content.h1}
              </h1>
              <EeatBadge />
              <p className="muted" style={{ marginTop: 10, maxWidth: 920 }}>
                {content.intro}
              </p>
              <p className="muted" style={{ marginTop: 8, maxWidth: 920 }}>
                {content.localProof}
              </p>
              {content.details.map((p, idx) => (
                <p key={idx} className="muted" style={{ marginTop: 8, maxWidth: 920 }}>
                  {p}
                </p>
              ))}
            </div>

            <div style={{ gridColumn: "span 5" }}>
              <HeroVisual city={city.name} district={district.name} serviceLabel={label} serviceKind={kind} />
            </div>
          </div>
        </div>

        {content.quickSummary && (
          <div style={{ marginTop: 24 }}>
            <QuickSummary 
              title={content.quickSummary.title}
              items={content.quickSummary.items}
              answer={content.quickSummary.answer}
            />
          </div>
        )}

        {/* Technical Service Expert Insight Enrichement */}
        {content.expertNote && (
          <ExpertNote 
            title={content.expertNote.title} 
            content={content.expertNote.content} 
          />
        )}

        {content.districtProfileTitle && content.districtProfileBullets?.length ? (
          <div className="card" style={{ marginTop: 16, padding: 24 }}>
            <h2 className="h2" style={{ fontSize: 24 }}>
              {content.districtProfileTitle}
            </h2>
            <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
              {content.districtProfileBullets.map((item) => (
                <li key={item} style={{ marginTop: 6 }}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid" style={{ marginTop: 16 }}>
          <div className="card" style={{ gridColumn: "span 6", padding: 24 }}>
            <h2 className="h2" style={{ fontSize: 22 }}>
              {content.serviceScopeTitle}
            </h2>
            <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
              {content.serviceScopeBullets.map((item) => (
                <li key={item} style={{ marginTop: 6 }}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ gridColumn: "span 6", padding: 24 }}>
            <h2 className="h2" style={{ fontSize: 22 }}>
              {content.differentiationTitle}
            </h2>
            <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
              {content.differentiationBullets.map((item) => (
                <li key={item} style={{ marginTop: 6 }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid" style={{ marginTop: 16 }}>
          <div className="card" style={{ gridColumn: "span 7", padding: 24 }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Yıllardır Süregelen Güvenilir Hizmet Akışı</div>
            <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              {city.name} {district.name} için {label} talebinde izlediğimiz profesyonel adımlar:
            </div>
            <div className="grid" style={{ marginTop: 16 }}>
              {content.process.map((s, idx) => (
                <div key={s.title} className="card" style={{ gridColumn: "span 6", padding: 16, border: "1px solid var(--border)", background: "#fcfcfc" }}>
                  <div className="badge">{idx + 1}</div>
                  <div style={{ marginTop: 8, fontWeight: 950 }}>{s.title}</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ gridColumn: "span 5", padding: 24 }}>
            <h2 className="h2" style={{ fontSize: 22 }}>
              {content.whyUsTitle}
            </h2>
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              {content.reasons.slice(0, 4).map((r) => (
                <div key={r.title} className="card" style={{ padding: 16, border: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 950 }}>{r.title}</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    {r.desc}
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16, marginTop: 16, border: "1px solid var(--border)", background: "var(--brand-soft)" }}>
              <div style={{ fontWeight: 950 }}>Otorite and Güven Sinyalleri</div>
              <ul className="muted" style={{ margin: "10px 0 0 18px" }}>
                {content.trustSignals.map((x) => (
                  <li key={x} style={{ fontWeight: 600 }}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <RelatedLinks
          title={`${district.name} Bölgesi İlgili Teknik Sayfalar`}
          intro="Bölgesel otoriteyi artırmak için hizmet and marka sayfaları arasında kurulan stratejik bağlantılar."
          links={[
            {
              href: `/${city.slug}/${district.slug}/kombi-servisi`,
              label: "Kombi Servisi",
              description: `${district.name} kombi bakım and onarım sayfası.`
            },
            {
              href: `/${city.slug}/${district.slug}/klima-servisi`,
              label: "Klima Servisi",
              description: `${district.name} klima teknik servis sayfası.`
            },
            {
              href: `/${city.slug}/${district.slug}/beyaz-esya-servisi`,
              label: "Beyaz Eşya Servisi",
              description: `${district.name} beyaz eşya onarım merkezi.`
            },
            {
              href: "/markalar",
              label: "Markalar",
              description: "Hizmet verdiğimiz tüm teknoloji markaları."
            },
            {
              href: "/blog",
              label: "Blog / Rehber",
              description: "Arıza çözümleri and teknik bakım yazıları."
            },
            {
              href: "/servis-bolgeleri",
              label: "Tüm Bölgeler",
              description: "Türkiye geneli şehir and ilçe servis ağı."
            }
          ]}
        />

        <div className="grid" style={{ marginTop: 16 }}>
          <div className="card" style={{ gridColumn: "span 7", padding: 24 }}>
            <h2 className="h2" style={{ fontSize: 24 }}>
              Teknik Notlar and Uzman Önerileri
            </h2>
            <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              {label} cihazlarınızın ömrünü uzatacak teknik tavsiyeler:
            </div>
            <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
               {content.technicalInsights.map((insight: any, idx: number) => (
                 <li key={idx} style={{ marginTop: 8 }}>{insight}</li>
               ))}
            </ul>

            <h2 className="h2" style={{ fontSize: 24, marginTop: 32 }}>
              {issuesTitle}
            </h2>
            <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
              {content.commonIssues.map((x) => (
                <li key={x} style={{ marginTop: 6 }}>{x}</li>
              ))}
            </ul>

            <div className="card" style={{ padding: 16, marginTop: 24, border: "1px dashed var(--brand)" }}>
              <div style={{ fontWeight: 950, color: "var(--brand-900)" }}>{semanticTitle}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
                {content.semanticKeywords.join(" • ")}
              </div>
            </div>
          </div>

          <div className="card" style={{ gridColumn: "span 5", padding: 24 }}>
            <h2 className="h2" style={{ fontSize: 22 }}>
              {brandsTitle}
            </h2>
            <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              {district.name} bölgesinde hizmet verdiğimiz markalar:
            </div>
            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/${city.slug}/${district.slug}/marka/${b.slug}/${params.service}`}
                  className="card hover focus-ring"
                  style={{ padding: 16, border: "1px solid var(--border)" }}
                >
                  <div style={{ fontWeight: 900 }}>{b.name} {label}</div>
                  <div style={{ fontSize: 12, color: "var(--brand)", fontWeight: 700, marginTop: 4 }}>
                    MARKA ÖZEL SAYFAYA GİT →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <h2 className="h2" style={{ marginTop: 60, fontWeight: 950, fontSize: 32 }}>
          {city.name} Genelindeki Diğer Hizmet Noktalarımız
        </h2>
        <div style={{ marginTop: 20 }}>
          <div className="grid">
            {city.districts.slice(0, 16).map((d) => (
              <Link 
                key={d.slug} 
                className="card hover focus-ring" 
                href={`/${city.slug}/${d.slug}/${params.service}`}
                style={{ gridColumn: "span 3", padding: 12, textAlign: "center", fontSize: 14, fontWeight: 700 }}
              >
                {d.name} {label}
              </Link>
            ))}
          </div>
        </div>

        <h2 className="h2" style={{ marginTop: 60, fontWeight: 950 }}>Uzman Teknik Rehberler</h2>
        <div className="grid" style={{ marginTop: 24 }}>
          {getArticlesByCategory(kind, 4).map((art) => (
            <Link key={art.slug} href={`/blog/${art.slug}`} className="card hover focus-ring" style={{ gridColumn: "span 6", padding: 20 }}>
              <div className="badge" style={{ marginBottom: 12 }}>Rehber / Makale</div>
              <div style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-900)" }}>{art.title}</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 8, lineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {art.description}
              </div>
            </Link>
          ))}
        </div>

        {content.peopleAlsoAsk && content.peopleAlsoAsk.length > 0 && (
          <PeopleAlsoAsk items={content.peopleAlsoAsk} />
        )}

        <h2 className="h2" style={{ marginTop: 60, fontWeight: 950 }}>
          {faqTitle}
        </h2>
        <div style={{ marginTop: 24 }}>
          <FaqList items={content.faqs} />
        </div>
      </Container>

      <NearbyAreas city={city} currentDistrict={district} serviceSlug={params.service} serviceLabel={label} />

      <DynamicQa city={city.name} district={district.name} serviceLabel={label} brandSlug={undefined} />

      <Reviews 
        pageKey={pageKey} 
        city={city.name} 
        district={district.name} 
        serviceLabel={label} 
      />

      <Footer 
        city={city} 
        district={district}
        variant="district"
        relatedBlogs={getRelatedBlogsForContext({ limit: 4 })}
      />
    </article>
  );
}
