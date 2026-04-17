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
 * SCRAPER Logic
 */
async function scrapeSerp(query) {
  try {
    const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { 
      headers: getHeaders(),
      timeout: 10000 
    });
    const $ = cheerio.load(response.data);
    const results = [];

    $(".g").each((i, el) => {
      if (results.length >= 5) return;
      const title = $(el).find("h3").text();
      const link = $(el).find("a").attr("href");
      const snippet = $(el).find(".VwiC3b").text() || $(el).find(".st").text();
      if (title && title.length > 5) results.push({ rank: results.length + 1, title, link, snippet });
    });

    // If Google returned something, process PAA
    if (results.length > 0) {
      const paa = [];
      $(".related-question-pair span").each((i, el) => {
        const q = $(el).text().trim();
        if (q && q.endsWith("?") && !paa.includes(q)) paa.push(q);
      });
      return { results, paa, source: "google" };
    }

    throw new Error("No results found on Google (possible block)");

  } catch (error) {
    console.warn(`⚠️ Google limited us for "${query}", trying DuckDuckGo fallback...`);
    
    try {
      // DUCKDUCKGO FALLBACK (Free backup)
      const ddgResponse = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { 
        headers: getHeaders() 
      });
      const $ddg = cheerio.load(ddgResponse.data);
      const results = [];

      $ddg(".result").each((i, el) => {
        if (results.length >= 5) return;
        const title = $ddg(el).find(".result__title").text().trim();
        const link = $ddg(el).find(".result__url").attr("href");
        const snippet = $ddg(el).find(".result__snippet").text().trim();
        if (title) results.push({ rank: results.length + 1, title, link, snippet });
      });

      return { results, paa: [], source: "duckduckgo" };
    } catch (ddgError) {
      console.error(`- All sources failed for "${query}":`, ddgError.message);
      return { results: [], paa: [], source: "error" };
    }
  }
}

function generateAIAnswer(question, topic) {
  const patterns = [
    "Sektörel tecrübemize göre bu durum cihazın verimliliğini korumak adına kritik bir öneme sahiptir; teknik kontrol şarttır.",
    "Genellikle parça yorgunluğu veya sensör hassasiyeti kaynaklıdır, yerinde tespit en sağlıklı çözümdür.",
    "Kullanıcı tarafında filtre temizliği denenebilir, ancak kök sorunun giderilmesi için uzman müdahalesi önerilir."
  ];
  return `Profesyonel bir bakış açısıyla; ${question.replace("?", "")} konusu, ${topic.replaceAll("-", " ")} süreçlerinin en hassas noktalarından biridir. ${patterns[Math.floor(Math.random() * patterns.length)]}`;
}

/**
 * AUTOMATION RUNNER
 */
async function main() {
  console.log("🚀 Starting Autonomous SERP Research...");

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  const startIndex = state.last_index;
  const batchSize = state.batch_size || 30;

  console.log(`- Last index: ${startIndex}`);
  console.log(`- Batch size: ${batchSize}`);

  let processedCount = 0;
  for (let i = startIndex; i < startIndex + batchSize; i++) {
    const slug = blogSlugFromIndex(i);
    const filePath = path.join(DATA_DIR, `${slug}.json`);

    // Skip if already has intelligence
    if (fs.existsSync(filePath)) {
      continue;
    }

    const query = slug.replaceAll("-", " ");
    console.log(`- Researching [${i}]: ${slug}`);
    
    const { results, paa, source } = await scrapeSerp(query);
    
    if (results.length > 0) {
      console.log(`  └ Found ${results.length} results via ${source}`);
      const data = {
        slug,
        query,
        source,
        timestamp: new Date().toISOString(),
        serp: results,
        peopleAlsoAsk: paa.slice(0, 3).map(q => ({
          question: q,
          answer: generateAIAnswer(q, slug)
        })),
        insights: results.map(r => r.title).join(" | ")
      };

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      processedCount++;
    }

    // Human-like Jitter (Random delay between 3-7 seconds)
    const jitter = Math.floor(Math.random() * 4000) + 3000;
    await new Promise(r => setTimeout(r, jitter));
  }

  // Update State
  state.last_index = startIndex + batchSize;
  state.timestamp = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

  console.log(`✅ Batch complete! Processed ${processedCount} new topics.`);
  console.log(`New state: index=${state.last_index}`);
}

main().catch(console.error);
