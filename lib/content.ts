import fs from "fs";
import path from "path";
import type { Brand } from "@/lib/brands";
import type { City, District } from "@/lib/geo";
import type { ServiceKind } from "@/lib/services";
import { serviceLabelFromKind } from "@/lib/services";
import { brandFaultGuides, defaultFaultGuides } from "@/lib/faults";
import { semanticKeywordsByService, technicalInsights, brandExpertNotes, brandServicePlaybooks } from "@/lib/semantics";
import { site } from "@/lib/site";
import { createRng, pickManyUnique, pickOne, shuffle, advancedSpin, spinText } from "@/lib/variation";

const climateRegions: Record<string, { type: string, extraNote: string }> = {
  // Karadeniz (Nemli)
  "trabzon": { type: "nemli", extraNote: "Trabzon'un yoğun nemli ve yağışlı havası, dış ünitelerde korozyon (paslanma) riskini artırdığı için koruyucu kaplama ve klemens temizliğine ekstra önem veriyoruz." },
  "rize": { type: "nemli", extraNote: "Türkiye'nin en çok yağış alan bölgesi olması sebebiyle, Rize'de klima ve kombi bacalarının sızdırmazlık kontrollerini her bakımda çift kademeli yapıyoruz." },
  "samsun": { type: "nemli", extraNote: "Samsun'un sahil şeridindeki tuzlu nem etkisi, cihazların alüminyum peteklerinde erimeye yol açabilir; bu nedenle özel solüsyonlarla yıkama yapıyoruz." },
  "artvin": { type: "nemli", extraNote: "Artvin'in engebeli ve nemli coğrafyasında, cihazların montaj stabilitesini ve rutubet kaynaklı kart arızalarını önleyici testleri standartlaştırdık." },
  "giresun": { type: "nemli", extraNote: "Fındık kurutma mevsimi ve yoğun nem, Giresun'daki klimaların filtrelerinde çok hızlı tıkanma yapar; bu bölgeye özel yüksek debili temizlik uyguluyoruz." },
  "zonguldak": { type: "nemli", extraNote: "Maden ve sanayi etkisiyle birleşen nemli hava, Zonguldak'ta cihazların yanma odalarında kurum birikmesini hızlandırır; derinlemesine temizlik öneriyoruz." },
  // Doğu/Soğuk (Donma riski)
  "erzurum": { type: "soguk", extraNote: "Erzurum'un -30 dereceyi bulan soğuklarında, sirkülasyon pompalarının donma emniyetini ve tesisat suyunun antifriz oranını her kış öncesi muhakkak kontrol ediyoruz." },
  "kars": { type: "soguk", extraNote: "Kars'ın dondurucu ayazında dış hatların donmaması için termal izolasyon kontrollerini ve kombi 'donma koruma' modlarını test ediyoruz." },
  "van": { type: "soguk", extraNote: "Van Gölü havzasının nemli-soğuk yapısı ve kış şartları sebebiyle, genleşme tankı azot basınçlarını kış şartlarına göre %15 daha toleranslı ayarlıyoruz." },
  "sivas": { type: "soguk", extraNote: "Sivas kışında tesisat suyunun viskozitesini ve kombi iyonizasyon ayarlarını, düşük hava sıcaklıklarında bile sorunsuz ateşleme yapacak şekilde kalibre ediyoruz." },
  "agri": { type: "soguk", extraNote: "Ağrı'nın ekstrem kış koşullarında, cihazın dış cephe bağlantılarındaki buzlanma ve hava akış tıkalılarını önleyici teknikleri uyguluyoruz." },
  "ardahan": { type: "soguk", extraNote: "Ardahan'ın dondurucu ikliminde kombi ve ısı pompası NTC sensörlerinin sapma paylarını termal kamera ile ölçerek optimize ediyoruz." },
  // Akdeniz / Ege (Sıcak/Nemli/Kireçli)
  "antalya": { type: "sicak", extraNote: "Antalya'nın tropikal sıcağı ve deniz nemi, buzdolabı kompresörlerini aşırı yorar; biz bu bölgede motor soğutma fanı temizliğini 2 katı titizlikle yapıyoruz." },
  "izmir": { type: "sicak", extraNote: "İzmir'in şebeke suyundaki kalsiyum miktarı çok yüksektir. Bu yüzden bulaşık makinesi ve kombi eşanjörlerini kireçten arındırmak için endüstriyel çözücüler kullanıyoruz." },
  "mersin": { type: "sicak", extraNote: "Mersin'deki aşırı sıcaklar klimaların gaz basıncını limitlere dayandırdığı için, her yaz başında detaylı gaz ölçümü ve kondanser temizliği hayati önem taşır." }
};

