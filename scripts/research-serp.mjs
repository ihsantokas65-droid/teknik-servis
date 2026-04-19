import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

/**
 * CONFIGURATION
 */
const DATA_DIR = path.join(process.cwd(), "data", "intelligence");
const STATE_FILE = path.join(process.cwd(), "data", "intelligence_state.json");

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
];

function getHeaders() {
  return {
    "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://www.google.com/"
  };
}

/**
 * SLUG GENERATION LOGIC (Replicated from lib/blogSlugs.ts & lib/variation.ts)
 */
function fnv1a32(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function createRng(seedKey) {
  return mulberry32(fnv1a32(seedKey));
}
function pickOne(rng, items) {
  const idx = Math.floor(rng() * items.length);
  return items[idx];
}

const categories = ["kombi", "klima", "beyaz-esya", "genel"];
const intents = ["neden-olur", "cozumu", "ne-yapmali", "tamiri", "bakimi", "ipuclari", "rehber", "sss", "hata-kodu", "kontrol-listesi"];
const scenarios = ["evde", "kistan-once", "yaz-oncesi", "tasarruf-icin", "acil", "ilk-defa", "tekrar-ediyorsa", "garanti-sonrasi", "yeni-cihaz", "eski-cihaz"];
const problems = {
  kombi: ["basinc-dusuyor", "petekler-isinmiyor", "sicak-su-dalgalaniyor", "atesleme-yapmiyor", "gurultulu-calisiyor", "su-eksiltiyor", "hata-kodu-veriyor", "suyu-isitmiyor", "kendini-kapatiyor", "petek-temizligi", "eca-ariza-kodlari", "demirdokum-resetleme", "bosch-c6-hatasi", "vaillant-f28-arizasi"], // ... added more logic to grow this as needed
  klima: ["sogutmuyor", "isitmiyor", "su-akitiyor", "koku-yapiyor", "ses-yapiyor", "gaz-bitti-mi", "filtre-temizligi", "gaz-dolumu-fiyatlari", "klima-bakimi-ne-zaman"],
  "beyaz-esya": ["camasir-su-almiyor", "camasir-su-bosaltmiyor", "bulasik-temiz-yikamiyor", "buzdolabi-sogutmuyor", "buzdolabi-buzlaniyor"],
  genel: ["servis-ucretleri-2026", "van-kombi-servisi-guvenilir", "tamir-mi-yeni-cihaz-mi"]
};

function blogSlugFromIndex(index) {
  const safe = Math.max(0, Math.floor(index));
  const cat = categories[safe % categories.length];
  const rng = createRng(`blog-slug|${safe}|${cat}`);
  const p = pickOne(rng, problems[cat] || problems.genel);
  const intent = pickOne(rng, intents);
  const scenario = pickOne(rng, scenarios);
  const code = safe.toString(36);
  return `${cat}-${p}-${intent}-${scenario}-${code}`;
}

/**
 * INDIVIDUAL ENGINE SCRAPERS
 */
async function scrapeGoogle(query) {
  const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=tr`, { 
    headers: getHeaders(), timeout: 10000 
  });
  const $ = cheerio.load(response.data);
  const results = [];
  $(".g").each((i, el) => {
    if (results.length >= 5) return;
    const title = $(el).find("h3").text();
    const link = $(el).find("a").attr("href");
    const snippet = $(el).find("div.VwiC3b").text() || $(el).find(".st").text();
    if (title && title.length > 5) results.push({ rank: results.length + 1, title, link, snippet });
  });
  const paa = [];
  $(".related-question-pair span, .Jl_Z3, div.w7w96").each((i, el) => {
    const q = $(el).text().trim();
    if (q && q.endsWith("?") && !paa.includes(q)) paa.push(q);
  });
  return { results, paa };
}

async function scrapeBing(query) {
  const response = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=tr`, { 
    headers: { ...getHeaders(), "Referer": "https://www.bing.com/" }, timeout: 10000 
  });
  const $ = cheerio.load(response.data);
  const results = [];
  $("li.b_algo").each((i, el) => {
    if (results.length >= 5) return;
    const title = $(el).find("h2 a").text().trim();
    const link = $(el).find("h2 a").attr("href");
    const snippet = $(el).find(".b_caption p").text().trim() || $(el).find("p").first().text().trim();
    if (title && title.length > 5) results.push({ rank: results.length + 1, title, link, snippet });
  });
  return { results, paa: [] };
}

