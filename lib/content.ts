import fs from "fs";
import path from "path";
import type { Brand } from "@/lib/brands";
import type { City, District } from "@/lib/geo";
import type { ServiceKind } from "@/lib/services";
import { serviceLabelFromKind } from "@/lib/services";
import { semanticKeywordsByService, technicalInsightsMap, brandExpertNotes, brandServicePlaybooks } from "@/lib/semantics";
import { site } from "@/lib/site";
import { createRng, pickManyUnique, pickOne, shuffle } from "@/lib/variation";

const climateRegions: Record<string, { type: string, extraNote: string }> = {
  // Karadeniz (Nemli)
  "trabzon": { type: "nemli", extraNote: "Bölgenin yüksek nem oranı cihazların elektronik kartlarında oksitlenmeye yol açabildiği için onarım sonrası nem önleyici izolasyon kontrollerini muhakkak yapıyoruz." },
  "rize": { type: "nemli", extraNote: "Yüksek nemli havası sebebiyle fan motoru ve elektronik bileşenlerde paslanma riskini özel spreylerle minimize ediyoruz." },
  "samsun": { type: "nemli", extraNote: "Nemin etkilediği yoğuşma kanallarını ve devre elemanlarını detaylıca temizliyor, korozyon riskine karşı önlem alıyoruz." },
  "artvin": { type: "nemli", extraNote: "Karadeniz iklimine has rutubet faktörü yüzünden ateşleme proplarını ve sensör yuvalarını kalibre ediyoruz." },
  "giresun": { type: "nemli", extraNote: "Tesisat suyuna karışan nem kaynaklı tortuyu filtrelemek adına ekstra eşanjör kontrolü sağlıyoruz." },
  "zonguldak": { type: "nemli", extraNote: "Havadan kaynaklı filtre tıkanıklıkları ve oksitlenme problemlerine karşı ekstra koruyucu bakım sunuyoruz." },
  // Doğu/Soğuk (Donma riski)
  "erzurum": { type: "soguk", extraNote: "Bölgenin zorlu kış şartlarında tesisat donma riskine karşı dış izalasyon ve antifriz korumalı su devirdaim testlerini es geçmiyoruz." },
  "kars": { type: "soguk", extraNote: "Eksi derecelerde çalışan cihazların genleşme tankı zarlarının çatlamasını önlemek için gaz-basınç oranını kış moduna göre ayarlıyoruz." },
  "van": { type: "soguk", extraNote: "Sıfırın altındaki sıcaklıklarda cihazın kompresör/pompa zorlanmalarını önlemek adına kışlık vizkosite ayarlarında motor bakımı yapıyoruz." },
  "sivas": { type: "soguk", extraNote: "Aşırı soğuklarda ateşleme gecikmelerini önlemek için valf ve iyonizasyon ayarlarını kışlık hassasiyete çekiyoruz." },
  "agri": { type: "soguk", extraNote: "Dış ünite buzlanması veya tesisat büzüşmesine karşı termal sargı ve basınç optimizasyonları uyguluyoruz." },
  "ardahan": { type: "soguk", extraNote: "Donma emniyet sistemlerinin tam kapasite çalıştığından emin olmak için NTC sensörlerini dijital ölçüm aletleriyle sınıyoruz." },
  // Akdeniz / Ege (Sıcak/Nemli/Kireçli)
  "antalya": { type: "sicak", extraNote: "Sıcak ve tuzlu nemin cihaz dış gövdesi ile radyatörlerine verdiği zararı engellemek için aside dayanıklı temizleyiciler kullanıyoruz." },
  "izmir": { type: "sicak", extraNote: "Şebeke suyunun yüksek kireç oranı plakalı eşanjörlerde tıkanmaya yol açar; bu bölgede asitli yıkama ve kireç kırıcı filtreleri çok önemsiyoruz." },
  "mersin": { type: "sicak", extraNote: "Aşırı nem ve yoğun kullanım sebebiyle filtre jenerasyonunun hızlı dolduğunu bildiğimizden hepa ve polen temizliklerinde çift solüsyon uyguluyoruz." },
  "mugla": { type: "sicak", extraNote: "Sıcak iklim cihazı fazlasıyla yorduğu için kompresör termik akım testlerini standart müdahalemizin bir parçası yaptık." },
  "aydin": { type: "sicak", extraNote: "Bölgesel olarak şebeke suyunun tortulu yapısından dolayı devirdaim pompalarında oluşabilecek kilitlenmelere karşı önceden rotor temizliği yapıyoruz." },
  // İç Anadolu (Karasal / Kireçli)
  "ankara": { type: "karasal", extraNote: "Soğuk ayazların ve kireçli şebeke suyunun yarattığı çift yönlü yıpranmayı engellemek için cihazın hem ısı sensörlerini hem de filtre kireç tutucularını optimize ediyoruz." },
  "konya": { type: "karasal", extraNote: "Karasal iklimin ani ısı değişimleri elektronik kartları zorladığından voltaj ölçümlerini yapıyor ve tesisat suyunun kireç haritasına göre kimyasal döküyoruz." },
  "kayseri": { type: "karasal", extraNote: "Gece gündüz sıcaklık farkının yüksek olduğu bölgede cihaz gövdesindeki genleşme çatlaklarına karşı sızdırmazlık kontrollerini şiddetle öneriyoruz." },
  "eskisehir": { type: "karasal", extraNote: "Şehir sularındaki kalsiyum yoğunluğu yüksek olduğu için, üç yollu vanalarda oluşabilecek kireç kilitlenmesini asit banyosu tekniğiyle tamamen çözüyoruz." }
};

