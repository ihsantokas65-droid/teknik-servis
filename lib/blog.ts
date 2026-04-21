import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";
import { createRng, pickManyUnique, pickOne } from "@/lib/variation";
import { blogSlugFromIndex } from "@/lib/blogSlugs";
import { technicalInsights } from "@/lib/semantics";
import fs from "fs";
import path from "path";

export type BlogCategory = "kombi" | "klima" | "beyaz-esya" | "endustriyel" | "genel";

export type BlogArticle = {
  slug: string;
  category: BlogCategory;
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  wordCount: number;
  readingMinutes: number;
  sections: Array<{ h2: string; paragraphs: string[]; bullets?: string[] }>;
  faqs: Array<{ q: string; a: string }>;
  relatedSlugs: string[];
  jsonLd: Record<string, unknown>;
  expertNote?: { title: string; content: string };
  peopleAlsoAsk?: Array<{ question: string; answer: string }>;
};

export const categoryMeta: Record<BlogCategory, { label: string; plural: string }> = {
  kombi: { label: "Kombi", plural: "Kombi" },
  klima: { label: "Klima", plural: "Klima" },
  "beyaz-esya": { label: "Beyaz Eşya", plural: "Beyaz Eşya" },
  endustriyel: { label: "Kurumsal", plural: "Kurumsal Çözümler" },
  genel: { label: "Teknik Servis Rehberi", plural: "Rehberler" }
};

const topicPool: Record<BlogCategory, string[]> = {
  kombi: [
    "kombi-basinc-dusuyor-neden",
    "kombi-petekler-isinmiyor-cozum",
    "kombi-sicak-su-dalgalaniyor",
    "kombi-hata-kodu-ne-demek",
    "kombi-bakimi-ne-zaman-yapilir",
    "kombi-su-eksiltiyor-neden",
    "kombi-atesleme-yapmiyor",
    "kombi-gurultulu-calisiyor",
    "petek-temizligi-neden-gerekli",
    "kombi-oda-termostati-nasil-kullanilir"
  ],
  klima: [
    "klima-sogutmuyor-neden",
    "klima-isitmiyor-neden",
    "klima-su-akitiyor-cozum",
    "klima-koku-yapiyor-neden",
    "klima-filtre-temizligi-nasil-yapilir",
    "klima-gaz-bitti-mi-nasil-anlasilir",
    "klima-dis-unite-ses-yapiyor",
    "klima-periyodik-bakim-ne-ise-yarar",
    "klima-enerji-tasarrufu-ipuclari",
    "klima-uzaktan-kumanda-ayarlari"
  ],
  "beyaz-esya": [
    "camasir-makinesi-su-almiyor",
    "camasir-makinesi-suyu-bosaltmiyor",
    "bulasik-makinesi-temiz-yikamiyor",
    "buzdolabi-sogutmuyor-neden",
    "buzdolabi-asiri-buzlaniyor",
    "firin-isitmiyor-neden",
    "kurutma-makinesi-kurutmuyor",
    "beyaz-esya-bakimi-ne-zaman",
    "beyaz-esya-koku-sorunu",
    "beyaz-esya-gurultu-titreme"
  ],
  endustriyel: [
    "kurumsal-periyodik-bakim-onemi",
    "merkezi-klima-sistem-verimi",
    "kazan-dairesi-bakim-rehberi",
    "vrf-vrv-klima-farklari"
  ],
  genel: [
    "servis-ucretleri-2026",
    "teknik-servis-fisi-onemi",
    "enerji-sinifi-yeni-sistem",
    "ikinci-el-beyaz-esya-rehberi"
  ]
};


function normalizeSlug(input: string) {
  return String(input).trim().replace(/^\/+|\/+$/g, "");
}

export function parseBlogSlug(slug: string): { category: BlogCategory; topic: string } | null {
  const s = normalizeSlug(slug);
  if (!s) return null;

  const parts = s.split("-");
  const prefix = parts[0];
  if (prefix === "kombi") return { category: "kombi", topic: s };
  if (prefix === "klima") return { category: "klima", topic: s };
  if (prefix === "beyaz" || prefix === "beyaz-esya") return { category: "beyaz-esya", topic: s };
  if (prefix === "kurumsal" || prefix === "endustriyel") return { category: "endustriyel", topic: s };
  if (prefix === "genel" || prefix === "servis" || prefix === "rehber") return { category: "genel", topic: s };

  // fallback: if not prefixed, infer by seed (keeps route tolerant)
  const rng = createRng(`blog|${s}`);
  const cat = pickOne(rng, ["kombi", "klima", "beyaz-esya", "endustriyel", "genel"] as const);
  return { category: cat, topic: s };
}

