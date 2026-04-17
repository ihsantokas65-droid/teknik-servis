import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { HeroVisual } from "@/components/HeroVisual";
import { LazyReviews as Reviews } from "@/components/LazyReviews";
import { getDistrictCoordinates } from "@/lib/coords";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, geoMeta, localBusinessJsonLdForArea } from "@/lib/seo";
import { buildDistrictLandingContent, buildLocalServicePageContent } from "@/lib/content";
import { getCity } from "@/lib/geo";
import { LocalDiscountBanner } from "@/components/LocalDiscountBanner";
import { services, serviceKindFromSlug } from "@/lib/services";
import type { Metadata } from "next";
import { getReviewsForKey } from "@/lib/reviews.server";
import { createRng, pickOne } from "@/lib/variation";
import { DynamicQa } from "@/components/DynamicQa";
import { FaqList } from "@/components/FaqList";
import { faqPageJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { city: string; district: string } }) {
  const city = getCity(params.city);
  if (!city) return {};

  const serviceKind = serviceKindFromSlug(params.district);
  const district = city.districts.find((d) => d.slug === params.district);

  if (serviceKind) {
    const content = buildLocalServicePageContent({ city, serviceKind, district: null });
    return buildMetadata({
      title: content.title,
      description: content.description,
      path: `/${city.slug}/${params.district}`
    });
  }

  if (district) {
    const coords = getDistrictCoordinates(city.slug, district.slug);
    const heroUrl = absoluteUrl(
      `/api/hero?city=${encodeURIComponent(city.name)}&district=${encodeURIComponent(district.name)}`
    );
    const landing = buildDistrictLandingContent(city, district);

    const base = buildMetadata({
      title: landing.title,
      description: landing.description,
      path: `/${city.slug}/${district.slug}`
    });

    return {
      ...base,
      other: {
        ...(base.other ?? {}),
        ...geoMeta(coords, `${city.name} ${district.name}`)
      },
      openGraph: {
        ...base.openGraph,
        images: [{ url: heroUrl, width: 1200, height: 630, alt: `${city.name} ${district.name} teknik servis` }]
      },
      twitter: {
        ...base.twitter,
        images: [heroUrl]
      }
    } satisfies Metadata;
  }

  return {};
}

