import { createRng, pickOne, pickManyUnique } from "@/lib/variation";
import { User, ShieldCheck } from "lucide-react";

const names = [
  "Ahmet T.", "Ayşe Y.", "Mehmet K.", "Fatma S.", "Ali D.", 
  "Zeynep E.", "Mustafa G.", "Elif B.", "Kemal A.", "Selin R."
];

const devices = {
  kombi: ["kombim", "Kombi cihazımız", "yoğuşmalı kombimiz"],
  klima: ["klimamız", "salon tipi klimam", "inverter klimamız"],
  beyaz_esya: ["çamaşır makinem", "bulaşık makinem", "buzdolabım"]
};

const symptoms = {
  kombi: ["su damlatıyor", "F4 hatası veriyor", "ateşleme yapmıyor", "petekleri ısıtmıyor", "sesli çalışıyor"],
  klima: ["soğutmuyor", "gazı bitmiş sanırım", "su akıtıyor", "sigorta attırıyor", "kötü koku yayıyor"],
  beyaz_esya: ["su boşaltmıyor", "altından su sızdırıyor", "motoru çalışmıyor", "soğutmuyor", "aşırı titriyor"]
};

const reasons = {
  kombi: ["eşanjör delinmesi veya emniyet ventili", "anakart veya gaz valfi", "pompa motoru tıkanıklığı"],
  klima: ["gaz kaçağı veya kompresör", "drenaj hattı tıkanıklığı", "kondansatör arızası veya kirli filtre"],
  beyaz_esya: ["su giriş valfi arızası", "tıkalı pompa veya anakart", "motor veya amortisör yatakları"]
};

export function DynamicQa({ 
  city, 
  district, 
  serviceLabel, 
  brand 
}: { 
  city: string; 
  district: string; 
  serviceLabel: string; 
  brand?: string 
}) {
  const pageKey = `/qa/${city}/${district}/${serviceLabel}/${brand || "genel"}`;
  const rng = createRng(pageKey);

  let deviceKey: "kombi" | "klima" | "beyaz_esya" = "kombi";
  if (serviceLabel.toLowerCase().includes("klima")) deviceKey = "klima";
  if (serviceLabel.toLowerCase().includes("beyaz")) deviceKey = "beyaz_esya";

  const numQ = pickOne(rng, [2, 3, 3, 4]); // mostly 3 generated Qs
  const qList = [];

  for (let i = 0; i < numQ; i++) {
    const name = pickOne(rng, names);
    const b = brand ? brand : pickOne(rng, ["cihazımız", "makinemiz"]);
    const d = pickOne(rng, devices[deviceKey]);
    const s = pickOne(rng, symptoms[deviceKey]);
    const r = pickOne(rng, reasons[deviceKey]);

    const qTemplates = [
      `${district} merkezdeki evimde ${b !== "cihazımız" ? b : ""} ${d} ${s}. Ne yapmam gerekiyor?`,
      "Merhaba, ${b} ${d} kullanıyoruz ve son günlerde ${s}. ${district} bölgesi için servisiniz ne kadar sürede gelir?",
      "${d} birdenbire ${s}. Buralarda ( ${district} ) güvenilir bir usta arıyorum, yardımcı olabilir misiniz?"
    ];

    const aTemplates = [
      `Merhaba ${name.split(" ")[0]}. Belirttiğiniz şikayet genellikle ${r} kaynaklı oluşur. ${district} mobil ekiplerimiz sistemde kayıtlı, hemen randevu verirsek gün içinde onarımını yapabiliriz.`,
      `Geçmiş olsun. Cihazın ${s} şikayeti büyük ihtimalle ${r} ile ilgilidir. İlgili parçaları temin edip ${district} bölgesine hızlıca araç yönlendirebiliriz.`,
      `Bize ulaştığınız için teşekkürler. Uzmanlarımız bu belirtinin ${r} sorunundan kaynaklandığını öngörüyor. Detaylı teknik test için ${district} veya ${city} merkez ekibimizi çağırabilirsiniz.`
    ];

    const qText = pickOne(rng, qTemplates)
      .replace("${b}", b)
      .replace("${d}", d)
      .replace("${s}", s)
      .replace("${district}", district);

    const aText = pickOne(rng, aTemplates)
      .replace("${name}", name)
      .replace("${r}", r)
      .replace("${s}", s)
      .replace("${district}", district)
      .replace("${city}", city);

    qList.push({ name, q: qText, a: aText, dateAgo: Math.floor(rng() * 45) + 1 });
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
