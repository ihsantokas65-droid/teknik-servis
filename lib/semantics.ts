import type { ServiceKind } from "@/lib/services";

export const semanticKeywordsByService: Record<ServiceKind, string[]> = {
  kombi: [
    "kombi kart tamiri",
    "petek temizliği",
    "eşanjör temizliği",
    "3C arıza kodu çözümü",
    "227 hata kodu tamiri",
    "kombi anakart onarımı",
    "genleşme tankı hava basımı",
    "yoğuşmalı kombi bakımı",
    "kazan dairesi servisi",
    "oda termostatı montajı",
    "fan motoru temizliği",
    "doldurma musluğu değişimi",
    "baca temizliği ve uzatması",
    "gaz valfi ayarı",
    "plakalı eşanjör değişimi"
  ],
  klima: [
    "klima bakımı",
    "gaz dolumu",
    "kaçak testi",
    "drenaj temizliği",
    "koku problemi",
    "performans düşüklüğü",
    "iç ünite temizliği",
    "vakumlama",
    "yerinde servis",
    "klima bakım fiyatları"
  ],
  "beyaz-esya": [
    "çamaşır makinesi tamiri",
    "bulaşık makinesi tamiri",
    "buzdolabı soğutmuyor",
    "fırın ısıtmıyor",
    "su almıyor / boşaltmıyor",
    "program arızası",
    "motor/pompa arızası",
    "orijinal / muadil parça",
    "yerinde servis",
    "beyaz eşya servis fiyatları"
  ],
  endustriyel: [
    "kazan dairesi bakımı",
    "merkezi klima sistemi tamiri",
    "VRF/VRD sistemleri",
    "endüstriyel mutfak onarımı",
    "soğuk hava deposu servisi",
    "kurumsal periyodik bakım",
    "hidrofor ve pompa sistemleri",
    "endüstriyel yıkama ekipmanları",
    "kurumsal iklimlendirme çözümleri",
    "yıllık bakım sözleşmesi"
  ]
};