// Sentences are split into "Pools". A paragraph is built by picking 1 sentence from each group.
// This creates exponential variations (N * M * P)
const introPools: string[][] = [
  // Sentence 1: The Context/Opening (Empathetic & Local)
  [
    "{area} {civarında|tarafında} {serviceLabel} {canınızı sıkıyorsa|bozulduysa|arıza yaptıysa|beklenmedik bir sorun çıkardıysa}, {hiç merak etmeyin|telaşlanmayın|endişelenmeyin}; {biz buralardayız|hemen yakınınızdayız|profesyonel ekibimizle sahadayız}.",
    "{area} sakinlerinin {serviceLabel} konusundaki {sorunlarını|beklentilerini|hassasiyetlerini} {yakından biliyor|iyi anlıyor|yıllardır gözlemliyor}, {çözüm için|yardımcı olmak için} {tecrübemizi|ustalığımızı|tüm birikimimizi} konuşturuyoruz.",
    "{area} geneli için {serviceLabel} {desteği|tamiri|bakımı} arıyorsanız, {işini bilen|işin ehli|konusuna hakim} ve {güvenilir|dürüst|şeffaf} bir ekip olarak {yanınızdayız|size destekçiyiz|hizmetinizdeyiz}.",
    "{area} {lokasyonunda|bölgesinde} {serviceLabel} {ihtiyacı|gereksinimi} {doğduğunda|oluştuğunda}, {kalıcı çözüm|kesin sonuç} ve {uygun maliyet|ekonomik fiyat} dengesini {gözeterek|ön planda tutarak} {adresinize geliyoruz|kapınızı çalıyoruz}.",
    "{area} içindeki {ev ve iş yerlerine|tüm adreslere} {serviceLabel} {konusunda|alanında} {kesintisiz|hızlı|akıcı} bir servis {deneyimi|süreci} {vadediyoruz|sunuyoruz|sağlıyoruz}.",
    "Eğer {area} çevresindeyseniz and {serviceLabel} ile ilgili bir {aksaklık|problem} yaşıyorsanız, yerel ekibimizin {hızlı müdahale|acil çözüm} kapasitesiyle {size ulaşıyoruz|sorunu çözüyoruz}."
  ],
  // Sentence 2: The Action/Value (Master approach)
  [
    "{İlk iş olarak|Önce} {cihazın|makinenin} {neden sustuğuna|derdine|arıza kaynağına} {bakıyor|inceliyor}, size {yol yordam|yol göstererek|durumu netleştirerek} {bilgi veriyoruz|anlatıyoruz}.",
    "{Ustalık|Tecrübe|Uzmanlık} gerektiren bu {işlemde|süreçte|aşamada}, {cihazın|ürünün} {sağlığını|ömrünü|verimliliğini} {korumak|uzatmak} için en {doğru|sağlıklı|mantıklı} {yöntemi|adımı} uyguluyoruz.",
    "{Donanımlı|Her şeyi tam|Gerekli ekipmana sahip} araçlarımızla {area} {sokaklarında|içinde|yollarında} her an {hareket halindeyiz|hazırız|aktifiz}; {arıza kaydı|servis talebi} sonrası {koşup geliyoruz|gelip bakıyoruz|hemen yönleniyoruz}.",
    "{Gereksiz|Lüzumsuz|Fuzuli} masraf çıkarmadan, {sadece|yalnızca} {müdahale|onarım|değişim} gereken {noktaya|parçaya} odaklanıp {işimizi yapıyoruz|sorunu çözüyoruz|süreci tamamlıyoruz}.",
    "Cihazın {kronik|süregelen} arızalarını {tespit edip|ayırt edip}, {geçici çözümlerle|yüzeysel müdahalelerle} değil {köklü|kalıcı} adımlarla ilerlemeyi {prensip ediniyoruz|tercih ediyoruz}.",
    "{Marka bağımsız|Teknik|Profesyonel} bir bakış açısıyla {area} {temsilciliğimizde|operasyonumuzda} her bir {parçayı|aksamı} {titizlikle|dikkatle} test ediyoruz."
  ],
  // Sentence 3: The Result/Closer (Trust & Result)
  [
    "{Böylece|Bu sayede|Sonuç olarak} {cihazınız|makineniz} {tıkır tıkır|sorunsuz|tertemiz|ilk günkü gibi} çalışmaya {başlar|devam eder} and {evinizdeki|içinizdeki} huzur {yerine gelir|bozulmaz|devam eder}.",
    "{İşimizi|Onarımı|Bakımı} {bitirip|tamamlayıp} {temiz bir şekilde|pırıl pırıl|eksiksiz} teslim ediyor, {area} içinde {güvenilir|başarılı|örnek} servis {hizmetimize|anlayışımıza} devam ediyoruz.",
    "{Teslim etmeden önce|İşlemi bitirince} {cihazın|sistemin} {temel|gerekli|kritik} kontrollerini yapıp {içiniz rahat şekilde|gönül rahatlığıyla} teslim ediyoruz.",
    "{Fiyat|Ücret|Maliyet} konusunda en {başından|baştan} konuşup {anlaşıyor|, el sıkışıyor}, {area} esnafı {samimiyetiyle|dürüstlüğüyle|ahlakıyla} hizmet sunuyoruz.",
    "Yapılan {işlemin|müdahalenin} {arkasında duruyor|takipçisiyiz}, {area} {halkına|sakinlerine} {uzun vadeli|kalıcı} bir güven bağı {sunuyoruz|vadediyoruz}.",
    "{area} {bölgesinde|içinde} {yüzlerce|onlarca} mutlu {müşterimiz|kullanıcımız} arasına sizi de {eklemek|dahil etmek} bizim için değerlidir."
  ]
];

