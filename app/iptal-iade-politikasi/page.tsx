import { JsonLd } from "@/components/JsonLd";
import { PolicyShell } from "@/components/PolicyShell";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { site } from "@/lib/site";
import { RelatedLinks } from "@/components/RelatedLinks";

export const metadata = buildMetadata({
  title: "İptal ve İade Politikası",
  description: "Servis randevusu iptali, ücret iadesi ve cayma koşullarına ilişkin bilgilendirme.",
  path: "/iptal-iade-politikasi"
});

const updatedAt = "2026-04-11";

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/iptal-iade-politikasi", label: "İptal ve İade Politikası" }
  ];

  return (
    <>
      <JsonLd id="ld-breadcrumb-iptal-iade" data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        id="ld-localbusiness-iptal-iade"
        data={localBusinessJsonLdForArea({
          pageName: "İptal ve İade Politikası",
          pageUrlPath: "/iptal-iade-politikasi",
          areaName: "Türkiye",
          coords: null,
          serviceName: site.businessName,
          omitAddress: true
        })}
      />

      <PolicyShell title="İptal ve İade Politikası" updatedAt={updatedAt}>
        <p className="muted">
          Bu politika, servis randevusu iptali ve ücret iadesi süreçlerini genel hatlarıyla açıklar. Net koşullar, hizmetin
          niteliğine ve yapılan işlemlere göre değişebilir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Randevu iptali
        </h2>
        <p className="muted">
          Randevunuzu mümkün olduğunca erken iptal etmeniz, planlamanın sağlıklı yürütülmesini sağlar. İptal talepleri için{" "}
          {site.phone} veya {site.email} üzerinden iletişime geçebilirsiniz.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Ücret iadesi
        </h2>
        <ul className="muted" style={{ margin: "10px 0 0 18px" }}>
          <li>Henüz işlem yapılmadıysa iade/iptal değerlendirmesi yapılabilir.</li>
          <li>Yerinde tespit ve yapılan işlem/harcanan parça durumuna göre iade koşulları değişebilir.</li>
          <li>İade, ödeme yöntemine göre bankaya bağlı sürelerde yansıyabilir.</li>
        </ul>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Cayma hakkı bilgilendirmesi
        </h2>
        <p className="muted">
          Eğer mesafeli iletişim kanalları üzerinden hizmet satın alımı/ön ödeme gerçekleştiyse, tüketici mevzuatındaki
          istisna ve koşullar geçerli olabilir (örn. hizmetin ifasına başlanması, acil müdahale, kişiye özel parça/işçilik).
          Detay için bizimle iletişime geçebilirsiniz.
        </p>
        <RelatedLinks
          title="Bu Politikadan Diğer Sayfalara Geçin"
          intro="İptal ve iade sayfasını ana hizmet ve iletişim sayfalarıyla bağlamak kullanıcıya net yol gösterir."
          links={[
            { href: "/iletisim", label: "İletişim", description: "İptal veya iade talebi için doğrudan ulaşın." },
            { href: "/hakkimizda", label: "Hakkımızda", description: "Servis sürecinin nasıl işlediğini görün." },
            { href: "/gizlilik-politikasi", label: "Gizlilik Politikası", description: "Veri işleme esasları." },
            { href: "/cerez-politikasi", label: "Çerez Politikası", description: "Çerez kullanım detayları." },
            { href: "/kullanim-kosullari", label: "Kullanım Koşulları", description: "Site kullanım şartları." },
            { href: "/servis-ucretleri", label: "Servis Ücretleri", description: "Fiyat ve işlem bilgileri." }
          ]}
        />
      </PolicyShell>
    </>
  );
}