function humanizeTopic(topicSlug: string) {
  const parts = topicSlug.split("-");
  // Remove category prefix if it exists
  if (["kombi", "klima", "beyaz", "beyaz-esya", "endustriyel", "genel"].includes(parts[0])) {
    parts.shift();
    if (topicSlug.startsWith("beyaz-esya")) parts.shift();
  }
  // Remove technical numeric code at the end
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (last.length <= 3 && /^[0-9a-z]+$/.test(last)) {
      parts.pop();
    }
  }

  // Proper Turkish labels for problems
  const problemMap: Record<string, string> = {
    "basinc-dusuyor": "Basınç Düşüyor",
    "petekler-isinmiyor": "Petekler Isınmıyor",
    "sicak-su-dalgalaniyor": "Sıcak Su Dalgalanıyor",
    "atesleme-yapmiyor": "Ateşleme Yapmıyor",
    "gurultulu-calisiyor": "Gürültülü Çalışıyor",
    "su-eksiltiyor": "Su Eksiltiyor",
    "hata-kodu-veriyor": "Hata Kodu Veriyor",
    "suyu-isitmiyor": "Suyu Isıtmıyor",
    "kendini-kapatiyor": "Kendini Kapatıyor",
    "petek-temizligi": "Petek Temizliği",
    "sogutmuyor": "Soğutmuyor",
    "isitmiyor": "Isıtmıyor",
    "su-akitiyor": "Su Akıtıyor",
    "koku-yapiyor": "Kötü Koku Yapıyor",
    "ses-yapiyor": "Gürültü Yapıyor",
    "gaz-bitti-mi": "Gaz Bitti mi?",
    "filtre-temizligi": "Filtre Temizliği",
    "dis-unite-sorunlari": "Dış Ünite Sorunları",
    "enerji-tuketimi": "Enerji Tüketimi",
    "kumanda-ayarlari": "Kumanda Ayarları",
    "camasir-su-almiyor": "Çamaşır Makinesi Su Almıyor",
    "camasir-su-bosaltmiyor": "Çamaşır Makinesi Su Boşaltmıyor",
    "bulasik-temiz-yikamiyor": "Bulaşık Makinesi Temiz Yıkamıyor",
    "buzdolabi-sogutmuyor": "Buzdolabı Soğutmuyor",
    "buzdolabi-buzlaniyor": "Buzdolabı Buzlanıyor",
    "firin-isitmiyor": "Fırın Isıtmıyor",
    "kurutma-kurutmuyor": "Kurutma Makinesi Kurutmuyor",
    "gurultu-titreme": "Gürültü ve Titreme",
    "koku-sorunu": "Koku Sorunu",
    "programda-takiliyor": "Programda Takılıyor",
    // Yeni Kombi Eklemeleri
    "sicak-su-vermiyor": "Sıcak Su Vermiyor",
    "en-az-yakan-markalar": "En Az Yakan Kombi Markaları 2026",
    "f1-ariza-kodu-cozumu": "F1 Arıza Kodu Kesin Çözümü",
    "bakimi-yapilmazsa": "Kombi Bakımı Yapılmazsa Ne Olur?",
    "petek-alti-soguk": "Peteklerin Altı Soğuk Üstü Sıcak Neden?",
    "patlamali-yaniyor": "Kombi Patlamalı Yanıyor",
    "oda-termostati-tasarruf": "Oda Termostatı Tasarrufu",
    "devirdaim-pompasi-arizasi": "Devirdaim Pompası Arızası",
    "anakart-tamiri": "Anakart Tamiri mi Değişimi mi?",
    "genleşme-tanki-havasi": "Genleşme Tankı Havası Kaç Bar Olmalı?",
    "su-sizdiriyor": "Kombi Su Sızdırıyor",
    "fan-motoru-temizligi": "Fan Motoru Temizliği ve Yağlanması",
    "ntc-sensor-arizasi": "NTC Sensör Arızası Belirtileri",
    "uc-yollu-vana-arizasi": "Üç Yollu Vana Arızası Testi",
    "gece-kapatmak-tasarruf": "Gece Kombiyi Kapatmak Tasarruf Sağlar mı?",
    "kis-ayari-derecesi": "Kışın Kombi Derecesi Kaç Olmalı?",
    "yerden-isitma-ayari": "Yerden Isıtma Kombi Ayarı",
    "baca-sensoru-hatasi": "Baca Sensörü Neden Hata Verir?",
    "gaz-valfi-arizasi": "Gaz Valfi Arızası Tamiri",
    "su-basma-vanasi-sikisti": "Su Basma Vanası Sıkıştı",
    "hermetik-su-akitir": "Hermetik Kombi Neden Su Akıtır?",
    "yogusma-gideri-tikandi": "Yoğuşma Gideri Tıkandığında Ne Olur?",
    "eca-ariza-kodlari": "ECA Kombi Arıza Kodları",
    "demirdokum-resetleme": "DemirDöküm Resetleme Nasıl Yapılır?",
    "bosch-c6-hatasi": "Bosch C6 Hatası Çözümü",
    "vaillant-f28-arizasi": "Vaillant F28 Arızası",
    "buderus-6a-hatasi": "Buderus 6A Hatası",
    "viessmann-f4-arizasi": "Viessmann F4 Arızası",
    "baymak-e01-hatasi": "Baymak E01 Hatası",
    // Yeni Klima Eklemeleri
    "gaz-dolumu-fiyatlari": "Klima Gaz Dolumu Fiyatları 2026",
    "ic-unite-su-akitir": "İç Üniteden Su Akıtıyor Çözümü",
    "koku-giderme": "Klimadan Gelen Kötü Koku Giderme",
    "kumanda-soguk-ayari": "Klima Kumandası Soğuk Ayarı",
    "inverter-tasarrufu": "İnverter Klima Tasarrufu",
    "dis-unite-gurultu": "Dış Ünite Neden Gürültülü?",
    "BTU-hesabi": "Klima BTU Hesabı",
    "gaz-bittigi-nasil-anlasilir": "Klima Gazı Bittiği Nasıl Anlaşılır?",
    "kart-arizasi": "Klima Kart Arızası Belirtileri",
    "kompresor-devreye-girmiyor": "Kompresör Neden Devreye Girmiyor?",
    "kumanda-calismiyor": "Klima Kumandası Çalışmıyor",
    "kendi-kendine-kapaniyor": "Klima Kendi Kendine Kapanıyor",
    "ch-38-ariza-kodu": "CH 38 Arıza Kodu Çözümü",
    "mobil-klima-elektrik": "Mobil Klima Elektrik Tüketimi",
    "salon-tipi-vs-duvar-tipi": "Salon Tipi vs Duvar Tipi Klima",
    "bakim-saglik-zararlari": "Bakımsız Klimanın Sağlığa Zararları",
    // Yeni Beyaz Eşya Eklemeleri
    "buzdolabi-motoru-yanar": "Buzdolabı Motoru Neden Yanar?",
    "buzdolabi-kapi-lastigi": "Buzdolabı Kapı Lastiği Yapışmıyor",
    "no-frost-kanal-tikanikligi": "No-Frost Kanal Tıkanıklığı Açma",
    "camasir-sikma-yapmiyor": "Çamaşır Makinesi Sıkma Yapmıyor",
    "camasir-sallaniyor-yuruyor": "Makine Neden Sallanıyor ve Yürüyor?",
    "camasir-filtre-temizligi": "Çamaşır Makinesi Filtre Temizliği",
    "camasir-deterjan-almiyor": "Makine Neden Deterjan Almıyor?",
    "camasir-kazan-donmuoyr": "Kazan Dönmüyor, Motor Kömürü mü Bitti?",
    "camasir-koruk-lastigi": "Körük Lastiği Değişimi",
    "bulasik-tablet-eritmiyor": "Bulaşık Makinesi Tableti Eritmiyor",
    "bulasik-bardak-ciziyor": "Bulaşık Makinesi Bardakları Çiziyor",
    "bulasik-su-aliyor-baslamiyor": "Su Alıyor Ama Başlamıyor",
    "bulasik-tuz-parlatici-nereye": "Tuz ve Parlatıcı Nereye Konur?",
    "firin-alti-pisirmiyor": "Fırın Neden Altını Pişirmiyor?",
    "ocak-ateslemiyor": "Ocak Neden Ateşlemiyor?",
    "aspirator-cekis-gucu": "Aspiratör Çekiş Gücü Arttırma",
    "bosch-e18-hatasi": "Bosch E18 Hatası Çözümü",
    "arcelik-e01-arizasi": "Arçelik E01 Arızası",
    "samsung-4e-hatasi": "Samsung 4E Hatası",
    "vestel-e02-arizasi": "Vestel E02 Arızası",
    // Genel / Fiyat / Rehber Eklemeleri
    "servis-ucretleri-2026": "2026 Beyaz Eşya Tamir Servis Ücretleri",
    "van-kombi-servisi-guvenilir": "Van Kombi Servisi: En Güvenilir Firmalar",
    "van-merkez-klima-montaj": "Van Merkez Klima Montaj Fiyatları",
    "ikinci-el-alirken-dikkat": "İkinci El Beyaz Eşya Alırken Dikkat Edilecekler",
    "teknik-servis-fisi-onemi": "Teknik Servis Fişi Almanın Önemi",
    "garanti-rehberi": "Garanti Kapsamındaki Cihazlar Rehberi",
    "enerji-sinifi-yeni-sistem": "Beyaz Eşya Yeni Enerji Sınıfı Sistemi",
    "buzdolabi-motor-degisimi-fiyat": "Buzdolabı Motor Değişimi Kaç TL?",
    "kombi-kart-tamiri-guvenli-mi": "Kombi Kart Tamiri Güvenli mi?",
    "klima-sokme-takma-ucreti": "Klima Sökme Takma Ücreti",
    "en-iyi-kombi-markasi": "En İyi Kombi Markası Hangisi?",
    "akilli-ev-klima-uyumu": "Akıllı Ev Sistemleri Klima Uyumu",
    "robot-supurge-pil-omru": "Robot Süpürge Pil Ömrü Uzatma",
    "mikrodalga-radyasyon-yayarmı": "Mikrodalga Radyasyon Yayar mı?",
    "hava-temizleyici-filter-degisimi": "Hava Temizleyici Filtre Değişimi",
    "kurutma-makinesi-camasir-cekermi": "Kurutma Makinesi Çamaşır Çeker mi?",
    "termosifon-vs-kombi": "Termosifon mu Kombi mi?",
    "ani-su-isiticı-elektrik": "Ani Su Isıtıcı Elektrik Tüketimi",
    "derin-dondurucu-derecesi": "Derin Dondurucu Yazın Kaç Derece Olmalı?",
    "tamir-mi-yeni-cihaz-mi": "Tamir mi Ettirmeli Yeni mi Almalı?"
  };

  // Common intent mappings for better grammar
  const intentMap: Record<string, string> = {
    "neden-olur": "Neden Olur?",
    "cozumu": "Çözümü ve Tamiri",
    "ne-yapmali": "Ne Yapmalı?",
    "tamiri": "Nasıl Tamir Edilir?",
    "bakimi": "Bakımı Nasıl Yapılır?",
    "ipuclari": "Hakkında İpuçları",
    "rehber": "Kullanım Rehberi",
    "sss": "Sık Sorulan Sorular",
    "hata-kodu": "Hata Kodu Çözümü",
    "kontrol-listesi": "Kontrol Listesi"
  };

  // Common scenario mappings
  const scenarioMap: Record<string, string> = {
    "evde": "(Evde Çözüm)",
    "kistan-once": "(Kış Öncesi)",
    "yaz-oncesi": "(Yaz Öncesi)",
    "tasarruf-icin": "(Tasarruf İpuçları)",
    "acil": "(Acil Durum)",
    "ilk-defa": "(İlk Kullanım)",
    "tekrar-ediyorsa": "(Tekrarlayan Arıza)",
    "garanti-sonrasi": "(Garanti Sonrası)",
    "yeni-cihaz": "(Yeni Cihaz)",
    "eski-cihaz": "(Eski Cihaz)"
  };

  // Try to find matching whole segments first
  const joinedParts = parts.join("-");
  let mainProblem = "";
  for (const [key, val] of Object.entries(problemMap)) {
    if (joinedParts.includes(key)) {
      mainProblem = val;
      break;
    }
  }

  const finalParts: string[] = [];
  if (mainProblem) {
    finalParts.push(mainProblem);
  } else {
    // fallback if no map matches exactly (should not happen with standard slugs)
    finalParts.push(parts[0].replaceAll("-", " "));
  }

  // Add intent if found in slug
  for (const p of parts) {
    if (intentMap[p]) finalParts.push(intentMap[p]);
    if (scenarioMap[p]) finalParts.push(scenarioMap[p]);
  }

  const s = finalParts.join(" ");
  return s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);
}