const detailPools: string[][] = [
  // Sentence 1: Process nuance (Natural)
  [
    "{area} {bölgesindeki|tarafındaki} {yoğunluğa|servis akışına|talep yoğunluğuna} göre {saatleri|planlarımızı|zaman dilimini} {birbirimizi üzmeyecek|size en uygun|en verimli} şekilde {ayarlıyoruz|çiziyoruz|belirliyoruz}.",
    "{serviceLabel} {yaparken|sırasında|esnasında} {cihazı|makineyi} {kendi malımız gibi|titizlikle|büyük bir dikkatle} {inceliyor|gözden geçiriyor|analiz ediyor}, {hassas|dikkatli|nokta atışı} müdahale ediyoruz.",
    "{Adresinize|Kapınıza|Konumunuza} geldiğimizde {zamanınızı|vaktinizi} çalmadan {hızlıca|seri bir şekilde|pratikçe} {teşhisimizi|analizimizi|ön tespitimizi} paylaşıyoruz.",
    "{Bölgenin|İlçenin|Semtin} {bazı|farklı|çeşitli} yerlerinde {su kireci|voltaj|nem} gibi sorunlar {olabiliyor|görülebiliyor|etkili olabilir}; biz bunları da {hesaba katıyoruz|dikkate alıyoruz|çözüme dahil ediyoruz}."
  ],
  // Sentence 2: Quality assurance (Craftsmanship)
  [
    "{Kullandığımız|Tercih ettiğimiz|Sisteme taktığımız} {yedek parçaların|komponentlerin|malzemelerin} {kalitesinden|sağlamlığından|dayanıklılığından} emin olmadan {montaj|işlem|değişim} yapmıyoruz.",
    "{Usta|Sertifikalı|Deneyimli} {ekibimiz|arkadaşlarımız|personelimiz} yeni {modelleri|teknolojileri|standartları} {yakından takip ediyor|sürekli inceliyor|eğitimlerle pekiştiriyor}, {eskileri de|klasikleri de|eski nesil cihazları da} avucunun içi gibi biliyor.",
    "{Cihazın|Makinenin} {çalışma|soğutma|ısıtma} performansını {tekrar|iyice|ayrıntılı|birkaç kez} kontrol edip {faturaya| rapora|servis formuna} dürüstçe yazıyoruz.",
    "{Her usta gibi|Prensip olarak|Geleneksel olarak} {iş disiplinine|temizliğe|iş ahlakına} önem veriyor, {arkamızda|çalıştığımız alanda} {dağınıklık|kirlilik|çöp} bırakmıyoruz."
  ]
];

const promisePools: string[][] = [
  [
    "{Sizin|Müşterinin} onayını almadan {bir vidayı|tek bir parçayı|hiçbir aksamı} bile yerinden {oynatmıyoruz|değiştirmiyoruz|sökmüyoruz}.",
    "İşimiz bittikten sonra {cihazı|ürünü} {genel bir bakımdan|temel bir kontrolden|genel revizyondan} {ücretsiz|ekstra ücret almadan|jest olarak} geçiriyoruz.",
    "{Söz verdiğimiz|Kararlaştırdığımız|Randevulaştığımız} saatte {orada olmak|kapınızda belirmek|adreste bulunmak} için {elimizden geleni|tüm gayretimizi|azami dikkatimizi} gösteriyoruz.",
    "{Değişen|Yenilenen|İşlem gören} parçaların {seceresi|takibi|geçmişi} sistemimizde {kayıtlı kalır|saklanır|arşivlenir}, her zaman bize ulaşabilirsiniz."
  ],
  [
    "Cihazı {nasıl daha uzun|daha verimli|daha ekonomik} kullanabileceğinize dair {küçük|faydalı|teknik} {tavsiyeler|usta notları|öneriler} bırakıyoruz.",
    "{Yedek parça|Eksik malzeme|Gerekli komponent} gerektiğinde en {hızlı|seri|güvenilir} kanaldan {çözüm üretiyoruz|tedarik ediyoruz|temin ediyoruz}.",
    "Sadece {tamir|onarım|servis} yapmıyor, {cihazın|makinenin} {sesini|çalışmasını|akışını} dinleyip {rahatlatıyoruz|bakımını yapıyoruz|optimize ediyoruz}.",
    "{area} sakinlerinin {teşekkürü|memnuniyeti|güveni} bizim için en büyük {kazançtır|övünç kaynağıdır|referanstır}."
  ]
];

const processSteps = [
  { title: "Servis kaydı", desc: "Arıza belirtisi + marka/model bilgisini paylaşın." },
  { title: "Randevu planı", desc: "En uygun gün/saat için planlama yapılır." },
  { title: "Yerinde tespit", desc: "Sorun kaynağı belirlenir, işlem/bedel bilgilendirmesi yapılır." },
  { title: "İşlem and test", desc: "Onayınızla işlem yapılır, test edilerek teslim edilir." }
];

const reasons = [
  { title: "Kurumsal süreç", desc: "Tespit → onay → işlem → test adımlarını standartlaştırırız." },
  { title: "Şeffaf bilgilendirme", desc: "İşlem öncesi bilgilendirir, onaysız işlem yapmayız." },
  { title: "Planlı servis", desc: "Yoğunluğa göre en hızlı randevuyu planlarız." },
  { title: "Temiz işçilik", desc: "Alan koruma, düzenli teslim and temel kontroller." }
];

const kombiIssues = [
  "Isıtmıyor / petekler ısınmıyor",
  "Sıcak su dalgalanması",
  "Basınç düşmesi / su sızdırma",
  "Ateşleme arızası (3C, 227 vb.)",
  "Fandan ses gelmesi",
  "Anakart / kart arızaları",
  "Eşanjör kirliliği / kireçlenme",
  "Genleşme tankı havası bitmesi",
  "Doldurma musluğu kırılması",
  "Hata kodu uyarıları"
];

const klimaIssues = [
  "Yetersiz soğutma/ısıtma",
  "Koku problemi",
  "Su akıtma",
  "Ses/titreşim",
  "Gaz basıncı sorunları",
  "Filtre and iç ünite kirliliği"
];

const beyazEsyaIssues = [
  "Su almıyor / su boşaltmıyor",
  "Gürültü / titreşim",
  "Isıtmıyor / kurutmuyor",
  "Soğutmuyor / aşırı buzlanma",
  "Programda takılma",
  "Koku / temizlik ihtiyacı"
];

const endustriyelIssues = [
  "Merkezi sistem ısıtmama arızası",
  "VRF klima iletişim hataları",
  "Soğuk hava deposu derece düşüşü",
  "Endüstriyel mutfak termostat sorunları",
  "Sirkülasyon pompası gürültü/titreşim",
  "Otomasyon and kontrol paneli hataları"
];

