export type CityMetadata = {
  climateNote: string;
  technicalTip: string;
};

export const cityMetadata: Record<string, CityMetadata> = {
  "istanbul": {
    climateNote: "İstanbul'un yoğun nemli havası ve deniz tuzu etkisi, dış ünitelerde korozyon riskini artırır.",
    technicalTip: "Nemli bölgelerde klima bakımlarının 6 ayda bir yapılması, ana kart arızalarını %40 oranında azaltır."
  },
  "ankara": {
    climateNote: "Ankara'nın sert kış soğukları ve düşük nem oranı, kombi ve tesisat sistemlerinde donma riskine yol açar.",
    technicalTip: "Kombi genleşme tankı basıncının her kış öncesi Ankara şartlarına göre ayarlanması yakıt tasarrufu sağlar."
  },
  "izmir": {
    climateNote: "Ege'nin sıcak yaz ayları ve kireçli şebeke suyu, beyaz eşyaların iç aksamlarında kireçlenmeyi hızlandırır.",
    technicalTip: "Çamaşır ve bulaşık makinelerinde kireç önleyici sistemlerin düzenli kontrolü motor ömrünü uzatır."
  },
  "antalya": {
    climateNote: "Antalya'nın ekstrem sıcaklıkları, soğutma sistemlerinin (buzdolabı ve klima) kompresörlerini zorlar.",
    technicalTip: "Buzdolabı dış ünite temizliği, Antalya yazında cihazın hararet yapıp motor yakmasını engeller."
  },
  "van": {
    climateNote: "Van'ın çok düşük hava sıcaklıkları ve yüksek rakımı, ısıtma cihazlarında verimlilik kayıplarına neden olabilir.",
    technicalTip: "Kış ayları başlamadan önce yapılacak detaylı petek temizliği, donma riskini ve fatura maliyetini düşürür."
  },
  "erzurum": {
    climateNote: "Erzurum'un dondurucu soğukları, su tesisatlarının ve dış cephe kombi kurulumlarının en büyük düşmanıdır.",
    technicalTip: "Tesisat izolasyonunun Erzurum kışına uygunluğu her yıl kontrol edilmelidir."
  },
  "sanliurfa": {
    climateNote: "Şanlıurfa'nın aşırı sıcak ve tozlu havası, klimaların filtrelerinin ve fanlarının çok çabuk tıkanmasına sebep olur.",
    technicalTip: "Tozlu bölgelerde filtre temizliği aylık olarak yapılmazsa cihazın üfleme performansı yarıya düşer."
  }
};

export const getCityContext = (slug: string): CityMetadata => {
  const defaultMeta: CityMetadata = {
    climateNote: "Bölgesel iklim şartları cihazlar üzerinde farklı etkilere sahiptir.",
    technicalTip: "Periyodik bakım, cihazınızın ömrünü uzatır ve enerji tasarrufu sağlar."
  };
  
  return cityMetadata[slug] || defaultMeta;
};
