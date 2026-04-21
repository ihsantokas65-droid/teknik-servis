import { JsonLd } from "@/components/JsonLd";
import { PolicyShell } from "@/components/PolicyShell";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { site } from "@/lib/site";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Footer } from "@/components/Footer";
import { getRelatedBlogsForContext } from "@/lib/blog";

export const metadata = buildMetadata({
  title: "KVKK Aydınlatma Metni",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metnimiz.",
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
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca veri sorumlusu sıfatıyla
          {site.businessName} tarafından kişisel verilerinizin işlenme süreçleri hakkında sizi bilgilendirmek amacıyla
          hazırlanmıştır.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Veri işlemeye ilişkin ilkelerimiz
        </h2>
        <p className="muted">
          Kişisel verileriniz; hukuka ve dürüstlük kurallarına uygun, belirli, açık ve meşru amaçlar doğrultusunda,
          işlendikleri amaçla bağlantılı, sınırlı ve ölçülü olarak işlenmektedir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          İşlenen veriler ve hukuki sebepler
        </h2>
        <p className="muted">
          Servis kaydı, randevu oluşturma ve hizmet sunumu süreçlerinde paylaştığınız ad, soyad, telefon ve adres verileriniz,
          “bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait
          kişisel verilerin işlenmesinin gerekli olması” hukuki sebebine dayalı olarak işlenir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Veri aktarımı
        </h2>
        <p className="muted">
          Verileriniz, yalnızca yasal yükümlülüklerin yerine getirilmesi amacıyla yetkili kamu kurum ve kuruluşları ile veya
          hizmetin ifası için zorunlu olan iş ortaklarımızla (ör. lojistik, mesajlaşma altyapıları) mevzuata uygun şekilde
          paylaşılabilir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Haklarınız (KVKK Madde 11)
        </h2>
        <p className="muted">
          KVKK kapsamında; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını öğrenme,
          yurt içinde/dışında aktarıldığı kişileri bilme, eksik/yanlış verilerin düzeltilmesini isteme gibi haklara
          sahipsiniz.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Başvuru yöntemi
        </h2>
        <p className="muted">
          Haklarınıza ilişkin taleplerinizi, {site.address.street} {site.address.city}/{site.address.region} adresine yazılı
          olarak veya {site.email} adresine güvenli elektronik imza ile iletebilirsiniz.
        </p>

        <RelatedLinks
          title="KVKK Sayfasından Diğer Politikalar"
          intro="Kişisel verilerinize ilişkin diğer dokümanlara aşağıdaki bağlantılardan ulaşabilirsiniz."
          links={[
            { href: "/gizlilik-politikasi", label: "Gizlilik Politikası", description: "Veri saklama ve koruma esasları." },
            { href: "/cerez-politikasi", label: "Çerez Politikası", description: "Çerez kullanım detayları." },
            { href: "/kullanim-kosullari", label: "Kullanım Koşulları", description: "Site kullanım şartları." },
            { href: "/iptal-iade-politikasi", label: "İptal ve İade", description: "Hizmet iptali ve iade şartları." },
            { href: "/hakkimizda", label: "Hakkımızda", description: "Servis ekibimiz ve vizyonumuz." },
            { href: "/iletisim", label: "İletişim", description: "Doğrudan destek ve kayıt hattı." }
          ]}
        />
      </PolicyShell>
      <Footer relatedBlogs={getRelatedBlogsForContext({ limit: 4 })} />
    </>
  );
}
