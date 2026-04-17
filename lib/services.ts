export type ServiceKind = "kombi" | "klima" | "beyaz-esya" | "endustriyel";

export const services: Array<{
  kind: ServiceKind;
  slug: string;
  label: string;
}> = [
  { kind: "kombi", slug: "kombi-servisi", label: "Kombi Servisi" },
  { kind: "klima", slug: "klima-servisi", label: "Klima Servisi" },
  { kind: "beyaz-esya", slug: "beyaz-esya-servisi", label: "Beyaz Eşya Servisi" },
  { kind: "endustriyel", slug: "kurumsal-cozumler", label: "Kurumsal Çözümler" }
];

export const serviceOfferings: Record<ServiceKind, Array<{ title: string; points: string[] }>> = {
  kombi: [
    { title: "Kombi Bakımı", points: ["Temizlik ve kontrol", "Yanma/performans kontrolü", "Sızdırmazlık", "Test ve teslim"] },
    { title: "Arıza Tespiti", points: ["Hata kodu analizi", "Elektronik/sensör kontrolü", "Parça seçenekleri", "Onay sonrası işlem"] },
    { title: "Petek Temizliği", points: ["Tesisat kontrolü", "Kimyasal/makine ile temizlik", "Verim artışı", "Dengeleme ve test"] }
  ],
  klima: [
    { title: "Klima Bakımı", points: ["Filtre/iç ünite temizliği", "Drenaj hattı kontrolü", "Koku ve hijyen", "Performans testi"] },
    { title: "Gaz / Kaçak", points: ["Kaçak kontrolü", "Basınç ölçümü", "Uygun gaz dolumu", "Son test"] },
    { title: "Montaj / Taşıma", points: ["Keşif", "Montaj planı", "Vakumlama", "Çalıştırma ve test"] }
  ],
  "beyaz-esya": [
    { title: "Çamaşır Makinesi", points: ["Su almıyor/boşaltmıyor", "Gürültü/titreşim", "Program arızası", "Temizlik/koku"] },
    { title: "Bulaşık Makinesi", points: ["Yıkamıyor", "Kurutma sorunu", "Su boşaltmıyor", "Sızdırma"] },
    { title: "Buzdolabı / Fırın", points: ["Soğutmuyor", "Aşırı buzlanma", "Isıtmıyor", "Termostat kontrolü"] }
  ],
  endustriyel: [
    { title: "Kurumsal Bakım", points: ["Periyodik kontrol", "Otel/Okul/AVM çözümleri", "Hızlı müdahale hattı", "Raporlama"] },
    { title: "Merkezi Sistemler", points: ["Kazan dairesi", "VRF/VRV Klima", "Endüstriyel mutfak", "Sözleşmeli servis"] }
  ]
};

export function serviceKindFromSlug(slug: string): ServiceKind | null {
  const found = services.find((s) => s.slug === slug);
  return found?.kind ?? null;
}

export function serviceLabelFromKind(kind: ServiceKind) {
  return services.find((s) => s.kind === kind)?.label ?? kind;
}
