export function FaqList({ items }: { items: Array<{ q: string; a: string }> }) {
  if (!items.length) return null;

  return (
    <div className="grid" style={{ marginTop: 14 }}>
      {items.map((f) => (
        <div key={f.q} className="card" style={{ gridColumn: "span 6", padding: 16 }}>
          <div style={{ fontWeight: 900 }}>{f.q}</div>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
            {f.a}
          </div>
        </div>
      ))}
    </div>
  );
}

