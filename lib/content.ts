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
  "mersin": { type: "sicak", extraNote: "Mersin'deki aşırı sıcaklar klimaların gaz basıncını limitlere dayandırdığı için, her yaz başında detaylı gaz ölçümü ve kondanser temizliği hayati önem taşır." },
  "mugla": { type: "sicak", extraNote: "Muğla civarındaki kireçli sular ve yaz sıcakları beyaz eşya motorlarını zorladığı için, periyodik bakımlarda kireç kırıcı dozajını artırıyoruz." },
  "aydin": { type: "sicak", extraNote: "Aydın'daki yüksek sıcaklıklarda buzdolabı kapı fitillerinin gevşemesi sonucu oluşan enerji kaybını önleyici vakum testleri yapıyoruz." },
  // İç Anadolu (Karasal / Kireçli)
  "ankara": { type: "karasal", extraNote: "Ankara'nın sert ayazı ve kireçli suyu için çift korumalı bakım yapıyoruz; hem cihazın ısı sensörlerini hem de rezistans kireç tutucularını optimize ediyoruz." },
  "konya": { type: "karasal", extraNote: "Konya'nın geniş düzlüklerinde rüzgarla taşınan toz, klimaların dış ünite peteklerini tıkar; biz bu bölgeye özel yüksek basınçlı hava ve su temizliği yapıyoruz." },
  "kayseri": { type: "karasal", extraNote: "Kayseri'deki gece-gündüz sıcaklık farkı cihazların gövdelerinde genleşme seslerine yol açabilir; montaj ve sabitleme noktalarını buna göre güçlendiriyoruz." },
  "eskisehir": { type: "karasal", extraNote: "Eskişehir'in kireçli şebeke suyuna karşı çamaşır ve bulaşık makinesi su giriş valflerini özel kireç tutucu filtrelerle destekliyoruz." }
};

