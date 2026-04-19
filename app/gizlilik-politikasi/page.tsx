import { JsonLd } from "@/components/JsonLd";
import { PolicyShell } from "@/components/PolicyShell";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { site } from "@/lib/site";
import { RelatedLinks } from "@/components/RelatedLinks";

export const metadata = buildMetadata({
  title: "Gizlilik Politikası",
  description: "Kişisel verilerin işlenmesi, saklanması ve korunmasına ilişkin gizlilik politikamız.",
  path: "/gizlilik-politikasi"
});

const updatedAt = "2026-04-11";

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" }
  ];

  return (
    <>
      <JsonLd id="ld-breadcrumb-gizlilik" data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        id="ld-localbusiness-gizlilik"
        data={localBusinessJsonLdForArea({
          pageName: "Gizlilik Politikası",
          pageUrlPath: "/gizlilik-politikasi",
          areaName: "Türkiye",
          coords: null,
          serviceName: site.businessName,
          omitAddress: true
        })}
      />

      <PolicyShell title="Gizlilik Politikası" updatedAt={updatedAt}>
        <p className="muted">
          Bu metin, {site.businessName} (“biz”) tarafından sunulan teknik servis hizmetleri kapsamında web sitemizi ziyaret
          eden kullanıcıların kişisel verilerinin nasıl işlendiğini açıklar.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Toplanan veriler
        </h2>
        <ul className="muted" style={{ margin: "10px 0 0 18px" }}>
          <li>İletişim bilgileri (ad/soyad, telefon, e-posta) – servis kaydı ve dönüş amaçlı.</li>
          <li>Cihaz bilgileri (marka/model, arıza belirtisi) – servis planlama ve tespit amaçlı.</li>
          <li>Log/teknik veriler (IP, tarayıcı, sayfa görüntüleme) – güvenlik ve performans amaçlı.</li>
        </ul>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          İşleme amaçları
        </h2>
        <ul className="muted" style={{ margin: "10px 0 0 18px" }}>
          <li>Servis kaydı oluşturma, randevu planlama, bilgilendirme ve geri dönüş.</li>
          <li>Hizmet kalitesini artırma, kullanıcı deneyimini iyileştirme.</li>
          <li>Mevzuattan doğan saklama/yükümlülüklerin yerine getirilmesi.</li>
        </ul>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Paylaşım
        </h2>
        <p className="muted">
          Kişisel veriler, yalnızca hizmetin yürütülmesi için gerekli olması halinde ve mevzuata uygun şekilde sınırlı
          olarak paylaşılabilir (ör. çağrı/mesajlaşma altyapıları, barındırma hizmetleri).
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Reklam ve ölçüm
        </h2>
        <p className="muted">
          Ziyaret trafiği ve reklam performansını ölçmek amacıyla analitik ve pazarlama çerezleri kullanılabilir. Tercihe
          bağlı çerezler için tarayıcı ayarlarınızı kullanabilir veya ilgili araçların tercih ekranlarından seçimlerinizi
          yönetebilirsiniz (bkz. Çerez Politikası).
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Saklama süresi
        </h2>
        <p className="muted">
          Veriler, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatın öngördüğü süreler kadar saklanır.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Haklarınız
        </h2>
        <p className="muted">
          İlgili mevzuat kapsamında kişisel verilerinize ilişkin bilgi talep etme, düzeltme, silme ve işlemeye itiraz gibi
          haklarınız bulunabilir. Taleplerinizi {site.email} üzerinden iletebilirsiniz.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          İletişim
        </h2>
        <p className="muted">
          Gizlilikle ilgili talepleriniz için {site.email} üzerinden bize ulaşabilirsiniz.
        </p>

        <RelatedLinks
          title="Gizlilik Sayfasından Diğer Politikalar"
          intro="Politika sayfaları birbirine bağlandığında Google bunları tek bir kurumsal bilgi kümesi olarak görür."
          links={[
            { href: "/cerez-politikasi", label: "Çerez Politikası", description: "Çerez kullanımına dair detaylar." },
            { href: "/kvkk-aydinlatma-metni", label: "KVKK Metni", description: "Kişisel veri işleme hakları." },
            { href: "/kullanim-kosullari", label: "Kullanım Koşulları", description: "Web sitesi kullanım şartları." },
            { href: "/iptal-iade-politikasi", label: "İptal ve İade", description: "İade ve iptal koşulları." },
            { href: "/hakkimizda", label: "Hakkımızda", description: "Servis yaklaşımı ve süreç." },
            { href: "/iletisim", label: "İletişim", description: "Politikalar hakkında doğrudan ulaşın." }
          ]}
        />
      </PolicyShell>
    </>
  );
}