export const brandServicePlaybooks: Partial<Record<string, Partial<Record<ServiceKind, {
  issueFocus: string[];
  maintenanceFocus: string[];
  proofPoints: string[];
}>>>> = {
  buderus: {
    kombi: {
      issueFocus: ["{Logamax|Plus} serisi {3C|227} arıza kodları", "{iyonizasyon|ateşleme} ve baca {çekiş|tahliye} dengesi", "anakart {kart} tamiri ve voltaj regülasyonu", "yoğuşma hattı ve {sifon|gider} temizliği"],
      maintenanceFocus: ["GB062, GB122i ve GB022 model {spesifik} kontrolleri", "{iyonizasyon|ateşleme} elektrodu ve yanma odası temizliği", "genleşme tankı azot basınç dengesi", "baca çekiş ve {gaz|yanma} ayarı"],
      proofPoints: ["Buderus cihazlarda {3C|227} gibi kronik hatalarda {kart|fan} odaklı kesin çözüm sunuyoruz.", "Logamax serisi cihazların modülasyon verimini {cihaz başında} ölçüyoruz."]
    }
  },
  bosch: {
    kombi: {
      issueFocus: ["sensor ve hata kodu tekrarları", "sicak su veya devirdaim dengesizligi", "nem kaynakli kart baglanti etkileri"],
      maintenanceFocus: ["sensor kalibrasyonu", "pompa ve esanjor verim testi", "hata koduna gore adim adim kontrol"],
      proofPoints: ["Bosch cihazlarda belirti ile hata kodunu birlikte yorumluyoruz.", "Onarim sonunda isitma ve sicak su senaryolarini ayri ayri test ediyoruz."]
    },
    "beyaz-esya": {
      issueFocus: ["su alma bosaltma dongusu sorunlari", "program sonunda yarim kalan akis", "motor veya pompa verim dusuklugu"],
      maintenanceFocus: ["filtre pompa ve kart tetikleme kontrolleri", "program akisi dogrulamasi", "ses titresim ve tahliye testleri"],
      proofPoints: ["Bosch beyaz esya grubunda program akisini test etmeden teslim yapmiyoruz.", "Ayni belirtiyi olusturan birden fazla sebebi cihaz tipine gore ayristiriyoruz."]
    }
  },
  vaillant: {
    kombi: {
      issueFocus: ["atesleme ve gaz valfi dengesizlikleri", "modulasyon davranisi dalgalanmasi", "sicak su konforunu bozan sensor sorunlari"],
      maintenanceFocus: ["gaz valfi ve iyonizasyon kontrolu", "modulasyon davranisi izleme", "esanjor ve NTC sensor kontrolu"],
      proofPoints: ["Vaillant cihazlarda alev davranisini sadece hata koduna gore degil calisma karakterine gore yorumluyoruz.", "Bakim sonrasinda su konforunu ve isitma dengesini ayrica olcuyoruz."]
    }
  },
  viessmann: {
    kombi: {
      issueFocus: ["yanma verimliligini dusuren kirlenme", "atesleme veya baca kaynakli hata tekrarları", "sicak su tarafinda gecikme"],
      maintenanceFocus: ["brulor ve esanjor temizligi", "yanma ve cekis dengesi kontrolu", "sensor ve sicak su davranisi testi"],
      proofPoints: ["Viessmann cihazlarda enerji verimini etkileyen ince ayarlari teslim oncesi kontrol ediyoruz.", "Calisan ama verimsiz kalan cihazlari da ariza gibi degerlendiriyoruz."]
    }
  },
  baymak: {
    kombi: {
      issueFocus: ["hidroblok ve sirkulasyon davranisi", "basinc dalgalanmasi", "atesleme veya akis sorunlari"],
      maintenanceFocus: ["hidroblok ve devirdaim kontrolu", "basinc dengesi izlemi", "sicak su davranisi testi"],
      proofPoints: ["Baymak kombilerde tesisat etkisini cihazin kendi arizasindan ayirarak ilerliyoruz.", "Parca degisimi gerekiyorsa once davranis testini kayda aliyoruz."]
    }
  },
  demirdokum: {
    kombi: {
      issueFocus: ["anakart ve sensor uyumundan kaynakli tekrarlar", "atesleme ve resetleme gerektiren senaryolar", "basinc ve isitma dengesizlikleri"],
      maintenanceFocus: ["kart ve sensor okuma kontrolu", "atesleme adimlarini dogrulama", "isitma ve sicak su tarafini ayri test etme"],
      proofPoints: ["Demirdokum cihazlarda ariza hafizasini ve mevcut belirtiyi birlikte degerlendiriyoruz.", "Reset sonrasi gecici duzelme varsa kok neden analizi yapiyoruz."]
    }
  },
  eca: {
    kombi: {
      issueFocus: ["gaz valfi ve yanma dengesindeki sapmalar", "esanjor kirlenmesine bagli sicak su sorunlari", "basinc ve devirdaim kaynakli problemler"],
      maintenanceFocus: ["gaz ayari ve yanma kontrolu", "esanjor temizligi ve akis kontrolu", "basinc ve devirdaim testi"],
      proofPoints: ["ECA cihazlarda yakit ekonomisini etkileyen ayar kaymalarini bakim listesine dahil ediyoruz.", "Ariza cozulduktan sonra normal calisma karakterini tekrar kontrol ediyoruz."]
    }
  },
  arcelik: {
    "beyaz-esya": {
      issueFocus: ["pompa ve tahliye aksinda tekrar eden sorunlar", "program akisi ve kart tetikleme problemleri", "gurultu titresim ve amortisor kaynakli belirtiler"],
      maintenanceFocus: ["pompa tahliye ve filtre temizligi", "program akisi ve sensor dogrulamasi", "mekanik denge ve ses kontrolu"],
      proofPoints: ["Arcelik grubunda ayni belirtiyi veren pompa kart ve sensor sorunlarini ayri ayri test ediyoruz.", "Teslim oncesi cihazin temel program dongusunu dogruluyoruz."]
    }
  },
  beko: {
    "beyaz-esya": {
      issueFocus: ["su alma bosaltma kaynakli kesintili calisma", "motor ve pompa performans dusuklugu", "isitma veya sogutma tarafinda tamamlanmayan dongu"],
      maintenanceFocus: ["filtre ve tahliye aksinin kontrolu", "motor pompa ve isitma davranisi testi", "program sonu dogrulamasi"],
      proofPoints: ["Beko cihazlarda kullanici belirtisini program akisiyla eslestirerek ilerliyoruz.", "Tahliye ve sensor kontrolunu birlikte yaparak tekrar riskini azaltmaya calisiyoruz."]
    }
  },
  vestel: {
    klima: {
      issueFocus: ["kart ve kumanda tarafinda komut alma sorunlari", "sogutma dusuklugu ve gaz dengesi", "ic unite su akitma veya koku senaryolari"],
      maintenanceFocus: ["kart resetleme ve komut davranisi", "gaz basinci ve fan performans testi", "drenaj ve hijyen bakimi"],
      proofPoints: ["Vestel klima grubunda reset sonrasini da ayri test ediyoruz.", "Sogutma performansini sadece hisle degil temel olcumlerle kontrol ediyoruz."]
    },
    "beyaz-esya": {
      issueFocus: ["kart kaynakli program sapmalari", "su alma bosaltma ve pompa davranisi", "isitma ya da sogutma performans dusuklugu"],
      maintenanceFocus: ["kart tepki ve program akisi kontrolu", "pompa tahliye ve sensor testi", "tamamlanan dongu dogrulamasi"],
      proofPoints: ["Vestel beyaz esya grubunda parca degisimi sonrasinda reset ve test adimlarini atlamiyoruz.", "Belirti tekrarini azaltmak icin kullanim kosulunu da analize dahil ediyoruz."]
    }
  },
  lg: {
    klima: {
      issueFocus: ["kompresor verim dusuklugu ve sogutma kaybi", "ic unite hijyen ve su akitma kaynakli sorunlar", "kumanda veya kart tarafinda tepki gecikmeleri"],
      maintenanceFocus: ["kompresor ve fan davranisi kontrolu", "drenaj ve ic unite hijyen bakimi", "komut alma ve calisma modu dogrulamasi"],
      proofPoints: ["LG cihazlarda sogutma dengesini uzun calisma senaryosunda izliyoruz.", "Hijyen kaynakli performans kaybini yalnizca gaz eksigi sanmiyoruz."]
    }
  },
  samsung: {
    klima: {
      issueFocus: ["inverter kart davranisi ve hata tekrarları", "sogutma dengesizligi veya kompresor gecikmesi", "kumanda komutlarina gec tepki verilmesi"],
      maintenanceFocus: ["kart ve inverter davranisi kontrolu", "kompresor devreye giris testi", "mod ve sicaklik tepkisi dogrulamasi"],
      proofPoints: ["Samsung klima grubunda elektronik davranisi gozlemlemeden sadece gaz kontrolu ile yetinmiyoruz.", "Sorun sogutma dusuklugu gibi gorunse de kart tarafini birlikte degerlendiriyoruz."]
    }
  },
  daikin: {
    klima: {
      issueFocus: ["gaz sizdirmazligi ve performans kaybi", "elektronik genlesme vanasi veya kart etkileri", "ic unite drenaj ve hava debisi sorunlari"],
      maintenanceFocus: ["gaz ve sizdirmazlik kontrolu", "hava debisi ve fan davranisi testi", "drenaj ve sensor kontrol listesi"],
      proofPoints: ["Daikin cihazlarda vakum sizdirmazlik ve gaz dengesini birlikte yorumluyoruz.", "Performans dusuklugunde sadece filtre temizligiyle yetinmeyip sistem davranisini izliyoruz."]
    }
  },
  mitsubishi: {
    klima: {
      issueFocus: ["yuksek basincli calisma yapisinda sapmalar", "vakumlama veya gaz dengesine bagli sogutma sorunlari", "ic dis unite haberlesmesi ve hata tekrarları"],
      maintenanceFocus: ["gaz terazisi ve basinc davranisi kontrolu", "haberlesme ve kart tarama adimlari", "uzun sureli sogutma performansi testi"],
      proofPoints: ["Mitsubishi cihazlarda kurulum kalitesinin etkisini ariza analizine dahil ediyoruz.", "Yuksek performansli cihazlarda ufak ayar sapmalarinin buyuk konfor kaybina yol actigini dikkate aliyoruz."]
    }
  }
};

