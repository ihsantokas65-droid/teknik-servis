import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { HeroVisual } from "@/components/HeroVisual";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { buildMetadata, absoluteUrl, breadcrumbJsonLd, localBusinessJsonLdForArea, faqPageJsonLd } from "@/lib/seo";
import { getBrand } from "@/lib/brands";
import { buildLocalServicePageContent } from "@/lib/content";
import { getCities } from "@/lib/geo";
import { serviceKindFromSlug, services } from "@/lib/services";
import type { Metadata } from "next";
import { getReviewsForKey } from "@/lib/reviews.server";
import { site } from "@/lib/site";
import { createRng, pickOne } from "@/lib/variation";

export async function generateMetadata({ params }: { params: { brand: string; service: string } }) {
  const brand = getBrand(params.brand);
  const kind = serviceKindFromSlug(params.service);
  if (!brand || !kind || !brand.supportedServices.includes(kind)) return {};

  const label = services.find((s) => s.kind === kind)?.label ?? params.service;
  const heroUrl = absoluteUrl(
    `/api/hero?brand=${encodeURIComponent(brand.name)}&service=${encodeURIComponent(params.service)}`
  );
  const base = buildMetadata({
    title: `${brand.name} ${label} | Garantili Bakım & Onarım | ${site.businessName}`,
    description: `${brand.name} için ${label} desteği. 81 il ve ilçe bazlı yönlendirme, süreç adımları ve SSS. Hemen arayın!`,
    path: `/marka/${brand.slug}/${params.service}`
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [{ url: heroUrl, width: 1200, height: 630, alt: `${brand.name} ${label}` }]
    },
    twitter: {
      ...base.twitter,
      images: [heroUrl]
    }
  } satisfies Metadata;
}

export default async function Page({ params }: { params: { brand: string; service: string } }) {
  const brand = getBrand(params.brand);
  const kind = serviceKindFromSlug(params.service);
  if (!brand || !kind || !brand.supportedServices.includes(kind)) notFound();

  const label = services.find((s) => s.kind === kind)?.label ?? params.service;
  const content = buildLocalServicePageContent({
    // marka sayfası için "area" gibi davranması adına ilk şehir/ilçe placeholder'ı kullanmıyoruz;
    // ama içerik varyasyonu için city/district alanlarını sahtelemiyoruz: bunun yerine brand paramı kullanılıyor.
    city: { slug: "turkiye", name: "Türkiye", districts: [] },
    district: { slug: "genel", name: "Genel" },
    serviceKind: kind,
    brand
  });

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/markalar", label: "Markalar" },
    { href: `/marka/${brand.slug}`, label: brand.name },
    { href: `/marka/${brand.slug}/${params.service}`, label }
  ];

  const cityLinks = getCities().slice(0, 24);
  const pageKey = `/marka/${brand.slug}/${params.service}`;
  const reviews = await getReviewsForKey(pageKey, {
    city: "Türkiye",
    district: "Genel",
    brand: brand.name,
    serviceLabel: label
  });
  const rng = createRng(pageKey);

  const faqTitle = pickOne(rng, [
    `${brand.name} ${label} – SSS`,
    `${brand.name} ${label} Hakkında Sık Sorulan Sorular`,
    `${label} için ${brand.name} SSS`
  ]);
  const citiesTitle = pickOne(rng, [
    "Şehir Seçin (Bölgeye Özel)",
    "Bölgenize Göre Sayfaya Gidin",
    "İl Seçimi"
  ]);

  return (
    <section className="section">
      <Container>
        <JsonLd id={`ld-breadcrumb-brand-${brand.slug}-${params.service}`} data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          id={`ld-localbusiness-brand-${brand.slug}-${params.service}`}
          data={localBusinessJsonLdForArea({
            pageName: `${brand.name} ${label}`,
            pageUrlPath: `/marka/${brand.slug}/${params.service}`,
            areaName: "Türkiye",
            coords: null,
            serviceName: `${brand.name} ${label}`,
            reviews,
            types: kind === "beyaz-esya" ? ["LocalBusiness", "ApplianceRepairService"] : ["LocalBusiness", "HVACBusiness"],
            omitAddress: true,
            areaServed: ["Türkiye", "81 il"]
          })}
        />
        <JsonLd id={`ld-faq-brand-${brand.slug}-${params.service}`} data={faqPageJsonLd(content.faqs)} />
        <Breadcrumbs items={crumbs} />

        <div className="card" style={{ padding: 22 }}>
          <div className="badge">{brand.name} • {label} • 81 il</div>
          <h1 className="h1" style={{ marginTop: 12, fontSize: 36 }}>
            {brand.name} {label}
          </h1>
          <p className="muted" style={{ marginTop: 10, maxWidth: 900 }}>
            {content.intro.replace("Türkiye Genel", "Türkiye genelinde")}
          </p>
          <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
            {content.highlights.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 16 }}>
          <HeroVisual city="Türkiye" brand={brand.name} serviceLabel={label} serviceKind={kind} />
        </div>

        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <div style={{ fontWeight: 900 }}>{citiesTitle}</div>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
            Bölgenize özel sayfaya gitmek için şehir seçin.
          </div>
          <div className="grid" style={{ marginTop: 12 }}>
            {cityLinks.map((c) => (
              <Link key={c.slug} href={`/${c.slug}/${c.districts[0]?.slug ?? "merkez"}/${params.service}`} className="card" style={{ gridColumn: "span 3", padding: 12 }}>
                <div style={{ fontWeight: 900 }}>{c.name}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <h2 className="h2" style={{ marginTop: 26 }}>
          {faqTitle}
        </h2>
        <FaqList items={content.faqs} />
      </Container>

      <Reviews 
        pageKey={pageKey} 
        brand={brand.name} 
        serviceLabel={label} 
      />
    </section>
  );
}
