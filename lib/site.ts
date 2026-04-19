export type SiteConfig = {
  name: string; // site title (template)
  businessName: string; // görünen işletme adı
  description: string;
  url: string;
  locale: string;
  phone: string;
  whatsapp: string;
  email: string;
  workingHours: string;
  priceRange: string;
  warrantyText: string;
  trustSignals: string[];
  metrics?: Array<{
    value: string;
    label: string;
  }>;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  corporate: {
    legalName: string;
    taxOffice: string;
    taxNumber: string;
    mersisNumber: string;
    sicilNo: string;
    chamber: string;
  };
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://www.yetkilikombiservisi.tr";

export const site: SiteConfig = {
  name: "Yetkili Kombi Servisi",
  businessName: "Yetkili Kombi Servisi",
  description:
    "Yetkili Kombi Servisi ile kombi, klima ve beyaz eşya için bağımsız özel servis, bakım, onarım ve arıza çözümleri. 81 il ve ilçe bazlı yönlendirme, hızlı randevu ve şeffaf süreç.",
  url: siteUrl,
  locale: "tr-TR",
  phone: "0541 658 11 03",
  whatsapp: "+905416581103",
  email: "servis@yetkilikombiservisi.tr",
  workingHours: "Pzt - Cmt 09:00 - 18:00",
  priceRange: "₺₺",
  warrantyText: "İşçilik garantisi",
  trustSignals: ["Uzman teknisyen", "Şeffaf bilgilendirme", "Yerinde servis", "Test ve teslim"],
  metrics: [
    { value: "81 il", label: "Hizmet Ağı" },
    { value: "15.000+", label: "Mutlu Müşteri" },
    { value: "10+ yıl", label: "Sektör Tecrübesi" },
    { value: "7/24", label: "Kayıt Merkezi" }
  ],
  aggregateRating: { ratingValue: 4.8, reviewCount: 942 },
  address: {
    street: "Alipaşa Mahallesi Suvaroğlu Caddesi no:6",
    city: "Van",
    region: "Van",
    postalCode: "65130",
    country: "TR"
  },
  corporate: {
    legalName: "Yetkili Kombi Servisi Dayanıklı Tüketim Malları Elektronik Eşya Ticaret Ve Sanayi Limited Şirketi",
    taxOffice: "Van Vergi Dairesi",
    taxNumber: "0000000000",
    mersisNumber: "0000000000000001",
    sicilNo: "000000",
    chamber: "Van Ticaret ve Sanayi Odası"
  }
};