const introTemplates = [
  "{area} için {serviceLabel} taleplerinde hızlı planlama, net bilgilendirme ve işlem sonrası kontrol ile ilerliyoruz.",
  "{area} bölgesinde {serviceLabel} ihtiyacınızda arıza tespiti → onay → işlem → test adımlarını standartlaştırdık.",
  "{area} için {serviceLabel} desteğinde amacımız: doğru tespit, doğru parça ve temiz işçilikle kalıcı çözüm.",
  "{area} genelinde {serviceLabel} hizmetini randevulu ve planlı şekilde yürütür, süreç boyunca bilgilendiririz.",
  "{area} için {serviceLabel} sürecini kayıt, randevu, tespit ve işlem adımlarına böldük; her aşamada bilgilendirme yaparız.",
  "{area} bölgesinde {serviceLabel} desteğinde, önceliğimiz güvenli kullanım ve cihaz performansının korunmasıdır.",
  "{area} için {serviceLabel} hizmetinde hedefimiz aynı arızanın tekrarlamamasıdır: doğru tespit ve doğru uygulama.",
  "{area} {serviceLabel} ihtiyaçlarında cihazınıza uygun çözümü hızlıca netleştirip onayınızla ilerleriz.",
  "{area} bölgesinde {serviceLabel} için yerinde tespit ve planlı işlem ile zaman kaybını azaltmayı amaçlarız.",
  "{area} için {serviceLabel} hizmetinde, kısa sürede randevu ve net bilgilendirme ile ilerleriz.",
  "{area} bölgesinde {serviceLabel} taleplerinde, temiz işçilik ve test adımlarını standart hale getirdik.",
  "{area} lokasyonunda {serviceLabel} konusunda uzman ekibimizle profesyonel çözümler sunmayı hedefliyoruz.",
  "{area} çevresinde {serviceLabel} arıza ve bakım taleplerine aynı gün yanıt vermeye çalışıyoruz.",
  "{area} halkına {serviceLabel} hizmetinde şeffaflık ve dürüstlük ilkesiyle destek veriyoruz.",
  "{area} genelindeki tüm mahallelerde {serviceLabel} ihtiyacını karşılamak için ekiplerimiz hazır.",
  "{area} için {serviceLabel} operasyonumuzda her zaman müşteri memnuniyetini en ön planda tutuyoruz.",
  "{area} sakinlerine özel {serviceLabel} çözümlerimizde kalite ve hızdan ödün vermiyoruz.",
  "{area} bölgesinin her noktasına ulaşan {serviceLabel} ağımızla teknik destek sağlıyoruz.",
  "{area} için {serviceLabel} denildiğinde güvenilir servis anlayışını sahaya yansıtıyoruz.",
  "{area} genelinde {serviceLabel} servis süreçlerimizi dijital takip ve yerinde bilgilendirme ile yürütüyoruz.",
  "{area} bölgesinde {serviceLabel} operasyonunda doğru teşhis ve kalıcı onarım standartlarını uyguluyoruz.",
  "{area} teknik destek hattımız üzerinden {serviceLabel} kaydı oluşturarak süreçleri anlık takip edebilirsiniz.",
  "{area} lokasyonuna özel gezici ekiplerimizle {serviceLabel} arızalarına en kısa sürede müdahale ediyoruz.",
  "{area} için sunduğumuz {serviceLabel} paketlerimizde hem fiyat avantajı hem de yüksek kalite sunuyoruz.",
  "{area} sakinleri için {serviceLabel} denince akla gelen ilk tercih olmak için titizlikle çalışıyoruz.",
  "{area} bölgesindeki teknolojik altyapımızla {serviceLabel} süreçlerini modernize ettik.",
  "{area} genelinde {serviceLabel} hizmeti alırken şeffaf fiyatlandırma ve dürüst bilgilendirme ile yanınızdayız.",
  "{area} civarında {serviceLabel} hizmetlerinde %100 memnuniyet hedefiyle her detayı kontrol ediyoruz."
];

