import { site } from "@/lib/site";

export function StatsRow() {
  const items = site.metrics?.filter(Boolean) ?? [];
  if (items.length === 0) return null;

  return (
    <div 
      style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", 
        gap: 16, 
        marginTop: 32 
      }} 
      role="region"
      aria-label="Öne çıkan istatistikler"
    >
      {items.slice(0, 4).map((it) => (
        <div 
          key={`${it.value}-${it.label}`} 
          role="group"
          style={{ 
            padding: 16, 
            borderRadius: 16, 
            background: "#f8fafc", 
            border: "1px solid var(--border)" 
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--brand-900)" }}>{it.value}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginTop: 4 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

