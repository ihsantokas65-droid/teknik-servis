import { technicalQaByService, brandServicePlaybooks } from "@/lib/semantics";
import type { ServiceKind } from "@/lib/services";
import { serviceKindFromSlug } from "@/lib/services";
import { createRng, pickOne } from "@/lib/variation";
import { User, ShieldCheck } from "lucide-react";

export function DynamicQa({ 
  city, 
  district, 
  serviceLabel, 
  brand,
  brandSlug
}: { 
  city: string; 
  district: string; 
  serviceLabel: string; 
  brand?: string;
  brandSlug?: string;
}) {
  const pageKey = `/qa/${city}/${district}/${serviceLabel}/${brandSlug || "genel"}`;
  const rng = createRng(pageKey);

  const kind = serviceKindFromSlug(serviceLabel) || (serviceLabel.toLowerCase().includes("klima") ? "klima" : serviceLabel.toLowerCase().includes("beyaz") ? "beyaz-esya" : "kombi") as ServiceKind;
  const data = (technicalQaByService[kind] || technicalQaByService.kombi) as any[];
  const brandPlaybook = (brandSlug && (brandServicePlaybooks as any)[brandSlug]) ? (brandServicePlaybooks as any)[brandSlug][kind] as any : null;

  const names = ["Ahmet T.", "Bülent K.", "Canan S.", "Derya G.", "Emre Y.", "Funda L.", "Gökhan Ö.", "Hülya M.", "İrfan B.", "Jale Ş."];
  
  const numQ = pickOne(rng, [2, 3, 3, 4]);
  const qList = [];

  for (let i = 0; i < numQ; i++) {
    const name = pickOne(rng, names);
    const useBrandIssue = brandPlaybook && rng() > 0.4;
    
    let symptom = "";
    let reason = "";
    let answer = "";

    if (useBrandIssue && brandPlaybook.issueFocus.length > 0) {
      const rawIssue = pickOne(rng, brandPlaybook.issueFocus) as string;
      // Clean spinning from issueFocus for Q&A feel
      symptom = rawIssue.replace(/\{|\}/g, "").split("|")[0];
      reason = (brandPlaybook.maintenanceFocus[0] as string)?.replace(/\{|\}/g, "").split("|")[0] || "marka spesifik teknik aksaklık";
      answer = (brandPlaybook.proofPoints[0] as string)?.replace(/\{|\}/g, "").split("|")[0] || "Cihazın teknik mimarisine uygun müdahale gerektirir.";
    } else {
      const pair = pickOne(rng, data) as any;
      symptom = pair.s;
      reason = pair.r;
      answer = pair.a;
    }

    const b = brand ? brand : pickOne(rng, ["cihazımız", "ünitemiz"]);
    
    const qTemplates = [
        `Merhaba, ${district} merkezdeki evimizde ${b} ${symptom}. Ne yapmamız gerekiyor?`,
        `${brand ? brand : "Bizim"} ${serviceLabel} aniden ${symptom}. ${district} bölgesi için hızlı servisiniz var mı?`,
        "${district} civarında oturuyorum, ${b} ${symptom}. Uzman görüşünüz nedir?"
    ];

    const qText = pickOne(rng, qTemplates);
    const aText = `Merhaba ${name.split(" ")[0]} Bey/Hanım. ${symptom} şikayeti genellikle ${reason} kaynaklıdır. ${answer} ${district} mobil ekiplerimizi yönlendirerek yerinde kesin çözüm sunabiliriz.`;

    qList.push({ name, q: qText, a: aText, dateAgo: Math.floor(rng() * 30) + 1 });
  }

  return (
    <div className="card" style={{ padding: "40px 24px", marginTop: 40, background: "white" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 className="h2" style={{ fontWeight: 900 }}>Uzmana Sorun</h2>
        <p className="muted" style={{ fontSize: 16, marginTop: 8 }}>
          {district} ve çevresinde {brand ? `${brand} ` : ""}{serviceLabel} hakkında en çok sorulanlar ve çözüm önerilerimiz.
        </p>
      </div>

      <div style={{ display: "grid", gap: 24, maxWidth: 860, margin: "0 auto" }}>
        {qList.map((item, idx) => (
          <div key={idx} style={{ padding: 20, borderRadius: 16, background: "#f8fafc", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--brand-soft)", color: "var(--brand-900)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{item.name} <span style={{ fontWeight: 400, fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{item.dateAgo} gün önce sordu</span></div>
                <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.5, fontWeight: 500 }}>&quot;{item.q}&quot;</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 12, color: "var(--brand)", textTransform: "uppercase", letterSpacing: 0.5 }}>Uzman Yanıtı</div>
                <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.6, color: "var(--muted)" }}>
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