const detailTemplates = [
  "{area} bölgesinde talep yoğunluğu günlere göre değişebilir; en hızlı randevu için servis kaydı oluşturmanız yeterli.",
  "{serviceLabel} için cihazın marka/model bilgisi ve arıza belirtisi, doğru yönlendirme ve parça uyumu açısından önemlidir.",
  "Yerinde tespit sonrası işlemi netleştirir, onayınızla ilerleriz. İşlem bitiminde temel testlerle teslim ederiz.",
  "Bakım ve onarım sonrası cihazın güvenli çalışması için kontrol adımlarını uygularız.",
  "Kayıt sırasında paylaşılan arıza belirtisi, gerekli hazırlığı yapmamıza yardımcı olur ve süreci hızlandırır.",
  "Parça gerektiren durumlarda seçenekleri ve olası süreyi net şekilde aktarırız; onayınıza göre işlem planlanır.",
  "Bakım işlemleri, cihazın performansını korumaya yardımcı olur; periyodik kontrol önerilerini paylaşırız.",
  "Servis sürecinde amaç; hızlı çözüm kadar doğru ve güvenli çözümdür. Bu yüzden tespit adımını atlamayız.",
  "{area} için {serviceLabel} yönlendirmesinde, bölge ve cihaz türüne göre önceliklendirme yapılabilir.",
  "Cihazınızdaki arızanın kaynağını doğru belirlemek, gereksiz parça değişiminin önüne geçer; bu prensiple çalışıyoruz.",
  "Profesyonel {serviceLabel} hizmetimiz kapsamında her zaman yüksek kaliteli işçilik garantisi veriyoruz.",
  "{area} genelinde verdiğimiz desteklerde bölge şartlarını ve cihaz kullanım alışkanlıklarını dikkate alıyoruz.",
  "Teknik ekibimiz {serviceLabel} konusunda düzenli eğitimlerden geçerek güncel modellere hakim olmaktadır.",
  "Arızalı cihazın mevcut durumunu analiz ederken enerji verimliliği ve performans kayıplarını da inceleriz.",
  "{area} servis noktalarımızda parça stoğu ve ekip organizasyonunu hız odaklı planlıyoruz.",
  "Sadece arızayı gidermekle kalmıyor, cihazın ömrünü uzatacak teknik tavsiyelerde bulunuyoruz.",
  "Hizmet sonrası cihazın çalışma parametrelerini (ısı, basınç, akım) standart değerlerle karşılaştırırız.",
  "Cihazın yerinde tamiri mümkün değilse güvenli nakliye ve atölye süreci hakkında detaylı bilgi verilir.",
  "Faturanıza yansıyan her kalem (işçilik, parça, ulaşım) kalem kalem açıklanır; gizli maliyet oluşmaz.",
  "Cihazınızdaki kronik sorunlar için uzun vadeli çözüm önerileri ve kullanım kılavuzu dışı ipuçları sunulur.",
  "Mevsimsel geçişlerde (kış öncesi kombi, yaz öncesi klima) yapılan bakımlar arıza riskini %60 azaltır.",
  "{area} bölgesinde kullanılan cihazların su sertliği veya voltaj dalgalanmalarından etkilenme oranını analiz ediyoruz."
];

const promiseTemplates = [
  "Yerinde tespitte işlem öncesi bilgilendirme yapılır; onayınız olmadan parça/işçilik uygulanmaz.",
  "İşlem bitiminde cihaz çalıştırılır, temel kontroller yapılır ve teslim edilir.",
  "Talebe göre aynı gün uygunluk planlanır; yoğunluk durumunda en yakın randevu önerilir.",
  "Servis sürecinde cihaz modeli ve kullanım koşullarına göre doğru yönlendirme yapılır.",
  "Randevu saatine yaklaşırken bilgilendirme yapılır; değişiklik olursa alternatif saat önerilir.",
  "İşlem sonrası kullanım önerileri paylaşılır; tekrar eden arızalarda doğru kontrol adımları anlatılır.",
  "Hizmet kapsamında tespit, bakım ve onarım adımları ayrı ayrı açıklanır.",
  "Cihazınız için uygun işlem seçenekleri net şekilde sunulur; karar sizin onayınıza bağlıdır.",
  "Gerekli durumlarda güvenlik kontrolleri (kaçak, basınç, bağlantılar) kontrol listesine göre yapılır.",
  "Her işleme özel teknik servis fişi düzenlenir ve yapılan işlemler kayıt altına alınır.",
  "Şeffaf fiyatlandırma politikamız gereği süpriz ek ücretlerle karşılaşmazsınız.",
  "Orijinal yedek parça veya yüksek kaliteli muadil seçeneklerini avantajları ile sunarız.",
  "Müşteri onayı alınmadan hiçbir donanımsal müdahalede bulunulmaz.",
  "Cihaz temizliği ve çalışma ortamının korunması iş disiplinimizin temelidir.",
  "Planlanan randevu sadakati konusunda %98'in üzerinde başarı oranıyla çalışıyoruz.",
  "Servis sonrası 1 yıl boyunca yapılan işçilik ve değişen parçalar için teknik destek süreci devam eder.",
  "Çağrı merkezimiz üzerinden 7/24 randevu talebi ve durum sorgulama yapabilirsiniz.",
  "Teknisyenlerimiz hijyen kurallarına ve galoş kullanımına azami özen gösterir.",
  "Cihazınızın enerji tüketim verimliliğini korumak için gerekli optimizasyonlar yapılır."
];

