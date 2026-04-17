import Link from "next/link";
import { Container } from "@/components/Container";
import { getBrands } from "@/lib/brands";
import { services } from "@/lib/services";

type Props = {
  limitPerService?: number;
};

export function CategoryStrip({ limitPerService = 10 }: Props) {
  const allBrands = getBrands();

  const kinds = [
    { slug: "beyaz-esya-servisi", title: "Beyaz Eşya", subtitle: "Beyaz Eşya Markaları", kind: "beyaz-esya" as const },
    { slug: "kombi-servisi", title: "Kombi", subtitle: "Kombi Markaları", kind: "kombi" as const },
    { slug: "klima-servisi", title: "Klima", subtitle: "Klima Markaları", kind: "klima" as const }
  ];

  const serviceByKind = new Map(services.map((s) => [s.kind, s]));

  return (
    <section className="section" style={{ paddingTop: 18, paddingBottom: 10 }}>
      <Container>
        <div className="grid">
          {kinds.map((k) => {
            const svc = serviceByKind.get(k.kind);
            const brands = allBrands
              .filter((b) => b.supportedServices.includes(k.kind))
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name, "tr"))
              .slice(0, limitPerService);

            const total = allBrands.filter((b) => b.supportedServices.includes(k.kind)).length;

            return (
              <div key={k.kind} className="card" style={{ gridColumn: "span 4", padding: 16, minHeight: 280, display: "flex", flexDirection: "column" }}>
                <div className="muted" style={{ fontWeight: 950, fontSize: 13 }}>
                  {k.title}
                </div>
                <div className="h3" style={{ marginTop: 6, fontWeight: 950 }}>
                  {k.subtitle}
                </div>
                <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                  {total} marka için servis hizmeti
                </div>

                <div className="chips" style={{ marginTop: 12 }}>
                  {brands.map((b) => (
                    <Link key={b.slug} className="chip focus-ring" href={`/marka/${b.slug}/${svc?.slug ?? ""}`.replace(/\/$/, "")}>
                      {b.name}
                    </Link>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <Link className="muted focus-ring" style={{ fontWeight: 900, fontSize: 14 }} href="/markalar">
                    Tümünü Gör →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

