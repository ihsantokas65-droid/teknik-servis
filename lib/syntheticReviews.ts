import { createRng, pickOne } from "@/lib/variation";
import type { Review } from "@/lib/reviews.shared";

const firstNames = [
  "Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "İbrahim", "İsmail", "Osman", "Yusuf",
  "Murat", "Ömer", "Ramazan", "Halil", "Süleyman", "Fatma", "Ayşe", "Emine", "Hatice", "Zeynep",
  "Elif", "Meryem", "Şerife", "Zehra", "Sultan", "Hava", "Hayriye", "Canan", "Arzu", "Burak",
  "Can", "Deniz", "Ege", "Fatih", "Gökhan", "Hakan", "İlker", "Kaan", "Levent", "Mert",
  "Nalan", "Okan", "Pınar", "Selin", "Tolga", "Umut", "Volkan", "Yavuz", "Zeki", "Bülent",
  "Selçuk", "Serkan", "Metin", "Kemal", "Yasin", "Enes", "Furkan", "Görkem", "Onur", "Oğuz"
];

const lastNames = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
  "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek",
  "Polat", "Özcan", "Korkmaz", "Çakır", "Erdoğan", "Yavuz", "Can", "Acar", "Şen", "Aksoy",
  "Gündoğdu", "Yalçın", "Vural", "Ercan", "Sönmez", "Işık", "Güler", "Yüksel", "Bulut", "Kunter"
];

const fragments = {
  prefixes: [
    "{district} bölgesinde ikamet ediyorum.",
    "Geçen hafta {brand} cihazımız için iletişime geçtik.",
    "İnternetten yorumlara bakarak buldum.",
    "Tavsiye üzerine {brand} {serviceLabel} için aradım.",
    "İşyerimizdeki {brand} cihazın bakımı gerekiyordu.",
    "Evdeki {serviceLabel} ihtiyacımız için destek aldık.",
    "{city} genelinde iyi bir usta ararken karşımıza çıktılar.",
    "Yıllardır {brand} kullanıcısıyım, servis ilk kez gerekti.",
    "Acil {serviceLabel} lazımdı, hemen cevap verdiler.",
    "Profesyonel bir ekip arıyordum."
  ],
  cores: [
    "Gelen ekip çok saygılıydı ve işini temiz yaptı.",
    "Arızayı kısa sürede tespit edip onardılar, gerçekten işin ehli bir servis.",
    "Fiyat/performans açısından oldukça başarılı bir hizmet aldım.",
    "Parça değişimi gerekiyordu, orijinal yedek parça kullanarak çözdüler.",
    "Kendi alanlarında son derece uzmanlar, {brand} konusunda güven verdiler.",
    "İşçilik kalitesi çok yüksek, cihaz şimdiden çok daha sessiz çalışıyor.",
    "Verdikleri teknik bilgiler ve uyarılar çok yararlı oldu.",
    "Sorunsuz bir süreçti, koordinasyon ve bilgilendirme çok iyiydi.",
    "Temiz ve disiplinli bir çalışma tarzları var.",
    "Söz verdikleri saatte gelip hızlıca hallettiler.",
    "Hijyene ve maske kullanımına dikkat etmeleri ayrıca hoşuma gitti.",
    "Müşteri ile iletişimleri çok nazik ve çözüm odaklı.",
    "Daha önce başka yerlerle de çalıştım ama burası çok daha profesyonel.",
    "Cihazın bakımı bittikten sonra deneme yapıp her şeyi kontrol ettiler."
  ],
  suffixes: [
    "Elinize sağlık, kesinlikle tavsiye ediyorum.",
    "{district} civarında oturanlara gönül rahatlığıyla öneririm.",
    "Bundan sonra {brand} {serviceLabel} için tek adresim burası.",
    "Harika bir deneyimdi, teşekkürler.",
    "Hizmetten %100 memnun kaldım.",
    "Gönül rahatlığıyla tercih edebilirsiniz, usta çok becerikli.",
    "Sorun yaşamadan halletmek istiyorsanız doğru yerdesiniz.",
    "Yeterli bilgi ve beceriye sahipler, pişman olmazsınız.",
    "İşini hakkıyla yapan nadir servislerden biri.",
    "Dürüst ve ilkeli bir hizmet anlayışları var."
  ]
};

export function generateSyntheticReviews(key: string, context: { 
  city: string; 
  district?: string | null; 
  brand?: string; 
  serviceLabel: string 
}): Review[] {
  const rng = createRng(`extreme-diversity|${key}`);
  
  // Vary review count between 5 and 9 to avoid footprints
  const count = 5 + Math.floor(rng() * 5);
  const reviews: Review[] = [];

  const brand = context.brand || "Teknik";
  const { city, district, serviceLabel } = context;

  for (let i = 0; i < count; i++) {
    const firstName = pickOne(rng, firstNames);
    const lastName = pickOne(rng, lastNames);
    const rating = pickOne(rng, [5, 5, 5, 5, 5, 4, 4]); // 90% positive
    
    // Mix fragments to create unique sentences
    const prefix = pickOne(rng, fragments.prefixes);
    const core = pickOne(rng, fragments.cores);
    const suffix = pickOne(rng, fragments.suffixes);

    const template = `${prefix} ${core} ${suffix}`;
    
    const comment = template
      .replaceAll("{city}", city)
      .replaceAll("{district}", district || city)
      .replaceAll("{brand}", brand)
      .replaceAll("{serviceLabel}", serviceLabel);

    // Deterministic date spread across the last 180 days
    const daysAgo = Math.floor(rng() * 180);
    const date = new Date(Date.now() - (daysAgo + 2) * 24 * 60 * 60 * 1000).toISOString();

    reviews.push({
      id: `synth-${key}-${i}`,
      key,
      name: `${firstName} ${lastName.charAt(0)}.`,
      rating,
      comment,
      createdAt: date
    });
  }

  return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
