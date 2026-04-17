import fs from "fs";
import path from "path";
import type { Brand } from "@/lib/brands";
import type { City, District } from "@/lib/geo";
import type { ServiceKind } from "@/lib/services";
import { serviceLabelFromKind } from "@/lib/services";
import { brandFaultGuides, defaultFaultGuides } from "@/lib/faults";
import { semanticKeywordsByService, technicalInsightsMap, brandExpertNotes, brandServicePlaybooks } from "@/lib/semantics";
import { site } from "@/lib/site";
import { createRng, pickManyUnique, pickOne, shuffle } from "@/lib/variation";
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
  "mersin": { type: "sicak", extraNote: "Mersin'deki aşırı sıcaklar klimaların gaz basıncını limitlere dayandırdığı için, her yaz başında detaylı gaz ölçümü ve kondanser temizliği hayati önem taşır." },
  "mugla": { type: "sicak", extraNote: "Muğla civarındaki kireçli sular ve yaz sıcakları beyaz eşya motorlarını zorladığı için, periyodik bakımlarda kireç kırıcı dozajını artırıyoruz." },
  "aydin": { type: "sicak", extraNote: "Aydın'daki yüksek sıcaklıklarda buzdolabı kapı fitillerinin gevşemesi sonucu oluşan enerji kaybını önleyici vakum testleri yapıyoruz." },
  // İç Anadolu (Karasal / Kireçli)
  "ankara": { type: "karasal", extraNote: "Ankara'nın sert ayazı ve kireçli suyu için çift korumalı bakım yapıyoruz; hem cihazın ısı sensörlerini hem de rezistans kireç tutucularını optimize ediyoruz." },
  "konya": { type: "karasal", extraNote: "Konya'nın geniş düzlüklerinde rüzgarla taşınan toz, klimaların dış ünite peteklerini tıkar; biz bu bölgeye özel yüksek basınçlı hava ve su temizliği yapıyoruz." },
  "kayseri": { type: "karasal", extraNote: "Kayseri'deki gece-gündüz sıcaklık farkı cihazların gövdelerinde genleşme seslerine yol açabilir; montaj ve sabitleme noktalarını buna göre güçlendiriyoruz." },
  "eskisehir": { type: "karasal", extraNote: "Eskişehir'in kireçli şebeke suyuna karşı çamaşır ve bulaşık makinesi su giriş valflerini özel kireç tutucu filtrelerle destekliyoruz." }
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
  "{area} sakinlerine {serviceLabel} operasyonunda MYK belgeli teknisyenler ve şeffaf hizmet modeliyle destek veriyoruz.",
  "{area} genelindeki {serviceLabel} arızalarınızda, cihazın teknolojik yapısına uygun güncel ekipmanlarla müdahale ediyoruz.",
  "{area} çevresinde {serviceLabel} denildiğinde akla gelen ilk kurumsal yapı olmak için iş disiplinimizden ödün vermiyoruz.",
  "{area} lokasyonuna özel {serviceLabel} ağımızla, markadan bağımsız teknik rehberlik ve onarım hizmeti sunmaktayız.",
  "{area} bölgesindeki ev ve iş yerleri için {serviceLabel} kapsamında güvenilir, hızlı ve garantili çözümlerimiz mevcuttur.",
  "{area} için geliştirilen {serviceLabel} iş akışımızda, müşteri onayı olmadan tek bir vidayı bile yerinden oynatmıyoruz.",
  "{area} halkına en yakın {serviceLabel} noktası olarak, gezici mobil araçlarımızla gün boyu saha desteği veriyoruz.",
  "{area} genelinde {serviceLabel} kaydı oluşturduğunuz andan itibaren tüm süreç dijital sistemimiz üzerinden takip edilir.",
  "{area} operasyon merkezimiz üzerinden {serviceLabel} randevularınızı cihazın aciliyet durumuna göre önceliklendiriyoruz.",
  "{area} sakinleri için {serviceLabel} alanında uzman kadromuzla, cihaz performansını fabrika ayarlarına döndürüyoruz.",
  "{area} civarında {serviceLabel} alırken sürpriz maliyetlerle karşılaşmamanız için işlem öncesi fiyat garantisi veriyoruz.",
  "{area} lokasyonundaki {serviceLabel} ihtiyaçlarınızda, parça stoğu geniş olan donanımlı araçlarımızla geliyoruz.",
  "{area} bölgesinde {serviceLabel} konusunda profesyonel teknik destek arayanlar için 7/24 kayıt sistemimiz aktiftir.",
  "{area} genelindeki {serviceLabel} sirkülasyonumuzda, her müşterimize özel servis raporu ve teknik tavsiye sunuyoruz.",
  "{area} için kurguladığımız {serviceLabel} modelinde hız, dürüstlük ve teknik derinlik temel taşlarımızdır.",
  "{area} sakinlerinin beyaz eşya, kombi ve klima konforunu korumak için {serviceLabel} disiplinimizle sahadayız.",
  "{area} çevresinde {serviceLabel} hizmeti alırken modern ödeme seçenekleri ve resmi servis fişi avantajını yaşayın.",
  "{area} lokasyonu genelinde {serviceLabel} alanında kazandığımız güveni, her geçen gün daha fazla haneye taşıyoruz.",
  "{area} bölgesi için {serviceLabel} aramalarınızda, size en yakın teknik ekibi 30 dakikada yönlendirme kapasitesine sahibiz.",
  "{area} operasyonumuzda {serviceLabel} süreçlerini sadece tamir değil, cihaz ömrünü uzatan bir 'yaşam desteği' olarak görüyoruz."
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
    a: "Servis ücretimiz; arızanın türü, cihaz modeli ve yapılacak işleme göre şeffaf bir şekilde belirlenir. {districtName} bölgesinde işlem öncesi tüm detaylar sizinle paylaşılır ve onayınız alınır."
  },
  {
    q: "Aynı gün {serviceLabel} randevusu alabilir miyim?",
    a: "Evet, {area} genelindeki mobil ekiplerimiz sayesinde, servis kaydınızı oluşturduğunuz andan itibaren 2 saat içinde adresinize ulaşmayı hedefliyoruz. {districtName} lokasyonundaki müsaitlik durumunu çağrı merkezimizden teyit edebilirsiniz."
  },
  {
    q: "{area} için hangi marka cihazlara bakıyorsunuz?",
    a: "Markadan bağımsız olarak Arçelik, Beko, Bosch, Samsung gibi tüm global markaların garantisi bitmiş cihazlarına profesyonel teknik destek sunuyoruz. {districtName} ekibimiz bu cihazların kronik sorunları konusunda tam donanımlıdır."
  },
  {
    q: "Yapılan işlemlerin garantisi var mı?",
    a: "{area} bölgesinde sunduğumuz {serviceLabel} işlemleri kapsamında, değişen orijinal yedek parçalar ve işçiliğimiz 1 yıl boyunca resmi servis güvencesi altındadır."
  },
  {
    q: "{districtName} içinde hangi mahallelere servisiniz var?",
    a: "{districtName} ilçesinin en ücra köşesinden merkezine kadar ulaşan geniş bir lojistik ağımız mevcuttur. Herhangi bir mahalle ayırımı yapmadan standart hız ve kalitede hizmet veriyoruz."
  },
  {
    q: "Cihazın yerinde tamiri mümkün mü?",
    a: "{area} genelinde arızaların yaklaşık %90'ı yerinde, cihazın bulunduğu alanda onarılır. Sadece kart revizyonu veya motor değişimi gibi ağır işlemler için cihaz {districtName} merkez istasyonumuza alınabilir."
  },
  {
    q: "{serviceLabel} bakımı ne kadar sürer?",
    a: "Standart bir periyodik bakım işlemi ortalama 30-45 dakika sürmektedir. Detaylı onarımlarda ise süre, arızanın kaynağına göre usta bazlı olarak size işlem başlangıcında bildirilir."
  },
  {
    q: "Cihazım çok eski, tamiri değer mi?",
    a: "{area} ekibimiz yerinde tespit sonrası cihazın kalan ömrünü ve maliyet analizini sizinle paylaşır. Eğer onarım maliyeti cihazın değerini aşıyorsa dürüstçe yenileme önerisinde bulunuruz."
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
  faultGuide?: Array<{ code: string; meaning: string; solution: string }>;
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
  const brandNote = brand ? brandExpertNotes[brand.slug]?.[serviceKind] : "";
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
    q: faq.q.replaceAll("{area}", area).replaceAll("{districtName}", district?.name || area).replaceAll("{serviceLabel}", serviceLabel),
    a: faq.a.replaceAll("{area}", area).replaceAll("{districtName}", district?.name || area).replaceAll("{serviceLabel}", serviceLabel)
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
    peopleAlsoAsk: intelligence?.peopleAlsoAsk?.length ? intelligence.peopleAlsoAsk : generatedPaa,
    faultGuide: brand ? brandFaultGuides[brand.slug]?.[serviceKind] ?? defaultFaultGuides[serviceKind] : defaultFaultGuides[serviceKind]
  } satisfies LocalServicePageContent;
}