const faqByService: Record<string, { q: string; a: string }[]> = {
  kombi: [
    { q: "{area} bölgesinde kombi bakımı ne kadar sürer?", a: "Standart bir kombi bakımı yaklaşık 30-45 dakika sürer. Bu süreçte yanma odası temizliği, genleşme tankı kontrolü and sızdırmazlık testleri titizlikle yapılır." },
    { q: "Kombi basıncı neden sürekli düşüyor?", a: "Basınç düşmesi genellikle tesisattaki bir sızıntıdan veya genleşme tankındaki hava eksikliğinden kaynaklanır. {area} ekiplerimiz adresinize gelerek bu sorunu yerinde çözer." },
    { q: "Peteklerimin sadece üstü ısınıyor, ne yapmalıyım?", a: "Bu durum genellikle tesisatta çamurlaşma olduğunu gösterir. {area} geneli profesyonel petek temizliği hizmetimizle sirkülasyon kanallarını açıyoruz." },
    { q: "Kombiden gelen garip sesler normal mi?", a: "Hayır, sesli çalışma genellikle fan motoru veya sirkülasyon pompası arızasına işarettir. {area} içinde hızlı müdahale ile parçaya zarar vermeden onarım yapıyoruz." },
    { q: "Kombi hata kodu veriyor, kendim müdahale edebilir miyim?", a: "Hata kodları teknik bir sorunu işaret eder. Gaz kaçağı gibi risklere karşı {area} uzman ekiplerimizin kontrolü her zaman daha güvenlidir." }
  ],
  klima: [
    { q: "{area} civarında klima gaz dolumu yapıyor musunuz?", a: "Evet, her marka klima için R32 and R410 gaz dolumu gerçekleştiriyoruz. Önce kaçak testi yapıp sızıntıyı önlüyor, sonra dolum yapıyoruz." },
    { q: "Klima iç ünitesinden neden su akıtıyor?", a: "Klima drenaj hattının tıkanması veya montaj eğimi hatası buna neden olabilir. {area} operasyonumuz dahilinde tıkanıklığı hemen gideriyoruz." },
    { q: "Klimadan gelen kötü kokunun sebebi nedir?", a: "İç ünite peteklerinde biriken bakteri and tozlar koku yapar. İlaçlı dezenfeksiyon and kapsamlı bakım ile kokuyu tamamen yok ediyoruz." },
    { q: "Klima bakımı performansı artırır mı?", a: "Kesinlikle. Temiz bir klima daha az enerji harcayarak daha hızlı soğutma/ısıtma yapar. {area} için periyodik bakım öneririz." }
  ],
  "beyaz-esya": [
    { q: "Çamaşır makinesi neden aşırı titriyor and ses çıkarıyor?", a: "Amortisörlerin bitmesi veya rulman arızası buna sebep olur. {area} içinde yerinde parça değişimi ile makinenizi sessiz hale getiriyoruz." },
    { q: "Bulaşık makinesi tabanında su bırakıyor, arıza mı?", a: "Pompa motoruna bir cisim kaçmış veya gider hortumu tıkanmış olabilir. {area} çevresinde hızlı servisimizle sorunu yerinde gideriyoruz." },
    { q: "Buzdolabı soğutmuyor ama ışığı yanıyor, sebebi nedir?", a: "Muhtemelen kompresör (motor) veya gaz devresinde bir tıkanıklık oluşmuştur. {area} uzman kadromuzla motor değişimine kadar her aşamada yanınızdayız." },
    { q: "Beyaz eşya tamiri için orijinal parça kullanıyor musunuz?", a: "Evet, cihazın ömrünü korumak adına her zaman orijinal veya onaylı yüksek kaliteli yedek parçalar tercih ediyoruz." }
  ],
  endustriyel: [
    { q: "Endüstriyel mutfak ekipmanları için periyodik bakım var mı?", a: "Evet, restoran and oteller için kurumsal bakım sözleşmeleri yapıyoruz. Gaz sızdırmazlığı and termostat kontrolleri düzenli yapılmalıdır." },
    { q: "Merkezi sistem kazan dairesi arızalarına bakıyor musunuz?", a: "Kesinlikle. Yüksek kapasiteli kazanlar and brülör ayarları konusunda {area} genelinde uzman kadromuz mevcuttur." }
  ]
};

const districtOperationNotes = [
  "randevu saatlerini bina yogunlugu and ayni gun saha rotasi ile birlikte optimize ediyoruz",
  "yerinde tespitte cihazin kurulu oldugu hacim, tesisat duzeni and kullanim senaryosunu birlikte not ediyoruz",
  "tekrar eden arizalarda sadece cihaz degil elektrik, su and havalandirma kosullarini da birlikte degerlendiriyoruz",
  "mobil ekip planini ulasim akslari, gun ici talep yogunlugu and servis kayit saatine gore kuruyoruz",
  "parca gereken senaryolarda sure tahminini ilce bazli operasyon akisi ile birlikte netlestiriyoruz",
  "ayni belirtiyi ureten farkli nedenleri ayiklamak icin ilce icindeki kullanim farklarini dikkate aliyoruz"
];

function issuesFor(kind: ServiceKind) {
  if (kind === "kombi") return kombiIssues;
  if (kind === "klima") return klimaIssues;
  if (kind === "endustriyel") return endustriyelIssues;
  return beyazEsyaIssues;
}

/**
 * Composite Paragraph Builder
 * Picks 1 sentence from each pool group to create a unique paragraph.
 */
function composeParagraph(rng: any, pools: string[][], vars: Record<string, string>): string {
  return pools.map(pool => advancedSpin(rng, pickOne(rng, pool), vars)).join(" ");
}