function estimateWordCount(text: string) {
  return text
    .replace(/[\u2019’]/g, "'")
    .split(/\s+/g)
    .map((x) => x.trim())
    .filter(Boolean).length;
}

function joinArticle(sections: BlogArticle["sections"], faqs: BlogArticle["faqs"]) {
  const text = sections
    .flatMap((s) => [s.h2, ...s.paragraphs, ...(s.bullets ?? [])])
    .concat(faqs.flatMap((f) => [f.q, f.a]))
    .join(" ");
  return estimateWordCount(text);
}

function readingMinutesFromWords(words: number) {
  return Math.max(2, Math.round(words / 200));
}

type TopicClass =
  | "pressure"
  | "hot-water"
  | "maintenance"
  | "cooling"
  | "airflow"
  | "laundry-drain"
  | "dishwash"
  | "fridge"
  | "general-guide"
  | "industrial";

function hasAny(source: string, parts: string[]) {
  return parts.some((part) => source.includes(part));
}

function classifyTopic(category: BlogCategory, topic: string): TopicClass {
  const slug = topic.toLocaleLowerCase("tr-TR");
  if (category === "endustriyel") return "industrial";
  if (hasAny(slug, ["basinc-dusuyor", "su-eksiltiyor", "su-sizdiriyor", "genlesme-tanki", "vana", "pompa", "tesisat"])) return "pressure";
  if (hasAny(slug, ["sicak-su", "atesleme", "suyu-isitmiyor", "su-isitmiyor", "gaz-valfi", "ntc", "f28", "f1", "e01", "4e"])) return "hot-water";
  if (hasAny(slug, ["bakim", "temizlik", "filtre", "petek", "kontrol-listesi", "oda-termostati", "kis-ayari", "yaz-oncesi", "kistan-once"])) return "maintenance";
  if (hasAny(slug, ["sogutmuyor", "isitmiyor", "gaz", "kompresor", "inverter", "btu", "kapi-lastigi"])) return "cooling";
  if (hasAny(slug, ["koku", "su-akitiyor", "dis-unite", "ic-unite", "ses-yapiyor", "gurultu", "fan", "kumanda"])) return "airflow";
  if (hasAny(slug, ["camasir", "kurutma", "sikma", "deterjan", "rulman", "amortisor", "kazan"])) return "laundry-drain";
  if (hasAny(slug, ["bulasik", "yikamiyor", "tablet", "tuz", "parlatici"])) return "dishwash";
  if (hasAny(slug, ["buzdolabi", "buzlaniyor", "no-frost", "firin", "ocak", "aspirator", "derin-dondurucu"])) return "fridge";
  return "general-guide";
}