export const technicalInsights: Record<ServiceKind, string[]> = {
  kombi: [
    "Yıllık bakımda yanma odası temizliği, iyonizasyon ayarı ve genleşme tankı basıncı kritik öneme sahiptir.",
    "Kombi basıncının düşmesi genellikle tesisattaki bir sızıntıdan veya genleşme tankındaki hava eksikliğinden kaynaklanır.",
    "Peteklerin ısınmaması durumunda devirdaim pompası ve vanalar ilk kontrol edilmesi gereken noktalardır.",
    "Sıcak suyun dalgalanması genellikle plakalı eşanjör kireçlenmesi veya NTC sensör hassasiyeti ile ilgilidir.",
    "Ateşleme arızaları (3C, 227 vb.) genellikle gaz valfi, fan motoru veya anakart üzerindeki rölelerle bağlantılıdır.",
    "Kombi altından su sızması, emniyet ventilinin açması veya pompa contalarındaki aşınmadan kaynaklanabilir."
  ],
  klima: [
    "Klima bakımı sadece filtre temizliği değildir; ilaçlı dezenfeksiyon ve dış ünite kondanser temizliği şarttır.",
    "Klimanın soğutmaması genellikle gaz eksikliği, kompresör kalkış arızası veya fan kirliliğinden kaynaklanır.",
    "Klima su akıtması, drenaj hortumunun tıkanması veya iç ünite tavasının tozlanması sonucunda oluşur.",
    "Klima gazı normal şartlarda bitmez; eğer performans düştüyse sistemde bir kaçak (sızıntı) aranmalıdır.",
    "VRF sistemlerinde iletişim hataları genellikle kablolama korozyonu veya anakart dalgalanmaları kaynaklıdır."
  ],
  "beyaz-esya": [
    "Beyaz eşyalarda kireç ve yağ birikimi motoru yorar; düzenli temizleyici kullanımı ömrü %30 artırır.",
    "Çamaşır makinesi su almıyorsa giriş valfi (ventili), kapı kilidi veya filtre tıkanıklığı kontrol edilmelidir.",
    "Su boşaltma sorunu genellikle pompa motorunun içine kaçan yabancı cisimler nedeniyle oluşur.",
    "Buzdolabı soğutmuyor ise drayer tıkanıklığı veya motor basınç kaybı muhtemel nedenler arasındadır.",
    "Fırınların dengesiz pişirmesi rezistansın zayıflaması veya termostat kalibrasyon bozukluğu ile ilgilidir."
  ],
  endustriyel: [
    "Kazan dairesi otomasyonu, enerji verimliliği ve arıza takibi için merkezi kontrol sunar.",
    "Merkezi klima sistemlerinde (VRF) gaz dengesi ve iletişim hattı sürekliliği kritiktir.",
    "Endüstriyel mutfak ekipmanlarında gaz sızdırmazlığı ve termostat kalibrasyonu güvenliği belirler.",
    "Büyük ölçekli soğutma gruplarında kompresör yağı ve vibrasyon analizi önleyici bakımdır."
  ]
};