export type LocalServicePageContent = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  details: string[];
  districtProfileTitle?: string;
  districtProfileBullets?: string[];
  serviceScopeTitle: string;
  serviceScopeBullets: string[];
  differentiationTitle: string;
  differentiationBullets: string[];
  brandFocusTitle?: string;
  brandFocusBullets?: string[];
  process: Array<{ title: string; desc: string }>;
  reasons: Array<{ title: string; desc: string }>;
  highlights: string[];
  commonIssues: string[];
  faqs: Array<{ q: string; a: string }>;
  whyUsTitle: string;
  trustSignals: string[];
  semanticKeywords: string[];
  localProof: string;
  technicalInsights: string[];
  expertNote?: { title: string; content: string };
  peopleAlsoAsk?: Array<{ question: string; answer: string }>;
  faultGuide?: Array<{ code: string; meaning: string; solution: string }>;
  quickSummary?: {
    title: string;
    items: string[];
    answer: string;
  };
};

export function buildLocalServicePageContent(input: {
  city: City;
  district?: District | null;
  serviceKind: ServiceKind;
  brand?: Brand | null;
}) {
  const { city, district, serviceKind, brand } = input;

  const serviceLabel = serviceLabelFromKind(serviceKind);
  const area = city.slug === "turkiye" 
    ? "Türkiye" 
    : district 
      ? `${city.name} ${district.name}` 
      : city.name;

  const districtsPreview = city.districts
    .filter((d) => d.slug !== district?.slug)
    .slice(0, 4)
    .map((d) => d.name);
  const districtIndex = district ? city.districts.findIndex((d) => d.slug === district.slug) : -1;
  const nearbyDistrictNames = district
    ? city.districts
        .filter((d) => d.slug !== district.slug)
        .sort((a, b) => {
          const aIdx = city.districts.findIndex((x) => x.slug === a.slug);
          const bIdx = city.districts.findIndex((x) => x.slug === b.slug);
          return Math.abs(aIdx - districtIndex) - Math.abs(bIdx - districtIndex);
        })
        .slice(0, 4)
        .map((d) => d.name)
    : [];

  const rng = createRng([city.slug, district?.slug ?? "city", serviceKind, brand?.slug ?? ""].join("|"));

  const baseTitle = brand ? `${area} ${brand.name} ${serviceLabel}` : `${area} ${serviceLabel}`;

  // elite Semantic Intro Construction
  const brandNote = brand ? brandExpertNotes[brand.slug]?.[serviceKind] : "";
  const brandPlaybook = brand ? brandServicePlaybooks[brand.slug]?.[serviceKind] : null;
  const catInsights = (technicalInsights as Record<string, string[]>)[serviceKind] || [];
  const techNote = pickOne(rng, catInsights.length > 0 ? catInsights : [""]);

  const vars = { 
    area, 
    serviceLabel, 
    brand: brand?.name ?? "", 
    city: city.name, 
    district: district?.name || area,
    "district.name": district?.name || area // Added for compatibility with older templates if any
  };

  const intro = brandNote 
    ? advancedSpin(rng, `{area} {çevresinde|genelinde} {brand} {serviceLabel} {taleplerinizde|ihtiyaçlarınızda}, ${brandNote} {area} {geneline|her noktasına} yayılan {mobil|gezici} ekiplerimizle {yerinde|adreste} tespit and {profesyonel|kurumsal} müdahale süreçlerini {standartlaştırıyoruz|yürütüyoruz}.`, vars)
    : techNote
    ? advancedSpin(rng, `{area} sakinlerine {sunduğumuz|verdiğimiz} {serviceLabel} {desteğinde|hizmetinde}, ${techNote} Bu {bilinçle|anlayışla}, her işlemde önce {doğru|hassas} teşhis ardından {kalıcı|kesin} çözüm {prensibiyle|odağıyla} hareket ediyoruz.`, vars)
    : composeParagraph(rng, introPools, vars);

  const details = [
    brand 
      ? advancedSpin(rng, `{brand} {serviceLabel} {hizmetinde|işlemlerinde} cihazın {teknolojik|donanımsal} mimarisine {uygun|has} {orijinal|onaylı} veya {yüksek kaliteli|nitelikli} yedek parça kullanımı, {verimliliğin|performansın} korunması açısından {önceliğimizdir|temel kuralımızdır}.`, vars)
      : advancedSpin(rng, `{serviceLabel} {sürecinde|operasyonunda} cihazın {mevcut|güncel} performans verilerini ({ısı|sıcaklık}, basınç, akım) {analiz ederek|inceleyerek} sadece arızayı değil, gelecekte {oluşabilecek|meydana gelebilecek} riskleri de {raporluyoruz|belirtiyoruz}.`, vars),
    composeParagraph(rng, detailPools, vars),
    ...(brandPlaybook?.proofPoints?.map(p => advancedSpin(rng, p, vars))?.slice(0, 1) ?? [])
  ];

  const nearbyAreaNames = district
    ? [district.name, ...districtsPreview]
    : pickManyUnique(rng, city.districts.map((d) => d.name), 4);
    
  const scopeEntity = brand ? `${brand.name} ${serviceLabel}` : serviceLabel;
  const serviceScopeTitleTemplate = district
    ? `${district.name} {ve Yakın Çevresinde|Bölgesinde} {scopeEntity} {Kapsamımız|Hizmetimiz}`
    : `${city.name} {Genelinde|İlinde} {scopeEntity} {Kapsamımız|Ağımız}`;
  const serviceScopeTitle = advancedSpin(rng, serviceScopeTitleTemplate, { ...vars, scopeEntity });

  const serviceScopeBullet1 = advancedSpin(
    rng,
    `{area} için {servis kaydı|arıza kaydı} açtığınızda {scopeEntity} {taleplerini|ihtiyaçlarını} {adresinize olan|bölgedeki} ekibimize {hızlıca|vakit kaybetmeden} {iletiyoruz|yönlendiriyoruz}.`,
    { ...vars, scopeEntity }
  );

  const serviceScopeBullet2 = nearbyAreaNames.length
    ? advancedSpin(
        rng,
        `{scopeEntity} {planlamasında|çalışmalarında} {sıkça|her gün} {yolumuzun düştüğü|bulunduğumuz} yerler: ${nearbyAreaNames.join(", ")}.`,
        { ...vars, scopeEntity }
      )
    : advancedSpin(
        rng,
        `{scopeEntity} {çalışmalarında|ekiplerimizin dağılımında} {city} {genelindeki|içindeki} {talepleri|kayıtları} {titizlikle|sırasıyla} {eşliyoruz|yönetiyoruz}.`,
        { ...vars, scopeEntity }
      );

  const serviceScopeBullet3 = brand
    ? advancedSpin(
        rng,
        `{brand} cihazlarda {model ve hata|arıza} {belirtisini|kodunu} {not alarak|sisteme girerek} parça {uyumunu|hazırlığını} {önceden|gelmeden önce} {netleştiriyoruz|bakıyoruz}.`,
        vars
      )
    : advancedSpin(
        rng,
        `{serviceLabel} {işlerinde|taleplerinde} cihazın {kullanım durumu|geçmişi}, {bina|tesisat} yapısı and eski {tamirleri|müdahaleleri} {ustalarımızca|birlikte} {incelenir|gözden geçirilir}.`,
        vars
      );

  const serviceScopeBullet4 =
    serviceKind === "kombi"
      ? advancedSpin(
          rng,
          `{area} {için|tarafındaki} kombi {işlerinde|şikayetlerinde} basınç, {yanma|ateşleme} and {sıcak su|ısıtma} {durumunu|akışını} bir arada {çözüyoruz|kontrol ediyoruz}.`,
          vars
        )
      : serviceKind === "klima"
      ? advancedSpin(
          rng,
          `{area} {için|tarafındaki} klima {işlerinde|şikayetlerinde} {gaz|performans} dengesi, {su akıtma|drenaj} and {hijyen|temizlik} {durumunu|seviyesini} raporluyoruz.`,
          vars
        )
      : serviceKind === "beyaz-esya"
      ? advancedSpin(
          rng,
          `{area} {için|tarafındaki} beyaz eşya {işlerinde|şikayetlerinde} {elektrik|kart}, {su tahliyesi|pompa} and {program|yıkama} {akışını|düzenini} test ediyoruz.`,
          vars
        )
      : advancedSpin(
          rng,
          `{area} {için|tarafındaki} {kurumsal|profesyonel} işlerde {sistem|çalışma} sürekliliğini and {arıza|teknik} riskleri {birlikte|ustalıkla} ele alıyoruz.`,
          vars
        );

  const serviceScopeBullets = [
    serviceScopeBullet1,
    serviceScopeBullet2,
    serviceScopeBullet3,
    serviceScopeBullet4
  ];

  const highlights = pickManyUnique(rng, promisePools.flat(), 4).map(h => advancedSpin(rng, h, vars));
  const processPicked = pickManyUnique(rng, processSteps, 4);
  const reasonsPicked = pickManyUnique(rng, reasons, 4);
  
  const rawIssues = [...issuesFor(serviceKind), ...(brandPlaybook?.issueFocus ?? [])];
  const commonIssues = pickManyUnique(rng, rawIssues, 6).map(issue => {
    return rng() > 0.4 
      ? advancedSpin(rng, pickOne(rng, [`{area} ${issue}`, `${issue} {area}`]), vars)
      : issue;
  });

  const faqs = pickManyUnique(rng, (faqByService as any)[serviceKind] || faqByService.kombi, 5).map((faq: any) => ({
    q: advancedSpin(rng, faq.q, vars),
    a: advancedSpin(rng, faq.a, vars)
  }));

  const faultGuide = brand ? brandFaultGuides[brand.slug]?.[serviceKind] || defaultFaultGuides[serviceKind] : defaultFaultGuides[serviceKind];

  const quickSummaryItems = pickManyUnique(rng, [
    `{30 dakikada|Hızlı} {mobil|gezici} servis ekipleri`,
    `{1 yıl|Garantili} parça and işçilik güvencesi`,
    `{Şeffaf|Dürüst} fiyatlandırma politikası`,
    `{Uzman|Sertifikalı} teknisyen kadrosu`,
    `{Orijinal|Onaylı} yedek parça kullanımı`
  ], 3).map(s => advancedSpin(rng, s, vars));

  const quickSummaryAnswer = advancedSpin(rng, `{area} {bölgesinde|genelinde} {serviceLabel} {ihtiyaçlarınız|problemleriniz} için {en hızlı|en güvenilir} çözümü {uzman|profesyonel} kadromuzla sunuyoruz. {Hemen arayıp|Kayıt oluşturup} 30 dakikada servis {desteği|hizmeti} alabilirsiniz.`, vars);

  return {
    title: advancedSpin(rng, "{area} {serviceLabel} | {Garantili|Hızlı} Servis | {businessName}", { ...vars, businessName: site.businessName }),
    description: advancedSpin(rng, "{area} {serviceLabel} hizmeti için {hızlı|seri} randevu and {garantili|uzman} müdahale. {Hemen arayın!|Randevu için arayın.}", vars),
    h1: advancedSpin(rng, "{area} {serviceLabel}", vars),
    intro,
    details,
    serviceScopeTitle,
    serviceScopeBullets,
    differentiationTitle: "Kalite and Güven Odaklı Hizmet",
    differentiationBullets: highlights,
    process: processPicked,
    reasons: reasonsPicked,
    highlights,
    commonIssues,
    faqs,
    whyUsTitle: advancedSpin(rng, "{area} İçin Neden Biz?", vars),
    trustSignals: [
      "{1 Yıl} Parça Garantisi",
      "{Hızlı} Mobil Servis",
      "{Sertifikalı} Uzman Kadro",
      "{7/24} Destek Hattı"
    ].map(s => advancedSpin(rng, s, vars)),
    semanticKeywords: semanticKeywordsByService[serviceKind] || [],
    localProof: `${area} genelinde bugüne kadar yüzlerce başarılı ${serviceLabel.toLowerCase()} işlemi gerçekleştirdik.`,
    technicalInsights: (technicalInsights as any)[serviceKind] || [],
    faultGuide,
    expertNote: brandNote ? {
      title: advancedSpin(rng, "{brand} Uzman Notu", vars),
      content: advancedSpin(rng, brandNote, vars)
    } : undefined,
    districtProfileTitle: district ? advancedSpin(rng, `{district} Hizmet Profili`, vars) : undefined,
    districtProfileBullets: district ? [
      advancedSpin(rng, `{district} bölgesinde {serviceLabel} taleplerini öncelikli rotaya alıyoruz.`, vars),
      advancedSpin(rng, `Bölgedeki su sertliği and şebeke şartlarını cihaz ayarlarında dikkate alıyoruz.`, vars),
      advancedSpin(rng, `Sıcaklık değişimlerine göre cihazın verim ayarlarını optimize ediyoruz.`, vars)
    ] : undefined,
    brandFocusTitle: brand ? advancedSpin(rng, "{brand} Teknik Uzmanlık", vars) : undefined,
    brandFocusBullets: brand ? [
      advancedSpin(rng, "{brand} cihazların iç yapısına and parça şemalarına hakim yetkin teknisyenler.", vars),
      advancedSpin(rng, "En güncel arıza kodları and çözüm protokolleri ile hızlı müdahale.", vars),
      advancedSpin(rng, "{brand} standartlarında parça değişimi and test süreçleri.", vars)
    ] : undefined,
    quickSummary: {
      title: advancedSpin(rng, "{area} Servis Özeti", vars),
      items: quickSummaryItems,
      answer: quickSummaryAnswer
    },
    peopleAlsoAsk: [
      {
        question: advancedSpin(rng, "{area} bölgesinde servis ücreti ne kadar?", vars),
        answer: advancedSpin(rng, "{area} geneli servis ücretlerimizi şeffaf bir şekilde paylaşıyoruz. Detaylı bilgi için servis ücretleri sayfamızı ziyaret edebilir veya bizi arayabilirisiniz.", vars)
      },
      {
        question: advancedSpin(rng, "{serviceLabel} için aynı gün randevu alabilir miyim?", vars),
        answer: advancedSpin(rng, "Evet, ekiplerimizin saha yoğunluğuna göre genellikle aynı gün içinde adresinize ulaşıyoruz.", vars)
      }
    ]
  };
}