const technicalInsights = {
  kombi: [
    "Kombi basıncının ideal aralıkta (1.5 bar) olması, cihazın zorlanmadan çalışmasını sağlar.",
    "Genleşme tankı havasının periyodik kontrolü, tesisatın korunması için kritiktir.",
    "Alev modülasyonu kontrolü, yakıt tasarrufu ve istikrarlı sıcak su için gereklidir.",
    "Peteklerdeki hava ve kirlilik, kombi pompasının ömrünü doğrudan etkiler."
  ],
  klima: [
    "Filtre temizliği sadece hijyen değil, aynı zamanda kompresör sağlığı için önemlidir.",
    "Gaz basıncının yetersiz olması, dış ünitenin aşırı ısınmasına ve arıza yapmasına neden olur.",
    "İç ünite drenaj hattının temizliği, koku ve su akıtma problemlerini engeller.",
    "Doğru BTU seçimi ve kullanım alışkanlıkları enerji faturasında %30 tasarruf sağlayabilir."
  ],
  "beyaz-esya": [
    "Çamaşır ve bulaşık makinelerinde kireç temizliği, rezistansın verimli kalmasını sağlar.",
    "Buzdolabı kapı fitilleri ve arka panel kirliliği, soğutma performansını düşürür.",
    "Doğru deterjan ve dozaj kullanımı, pompa motorunun tıkanmasını önler.",
    "Titreşim kontrolü, kazan askılarının ve amortisörlerin aşınmasını yavaşlatır."
  ],
  endustriyel: [
    "Kazan dairesi otomasyonu, enerji verimliliği ve arıza takibi için merkezi kontrol sunar.",
    "Merkezi klima sistemlerinde (VRF) gaz dengesi ve iletişim hattı sürekliliği kritiktir.",
    "Endüstriyel mutfak ekipmanlarında gaz sızdırmazlığı ve termostat kalibrasyonu güvenliği belirler.",
    "Büyük ölçekli soğutma gruplarında kompresör yağı ve vibrasyon analizi önleyici bakımdır."
  ]
};

const processSteps = [
  { title: "Servis kaydı", desc: "Arıza belirtisi + marka/model bilgisini paylaşın." },
  { title: "Randevu planı", desc: "En uygun gün/saat için planlama yapılır." },
  { title: "Yerinde tespit", desc: "Sorun kaynağı belirlenir, işlem/bedel bilgilendirmesi yapılır." },
  { title: "İşlem ve test", desc: "Onayınızla işlem yapılır, test edilerek teslim edilir." }
];

const reasons = [
  { title: "Kurumsal süreç", desc: "Tespit → onay → işlem → test adımlarını standartlaştırırız." },
  { title: "Şeffaf bilgilendirme", desc: "İşlem öncesi bilgilendirir, onaysız işlem yapmayız." },
  { title: "Planlı servis", desc: "Yoğunluğa göre en hızlı randevuyu planlarız." },
  { title: "Temiz işçilik", desc: "Alan koruma, düzenli teslim ve temel kontroller." }
];

const kombiIssues = [
  "Isıtmıyor / petekler ısınmıyor",
  "Sıcak su dalgalanması",
  "Basınç düşmesi / su eksiltme",
  "Ateşleme yapmama",
  "Gürültülü çalışma",
  "Hata kodu uyarıları"
];

const klimaIssues = [
  "Yetersiz soğutma/ısıtma",
  "Koku problemi",
  "Su akıtma",
  "Ses/titreşim",
  "Gaz basıncı sorunları",
  "Filtre ve iç ünite kirliliği"
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
  "Otomasyon ve kontrol paneli hataları"
];

const faqBank: Array<{ q: string; a: string }> = [
  {
    q: "{area} servis ücreti ne kadar?",
    a: "Ücret; arızanın türü, cihaz modeli ve yapılacak işleme göre değişir. {districtName} bölgesinde işlem öncesi net bilgilendirme yapılır."
  },
  {
    q: "{districtName} için aynı gün servis mümkün mü?",
    a: "{districtName} içindeki mobil ekip yoğunluğuna göre değişir. Uygunluk varsa aynı gün adresinize uzman yönlendirilir."
  },
  {
    q: "Orijinal parça değişimi yapıyor musunuz?",
    a: "Gerekirse {area} standartlarına uygun garantili parça seçenekleri paylaşılır; onayınızla değişim yapılır ve işlem sonrası test edilir."
  },
  {
    q: "{districtName} çevresinde hangi mahallelere hizmet veriyorsunuz?",
    a: "{districtName} ilçesinin tüm mahallelerine hızlı servis planlaması yapılmaktadır."
  },
  {
    q: "Randevu süreci nasıl işler?",
    a: "İşin türüne göre değişir. Basit kontroller hızla tamamlanırken, parça/işçilik gerektiren onarımlar {districtName} teknik birimimizce titizlikle yürütülür."
  },
  {
    q: "{area} servis kaydı için hangi bilgi gerekir?",
    a: "Tam konum (İl/ilçe), cihaz türü, marka/model ve arıza belirtisi, süreci hızlandırmamız için yeterlidir."
  },
  {
    q: "Yerinde tespit sonrası cihaz atölyeye alınır mı?",
    a: "Arızaların %90'ını {districtName} bölgesinde yerinde onarıyoruz. Sadece çok büyük revizyonlarda cihaz atölye veya merkez istasyonuna alınır."
  }
];

const districtOperationNotes = [
  "randevu saatlerini bina yogunlugu ve ayni gun saha rotasi ile birlikte optimize ediyoruz",
  "yerinde tespitte cihazin kurulu oldugu hacim, tesisat duzeni ve kullanim senaryosunu birlikte not ediyoruz",
  "tekrar eden arizalarda sadece cihaz degil elektrik, su ve havalandirma kosullarini da birlikte degerlendiriyoruz",
  "mobil ekip planini ulasim akslari, gun ici talep yogunlugu ve servis kayit saatine gore kuruyoruz",
  "parca gereken senaryolarda sure tahminini ilce bazli operasyon akisi ile birlikte netlestiriyoruz",
  "ayni belirtiyi ureten farkli nedenleri ayiklamak icin ilce icindeki kullanim farklarini dikkate aliyoruz"
];