async function scrapeDDG(query) {
  const response = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { 
    headers: getHeaders(), timeout: 10000 
  });
  const $ = cheerio.load(response.data);
  const results = [];
  $(".result").each((i, el) => {
    if (results.length >= 5) return;
    const title = $(el).find(".result__a").text().trim();
    const link = $(el).find(".result__a").attr("href");
    const snippet = $(el).find(".result__snippet").text().trim();
    if (title) results.push({ rank: results.length + 1, title, link, snippet });
  });
  return { results, paa: [] };
}

async function scrapeYandex(query) {
  const response = await axios.get(`https://yandex.com.tr/search/?text=${encodeURIComponent(query)}&lr=11508`, { 
    headers: { ...getHeaders(), "Referer": "https://yandex.com.tr/" }, timeout: 10000 
  });
  const $ = cheerio.load(response.data);
  const results = [];
  $("li.serp-item").each((i, el) => {
    if (results.length >= 5) return;
    const title = $(el).find("h2 a, .OrganicTitle-LinkText").text().trim();
    const link = $(el).find("h2 a, a.Link").attr("href");
    const snippet = $(el).find(".OrganicTextContentSpan, .TextContainer").text().trim();
    if (title && title.length > 5) results.push({ rank: results.length + 1, title, link, snippet });
  });
  return { results, paa: [] };
}

/**
 * MULTI-ENGINE SCRAPER CHAIN
 * Google → Bing → DuckDuckGo → Yandex → Synthetic
 */
const engines = [
  { name: "google",    fn: scrapeGoogle },
  { name: "bing",      fn: scrapeBing },
  { name: "duckduckgo", fn: scrapeDDG },
  { name: "yandex",    fn: scrapeYandex }
];

async function scrapeSerp(query) {
  for (const engine of engines) {
    try {
      const { results, paa } = await engine.fn(query);
      if (results.length > 0) {
        console.log(`  ✓ ${engine.name} returned ${results.length} results`);
        return { results, paa, source: engine.name };
      }
    } catch (err) {
      console.warn(`  ⚠️ ${engine.name} failed: ${err.message?.slice(0, 60) || "unknown"}`);
    }
  }
  console.warn(`  → All engines failed, generating SYNTHETIC intelligence...`);
  return { results: [], paa: [], source: "synthetic" };
}


function generateAIAnswer(question, topic) {
  const patterns = [
    "Sektörel tecrübemize göre bu durum cihazın verimliliğini korumak adına kritik bir öneme sahiptir; teknik kontrol şarttır.",
    "Genellikle parça yorgunluğu veya sensör hassasiyeti kaynaklıdır, yerinde tespit en sağlıklı çözümdür.",
    "Kullanıcı tarafında filtre temizliği denenebilir, ancak kök sorunun giderilmesi için uzman müdahalesi önerilir."
  ];
  return `Profesyonel bir bakış açısıyla; ${question.replace("?", "")} konusu, ${topic.replaceAll("-", " ")} süreçlerinin en hassas noktalarından biridir. ${patterns[Math.floor(Math.random() * patterns.length)]}`;
}

