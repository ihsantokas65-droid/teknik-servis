"use client";

import { useState, useMemo } from "react";
import { site } from "@/lib/site";
import { Calculator, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getBrands, type Brand } from "@/lib/brands";

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

const deviceTypes = [
  { id: "kombi", label: "Kombi" },
  { id: "klima", label: "Klima" },
  { id: "beyaz-esya", label: "Beyaz Eşya" }
];

const brandsMap: Record<string, string[]> = {
  kombi: ["Arçelik", "Beko", "Bosch", "DemirDöküm", "Vaillant", "ECA", "Baymak", "Buderus", "Viessmann", "Protherm", "Alarko", "Immergas", "Ferroli", "Warmhaus", "Diğer"],
  klima: ["Arçelik", "Beko", "Vestel", "Samsung", "LG", "Daikin", "Mitsubishi", "Bosch", "Midea", "Gree", "Airfel", "Sigma", "Fujitsu", "Panasonic", "Diğer"],
  "beyaz-esya": ["Arçelik", "Beko", "Bosch", "Siemens", "Profilo", "Vestel", "Samsung", "LG", "Altus", "Indesit", "Hotpoint", "Regal", "Grundig", "Whirlpool", "Diğer"]
};

type Symptom = { label: string; min: number; max: number; note: string };

const symptomsMap: Record<string, Symptom[]> = {
  kombi: [
    { label: "Ateşleme Yapmıyor (E01 / F1 Hata Kodu)", min: 1200, max: 4500, note: "Elektronik kart ateşleme rölesi veya gaz valfi bobini arızalı olabilir." },
    { label: "Su Akıtıyor / Basınç Sürekli Düşüyor", min: 800, max: 2800, note: "Genleşme tankı membranı patlak veya emniyet ventili kireçten açmış olabilir." },
    { label: "Petekler Alt Tarafı Isınmıyor / Çamurlaşma", min: 1400, max: 3200, note: "Sirkülasyon pompası devir kaybı veya petek içi tortu birikimi (Petek temizliği önerilir)." },
    { label: "Sıcak Su Dalgalanıyor (Bir Soğuk Bir Sıcak)", min: 900, max: 2400, note: "Plaka eşanjör kireçlenmesi veya NTC sıcaklık sensörü hassasiyet kaybı." },
    { label: "Fan Motoru Gürültülü Çalışıyor", min: 1100, max: 3500, note: "Baca fan motoru rulman dağılması veya kanatçık kirlenmesi kaynaklı balans bozukluğu." },
    { label: "Üç Yollu Vana Arızası (Peteklere Su Kaçırma)", min: 1500, max: 3800, note: "Musluk suyu açıkken peteklerin de ısınması sorunu; vana motoru veya tamir takımı değişimi." },
    { label: "Doldurma Musluğu Kırıldı / Basınç Yükseliyor", min: 600, max: 1500, note: "Doldurma musluğu sızdırıyor veya ana eşanjörde içten delinme mevcut." },
    { label: "Yıllık Periyodik Bakım (VİP Paket)", min: 650, max: 1200, note: "Genleşme tankı hava ayarı, filtre temizliği ve yanma odası bakımı dahildir." }
  ],
  klima: [
    { label: "Soğutmuyor / Az Soğutuyor (Gaz Eksikliği)", min: 1200, max: 3500, note: "R410A veya R32 çevre dostu gaz dolumu ve kaçak testi (vukumla birlikte)." },
    { label: "İç Ünite Su Akıtıyor (Drenaj Sorunu)", min: 600, max: 1200, note: "Tahliye hortumu tıkanıklığı veya iç ünite tavası toz birikimi." },
    { label: "Dış Ünite Kompresörü Devreye Girmiyor", min: 1800, max: 6500, note: "Kapasitör arızası veya inverter sürücü kartı çıkış hatası olabilir." },
    { label: "Kötü Koku / Bakteri Oluşumu (Detaylı Hijyen)", min: 800, max: 1500, note: "Özel kimyasal ilaçlı yıkama ve antibakteriyel sprey uygulaması." },
    { label: "İç Ünite Kart Arızası / Komut Almıyor", min: 1400, max: 4200, note: "Sinyal alıcı göz veya ana kart üzerindeki trafo/işlemci sorunu." },
    { label: "Klima Montajı / Demontaj (Sök-Tak)", min: 1500, max: 3500, note: "Bakır boru mesafesi ve BTU değerine göre işçilik değişkenlik gösterir." },
    { label: "Kompresör Yanığı (Motor Değişimi)", min: 6500, max: 18500, note: "İstisnai durumlarda motor değişimi yerine cihaz yenileme önerilebilir." }
  ],
  "beyaz-esya": [
    { label: "Çamaşır Makinesi Su Boşaltmıyor", min: 750, max: 1800, note: "Tahliye pompası tıkanıklığı veya arızası." },
    { label: "Çamaşır Makinesi Kazan Dönmüyor", min: 1800, max: 5500, note: "Motor kömürü, kayış veya anakart arızası." },
    { label: "Buzdolabı Soğutmuyor (Alt/Üst Sorunu)", min: 1600, max: 4800, note: "Defrost ısıtıcı veya fan motoru kilitlenmesi." },
    { label: "Buzdolabı Motoru Kalkmıyor (Tık Sesi)", min: 5500, max: 14500, note: "Kompresör yanığı veya röle-termik arızası." },
    { label: "Bulaşık Makinesi İyi Yıkamıyor / Mat", min: 900, max: 2400, note: "Sirkülasyon pompası veya ısıtıcı rezistans sorunu." },
    { label: "Anakart (Kart) Tamiri / Değişimi", min: 1500, max: 4500, note: "Yüksek voltaj kaynaklı kart yanması onarımı." }
  ]
};

