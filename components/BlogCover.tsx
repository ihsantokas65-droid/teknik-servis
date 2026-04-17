export function BlogCover({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      className="blogCover"
      aria-hidden
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background:
          "radial-gradient(780px 420px at 15% 0%, rgba(29, 78, 216, 0.22), transparent 55%), radial-gradient(620px 380px at 88% 18%, rgba(14, 165, 233, 0.18), transparent 60%), linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.6))"
      }}
    >
      <div style={{ padding: 18 }}>
        <div className="badge">{subtitle}</div>
        <div style={{ marginTop: 12, fontWeight: 1000, letterSpacing: "-0.4px", fontSize: 20, lineHeight: 1.2 }}>
          {title}
        </div>
        <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
          Rehber yazı
        </div>
      </div>
    </div>
  );
}

