export type ErrorCode = {
  slug: string;
  brandSlug: string;
  brandName: string;
  code: string;
  title: string;
  description: string;
  reasons: string[];
  solution: string;
  isFatal: boolean; // if true, user must not fix it themselves
};

export const errorCodes: ErrorCode[] = [
  {
    slug: "demirdokum-f4-hatasi",
    brandSlug: "demirdokum",
    brandName: "DemirDöküm",
    code: "F4",
    title: "DemirDöküm F4 Ateşleme Hatası",
    description: "Kombinizin brülöründe ateşleme gerçekleşmediğini veya alev oluşumu sağlanamadığını belirten kritik bir hata kodudur. Cihaz kendini kilitler.",
    reasons: ["Gaz vanası kapalı olabilir.", "Gaz valfi arızalanmış olabilir.", "Ateşleme ve iyonizasyon elektrotlarında oksitlenme olabilir.", "Anakart alevi algılamıyor olabilir."],
    solution: "Evdeki gaz vanalarını (özellikle ocak) kontrol edin ve kombiye gaz geldiğinden emin olun. Kombiyi resetleyin (R tuşu). Eğer sorun 3 reset işleminden sonra düzelmiyorsa anakart veya valf değişimi gerekebileceği için uzmana başvurun.",
    isFatal: true
  },
  {
    slug: "bosch-ea-hatasi",
    brandSlug: "bosch",
    brandName: "Bosch",
    code: "EA",
    title: "Bosch EA Alev Algılanamadı Hatası",
    description: "Bosch kombilerde sık karşılaşılan EA arızası, sistemde alevin oluşmadığı veya oluşan alevin iyonizasyon elektrotu tarafından algılanmadığı durumlarda ortaya çıkar.",
    reasons: ["İyonizasyon çubuğunun kirlenmesi veya kırılması.", "Gaz armatürü (valfi) bobinlerinin yanması.", "Düşük gaz basıncı veya anakart arızası."],
    solution: "Cihazın şalterini kapatıp açın. Reset tuşuna 5 saniye basılı tutun. Eğer düzelme yoksa baca çekişini veya iyonizasyon ayarlarını yapması için profesyonel servis çağırın. Kombi panelini sökmeyin.",
    isFatal: true
  },
  {
    slug: "vaillant-f28-hatasi",
    brandSlug: "vaillant",
    brandName: "Vaillant",
    code: "F28",
    title: "Vaillant F28 Cihaz Çalışmıyor Hatası",
    description: "Ateşleme işlemi sırasında başarısızlık olduğunu bildiren genel arıza kodudur. Vaillant kombilerde voltaj dalgalanmalarından sonra en çok karşılaşılan hatadır.",
    reasons: ["Şebeke voltajının 190V altına düşmesi.", "Gaz grubu arızası.", "Topraklama sorunu nedeniyle anakartın alevi hissetmemesi."],
    solution: "Dairenize gaz geldiğini ocaktan teyit edin. Eğer elektrik kesintisi veya dalgalanma yaşadıysanız regülatör taktırmanız gerekebilir. Emniyet açısından RESET yaptıktan sonra düzelmiyorsa müdahale etmeyin.",
    isFatal: true
  },
  {
    slug: "arcelik-e18-hatasi",
    brandSlug: "arcelik",
    brandName: "Arçelik",
    code: "E18",
    title: "Arçelik Çamaşır Makinesi E18 Su Boşaltma Hatası",
    description: "Makinenin içerisindeki pis suyu belirlenen süre içerisinde tahliye edememesi sonucunda ekranda beliren uyarı kodudur.",
    reasons: ["Pompa motoru filtresine yabancı cisim (bozuk para, toka) kaçması.", "Pis su tahliye hortumunun katlanması veya tıkanması.", "Pompa motorunun yanması."],
    solution: "Makinenin sağ alt köşesinde bulunan pompa kapağını (altına bir kap koyarak) yavaşça açın ve içindeki yabancı maddeleri temizleyin. Hortumun gider bağlantısını kontrol edin. Hala boşaltmıyorsa pompa motorunun değişmesi gerekir.",
    isFatal: false
  },
  {
    slug: "baymak-e01-hatasi",
    brandSlug: "baymak",
    brandName: "Baymak",
    code: "E01",
    title: "Baymak E01 Başarısız Ateşleme",
    description: "Alev oluşumunun gerçekleşmediğini gösteren koddur. Cihaz bloke durumundadır.",
    reasons: ["Gaz yokluğu.", "Ateşleme elektrodu temassızlığı.", "Elektronik kart arızası."],
    solution: "Gaz vanasını kontrol edin ve cihazın düğmesini R (Reset) konumuna getirerek 3 saniye bekleyin. Düzelmezse ana kart veya valf arızası için servis talep edin.",
    isFatal: true
  }
];

export function getAllErrorCodes() {
  return errorCodes;
}

export function getErrorCode(slug: string) {
  return errorCodes.find((e) => e.slug === slug);
}