export const brandExpertNotes: Record<string, Partial<Record<ServiceKind, string>>> = {
  bosch: {
    kombi: "Bosch kombilerin {yüksek verimli|nitelikli} eşanjör yapısı ve {hassas|gelişmiş} sensör teknolojisi, {düzenli|periyodik} bakım ile {uzun ömürlü|sorunsuz} kullanım sunar.",
    klima: "Bosch klima sistemlerinde inverter {sürücü|kontrol} kartı ve kompresör uyumu, {enerji tasarrufu|verimlilik} için hassas gaz {şarjı|dolumu} gerektirir.",
    "beyaz-esya": "Bosch beyaz eşya grubunda {program akışı|çalışma döngüsü} ve sensör kalibrasyonu, cihazın {verimli|kararlı} çalışması için kritik öneme sahiptir."
  },
  vaillant: {
    kombi: "Vaillant döküm eşanjör ve modülasyonlu pompa sistemleri, Alman mühendisliği standartlarında profesyonel ayar gerektirir."
  },
  buderus: {
    kombi: "Buderus yoğuşma teknolojisi, iyonizasyon ayarları ve baca çekiş hassasiyeti konusunda uzmanlık isteyen bir mimariye sahiptir."
  },
  viessmann: {
    kombi: "Viessmann cihazlarda paslanmaz çelik silindirik brülör yapısı, enerji tasarrufu için periyodik kalibrasyon odağındadır."
  },
  baymak: {
    kombi: "Baymak sistemlerinde hidroblok yapısı ve sirkülasyon basınç değerleri, tesisat sağlığı için kritik öneme sahiptir."
  },
  demirdokum: {
    kombi: "DemirDöküm yerli üretim teknolojisi, yaygın parça ağına rağmen anakart ve sensör uyumu konusunda hassasiyet ister."
  },
  eca: {
    kombi: "ECA kombilerde gaz valfi ayarları ve eşanjör temizliği, yakıt ekonomisi için her yıl kontrol edilmelidir."
  },
  arcelik: {
    "beyaz-esya": "Arçelik sistemleri, yaygın kullanım nedeniyle {pompa ömrü|tahliye aksı} ve amortisör dengesi konularında {uzman|profesyonel} desteği gerektirir.",
    kombi: "Arçelik kombilerde elektronik kart ve sensör {haberleşmesi|iletişimi}, voltaj {dalgalanmalarına|değişimlerine} karşı periyodik kontrol edilmelidir.",
    klima: "Arçelik klima grubunda dış ünite fan motoru ve {gaz basınç dengesi|soğutucu akışkan}, yaz aylarında {yüksek performans|verimlilik} için kritiktir."
  },
  beko: {
    "beyaz-esya": "Beko beyaz eşya grubunda, su tahliye sistemi ve çalışma döngüsü tutarlılığı uzman teknisyenlerimizce denetlenmektedir.",
    kombi: "Beko kombi modellerinde ateşleme grubu ve sensör hassasiyeti, kış aylarında kesintisiz ısınma için optimize edilir."
  },
  samsung: {
    klima: "Samsung Inverter teknolojisi, elektronik kart hassasiyeti ve gaz basınç dengesi ile yüksek konfor odaklıdır.",
    "beyaz-esya": "Samsung beyaz eşya grubunda dijital inverter motor ve elektronik kontrol birimleri, profesyonel teşhis cihazlarıyla kontrol edilir."
  },
  lg: {
    klima: "LG cihazlarda kompresör sağlığı ve iç ünite hijyeni, enerji sınıfı performansını doğrudan etkiler.",
    "beyaz-esya": "LG doğrudan tahrikli (Direct Drive) motor sistemleri, sarsıntısız çalışma için mekanik balans ayarı gerektirir."
  },
  vestel: {
    "beyaz-esya": "Vestel cihazlarda parça değişim sonrası yazılımsal resetleme ve test adımları, cihazın fabrika ayarlarına dönmesi için önemlidir.",
    klima: "Vestel klima sistemlerinde kart komutları ve kompresör kalkış kapasitörleri, hızlı soğutma performansı için test edilmelidir.",
    kombi: "Vestel kombilerde yerli anakart yapısı ve hidrolik aksam uyumu, periyodik bakım ile uzun ömür kazandırır."
  },
  daikin: {
    klima: "Daikin VRV ve Split sistemler, gaz sızdırmazlığı ve elektronik genleşme vanası hassasiyeti ile bilinir."
  },
  mitsubishi: {
    klima: "Mitsubishi Heavy/Electric serileri, yüksek basınçlı kompresör yapıları nedeniyle vakumlama ve gaz terazisi ile çalışılmalıdır."
  }
};


