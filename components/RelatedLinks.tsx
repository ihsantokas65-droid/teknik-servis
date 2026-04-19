import Link from "next/link";
import { Container } from "@/components/Container";

export type RelatedLinkItem = {
  href: string;
  label: string;
  description: string;
};

type Props = {
  title: string;
  intro?: string;
  links: RelatedLinkItem[];
};

export function RelatedLinks({ title, intro, links }: Props) {
  if (!links.length) return null;

  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <Container>
        <div className="card" style={{ padding: 24, background: "white" }}>
          <div style={{ maxWidth: 860 }}>
            <h2 className="h2" style={{ fontSize: 28, fontWeight: 950 }}>
              {title}
            </h2>
            {intro ? (
              <p className="muted" style={{ marginTop: 8, fontSize: 15, lineHeight: 1.6 }}>
                {intro}
              </p>
            ) : null}
          </div>

          <div className="grid" style={{ marginTop: 18 }}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="card hover focus-ring"
                style={{
                  gridColumn: "span 4",
                  padding: 16,
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  background: "var(--bg)"
                }}
              >
                <div style={{ fontWeight: 900, color: "var(--brand-900)" }}>{link.label}</div>
                <div className="muted" style={{ marginTop: 6, fontSize: 13, lineHeight: 1.5 }}>
                  {link.description}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