function buildTopicHints(category: BlogCategory, topic: string, q: string) {
  const topicClass = classifyTopic(category, topic);
  const focusLabelByClass: Record<TopicClass, string> = {
    pressure: "basınç ve kaçak dengesi",
    "hot-water": "ateşleme ve sıcak su akışı",
    maintenance: "periyodik bakım",
    cooling: "soğutma performansı",
    airflow: "hava akışı ve drenaj",
    "laundry-drain": "su alma ve tahliye",
    dishwash: "yıkama ve kurutma",
    fridge: "soğutma ve buzlanma",
    "general-guide": "genel teknik değerlendirme",
    industrial: "kurumsal operasyon"
  };

  const openingByClass: Record<TopicClass, string> = {
    pressure: `${q} çoğu zaman tek bir parçadan değil, bütün basınç zincirinden okunmalıdır.`,
    "hot-water": `${q} başlığı, ateşleme ve ısı transferi tarafındaki küçük bir aksaklığın görünür hale gelmiş halidir.`,
    maintenance: `${q}, cihazın bugününü değil yarınını da etkileyen bakım alışkanlıklarını anlatır.`,
    cooling: `${q} sorunu, soğutma devresindeki denge bozulduğunda kendini net biçimde gösterir.`,
    airflow: `${q}, hava hareketi ve drenaj tarafındaki bir iznin kullanıcıya yansıyan halidir.`,
    "laundry-drain": `${q} çoğu zaman su, yük ve mekanik denge tarafını birlikte sorgulamayı gerektirir.`,
    dishwash: `${q} yıkama kalitesinin hangi aşamada kırıldığını anlamakla çözülür.`,
    fridge: `${q} görünüşte tek bir belirtidir ama arka planda birden fazla dengeyi işaret eder.`,
    "general-guide": `${q} için en faydalı başlangıç, belirtiyi doğru sınıflandırmaktır.`,
    industrial: `${q} kurumsal sistemlerde süreklilik ve planlama açısından okunmalıdır.`
  };

  const practicalByClass: Record<TopicClass, string> = {
    pressure: "Basınç göstergesini, vanaları ve gözle görülen sızıntı izlerini birlikte kontrol etmek ilk adımdır.",
    "hot-water": "Mod, sıcaklık ve tekrar eden hata davranışını not etmek hızlı ayrım sağlar.",
    maintenance: "Filtre, hava akışı ve kullanım yoğunluğu bakım planının temelini oluşturur.",
    cooling: "Filtre temizliği, hava çıkışı ve dış ünite tarafı birlikte değerlendirilmelidir.",
    airflow: "Koku, ses ve su izi aynı anda gözlenirse kaynak daralır.",
    "laundry-drain": "Su alma, tahliye ve titreşim davranışı birlikte okunmalıdır.",
    dishwash: "Filtre, püskürtme delikleri ve kurutma aşaması aynı tabloda görülmelidir.",
    fridge: "Kapı fitili, buzlanma ve arka panel temizliği ilk bakışta çok şey söyler.",
    "general-guide": "Belirtiyi tek başına değil, davranış zinciriyle birlikte okumak gerekir.",
    industrial: "Hat, yük ve kayıt akışını birlikte görmek gerekir."
  };

  const serviceTriggerByClass: Record<TopicClass, string> = {
    pressure: "Basınç düşüşü kısa aralıklarla tekrar ediyorsa servis çağırmak daha doğrudur.",
    "hot-water": "Sıcak su dalgalanması ve ateşleme uyarıları bir araya geliyorsa profesyonel kontrol gerekir.",
    maintenance: "Bakım aralığı gecikmişse veya cihaz performansı düşmüşse servis zamanı gelmiştir.",
    cooling: "Soğutma belirgin biçimde düştüyse ve tekrar eden çalışma davranışı varsa servis gerekir.",
    airflow: "Koku veya ses kısa süre içinde tekrar ediyorsa kalıcı çözüm için servis gerekir.",
    "laundry-drain": "Yük, denge veya tahliye sorunları tekrar ediyorsa uzman kontrolüne geçmek gerekir.",
    dishwash: "Yıkama kalitesi ve kurutma birlikte bozulduysa servis kaçınılmazdır.",
    fridge: "Soğutma kaybı veya yoğun buzlanma kalıcılaşıyorsa teknik destek gerekir.",
    industrial: "Operasyon kesintisi tekrar ediyorsa planlı saha servisi gerekir.",
    "general-guide": "Sorun tekrar ediyorsa uzman gözlemi daha doğru olur."
  };

  const maintenanceByClass: Record<TopicClass, string> = {
    pressure: "Basınç takibi ve tesisat kontrolü tekrarları azaltır.",
    "hot-water": "Ateşleme ve sensör tarafını periyodik gözlemlemek tekrar riskini azaltır.",
    maintenance: "Düzenli bakım, performansın düşmesini yavaşlatır.",
    cooling: "Yaz öncesi kontrol, soğutma kaybını azaltmanın en pratik yoludur.",
    airflow: "Filtre ve drenaj temizliği koku/ses tarafında fark yaratır.",
    "laundry-drain": "Denge, temiz filtre ve doğru yükleme alışkanlığı önemli fark yaratır.",
    dishwash: "Kireç ve filtre bakımı yıkama performansını korur.",
    fridge: "Fitil ve arka panel temizliği soğutma yükünü azaltır.",
    industrial: "Planlı bakım, kesinti maliyetini düşürür.",
    "general-guide": "Doğru bakım rutini tekrar eden sorunları azaltır."
  };

  const warningByClass: Record<TopicClass, string> = {
    pressure: "Gaz kokusu, belirgin su kaçağı veya sürekli düşen basınç durumunda evde kurcalamak yerine destek almak gerekir.",
    "hot-water": "Ateşleme ve kart tarafına doğrudan müdahale güvenlik riski doğurur.",
    maintenance: "Bakımı geciktirmek performansı yavaş yavaş düşürür; sorun bir anda büyümüş gibi görünür.",
    cooling: "Yanlış gaz işlemi kompresöre zarar verebilir.",
    airflow: "Filtreyi temizlemek güvenli olabilir, ama iç mekanik alanı rastgele açmak doğru değildir.",
    "laundry-drain": "Elektrik ve su birlikte çalıştığı için kontrol sınırı önemlidir.",
    dishwash: "Pompa ve elektronik kısım kullanıcı müdahalesi için uygun alanlar değildir.",
    fridge: "Soğutma devresini kurcalamak yerine önce güvenli kontrollerle ilerlemek gerekir.",
    industrial: "Kurumsal sistemlerde plansız müdahale zincir etkisi yaratabilir.",
    "general-guide": "Güvenlik sınırını aşan müdahaleleri uzmana bırakmak en doğrusudur."
  };

  const titleOptionsByClass: Record<TopicClass, string[]> = {
    pressure: [`${q} | Basınç ve Kaçak Analizi`, `${q} - Tesisat Dengesini Anlama Rehberi`, `${q} için Net Teknik Özet`],
    "hot-water": [`${q} | Ateşleme ve Sıcak Su Rehberi`, `${q} - Isıtma Zincirini Doğru Okuma`, `${q} için Uygulamalı Teknik Bakış`],
    maintenance: [`${q} | Bakım Planı ve Kontrol Listesi`, `${q} - Periyodik Bakımda Neye Bakılır?`, `${q} için Uygulamalı Özet`],
    cooling: [`${q} | Soğutma Performansı Rehberi`, `${q} - Gaz, Akış ve Kompresör Dengesi`, `${q} için Teknik Bakış`],
    airflow: [`${q} | Koku, Ses ve Akış Sorunları`, `${q} - Hava Akışı ve Drenajı Doğru Okuma`, `${q} için Pratik Çözüm Haritası`],
    "laundry-drain": [`${q} | Su, Tahliye ve Denge Rehberi`, `${q} - Çamaşır Makinesi Sorunlarını Ayırma`, `${q} için Adım Adım Bakış`],
    dishwash: [`${q} | Yıkama, Pompa ve Kurutma Rehberi`, `${q} - Bulaşık Makinesinde Sorun Ayıklama`, `${q} için Teknik Özet`],
    fridge: [`${q} | Soğutma, Buzlanma ve Isı Dengesi`, `${q} - Beyaz Eşyada Sık Görülen Arızalar`, `${q} için Uygulamalı Teknik Özet`],
    "general-guide": [`${q} | Teknik Servis Rehberi`, `${q} - Uzmanların Dikkat Ettiği Noktalar`, `${q} için Genel Teknik Destek`],
    industrial: [`${q} | Kurumsal Sistemler İçin Rehber`, `${q} - Merkezi Sistemlerde Kontrol Mantığı`, `Kurumsal Teknik Rehber: ${q}`]
  };

  const descriptionByClass: Record<TopicClass, string[]> = {
    pressure: [
      `${q} belirtilerinde asıl soru genelde basıncın neden düştüğü ve hangi noktada kaçak ihtimalinin güçlendiğidir.`,
      `${q} için şeffaf, güvenli ve tekrar etmeyen bir kontrol akışı arıyorsanız bu rehber iyi bir başlangıçtır.`
    ],
    "hot-water": [
      `${q} sorunu çoğu zaman ateşleme, sensör veya su ısıtma zincirindeki küçük bir aksaklıkla başlar.`,
      `${q} başlığı altında aynı görünen ama farklı kök nedenlerden çıkan arızaları sade bir dille özetledik.`
    ],
    maintenance: [
      `${q} gibi bakım başlıklarında amaç yalnızca temizlik değil, performansı koruyan doğru sıralamayı kurmaktır.`,
      `${q} hakkında kısa, uygulanabilir ve yinelenebilir bir bakım planı arıyorsanız, bu içerik pratik odaklıdır.`
    ],
    cooling: [
      `${q} şikayetinde soğutma kaybının gaz, hava akışı veya kompresör tarafında mı olduğunu ayırmak önemlidir.`,
      `${q} için önce temel akış sorunlarını, sonra servis gerektiren teknik başlıkları ele alıyoruz.`
    ],
    airflow: [
      `${q} gibi belirtilerde asıl iş, koku ve sesin kaynağını hava akışı, drenaj ya da bağlantı sorunlarından ayırmaktır.`,
      `${q} başlığı altında kullanıcıların ilk bakması gereken noktaları ve servis eşiğini netleştiriyoruz.`
    ],
    "laundry-drain": [
      `${q} şikayetinde su alma, tahliye, denge ve motor yükü çoğu zaman birlikte değerlendirilmelidir.`,
      `${q} konusunda evde yapılabilecek güvenli kontroller ile uzman müdahalesi gereken durumları netleştiriyoruz.`
    ],
    dishwash: [
      `${q} problemi çoğu zaman püskürtme, pompa, filtre veya kurutma aşamasında kendini belli eder.`,
      `${q} üzerine hazırlanan bu içerik, benzer görünen sorunları birbirinden ayırmaya odaklanır.`
    ],
    fridge: [
      `${q} başlığında performans kaybı, sıcaklık dengesi ve kapı sızdırmazlığı gibi parçalar birlikte düşünülmelidir.`,
      `${q} için buzlanma, ısı kaybı veya ısıtma sorunlarını hızlıca ayırmanıza yardım ediyoruz.`
    ],
    "general-guide": [
      `${q} konusu, çoğu kullanıcı için belirsiz kalan teknik adımlar içerir.`,
      `${q} için genel ama boş olmayan, doğrudan uygulanabilir bir teknik özet hazırladık.`
    ],
    industrial: [
      `${q} kurumsal sistemlerde tek bir nokta değil, tüm hattın dengesi olarak ele alınmalıdır.`,
      `${q} üzerine hazırlanan bu not, saha ve operasyon ekiplerinin hızlı okuması için tasarlandı.`
    ]
  };

  const sectionTitlesByClass: Record<TopicClass, { overview: string[]; causes: string[]; checks: string[]; service: string[]; maintenance: string[] }> = {
    pressure: {
      overview: [`${q} ne anlama gelir?`, "Belirtileri nasıl okumalı?", "Sorun hangi sinyali veriyor?"],
      causes: ["En olası nedenler", "Basınç neden düşer?", "Kaçak ihtimali ve alternatifler"],
      checks: ["Evde güvenli kontrol", "İlk bakışta neye bakılır?", "Kısa kontrol listesi"],
      service: ["Servise ne zaman geçilir?", "Profesyonel destek eşiği", "Ne zaman beklememeli?"],
      maintenance: ["Tekrar etmemesi için", "Bakımda dikkat edilenler", "Uzun vadeli koruma"]
    },
    "hot-water": {
      overview: [`${q} neden görülür?`, "Sıcak su dalgalanması nasıl anlaşılır?", "Ateşleme zinciri ne anlatır?"],
      causes: ["En yaygın sebepler", "Ateşleme tarafında neler olur?", "Sensör ve vana ayrımı"],
      checks: ["Kullanıcının yapabileceği kontroller", "Güvenli ilk adımlar", "Ayar ve gözlem sırası"],
      service: ["Servis gerektiren durumlar", "Ne zaman müdahale şart?", "Ustaya ne zaman bırakılmalı?"],
      maintenance: ["Bakım rutini", "Kış öncesi kontrol", "Tekrarı azaltan alışkanlıklar"]
    },
    maintenance: {
      overview: [`${q} neden önemlidir?`, "Bakım neyi değiştirir?", "Periyodik kontrolün mantığı"],
      causes: ["Bakım neden atlanır?", "Performans düşüşü hangi sırayla gelir?", "En çok kaçan noktalar"],
      checks: ["Adım adım bakım listesi", "Evde güvenli kontrol noktaları", "Mevsimsel kontrol sırası"],
      service: ["Profesyonel bakım zamanı", "Ne zaman detaylı kontrol gerekir?", "Hangi durumda servis çağrılır?"],
      maintenance: ["Bakımı kalıcı hale getirmek", "Kayıtlı bakım alışkanlığı", "Cihazı yormadan kullanmak"]
    },
    cooling: {
      overview: [`${q} nasıl okunur?`, "Soğutma kaybı ne anlatır?", "Performans düşüşü neden önemlidir?"],
      causes: ["Gaz ve akış tarafı", "Kompresör yükü ve filtre etkisi", "Dış ünite tarafındaki nedenler"],
      checks: ["Evde yapılabilecek kontroller", "Ayar ve temizlik sırası", "Hızlı ayrım testi"],
      service: ["Ne zaman servis gerekir?", "Soğutma sorunu ne zaman kritik olur?", "Uzman kontrol eşiği"],
      maintenance: ["Yaz öncesi rutin", "Soğutmayı korumak", "Uzun süreli verim için"]
    },
    airflow: {
      overview: [`${q} neye işaret eder?`, "Koku ve ses birlikte ne söyler?", "Akış problemleri nasıl görünür?"],
      causes: ["Drenaj ve filtre etkisi", "Fan ve bağlantı kaynaklı nedenler", "Nem ve kirlilik etkisi"],
      checks: ["Güvenli ilk kontrol", "Kullanıcı gözlemi için kısa liste", "Ne değiştiğini not etme"],
      service: ["Servise geçme noktası", "Kalıcı çözüm için ne gerekir?", "Uzman bakış ne zaman şart?"],
      maintenance: ["Koku ve sesi azaltmak", "Temizlik rutini", "Tekrarı önleyen bakım"]
    },
    "laundry-drain": {
      overview: [`${q} hangi parçaları işaret eder?`, "Su alma ve tahliye nasıl ayrılır?", "Kazan dengesi neden önemlidir?"],
      causes: ["Tahliye ve pompa tarafı", "Denge ve amortisör etkisi", "Elektronik kontrol sinyali"],
      checks: ["Evde güvenli bakış", "Su, ses ve titreşim sırası", "Kısa test listesi"],
      service: ["Servise ne zaman ihtiyaç olur?", "Ne zaman beklemek risklidir?", "Uzman kontrol gerektiren haller"],
      maintenance: ["Tekrarı azaltmak", "Kullanım alışkanlıkları", "Düzenli bakım mantığı"]
    },
    dishwash: {
      overview: [`${q} yıkama kalitesini nasıl etkiler?`, "Belirti hangi aşamada görünür?", "Pompa ve filtre ne söyler?"],
      causes: ["Filtre ve püskürtme", "Pompa ve kurutma", "Deterjan ve su dengesi"],
      checks: ["Kullanıcının bakabileceği alanlar", "Evde güvenli kontrol listesi", "Kısa gözlem akışı"],
      service: ["Servis gerektiren durumlar", "Hangi noktada cihaz açılmamalı?", "Uzman müdahalesi ne zaman?"],
      maintenance: ["Yıkama kalitesini korumak", "Kireç ve koku önleme", "Uzun ömür için bakım"]
    },
    fridge: {
      overview: [`${q} hangi performans düşüşünü anlatır?`, "Soğutma ve buzlanma nasıl ayrılır?", "Kapı fitili neden önemli?"],
      causes: ["Termostat ve akış", "Fitil ve izolasyon", "Buzlanma ve fan tarafı"],
      checks: ["Evde yapılabilecek kısa kontrol", "Sıcaklık ve kapı testi", "Koku/buzlanma gözlemi"],
      service: ["Servis çağrılacak nokta", "Teknik kontrol ne zaman gerekir?", "Soğutma devresi için eşik"],
      maintenance: ["Soğutmayı korumak", "Fitil ve arka panel", "Buzlanmayı azaltma rutini"]
    },
    "general-guide": {
      overview: [`${q} için en doğru başlangıç`, "Genel teknik okuma", "Belirtiyi sınıflandırma"],
      causes: ["Sorun neden büyür?", "Hızlı ayrım neden önemli?", "Yanlış yorum riski"],
      checks: ["Güvenli ilk adımlar", "Kullanıcı seviyesinde kontrol", "Doğru bilgi toplama"],
      service: ["Servis zamanı", "Ne zaman destek alınmalı?", "Uzman yardımı eşiği"],
      maintenance: ["Düzenli bakım", "Kalıcı çözüm yaklaşımı", "Tekrarı azaltma"]
    },
    industrial: {
      overview: [`${q} neden operasyon konusu olur?`, "Kurumsal sistemlerde nasıl okunur?", "Süreklilik neden kritik?"],
      causes: ["Hat ve yük dengesi", "Planlama eksikliği", "Ekipman etkileşimi"],
      checks: ["Saha kontrol sırası", "Kayıtlı gözlem", "İlk teşhis çerçevesi"],
      service: ["Operasyon ekibine ne zaman bildirilir?", "Saha servisi ne zaman gerekir?", "Kritik eşik nedir?"],
      maintenance: ["Planlı bakım", "Raporlama ve kayıt", "Kesintiyi azaltan rutin"]
    }
  };

  return {
    topicClass,
    focusLabel: focusLabelByClass[topicClass],
    openingLine: openingByClass[topicClass],
    practicalCheck: practicalByClass[topicClass],
    serviceTrigger: serviceTriggerByClass[topicClass],
    maintenanceLine: maintenanceByClass[topicClass],
    warningLine: warningByClass[topicClass],
    titleOptions: titleOptionsByClass[topicClass],
    descriptionOptions: descriptionByClass[topicClass],
    sectionTitles: sectionTitlesByClass[topicClass]
  };
}

