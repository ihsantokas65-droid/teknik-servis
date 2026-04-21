import { JsonLd } from "@/components/JsonLd";
import { PolicyShell } from "@/components/PolicyShell";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { site } from "@/lib/site";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Footer } from "@/components/Footer";
import { getRelatedBlogsForContext } from "@/lib/blog";

export const metadata = buildMetadata({
  title: "Çerez Politikası",
  description: "Web sitemizdeki çerez kullanımı, türleri ve yönetim yöntemlerine ilişkin bilgilendirme.",
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
          Bu çerez politikası, {site.businessName} (“biz”) web sitesinde kullanılan çerezlerin (cookie) ne olduğunu, nasıl
          kullanıldığını ve bunları nasıl yönetebileceğinizi açıklar.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Çerez nedir?
        </h2>
        <p className="muted">
          Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza (bilgisayar, telefon vb.)
          kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin daha verimli çalışmasını ve geliştirilmesini sağlar.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Kullanılan çerez türleri
        </h2>
        <ul className="muted" style={{ margin: "10px 0 0 18px" }}>
          <li>
            <strong>Zorunlu Çerezler:</strong> Web sitesinin temel fonksiyonlarının çalışması için gereklidir (ör. oturum
            yönetimi, güvenlik).
          </li>
          <li>
            <strong>Performans ve Analitik Çerezleri:</strong> Ziyaretçi trafiğini anonim olarak ölçmek ve iyileştirmeler
            yapmak için kullanılır (ör. Google Analytics).
          </li>
          <li>
            <strong>Fonksiyonel Çerezler:</strong> Dil tercihi gibi kullanıcı seçimlerini hatırlamak için kullanılır.
          </li>
          <li>
            <strong>Reklam ve Pazarlama Çerezleri:</strong> İlgi alanlarınıza göre reklam sunmak ve kampanya performansını
            ölçmek için kullanılır.
          </li>
        </ul>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Çerezleri yönetme
        </h2>
        <p className="muted">
          Tarayıcınızın ayarlarını değiştirerek çerezleri kabul edebilir, engelleyebilir veya silebilirsiniz. Ancak zorunlu
          çerezlerin devre dışı bırakılması, web sitesinin bazı özelliklerinin çalışmamasına neden olabilir.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Üçüncü taraf çerezleri
        </h2>
        <p className="muted">
          Kullanılan bazı servisler (reklam ağları, analiz araçları vb.) kendi çerezlerini cihazınıza yerleştirebilir. Bu
          çerezlerin yönetimi ilgili servis sağlayıcıların politikalarına tabidir.
        </p>

        <RelatedLinks
          title="Çerez Sayfasından Diğer Politikalar"
          intro="Şeffaflık ilkemiz gereği tüm yasal bilgilendirmelere buradan ulaşabilirsiniz."
          links={[
            { href: "/gizlilik-politikasi", label: "Gizlilik Politikası", description: "Veri işleme detayları." },
            { href: "/kvkk-aydinlatma-metni", label: "KVKK Metni", description: "Kişisel veri hakları." },
            { href: "/kullanim-kosullari", label: "Kullanım Koşulları", description: "Site kullanım şartları." },
            { href: "/iptal-iade-politikasi", label: "İptal ve İade", description: "İade/iptal süreçleri." },
            { href: "/hakkimizda", label: "Hakkımızda", description: "Kurumsal yaklaşımımız." },
            { href: "/iletisim", label: "İletişim", description: "Sorularınız için bize ulaşın." }
          ]}
        />
      </PolicyShell>
      <Footer relatedBlogs={getRelatedBlogsForContext({ limit: 4 })} />
    </>
  );
}