export function buildCityLandingContent(city: City) {
  const area = city.name;
  const rng = createRng(`city|${city.slug}`);
  const vars = { area, city: city.name };
  
  const intro = composeParagraph(rng, introPools, vars);
  
  const faqs = pickManyUnique(rng, faqByService.kombi, 5).map(faq => ({
    q: advancedSpin(rng, faq.q, vars),
    a: advancedSpin(rng, faq.a, vars)
  }));

  const quickSummaryItems = pickManyUnique(rng, [
    `{Tüm ilçelerde|Şehir genelinde} {hızlı|mobil} servis ağı`,
    `{Kombi, klima and beyaz eşya|Tüm cihazlarda} uzmanlık`,
    `{Aynı gün|Hızlı} randevu imkanı`,
    `{Dürüst|Şeffaf} servis ücretleri`
  ], 3).map(s => advancedSpin(rng, s, vars));

  const quickSummaryAnswer = advancedSpin(rng, `{city} {ilinde|genelinde} tüm teknik servis {ihtiyaçlarınız|talepleriniz} için {tek bir|merkezi} noktadan hizmet sağlıyoruz. Profesyonel ekiplerimizle kapınıza kadar geliyoruz.`, vars);

  return {
    title: advancedSpin(rng, "{area} Teknik Servis | Kombi, Klima and Beyaz Eşya", vars),
    description: advancedSpin(rng, "{area} genelinde profesyonel teknik servis hizmeti. Tüm marka and cihazlar için hızlı çözüm.", vars),
    intro,
    faqs,
    quickSummary: {
      title: advancedSpin(rng, "{area} Hizmet Özeti", vars),
      items: quickSummaryItems,
      answer: quickSummaryAnswer
    }
  };
}

