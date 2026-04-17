import React from "react";

interface PAAItem {
  question: string;
  answer: string;
}

interface PeopleAlsoAskProps {
  items: PAAItem[];
}

export const PeopleAlsoAsk: React.FC<PeopleAlsoAskProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: "32px", padding: "24px", borderTop: "4px solid var(--accent)" }}>
      <h3 className="h2" style={{ fontSize: "24px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "32px" }}>🔍</span> Kullanıcıların Merak Ettiği Diğer Sorular
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderBottom: i === items.length - 1 ? "none" : "1px solid var(--border)", paddingBottom: "16px" }}>
            <h4 style={{ color: "var(--brand-900)", fontSize: "17px", fontWeight: 800, marginBottom: "8px" }}>
              {item.question}
            </h4>
            <div style={{ color: "var(--muted)", fontSize: "15px", lineHeight: "1.6" }}>
              {item.answer}
            </div>
          </div>
        ))}
      </div>
      <div 
        className="muted" 
        style={{ 
          marginTop: "20px", 
          fontSize: "12px", 
          fontStyle: "italic", 
          textAlign: "right",
          opacity: 0.6
        }}
      >
        * Bu sorular Google arama trendlerine göre otomatik olarak derlenmiştir.
      </div>
    </div>
  );
};
