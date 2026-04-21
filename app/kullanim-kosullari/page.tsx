import { JsonLd } from "@/components/JsonLd";
import { PolicyShell } from "@/components/PolicyShell";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { site } from "@/lib/site";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Footer } from "@/components/Footer";
import { getRelatedBlogsForContext } from "@/lib/blog";

export const metadata = buildMetadata({
  title: "Kullanım Koşulları",
  description: "Web sitemizin kullanım şartları, sorumluluk reddi ve yasal bildirimler.",
  path: "/kullanim-kosullari"
});

const updatedAt = "2026-04-11";

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/kullanim-kosullari", label: "Kullanım Koşulları" }
  ];

  return (
    <>
      <JsonLd id="ld-breadcrumb-kosullar" data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        id="ld-localbusiness-kosullar"
        data={localBusinessJsonLdForArea({
          pageName: "Kullanım Koşulları",
          pageUrlPath: "/kullanim-kosullari",
          areaName: "Türkiye",
          coords: null,
          serviceName: site.businessName,
          omitAddress: true
        })}
      />

      <PolicyShell title="Kullanım Koşulları" updatedAt={updatedAt}>
        <p className="muted">
          Bu web sitesini ({site.url}) ziyaret ederek ve kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Hizmet kapsamı
        </h2>
        <p className="muted">
          {site.businessName}, bağımsız bir özel teknik servis kuruluşu olup, garanti dışı kalmış beyaz eşya, kombi ve
          klima cihazlarına ücretli onarım ve bakım hizmeti sunar. Sitemizdeki marka ve cihaz bilgileri yalnızca
          bilgilendirme amaçlıdır.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Fikri mülkiyet
        </h2>
        <p className="muted">
          Site içeriğinde yer alan metinler, görseller ve tasarımlar {site.businessName}’ye veya ilgili hak sahiplerine
          aittir. Önceden yazılı izin alınmaksızın kopyalanamaz veya ticari amaçla kullanılamaz.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Sorumluluk reddi
        </h2>
        <p className="muted">
          Web sitemizdeki bilgilerin güncelliği ve doğruluğu için azami çaba gösterilmektedir. Ancak rehberler ve teknik
          bilgiler yalnızca genel bilgilendirme amacı taşır; cihazınızdaki spesifik sorunlar için her zaman profesyonel
          yerinde destek almanız önerilir. Oluşabilecek teknik aksaklıklardan {site.businessName} sorumlu tutulamaz.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Bağlantılar
        </h2>
        <p className="muted">
          Sitemizden üçüncü taraf web sitelerine verilen bağlantıların içeriğinden veya gizlilik pratiklerinden
          {site.businessName} sorumlu değildir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Değişiklikler
        </h2>
        <p className="muted">
          Bu kullanım koşulları, mevzuat değişiklikleri veya operasyonel nedenlerle güncellenebilir. Güncellemeleri bu sayfa
          üzerinden takip edebilirsiniz.
        </p>

        <RelatedLinks
          title="Koşullar Sayfasından Diğer Politikalar"
          intro="Kullanım şartları dışındaki yasal haklarınız için ilgili politikaları inceleyebilirsiniz."
          links={[
            { href: "/gizlilik-politikasi", label: "Gizlilik Politikası", description: "Veri saklama detayları." },
            { href: "/cerez-politikasi", label: "Çerez Politikası", description: "Çerez tercih yönetimi." },
            { href: "/kvkk-aydinlatma-metni", label: "KVKK Metni", description: "Aydınlatma ve başvuru hakları." },
            { href: "/iptal-iade-politikasi", label: "İptal ve İade", description: "Süreç ve iade şartları." },
            { href: "/hakkimizda", label: "Hakkımızda", description: "Sertifikalı ekibimiz ve yaklaşımımız." },
            { href: "/iletisim", label: "İletişim", description: "Hukuki talepler için bize ulaşın." }
          ]}
        />
      </PolicyShell>
      <Footer relatedBlogs={getRelatedBlogsForContext({ limit: 4 })} />
    </>
  );
}
