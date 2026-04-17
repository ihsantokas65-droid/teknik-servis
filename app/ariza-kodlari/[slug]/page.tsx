import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getErrorCode } from "@/lib/errorCodes";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import { AlertCircle, CheckCircle, Info, PhoneCall } from "lucide-react";
import type { Metadata } from "next";
import { site } from "@/lib/site";
import { EeatBadge } from "@/components/EeatBadge";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const err = getErrorCode(params.slug);
  if (!err) return {};

  const base = buildMetadata({
    title: `${err.title} - Çözümü ve Detayları`,
    description: err.description,
    path: `/ariza-kodlari/${err.slug}`
  });
  return base;
}

export default function ErrorCodeDetail({ params }: { params: { slug: string } }) {
  const err = getErrorCode(params.slug);
  if (!err) notFound();

  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/ariza-kodlari", label: "Arıza Kodları" },
    { href: `/ariza-kodlari/${err.slug}`, label: `${err.brandName} ${err.code}` }
  ];

  return (
    <article className="section">
      <Container>
        <Breadcrumbs items={crumbs} />
        
        <div className="card" style={{ padding: "40px", background: "white", marginTop: 16 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div className="badge">{err.brandName}</div>
            {err.isFatal && <div className="badge" style={{ background: "rgba(242,101,34,0.1)", color: "var(--brand-700)", border: "1px solid var(--brand)" }}>⚠️ CİHAZI GEÇİCİ KAPATIN</div>}
          </div>

          <h1 className="h1" style={{ fontSize: 42, marginBottom: 16, lineHeight: 1.1 }}>
            {err.title}
          </h1>
          <p className="muted" style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 800 }}>
            {err.description}
          </p>
          
          <div style={{ marginTop: 24, marginBottom: 32 }}>
            <EeatBadge />
          </div>

          <div style={{ padding: 24, background: "#f8fafc", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 32 }}>
            <h2 className="h3" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--brand-900)" }}>
              <Info size={24} color="var(--accent)" /> Olası Nedenler
            </h2>
            <ul style={{ margin: 0, paddingLeft: 24, lineHeight: 1.8 }}>
              {err.reasons.map((r, i) => (
                <li key={i} className="muted" style={{ fontSize: 16 }}>{r}</li>
              ))}
            </ul>
          </div>

          <div style={{ padding: 24, background: "rgba(242,101,34,0.05)", borderRadius: 12, border: "1px dashed var(--brand)", marginBottom: 40 }}>
            <h2 className="h3" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--brand-700)" }}>
              <CheckCircle size={24} /> Ne Yapmalısınız? (Çözüm Adımları)
            </h2>
            <p className="muted" style={{ fontSize: 16, lineHeight: 1.7 }}>
              {err.solution}
            </p>
          </div>

          {err.isFatal && (
            <div style={{ padding: 32, background: "var(--surface)", border: "2px solid var(--brand)", borderRadius: 16, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, margin: "0 auto 16px", background: "var(--brand-soft)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)" }}>
                <AlertCircle size={32} />
              </div>
              <h3 className="h2" style={{ fontSize: 24, marginBottom: 12 }}>Kritik Cihaz Hatası</h3>
              <p className="muted" style={{ fontSize: 16, marginBottom: 24, maxWidth: 640, margin: "0 auto 24px" }}>
                Bu arıza kodu, cihazınızda donanımsal düzeyde kritik bir probleme veya gaz/elektrik tehlikesine işaret edebilir. Sorun devam ediyorsa lütfen kendiniz cihazın içini açarak onarmaya çalışmayın.
              </p>
              <Link href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="btn">
                <PhoneCall size={20} /> Hemen Bölge Servisini Çağır {site.phone}
              </Link>
            </div>
          )}
        </div>
      </Container>
    </article>
  );
}
