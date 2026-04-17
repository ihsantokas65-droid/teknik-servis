import type { ServiceKind } from "@/lib/services";

export interface FaultGuide {
  code: string;
  meaning: string;
  solution: string;
}

export const brandFaultGuides: Record<string, Partial<Record<ServiceKind, FaultGuide[]>>> = {
  bosch: {
    kombi: [
      { code: "E01", meaning: "Ateşleme Arızası", solution: "Gaz vanasının açık olduğundan emin olun. Gaz geliyorsa cihazı üç kez resetleyin." },
      { code: "E02", meaning: "Aşırı Isınma Sorunu", solution: "Petek vanalarının açık olduğunu kontrol edin. Cihaz soğuyunca resetleyin." },
      { code: "EA", meaning: "Alev Algılanmadı", solution: "Elektrot veya anakart arızası olabilir. Şebeke voltajını kontrol ettirin." },
      { code: "F7", meaning: "Fan veya Baca Sorunu", solution: "Bacada tıkanma veya fan motorunda kirlenme olabilir. Teknik destek gerekir." }
    ],
    "beyaz-esya": [
      { code: "E01", meaning: "Su Sızıntısı (AquaStop)", solution: "Cihazın altında su birikmiş olabilir. Alt paneli kontrol edin." },
      { code: "E18", meaning: "Pompa Tıkanıklığı", solution: "Filtreyi temizleyin ve tahliye hortumunun bükülmediğinden emin olun." }
    ]
  },
  vaillant: {
    kombi: [
      { code: "F28", meaning: "Ateşleme Başarısızlığı", solution: "Gaz valfini kontrol edin. Tesisatta hava olabilir." },
      { code: "F22", meaning: "Düşük Su Basıncı", solution: "Cihazın altındaki doldurma musluğu ile basıncı 1.5 bar'a getirin." },
      { code: "F20", meaning: "Emniyet Termostatı Kapalı", solution: "Cihaz aşırı ısınmıştır. Su sirkülasyonunu engelleyen vanaları kontrol edin." }
    ]
  },
  buderus: {
    kombi: [
      { code: "3C", meaning: "Fan Çalışmıyor", solution: "Fan motoru veya anakart bağlantılarını kontrol ettirin." },
      { code: "4C", meaning: "Aşırı Isınma", solution: "Sistemde hava olabilir veya pompa kilitlenmiş olabilir." },
      { code: "CL", meaning: "Sıcak Su Sensör Hatası", solution: "NTC sensörü arızalı olabilir, değişim gerekebilir." }
    ]
  },
  demirdokum: {
    kombi: [
      { code: "F1", meaning: "Aşırı Isınma Arızası", solution: "Limit termostat atmış olabilir. Cihaz soğuyunca resetleyin." },
      { code: "F4", meaning: "İyonizasyon Hatası", solution: "Gaz gelmiyor veya alev algılanmıyor olabilir. Gazı kontrol edin." },
      { code: "F10", meaning: "Tesisat Basıncı Hatası", solution: "Su basıncını kontrol edin, 1 barın altındaysa su ekleyin." }
    ]
  },
  arcelik: {
    "beyaz-esya": [
      { code: "E01", meaning: "Termistör Hatası", solution: "Sıcaklık sensörü arızalı olabilir. Programı iptal edip baştan başlatın." },
      { code: "E08", meaning: "Motor Arızası", solution: "Yükü azaltıp tekrar deneyin. Sorun devam ederse teknik ekip çağırın." }
    ]
  },
  beko: {
    "beyaz-esya": [
      { code: "E1", meaning: "Su Tahliye Hatası", solution: "Tahliye pompasını ve filtresini kontrol edin. Hortum tıkalı olabilir." },
      { code: "E3", meaning: "Isıtma Sorunu", solution: "Rezistans veya sensör arızalı olabilir. Teknik müdahale şarttır." }
    ]
  },
  samsung: {
    "beyaz-esya": [
      { code: "4E / 4C", meaning: "Su Besleme Hatası", solution: "Su musluğunun açık olduğunu ve hortumun tıkalı olmadığını kontrol edin." },
      { code: "5E / 5C", meaning: "Su Tahliye Sorunu", solution: "Filtreyi temizleyin. Tahliye motoruna yabancı cisim kaçmış olabilir." }
    ],
    klima: [
      { code: "E101", meaning: "Haberleşme Hatası", solution: "İç ve dış ünite arasındaki kablo bağlantılarını kontrol ettirin." }
    ]
  }
};

export const defaultFaultGuides: Record<ServiceKind, FaultGuide[]> = {
  kombi: [
    { code: "E1", meaning: "Başlatma Hatası", solution: "Cihazı kapatıp açın. Su basıncının 1.5 bar olduğunu doğrulayın." },
    { code: "E2", meaning: "Isınma Problemi", solution: "Peteklerdeki havayı alın ve vanaların açık olduğundan emin olun." }
  ],
  klima: [
    { code: "CH01", meaning: "İç Ünite Sensör Hatası", solution: "Filtreleri temizleyin. Sorun devam ederse teknik destek alın." },
    { code: "CH05", meaning: "İletişim Sorunu", solution: "Cihazı şalterden kapatıp 5 dakika bekledikten sonra tekrar açın." }
  ],
  "beyaz-esya": [
    { code: "E1", meaning: "Düşük Giriş Voltajı", solution: "Elektrik voltajını kontrol edin. Cihaz kendini korumaya almış olabilir." },
    { code: "E5", meaning: "Program Hatası", solution: "Programı resetlemek için başlat tuşuna 3 saniye basılı tutun." }
  ],
  endustriyel: [
    { code: "ERR-01", meaning: "Sistem Basınç Hatası", solution: "Ana vanaları ve basınç göstergelerini kontrol edin." },
    { code: "ERR-09", meaning: "Faz Hatası", solution: "Elektrik panosundaki faz sıralamasını bir elektrikçiye kontrol ettirin." }
  ]
};
