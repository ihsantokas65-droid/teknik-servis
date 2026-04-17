import React from "react";

interface ExpertNoteProps {
  title?: string;
  content: string;
}

export const ExpertNote: React.FC<ExpertNoteProps> = ({ 
  title = "Profesyonel Bakış Açısı", 
  content 
}) => {
  return (
    <div 
      className="card" 
      style={{ 
        margin: "24px 0", 
        padding: "24px", 
        background: "linear-gradient(135deg, #fff 0%, var(--brand-soft) 100%)",
        borderLeft: "5px solid var(--brand)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div 
          style={{ 
            background: "var(--brand)", 
            color: "var(--brand-900)", 
            width: "40px", 
            height: "40px", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "20px",
            fontWeight: "900",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}
        >
          !
        </div>
        <div>
          <h4 
            style={{ 
              margin: 0, 
              color: "var(--brand-900)", 
              fontSize: "18px", 
              fontWeight: 900,
              letterSpacing: "-0.5px"
            }}
          >
            {title}
          </h4>
          <p 
            style={{ 
              margin: "8px 0 0", 
              color: "var(--muted)", 
              fontSize: "15px", 
              lineHeight: "1.6",
              fontWeight: 500
            }}
          >
            {content}
          </p>
        </div>
      </div>
      
      {/* Subtle background decoration */}
      <div 
        style={{ 
          position: "absolute", 
          right: "-20px", 
          bottom: "-20px", 
          fontSize: "100px", 
          opacity: 0.03, 
          fontWeight: 900, 
          color: "var(--brand-900)",
          userSelect: "none",
          pointerEvents: "none"
        }}
      >
        EXPERT
      </div>
    </div>
  );
};