// Sentences are split into "Pools". A paragraph is built by picking 1 sentence from each group.
// This creates exponential variations (N * M * P)
const introPools: string[][] = [
  // Sentence 1: The Context/Opening (Empathetic & Local)
  [
    "{area} {civarında|tarafında} {serviceLabel} {canınızı sıkıyorsa|bozulduysa|arıza yaptıysa|beklenmedik bir sorun çıkardıysa}, {hiç merak etmeyin|telaşlanmayın|endişelenmeyin}; {biz buralardayız|hemen yakınınızdayız|profesyonel ekibimizle sahadayız}.",
    "{area} sakinlerinin {serviceLabel} konusundaki {sorunlarını|beklentilerini|hassasiyetlerini} {yakından biliyor|iyi anlıyor|yıllardır gözlemliyor}, {çözüm için|yardımcı olmak adına|aksaklığı gidermek için} {tecrübemizi|ustalığımızı|tüm birikimimizi} konuşturuyoruz.",
    "{Evinizdeki|İş yerinizdeki} {serviceLabel} {aksaklıkları|problem çıkartması|arızalanması} günlük hayatınızı {etkilemesin|zorlaştırmasın|aksatmasın}; {area} için {hızlıca|saatler içinde|mümkün olan en kısa sürede} müdahale ediyoruz.",
    "{area} {genelinde|çevresinde} {serviceLabel} {desteği|tamiri|bakımı} arıyorsanız, {işini bilen|işin ehli|konusuna hakim} ve {güvenilir|dürüst|şeffaf} bir ekip olarak {yanınızdayız|size destekçiyiz|hizmetinizdeyiz}.",
    "{area} {lokasyonunda|bölgesinde} {serviceLabel} {ihtiyacı|gereksinimi} {doğduğunda|oluştuğunda}, {kalıcı çözüm|kesin sonuç} ve {uygun maliyet|ekonomik fiyat} dengesini {gözeterek|ön planda tutarak} {adresinize geliyoruz|kapınızı çalıyoruz}.",
    "{area} içindeki {ev ve iş yerlerine|tüm adreslere} {serviceLabel} {konusunda|alanında} {kesintisiz|hızlı|akıcı} bir servis {deneyimi|süreci} {vadediyoruz|sunuyoruz|sağlıyoruz}."
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
    "{Böylece|Bu sayede|Sonuç olarak} {cihazınız|makineniz} {tıkır tıkır|sorunsuz|tertemiz|ilk günkü gibi} çalışmaya {başlar|devam eder} ve {evinizdeki|içinizdeki} huzur {yerine gelir|bozulmaz|devam eder}.",
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

const faqByService: Record<string, { q: string; a: string }[]> = {
  kombi: [
    { q: "{area} bölgesinde kombi bakımı ne kadar sürer?", a: "Standart bir kombi bakımı yaklaşık 30-45 dakika sürer. Bu süreçte yanma odası temizliği, genleşme tankı kontrolü ve sızdırmazlık testleri titizlikle yapılır." },
    { q: "Kombi basıncı neden sürekli düşüyor?", a: "Basınç düşmesi genellikle tesisattaki bir sızıntıdan veya genleşme tankındaki hava eksikliğinden kaynaklanır. {area} ekiplerimiz adresinize gelerek bu sorunu yerinde çözer." },
    { q: "Peteklerimin sadece üstü ısınıyor, ne yapmalıyım?", a: "Bu durum genellikle tesisatta çamurlaşma olduğunu gösterir. {area} geneli profesyonel petek temizliği hizmetimizle sirkülasyon kanallarını açıyoruz." },
    { q: "Kombiden gelen garip sesler normal mi?", a: "Hayır, sesli çalışma genellikle fan motoru veya sirkülasyon pompası arızasına işarettir. {area} içinde hızlı müdahale ile parçaya zarar vermeden onarım yapıyoruz." },
    { q: "Kombi hata kodu veriyor, kendim müdahale edebilir miyim?", a: "Hata kodları teknik bir sorunu işaret eder. Gaz kaçağı gibi risklere karşı {area} uzman ekiplerimizin kontrolü her zaman daha güvenlidir." }
  ],
  klima: [
    { q: "{area} civarında klima gaz dolumu yapıyor musunuz?", a: "Evet, her marka klima için R32 ve R410 gaz dolumu gerçekleştiriyoruz. Önce kaçak testi yapıp sızıntıyı önlüyor, sonra dolum yapıyoruz." },
    { q: "Klima iç ünitesinden neden su akıtıyor?", a: "Klima drenaj hattının tıkanması veya montaj eğimi hatası buna neden olabilir. {area} operasyonumuz dahilinde tıkanıklığı hemen gideriyoruz." },
    { q: "Klimadan gelen kötü kokunun sebebi nedir?", a: "İç ünite peteklerinde biriken bakteri ve tozlar koku yapar. İlaçlı dezenfeksiyon ve kapsamlı bakım ile kokuyu tamamen yok ediyoruz." },
    { q: "Klima bakımı performansı artırır mı?", a: "Kesinlikle. Temiz bir klima daha az enerji harcayarak daha hızlı soğutma/ısıtma yapar. {area} için periyodik bakım öneririz." }
  ],
  "beyaz-esya": [
    { q: "Çamaşır makinesi neden aşırı titriyor ve ses çıkarıyor?", a: "Amortisörlerin bitmesi veya rulman arızası buna sebep olur. {area} içinde yerinde parça değişimi ile makinenizi sessiz hale getiriyoruz." },
    { q: "Bulaşık makinesi tabanında su bırakıyor, arıza mı?", a: "Pompa motoruna bir cisim kaçmış veya gider hortumu tıkanmış olabilir. {area} çevresinde hızlı servisimizle sorunu yerinde gideriyoruz." },
    { q: "Buzdolabı soğutmuyor ama ışığı yanıyor, sebebi nedir?", a: "Muhtemelen kompresör (motor) veya gaz devresinde bir tıkanıklık oluşmuştur. {area} uzman kadromuzla motor değişimine kadar her aşamada yanınızdayız." },
    { q: "Beyaz eşya tamiri için orijinal parça kullanıyor musunuz?", a: "Evet, cihazın ömrünü korumak adına her zaman orijinal veya onaylı yüksek kaliteli yedek parçalar tercih ediyoruz." }
  ],
  endustriyel: [
    { q: "Endüstriyel mutfak ekipmanları için periyodik bakım var mı?", a: "Evet, restoran ve oteller için kurumsal bakım sözleşmeleri yapıyoruz. Gaz sızdırmazlığı ve termostat kontrolleri düzenli yapılmalıdır." },
    { q: "Merkezi sistem kazan dairesi arızalarına bakıyor musunuz?", a: "Kesinlikle. Yüksek kapasiteli kazanlar ve brülör ayarları konusunda {area} genelinde uzman kadromuz mevcuttur." }
  ]
};

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
  const catInsights = (technicalInsights as Record<string, string[]>)[serviceKind] || [];
  const techNote = pickOne(rng, catInsights.length > 0 ? catInsights : [""]);

  const vars = { 
    area, 
    serviceLabel, 
    brand: brand?.name ?? "", 
    city: city.name, 
    district: district?.name || area 
  };

  const intro = brandNote 
    ? advancedSpin(rng, `{area} {çevresinde|genelinde} {brand} {serviceLabel} {taleplerinizde|ihtiyaçlarınızda}, ${brandNote} {area} {geneline|her noktasına} yayılan {mobil|gezici} ekiplerimizle {yerinde|adreste} tespit ve {profesyonel|kurumsal} müdahale süreçlerini {standartlaştırıyoruz|yürütüyoruz}.`, vars)
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
    "{baseTitle} | {Garantili|Tam} {Onarım|Tamir} & Bakım | {businessName}",
    "{baseTitle} | {Hızlı|Hemen} Randevu | {businessName}",
    "{baseTitle} | Yerinde {Tespit|Kontrol} & Bakım | {businessName}",
    "{baseTitle} | {Uygun Ücretli|Hesaplı} Servis | {businessName}"
  ]);
  const title = advancedSpin(rng, titleTemplate, { baseTitle, businessName: site.businessName });

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
    "{lead}. {areas} {bölgesinde|tarafında} {a} ve {b}. {Hemen arayın!|Randevu için arayın.}",
    "{lead}. {a} + {b} {odağıyla|prensibiyle} {planlı|dürüst} hizmet. {areas} için {randevu oluşturun!|kayıt bırakın!}",
    "{lead}. {areas} {çevresinde|etrafında} yerinde {tespit|kontrol}, onaylı {işlem|onarım} ve test adımları. {Hemen arayın!|Bize ulaşın!}"
  ]);
  const description = advancedSpin(rng, descriptionTemplate, {
    lead,
    areas: serviceAreas || area,
    a,
    b
  });

  const highlights = pickManyUnique(rng, promisePools.flat(), 4).map(h => advancedSpin(rng, h, vars));
  const processPicked = pickManyUnique(rng, processSteps, 4);
  const reasonsPicked = pickManyUnique(rng, reasons, 4);
  
  // Dynamic Location-Keyword Coupling for Common Issues
  const rawIssues = [...issuesFor(serviceKind), ...(brandPlaybook?.issueFocus ?? [])];
  const commonIssues = pickManyUnique(rng, rawIssues, 6).map(issue => {
    // 60% chance to couple with location for SEO
    return rng() > 0.4 
      ? advancedSpin(rng, pickOne(rng, [`{area} ${issue}`, `${issue} {area}`]), vars)
      : issue;
  });

  const nearbyAreaNames = district
    ? [district.name, ...districtsPreview]
    : pickManyUnique(rng, city.districts.map((d) => d.name), 4);
  const scopeEntity = brand ? `${brand.name} ${serviceLabel}` : serviceLabel;
  let intelligence: any = null;
  const relevantFaqs = (faqByService as Record<string, { q: string; a: string }[]>)[serviceKind] || faqByService.kombi;
  const faqs = pickManyUnique(rng, relevantFaqs, 5).map((faq: any) => ({
    q: advancedSpin(rng, faq.q, vars),
    a: advancedSpin(rng, faq.a, vars)
  }));
  const serviceScopeTitle = advancedSpin(rng, district
    ? `${district.name} {ve Yakın Çevresinde|Bölgesinde} {scopeEntity} {Kapsamımız|Hizmetimiz}`
    : `${city.name} {Genelinde|İlinde} {scopeEntity} {Kapsamımız|Ağımız}`, { ...vars, scopeEntity });
  const serviceScopeBullets = [
    advancedSpin(rng, `{area} için {servis kaydı|arıza kaydı} açtığınızda {scopeEntity} {taleplerini|ihtiyaçlarını} {adresinize olan|bölgedeki} ekibimize {hızlıca|vakit kaybetmeden} {iletiyoruz|yönlendiriyoruz}.`, { ...vars, scopeEntity }),
    nearbyAreaNames.length
      ? advancedSpin(rng, `{scopeEntity} {planlamasında|çalışmalarında} {sıkça|her gün} {yolumuzun düştüğü|bulunduğumuz} yerler: ${nearbyAreaNames.join(", ")}.`, { ...vars, scopeEntity })
      : advancedSpin(rng, `{scopeEntity} {çalışmalarında|ekiplerimizin dağılımında} {city} {genelindeki|içindeki} {talepleri|kayıtları} {titizlikle|sırasıyla} {eşliyoruz|yönetiyoruz}.`, { ...vars, scopeEntity }),
    brand
      ? advancedSpin(rng, `{brand} cihazlarda {model ve hata|arıza} {belirtisini|kodunu} {not alarak|sisteme girerek} parça {uyumunu|hazırlığını} {önceden|gelmeden önce} {netleştiriyoruz|bakıyoruz}.`, vars)
      : advancedSpin(rng, `{serviceLabel} {işlerinde|taleplerinde} cihazın {kullanım durumu|geçmişi}, {bina|tesisat} yapısı ve eski {tamirleri|müdahaleleri} {ustalarımızca|birlikte} {incelenir|gözden geçirilir}.`, vars),
    serviceKind === "kombi"
      ? advancedSpin(rng, `{area} {için|tarafındaki} kombi {işlerinde|şikayetlerinde} basınç, {yanma|ateşleme} ve {sıcak su|ısıtma} {durumunu|akışını} bir arada {çözüyoruz|kontrol ediyoruz}.`, vars)
      : serviceKind === "klima"
      ? advancedSpin(rng, `{area} {için|tarafındaki} klima {işlerinde|şikayetlerinde} {gaz|performans} dengesi, {su akıtma|drenaj} ve {hijyen|temizlik} {durumunu|seviyesini} raporluyoruz.`, vars)
      : serviceKind === "beyaz-esya"
      ? advancedSpin(rng, `{area} {için|tarafındaki} beyaz eşya {işlerinde|şikayetlerinde} {elektrik|kart}, {su tahliyesi|pompa} ve {program|yıkama} {akışını|düzenini} test ediyoruz.`, vars)
      : advancedSpin(rng, `{area} {için|tarafındaki} {kurumsal|profesyonel} işlerde {sistem|çalışma} sürekliliğini ve {arıza|teknik} riskleri {birlikte|ustalıkla} ele alıyoruz.`, vars)
  ];

  const dVars = { ...vars, scopeEntity };
  const differentiationTitle = advancedSpin(rng, brand
    ? `${area} İçin {brand} {Odaklı|Temelli} Servis {Notları|Detayları}`
    : `${area} İçin {Yerel|Bölgesel} Operasyon {Notları|Planları}`, dVars);
  const differentiationBullets = [
    climateRegions[city.slug]?.extraNote
      ? advancedSpin(rng, `{city} özelinde {saha|servis} yaklaşımımız: ${climateRegions[city.slug].extraNote}`, dVars)
      : advancedSpin(rng, `{city} genelinde {şebeke|su}, kullanım {alışkanlığı|kültürü} ve mevsim {etkilerini|farklarını} tespit aşamasına dahil ediyoruz.`, dVars),
    brand && brandNote
      ? advancedSpin(rng, `{brand} {özel|spesifik} teknik yaklaşımımız: ${brandNote}`, dVars)
      : advancedSpin(rng, `{serviceLabel} {işlemlerinde|çalışmalarında} sadece arızayı değil, aynı problemi tekrar {üretebilecek|tetikleyebilecek} {çevresel|dış} nedenleri de {not ediyoruz|inceliyoruz}.`, dVars),
    district
      ? advancedSpin(rng, `{district} sayfasında {kullanılan|kurgulanan} akış; ilçe özel rota, yakın bölge iç linkleri ve {scopeEntity} sorgu niyetine göre {düzenlenmiştir|hazırlanmıştır}.`, dVars)
      : advancedSpin(rng, `{city} sayfasında {kullanılan|tasarlanan} akış; şehir genelindeki arama niyetlerini karşılamak için ilçe ve marka geçişleriyle {güçlendirilmiştir|zenginleştirilmiştir}.`, dVars),
    intelligence?.peopleAlsoAsk?.length
      ? advancedSpin(rng, `{area} için bu başlıkta kullanıcıların en çok sorduğu sorular veri setine işlendi ve içerik içinde ayrı blog olarak işlendi.`, dVars)
      : advancedSpin(rng, `{area} için soru-cevap bloklarını {scopeEntity} aramalarında en sık karşılaşılan kayıt, ücret, parça ve randevu başlıklarına göre {türetiyoruz|kurguluyoruz}.`, dVars)
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
    "{area} {çevresinde|etrafında} sık gelen taleplere göre arıza tespiti ve parça uyumunu {hızlandırmaya|serileştirmeye} odaklanıyoruz.",
    "{area} için randevulu planlama ile {yoğunluk|talep} yönetimini daha net yapıyoruz; en {hızlı|uygun} seçenekleri size sunarız.",
    "{area} bölgesinde cihaz türüne göre ({ısıtma|soğutma|ev aletleri}) kontrol listemizi {farklılaştırıyoruz|özelleştiriyoruz}.",
    "{area} için en sık ihtiyaç duyulan {bakım|kontrol} adımlarını standart hale getirip her işlemde uygularız.",
    "{area} içinde farklı {bina|tesisat} koşulları olabildiğinden, tespitte sahaya özel notlar alıp buna göre ilerleriz.",
    "{area} genelinde servis taleplerinde, {güvenli|sorunsuz} kullanım ve tekrar etmeyen çözüm hedefiyle tespit adımına önem veririz."
  ];

  const localProof = advancedSpin(rng, pickOne(rng, localProofVariants), vars);
  const trustSignals = pickManyUnique(rng, site.trustSignals, 4);
  
  // Dynamic Location-Keyword Coupling for Semantic Keywords
  const baseSemanticKeywords = pickManyUnique(rng, semanticKeywordsByService[serviceKind], 10);
  const semanticKeywords = baseSemanticKeywords.map(kw => {
    // 70% chance to couple with location for SEO
    return rng() > 0.3 
      ? advancedSpin(rng, pickOne(rng, [`{area} ${kw}`, `${kw} {area}`, `{area} ${kw} {hizmeti|desteği}`]), vars)
      : kw;
  });

  const insights = [
    ...pickManyUnique(rng, technicalInsights[serviceKind] || [], 2)
  ];

  intelligence = null;
  const intelPath = path.join(process.cwd(), "data/intelligence/services", `${city.slug}-${district?.slug || "city"}-${serviceKind}.json`);
  if (fs.existsSync(intelPath)) {
    try {
      intelligence = JSON.parse(fs.readFileSync(intelPath, "utf-8"));
    } catch (e) {
      // console.error(`- Error reading service intelligence at ${intelPath}:`, e);
    }
  }

  const regionalNote = climateRegions[city.slug]?.extraNote 
    ? advancedSpin(rng, `Özellikle {city} bölgesinde sahaya çıktığımızda gördüğümüz bir durum var: ${climateRegions[city.slug].extraNote}`, vars)
    : advancedSpin(rng, `{city} genelinde tespit ettiğimiz coğrafi ve şebeke suyu yapısına uygun spesifik bakım testlerini standart işlem adımlarımıza çoktan entegre ettik.`, vars);

  const fallbackExpertNote = {
    title: advancedSpin(rng, `Usta Notu: {city} Bölgesine Özel {Hassasiyetler|Detaylar}`, vars),
    content: advancedSpin(rng, `${regionalNote} Çoğu teknik servis bu detayı atlasa da, biz {serviceLabel} sürecinin olmazsa olmazı olarak kalıcı çözüme odaklanıyoruz.`, vars)
  };

  const generatedPaa = [
    {
      question: advancedSpin(rng, district
        ? `${district.name} {tarafında|bölgesinde} {scopeEntity} için en {çok|sık} hangi {şikayetlerle|sorunlarla} karşılaşıyorsunuz?`
        : `${city.name} {genelinde|ilinde} {scopeEntity} için en {çok|sık} hangi {şikayetlerle|sorunlarla} karşılaşıyorsunuz?`, { ...vars, scopeEntity }),
      answer: advancedSpin(rng, `${area} {civarı|için} {genelde|en çok} ${commonIssues.slice(0, 3).join(", ")} gibi {durumlar|arızalar} için {kayıt alıyoruz|bize ulaşıyorlar}. {Telefonda|Servis kaydı sırasında} marka ve {modeli|belirtiyi} {söylerseniz|paylaşırsanız} {hazırlıklı geliriz|işimiz daha kolay olur}.`, { ...vars, scopeEntity })
    },
    {
      question: advancedSpin(rng, `${area} için ${scopeEntity} {randevusu|kaydı} {yaparken|oluştururken} hangi {bilgiler|ayrıntılar} {gerekiyor|lazım}?`, { ...vars, scopeEntity }),
      answer: advancedSpin(rng, `Tam adresiniz, {marka/model|cihazın markası} ve {arıza belirtisi|sorunun ne olduğu} {bizim için|ekibimiz için} {yeterlidir|kafidir}. {Böylece|Bu sayede} {usta|ekipler} hangi {parça|ekipman} {gerekebileceğini|lazım olacağını} {önceden kestirip|gelmeden görüp} daha {hızlı|seri} {çözüm üretir|hareket eder}.`, { ...vars, scopeEntity })
    },
    {
      question: advancedSpin(rng, `${area} sayfasındaki ${scopeEntity} {yazıları|bilgileri} neden {diğerlerinden|bölgeye göre} farklı?`, { ...vars, scopeEntity }),
      answer: advancedSpin(rng, `Çünkü {city} içindeki {hava durumu|iklim}, şebeke suyu ve {cihaz kullanım|müşteri} alışkanlıkları her ilçede aynı değil. Biz de {bu yüzden|buna istinaden} ${scopeEntity.toLowerCase()} {bilgilerini|sayfalarını} {bölgesel|yerel} tecrübemize göre {hazırlıyoruz|yazıyoruz}.`, { ...vars, scopeEntity })
    }
  ];

  if (brand) {
    faqs.push({
      q: advancedSpin(rng, `${brand.name} ${serviceLabel} için {parça uyumu|yedek parça} nasıl {doğrulanıyor|sağlanıyor}?`, vars),
      a: advancedSpin(rng, `${area} {tarafındaki|içindeki} ${brand.name} cihazlarda, {model|seri} ve cihazın {yaşına|durumuna} göre en {uygun|doğru} parçayı {seçiyoruz|takıyoruz}. {İşleme|Tamire} başlamadan önce {zaten|muhakkak} parçanın {uyumunu|sağlamlığını} kontrol ederiz.`, vars)
    });

    if (brandPlaybook) {
      faqs.push({
        q: advancedSpin(rng, `${brand.name} ${serviceLabel} için en {çok|kritik} neresi kontrol edilir?`, vars),
        a: advancedSpin(rng, `${area} {civarı|tarafı} için ${brand.name} cihazlarda öncelikle ${brandPlaybook.issueFocus.join(", ")} gibi {noktalara|parçalara} bakıyoruz. {Ustalık|Tecrübe} gereği ${brandPlaybook.maintenanceFocus.join(", ")} adımlarını asla atlamıyoruz.`, vars)
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
    `${city.name} Teknik Servis | {İlçe Bazlı|Hızlı} {Yönlendirme|Servis} | ${site.businessName}`,
    `${city.name} {Teknik|Usta} Servisi | Kombi, Klima ve Beyaz Eşya | ${site.businessName}`,
    `${city.name} {Geneli|İli} {Servis|Tamir} ve Bakım Hizmetleri | ${site.businessName}`
  ]);
  const description = pickOne(rng, [
    `${city.name} için kombi, klima ve beyaz eşya {konusunda uzman|tamir} {sayfalarımız|ekiplerimiz}. İlçenizi seçin, {hızlıca|hemen} {randevu|arıza kaydı} oluşturun.`,
    `${city.name} genelinde {ilçe ilçe|tüm bölgede} {profesyonel|usta işi} teknik servis. {Cihazınızın|Makinenizin} derdini seçin ve {doğru|en yakın} ekibe ulaşın.`,
    `${city.name}’da {güvenilir|başarılı} teknik servis arıyorsanız {doğru yerdesiniz|yanınızdayız}. {Hizmet|Hizmet türü} seçiminizi yapıp {süreci|detayları} inceleyin.`
  ]);
  const intro = pickOne(rng, [
    `{Aşağıdan|Listeden} ilçenizi seçerek {serviceLabel|işe} başlayın. {Seçtiğiniz|İlgili} bölgeye {özel|has} servis {notları|bilgileri} ve {çözüm adımları|tamir detayları} sizi karşılayacak.`,
    `${city.name} {içindeki|genelindeki} {arızalar|servis talepleri} için {doğru|en uygun} ilçeyi belirleyin. Her {sayfada|bölümde} size {yakın|en hızlı} usta {bilgileri|yönlendirmeleri} yer almaktadır.`,
    `${city.name} için {kombi|klima|beyaz eşya} {servisi|tamiri} ihtiyaçlarında {ilçe ilçe|bölge bölge} {uzmanlığımızı|desteğimizi} sunuyoruz. İlçenizi seçip devam edebilirsiniz.`
  ]);
  const bullets = pickManyUnique(
    rng,
    [
      `${city.districts.length} ilçe için {ayrı ayrı|özel} servis ağı`,
      "{Cihaz|Ürün} tipine göre {nokta atışı|doğru} çözümler",
      "Marka bazlı {teknik|uzman} destek sayfaları",
      "{Hızlı|Seri} servis kaydı ve {planlı|kolay} randevu",
      "Sıkça sorulan sorular ve {usta|teknik} önerileri"
    ],
    3
  );

  const faqs = [
    { q: `${city.name} {tüm ilçelerine|geneline} geliyor musunuz?`, a: `Evet, ${city.name} ilinin {en uzak|tüm} {ilçelerine|mahallelerine} kadar {mobil|gezici} ekiplerimizle yerinde servis {hizmeti|desteği} veriyoruz.` },
    { q: `${city.name} için {nasıl|nereden} randevu alınır?`, a: "İsterseniz çağrı merkezimizi arayabilir, isterseniz web sitemizdeki ilçe sayfasından bilgilerinizi bırakarak bize ulaşabilirsiniz." },
    { q: "Servis ekipleri {ne kadar sürede|ne zaman} gelir?", a: "{Genelde|Kaydınız alındıktan sonra} yoğunluğa göre 2 saat içinde {kapınızda|yanınızda} olmayı {hedefliyoruz|amaçlıyoruz}." }
  ];

  return {
    title: advancedSpin(rng, title, { city: city.name }),
    description: advancedSpin(rng, description, { city: city.name }),
    h1: `${city.name} Teknik Servis`,
    intro: advancedSpin(rng, intro, { city: city.name }),
    bullets: bullets.map(b => advancedSpin(rng, b, { city: city.name })),
    faqs: faqs.map(f => ({
      q: advancedSpin(rng, f.q, { city: city.name }),
      a: advancedSpin(rng, f.a, { city: city.name })
    }))
  };
}

export function buildDistrictLandingContent(city: City, district: District): LandingContent {
  const rng = createRng(`district|${city.slug}|${district.slug}`);
  const title = pickOne(rng, [
    `${city.name} ${district.name} {Teknik|Usta} Servisi | {Hızlı|Garantili} Tamir & Bakım | ${site.businessName}`,
    `${city.name} ${district.name} {Servis|Onarım} Merkezi | Kombi, Klima, Beyaz Eşya | ${site.businessName}`,
    `${city.name} ${district.name} Teknik Destek | {Yerinde|Hemen} Servis | ${site.businessName}`
  ]);
  const description = pickOne(rng, [
    `${city.name} ${district.name} için {kombiden buzdolabına|beyaz eşyadan klimaya} {ustalıkla|özenle} servis hizmeti. {Hizmet|İşlem} türünü seçin, {detayları|fiyatları} görün.`,
    `${city.name} ${district.name} {bölgesi|tarafı} teknik servis sayfaları. {Cihazınızdaki|Evinizdeki} arızayı seçin, {ustalarımız|ekibimiz} kapınıza kadar gelsin.`,
    `${city.name} ${district.name} için {en doğru|profesyonel} hizmet sayfasına hoş geldiniz. {Arızalı|Bakım isteyen} cihazınızı seçip {süreci|yolu} başlatın.`
  ]);
  const intro = pickOne(rng, [
    "{Cihazınızın|Makinenizin} türünü seçin. {Seçiminize|İsteğinize} göre ${district.name} özelinde {hazırlanmış|kurgulanmış} {notlar|detaylar} ve {çözüm adımları|tamir süreçleri} sizi karşılayacak.",
    "Kombi, klima veya beyaz eşya... {Hangi cihazda|Nerede} sorun yaşıyorsanız ona tıklayın. Her {bölümde|sayfada} {usta|uzman} önerileri ve SSS yer alır.",
    "{Bölgeniz|Kapınız} için uygun hizmet türünü seçerek devam edin. {İlçe|Mahalle} bazlı yapımız sayesinde {doğru|en yakın} servis sayfasına {vakit kaybetmeden|hızlıca} ulaşırsınız."
  ]);
  const bullets = pickManyUnique(
    rng,
    [
      "Hizmet seçimi: {Kombi|Klima|Beyaz Eşya}",
      "{District|Bölge} bazlı {hızlı|seri} {yönlendirme|bağlantı}",
      "Marka bazlı {özel|tekniğine uygun} sayfalar",
      "Sıkça sorulan sorular ve {arıza|usta} notları"
    ],
    3
  );

  const faqs = [
    { q: `${city.name} ${district.name} {tarafında|bölgesinde} {ücretler|servis bedeli} ne kadar?`, a: "Servis ücretlerimiz {yapılan işleme|işin zorluğuna} göre {şeffaf|net} şekilde belirlenir. Önce arızayı görüp, size {uygun|dürüstçe} bir fiyat sunuyoruz." },
    { q: `${district.name} {çevresinde|ilçesinde} hangi {makinelere|cihazlara} bakıyorsunuz?`, a: `${district.name} genelinde kombiden klimaya, buzdolabından çamaşır makinesine kadar {neredeyse|tüm} beyaz eşyaların tamirini yapıyoruz.` },
    { q: "Size {nereden|nasıl} ulaşabilirim?", a: `İsterseniz telefonla bizi arayın, isterseniz ${district.name} sayfası üzerindeki formdan {bilgilerinizi|kaydınızı} bırakın.` }
  ];

  const vars = { city: city.name, district: district.name };
  return {
    title: advancedSpin(rng, title, vars),
    description: advancedSpin(rng, description, vars),
    h1: `${city.name} ${district.name} Teknik Servis`,
    intro: advancedSpin(rng, intro, vars),
    bullets: bullets.map(b => advancedSpin(rng, b, vars)),
    faqs: faqs.map(f => ({
      q: advancedSpin(rng, f.q, vars),
      a: advancedSpin(rng, f.a, vars)
    }))
  };
}

export function buildBrandLandingContent(brand: Brand): LandingContent {
  const rng = createRng(`brand|${brand.slug}`);
  const title = pickOne(rng, [
    `${brand.name} Servisi | {Ustalıkla|Titiz} Teknik Destek | ${site.businessName}`,
    `${brand.name} Teknik Servis | {Garantili|Kaliteli} Bakım & Onarım | ${site.businessName}`,
    `${brand.name} {Servis Merkezi|Tamir Hattı} | {İşin Ehli|Tecrübeli} Teknisyenler | ${site.businessName}`
  ]);
  const description = pickOne(rng, [
    `${brand.name} cihazlarınız için {kombiden klimaya|beyaz eşyadan tamire} {usta işi|uzman} çözümler. {Bölgeye özel|Yanınızdaki} servis sayfalarına göz atın.`,
    `${brand.name} {genelinde|markası için} {güvenilir|başarılı} teknik destek. {Türkiye'nin dört bir yanında|81 ilde} {hızlı|seri} arıza kaydı ve usta planlaması.`,
    `${brand.name} servis ihtiyaçlarınızda {tecrübeli|deneyimli} kadromuzla {her zaman|7/24} yanınızdayız. Cihazınızı seçin ve {yola çıkalım|en yakın ekibe ulaşın}.`
  ]);
  const intro = pickOne(rng, [
    `${brand.name} marka cihazlarınızın {canını|performansını} korumak için, {yapısına|tekniğine} uygun orijinal {yedek|parça} ve {usta işi|temiz} işçilikle {destek veriyoruz|yanınızdayız}.`,
    `${brand.name} servis {sürecimizde|çalışmalarımızda}, markanın {dilinden anlayan|yapısını bilen} {ustalarımızla|arkadaşlarımızla} {tüm bölgelerde|yayılan ağımızla} hizmet veriyoruz.`,
    `${brand.name} kullanıcıları için {kurduğumuz|hazırladığımız} bu servis modelinde {hız|seri müdahale}, {dürüstlük|şeffaflık} ve {bilgi birikimi|tecrübe} en ön sıradadır.`
  ]);
  const bullets = pickManyUnique(
    rng,
    [
      `${brand.name} cihazlara {has|özel} {teknik|test} ekipmanlar`,
      "1 Yıl {parça|işçilik} ve onarım garantisi",
      "{Kombi, klima ve beyaz eşya|Tüm ev aletleri} uzmanlığı",
      "Size {en yakın|en hızlı} usta yönlendirmesi",
      "{Şeffaf|Açık} fiyat ve {onaylı|sürprizsiz} süreç"
    ],
    3
  );

  const faqs = [
    { q: `${brand.name} servisi için {nasıl|nereden} randevu alınır?`, a: `Çağrı merkezimizden veya sitemizdeki ${brand.name} sayfasından bölgenizi seçerek {hızlıca|hemen} kayıt açtırabilirsiniz.` },
    { q: `${brand.name} cihazlarda parça değişimi {yapıyor musunuz|nasıl oluyor}?`, a: "Cihazın {verimini|çalışmasını} bozmamak için sadece {markayla uyumlu|kaliteli} ve onaylı parçalarla değişim yapıyoruz." },
    { q: "{Siz|Ekipleriniz} yetkili servis misiniz?", a: `Biz ${brand.name} markasından bağımsız, {kurumsal kalitede|özel olarak} hizmet veren {usta|profesyonel} bir teknik servisiyiz. Genelde garantisi bitmiş cihazlara bakıyoruz.` }
  ];

  const vars = { brand: brand.name };
  return {
    title: advancedSpin(rng, title, vars),
    description: advancedSpin(rng, description, vars),
    h1: `${brand.name} Servisi`,
    intro: advancedSpin(rng, intro, vars),
    bullets: bullets.map(b => advancedSpin(rng, b, vars)),
    faqs: faqs.map(f => ({
      q: advancedSpin(rng, f.q, vars),
      a: advancedSpin(rng, f.a, vars)
    }))
  };
}

export function buildCityBrandLandingContent(city: City, brand: Brand): LandingContent {
  const rng = createRng(`citybrand|${city.slug}|${brand.slug}`);
  const area = city.name;
  
  const title = pickOne(rng, [
    `${area} ${brand.name} Servisi | {Hızlı|Garantili} Teknik Destek | ${site.businessName}`,
    `${area} ${brand.name} {Teknik|Usta} Servis | {7/24|Hemen} Randevu Hattı | ${site.businessName}`,
    `${area} ${brand.name} {Servis Merkezi|Tamir Durağı} | {Ehli|Uzman} Teknisyenler | ${site.businessName}`
  ]);
  
  const description = pickOne(rng, [
    `${area} genelinde ${brand.name} {kombi, klima ve beyaz eşya|tüm ev aletleri} için {usta işi|temiz} çözümler. {Hızlı|Seri} servis, dürüst fiyat ve 1 yıl garanti.`,
    `${area} ${brand.name} teknik servis: {kombi bakımı|gaz dolumu} ve {beyaz eşya tamiri|arıza tespiti}. {Eski usul|Samimi} esnaflık ve yeni nesil teknoloji bir arada.`,
    `${brand.name} marka cihazlarınız için ${area} bünyesinde {uzmanından|ustasından} destek. Cihazınızı seçin ve {kapınızdaki|yakınınızdaki} ekibe ulaşın.`
  ]);
  
  const intro = pickOne(rng, [
    `${area} bölgesindeki ${brand.name} kullanıcıları için {kurduğumuz|hazırladığımız} bu servis modelinde {hız|serilik}, {şeffaflık|dürüstlük} ve {ustalık|bilgi} önceliğimizdir.`,
    `${area} sakinlerine sunduğumuz ${brand.name} desteğinde, cihazın {dilinden anlayan|yapısını bilen} {ustalarımızla|arkadaşlarımızla} yerinde çözüm {üretiyoruz|sunuyoruz}.`,
    `${brand.name} cihazların {canını|performansını} korumak için ${area} genelinde orijinal parça ve {temiz|usta işi} işçilikle {hizmet veriyoruz|yanınızdayız}.`
  ]);
  
  const bullets = pickManyUnique(
    rng,
    [
      `${area} genelinde {30 dakikada|hızla} {mobil|seri} servis`,
      `${brand.name} cihazlara {has|özel} {teknik|test} aletleri`,
      "1 Yıl {parça|işçilik} ve tamir garantisi",
      "{Dürüst|Şeffaf} fiyat ve işlem öncesi el sıkışma",
      "{Kombi, klima ve beyaz eşya|Tüm makinelerde} uzmanlık"
    ],
    3
  );

  const faqs = [
    { q: `${area} içinde ${brand.name} servisi {ne zaman|ne kadar sürede} gelir?`, a: `${area} genelindeki {gezici|mobil} ekiplerle, kaydınız düştükten sonra {ortalama|genelde} 30-60 dakika içinde {kapınızda|yanınızda} olmayı {hedefliyoruz|deniyoruz}.` },
    { q: `${brand.name} {tamiri|bakımı} yerinde mi yapılıyor?`, a: `Cihazların %90'ı yerinde tamir edilir. Sadece {kart|motor} gibi {ağır|hassas} işlemler için ${area} merkez {istasyonumuza|atölyemize} alınabilir.` },
    { q: "Yapılan işlemler garantili mi?", a: `Elbette, ${area} genelinde yaptığımız tüm ${brand.name} işlemleri ve değişen parçalar 1 yıl boyunca {garantimiz altındadır|sözümüzdür}.` }
  ];

  const vars = { city: city.name, brand: brand.name };
  return {
    title: advancedSpin(rng, title, vars),
    description: advancedSpin(rng, description, vars),
    h1: `${area} ${brand.name} Servisi`,
    intro: advancedSpin(rng, intro, vars),
    bullets: bullets.map(b => advancedSpin(rng, b, vars)),
    faqs: faqs.map(f => ({
      q: advancedSpin(rng, f.q, vars),
      a: advancedSpin(rng, f.a, vars)
    }))
  };
}