export function buildCityBrandLandingContent(city: City, brand: Brand) {
  const area = city.name;
  const rng = createRng(`city-brand|${city.slug}|${brand.slug}`);
  const vars = { area, city: city.name, brand: brand.name, serviceLabel: "Servisi" };
  
  const intro = advancedSpin(rng, `{area} {bölgesinde|genelinde} {brand} cihazlarınız için {yetkin|profesyonel} teknik servis {desteği|çözümleri} sunuyoruz. {Cihazınız|Makineniz} ne olursa olsun yerinde müdahale ediyoruz.`, vars);
  
  const bullets = pickManyUnique(rng, [
    `{brand} cihazlara {has|özel} {ekipman|teknik} altyapı`,
    `{area} genelinde {hızlı|mobil} ulaşım`,
    `{1 yıl|Garantili} yedek parça desteği`,
    `{Şeffaf|Dürüst} bilgilendirme süreci`
  ], 4).map(s => advancedSpin(rng, s, vars));

  const faqs = [
    { q: `${area} içinde ${brand.name} servisi ne kadar sürede gelir?`, a: `${area} genelindeki ekiplerimizle genelde 30-60 dakika içinde yanınızda olmayı hedefliyoruz.` },
    { q: `${brand.name} tamiri yerinde mi yapılır?`, a: `Evet, cihazların büyük çoğunluğu yerinde tamir edilir. Ağır arızalarda atölyeye alınabilir.` },
    { q: "İşlemler garantili mi?", a: `Tüm ${brand.name} işlemleri and parçalar 1 yıl garantimiz altındadır.` }
  ];

  const quickSummaryAnswer = advancedSpin(rng, `{area} {içinde|genelinde} {brand} {cihazlarınızın|ürünlerinizin} {profesyonel|yetkin} çözüm ortağıyız. {Aynı gün|Hızlı} servis kaydı için bize ulaşabilirsiniz.`, vars);

  return {
    title: advancedSpin(rng, "{area} {brand} Servisi | Garantili Teknik Destek", vars),
    description: advancedSpin(rng, "{area} {brand} servisi için hızlı randevu and orijinal parça desteği. Profesyonel kadro.", vars),
    intro,
    bullets,
    faqs: faqs.map(f => ({
      q: advancedSpin(rng, f.q, vars),
      a: advancedSpin(rng, f.a, vars)
    })),
    quickSummary: {
      title: advancedSpin(rng, "{brand} Servis Özeti", vars),
      items: bullets,
      answer: quickSummaryAnswer
    }
  };
}

