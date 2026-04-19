"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { Calculator, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

import { getBrands } from "@/lib/brands";
import { serviceKindFromSlug, type ServiceKind } from "@/lib/services";

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

const deviceTypes = [
  { id: "kombi", label: "Kombi", kind: "kombi" },
  { id: "klima", label: "Klima", kind: "klima" },
  { id: "buzdolabi", label: "Buzdolabı", kind: "beyaz-esya" },
  { id: "camasir_makinesi", label: "Çamaşır Makinesi", kind: "beyaz-esya" },
  { id: "bulasik_makinesi", label: "Bulaşık Makinesi", kind: "beyaz-esya" },
  { id: "televizyon", label: "Televizyon", kind: "beyaz-esya" },
  { id: "firin_ocak", label: "Fırın & Ocak", kind: "beyaz-esya" },
  { id: "kurutma_makinesi", label: "Kurutma Makinesi", kind: "beyaz-esya" }
];

type Symptom = { label: string; min: number; max: number; note: string };

const symptomsMap: Record<string, Symptom[]> = {
  kombi: [
    { label: "Ateşleme Yapmıyor / F1, E01 Hatası", min: 450, max: 2200, note: "Anakart, gaz valfi veya ateşleme elektrotu arızası olabilir." },
    { label: "Su Akıtıyor / Basınç Sürekli Düşüyor", min: 400, max: 1100, note: "Eşanjör leakage, emniyet ventili veya genleşme tankı kaynaklı olabilir." },
    { label: "Sıcak Su Vermiyor / Dalgalanma Var", min: 450, max: 1500, note: "NTC sensörü, türbin veya üç yollu vana arızası muhtemeldir." },
    { label: "Petekler Isınmıyor / Sesli Çalışıyor", min: 500, max: 1800, note: "Devirdaim pompası tıkanıklığı veya tortu birikmesi olabilir." },
    { label: "Yıllık Periyodik Bakım", min: 450, max: 700, note: "Yanma odası, fan ve filtre temizliği dahil standart bakım ücretidir." }
  ],
  klima: [
    { label: "Soğutmuyor / Isıtmıyor (Gaz Kaçağı)", min: 550, max: 2500, note: "Gaz ölçümü ve dolumu gerekir. R410/R32 gaz tipine göre fiyat değişir." },
    { label: "İç Ünite Su Akıtıyor / Buzlanma", min: 450, max: 950, note: "Drenaj tıkanıklığı veya evaporatör kirliliği kaynaklı olabilir." },
    { label: "Dış Ünite Çok Sesli Çalışıyor / Sarsıntı", min: 600, max: 2200, note: "Kompresör ayakları, fan motoru veya kapasitör arızası olabilir." },
    { label: "Antibakteriyel İlaçlı Bakım", min: 500, max: 800, note: "Filtreler ve evaporatör özel kimyasallar ile dezenfekte edilir." }
  ],
  buzdolabi: [
    { label: "Soğutmuyor / Alt Bölme Sıcak", min: 650, max: 3500, note: "Gaz kaçağı, rezistans arızası veya kompresör değişimi gerekebilir." },
    { label: "Sesli Çalışıyor / Fan Sesi", min: 450, max: 1200, note: "İç fan motoru karlanması veya kondanser fanı arızası olabilir." },
    { label: "Buzlanma / Kar Yapıyor (No-Frost)", min: 550, max: 1400, note: "Defrost sistemi (rezistans, bi-metal termostat) arızası muhtemel." },
    { label: "Kapı Kapanmıyor / Lastik Eskimesi", min: 350, max: 900, note: "Mıknatıslı fitil değişimi veya menteşe ayarı gerekir." }
  ],
  camasir_makinesi: [
    { label: "Su Almıyor / Program Başlamıyor", min: 450, max: 1100, note: "Su giriş ventili, kapı kilidi veya anakart komut arızası." },
    { label: "Sıkmada Aşırı Ses (Kazan Düşmesi)", min: 750, max: 2800, note: "Rulman grubu, amortisör veya kazan mili değişimi gerekir." },
    { label: "Su Boşaltmıyor / Pompa Hatası", min: 400, max: 950, note: "Pompa motoru tıkanıklığı veya yanması kaynaklı bir durum." },
    { label: "Kazan Dönmüyor / Kayış Atması", min: 450, max: 1500, note: "Motor kömürü bitmesi, kayış kopması veya motor arızası." }
  ],
  bulasik_makinesi: [
    { label: "Kirli Bırakıyor / Yıkamıyor", min: 450, max: 1300, note: "Fıskiye tıkanıklığı, ısıtıcı (rezistans) veya deterjan kutusu arızası." },
    { label: "E15 / E01 / Su Sızdırma Uyarısı", min: 500, max: 1500, note: "Alt hazneye su sızması sonucu emniyet şamandırası devreye girmiş." },
    { label: "Su Boşaltmıyor / Pompa Sesi", min: 400, max: 900, note: "Gider hortumu tıkanıklığı veya tahliye pompası arızası." },
    { label: "Tableti Almiyor / Erimiyor", min: 350, max: 800, note: "Deterjan kapağı mekanizması veya su dağıtım valfi kontrol edilmeli." }
  ],
  televizyon: [
    { label: "Ses Var Görüntü Yok (LED Bar)", min: 850, max: 4500, note: "Panel arkasındaki LED barların ömrü bitmiş. Komple değişim önerilir." },
    { label: "Ekranda Yatay/Dikey Çizgiler", min: 600, max: 5000, note: "T-Con kartı veya panel flex kablo arızası. En hassas onarımdır." },
    { label: "Açılmıyor / Kırmızı Işık Yanıp Sönüyor", min: 550, max: 2200, note: "Besleme kartı (Power board) veya anakart voltaj arızası." },
    { label: "Ekran Kırıldı / Çatlak Var", min: 3000, max: 15000, note: "Panel değişimi maliyetli bir işlemdir. Lütfen model bilgisi vererek fiyat alın." }
  ],
  firin_ocak: [
    { label: "Fırın Isıtmıyor / Alt-Üst Pişirmiyor", min: 450, max: 1200, note: "Rezistans patlaması veya seçici komütatör düğme arızası." },
    { label: "Ocak Çakmağı Çakmıyor / Gaz Gelmiyor", min: 350, max: 850, note: "Buji temizliği, trafo arızası veya emniyet ventili sorunu." },
    { label: "Sigorta Attırıyor / Kaçak Var", min: 500, max: 1300, note: "İç kablolarda kısa devre veya rezistans şasesi olabilir." }
  ],
  kurutma_makinesi: [
    { label: "Kurutmuyor / Nemli Bırakıyor", min: 650, max: 2200, note: "Kondanser kirliliği, ısı pompası (Heat pump) veya sensör arızası." },
    { label: "Filtre / Su Haznesi Uyarısı", min: 450, max: 1100, note: "Sensör tıkanıklığı veya pompa tahliye sistemi kontrol edilmeli." },
    { label: "Çok Sesli Çalışıyor / Titreşim", min: 600, max: 1800, note: "Tambur tekerlekleri veya motor rulman arızası olabilir." }
  ]
};