function issuesFor(kind: ServiceKind) {
  if (kind === "kombi") return kombiIssues;
  if (kind === "klima") return klimaIssues;
  if (kind === "endustriyel") return endustriyelIssues;
  return beyazEsyaIssues;
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

  // Elite Semantic Intro Construction
  const brandNote = brand ? brandExpertNotes[brand.slug as keyof typeof brandExpertNotes] : "";
  const brandPlaybook = brand ? brandServicePlaybooks[brand.slug]?.[serviceKind] : null;
  const techNote = technicalInsightsMap[serviceKind as keyof typeof technicalInsightsMap] || "";

  const intro = brandNote 
    ? `${area} çevresinde ${brand?.name} ${serviceLabel} taleplerinizde, ${brandNote} ${area} geneline yayılan mobil ekiplerimizle yerinde tespit ve profesyonel müdahale süreçlerini standartlaştırıyoruz.`
    : techNote
    ? `${area} sakinlerine sunduğumuz ${serviceLabel} desteğinde, ${techNote} Bu bilinçle, her işlemde önce doğru teşhis ardından kalıcı çözüm prensibiyle hareket ediyoruz.`
    : pickOne(rng, introTemplates).replaceAll("{area}", area).replaceAll("{serviceLabel}", serviceLabel);

  const details = [
    brand 
      ? `${brand.name} ${serviceLabel} hizmetinde cihazın teknolojik mimarisine uygun orijinal veya onaylı yedek parça kullanımı, verimliliğin korunması açısından önceliğimizdir.`
      : `${serviceLabel} sürecinde cihazın mevcut performans verilerini (ısı, basınç, akım) analiz ederek sadece arızayı değil, gelecekte oluşabilecek riskleri de raporluyoruz.`,
    ...pickManyUnique(rng, detailTemplates, 2).map((x) =>
      x.replaceAll("{area}", area).replaceAll("{serviceLabel}", serviceLabel).replaceAll("{brand}", brand?.name ?? "")
    ),
    ...(brandPlaybook?.proofPoints?.slice(0, 1) ?? [])
  ];
  const districtProfileTitle = district ? `${district.name} Icin Yerel Servis Profili` : undefined;
  const districtProfileBullets = district
    ? [
        nearbyDistrictNames.length
          ? `${district.name} taleplerini ${nearbyDistrictNames.join(", ")} gibi yakin ilcelerle birlikte ayni operasyon havuzunda planliyoruz.`
          : `${district.name} taleplerini ${city.name} geneli icindeki ekip dagilimina gore planliyoruz.`,
        `${district.name} icin ${serviceLabel.toLowerCase()} kayitlarinda ${pickOne(rng, districtOperationNotes)}.`,
        serviceKind === "kombi"
          ? `${district.name} icindeki kombi taleplerinde tesisat davranisi, basinc degisimi ve sicak su kararliligini birlikte degerlendiriyoruz.`
          : serviceKind === "klima"
          ? `${district.name} icindeki klima taleplerinde kullanim yogunlugu, hava debisi, drenaj ve sogutma davranisini birlikte izliyoruz.`
          : serviceKind === "beyaz-esya"
          ? `${district.name} icindeki beyaz esya taleplerinde su tahliyesi, program akis tutarliligi ve ses titresim davranisini birlikte kontrol ediyoruz.`
          : `${district.name} icindeki kurumsal taleplerde sistem surekliligi, yuk dengesi ve tekrar riski uzerinde duruyoruz.`,
        `${district.name} sayfasi; ilce odakli sorgu niyeti, yakin servis akisi ve ${city.name} icindeki baglamsal farklari gosterecek sekilde kurgulanmistir.`
      ]
    : undefined;

  const titleTemplate = pickOne(rng, [
    "{baseTitle} | Garantili Tamir & Bakım | {businessName}",
    "{baseTitle} | Hızlı Randevu & Şeffaf Ücret | {businessName}",
    "{baseTitle} | Yerinde Tespit & Bakım | {businessName}",
    "{baseTitle} | Uygun Fiyatlı Servis | {businessName}"
  ]);
  const title = titleTemplate.replaceAll("{baseTitle}", baseTitle).replaceAll("{businessName}", site.businessName);

  const serviceAreas = [district?.name, ...districtsPreview].filter(Boolean).slice(0, 5).join(", ");

  const a = pickOne(rng, [
    "Hızlı randevu planlama",
    "Şeffaf bilgilendirme",
    "Temiz işçilik",
    "İşlem sonrası test",
    "Doğru tespit odaklı servis",
    "Yerinde kontrol ve planlı süreç"
  ]);
  const b = pickOne(rng, [
    "bakım ve onarım",
    "arıza tespiti ve onarım",
    "periyodik bakım",
    "parça değişimi ve test",
    "performans ve kontrol",
    "yerinde tespit ve yönlendirme"
  ]);

  const lead = shuffle(rng, [
    `${baseTitle} için servis kaydı`,
    `${baseTitle} desteği`,
    `${baseTitle} hizmeti`
  ])[0];

  const descriptionTemplate = pickOne(rng, [
    "{lead}. {areas} bölgesinde {a} ve {b}. Hemen arayın!",
    "{lead}. {a} + {b} odağıyla planlı hizmet. {areas} için randevu oluşturun!",
    "{lead}. {areas} çevresinde yerinde tespit, onaylı işlem ve test adımları. Hemen arayın!"
  ]);
  const description = descriptionTemplate
    .replaceAll("{lead}", lead)
    .replaceAll("{areas}", serviceAreas || area)
    .replaceAll("{a}", a)
    .replaceAll("{b}", b);

  const highlights = pickManyUnique(rng, promiseTemplates, 4);
  const processPicked = pickManyUnique(rng, processSteps, 4);
  const reasonsPicked = pickManyUnique(rng, reasons, 4);
  const commonIssues = pickManyUnique(
    rng,
    [...issuesFor(serviceKind), ...(brandPlaybook?.issueFocus ?? [])],
    6
  );
  const faqs = pickManyUnique(rng, faqBank, 4).map(faq => ({
    q: faq.q.replaceAll("{area}", area).replaceAll("{districtName}", district?.name || area),
    a: faq.a.replaceAll("{area}", area).replaceAll("{districtName}", district?.name || area)
  }));
  const nearbyAreaNames = district
    ? [district.name, ...districtsPreview]
    : pickManyUnique(rng, city.districts.map((d) => d.name), 4);
  const scopeEntity = brand ? `${brand.name} ${serviceLabel}` : serviceLabel;
  let intelligence: any = null;

  const serviceScopeTitle = district
    ? `${district.name} ve Yakın Çevresinde ${scopeEntity} Kapsamımız`
    : `${city.name} Genelinde ${scopeEntity} Kapsamımız`;
  const serviceScopeBullets = [
    `${area} için servis kaydı açıldığında ${scopeEntity.toLowerCase()} taleplerini adres, cihaz tipi ve arıza belirtisine göre önceliklendiriyoruz.`,
    nearbyAreaNames.length
      ? `${scopeEntity} planlamasında sık yönlendirme yaptığımız odak bölgeler: ${nearbyAreaNames.join(", ")}.`
      : `${scopeEntity} planlamasında ${city.name} genelindeki talepleri mobil ekip dağılımına göre eşliyoruz.`,
    brand
      ? `${brand.name} cihazlarda seri, model ve hata belirtisini kayda geçirerek parça uyumu ve işlem sırasını önceden netleştiriyoruz.`
      : `${serviceLabel} taleplerinde cihazın kullanım yoğunluğu, tesisat yapısı ve önceki müdahale geçmişini birlikte değerlendiriyoruz.`,
    serviceKind === "kombi"
      ? `${area} için kombi taleplerinde basınç, yanma, sirkülasyon ve sıcak su stabilitesini tek kontrolde ele alıyoruz.`
      : serviceKind === "klima"
      ? `${area} için klima taleplerinde gaz dengesi, drenaj hattı, fan temizliği ve performans ölçümünü birlikte raporluyoruz.`
      : serviceKind === "beyaz-esya"
      ? `${area} için beyaz eşya taleplerinde elektrik, su tahliyesi, motor/pompa ve program akışını ayrı ayrı test ediyoruz.`
      : `${area} için kurumsal çözümlerde sistem sürekliliği, yük durumu ve arıza tekrar riskini birlikte değerlendiriyoruz.`
  ];

  const differentiationTitle = brand
    ? `${area} İçin ${brand.name} Odaklı Servis Notları`
    : `${area} İçin Yerel Operasyon Notları`;
  const differentiationBullets = [
    climateRegions[city.slug]?.extraNote
      ? `${city.name} özelinde saha yaklaşımımız: ${climateRegions[city.slug].extraNote}`
      : `${city.name} özelinde şebeke, kullanım alışkanlığı ve mevsim etkilerini tespit aşamasına dahil ediyoruz.`,
    brand && brandNote
      ? `${brand.name} özel teknik yaklaşımımız: ${brandNote}`
      : `${serviceLabel} işlemlerinde sadece arızayı değil, aynı problemi tekrar üretebilecek çevresel nedenleri de not ediyoruz.`,
    district
      ? `${district.name} sayfasında kullanılan akış; ilçe özel rota, yakın bölge iç linkleri ve ${scopeEntity.toLowerCase()} sorgu niyetine göre düzenlenmiştir.`
      : `${city.name} sayfasında kullanılan akış; şehir genelindeki arama niyetlerini karşılamak için ilçe ve marka geçişleriyle güçlendirilmiştir.`,
    intelligence?.peopleAlsoAsk?.length
      ? `${area} için bu başlıkta kullanıcıların en çok sorduğu sorular veri setine işlendi ve içerik içinde ayrı blok olarak işlendi.`
      : `${area} için soru-cevap bloklarını ${scopeEntity.toLowerCase()} aramalarında en sık karşılaşılan kayıt, ücret, parça ve randevu başlıklarına göre türetiyoruz.`
  ];
  const brandFocusTitle = brandPlaybook ? `${area} icin ${scopeEntity} Teknik Odaklari` : undefined;
  const brandFocusBullets = brandPlaybook
    ? [
        `${scopeEntity} taleplerinde ilk odaklandigimiz basliklar: ${brandPlaybook.issueFocus.join(", ")}.`,
        `${scopeEntity} bakim veya onarim surecinde kontrol listemiz: ${brandPlaybook.maintenanceFocus.join(", ")}.`,
        ...brandPlaybook.proofPoints
      ]
    : undefined;

  const localProofVariants = [
    `${area} çevresinde sık gelen taleplere göre arıza tespiti ve parça uyumunu hızlandırmaya odaklanıyoruz.`,
    `${area} için randevulu planlama ile yoğunluk yönetimini daha net yapıyoruz; en hızlı seçenekleri size sunarız.`,
    `${area} bölgesinde cihaz türüne göre (ısıtma/soğutma/ev aletleri) kontrol listemizi farklılaştırıyoruz.`,
    `${area} için en sık ihtiyaç duyulan bakım ve kontrol adımlarını standart hale getirip her işlemde uygularız.`,
    `${area} içinde farklı bina/tesisat koşulları olabildiğinden, tespitte sahaya özel notlar alıp buna göre ilerleriz.`,
    `${area} genelinde servis taleplerinde, güvenli kullanım ve tekrar etmeyen çözüm hedefiyle tespit adımına önem veririz.`
  ];

  const localProof = pickOne(rng, localProofVariants);
  const trustSignals = pickManyUnique(rng, site.trustSignals, 4);
  const semanticKeywords = pickManyUnique(rng, semanticKeywordsByService[serviceKind], 10);
  const insights = [
    ...pickManyUnique(rng, technicalInsights[serviceKind], 2)
  ];

  // Try to load service-specific intelligence (SERP analysis)
  intelligence = null;
  const intelPath = path.join(process.cwd(), "data/intelligence/services", `${city.slug}-${district?.slug || "city"}-${serviceKind}.json`);
  if (fs.existsSync(intelPath)) {
    try {
      intelligence = JSON.parse(fs.readFileSync(intelPath, "utf-8"));
    } catch (e) {
      console.error(`- Error reading service intelligence at ${intelPath}:`, e);
    }
  }

  const regionalNote = climateRegions[city.slug]?.extraNote 
    ? `Özellikle ${city.name} bölgesinde sahaya çıktığımızda gördüğümüz bir durum var: ${climateRegions[city.slug].extraNote}`
    : `${city.name} genelinde tespit ettiğimiz coğrafi ve şebeke suyu yapısına uygun spesifik bakım testlerini standart işlem adımlarımıza çoktan entegre ettik.`;

  const fallbackExpertNote = {
    title: `Usta Notu: ${city.name} Bölgesine Özel Hassasiyetler`,
    content: `${regionalNote} Çoğu teknik servis bu detayı atlasa da, biz ${serviceLabel.toLowerCase()} sürecinin olmazsa olmazı olarak kalıcı çözüme odaklanıyoruz.`
  };

  const generatedPaa = [
    {
      question: district
        ? `${district.name} bolgesinde ${scopeEntity} icin en sik hangi sorunlarla kayit aciliyor?`
        : `${city.name} genelinde ${scopeEntity} icin en sik hangi sorunlarla kayit aciliyor?`,
      answer: `${area} icin en sik karsilastigimiz basliklar ${commonIssues.slice(0, 3).join(", ")} gibi belirtilerdir. Kayit sirasinda marka/model ve sorunun ne zaman basladigi paylasildiginda yonlendirme daha hizli yapilir.`
    },
    {
      question: `${area} icin ${scopeEntity} randevusu olustururken hangi bilgiler gerekir?`,
      answer: `Adres bilgisi, cihazin marka/modeli, varsa hata kodu ve ariza belirtisi ${scopeEntity.toLowerCase()} surecini hizlandirir. Boylece ekip planlamasi ve ilk kontrol adimi daha isabetli yapilir.`
    },
    {
      question: `${area} sayfasindaki ${scopeEntity} icerigi neden bolgeye gore degisiyor?`,
      answer: `Cunku ${city.name} icindeki kullanim yogunlugu, iklim etkisi, yakin servis bolgeleri ve cihaz dagilimi ayni degildir. Bu nedenle ${scopeEntity.toLowerCase()} sayfalarini sehir ve ilce baglamina gore ayri kurguluyoruz.`
    }
  ];

  if (brand) {
    faqs.push({
      q: `${brand.name} ${serviceLabel} icin parca uyumu nasil dogrulaniyor?`,
      a: `${area} icinde ${brand.name} cihazlara mudahale ederken model, seri bilgisi ve mevcut ariza belirtisi birlikte degerlendirilir. Boylece yanlis parca degisimi riskini azaltir, islem planini daha net kurariz.`
    });

    if (brandPlaybook) {
      faqs.push({
        q: `${brand.name} ${serviceLabel} icin en cok hangi basliklar kontrol edilir?`,
        a: `${area} icin ${brand.name} ${serviceLabel.toLowerCase()} taleplerinde once ${brandPlaybook.issueFocus.join(", ")} gibi basliklari netlestirir; ardindan ${brandPlaybook.maintenanceFocus.join(", ")} adimlariyla kontrol listemizi tamamlariz.`
      });
    }
  }

  return {
    title,
    description,
    h1: baseTitle,
    intro,
    details,
    districtProfileTitle,
    districtProfileBullets,
    serviceScopeTitle,
    serviceScopeBullets,
    differentiationTitle,
    differentiationBullets,
    brandFocusTitle,
    brandFocusBullets,
    process: processPicked,
    reasons: reasonsPicked,
    highlights,
    commonIssues,
    faqs: faqs.slice(0, 5),
    whyUsTitle: `Neden Bizim ${area} ${serviceLabel} Ekibimizi Seçmelisiniz?`,
    trustSignals,
    semanticKeywords,
    localProof,
    technicalInsights: insights,
    expertNote: fallbackExpertNote,
    peopleAlsoAsk: intelligence?.peopleAlsoAsk?.length ? intelligence.peopleAlsoAsk : generatedPaa
  } satisfies LocalServicePageContent;
}

