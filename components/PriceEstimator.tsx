"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { Calculator, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

const deviceTypes = [
  { id: "kombi", label: "Kombi" },
  { id: "klima", label: "Klima" },
  { id: "beyaz_esya", label: "Beyaz Eşya" }
];

const brandsMap: Record<string, string[]> = {
  kombi: ["Arçelik", "Beko", "Bosch", "DemirDöküm", "Vaillant", "ECA", "Baymak", "Buderus", "Protherm", "Diğer"],
  klima: ["Arçelik", "Beko", "Vestel", "Samsung", "LG", "Daikin", "Mitsubishi", "Bosch", "Diğer"],
  beyaz_esya: ["Arçelik", "Beko", "Bosch", "Siemens", "Profilo", "Vestel", "Samsung", "Altus", "Diğer"]
};

type Symptom = { label: string; min: number; max: number; note: string };

const symptomsMap: Record<string, Symptom[]> = {
  kombi: [
    { label: "Ateşleme Yapmıyor / Hata Kodu Veriyor", min: 400, max: 1800, note: "Anakart, gaz valfi veya ateşleme elektrotu arızası olabilir." },
    { label: "Su Akıtıyor / Basınç Düşüyor", min: 350, max: 950, note: "Eşanjör sızıntısı, emniyet ventili veya genleşme tankı kaynaklı olabilir." },
    { label: "Petekler Isınmıyor / Sesli Çalışıyor", min: 400, max: 1200, note: "Devirdaim pompası arızası veya sistemde hava/tortu birikmesi olabilir." },
    { label: "Yıllık Periyodik Bakım", min: 400, max: 600, note: "Standart yanma odası, fan ve filtre temizliğini içerir. Sadece bakım ücretidir." }
  ],
  klima: [
    { label: "Soğutmuyor / Isıtmıyor", min: 450, max: 2000, note: "Gaz kaçağı, kapasitör veya anakart arızası olabilir. Şarj edilecek gaz türüne göre fiyat değişir." },
    { label: "İç Ünite Su Akıtıyor", min: 350, max: 700, note: "Drenaj hattı tıkanıklığı, buzlanma veya eğim sorunu olabilir." },
    { label: "Kötü Koku / Cihaz Bakımı", min: 450, max: 700, note: "Kimyasal ilaçlı ve buharlı derinlemesine antibakteriyel bakım uygulanır." }
  ],
  beyaz_esya: [
    { label: "Su Almıyor / Boşaltmıyor", min: 350, max: 950, note: "Pompa motoru tıkanıklığı, su giriş ventili veya anakart komut arızası olabilir." },
    { label: "Buzdolabı Soğutmuyor / Terliyor", min: 600, max: 3500, note: "Gaz kaçağı, rezistans arızası veya kompresör (motor) değişimi gerekebilir." },
    { label: "Aşırı Ses / Titreşim (Kazan Düşmesi)", min: 500, max: 2200, note: "Rulman grubu, amortisör veya kazan bilyelerinin değişmesi gerekebilir." }
  ]
};

export function PriceEstimator() {
  const [device, setDevice] = useState<string>("kombi");
  const [brand, setBrand] = useState<string>(brandsMap["kombi"][0]);
  const [symptomIndex, setSymptomIndex] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState(false);

  const activeSymptoms = symptomsMap[device] || [];
  const selectedSymptom = activeSymptoms[symptomIndex] || activeSymptoms[0];

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDevice(val);
    setBrand(brandsMap[val][0]);
    setSymptomIndex(0);
    setIsCalculated(false);
  };

  const calculate = () => {
    setIsCalculated(true);
  };

  const getWaUrl = () => {
    const wa = digitsOnly(site.whatsapp);
    const dLabel = deviceTypes.find(d => d.id === device)?.label;
    const msg = `Merhaba, ${brand} ${dLabel} cihazım için tahmini servis tutarı sorguladım. (Sorun: ${selectedSymptom.label}). Detaylı bilgi ve randevu alabilir miyim?`;
    return `https://wa.me/${wa.replace("+", "")}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="card" style={{ padding: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand-soft)", color: "var(--brand-900)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Calculator size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--brand-900)" }}>Tahmini Fiyat Hesaplayıcı</h2>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Cihazınıza ait arıza belirtisini seçin, ortalama onarım tutarını görün.</div>
        </div>
      </div>

      <div className="grid" style={{ gap: 16 }}>
        <div className="field" style={{ gridColumn: "span 4" }}>
          <label className="label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Cihaz Türü</label>
          <select className="select" value={device} onChange={handleDeviceChange}>
            {deviceTypes.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "span 4" }}>
          <label className="label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Marka</label>
          <select className="select" value={brand} onChange={(e) => { setBrand(e.target.value); setIsCalculated(false); }}>
            {(brandsMap[device] || []).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "span 4" }}>
          <label className="label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: "block" }}>Arıza Belirtisi</label>
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
          className="btn focus-ring" 
          style={{ width: "100%", marginTop: 24, display: "flex", justifyContent: "center", fontSize: 16 }}
        >
          Tahmini Fiyatı Gör
        </button>
      ) : (
        <div style={{ marginTop: 24, padding: 20, background: "#f8fafc", borderRadius: 12, border: "1px dashed var(--border)", animation: "reveal 0.4s ease" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>Ortalama Onarım Maliyeti</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "var(--brand-900)", marginTop: 4 }}>
              {selectedSymptom.min} ₺ - {selectedSymptom.max} ₺
            </div>
            <div style={{ fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--muted)", marginTop: 8 }}>
              <AlertCircle size={14} /> <span>{selectedSymptom.note}</span>
            </div>
          </div>
          
          <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", marginTop: 16, marginBottom: 16 }}>
            * Bu fiyatlar ortalama piyasa değerlerine göre hesaplanmıştır ve bağlayıcılığı yoktur. Net tutar yerinde arıza tespiti sonrası belli olur.
          </div>

          <Link href={getWaUrl()} className="btn focus-ring" style={{ width: "100%", justifyContent: "center", background: "#25D366", color: "white", boxShadow: "0 4px 0 #1DA851" }} target="_blank">
            WhatsApp&apos;tan Net Fiyat Al
          </Link>
        </div>
      )}
    </div>
  );
}