export function buildBrandLandingContent(brand: Brand) {
  const rng = createRng(`brand|${brand.slug}`);
  const vars = { area: "Türkiye", brand: brand.name, serviceLabel: "Servisi" };
  
  const intro = advancedSpin(rng, `Türkiye genelinde {brand} cihazlarınız için {kapsamlı|profesyonel} teknik destek and servis {yönlendirmesi|hizmeti} sağlıyoruz. {Uzman|Deneyimli} kadromuzla yanınızdayız.`, vars);
  
  const bullets = pickManyUnique(rng, [
    `{brand} markasına özel {uzmanlık|teknik}`,
    `{81 ilde|Ülke genelinde} yaygın ağ`,
    `{Hızlı|Kolay} servis kaydı`,
    `{Güvenilir|Kurumsal} çözüm ortağı`
  ], 4).map(s => advancedSpin(rng, s, vars));

  const faqs = [
    { q: `${brand.name} servisi hangi şehirlerde var?`, a: `Türkiye'nin 81 ilinde and tüm büyük ilçelerinde ${brand.name} teknik destek ağımız mevcuttur.` },
    { q: "Servis kaydı nasıl açılır?", a: "Hattımızı arayarak veya web sitemiz üzerinden marka and model belirterek dakikalar içinde kayıt oluşturabilirsiniz." }
  ];

  const quickSummaryAnswer = advancedSpin(rng, `Türkiye genelinde {brand} {cihazları|ürünleri} için {yetkin|profesyonel} teknik servis {yönlendirmesi|desteği} sağlıyoruz. {Uzman|Deneyimli} kadromuzla {81 ilde|ülke genelinde} aktif hizmet veriyoruz.`, vars);

  return {
    title: advancedSpin(rng, "{brand} Servisi | Türkiye Geneli Teknik Destek", vars),
    description: advancedSpin(rng, "{brand} cihazlar için Türkiye genelinde profesyonel servis desteği and arıza çözümleri.", vars),
    intro,
    bullets,
    faqs: faqs.map(f => ({
      q: advancedSpin(rng, f.q, vars),
      a: advancedSpin(rng, f.a, vars)
    })),
    quickSummary: {
      title: advancedSpin(rng, "{brand} Kurumsal Özet", vars),
      items: bullets,
      answer: quickSummaryAnswer
    }
  };
}

export function buildDistrictLandingContent(city: City, district: District) {
  const area = `${city.name} ${district.name}`;
  const rng = createRng(`district|${city.slug}|${district.slug}`);
  const vars = { area, city: city.name, district: district.name, serviceLabel: "Teknik Servis" };
  
  const intro = advancedSpin(rng, `{area} {bölgesinde|tarafında} {kombi, klima and beyaz eşya|teknik cihazlarınız} için {hızlı|yerinde} servis and arıza tespiti {yapıyoruz|sunuyoruz}.`, vars);
  
  const bullets = pickManyUnique(rng, [
    `{district} içine {en hızlı|30 dakikada} ulaşım`,
    `{Donanımlı|Hazır} mobil ekipler`,
    `{Dürüst|Şeffaf} bilgilendirme süreci`,
    `{Kaliteli|Garantili} işçilik`
  ], 4).map(s => advancedSpin(rng, s, vars));

  const faqs = pickManyUnique(rng, faqByService.kombi, 3).map(faq => ({
    q: advancedSpin(rng, faq.q, vars),
    a: advancedSpin(rng, faq.a, vars)
  }));

  const quickSummaryAnswer = advancedSpin(rng, `{area} {bölgesi|tarafı} {kombi, klima and beyaz eşya|cihazlarınız} için {hızlı|aktif} teknik servis {noktasıdır|merkezidir}. {Aynı gün|Yerinde} hizmet için kayıt oluşturabilirsiniz.`, vars);

  return {
    h1: advancedSpin(rng, `{area} Teknik Servis`, vars),
    intro,
    bullets,
    faqs,
    quickSummary: {
      title: advancedSpin(rng, `{district} Servis Bilgileri`, vars),
      items: bullets,
      answer: quickSummaryAnswer
    }
  };
}