export function PriceEstimator() {
  const [device, setDevice] = useState<string>("kombi");
  const [symptomIndex, setSymptomIndex] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState(false);

  const allBrands = useMemo(() => getBrands(), []);
  const availableBrands = useMemo(() => {
    return allBrands
      .filter((b: Brand) => b.supportedServices.includes(device as any))
      .map((b: Brand) => b.name);
  }, [allBrands, device]);

  const [brand, setBrand] = useState<string>(availableBrands[0] || "Diğer");

  const activeSymptoms = symptomsMap[device] || [];
  const selectedSymptom = activeSymptoms[symptomIndex] || activeSymptoms[0];

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDevice(val);
    const newBrands = allBrands
      .filter((b: Brand) => b.supportedServices.includes(val as any))
      .map((b: Brand) => b.name);
    setBrand(newBrands[0] || "Diğer");
    setSymptomIndex(0);
    setIsCalculated(false);
  };

  const calculate = () => {
    setIsCalculated(true);
  };

  const getWaUrl = () => {
    const wa = digitsOnly(site.whatsapp);
    const dLabel = deviceTypes.find((d: { id: string; label: string }) => d.id === device)?.label;
    const msg = `Merhaba, ${brand} ${dLabel} cihazım için tahmini servis tutarı sorguladım. (Sorun: ${selectedSymptom.label}). Detaylı bilgi ve randevu alabilir miyim?`;
    return `https://wa.me/${wa.replace("+", "")}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="card" style={{ padding: 40, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--brand-soft)", color: "var(--brand-900)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Calculator size={32} />
        </div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 950, color: "var(--brand-900)", letterSpacing: "-1px" }}>Tahmini Fiyat Hesaplayıcı</h2>
        <div style={{ fontSize: 15, color: "var(--muted)", marginTop: 8, maxWidth: 400, marginInline: "auto" }}>
          Cihazınıza ait arıza belirtisini seçin, piyasa verilerine göre güncel maliyeti öğrenin.
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: 20,
        marginBottom: 24
      }}>
        <div className="field">
          <label className="label" style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: "block", color: "var(--brand-900)" }}>Hizmet Türü</label>
          <select className="select" value={device} onChange={handleDeviceChange} style={{ height: 60, fontWeight: 600 }}>
            {deviceTypes.map((d: { id: string; label: string }) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="label" style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: "block", color: "var(--brand-900)" }}>Marka Seçimi</label>
          <select className="select" value={brand} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setBrand(e.target.value); setIsCalculated(false); }} style={{ height: 60, fontWeight: 600 }}>
            {availableBrands.map((b: string) => <option key={b} value={b}>{b}</option>)}
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <div className="field">
          <label className="label" style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: "block", color: "var(--brand-900)" }}>Hissedilen Arıza</label>
          <select className="select" value={symptomIndex} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSymptomIndex(Number(e.target.value)); setIsCalculated(false); }} style={{ height: 60, fontWeight: 600 }}>
            {activeSymptoms.map((s: Symptom, idx: number) => (
              <option key={idx} value={idx}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!isCalculated ? (
        <button 
          onClick={calculate} 
          className="btn focus-ring" 
          style={{ width: "100%", height: 60, display: "flex", justifyContent: "center", fontSize: 18, borderRadius: 12 }}
        >
          Hesapla ve Fiyat Al
        </button>
      ) : (
        <div style={{ padding: 32, background: "#f8fafc", borderRadius: 16, border: "2px dashed var(--border)", animation: "reveal 0.3s ease-out" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--brand-700)", textTransform: "uppercase", letterSpacing: 1.5 }}>Tahmini Onarım Aralığı</div>
            <div style={{ fontSize: 44, fontWeight: 950, color: "var(--brand-900)", marginTop: 8 }}>
              {selectedSymptom.min} ₺ - {selectedSymptom.max} ₺
            </div>
            <div style={{ fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--brand-900)", fontWeight: 600, marginTop: 12 }}>
              <AlertCircle size={18} className="muted" /> <span>{selectedSymptom.note}</span>
            </div>
          </div>
          
          <div style={{ fontSize: 12, opacity: 0.6, textAlign: "center", marginTop: 24, marginBottom: 24, fontStyle: "italic" }}>
            * Bu tutarlar parça kalitesi ve operasyonel maliyetlere göre değişebilir. Net fiyat için ücretsiz danışmanlık alabilirsiniz.
          </div>

          <Link href={getWaUrl()} className="btn focus-ring" style={{ width: "100%", height: 56, justifyContent: "center", background: "#25D366", color: "white", boxShadow: "0 4px 0 #1DA851", borderRadius: 12 }} target="_blank">
             Hemen WhatsApp&apos;tan Randevu Al
          </Link>
        </div>
      )}
    </div>
  );
}
