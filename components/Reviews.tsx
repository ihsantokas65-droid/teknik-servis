"use client";

import { useEffect, useMemo, useState } from "react";
import type { Review } from "@/lib/reviews.shared";
import { computeAggregate } from "@/lib/reviews.shared";

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span role="img" aria-label={`${value} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden style={{ color: i < full ? "#f59e0b" : "rgba(15,23,42,.22)" }}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Reviews({ 
  pageKey,
  city,
  district,
  brand,
  serviceLabel
}: { 
  pageKey: string;
  city?: string;
  district?: string;
  brand?: string;
  serviceLabel?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Review[]>([]);
  const agg = useMemo(() => computeAggregate(items), [items]);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ key: pageKey });
      if (city) params.set("city", city);
      if (district) params.set("district", district);
      if (brand) params.set("brand", brand);
      if (serviceLabel) params.set("serviceLabel", serviceLabel);

      const res = await fetch(`/api/reviews?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data?.reviews) ? data.reviews : []);
    } catch {
      setError("Yorumlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, city, district, brand, serviceLabel]);

  async function submit() {
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: pageKey, name, rating, comment, company })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "Gönderilemedi.");
        return;
      }
      setOk("Yorumunuz alındı. Teşekkürler.");
      setName("");
      setRating(5);
      setComment("");
      await refresh();
    } catch {
      setError("Gönderilemedi.");
    }
  }

  return (
    <section className="section" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div className="container">
        <div className="grid" style={{ alignItems: "stretch" }}>
          <div className="card" style={{ gridColumn: "span 7", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <div>
                <div className="h2" style={{ fontSize: 26, color: "var(--brand-900)" }}>
                  Müşteri Memnuniyeti
                </div>
                <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                  Hizmet verdiğimiz müşterilerimizin gerçek deneyimleri.
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {agg ? (
                  <>
                    <div style={{ fontWeight: 950, fontSize: 32, color: "var(--brand-900)", lineHeight: 1 }}>
                      {agg.ratingValue.toFixed(1)}
                    </div>
                    <div style={{ margin: "4px 0" }}>
                      <Stars value={agg.ratingValue} />
                    </div>
                    <div className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
                      {agg.reviewCount} Değerlendirme
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card" style={{ padding: 20, background: "white", border: "1px solid var(--border)", opacity: 0.6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ height: 16, width: 120, background: "#f1f5f9", borderRadius: 4 }} />
                        <div style={{ height: 16, width: 80, background: "#f1f5f9", borderRadius: 4 }} />
                      </div>
                      <div style={{ height: 14, width: "100%", background: "#f1f5f9", borderRadius: 4, marginTop: 12 }} />
                      <div style={{ height: 14, width: "80%", background: "#f1f5f9", borderRadius: 4, marginTop: 8 }} />
                    </div>
                  ))}
                </>
              ) : items.length === 0 ? (
                <div className="card" style={{ padding: 24, background: "var(--bg)", borderStyle: "dashed", textAlign: "center" }}>
                  <div style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-900)" }}>Henüz yorum yapılmamış</div>
                  <div className="muted" style={{ fontSize: 14, marginTop: 8 }}>
                    Bu bölge için ilk değerlendirmeyi siz yapabilirsiniz.
                  </div>
                </div>
              ) : (
                items.slice(0, 10).map((r) => (
                  <div key={r.id} className="card" style={{ padding: 20, background: "white", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 900, color: "var(--brand-900)", fontSize: 16 }}>{r.name}</div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Stars value={r.rating} />
                        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
                          {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 15, marginTop: 10, color: "var(--text)", lineHeight: 1.6 }}>
                      {r.comment}
                    </div>
                    <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: "var(--brand)", textTransform: "uppercase" }}>
                      ✅ Doğrulanmış Hizmet
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card" style={{ gridColumn: "span 5", padding: 24, background: "#fcfcfc" }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: "var(--brand-900)" }}>Deneyiminizi Paylaşın</div>
            <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
              Görüşleriniz hizmet kalitemizi artırmamıza yardımcı olur.
            </div>

            <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
              <div>
                <label htmlFor="review-name" className="label">Adınız Soyadınız</label>
                <input id="review-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Ahmet Yılmaz" />
              </div>

              <div>
                <label htmlFor="review-rating" className="label">Hizmet Puanı</label>
                <select id="review-rating" className="select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((x) => (
                    <option key={x} value={x}>
                      {x === 5 ? "⭐⭐⭐⭐⭐ (Mükemmel)" : `${x} Yıldız`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="review-comment" className="label">Yorumunuz</label>
                <textarea
                  id="review-comment"
                  className="textarea"
                  style={{ minHeight: 120 }}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Hizmet kalitesi, hız ve personel davranışı hakkında görüşlerinizi yazın..."
                />
              </div>

              {/* honeypot */}
              <div className="sr-only">
                <label htmlFor="company-hp">Company</label>
                <input id="company-hp" value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" />
              </div>

              {error ? <div style={{ color: "#b91c1c", fontWeight: 800, fontSize: 14 }}>⚠️ {error}</div> : null}
              {ok ? <div style={{ color: "#166534", fontWeight: 800, fontSize: 14 }}>✅ {ok}</div> : null}

              <button 
                type="button" 
                className="btn focus-ring" 
                style={{ width: "100%", padding: 16, marginTop: 8 }}
                onClick={submit}
              >
                Yorumu Gönder
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

