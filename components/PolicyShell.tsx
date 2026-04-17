import { Container } from "@/components/Container";

export function PolicyShell({
  title,
  updatedAt,
  children
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section">
      <Container>
        <div className="card" style={{ padding: 22 }}>
          <div className="badge">Politika • Son güncelleme: {updatedAt}</div>
          <h1 className="h1" style={{ marginTop: 12, fontSize: 36 }}>
            {title}
          </h1>
          <div style={{ marginTop: 12 }}>{children}</div>
        </div>
      </Container>
    </section>
  );
}