export default async function Page({ params }: { params: { city: string; district: string } }) {
  const city = getCity(params.city);
  if (!city) notFound();

  const serviceKind = serviceKindFromSlug(params.district);
  const district = city.districts.find((d) => d.slug === params.district);

  // CASE 1: City-Wide Service Page (e.g. /van/kombi-servisi)
  if (serviceKind) {
    const content = buildLocalServicePageContent({ city, serviceKind, district: null });
    const label = services.find((s) => s.kind === serviceKind)?.label ?? params.district;
    
    const crumbs = [
      { href: "/", label: "Ana Sayfa" },
      { href: "/servis-bolgelerimiz", label: "Servis Bölgeleri" },
      { href: `/${city.slug}`, label: city.name },
      { href: `/${city.slug}/${params.district}`, label }
    ];

    const pageKey = `/${city.slug}/${params.district}`;
    const reviews = await getReviewsForKey(pageKey);
    const rng = createRng(pageKey);

    const districtsTitle = pickOne(rng, [
      `${city.name} İçin Hizmet Verdiğimiz İlçeler`,
      `${city.name} Genelinde Teknik Servis Ağımız`,
      `${city.name} Bölgesi Hizmet Lokasyonları`
    ]);

    return (
      <section className="section">
        <Container>
          <JsonLd id={`ld-breadcrumb-${city.slug}-service`} data={breadcrumbJsonLd(crumbs)} />
          <JsonLd 
            id={`ld-faq-${city.slug}-service`} 
            data={faqPageJsonLd([
              ...content.faqs,
              ...(content.faultGuide?.map(f => ({ 
                q: `${label} ${f.code} hatası nedir?`, 
                a: `${f.meaning}. Çözüm: ${f.solution}` 
              })) ?? [])
            ])} 
          />
          <Breadcrumbs items={crumbs} />
          <LocalDiscountBanner city={city.name} district="" />

          <div className="card hero" style={{ padding: 22 }}>
            <div className="grid" style={{ alignItems: "center" }}>
              <div style={{ gridColumn: "span 7" }}>
                <div className="badge">{city.name} Genelinde</div>
                <h1 className="h1" style={{ marginTop: 12, fontSize: 36 }}>{content.h1}</h1>
                <p className="muted" style={{ marginTop: 10, maxWidth: 900 }}>{content.intro}</p>
                <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
                  {content.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
              <div style={{ gridColumn: "span 5" }}>
                <HeroVisual city={city.name} district="" serviceLabel={label} serviceKind={serviceKind} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16, marginTop: 16 }}>
            <h2 className="h2" style={{ fontSize: 22 }}>{districtsTitle}</h2>
            <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              Aşağıdan ilçenizi seçerek bölgenize özel detaylı servis sayfasına ulaşabilirsiniz.
            </div>
          </div>

          <div className="grid" style={{ marginTop: 16 }}>
            {city.districts.slice(0, 12).map((d) => (
              <Link key={d.slug} href={`/${city.slug}/${d.slug}/${params.district}`} className="card" style={{ gridColumn: "span 3", padding: 16, textAlign: "center" }}>
                <div style={{ fontWeight: 900 }}>{d.name}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{label}</div>
              </Link>
            ))}
          </div>

          {content.faultGuide && content.faultGuide.length > 0 && (
            <div className="card" style={{ marginTop: 16, backgroundColor: "#fdfdfd" }}>
              <h2 className="h2" style={{ fontSize: 22, color: "#000" }}>🔧 Teknik Arıza Rehberi</h2>
              <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
                {label} uzmanlarımız tarafından derlenen, en sık karşılaşılan hata kodları ve kullanıcı çözümleri.
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
          )}

          <section style={{ marginTop: 60, marginBottom: 60 }}>
             <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 className="h2" style={{ fontWeight: 900 }}>Sıkça Sorulan Sorular</h2>
              <p className="muted" style={{ fontSize: 16 }}>{city.name} {label} süreçlerimiz hakkında merak edilenler.</p>
            </div>
            <FaqList items={content.faqs} />
          </section>
        </Container>

        <DynamicQa city={city.name} district="" serviceLabel={label} />
        <Reviews pageKey={pageKey} city={city.name} district="" serviceLabel={label} />
      </section>
    );
  }

  // CASE 2: District Landing Page (e.g. /van/tusba)
  if (district) {
    const landing = buildDistrictLandingContent(city, district);
    const crumbs = [
      { href: "/", label: "Ana Sayfa" },
      { href: "/servis-bolgelerimiz", label: "Servis Bölgeleri" },
      { href: `/${city.slug}`, label: city.name },
      { href: `/${city.slug}/${district.slug}`, label: district.name }
    ];

    const coords = getDistrictCoordinates(city.slug, district.slug);
    const pageKey = `/${city.slug}/${district.slug}`;
    const reviews = await getReviewsForKey(pageKey);
    const rng = createRng(pageKey);

    const servicesTitle = pickOne(rng, [
      `${district.name} İçin Hizmet Seçin`,
      `${district.name} Teknik Servis Hizmetleri`,
      `${district.name} Bölgesi – Servis Kategorileri`
    ]);
    const servicesIntro = pickOne(rng, [
      "Hizmet türünü seçerek ilgili sayfaya gidin. İçerik blokları hizmete göre farklılaşır.",
      "Kombi/klima/beyaz eşya için sayfayı seçin. Bölgeye göre dinamik başlık ve SSS görürsünüz.",
      "Aşağıdaki kategorilerden birini seçin; randevu ve süreç bilgilerine ulaşın."
    ]);
    const cardSuffix = pickOne(rng, [
      "Hızlı servis kaydı →",
      "Randevu oluştur →",
      "Bölgeye özel sayfa →"
    ]);

    return (
      <section className="section">
        <Container>
          <JsonLd id={`ld-breadcrumb-${city.slug}-${district.slug}`} data={breadcrumbJsonLd(crumbs)} />
          <JsonLd
            id={`ld-localbusiness-${city.slug}-${district.slug}`}
            data={localBusinessJsonLdForArea({
              pageName: `${district.name} Teknik Servis`,
              pageUrlPath: `/${city.slug}/${district.slug}`,
              areaName: `${city.name} ${district.name}`,
              coords,
              reviews,
              types: ["LocalBusiness", "HomeAndConstructionBusiness"],
              serviceTypes: services.map((s) => `${district.name} ${s.label}`),
              address: {
                addressLocality: district.name,
                addressRegion: city.name,
                addressCountry: "TR"
              },
              areaServed: [city.name, district.name, ...city.districts.slice(0, 5).map((d) => d.name)]
            })}
          />
          <JsonLd id={`ld-faq-${city.slug}-${district.slug}`} data={faqPageJsonLd(landing.faqs)} />
          <Breadcrumbs items={crumbs} />
          <LocalDiscountBanner city={city.name} district={district.name} />

          <div className="card hero" style={{ padding: 22 }}>
            <div className="grid" style={{ alignItems: "center" }}>
              <div style={{ gridColumn: "span 7" }}>
                <div className="badge">{city.name} • {district.name}</div>
                <h1 className="h1" style={{ marginTop: 12, fontSize: 36 }}>
                  {landing.h1}
                </h1>
                <p className="muted" style={{ marginTop: 10, maxWidth: 900 }}>
                  {landing.intro}
                </p>
                <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
                  {landing.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
              <div style={{ gridColumn: "span 5" }}>
                <HeroVisual city={city.name} district={district.name} serviceKind={null} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16, marginTop: 16 }}>
            <h2 className="h2" style={{ fontSize: 22 }}>
              {servicesTitle}
            </h2>
            <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              {servicesIntro}
            </div>
          </div>

          <div className="grid" style={{ marginTop: 16 }}>
            {services.map((s) => (
              <Link key={s.slug} href={`/${city.slug}/${district.slug}/${s.slug}`} className="card" style={{ gridColumn: "span 4", padding: 16 }}>
                <div style={{ fontWeight: 900 }}>{s.label}</div>
                <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
                  {district.name} {s.label}
                </div>
                <div className="muted" style={{ marginTop: 10, fontWeight: 800 }}>
                  {cardSuffix}
                </div>
              </Link>
            ))}
          </div>

          {/* FAQ - SEO RANKING BOOSTER */}
          <section style={{ marginTop: 60, marginBottom: 60 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 className="h2" style={{ fontWeight: 900 }}>Sıkça Sorulan Sorular</h2>
              <p className="muted" style={{ fontSize: 16 }}>{district.name} teknik servis süreçlerimiz hakkında merak edilenler.</p>
            </div>
            <FaqList items={landing.faqs} />
          </section>
        </Container>

        <DynamicQa city={city.name} district={district.name} serviceLabel="Teknik Servis" />

        <Reviews 
          pageKey={pageKey}  
          city={city.name} 
          district={district.name} 
          serviceLabel="Teknik Servis" 
        />
      </section>
    );
  }

  notFound();
}
