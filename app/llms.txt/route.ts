import { NextResponse } from "next/server";

export async function GET() {
  const content = `# SERVİS UZMANI - LLM Rehberi (llms.txt)

Bu dosya, SERVİS UZMANI web sitesinin yapısını, hizmetlerini, kapsama alanını ve marka dilini LLM'lerin (Büyük Dil Modelleri) anlaması için özetler.

---

## 1. Genel Bilgiler

### Site Adı
SERVİS UZMANI

### Slogan / Amaç
Türkiye genelinde 81 ilde beyaz eşya, kombi ve klima cihazları için şeffaf, hızlı ve güvenilir teknik servis yönlendirme platformu.

### İşletme Modeli
SERVİS UZMANI, marka bağımsız bir servis sağlayıcısıdır. Yetkili servis değildir; ancak geniş bir marka yelpazesinde (Arçelik, Bosch, Vaillant vb.) uzman teknik destek ve yerinde servis hizmeti sunar.

### Hedef Kitle
- Türkiye genelinde ikamet eden ev sahipleri.
- Cihaz arızası (kombi, klima, beyaz eşya) yaşayan kullanıcılar.
- Periyodik bakım ve verimlilik kontrolü isteyen cihaz sahipleri.

---

## 2. Hizmet Kapsamı

### Ana Kategoriler
1.  **Beyaz Eşya Servisi:** Çamaşır makinesi, bulaşık makinesi, buzdolabı, fırın, ocak.
2.  **Kombi Servisi:** Arıza tespiti, yıllık bakım, petek temizliği, parça değişimi.
3.  **Klima Servisi:** Bakım, gaz dolumu, montaj/demontaj ve onarım.

### Öne Çıkan Özellikler
- **81 İl Ağı:** Türkiye'nin tüm illerinde ilçe bazlı servis sayfaları.
- **Şeffaf Süreç:** Kayıt -> Randevu -> Tespit -> Onay -> İşlem adımları.
- **Yerinde Servis:** Cihaz taşımadan, yerinde kontrol ve tamir.
- **Garantili İşçilik:** Yapılan işlemler için teknik destek ve parça garantisi.

---

## 3. Navigasyon ve URL Yapısı

### Ana Sayfalar
- **Ana Sayfa:** /
- **Hakkımızda:** /hakkimizda
- **Hizmetler:** /hizmetler
- **Servis Ücretleri:** /servis-ucretleri
- **Markalar:** /markalar
- **Servis Bölgeleri:** /servis-bolgeleri
- **Site Haritası:** /sitemap
- **İletişim:** /iletisim
- **RSS Akışı:** /feed

### Dinamik Yapı (Programmatik SEO)
Sitemiz binlerce dinamik sayfadan oluşur:
- **İl Sayfası:** /[city]
- **İlçe Sayfası:** /[city]/[district]
- **Hizmet Sayfası:** /[city]/[district]/[service-slug]
- **Marka Sayfası:** /marka/[brand-slug]
- **Marka-Hizmet Sayfası:** /marka/[brand-slug]/[service-slug]

---

## 4. Marka Dili ve Tonu

- **Profesyonel ve Güven Verici:** Teknik konularda net bilgi verir, belirsizlikten kaçınır.
- **Şeffaf:** Fiyatlandırma ve süreç hakkında müşteriyi önceden bilgilendirmeye odaklanır.
- **Kullanıcı Odaklı:** "Siz" dilini kullanır, sorun giderme odaklıdır.
- **Ciddiyet:** Gaz kaçağı veya elektrik arızası gibi durumlarda güvenlik uyarılarını ön plana çıkarır.

---

## 5. İletişim Bilgileri

- **Merkez Adres:** Alipaşa Mahallesi Suvaroğlu Caddesi no:6 65130 Van Merkez Van
- **Telefon/WhatsApp:** +90 541 658 11 03
- **E-posta:** info@yetkilikombiservisi.tr
- **Çalışma Saatleri:** Pazartesi - Cumartesi (09:00 - 18:00)

---

## 6. Teknik Bilgiler

- **Teknoloji:** Next.js (App Router), TypeScript, Tailwind CSS.
- **SEO:** JSON-LD şemaları (LocalBusiness, FAQ, Breadcrumb), dinamik metadata ve 81 il bazlı programmatik yapı.
- **Performans:** 100/100 PageSpeed hedefli, optimize edilmiş Next/Image ve Next/Font kullanımı.

---
*Son Güncelleme: Nisan 2026*
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
    },
  });
}