export type LandingContent = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  bullets: string[];
  faqs: Array<{ q: string; a: string }>;
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

  const faqs = [
    { q: `${city.name} genelinde hangi ilçelere hizmet veriyorsunuz?`, a: `${city.name} ilinin tüm ilçelerine ve mahallelerine mobil ekiplerimizle yerinde teknik servis desteği sağlıyoruz.` },
    { q: `${city.name} teknik servis randevusu nasıl alınır?`, a: "Çağrı merkezimizi arayarak veya web sitemiz üzerinden bulunduğunuz bölgeyi seçip arıza kaydı oluşturarak randevu alabilirsiniz." },
    { q: "Servis süreci ne kadar sürer?", a: "Genellikle servis kaydı oluşturulduktan sonra 2 saat içinde adresinize ulaşmayı hedefliyoruz. Onarım süresi arızanın durumuna göre değişmektedir." }
  ];

  return { title, description, h1: `${city.name} Teknik Servis`, intro, bullets, faqs };
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

  const faqs = [
    { q: `${city.name} ${district.name} bölgesinde servis ücreti ne kadar?`, a: "Servis ücretlerimiz yapılan işleme ve değişen parçaya göre şeffaf bir şekilde belirlenir. Yerinde tespit sonrası net fiyat onayınıza sunulur." },
    { q: `${district.name} ilçesinde hangi cihazlara bakıyorsunuz?`, a: `${district.name} genelinde kombi, klima, çamaşır makinesi, bulaşık makinesi ve buzdolabı gibi tüm beyaz eşyalarınızın tamirini yapıyoruz.` },
    { q: "Size nasıl ulaşabilirim?", a: `Çağrı merkezimiz üzerinden veya ${district.name} sayfası üzerindeki butonları kullanarak hızlıca bize ulaşabilirsiniz.` }
  ];

  return {
    title,
    description,
    h1: `${city.name} ${district.name} Teknik Servis`,
    intro,
    bullets,
    faqs
  };
}

