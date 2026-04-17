"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/Container";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <section className="section">
      <Container>
        <div className="card" style={{ padding: 16 }}>
          <div className="h2" style={{ fontWeight: 900 }}>
            Bir hata oluştu
          </div>
          <p className="muted" style={{ marginTop: 6 }}>
            Sayfa yüklenirken beklenmeyen bir sorun oluştu. Tekrar deneyebilir veya ana sayfaya dönebilirsiniz.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <button className="btn" onClick={() => reset()} type="button">
              Tekrar Dene
            </button>
            <Link className="btn btn-ghost" href="/">
              Ana Sayfaya Dön
            </Link>
          </div>
          {error?.digest ? (
            <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
              Hata kodu: {error.digest}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

