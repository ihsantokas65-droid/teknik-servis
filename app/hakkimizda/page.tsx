import { Container } from "@/components/Container";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, localBusinessJsonLdForArea, aboutPageJsonLd } from "@/lib/seo";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Hakkımızda",
  description: "Servisuzmanı: kombi, klima ve beyaz eşya için servis kaydı, randevu planlama ve il/ilçe bazlı yönlendirme yaklaşımımız.",
  path: "/hakkimizda"
});

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/hakkimizda", label: "Hakkımızda" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="ld-breadcrumb-hakkimizda" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd id="ld-about" data={aboutPageJsonLd()} />
        <JsonLd
          id="ld-localbusiness-hakkimizda"
          data={localBusinessJsonLdForArea({
            pageName: "Hakkımızda",
            pageUrlPath: "/hakkimizda",
            areaName: "Türkiye",
            coords: null,
            serviceName: "Teknik servis",
            omitAddress: true
          })}
        />
        <h1 className="h1" style={{ fontSize: 36 }}>
          Hakkımızda
        </h1>
        <p className="muted" style={{ maxWidth: 900 }}>
          {site.businessName}; kombi, klima ve beyaz eşya servis taleplerini daha düzenli yönetmek için il/ilçe bazlı
          yönlendirme, servis kaydı ve randevu planlama akışı sunar. Amacımız; kullanıcıya doğru sayfadan, doğru bilgiyle
          hızlı şekilde ulaşmak ve servis sürecini şeffaf yürütmektir.
        </p>

        <div className="grid" style={{ marginTop: 16, alignItems: "stretch" }}>
          <div className="card" style={{ gridColumn: "span 7", padding: 16 }}>
            <div className="badge">Yaklaşım</div>
            <h2 className="h2" style={{ fontSize: 22, marginTop: 10 }}>
              Nasıl çalışıyoruz?
            </h2>
            <div className="muted" style={{ fontSize: 14, marginTop: 8 }}>
              Servis sürecini kayıt → randevu → tespit → işlem → test adımlarına böleriz. İşlem öncesi bilgilendirme yapılır
              ve onayınız olmadan parça/işçilik uygulanmaz.
            </div>

            <div className="grid" style={{ marginTop: 12 }}>
              <Step n="1" t="Servis kaydı" d="Arıza belirtisini ve cihaz bilgisini paylaşın." />
              <Step n="2" t="Randevu planı" d="Uygun gün/saat için planlama yapılır." />
              <Step n="3" t="Yerinde tespit" d="İşlem ve seçenekler netleştirilir." />
              <Step n="4" t="İşlem ve test" d="Onayınızla işlem yapılır, test edilerek teslim edilir." />
            </div>
          </div>

          <div className="card" style={{ gridColumn: "span 5", padding: 16 }}>
            <div className="badge">Güven</div>
            <h2 className="h2" style={{ fontSize: 22, marginTop: 10 }}>
              Şeffaflık ve güven
            </h2>
            <ul className="muted" style={{ margin: "12px 0 0 18px" }}>
              {(site.trustSignals ?? []).slice(0, 5).map((x) => (
                <li key={x}>{x}</li>
              ))}
              <li>İşlem sonrası temel kontrol ve teslim</li>
              <li>Gizlilik ve veri güvenliği (KVKK / Çerez Politikası)</li>
            </ul>

            <div className="card" style={{ padding: 12, marginTop: 12, background: "rgba(255,255,255,.7)", boxShadow: "none" }}>
              <div style={{ fontWeight: 950 }}>Hızlı bağlantılar</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 8, display: "grid", gap: 8 }}>
                <Link className="focus-ring" href="/servis-bolgeleri">
                  Servis Bölgeleri →
                </Link>
                <Link className="focus-ring" href="/hizmetler">
                  Hizmetler →
                </Link>
                <Link className="focus-ring" href="/markalar">
                  Markalar →
                </Link>
              </div>
            </div>
          </div>

          <div className="card" style={{ gridColumn: "span 12", padding: 16 }}>
            <div className="badge">Kapsam</div>
            <h2 className="h2" style={{ fontSize: 22, marginTop: 10 }}>
              Hangi hizmetleri veriyoruz?
            </h2>
            <div className="muted" style={{ fontSize: 14, marginTop: 8 }}>
              Kombi, klima ve beyaz eşya kategorilerinde bakım, onarım ve arıza tespiti başlıklarıyla ilerleriz. Marka ve
              bölgeye göre uygun sayfaya yönlendirme yapılır.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <Link className="btn focus-ring" href="/iletisim">
                Servis Kaydı Oluştur
              </Link>
              <Link className="btn secondary focus-ring" href="/servis-bolgeleri">
                Bölge Seç
              </Link>
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>
              Çalışma saatleri: {site.workingHours} • E‑posta:{" "}
              <a className="focus-ring" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Step({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div className="card" style={{ gridColumn: "span 6", padding: 12, background: "rgba(255,255,255,.7)", boxShadow: "none" }}>
      <div className="badge">{n}</div>
      <div style={{ fontWeight: 950, marginTop: 8 }}>{t}</div>
      <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{d}</div>
    </div>
  );
}
