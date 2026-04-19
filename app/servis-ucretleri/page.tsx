import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata, faqPageJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import Link from "next/link";
import { RelatedLinks } from "@/components/RelatedLinks";

export const metadata = buildMetadata({
  title: 'Servis Ücretleri | Güncel Fiyatlar ve İşlem Kategorileri',
  description: 'Beyaz eşya, kombi ve klima servis ücretleri. Şeffaf fiyatlandırma ve güncel işlem kategorileri burada.',
  path: '/servis-ucretleri',
  keywords: ['servis ücretleri', 'fiyat listesi', 'kombi ücreti', 'klima ücreti', 'beyaz eşya ücreti']
});

const pricingData = [
  {
    category: "Beyaz Eşya Servis Ücretleri",
    items: [
      { name: "Çamaşır Makinesi Tamiri", price: "2.500 ₺" },
      { name: "Bulaşık Makinesi Tamiri", price: "2.300 ₺" },
      { name: "Buzdolabı Tamiri", price: "2.800 ₺" },
      { name: "Fırın Tamiri", price: "2.200 ₺" },
      { name: "Ocak Tamiri", price: "2.000 ₺" },
      { name: "Aspiratör Tamiri", price: "2.100 ₺" },
      { name: "Kurutma Makinesi Tamiri", price: "2.400 ₺" },
      { name: "Mikrodalga Fırın Tamiri", price: "2.200 ₺" },
      { name: "Elektrikli Süpürge Tamiri", price: "2.000 ₺" },
    ]
  },
  {
    category: "Kombi & Klima Servis Ücretleri",
    items: [
      { name: "Kombi Genel Bakım", price: "2.500 ₺" },
      { name: "Kombi Elektronik Kart Arızası", price: "3.500 ₺" },
      { name: "Kombi Genleşme Tankı Değişimi", price: "2.800 ₺" },
      { name: "Kombi Sıcak Su Sensörü Değişimi", price: "2.300 ₺" },
      { name: "Kombi Fan Motor Arızası", price: "3.200 ₺" },
      { name: "Kombi Üç Yollu Vana Değişimi", price: "2.900 ₺" },
      { name: "Kombi Gaz Valfi Arızası", price: "3.800 ₺" },
      { name: "Kombi Eşanjör Temizliği", price: "2.600 ₺" },
      { name: "Klima Bakım & Tamir", price: "2.600 ₺" },
    ]
  }
];

const faqs = [
  { q: "Servis ücretine neler dahildir?", a: "Belirtilen ücretler genellikle işçilik ve temel malzemeleri kapsar. KDV dahildir." },
  { q: "Arıza tespiti sonrası tamirden vazgeçersem ne öderim?", a: "Sadece standart arıza tespit (servis) ücreti alınır. Tamir onaylanırsa bu ücret toplam bedelden düşülür." },
  { q: "Parça değişimi fiyata dahil mi?", a: "Hayır, listedeki fiyatlar işçilik başlangıç bedelleridir. Yedek parça gerekirse parça ücreti ayrıca eklenir ve onayınıza sunulur." }
];

export default function PricingPage() {
  const crumbs = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/servis-ucretleri", label: "Servis Ücretleri" }
  ];

  return (
    <section className="section">
      <Container>
        <JsonLd id="pricing-crumbs" data={breadcrumbJsonLd(crumbs)} />
        <JsonLd id="pricing-faq" data={faqPageJsonLd(faqs)} />

        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1 className="h1">Şeffaf Servis Ücretleri</h1>
          <p className="muted" style={{ maxWidth: 800, margin: "20px auto 0" }}>
            {site.businessName} olarak, sürpriz maliyetlerden kaçınmanız için tüm süreçlerimizde şeffaf fiyatlandırma politikası uyguluyoruz. 
            Aşağıdaki fiyatlar 2026 yılı için geçerli olan ortalama başlangıç bedelleridir.
          </p>
        </div>

        <div className="grid">
          {pricingData.map((cat, idx) => (
            <div key={idx} className="card" style={{ gridColumn: "span 6", padding: 24 }}>
              <h2 className="h2" style={{ fontSize: 24, marginBottom: 24, color: "var(--brand-900)" }}>{cat.category}</h2>
              <div style={{ display: "grid", gap: 12 }}>
                {cat.items.map((item, i) => (
                  <div key={i} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    padding: "12px 16px", 
                    background: i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent",
                    borderRadius: 8,
                    border: "1px solid var(--border)"
                  }}>
                    <span style={{ fontWeight: 700 }}>{item.name}</span>
                    <span style={{ fontWeight: 900, color: "var(--accent)" }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 40, padding: 32, background: "var(--brand-soft)", border: "2px solid var(--brand)" }}>
          <h2 className="h2" style={{ fontSize: 24, marginBottom: 16 }}>Önemli Notlar</h2>
          <ul style={{ display: "grid", gap: 12, paddingLeft: 20 }}>
            <li>Verilen fiyatlar ortalama başlangıç bedelleridir ve işçilik + KDV dahildir.</li>
            <li>Kesin ücret, uzman teknisyenlerin yerinde yapacağı fiziksel arıza tespiti sonrası belirlenir.</li>
            <li><strong>Müşteri onayı alınmadan asla işleme başlanmaz.</strong></li>
            <li>Değişmesi gereken parçalar varsa, güncel stok ve fiyat bilgisi size yerinde sunulur.</li>
          </ul>
          <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
            <Link href={`tel:${site.phone.replace(/\s+/g, "")}`} className="btn">Ücret Bilgisi Al</Link>
            <Link href="/iletisim" className="btn secondary">İletişime Geç</Link>
          </div>
        </div>

        <div style={{ marginTop: 80 }}>
          <h2 className="h2" style={{ textAlign: "center", marginBottom: 40 }}>Sık Sorulan Sorular</h2>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gap: 16 }}>
            {faqs.map((f, i) => (
              <div key={i} className="card" style={{ padding: 24 }}>
                <h3 className="h3" style={{ marginBottom: 8 }}>{f.q}</h3>
                <p className="muted">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <RelatedLinks
          title="Servis Ücretleri Sayfasından Diğer İçeriklere"
          intro="Fiyat sayfası, servis bölgeleri ve hizmet sayfalarıyla bağlantılı olduğunda hem kullanıcı hem Google için daha anlamlı olur."
          links={[
            { href: "/hizmetler", label: "Hizmetler", description: "Hangi kategoride fiyat aradığınızı seçin." },
            { href: "/servis-bolgeleri", label: "Servis Bölgeleri", description: "Size en yakın şehir ve ilçe sayfasına geçin." },
            { href: "/markalar", label: "Markalar", description: "Marka bazlı servis sayfalarını açın." },
            { href: "/blog", label: "Blog", description: "Bakım ve maliyet rehberlerini okuyun." },
            { href: "/ariza-kodlari", label: "Arıza Kodları", description: "Sorun tanımı yapmadan önce kod açıklamalarına bakın." },
            { href: "/iletisim", label: "İletişim", description: "Net fiyat bilgisi için servis kaydı oluşturun." }
          ]}
        />
      </Container>
    </section>
  );
}
