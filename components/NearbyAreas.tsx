import Link from "next/link";
import { Container } from "@/components/Container";
import type { City, District } from "@/lib/geo";
import { createRng, shuffle } from "@/lib/variation";

type Props = {
  city: City;
  currentDistrict?: District | null;
  serviceSlug: string;
  serviceLabel: string;
};

export function NearbyAreas({ city, currentDistrict, serviceSlug, serviceLabel }: Props) {
  const rng = createRng(`${city.slug}|${currentDistrict?.slug ?? "city"}|${serviceSlug}|${serviceLabel}`);
  // Get other districts in the same city for high-relevance internal linking
  const nearby = shuffle(
    rng,
    city.districts.filter((d) => d.slug !== currentDistrict?.slug)
  ).slice(0, 15);

  if (nearby.length === 0) return null;

  return (
    <section className="section" style={{ borderTop: "1px solid var(--border)", marginTop: 40 }}>
      <Container>
        <h2 className="h2" style={{ fontSize: 24 }}>Diğer Hizmet Bölgelerimiz</h2>
        <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
          {city.name} genelinde {serviceLabel} ihtiyacınız için size en yakın bölgeyi seçebilirsiniz:
        </p>
        
        <div className="chips" style={{ marginTop: 20 }}>
          {nearby.map((d) => (
            <Link
              key={d.slug}
              href={`/${city.slug}/${d.slug}/${serviceSlug}`}
              className="chip focus-ring"
              title={`${city.name} ${d.name} ${serviceLabel}`}
            >
              {d.name} {serviceLabel}
            </Link>
          ))}
          <Link href={`/${city.slug}`} className="chip focus-ring" style={{ background: "var(--brand-soft)", borderColor: "var(--brand)" }}>
            Tüm {city.name} Bölgeleri →
          </Link>
        </div>
      </Container>
    </section>
  );
}
