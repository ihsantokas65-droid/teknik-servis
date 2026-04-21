import { JsonLd } from "@/components/JsonLd";
import { PolicyShell } from "@/components/PolicyShell";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { site } from "@/lib/site";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Footer } from "@/components/Footer";
import { getRelatedBlogsForContext } from "@/lib/blog";

export const metadata = buildMetadata({
  title: "İptal ve İade Politikası",
  description: "Hizmet iptali, servis randevusu değişikliği ve yedek parça iadesine ilişkin politikamız.",
  path: "/iptal-iade-politikasi"
});

const updatedAt = "2026-04-11";

export default function Page() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/iptal-iade-politikasi", label: "İptal ve İade" }
  ];

  return (
    <>
      <JsonLd id="ld-breadcrumb-iade" data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        id="ld-localbusiness-iade"
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
          {site.businessName} teknik servis hizmetleri kapsamında, servis randevusu ve parça değişimi süreçlerine ilişkin
          iptal ve iade koşullarımız aşağıda belirtilmiştir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Servis randevusu iptali
        </h2>
        <p className="muted">
          Oluşturduğunuz servis randevusunu, planlanan saatten en az 2 saat öncesine kadar ücretsiz olarak iptal edebilir
          veya erteleyebilirsiniz. Teknisyenimiz adrese ulaştıktan sonra yapılan iptallerde standart servis (yol ve tespit)
          ücreti talep edilebilir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Hizmetten vazgeçme
        </h2>
        <p className="muted">
          Arıza tespiti yapıldıktan sonra, sunulan fiyat teklifini onaylamamanız halinde yalnızca servis bedeli alınır ve
          herhangi bir onarım işlemi yapılmaz. Onay verildikten sonra başlayan işlemler için kullanılan sarf malzemelerin
          bedeli tahsil edilebilir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Yedek parça iadesi
        </h2>
        <p className="muted">
          Değişimi yapılan yedek parçalar, cihazınıza özel olarak monte edildiği için (montajı tamamlanmış ve kullanılmış
          durumda olması sebebiyle) iade kapsamında değerlendirilmeyebilir. Ancak parça arızalı çıkarsa, 1 yıllık garanti
          kapsamında ücretsiz olarak yenisiyle değiştirilir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Ücret iadesi
        </h2>
        <p className="muted">
          Hatalı tahsilat veya hizmetin kusurlu olması nedeniyle iade gereken durumlarda, inceleme sonrası 7 iş günü
          içerisinde ödeme yaptığınız kanal üzerinden iade işlemi gerçekleştirilir.
        </p>

        <RelatedLinks
          title="İade Sayfasından Diğer Politikalar"
          intro="Hizmet standartlarımız ve yasal haklarınıza dair diğer metinleri inceleyin."
          links={[
            { href: "/gizlilik-politikasi", label: "Gizlilik Politikası", description: "Veri işleme detayları." },
            { href: "/cerez-politikasi", label: "Çerez Politikası", description: "Çerez kullanım esasları." },
            { href: "/kvkk-aydinlatma-metni", label: "KVKK Metni", description: "Aydınlatma ve başvuru hakları." },
            { href: "/kullanim-kosullari", label: "Kullanım Koşulları", description: "Site kullanım şartları." },
            { href: "/hakkimizda", label: "Hakkımızda", description: "Sertifikalı ekibimiz ve yaklaşımımız." },
            { href: "/iletisim", label: "İletişim", description: "İptal ve iade talepleri için ulaşın." }
          ]}
        />
      </PolicyShell>
      <Footer relatedBlogs={getRelatedBlogsForContext({ limit: 4 })} />
    </>
  );
}
