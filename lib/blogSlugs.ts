import { createRng, pickOne } from "@/lib/variation";

const categories = ["kombi", "klima", "beyaz-esya", "genel"] as const;

const intents = [
  "neden-olur",
  "cozumu",
  "ne-yapmali",
  "tamiri",
  "bakimi",
  "ipuclari",
  "rehber",
  "sss",
  "hata-kodu",
  "kontrol-listesi"
];

const scenarios = [
  "evde",
  "kistan-once",
  "yaz-oncesi",
  "tasarruf-icin",
  "acil",
  "ilk-defa",
  "tekrar-ediyorsa",
  "garanti-sonrasi",
  "yeni-cihaz",
  "eski-cihaz"
];

const problems = {
  kombi: [
    "basinc-dusuyor", "petekler-isinmiyor", "sicak-su-dalgalaniyor", "atesleme-yapmiyor", "gurultulu-calisiyor",
    "su-eksiltiyor", "hata-kodu-veriyor", "suyu-isitmiyor", "kendini-kapatiyor", "petek-temizligi",
    "sicak-su-vermiyor", "basinc-yukseliyor", "yogusmali-farki", "en-az-yakan-markalar", "f1-ariza-kodu-cozumu",
    "bakimi-yapilmazsa", "petek-alti-soguk", "patlamali-yaniyor", "oda-termostati-tasarruf", "devirdaim-pompasi-arizasi",
    "anakart-tamiri", "genleşme-tanki-havasi", "su-sizdiriyor", "fan-motoru-temizligi", "ntc-sensor-arizasi",
    "uc-yollu-vana-arizasi", "gece-kapatmak-tasarruf", "kis-ayari-derecesi", "yerden-isitma-ayari", "baca-sensoru-hatasi",
    "gaz-valfi-arizasi", "su-basma-vanasi-sikisti", "hermetik-su-akitir", "yogusma-gideri-tikandi", "eca-ariza-kodlari",
    "demirdokum-resetleme", "bosch-c6-hatasi", "vaillant-f28-arizasi", "buderus-6a-hatasi", "viessmann-f4-arizasi",
    "baymak-e01-hatasi", "kombi-esonjor-kireclenmesi", "kombi-su-doldurma-muslugu", "bosch-hata-kodlari-listesi",
    "vaillant-hata-kodlari-listesi", "buderus-hata-kodlari-listesi", "protherm-f1-arizasi", "ferroli-a01-hatasi",
    "alarko-hata-kodlari", "kombi-filtre-temizligi", "yoğuşmali-kombi-bakimi", "kombi-akilli-oda-termostati",
    "genlesme-tanki-degisimi", "kombi-plaka-esenjor-arizasi", "kombi-hava-alma", "bacali-kombi-riskleri",
    "kombi-elektrik-sarfiyati", "kombi-dogalgaz-tasarrufu", "kombi-donma-korumasi", "kombi-kis-modu-ayari"
  ],
  klima: [
    "sogutmuyor", "isitmiyor", "su-akitiyor", "koku-yapiyor", "ses-yapiyor", "gaz-bitti-mi", "filtre-temizligi",
    "dis-unite-sorunlari", "enerji-tuketimi", "kumanda-ayarlari", "gaz-dolumu-fiyatlari", "ic-unite-su-akitir",
    "koku-giderme", "kumanda-soguk-ayari", "inverter-tasarrufu", "dis-unite-gurultu", " BTU-hesabi",
    "gaz-bittigi-nasil-anlasilir", "kart-arizasi", "kompresor-devreye-girmiyor", "kumanda-calismiyor",
    "kendi-kendine-kapaniyor", "ch-38-ariza-kodu", "mobil-klima-elektrik", "salon-tipi-vs-duvar-tipi",
    "bakim-saglik-zararlari", "lg-ch-05-hatasi", "samsung-e1-arizasi", "arcelik-ch-hatasi", "mitsubishi-ariza-kodlari",
    "daikin-u4-hatasi", "klima-gaz-kacagi-tespiti", "klima-bakimi-ne-zaman", "klima-kis-ayari", "klima-vakumlama-onemi",
    "klima-kondansator-arizasi", "klima-fan-motoru-tamiri", "klima-anakart-fiyatlari", "klima-bakim-spreyi-kullanimi",
    "klima-derecesi-kacta-olmali", "klima-uyku-modu", "klima-ionizer-ozelligi", "klima-nem-alma-modu"
  ],
  "beyaz-esya": [
    "camasir-su-almiyor", "camasir-su-bosaltmiyor", "bulasik-temiz-yikamiyor", "buzdolabi-sogutmuyor",
    "buzdolabi-buzlaniyor", "firin-isitmiyor", "kurutma-kurutmuyor", "gurultu-titreme", "koku-sorunu",
    "programda-takiliyor", "buzdolabi-motoru-yanar", "buzdolabi-kapi-lastigi", "no-frost-kanal-tikanikligi",
    "camasir-sikma-yapmiyor", "camasir-sallaniyor-yuruyor", "camasir-filtre-temizligi", "camasir-deterjan-almiyor",
    "camasir-kazan-donmuoyr", "camasir-koruk-lastigi", "bulasik-tablet-eritmiyor", "bulasik-bardak-ciziyor",
    "bulasik-su-aliyor-baslamiyor", "bulasik-tuz-parlatici-nereye", "firin-alti-pisirmiyor", "ocak-ateslemiyor",
    "aspirator-cekis-gucu", "bosch-e18-hatasi", "arcelik-e01-arizasi", "samsung-4e-hatasi", "vestel-e02-arizasi",
    "buzdolabi-servis-modu", "buzdolabi-gaz-dolumu", "camasir-makinesi-rulman-degisimi", "bulasik-makinesi-pompa-temizligi",
    "beyaz-esya-enerji-sinifi", "buzdolabi-derece-ayari", "firin-rezistans-degisimi", "beyaz-esya-garanti-sorgulama",
    "beyaz-esya-omru-ne-kadar", "beyaz-esya-boyama-nasil-yapilir", "camasir-makinesi-amortisor-arizasi"
  ],
  genel: [
    "servis-ucretleri-2026", "van-kombi-servisi-guvenilir", "van-merkez-klima-montaj", "ikinci-el-alirken-dikkat",
    "teknik-servis-fisi-onemi", "garanti-rehberi", "enerji-sinifi-yeni-sistem", "buzdolabi-motor-degisimi-fiyat",
    "kombi-kart-tamiri-guvenli-mi", "klima-sokme-takma-ucreti", "en-iyi-kombi-markasi", "akilli-ev-klima-uyumu",
    "robot-supurge-pil-omru", "mikrodalga-radyasyon-yayarmı", "hava-temizleyici-filtre-degisimi", "kurutma-makinesi-camasir-cekermi",
    "termosifon-vs-kombi", "ani-su-isiticı-elektrik", "derin-dondurucu-derecesi", "tamir-mi-yeni-cihaz-mi",
    "yetkili-servis-vs-ozel-servis", "beyaz-esya-tasima-ipuclari", "elektronik-kart-tamiri", "yedek-parca-bulma-rehberi",
    "uygun-fiyatli-teknik-destek", "van-beyaz-esya-tamiri-tavsiye", "musteri-haklari-teknik-servis", "ariza-tespit-ucreti-nedir"
  ]
} as const;

function base36(n: number) {
  return n.toString(36);
}

export const BLOG_TOTAL_URLS = 1_000_000;
export const BLOG_SITEMAP_PAGE_SIZE = 10_000;
export const BLOG_SITEMAP_PAGES = Math.ceil(BLOG_TOTAL_URLS / BLOG_SITEMAP_PAGE_SIZE);

export function blogSlugFromIndex(index: number) {
  const safe = Math.max(0, Math.floor(index));
  const cat = categories[safe % categories.length];
  const rng = createRng(`blog-slug|${safe}|${cat}`);

  const p = pickOne(rng, [...problems[cat]]);
  const intent = pickOne(rng, intents);
  const scenario = pickOne(rng, scenarios);

  // Unique suffix but not too “numeric looking”
  const code = base36(safe);
  return `${cat}-${p}-${intent}-${scenario}-${code}`;
}

