import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";
import { createRng, pickManyUnique, pickOne } from "@/lib/variation";
import { blogSlugFromIndex } from "@/lib/blogSlugs";
import { technicalInsightsMap } from "@/lib/semantics";
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

export function getBlogIndexSlugs(limit = 200) {
  const out: string[] = [];
  for (let i = 0; i < Math.max(0, limit); i++) out.push(blogSlugFromIndex(i));
  return out;
}

export function buildBlogArticle(slug: string): BlogArticle | null {
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

  const topicKey = Object.keys(technicalInsightsMap).find(k => articleSlug.includes(k));
  const technicalInsight = topicKey ? technicalInsightsMap[topicKey] : `${q} konusunda sistemdeki teknik verileri ve kullanıcı geri bildirimlerini analiz ediyoruz.`;

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
