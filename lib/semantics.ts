import type { ServiceKind } from "@/lib/services";

export const semanticKeywordsByService: Record<ServiceKind, string[]> = {
  kombi: [
    "kombi kart tamiri",
    "petek temizliği",
    "gaz kaçağı tespiti",
    "kombi bakımı",
    "kombide basınç düşmesi",
    "ateşleme arızası",
    "sıcak su dalgalanması",
    "orijinal / muadil yedek parça",
    "yerinde servis",
    "kombi bakım fiyatları"
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
      issueFocus: ["iyonizasyon ve baca cekis dengesi", "yogusma hatti ve sifon kaynakli tekrarlar", "sicak su dalgalanmasi ve alev kararsizligi"],
      maintenanceFocus: ["iyonizasyon elektrodu ve yanma odasi kontrolu", "yogusma gideri temizligi", "baca cekis ve gaz ayari dogrulamasi"],
      proofPoints: ["Buderus kombilerde yanma kararliligini saha testinde ayrica olcuyoruz.", "Reset sonrasi gecici duzelmeyi yeterli gormeyip kok nedeni ayiklamaya odaklaniyoruz."]
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
export const technicalInsightsMap: Record<string, string> = {
  // Kombi
  "kombi-bakimi": "Yıllık bakımda yanma odası temizliği, iyonizasyon ayarı ve genleşme tankı basıncı kritik öneme sahiptir.",
  "basinc-dusuyor": "Kombi basıncının düşmesi genellikle tesisattaki bir sızıntıdan, genleşme tankındaki hava eksikliğinden veya doldurma musluğunun arızalanmasından kaynaklanır.",
  "petekler-isinmiyor": "Peteklerin ısınmaması durumunda devirdaim pompası, çamurlaşmış tesisat suyu veya tıkanmış petek vanaları ilk kontrol edilmesi gereken noktalardır.",
  "sic-su-dalgalaniyor": "Sıcak suyun bir ısınıp bir soğuması genellikle plakalı eşanjör kireçlenmesi veya NTC sensör hassasiyet kaybı ile ilgilidir.",
  "atesleme-yapmiyor": "Ateşleme arızası; gaz valfi sorunları, iyonizasyon elektrodu kirliliği veya anakart üzerindeki ateşleme rölesi kaynaklı olabilir.",
  "hata-kodu-veriyor": "Hata kodları, elektronik kartın sensörlerden aldığı veriler doğrultusunda sistemi korumaya almasıdır; her kod farklı bir parçayı işaret eder.",
  "f1-ariza-kodu-cozumu": "F1 arıza kodu, kombide aşırı ısınma meydana geldiğini ve limit termostatın emniyet amacıyla sistemi kilitlediğini belirtir.",
  "su-sizdiriyor": "Kombi altından su sızması, emniyet ventilinin açması, genleşme tankı membranı yırtılması veya sirkülasyon pompası contalarından kaynaklanabilir.",
  "basinc-yukseliyor": "Kombi kapalıyken basınç yükseliyorsa doldurma musluğu sızdırıyor veya ana eşanjörde içten delinme (karışma) meydana gelmiş olabilir.",
  "merkezi-sistem-arizasi": "Merkezi sistemlerde ısıtma kaybı genellikle sirkülasyon pompalarının verim düşüşü veya otomasyon panelindeki sensör hatalarından kaynaklanır.",

  // Klima
  "klima-bakimi": "Klima bakımı sadece filtre temizliği değildir; ilaçlı iç ünite dezenfeksiyonu ve dış ünite kondanser temizliği performans için şarttır.",
  "sogutmuyor": "Klimanın soğutmaması genellikle gaz eksikliği, kompresör kalkış arızası (kapasitör) veya iç ünite içindeki fan motorunun kirlenmesinden kaynaklanır.",
  "su-akitiyor": "Klima su akıtması, drenaj hortumunun tıkanması, iç ünite tavasının tozlanması veya sistemdeki gazın eksilerek buzlanma yapması sonucunda oluşur.",
  "gaz-bitti-mi": "Klima gazı normal şartlarda bitmez; eğer soğutma azaldıysa sistemde bir sızıntı (kaçak) olduğu ve basıncın düştüğü söylenebilir.",
  "vrf-klima-hatasi": "VRF sistemlerinde iletişim hataları kablolama korozyonu veya dış ünite anakartındaki voltaj dalgalanmaları nedeniyle oluşabilir.",

  // Beyaz Eşya
  "beyaz-esya-bakim": "Beyaz eşyalarda kireç ve yağ birikimi motoru yorar; düzenli temizleyici kullanımı ömrü %30 artırır.",
  "camasir-su-almiyor": "Çamaşır makinesi su almıyorsa giriş valfi (ventili), kapı kilidi veya su giriş hortumundaki filtreler kontrol edilmelidir.",
  "camasir-su-bosaltmiyor": "Su boşaltma sorunu genellikle pompa motorunun içine kaçan yabancı cisimler (tel, bozuk para) veya pompa motoru bob arızasıdır.",
  "buzdolabi-sogutmuyor": "Buzdolabı soğutmuyorsa drayer tıkanıklığı, motor (kompresör) basınç kaybı veya No-Frost sistemdeki rezistansların bozulmuş olması muhtemeldir.",
  "endustriyel-sogutma-kaybi": "Endüstriyel soğutma gruplarında performans kaybı genelde kompresör yağı kalitesi veya evaporatör üzerindeki aşırı kirlilik ile ilgilidir."
};

export const brandExpertNotes: Record<string, Partial<Record<ServiceKind, string>>> = {
  bosch: {
    kombi: "Bosch kombilerin yüksek verimli eşanjör yapısı ve hassas sensör teknolojisi, düzenli bakım ile uzun ömürlü kullanım sunar.",
    klima: "Bosch klima sistemlerinde inverter sürücü kartı ve kompresör uyumu, enerji tasarrufu için hassas gaz şarjı gerektirir.",
    "beyaz-esya": "Bosch beyaz eşya grubunda program akışı ve sensör kalibrasyonu, cihazın verimli çalışması için kritik öneme sahiptir."
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
    "beyaz-esya": "Arçelik sistemleri, yaygın kullanım nedeniyle pompa ömrü ve amortisör dengesi konularında uzman desteği gerektirir.",
    kombi: "Arçelik kombilerde elektronik kart ve sensör haberleşmesi, voltaj dalgalanmalarına karşı periyodik kontrol edilmelidir.",
    klima: "Arçelik klima grubunda dış ünite fan motoru ve gaz basınç dengesi, yaz aylarında yüksek performans için kritiktir."
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

