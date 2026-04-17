import type { Metadata } from "next";
import { site } from "@/lib/site";
import type { Coordinates } from "@/lib/coords";
import type { Review } from "@/lib/reviews.shared";
import { clampReviewsForSchema, computeAggregate } from "@/lib/reviews.shared";

export function absoluteUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${site.url}${path}`;
}

export function buildMetadata(input?: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const pageTitle = input?.title ?? site.name;
  const shareTitle = input?.title ? `${input.title} | ${site.name}` : site.name;
  const description = input?.description ?? site.description;
  const url = absoluteUrl(input?.path ?? "/");

  return {
    metadataBase: new URL(site.url),
    title: shareTitle,
    description,
    alternates: { 
      canonical: url,
      languages: {
        "tr-TR": url
      }
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    openGraph: {
      type: "website",
      locale: site.locale,
      url,
      title: shareTitle,
      description,
      siteName: site.name
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description
    }
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: site.address.city
    }
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    alternateName: [site.businessName, "Servis Uzmanı", "ServisUzmanı.tr"],
    url: site.url
  };
}

export function faqPageJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };
}

export function breadcrumbJsonLd(items: Array<{ href: string; label: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((x, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: x.label,
      item: absoluteUrl(x.href)
    }))
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.businessName,
    url: site.url,
    logo: absoluteUrl("/favicon.svg"),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.phone,
      contactType: "customer service",
      availableLanguage: "Turkish"
    },
    knowsAbout: ["Teknik Servis", "Beyaz Eşya Onarımı", "Klima Bakımı", "Kombi Tamiri"],
    hasCredential: [{
      "@type": "EducationalOccupationalCredential",
      "name": "Mesleki Yeterlilik Belgesi",
      "credentialCategory": "Technical Professional"
    }]
  };
}

export function contactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "İletişim",
    description: "Servis kaydı ve destek için iletişim kanallarımız.",
    url: absoluteUrl("/iletisim")
  };
}

export function aboutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Hakkımızda",
    description: "Markamız, hizmet anlayışımız ve servis süreçlerimiz hakkında bilgiler.",
    url: absoluteUrl("/hakkimizda")
  };
}

export function geoMeta(coords: Coordinates | null, placeName: string): Record<string, string> {
  if (!coords) return {};

  const pos = `${coords.lat};${coords.lon}`;
  const icbm = `${coords.lat}, ${coords.lon}`;

  return {
    "geo.region": "TR",
    "geo.placename": placeName,
    "geo.position": pos,
    "ICBM": icbm,
    "DC.title": placeName,
    "geo.country": "tr"
  };
}

export function localBusinessJsonLdForArea(input: {
  pageName: string;
  pageUrlPath: string;
  areaName: string;
  coords: Coordinates | null;
  serviceName?: string;
  serviceTypes?: string[];
  types?: string | string[];
  omitAddress?: boolean;
  reviews?: Review[];
  areaServed?: string[];
  address?: Partial<{
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  }>;
}) {
  const ratingFromSite = site.aggregateRating;
  const ratingFromReviews = input.reviews ? computeAggregate(input.reviews) : null;
  const rating = ratingFromReviews ?? ratingFromSite ?? null;
  const reviews = input.reviews ? clampReviewsForSchema(input.reviews) : null;

  const address = input.omitAddress
    ? null
    : {
        streetAddress: input.address?.streetAddress ?? site.address.street,
        addressLocality: input.address?.addressLocality ?? site.address.city,
        addressRegion: input.address?.addressRegion ?? site.address.region,
        postalCode: input.address?.postalCode ?? site.address.postalCode,
        addressCountry: input.address?.addressCountry ?? site.address.country
      };

  // SEO GEO-Integrity: Only show specific street/building address for physical location (Van)
  if (address && address.streetAddress) {
    const isVan = 
      address.addressLocality?.toLocaleLowerCase("tr-TR").includes("van") || 
      address.addressRegion?.toLocaleLowerCase("tr-TR").includes("van");
    
    if (!isVan) {
      address.streetAddress = "";
    }
  }

  const hasAddress =
    !!address &&
    (Boolean(address.streetAddress) ||
      Boolean(address.addressLocality) ||
      Boolean(address.addressRegion) ||
      Boolean(address.postalCode) ||
      Boolean(address.addressCountry));

  const types = Array.isArray(input.types) ? input.types : input.types ? [input.types] : ["LocalBusiness"];
  const offered = [
    ...(input.serviceName ? [input.serviceName] : []),
    ...(input.serviceTypes ?? [])
  ]
    .map((x) => x.trim())
    .filter(Boolean);
  const offeredUnique = [...new Set(offered)];

  return {
    "@context": "https://schema.org",
    "@type": types.length === 1 ? types[0] : types,
    name: input.pageName,
    url: absoluteUrl(input.pageUrlPath),
    telephone: site.phone,
    email: site.email,
    priceRange: site.priceRange,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00"
      }
    ],
    knowsAbout: [
      "Teknik Servis ve Onarım",
      "MYK Belgeli Müdahale", 
      "Garantili Yedek Parça Değişimi",
      input.serviceName || "Yetkili Teknik Servis Hizmeleri"
    ],
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        "name": "MYK Mesleki Yeterlilik Belgesi",
        "credentialCategory": "Technical Certification"
      }
    ],
    ...(hasAddress && address
      ? {
          address: {
            "@type": "PostalAddress",
            ...(address.streetAddress ? { streetAddress: address.streetAddress } : {}),
            ...(address.addressLocality ? { addressLocality: address.addressLocality } : {}),
            ...(address.addressRegion ? { addressRegion: address.addressRegion } : {}),
            ...(address.postalCode ? { postalCode: address.postalCode } : {}),
            ...(address.addressCountry ? { addressCountry: address.addressCountry } : {})
          }
        }
      : {}),
    areaServed: input.areaServed?.length
      ? input.areaServed.map((name) => ({ "@type": "AdministrativeArea", name }))
      : {
          "@type": "AdministrativeArea",
          name: input.areaName
        },
    ...(input.coords
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: input.coords.lat,
            longitude: input.coords.lon
          }
        }
      : {}),
    ...(input.serviceName
      ? {
          knowsAbout: [input.serviceName]
        }
      : {}),
    ...(offeredUnique.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Teknik Servis Hizmetleri",
            itemListElement: offeredUnique.map((name, idx) => ({
              "@type": "Offer",
              position: idx + 1,
              itemOffered: {
                "@type": "Service",
                name,
                provider: {
                  "@type": "LocalBusiness",
                  name: site.businessName,
                  telephone: site.phone
                }
              },
              priceCurrency: "TRY"
            }))
          }
        }
      : {}),
    ...(rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.ratingValue,
            reviewCount: rating.reviewCount
          }
        }
      : {})
    ,
    ...(reviews && reviews.length
      ? {
          review: reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            datePublished: r.createdAt,
            reviewBody: r.comment,
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 }
          }))
        }
      : {})
  };
}
