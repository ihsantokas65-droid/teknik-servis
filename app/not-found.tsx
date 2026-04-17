import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <section className="section">
      <Container>
        <div className="card" style={{ padding: 16 }}>
          <div className="h2" style={{ fontWeight: 900 }}>
            Sayfa bulunamadı
          </div>
          <p className="muted">Aradığınız sayfa taşınmış veya kaldırılmış olabilir.</p>
          <Link className="btn" href="/">
            Ana Sayfaya Dön
          </Link>
        </div>
      </Container>
    </section>
  );
}

