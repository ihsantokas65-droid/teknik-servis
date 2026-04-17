import { JsonLd } from "@/components/JsonLd";
import { PolicyShell } from "@/components/PolicyShell";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Çerez Politikası",
  description: "Web sitemizde kullanılan çerezler ve tercih yönetimi hakkında bilgilendirme.",
  path: "/cerez-politikasi"
});

const updatedAt = "2026-04-11";

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/cerez-politikasi", label: "Çerez Politikası" }
  ];

  return (
    <>
      <JsonLd id="ld-breadcrumb-cerez" data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        id="ld-localbusiness-cerez"
        data={localBusinessJsonLdForArea({
          pageName: "Çerez Politikası",
          pageUrlPath: "/cerez-politikasi",
          areaName: "Türkiye",
          coords: null,
          serviceName: site.businessName,
          omitAddress: true
        })}
      />

      <PolicyShell title="Çerez Politikası" updatedAt={updatedAt}>
        <p className="muted">
          Çerezler (cookies), web sitemizin doğru çalışması ve deneyimin iyileştirilmesi için tarayıcınıza kaydedilen küçük
          dosyalardır.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Çerez türleri
        </h2>
        <ul className="muted" style={{ margin: "10px 0 0 18px" }}>
          <li>Zorunlu çerezler: Sitenin temel işlevleri için gerekir.</li>
          <li>Analitik çerezler: Trafik ve kullanım ölçümü (tercihe bağlı).</li>
          <li>Pazarlama çerezleri: Reklam/yeniden pazarlama (tercihe bağlı).</li>
        </ul>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Tercih yönetimi
        </h2>
        <p className="muted">
          Tarayıcı ayarlarınız üzerinden çerezleri yönetebilir veya silebilirsiniz. Bazı çerezleri kapatmanız, sitenin bazı
          bölümlerinin çalışmasını etkileyebilir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Google hizmetleri ve üçüncü taraflar
        </h2>
        <p className="muted">
          Trafik ölçümü ve reklam performansı için üçüncü taraf araçlar kullanılabilir (ör. Google Analytics / Google Ads).
          Bu araçlar, cihaz bilgileri ve kullanım verileri gibi bilgileri çerezler aracılığıyla toplayabilir.
        </p>
        <ul className="muted" style={{ margin: "10px 0 0 18px" }}>
          <li>
            Google Ads ayarları:{" "}
            <a className="focus-ring" href="https://adssettings.google.com" rel="noreferrer" target="_blank">
              https://adssettings.google.com
            </a>
          </li>
          <li>
            Google Analytics devre dışı bırakma eklentisi:{" "}
            <a className="focus-ring" href="https://tools.google.com/dlpage/gaoptout" rel="noreferrer" target="_blank">
              https://tools.google.com/dlpage/gaoptout
            </a>
          </li>
        </ul>
      </PolicyShell>
    </>
  );
}