const semanticMap = {
  "basinc-dusuyor": "Kombi basıncının düşmesi genellikle tesisattaki bir sızıntıdan veya genleşme tankındaki hava eksikliğinden kaynaklanır.",
  "petekler-isinmiyor": "Peteklerin ısınmaması durumunda devirdaim pompası veya tıkalı tesisat suyu ilk kontrol edilmelidir.",
  "sogutmuyor": "Klimanın soğutmaması genellikle gaz eksikliği veya kompresör kalkış arızası ile ilgilidir.",
  "su-akitiyor": "Su akıtması drenaj hortumunun tıkanması veya iç ünite tavasının tozlanması sonucunda oluşur.",
  "camasir-su-almiyor": "Çamaşır makinesi su almıyorsa giriş valfı, kapı kilidi veya filtreler kontrol edilmelidir.",
  "buzdolabi-sogutmuyor": "Buzdolabı soğutmuyorsa drayer tıkanıklığı veya motor basınç kaybı muhtemeldir.",
  "hata-kodu": "Hata kodları elektronik kartın sensörlerden aldığı veriler doğrultusunda sistemi korumaya almasıdır.",
  "gurultulu": "Gürültü genellikle fan motoru, pompa veya mekanik aksamdaki aşınmadan kaynaklanır.",
  "su-eksiltiyor": "Su eksiltme sorunu genleşme tankı, emniyet ventili veya tesisat sızıntısı kaynaklı olabilir.",
  "atesleme": "Ateşleme sorunları gaz valfi, iyonizasyon elektrodu veya anakart rölesi kaynaklı olabilir.",
  "koku": "Kötü koku genelde bakımsız filtreler, küflenmiş fan veya drenaj tıkanıklığından kaynaklanır.",
  "gaz-dolumu": "Gaz dolumu profesyonel ekipman ve kaçak testi gerektirir; yetkisiz dolum kompresöre zarar verebilir.",
  "filtre": "Filtre temizliği cihaz performansını doğrudan etkiler; düzenli bakım enerji tasarrufunu artırır.",
  "motor": "Motor arızaları titreşim, aşırı ısınma veya elektrik besleme sorunlarından kaynaklanabilir.",
  "pompa": "Pompa arızaları su sirkülasyonunu engeller; erken teşhis büyük arızaları önler.",
  "kart": "Elektronik kart arızaları voltaj dalgalanmaları veya nem kaynaklı korozyon sonucu oluşabilir.",
  "sensor": "Sensör arızaları yanlış okumalar yaparak cihazın hatalı çalışmasına veya kapanmasına neden olur.",
  "vana": "Vana arızaları sıcak su ve ısıtma geçişlerinde sorun yaşanmasına yol açar.",
  "termostat": "Termostat arızaları sıcaklık kontrolünün bozulmasına ve enerji israfına neden olur.",
  "kompressor": "Kompresör arızaları soğutma/ısıtma kapasitesinin tamamen kaybolmasına yol açabilir."
};

/**
 * DEEP SCRAPING: Visit actual result pages and extract their content
 */
