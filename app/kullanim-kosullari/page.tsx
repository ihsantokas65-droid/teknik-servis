import { JsonLd } from "@/components/JsonLd";
import { PolicyShell } from "@/components/PolicyShell";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLdForArea } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Kullanım Koşulları",
  description: "Web sitesinin kullanım şartları, sorumluluk reddi ve içerik kullanım esasları.",
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
      <JsonLd id="ld-breadcrumb-kullanim" data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        id="ld-localbusiness-kullanim"
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
          Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Metinler bilgilendirme amaçlıdır; hizmet
          koşulları için iletişim kurunuz.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          İçerik ve sorumluluk
        </h2>
        <p className="muted">
          Sitede yer alan bilgiler genel bilgilendirme amaçlıdır. Cihaz arızaları model ve koşullara göre farklılık
          gösterebilir. Kesin tespit, yerinde inceleme ile yapılır.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          Üçüncü taraf bağlantılar
        </h2>
        <p className="muted">
          Sitede üçüncü taraf web sitelerine bağlantılar bulunabilir. Bu sitelerin içerik ve politikalarından ilgili üçüncü
          taraflar sorumludur.
        </p>

        <h2 className="h2" style={{ fontSize: 22, marginTop: 18 }}>
          İletişim
        </h2>
        <p className="muted">
          Sorularınız için {site.email} üzerinden bize yazabilirsiniz.
        </p>
      </PolicyShell>
    </>
  );
}