export function PriceEstimator({ initialBrand }: { initialBrand?: string }) {
  const allBrands = getBrands();
  const brandData = initialBrand ? allBrands.find(b => b.name === initialBrand) : null;
  
  // If initialBrand is provided, find the first device type it supports
  const initialDevice = brandData && brandData.supportedServices.length > 0 
    ? (deviceTypes.find(d => d.kind === brandData.supportedServices[0])?.id || "kombi")
    : "kombi";

  const [device, setDevice] = useState<string>(initialDevice);
  const currentDeviceType = deviceTypes.find(d => d.id === device) || deviceTypes[0];
  const kind = currentDeviceType.kind as ServiceKind;
  
  const availableBrands = getBrands().filter(b => b.supportedServices.includes(kind)).map(b => b.name);
  
  const [brand, setBrand] = useState<string>(initialBrand && availableBrands.includes(initialBrand) ? initialBrand : (availableBrands.includes("Arçelik") ? "Arçelik" : (availableBrands[0] || "Diğer")));
  const [symptomIndex, setSymptomIndex] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState(false);

  const activeSymptoms = symptomsMap[device] || [];
  const selectedSymptom = activeSymptoms[symptomIndex] || activeSymptoms[0];

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newType = deviceTypes.find(d => d.id === val) || deviceTypes[0];
    const newKind = newType.kind as ServiceKind;
    const newBrands = getBrands().filter(b => b.supportedServices.includes(newKind)).map(b => b.name);
    
    setDevice(val);
    setBrand(newBrands.includes("Arçelik") ? "Arçelik" : (newBrands[0] || "Diğer"));
    setSymptomIndex(0);
    setIsCalculated(false);
  };

  const calculate = () => {
    setIsCalculated(true);
  };

  const getWaUrl = () => {
    const wa = digitsOnly(site.whatsapp);
    const dLabel = currentDeviceType.label;
    const msg = `Merhaba, ${brand} ${dLabel} cihazım için tahmini servis tutarı sorguladım. (Sorun: ${selectedSymptom.label}). Detaylı bilgi ve randevu alabilir miyim?`;
    return `https://wa.me/${wa.replace("+", "")}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="price-estimator-card" style={{ width: "100%", padding: "clamp(20px, 4vw, 32px)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "var(--shadow-sm)" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .result-box {
          margin-top: 32px;
          padding: 32px;
          background: #f8fafc;
          border: 1px solid var(--border);
          border-left: 5px solid var(--brand);
          border-radius: 20px;
          animation: reveal 0.4s ease;
          box-shadow: var(--shadow-sm);
        }
        .price-range-title {
          font-size: 13px;
          font-weight: 800;
          color: var(--brand-700);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .price-value {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 950;
          color: var(--brand-900);
          letter-spacing: -1.5px;
        }
        @media (max-width: 768px) {
          .result-box { padding: 24px 20px; text-align: center; }
          .price-estimator-card { border-radius: 16px; }
        }
      `}} />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand-soft)", color: "var(--brand-900)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Calculator size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 900, color: "var(--brand-900)", letterSpacing: "-0.5px" }}>Tahmini Fiyat Hesaplayıcı</h2>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Cihaz ve arıza seçin, güncel maliyeti öğrenin.</div>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <div className="field">
          <label className="label">Cihaz Türü</label>
          <select className="select" value={device} onChange={handleDeviceChange}>
            {deviceTypes.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="label">Marka Seçimi</label>
          <select className="select" value={brand} onChange={(e) => { setBrand(e.target.value); setIsCalculated(false); }}>
            {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <div className="field">
          <label className="label">Arıza Belirtisi</label>
          <select className="select" value={symptomIndex} onChange={(e) => { setSymptomIndex(Number(e.target.value)); setIsCalculated(false); }}>
            {activeSymptoms.map((s, idx) => (
              <option key={idx} value={idx}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!isCalculated ? (
        <button 
          onClick={calculate} 
          className="btn shadow-lg" 
          style={{ width: "100%", marginTop: 32, height: 60, display: "flex", justifyContent: "center", fontSize: 17, borderRadius: 12 }}
        >
          Hesapla ve Fiyat Al
        </button>
      ) : (
        <div className="result-box">
          <div style={{ textAlign: "center" }}>
            <div className="price-range-title">Tahmini Onarım Aralığı</div>
            <div className="price-value">
              {selectedSymptom.min} ₺ - {selectedSymptom.max} ₺
            </div>
            
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: 10, 
              background: "white", 
              padding: "12px 20px", 
              borderRadius: 12, 
              border: "1px solid var(--border)",
              marginTop: 20,
              color: "var(--brand-900)",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "var(--shadow-sm)"
            }}>
              <AlertCircle size={18} style={{ color: "var(--brand)" }} />
              <span>{selectedSymptom.note}</span>
            </div>
          </div>
          
          <p style={{ fontSize: 12, opacity: 0.6, textAlign: "center", marginTop: 24, marginBottom: 24, lineHeight: 1.5 }}>
            * Bu fiyatlar tahmidir. Net tutar teknisyenimizin yerinde yaptığı arıza tespiti sonrası modele ve parça gereksinimine göre kesinleşir.
          </p>

          <Link href={getWaUrl()} className="btn" style={{ width: "100%", height: 60, justifyContent: "center", background: "#25D366", color: "white", boxShadow: "0 4px 0 #1DA851", border: "none", borderRadius: 12, fontSize: 16 }} target="_blank">
            Hemen WhatsApp&apos;tan Fiyat Onayı Al
          </Link>
        </div>
      )}
    </div>
  );
}
