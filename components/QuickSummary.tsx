import React from "react";

interface QuickSummaryProps {
  title: string;
  items: string[];
  answer: string;
}

export const QuickSummary: React.FC<QuickSummaryProps> = ({ title, items, answer }) => {
  return (
    <div 
      className="card" 
      id="speakable-content"
      style={{ 
        margin: "24px 0", 
        padding: "24px", 
        background: "var(--bg-card)",
        border: "2px solid var(--brand-soft)",
        borderRadius: "16px",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{ 
          background: "var(--brand)", 
          width: "8px", 
          height: "24px", 
          borderRadius: "4px" 
        }} />
        <h2 style={{ 
          margin: 0, 
          fontSize: "20px", 
          fontWeight: 900, 
          color: "var(--brand-900)",
          letterSpacing: "-0.5px"
        }}>
          {title}
        </h2>
      </div>

      <div className="grid">
        <div style={{ gridColumn: "span 7" }}>
          <p style={{ 
            margin: 0, 
            fontSize: "16px", 
            lineHeight: "1.6", 
            color: "var(--foreground)",
            fontWeight: 500
          }}>
            {answer}
          </p>
        </div>
        <div style={{ 
          gridColumn: "span 5", 
          borderLeft: "1px solid var(--border)", 
          paddingLeft: "24px" 
        }}>
          <ul style={{ 
            margin: 0, 
            padding: 0, 
            listStyle: "none", 
            display: "flex", 
            flexDirection: "column", 
            gap: "10px" 
          }}>
            {items.map((item, i) => (
              <li key={i} style={{ 
                fontSize: "14px", 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                color: "var(--muted)",
                fontWeight: 600
              }}>
                <span style={{ color: "var(--brand)", fontSize: "18px" }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* AI Grazing Hint */}
      <div style={{ 
        marginTop: "16px", 
        paddingTop: "16px", 
        borderTop: "1px dashed var(--border)",
        fontSize: "12px",
        color: "var(--muted)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: 0.8
      }}>
        <span>💡 Teknik özet ve hızlı yanıt paneli</span>
        <span style={{ fontWeight: 800, color: "var(--brand)" }}>#GEO_OPTIMIZED</span>
      </div>
    </div>
  );
};