export function buildBrandLandingContent(brand: Brand): LandingContent {
  const rng = createRng(`brand|${brand.slug}`);
  const title = pickOne(rng, [
    `${brand.name} Servisi | Kurumsal Teknik Destek | ${site.businessName}`,
    `${brand.name} Teknik Servis | Garantili Bakım & Onarım | ${site.businessName}`,
    `${brand.name} Servis Merkezi | Uzman Teknisyenler | ${site.businessName}`
  ]);
  const description = pickOne(rng, [
    `${brand.name} için kombi, klima ve beyaz eşya servis çözümleri. Türkiye geneli randevulu servis, süreç adımları ve SSS.`,
    `${brand.name} genelinde kurumsal teknik destek: kombi/klima/beyaz eşya. 81 ilde servis kaydı ve randevu planlama.`,
    `${brand.name} servis ihtiyaçlarınızda uzman kadromuzla yanınızdayız. Hizmet türünü seçin ve bölgeye özel sayfaya gidin.`
  ]);
  const intro = pickOne(rng, [
    `${brand.name} marka cihazlarınızın ilk günkü performansını korumak için, teknolojik altyapıya uygun orjinal parça ve profesyonel işçilikle destek veriyoruz.`,
    `${brand.name} teknik servis süreçlerimizde, markanın özgün donanım mimarisine hakim uzmanlarımızla 81 ilde hizmet ağımızı sürdürüyoruz.`,
    `${brand.name} kullanıcıları için özel olarak kurgulanan servis modelimizde hız, şeffaflık ve teknik derinlik önceliğimizdir.`
  ]);
  const bullets = pickManyUnique(
    rng,
    [
      `${brand.name} cihazlara özel teknik ekipman kullanımı`,
      "1 Yıl parça ve işçilik garantisi",
      "Kombi, klima ve beyaz eşya uzmanlığı",
      "81 ilde yerel teknik servis yönlendirmesi",
      "Şeffaf fiyatlandırma ve onaylı işlem süreci"
    ],
    3
  );

  const faqs = [
    { q: `${brand.name} servisi için randevu nasıl alınır?`, a: `Çağrı merkezimiz üzerinden veya web sitemizdeki ${brand.name} sayfasından hizmet türü ve bölgenizi seçerek hızlıca kayıt oluşturabilirsiniz.` },
    { q: `${brand.name} cihazlarda hangi parçaları değiştiriyorsunuz?`, a: "Cihazın verimliliğini korumak adına sadece markanın onayladığı yüksek kaliteli yedek parçalar kullanıyoruz." },
    { q: "Özel servis misiniz?", a: `Evet, markadan bağımsız olarak kurumsal kalitede özel teknik servis hizmeti sunmaktayız. ${brand.name} markasının garantisi bitmiş ürünleri için profesyonel destek sağlıyoruz.` }
  ];

  return { title, description, h1: `${brand.name} Servisi`, intro, bullets, faqs };
}