async function deepScrape(url) {
  try {
    if (!url || url.includes("youtube.com") || url.includes("facebook.com") || url.includes("instagram.com")) return null;
    
    const response = await axios.get(url, {
      headers: getHeaders(),
      timeout: 8000,
      maxRedirects: 3
    });
    const $ = cheerio.load(response.data);

    // Remove noise
    $("script, style, nav, footer, header, aside, .sidebar, .menu, .ad, .advertisement, .comments, form").remove();

    // Extract main content from common article selectors
    let content = "";
    const selectors = ["article", "main", ".post-content", ".entry-content", ".article-body", ".content", "#content", ".prose"];
    for (const sel of selectors) {
      const text = $(sel).text().trim();
      if (text && text.length > 200) {
        content = text;
        break;
      }
    }
    // Fallback to body if no article found
    if (!content || content.length < 200) {
      content = $("body").text().trim();
    }

    // Clean and limit the content
    content = content
      .replace(/\s+/g, " ")
      .replace(/[^\w\sığüşöçİĞÜŞÖÇ.,;:?!'"()\-–—]/g, "")
      .trim()
      .slice(0, 3000); // Max 3KB per page

    return content.length > 100 ? content : null;
  } catch (err) {
    return null;
  }
}

/**
 * CONTENT BLENDER: Merge extracted content from multiple sites into synthesized paragraphs
 */
function blendContent(extractedTexts, queryTopic) {
  // Split all texts into sentences
  const allSentences = extractedTexts
    .filter(Boolean)
    .flatMap(text => text.split(/(?<=[.!?])\s+/))
    .filter(s => s.length > 30 && s.length < 300)
    .filter(s => !s.includes("cookie") && !s.includes("gizlilik") && !s.includes("reklam"));

  // Deduplicate similar sentences (basic)
  const unique = [];
  for (const s of allSentences) {
    const isDuplicate = unique.some(u => {
      const words1 = u.toLowerCase().split(" ");
      const words2 = s.toLowerCase().split(" ");
      const overlap = words1.filter(w => words2.includes(w)).length;
      return overlap / Math.max(words1.length, words2.length) > 0.7;
    });
    if (!isDuplicate) unique.push(s);
  }

  // Group into thematic paragraphs (5-7 sentences each)
  const paragraphs = [];
  for (let i = 0; i < unique.length; i += 6) {
    const chunk = unique.slice(i, i + 6).join(" ");
    if (chunk.length > 100) paragraphs.push(chunk);
  }

  return paragraphs.slice(0, 8); // Max 8 rich paragraphs
}

/**
 * AUTOMATION RUNNER V4 — Deep Scraping + Content Blending
 */
const CONTINUOUS = process.argv.includes("--continuous");
const MAX_CONTINUOUS_BATCHES = 50; // Safety limit per continuous session

async function main() {
  console.log("🚀 SERP Research V4 — Deep Scraping + Content Blending Engine");
  console.log(`   Engines: Google → Bing → DDG → Yandex → Synthetic`);
  console.log(`   Mode: ${CONTINUOUS ? "CONTINUOUS (non-stop)" : "SINGLE BATCH"}`);
  console.log("");

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let batchesRun = 0;

  do {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    const startIndex = state.last_index;
    const batchSize = state.batch_size || 20;
    const totalTarget = state.total_target || 1_000_000;

    if (startIndex >= totalTarget) {
      console.log(`🏁 All ${totalTarget} topics processed! Mission complete.`);
      break;
    }

    console.log(`── Batch ${batchesRun + 1} | Index ${startIndex}-${startIndex + batchSize - 1} of ${totalTarget} ──`);

    let processedCount = 0;
    for (let i = startIndex; i < startIndex + batchSize; i++) {
      if (i >= totalTarget) break;

      const slug = blogSlugFromIndex(i);
      const filePath = path.join(DATA_DIR, `${slug}.json`);

      if (fs.existsSync(filePath)) continue;

      const query = slug.replaceAll("-", " ");
      console.log(`[${i}] ${slug}`);

      let { results, paa, source } = await scrapeSerp(query);

      // === DEEP SCRAPE: Visit top results and extract content ===
      let deepContent = [];
      if (source !== "synthetic" && results.length > 0) {
        const linksToScrape = results
          .map(r => r.link)
          .filter(l => l && l.startsWith("http"))
          .slice(0, 5); // Top 5 pages

        for (const link of linksToScrape) {
          const extracted = await deepScrape(link);
          if (extracted) {
            deepContent.push(extracted);
            console.log(`     📄 Extracted ${extracted.length} chars from ${new URL(link).hostname}`);
          }
          await new Promise(r => setTimeout(r, 500)); // Gentle delay between page visits
        }
      }

      // === BLEND CONTENT ===
      const blendedParagraphs = deepContent.length > 0
        ? blendContent(deepContent, query)
        : [];

      // === SYNTHETIC FALLBACK ===
      if (source === "synthetic") {
        const topicKey = Object.keys(semanticMap).find(k => slug.includes(k));
        const insight = topicKey ? semanticMap[topicKey] : `Teknik ekiplerimizin sahadaki gözlemlerine göre ${query} sıklıkla karşılaşılan bir durumdur.`;
        results = [{
          rank: 1,
          title: `${query.charAt(0).toUpperCase() + query.slice(1)} Hakkında Uzman Görüşü`,
          link: "https://www.yetkilikombiservisi.tr/blog",
          snippet: `${insight} Profesyonel müdahale cihazın ömrünü uzatır.`
        }];
        paa = [
          { question: `${query} tehlikeli mi?`, answer: "Güvenlik protokollerine uyulduğu sürece yerinde tespit en güvenli yoldur." },
          { question: `${query} çözümü nedir?`, answer: "Arızanın tipine göre parça değişimi veya sistem temizliği gerekebilir." }
        ];
      }

      if (results.length > 0) {
        const data = {
          slug,
          query,
          source,
          timestamp: new Date().toISOString(),
          serp: results.slice(0, 10),
          deepContent: blendedParagraphs,
          peopleAlsoAsk: source === "synthetic" ? paa : paa.slice(0, 5).map(q => ({
            question: typeof q === "string" ? q : q.question,
            answer: typeof q === "string" ? generateAIAnswer(q, slug) : q.answer
          })),
          insights: results.map(r => r.title).join(" | "),
          contentSources: deepContent.length
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        processedCount++;
        console.log(`  ✅ Saved with ${blendedParagraphs.length} blended paragraphs from ${deepContent.length} sources`);
      }

      const jitter = Math.floor(Math.random() * 3000) + 2000;
      await new Promise(r => setTimeout(r, jitter));
    }

    state.last_index = Math.min(startIndex + batchSize, totalTarget);
    state.timestamp = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

    console.log(`✅ Batch done! ${processedCount} topics processed. Progress: ${state.last_index}/${totalTarget}\n`);
    batchesRun++;

    if (CONTINUOUS && batchesRun < MAX_CONTINUOUS_BATCHES) {
      console.log(`⏳ Cooling down 10s before next batch...`);
      await new Promise(r => setTimeout(r, 10000));
    }

  } while (CONTINUOUS && batchesRun < MAX_CONTINUOUS_BATCHES);

  console.log(`\n🏁 Session complete. ${batchesRun} batches processed.`);
}

main().catch(console.error);