export type LandingContent = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  bullets: string[];
};

export function buildCityLandingContent(city: City): LandingContent {
  const rng = createRng(`city|${city.slug}`);
  const title = pickOne(rng, [
    `${city.name} Teknik Servis | İlçe Bazlı Servis Sayfaları | ${site.businessName}`,
    `${city.name} Teknik Servis | Kombi • Klima • Beyaz Eşya | ${site.businessName}`,
    `${city.name} Teknik Servis | Randevulu Servis ve Yönlendirme | ${site.businessName}`
  ]);
  const description = pickOne(rng, [
    `${city.name} için kombi, klima ve beyaz eşya servis sayfaları. İlçe ve hizmet türüne göre dinamik içerik; hızlı yönlendirme ve SSS.`,
    `${city.name} genelinde ilçe bazlı servis sayfaları: kombi/klima/beyaz eşya. Servis kaydı, randevu planlama ve süreç adımları.`,
    `${city.name}’da teknik servis arıyorsanız ilçenizi seçin. Hizmet türüne göre dinamik sayfalar, marka bağlantıları ve SSS.`
  ]);
  const intro = pickOne(rng, [
    `İlçenizi seçin ve ardından hizmet türünü seçerek ilgili sayfaya gidin. Her sayfa ${city.name} ve ilçe parametresine göre farklı içerik üretir.`,
    `${city.name} için servis kaydınızı oluşturup ilçenize göre doğru sayfaya yönlenin. Hizmet sayfalarında süreç, SSS ve marka bağlantıları yer alır.`,
    `${city.name} genelinde kombi/klima/beyaz eşya için ilçe bazlı yönlendirme sunuyoruz. Aşağıdan ilçenizi seçebilirsiniz.`
  ]);
  const bullets = pickManyUnique(
    rng,
    [
      `${city.districts.length} ilçe listesi ve hızlı bağlantılar`,
      "Hizmet türüne göre dinamik sayfa yapısı",
      "Marka sayfalarına hızlı geçiş",
      "Servis kaydı ve randevu planlama akışı",
      "SSS ve sık arıza başlıkları"
    ],
    3
  );

  return { title, description, h1: `${city.name} Teknik Servis`, intro, bullets };
}