export function getBlogIndexSlugs(limit = 200) {
  const out: string[] = [];
  for (let i = 0; i < Math.max(0, limit); i++) out.push(blogSlugFromIndex(i));
  return out;
}

export function buildBlogArticle(slug: string): BlogArticle | null {
  return buildBlogArticleImpl(slug);

  /*
  const parsed = parseBlogSlug(slug);
  if (!parsed) return null;

  const articleSlug = normalizeSlug(slug);
  const { category, topic } = parsed;
  const rng = createRng(`blog|${articleSlug}`);

  // Load intelligence data if available
  let intelligence: any = null;
  try {
    const intelPath = path.join(process.cwd(), "data/intelligence", `${articleSlug}.json`);
    if (fs.existsSync(intelPath)) {
      intelligence = JSON.parse(fs.readFileSync(intelPath, "utf-8"));
    }
  } catch (e) {
    // ignore
  }

  const catLabel = categoryMeta[category].label;
  const q = humanizeTopic(topic);

  // High quality professional title templates
  const title = pickOne(rng, [
    `${q} | ${catLabel} Uzman Rehberi`,
    `${q} - Bilmeniz Gereken Her Şey`,
    `${catLabel} Teknik Destek: ${q}`,
    `${q} (Uygulamalı Çözüm Adımları)`
  ]);

  const description = pickOne(rng, [
    `${q} konusu hakkında profesyonel bilgiler, yerinde çözüm önerileri ve güvenli kullanım rehberi. Tüm detaylar yazımızda.`,
    `${catLabel} kullanıcıları için kapsamlı rehber: ${q}. Olası nedenler, kullanıcı kontrolleri ve servis aşamaları.`,
    `${q} sorunuyla mı karşılaştınız? İşte uzman gözünden nedenleri, pratik çözüm yolları ve dikkat edilmesi gerekenler.`
  ]);

  const h1 = title;

  const symptoms = pickManyUnique(
    rng,
    [
      "Cihaz beklenen performansı vermiyor",
      "Arıza belirli aralıklarla tekrarlıyor",
      "Kısa süreli düzelip tekrar sorun oluşuyor",
      "Ses/titreşim/uyarı ışığı gibi belirtiler eşlik ediyor",
      "Enerji tüketimi artmış gibi görünüyor"
    ],
    4
  );

  const safety = pickManyUnique(
    rng,
    [
      "Gaz kokusu varsa cihazı kapatın, ortamı havalandırın ve acil destek alın.",
      "Elektrik bağlantısına müdahale etmeyin; sigorta/kablo kontrolünü uzman kişiye bırakın.",
      "Su sızıntısı varsa cihazın altındaki elektrikli parçaları ıslatmadan durumu güvene alın.",
      "Kapağı açarak iç parçalara müdahale etmek garanti ve güvenlik riskidir."
    ],
    3
  );

  const steps = pickManyUnique(
    rng,
    [
      "Cihazın enerji beslemesini kontrol edin (sigorta, priz, şalter).",
      "Varsa ekran/hata kodunu not alın ve aynı şekilde tekrar edip etmediğini gözlemleyin.",
      "Filtre/ızgara gibi kullanıcıya açık parçaları (varsa) temizleyin.",
      "Ayarları kontrol edin (mod, sıcaklık, program, zamanlayıcı).",
      "Su basıncı/vanalar/bağlantılar gibi dış etkenleri kontrol edin (modeline göre).",
      "Sorun devam ederse randevu oluşturun; yerinde tespit sonrası net işlem planı çıkarılır."
    ],
    5
  );

  const whyService = pickManyUnique(
    rng,
    [
      "Tekrarlayan arızalar genellikle parça yorgunluğu veya ayar/kalibrasyon ihtiyacına işaret eder.",
      "Yanlış parça/yanlış uygulama, sorunu büyütebilir ve ekstra maliyet çıkarabilir.",
      "Güvenlik kontrolleri (kaçak, basınç, bağlantı) bazı cihazlarda kritiktir.",
      "Yerinde tespit, gerçek sorunu ayırt etmenin en hızlı yoludur."
    ],
    3
  );

  const cost = pickOne(rng, [
    "Net ücret; cihazın marka/modeli, arıza türü ve yapılacak işleme göre değişir. Yerinde tespit sonrası seçenekler ve yaklaşık bedel paylaşılır.",
    "Fiyat, parça gerekip gerekmediğine ve işlemin süresine göre değişir. En sağlıklı bilgi için arıza belirtisi + model bilgisini paylaşın.",
    "Ücretlendirme, işçilik ve olası parça kalemlerine göre oluşur. Onayınız olmadan işlem yapılmaz."
  ]);

  const keywords = pickManyUnique(
    rng,
    [
      `${catLabel} arıza`,
      `${catLabel} bakım`,
      `${catLabel} servis`,
      `${catLabel} tamir`,
      "yerinde tespit",
      "hata kodu",
      "periyodik bakım",
      "şeffaf fiyat",
      "randevu",
      "garanti"
    ],
    8
  );

  // Pick a category-specific technical insight
  const catInsights = (technicalInsights as Record<string, string[]>)[category] || [...technicalInsights.kombi, ...technicalInsights["beyaz-esya"]];
  const technicalInsight = pickOne(rng, catInsights.length > 0 ? catInsights : [`${q} konusunda sistemdeki teknik verileri ve kullanıcı geri bildirimlerini analiz ediyoruz.`]);

  const faqs = [
    {
      q: `${q} tehlikeli mi veya hemen tamir edilmeli mi?`,
      a: `${technicalInsight} Bu durum cihazın verimini düşürebileceği gibi, uzun vadede diğer parçalara da zarar verebilir. Bu nedenle yerinde tespit önerilir.`
    },
    ...pickManyUnique(
      rng,
      [
        {
          q: "Aynı gün servis mümkün mü?",
          a: "Yoğunluk ve lokasyona göre değişir. Uygunluk varsa aynı gün, değilse en yakın randevu planlanır."
        },
        {
          q: "Hangi bilgiyle servis kaydı açmalıyım?",
          a: "Cihaz türü, marka/model, arıza belirtisi ve varsa ekrandaki hata kodu süreci hızlandırır."
        },
        {
          q: "Sorun tekrar ederse ne yapmalıyım?",
          a: "Belirtileri ve ne zaman başladığını not alın. Tekrar eden arızalarda yerinde tespit daha doğru sonuç verir."
        }
      ],
      2
    )
  ];

  const relatedSlugs = pickManyUnique(
    rng,
    getBlogIndexSlugs(60).filter((s) => s !== articleSlug),
    6
  );

  const sections: BlogArticle["sections"] = [
    {
      h2: pickOne(rng, [`${q} Hakkında Teknik Bilgiler`, "Sorunun Temel Sebepleri", `${catLabel} Uzman Görüşü`]),
      paragraphs: [
        intelligence 
          ? `Sektördeki güncel verileri analiz ettiğimizde, bu konuyla ilgili en çok "${intelligence.serp[0]?.title}" ve benzeri başlıklar altında çözümler arandığını görüyoruz.` 
          : technicalInsight,
        `${q} konusu, kullanıcılarn marka bağımsız olarak en sık karşılaştığı ve teknik destek ihtiyacı duyduğu başlıklardan biridir.`,
        intelligence
          ? `Rakiplerin ve uzman sitelerin paylaştığı bilgilere göre: ${intelligence.serp.slice(0, 3).map((r: any) => r.snippet).join(" ")}`.slice(0, 300) + "..."
          : `Unutmayın: Modern ${catLabel.toLocaleLowerCase("tr-TR")} sistemlerinde bir hata genellikle zincirleme etkiler yaratır. En doğru sonuç için cihazın marka/modelini ve spesifik belirtilerini not etmek gerekir.`
      ],
      bullets: symptoms
    },
    {
      h2: pickOne(rng, ["Olası nedenler", "Neden olur?", "En sık karşılaşılan sebepler"]),
      paragraphs: [
        `Bu tip problemler tek bir nedene bağlı olmayabilir. Aynı belirti; ayar kaynaklı küçük bir durumdan, parça yıpranmasına kadar farklı sebeplerle ortaya çıkabilir.`,
        `Özellikle ${catLabel.toLocaleLowerCase("tr-TR")} kullanımında çevresel koşullar (ısı, nem, tesisat durumu, kullanım yoğunluğu) belirtileri etkileyebilir.`
      ]
    },
    {
      h2: pickOne(rng, ["Adım adım kontrol listesi", "Kullanıcının yapabileceği kontroller", "Pratik çözüm adımları"]),
      paragraphs: [
        "Aşağıdaki adımlar, güvenli ve kullanıcı seviyesinde yapılabilecek kontrolleri içerir. Kapağı açmayı veya parçalara müdahaleyi önermiyoruz.",
        "Adımları uygularken değişen bir şey olursa not alın; bu bilgi, servis tespitini hızlandırır."
      ],
      bullets: steps
    },
    {
      h2: pickOne(rng, ["Ne zaman servis çağırmalı?", "Servis gerektiren durumlar", "Profesyonel destek ne zaman gerekli?"]),
      paragraphs: [
        whyService[0],
        whyService[1],
        whyService[2] ?? "Cihaz güvenliği ve performansı için tespit adımını uzman ekiple yapmak çoğu zaman daha ekonomiktir."
      ],
      bullets: safety
    },
    {
      h2: pickOne(rng, ["Ücret ve süre hakkında", "Maliyet tahmini", "Randevu planlama"]),
      paragraphs: [
        cost,
        `Servisuzmanı üzerinden iletişime geçerek servis kaydı oluşturabilirsiniz. Arıza belirtisini ve cihaz bilgilerini paylaştığınızda doğru yönlendirme yapılır.`
      ]
    }
  ];

  // === DEEP CONTENT INJECTION: Use scraped & blended paragraphs from real websites ===
  if (intelligence?.deepContent?.length > 0) {
    const deepParagraphs: string[] = intelligence.deepContent;
    // Split deep content into 2 sections for natural flow
    const half = Math.ceil(deepParagraphs.length / 2);
    const firstHalf = deepParagraphs.slice(0, half);
    const secondHalf = deepParagraphs.slice(half);

    if (firstHalf.length > 0) {
      sections.push({
        h2: pickOne(rng, ["Uzman Kaynakları Ne Diyor?", "Sektörel Analiz", "Detaylı Teknik İnceleme"]),
        paragraphs: firstHalf
      });
    }
    if (secondHalf.length > 0) {
      sections.push({
        h2: pickOne(rng, ["Karşılaştırmalı Değerlendirme", "Pratik Uygulama Rehberi", "Kapsamlı Çözüm Analizi"]),
        paragraphs: secondHalf
      });
    }
  }

  // ensure 350+ words by appending one more section if needed (deterministic)
  if (joinArticle(sections, faqs) < 350) {
    const extra = pickOne(rng, [
      "Kısa bakım önerileri",
      "Performansı korumak için ipuçları",
      "Tekrar etmemesi için dikkat edilmesi gerekenler"
    ]);
    sections.push({
      h2: extra,
      paragraphs: [
        `Bu tarz sorunların tekrar etmesini azaltmak için periyodik bakım önemlidir. Kullanım yoğunluğu yüksekse bakım aralığı kısalabilir; düşük kullanımda ise daha uzun aralıklar tercih edilebilir.`,
        `Cihazın hava/su akışını engelleyen bir durum, çoğu zaman performansı düşürür ve hataları tetikler. Düzenli temizlik ve doğru ayar kullanımı, hem konforu artırır hem de enerji tüketimini dengeleyebilir.`,
        `Eğer aynı sorun kısa süre içinde tekrar ediyorsa, “geçici düzelme” çoğu zaman kök nedenin çözülemediğini gösterir. Bu noktada yerinde tespit, uzun vadede maliyeti düşürür.`
      ]
    });
  }

  const url = absoluteUrl(`/blog/${articleSlug}`);
  const wordCount = joinArticle(sections, faqs);
  const readingMinutes = readingMinutesFromWords(wordCount);
  const image = absoluteUrl(`/api/blog-image?slug=${encodeURIComponent(articleSlug)}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    inLanguage: "tr-TR",
    mainEntityOfPage: url,
    url,
    image,
    publisher: {
      "@type": "Organization",
      name: site.businessName,
      url: site.url
    },
    author: {
      "@type": "Organization",
      name: site.businessName
    },
    keywords
  };

  // Add PAA questions to JSON-LD if available
  if (intelligence?.peopleAlsoAsk?.length) {
    const faqSchema = {
      "@type": "FAQPage",
      "mainEntity": intelligence.peopleAlsoAsk.map((item: any) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };
    // Merge or add as separate part of a Graph
    (jsonLd as any).mainEntity = (faqSchema as any).mainEntity;
  }

  return {
    slug: articleSlug,
    category,
    title,
    description,
    h1,
    keywords,
    wordCount,
    readingMinutes,
    sections,
    faqs,
    relatedSlugs,
    jsonLd,
    expertNote: intelligence ? {
      title: pickOne(rng, ["Teknik Uzman Notu", "Gözden Kaçabilen Detaylar", "Profesyonel Bakış Açısı"]),
      content: `Piyasada bu konuyla ilgili genelde yüzeysel bilgiler (bkz. ${intelligence.serp[0]?.title}) yer alsa da, sahada karşılaştığımız en kritik durum ${q.toLocaleLowerCase("tr-TR")} sürecinde cihazın uzun vadeli performansını ${technicalInsight.toLowerCase()} ile korumaktır. Çoğu kaynak bu teknik hassasiyeti atlamaktadır.`
    } : undefined,
    peopleAlsoAsk: intelligence?.peopleAlsoAsk || []
  };
}

  */

function buildBlogArticleImpl(slug: string): BlogArticle | null {
  const parsed = parseBlogSlug(slug);
  if (!parsed) return null;

  const articleSlug = normalizeSlug(slug);
  const { category, topic } = parsed;
  const rng = createRng(`blog|${articleSlug}`);

  let intelligence: any = null;
  try {
    const intelPath = path.join(process.cwd(), "data/intelligence", `${articleSlug}.json`);
    if (fs.existsSync(intelPath)) intelligence = JSON.parse(fs.readFileSync(intelPath, "utf-8"));
  } catch {
    intelligence = null;
  }

  const catLabel = categoryMeta[category].label;
  const q = humanizeTopic(topic);
  const hints = buildTopicHints(category, topic, q);
  const title = pickOne(rng, hints.titleOptions);
  const description = pickOne(rng, hints.descriptionOptions);
  const h1 = title;
  const keywords = pickManyUnique(
    rng,
    [
      `${catLabel} arıza`,
      `${catLabel} bakım`,
      `${catLabel} servis`,
      `${catLabel} tamir`,
      "yerinde tespit",
      "hata kodu",
      "periyodik bakım",
      "şeffaf fiyat",
      "randevu",
      "garanti"
    ],
    8
  );

  // Pick a category-specific technical insight
  const catInsights = (technicalInsights as Record<string, string[]>)[category] || [...technicalInsights.kombi, ...technicalInsights["beyaz-esya"]];
  const technicalInsight = pickOne(rng, catInsights.length > 0 ? catInsights : [`${q} konusunda sistemdeki teknik verileri ve kullanıcı geri bildirimlerini analiz ediyoruz.`]);

  const faqs = [
    {
      q: `${q} tehlikeli mi veya hemen tamir edilmeli mi?`,
      a: `${technicalInsight} Bu belirti, cihazın verimini düşürebilir ve zamanla yan parçalara da yük bindirebilir. Bu yüzden güvenli bir ön kontrol sonrası servis değerlendirmesi önerilir.`
    },
    ...pickManyUnique(
      rng,
      [
        {
          q: "Aynı gün servis mümkün mü?",
          a: "Yoğunluk ve lokasyona göre değişir. Uygunluk varsa aynı gün, değilse en yakın randevu planlanır."
        },
        {
          q: "Hangi bilgiyle servis kaydı açmalıyım?",
          a: "Cihaz türü, marka/model, arıza belirtisi ve varsa ekrandaki hata kodu süreci hızlandırır."
        },
        {
          q: "Sorun tekrar ederse ne yapmalıyım?",
          a: "Belirtileri ve ne zaman başladığını not alın. Tekrar eden arızalarda yerinde tespit daha doğru sonuç verir."
        }
      ],
      2
    )
  ];

  const symptomSeeds = [
    hints.openingLine,
    hints.practicalCheck,
    hints.warningLine,
    hints.serviceTrigger,
    hints.maintenanceLine,
    "Belirti kısa aralıklarla tekrar ediyorsa bu tek seferlik bir dalgalanma olmayabilir.",
    "Kullanım alışkanlığı, çevre koşulu ve parça yorgunluğu birlikte düşünülmelidir."
  ];

  const sections: BlogArticle["sections"] = [
    {
      h2: pickOne(rng, hints.sectionTitles.overview),
      paragraphs: [
        hints.openingLine,
        `${q} için en faydalı yaklaşım, belirtiyi tek cümleyle değil davranış zinciriyle okumaktır.`,
        intelligence?.serp?.[0]?.title
          ? "Saha taramasında benzer başlıklar görünse de, burada doğrudan alıntı yerine teknik okuma önceliklidir."
          : `Modern ${catLabel.toLocaleLowerCase("tr-TR")} sistemlerinde küçük bir belirti bile zincirleme etkiler yaratabilir.`
      ],
      bullets: pickManyUnique(rng, symptomSeeds, 4)
    },
    {
      h2: pickOne(rng, hints.sectionTitles.causes),
      paragraphs: [
        "Bu başlıkta tek bir neden aramak çoğu zaman yanıltıcı olur. Aynı belirti; ayar, kullanım yoğunluğu veya parça yıpranmasıyla ortaya çıkabilir.",
        `Özellikle ${hints.focusLabel.toLocaleLowerCase("tr-TR")} tarafında çevresel koşullar ve alışkanlıklar tabloyu belirgin biçimde değiştirir.`
      ]
    },
    {
      h2: pickOne(rng, hints.sectionTitles.checks),
      paragraphs: [
        "Aşağıdaki adımlar kullanıcı seviyesinde, güvenli kontrol noktalarını özetler. İç mekanik alanı açmak bu listenin parçası değildir.",
        "Kontrol ederken neyin değiştiğini not etmek, sonraki servis değerlendirmesini ciddi biçimde hızlandırır."
      ],
      bullets: pickManyUnique(
        rng,
        [
          hints.practicalCheck,
          hints.maintenanceLine,
          "Belirtilerin hangi ayarda ve ne kadar sürede ortaya çıktığını yazın.",
          "Temizlenebilen dış yüzey / filtre / fitil gibi alanları güvenli şekilde kontrol edin.",
          "Aynı davranış birkaç kez tekrar ediyorsa geçici düzelmeye güvenmeyin.",
          "Farklı ses, koku veya su izi varsa bunları servis kaydına ekleyin."
        ],
        5
      )
    },
    {
      h2: pickOne(rng, hints.sectionTitles.service),
      paragraphs: [
        "Tekrarlayan belirtiler genellikle ayar değil, kök neden taşır.",
        "Yanlış parça değişimi, sorunu geçici olarak saklayabilir ama çözmeyebilir.",
        "Yerinde tespit, gerçek nedeni daraltmanın en hızlı yoludur.",
        hints.serviceTrigger
      ],
      bullets: pickManyUnique(
        rng,
        [
          hints.warningLine,
          "İç kapağı açıp parça sökmek yerine önce gözlem ve not alma yolunu seçin.",
          "Belirtiyi tetikleyen ayar, program veya kullanım davranışı varsa bunu kaydedin.",
          "Sorun hızla kötüleşiyorsa beklemek yerine kayıt açmak daha güvenlidir."
        ],
        3
      )
    },
    {
      h2: pickOne(rng, hints.sectionTitles.maintenance),
      paragraphs: [
        "Net ücret; cihazın modeli, sorunun tipi ve yapılacak işleme göre değişir. Önce tespit, sonra rakam daha sağlıklı olur.",
        hints.maintenanceLine,
        "Servisuzmanı üzerinden iletişime geçerek servis kaydı oluşturabilirsiniz. Arıza belirtisini ve cihaz bilgilerini paylaştığınızda daha doğru yönlendirme yapılır."
      ]
    }
  ];

  if (intelligence?.peopleAlsoAsk?.length) {
    sections.push({
      h2: "Sahadan Gelen Sorular",
      paragraphs: [
        "Arama sonuçlarında öne çıkan soru kalıplarını doğrudan kopyalamak yerine, kullanıcıların en çok takıldığı noktaları özetliyoruz.",
        "Bu bölüm, aynı konuyu farklı kelimelerle tekrar etmek yerine karar vermeyi kolaylaştıran kısa bir not alanı olarak düşünülmeli."
      ],
      bullets: pickManyUnique(
        rng,
        intelligence.peopleAlsoAsk
          .map((item: any) => `${item.question} -> ${item.answer}`)
          .slice(0, 4),
        3
      )
    });
  }

  if (joinArticle(sections, faqs) < 350) {
    sections.push({
      h2: pickOne(rng, ["Kısa bakım notları", "Tekrarı azaltan alışkanlıklar", "Uzun vadeli koruma"]),
      paragraphs: [
        hints.maintenanceLine,
        "Geçici düzelme görmek, kök nedenin çözüldüğü anlamına gelmez. Tekrar eden belirtiler düzenli not edilmelidir.",
        "Doğru bakım rutini, güvenli ilk kontrol ve zamanında servis birlikte uygulandığında hem konfor hem maliyet tarafı dengelenir."
      ]
    });
  }

  const url = absoluteUrl(`/blog/${articleSlug}`);
  const wordCount = joinArticle(sections, faqs);
  const readingMinutes = readingMinutesFromWords(wordCount);
  const image = absoluteUrl(`/api/blog-image?slug=${encodeURIComponent(articleSlug)}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    inLanguage: "tr-TR",
    mainEntityOfPage: url,
    url,
    image,
    publisher: {
      "@type": "Organization",
      name: site.businessName,
      url: site.url
    },
    author: {
      "@type": "Organization",
      name: site.businessName
    },
    keywords
  };

  if (intelligence?.peopleAlsoAsk?.length) {
    (jsonLd as any).mainEntity = intelligence.peopleAlsoAsk.map((item: any) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }));
  }

  return {
    slug: articleSlug,
    category,
    title,
    description,
    h1,
    keywords,
    wordCount,
    readingMinutes,
    sections,
    faqs,
    relatedSlugs: pickManyUnique(rng, getBlogIndexSlugs(60).filter((s) => s !== articleSlug), 6),
    jsonLd,
    expertNote: intelligence
      ? {
          title: pickOne(rng, ["Teknik Uzman Notu", "Gözden Kaçabilen Detaylar", "Profesyonel Bakış Açısı"]),
          content: `Bu konuda sahada en kritik ayrım, belirtileri hızlıca tek parçaya bağlamak yerine bütün akışı okumaktır. ${technicalInsight} Bu yaklaşım, yanlış müdahale ve gereksiz parça değişimi riskini azaltır.`
        }
      : undefined,
    peopleAlsoAsk: intelligence?.peopleAlsoAsk || []
  };
}

}

export function getArticlesByCategory(category: BlogCategory, limit = 5, excludeSlug?: string) {
  const allSlugs = getBlogIndexSlugs(2000); // Wider range for 1M blog system
  const matched: BlogArticle[] = [];

  for (const slug of allSlugs) {
    if (slug === excludeSlug) continue;
    const article = buildBlogArticle(slug);
    if (article && article.category === category) {
      matched.push(article);
    }
    if (matched.length >= limit) break;
  }
  return matched;
}

/**
 * Fetches relevant blog posts for a given context (city, district, brand).
 * Used primarily for internal linking in the contextual footer.
 */
export function getRelatedBlogsForContext(options: { 
  category?: BlogCategory; 
  brandSlug?: string; 
  limit?: number; 
  excludeSlug?: string;
}) {
  const limit = options.limit ?? 5;
  
  if (options.brandSlug && options.category) {
    return getArticlesForBrandAndCategory({
      brandSlug: options.brandSlug,
      category: options.category,
      limit,
      excludeSlug: options.excludeSlug
    });
  }

  if (options.category) {
    return getArticlesByCategory(options.category, limit, options.excludeSlug);
  }

  // Default: Get mixed latest/popular blogs
  const allSlugs = getBlogIndexSlugs(30);
  const matched: BlogArticle[] = [];
  for (const slug of allSlugs) {
    if (slug === options.excludeSlug) continue;
    const article = buildBlogArticle(slug);
    if (article) matched.push(article);
    if (matched.length >= limit) break;
  }
  return matched;
}


export function getArticlesForBrandAndCategory(input: {
  brandSlug: string;
  category: BlogCategory;
  limit?: number;
  excludeSlug?: string;
}) {
  const limit = input.limit ?? 5;
  const allSlugs = getBlogIndexSlugs(500);
  const prioritized: BlogArticle[] = [];
  const fallback: BlogArticle[] = [];

  for (const slug of allSlugs) {
    if (slug === input.excludeSlug) continue;
    const article = buildBlogArticle(slug);
    if (!article || article.category !== input.category) continue;

    if (slug.includes(input.brandSlug)) {
      prioritized.push(article);
    } else {
      fallback.push(article);
    }
  }

  return [...prioritized, ...fallback].slice(0, limit);
}

export function getPopularServiceRegions() {
  return [
    { city: "istanbul", name: "İstanbul" },
    { city: "ankara", name: "Ankara" },
    { city: "izmir", name: "İzmir" },
    { city: "bursa", name: "Bursa" },
    { city: "antalya", name: "Antalya" },
    { city: "kocaeli", name: "Kocaeli" },
    { city: "van", name: "Van" }
  ];
}
