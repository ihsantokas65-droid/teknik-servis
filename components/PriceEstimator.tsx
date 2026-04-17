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
    { label: "Ateşleme Yapmıyor / Alev Oluşmuyor", min: 800, max: 3500, note: "Anakart, gaz valfi veya ateşleme traposu/elektrotu arızası olabilir." },
    { label: "Su Akıtıyor / Basınç Sürekli Düşüyor", min: 500, max: 2500, note: "Eşanjör deliği, genleşme tankı membranı veya emniyet ventili kaynaklı olabilir." },
    { label: "Petekler Isınmıyor / Sesli Çalışıyor", min: 1200, max: 4500, note: "Devirdaim (sirkülasyon) pompası arızası veya üç yollu vana tıkanıklığı olabilir." },
    { label: "Musluktan Sıcak Su Gelmiyor / Ilıtıyor", min: 600, max: 1800, note: "NTC sensör arızası, tribün pervanesi kırığı veya plaka eşanjör kireçlenmesi." },
    { label: "Fan Motoru Aşırı Ses Yapıyor / Fırlatıyor", min: 900, max: 2800, note: "Baca fanı rulmanlarının dağılması. Fan motoru revizyonu veya değişimi gerekebilir." },
    { label: "Cihaza Hiç Elektrik Gelmiyor / Ekran Yok", min: 1500, max: 4000, note: "Büyük ihtimalle yüksek voltaj kaynaklı elektronik kart (anakart) yanmasıdır." },
    { label: "Yıllık Periyodik Bakım", min: 450, max: 800, note: "Standart yanma odası, fan ve filtre temizliğini içerir. Sadece bakım ücretidir." }
  ],
  klima: [
    { label: "Soğutmuyor / Isıtmıyor / Gazı Bitti", min: 800, max: 2500, note: "R410A / R32 gaz şarjı gereklidir. Fiyat kaçak tespiti ve doldurulacak gaz gramajına göre değişebilir." },
    { label: "İç Ünite Su Damlatıyor / Akıtıyor", min: 400, max: 900, note: "Drenaj hattı tıkanıklığı, cihaz eğimi dengesizliği veya tahliye tavası buzlanması." },
    { label: "Dış Ünite Motoru (Kompresör) Kalkmıyor", min: 600, max: 1400, note: "Genellikle kalkış kapasitörü (kondansatör) arızasıdır. Parça değişimi ile kolayca çözülür." },
    { label: "Kötü Koku Yayıyor / Çok Kirli Hava Üflüyor", min: 500, max: 900, note: "Çift solüsyon, kimyasal ilaçlı ve buharlı derinlemesine antibakteriyel detaylı bakım gerektirir." },
    { label: "İç Ünite Fan Motoru Ses Yapıyor / Dönmüyor", min: 1200, max: 3000, note: "Blower pervane kırığı veya iç ünite fan motoru sargı/rulman arızası olabilir." },
    { label: "Kumanda İşlem Yapmıyor / Sinyal Yok", min: 700, max: 1800, note: "İç ünitenin sinyal alıcı gözü (display) arızalanmış veya kart bağlantısı kopmuş olabilir." },
    { label: "Kompresör Yanığı (Ağır Motor Arızası)", min: 4500, max: 15000, note: "Klimanın en hayati parçası olan motorun değişmesi veya revizyonu gereklidir (Cihazın BTU'suna göre artar)." }
  ],
  beyaz_esya: [
    { label: "Çamaşır Makinesi Su Boşaltmıyor", min: 600, max: 1400, note: "Pompa motoru tıkanıklığı, bozuk para sıkışması veya pompa pervanesi kırılması." },
    { label: "Çamaşır Makinesi Çok Titriyor / Sesli Sıkıyor", min: 1500, max: 4500, note: "Kazan bilyelerinin (rulman grubu) dağılması veya amortisörlerin patlaması nedeniyle oluşur." },
    { label: "Bulaşık Makinesi Suyu Isıtmıyor / Kurutmuyor", min: 800, max: 2000, note: "Isıtıcı rezistans borusu arızası veya anakartın röle çekmemesinden kaynaklanır." },
    { label: "Bulaşık Makinesi Su Almıyor / Yıkamaya Geçmiyor", min: 500, max: 1200, note: "Su giriş emniyet ventili veya su seviye anahtarı (prosestat) arızalanmış olabilir." },
    { label: "Buzdolabı Alt Tarafı Soğutmuyor / Üst Donduruyor", min: 1200, max: 3500, note: "Defrost (eritme) sensörü, rezistans arızası veya fan motoru kilitlenmesi sebeplidir." },
    { label: "Buzdolabı Motoru Çalışmıyor (Tık Sesi Geliyor)", min: 4500, max: 12500, note: "Kompresör arızası veya soğutucu gaz kaçağıdır. Yeniden gaz şarjı ve kompresör değişimi ister." },
    { label: "(Tümü) Elektronik Kart Arızası / Işıklar Yanmıyor", min: 1200, max: 3500, note: "Şebeke dalgalanmasından kart yanmıştır. Kartın onarımı veya sıfırı ile değişimi yapılmalıdır." },
    { label: "(Tümü) Kapak Kapanmıyor / Kilitlenme Sorunu", min: 450, max: 1100, note: "Kapak menteşesi kırığı veya elektronik ön kilit (PTC) sisteminin değişmesi gerekir." }
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
