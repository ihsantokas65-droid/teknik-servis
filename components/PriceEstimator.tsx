"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { Calculator, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

import { getBrands } from "@/lib/brands";
import { serviceKindFromSlug } from "@/lib/services";

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

export function PriceEstimator() {
  const [device, setDevice] = useState<string>("kombi");
  const currentDeviceType = deviceTypes.find(d => d.id === device) || deviceTypes[0];
  const kind = currentDeviceType.kind as ServiceKind;
  
  const availableBrands = getBrands().filter(b => b.supportedServices.includes(kind)).map(b => b.name);
  
  const [brand, setBrand] = useState<string>("Arçelik");
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
    <div className="card" style={{ width: "100%", padding: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand-soft)", color: "var(--brand-900)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Calculator size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--brand-900)" }}>Tahmini Fiyat Hesaplayıcı</h2>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Cihazınızdaki sorunu seçin, güncel onarım maliyet aralığını görün.</div>
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: 16
      }}>
        <div className="field">
          <label className="label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "block", color: "var(--brand-900)" }}>Cihaz Türü</label>
          <select className="select" value={device} onChange={handleDeviceChange} style={{ height: 56 }}>
            {deviceTypes.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "block", color: "var(--brand-900)" }}>Marka Seçimi</label>
          <select className="select" value={brand} onChange={(e) => { setBrand(e.target.value); setIsCalculated(false); }} style={{ height: 56 }}>
            {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <div className="field">
          <label className="label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "block", color: "var(--brand-900)" }}>Arıza Belirtisi</label>
          <select className="select" value={symptomIndex} onChange={(e) => { setSymptomIndex(Number(e.target.value)); setIsCalculated(false); }} style={{ height: 56 }}>
            {activeSymptoms.map((s, idx) => (
              <option key={idx} value={idx}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!isCalculated ? (
        <button 
          onClick={calculate} 
          className="btn focus-ring" 
          style={{ width: "100%", marginTop: 24, height: 56, display: "flex", justifyContent: "center", fontSize: 17, borderRadius: 12 }}
        >
          Hesapla ve Fiyat Al
        </button>
      ) : (
        <div style={{ marginTop: 24, padding: 24, background: "#f8fafc", borderRadius: 16, border: "1px dashed var(--brand)", animation: "reveal 0.4s ease" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--brand-700)", textTransform: "uppercase", letterSpacing: 1.2 }}>Tahmini Onarım Aralığı</div>
            <div style={{ fontSize: 38, fontWeight: 950, color: "var(--brand-900)", marginTop: 4 }}>
              {selectedSymptom.min} ₺ - {selectedSymptom.max} ₺
            </div>
            <div style={{ fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--brand-900)", fontWeight: 600, marginTop: 12 }}>
              <AlertCircle size={18} className="muted" /> <span>{selectedSymptom.note}</span>
            </div>
          </div>
          
          <div style={{ fontSize: 12, opacity: 0.7, textAlign: "center", marginTop: 20, marginBottom: 20, fontStyle: "italic" }}>
            * Bu fiyatlar parça kalitesi ve operasyonel maliyetlere göre değişebilir. Net fiyat yerinde arıza tespiti sonrası belli olur.
          </div>

          <Link href={getWaUrl()} className="btn focus-ring" style={{ width: "100%", height: 56, justifyContent: "center", background: "#25D366", color: "white", boxShadow: "0 4px 0 #1DA851", borderRadius: 12 }} target="_blank">
            Hemen WhatsApp&apos;tan Randevu Al
          </Link>
        </div>
      )}
    </div>
  );
}
