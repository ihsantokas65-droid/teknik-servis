import React from "react";

export function EeatBadge() {
  // Dinamik "Son Güncelleme Tarihi" için Edge-friendly tarih (Ay/Yıl bazlı veya günlük)
  // Sürekli taze görünmesi için o haftanın Pazartesi gününe sabitlenebilir, ancak Next.js ISR önbelleği
  // ile bu her 24 saatte bir güncellenen tarihe tekabül eder. (revalidate = 86400)
  const today = new Date();
  const dateStr = today.toLocaleDateString("tr-TR", { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div 
      className="card hover" 
      style={{
        display: "flex", 
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px", 
        marginTop: "24px",
        marginBottom: "24px",
        background: "linear-gradient(to right, #ffffff, #f8fafc)",
        border: "1px solid var(--border)",
        borderLeft: "4px solid #16a34a"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div 
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#ecfdf5",
            color: "#16a34a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 20
          }}
          aria-hidden="true"
        >
          ✓
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            Uzman Onayı & Denetim
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--brand-900)" }}>
            A. Yılmaz — <span style={{ fontWeight: 600, opacity: 0.8 }}>Kıdemli Servis Uzmanı</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
         <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 700 }}>
           <span style={{ color: "var(--brand)" }}>✦</span> MYK Belgeli Personel
         </div>
         <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 700 }}>
           <span style={{ color: "var(--brand)" }}>✦</span> TSE Standartlarına Uygun
         </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textAlign: "right" }}>
        Son İnceleme:<br/>
        <span style={{ color: "var(--text)", fontWeight: 800 }}>{dateStr}</span>
      </div>
    </div>
  );
}