export function buildDistrictLandingContent(city: City, district: District): LandingContent {
  const rng = createRng(`district|${city.slug}|${district.slug}`);
  const title = pickOne(rng, [
    `${city.name} ${district.name} Teknik Servis | Kombi • Klima • Beyaz Eşya | ${site.businessName}`,
    `${city.name} ${district.name} Teknik Servis | İlçeye Özel Sayfalar | ${site.businessName}`,
    `${city.name} ${district.name} Teknik Servis | Hızlı Yönlendirme | ${site.businessName}`
  ]);
  const description = pickOne(rng, [
    `${city.name} ${district.name} için kombi, klima ve beyaz eşya servis sayfaları. Hizmet türüne göre dinamik içerik, marka bağlantıları ve SSS.`,
    `${city.name} ${district.name} bölgesinde teknik servis sayfaları: kombi/klima/beyaz eşya. Servis kaydı, randevu planlama ve süreç adımları.`,
    `${city.name} ${district.name} için doğru hizmet sayfasını seçin. Her hizmet sayfası bölgeye göre farklı içerik üretir.`
  ]);
  const intro = pickOne(rng, [
    "Hizmet türünü seçin. Seçiminize göre ilgili servis sayfasına yönlenir ve bölgeye göre üretilmiş içerik bloklarını görürsünüz.",
    "Kombi, klima veya beyaz eşya için hizmet sayfasını seçin. Her sayfada süreç, sık arıza başlıkları ve SSS yer alır.",
    "Bölgeniz için uygun hizmet türünü seçerek devam edin. İlçe bazlı yapı sayesinde doğru sayfaya hızlıca ulaşırsınız."
  ]);
  const bullets = pickManyUnique(
    rng,
    [
      "Hizmet seçimi: kombi/klima/beyaz eşya",
      "İlçe bazlı yönlendirme ve hızlı bağlantılar",
      "Marka bazlı sayfalara geçiş",
      "SSS ve sık arıza başlıkları"
    ],
    3
  );

  return {
    title,
    description,
    h1: `${city.name} ${district.name} Teknik Servis`,
    intro,
    bullets
  };
}