export const technicalQaByService: Record<ServiceKind, { s: string; r: string; a: string }[]> = {
  kombi: [
    { s: "3C arıza kodu yanıp sönüyor", r: "fan motoru diferansiyel basınç hatası veya kart rölesi", a: "Bu durum genellikle atık gaz tahliyesindeki aksaklıklardan kaynaklanır. Fanın temizlenmesi veya anakart üzerindeki ilgili rölenin revizyonu ile sorun çözülür." },
    { s: "sıcak su açıldığında petekler de ısınıyor", r: "üç yollu vana mekanizması veya motoru", a: "Kombiniz sıcak su talebini kalorifer tesisatına sızdırıyor demektir. Üç yollu vananın iç takımının temizlenmesi veya motorunun değişimi konforunuzu geri getirecektir." },
    { s: "kombi sürekli su eksiltiyor", r: "genleşme tankı havası veya tesisat kaçağı", a: "Gözle görülür bir sızıntı yoksa genleşme tankının azot basıncı bitmiş olabilir. Tankın havası tamamlanmalı, sorun devam ederse tesisata kaçak giderici kimyasal uygulanmalıdır." },
    { s: "ateşleme yapıyor ama geri sönüyor", r: "iyonizasyon elektrodu kirliliği veya nötr-toprak çakışması", a: "Cihaz alevi algılayamıyor. İyonizasyon elektrodunun zımparalanması ve temizlenmesi, ayrıca voltaj dengesinin kontrol edilmesi gerekir." },
    { s: "peteklerin altı soğuk üstü sıcak", r: "çamurlaşma ve tesisat kirliliği", a: "Bu bir kombi arızasından ziyade tesisat tıkanıklığıdır. Makineyle ve özel kimyasallar ile petek temizliği yapılarak sirkülasyon kanalları açılmalıdır." }
  ],
  klima: [
    { s: "iç üniteden su damlatıyor", r: "drenaj tavası tıkanıklığı veya hatalı montaj eğimi", a: "Toz ve kir birikimi drenaj hattını tıkamış olabilir. Hattın vakumlanarak açılması ve iç ünite tavasının dezenfekte edilmesi sorunu giderir." },
    { s: "kötü bir rutubet kokusu geliyor", r: "evaporatör üzerinde oluşan bakteri ve mantarlar", a: "Klima iç ünite petekleri (evaporatör) biyolojik temizlik gerektiriyor. Özel dezenfektan spreyler ve basınçlı temizlik ile koku tamamen yok edilir." },
    { s: "soğutma yapmıyor sadece üflüyor", r: "gaz kaçağı, kondansatör (kapasitör) veya kompresör arızası", a: "Klimanızın gazı (R32/R410) bitmiş veya dış ünite kompresörü devreye girmiyor olabilir. Basınç testi yapılıp kaçak giderildikten sonra hassas gaz dolumu yapılmalıdır." },
    { s: "kumanda komutlarını algılamıyor", r: "alıcı göz arızası veya display kartı sorunu", a: "Kumanda pilleri sağlamsa iç ünite üzerindeki alıcı göz oksitlenmiş veya bozulmuş olabilir. Parça değişimi ile uzaktan kontrol tekrar sağlanır." }
  ],
  "beyaz-esya": [
    { s: "çamaşır makinesi aşırı gürültülü ve sarsıntılı", r: "kazan rulmanları, amortisörler veya dengesiz yük", a: "Makinenizin amortisörleri özelliğini yitirmiş veya kazan bilyaları dağılmış olabilir. Bu durumun daha büyük hasar vermemesi için rulman setinin değişimi şarttır." },
    { s: "bulaşık makinesi tabanında su bırakıyor", r: "tıkalı gider pompası veya hortum katlanması", a: "Pompa motoruna kaçan bir yabancı cisim suyun tahliyesini engelliyor olabilir. Filtre ve pompa pervanesinin temizlenmesi genellikle sorunu çözer." },
    { s: "buzdolabı alt bölme soğutmuyor", r: "evaporatör fanı veya rezistans arızası (No-frost)", a: "Hava kanalları buzlanmış veya fan motoru durmuş olabilir. Rezistans ve sensör kontrolü yapılarak defrost sisteminin sağlıklı çalışması sağlanmalıdır." },
    { s: "çamaşır makinesi suyu ısıtmıyor", r: "rezistans (ısıtıcı) kireçlenmesi veya kart rölesi", a: "Rezistans kireçten dolayı yanmış veya anakarttan ısıtma komutu gelmiyor olabilir. Multimetre ile rezistans direnci ölçülüp gerekirse değişim yapılmalıdır." }
  ],
  endustriyel: [
    { s: "merkezi sistemde bazı daireler ısınmıyor", r: "balans vanası ayarsızlığı veya sirkülasyon pompası zayıflığı", a: "Sistemin hidrolik dengesi bozulmuş. Balans vanalarının ayarlanması ve pompa çıkış basıncının kontrol edilmesi gerekir." },
    { s: "soğuk hava deposu derecesi yükseliyor", r: "soğutma çevrimi tıkanıklığı veya fan motoru yanması", a: "Gaz çevriminde drayer tıkanmış veya dış ünite fanı durmuş olabilir. Acil müdahale ile gaz basıncı ve fan mekaniği gözden geçirilmelidir." }
  ]
};
