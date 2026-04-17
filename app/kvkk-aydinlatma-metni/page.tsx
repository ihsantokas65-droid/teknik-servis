import { JsonLd } from "@/components/JsonLd";
import { PolicyShell } from "@/components/PolicyShell";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "KVKK Aydınlatma Metni",
  description: "6698 sayılı KVKK kapsamında aydınlatma metni ve veri sahibi başvuru esasları.",
  path: "/kvkk-aydinlatma-metni"
});

const updatedAt = "2026-04-11";

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/kvkk-aydinlatma-metni", label: "KVKK Aydınlatma Metni" }
  ];

  return (
    <>
      <JsonLd id="ld-breadcrumb-kvkk" data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        id="ld-localbusiness-kvkk"
        data={localBusinessJsonLdForArea({
          pageName: "KVKK Aydınlatma Metni",
          pageUrlPath: "/kvkk-aydinlatma-metni",
          areaName: "Türkiye",
          coords: null,
          serviceName: site.businessName,
          omitAddress: true
        })}
      />

      <PolicyShell title="KVKK Aydınlatma Metni" updatedAt={updatedAt}>
        <p className="muted">
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında {site.businessName} tarafından
          gerçekleştirilen kişisel veri işleme faaliyetlerine ilişkin aydınlatma amaçlıdır.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Veri sorumlusu
        </h2>
        <p className="muted">
          Veri sorumlusu: {site.businessName}. İletişim: {site.email}.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          İşlenen veri kategorileri
        </h2>
        <ul className="muted" style={{ margin: "10px 0 0 18px" }}>
          <li>Kimlik ve iletişim (ad/soyad, telefon, e-posta).</li>
          <li>Hizmet bilgileri (cihaz marka/model, arıza açıklaması, servis geçmişi).</li>
          <li>İşlem güvenliği (IP/log kayıtları) ve çerez verileri (tercihe bağlı).</li>
        </ul>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          İşleme amaçları
        </h2>
        <ul className="muted" style={{ margin: "10px 0 0 18px" }}>
          <li>Servis kaydı oluşturma, randevu planlama, bilgilendirme ve geri dönüş.</li>
          <li>Arıza tespiti, parça temini, hizmetin ifası ve kalite takibi.</li>
          <li>Güvenlik, suistimal önleme ve mevzuata uyum.</li>
        </ul>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Aktarım
        </h2>
        <p className="muted">
          Kişisel veriler, yalnızca hizmetin yürütülmesi için gerekli olması halinde ve mevzuata uygun şekilde sınırlı
          olarak; tedarikçiler, barındırma hizmetleri ve iletişim altyapılarıyla paylaşılabilir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Veri sahibi hakları
        </h2>
        <p className="muted">
          KVKK madde 11 kapsamında sahip olduğunuz haklara ilişkin başvurularınızı {site.email} e-posta adresi üzerinden
          iletebilirsiniz. Başvurunuzda ad-soyad, iletişim bilginiz ve talebinizin açıkça yer alması önerilir.
        </p>
      </PolicyShell>
    </>
  );
}
