"use client";

import Link from "next/link";

const topBrands = [
  { name: "Bosch", slug: "bosch" },
  { name: "Arçelik", slug: "arcelik" },
  { name: "Beko", slug: "beko" },
  { name: "Vaillant", slug: "vaillant" },
  { name: "DemirDöküm", slug: "demirdokum" },
  { name: "ECA", slug: "eca" },
  { name: "Baymak", slug: "baymak" },
  { name: "Samsung", slug: "samsung" },
  { name: "LG", slug: "lg" },
  { name: "Siemens", slug: "siemens" },
  { name: "Viessmann", slug: "viessmann" },
  { name: "Vestel", slug: "vestel" }
];

export function BrandsGrid({ brands }: { brands?: { name: string; slug: string }[] }) {
  const list = brands || topBrands;
  
  return (
    <section className="section" style={{ background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="container" style={{ padding: "60px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 className="h2" style={{ fontSize: 32, fontWeight: 900 }}>Hizmet Verdiğimiz Markalar</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 10 }}>Türkiye&apos;nin en yaygın teknik servis ağı ile tüm global markalara uzman desteği sağlıyoruz.</p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
          gap: 20 
        }}>
          {list.map((brand) => (
            <Link 
              key={brand.slug}
              href="/markalar"
              className="card focus-ring hover"
              style={{ 
                padding: "24px 16px", 
                textAlign: "center", 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                color: "var(--brand-900)",
                textDecoration: "none",
                background: "white",
                border: "1px solid var(--border)"
              }}
            >
              <div style={{ 
                width: 48, 
                height: 48, 
                background: "var(--brand-soft)", 
                borderRadius: 12, 
                color: "var(--brand)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                marginBottom: 12,
                fontSize: 20,
                fontWeight: 900
              }}>
                {brand.name[0]}
              </div>
              {brand.name.toUpperCase()}
            </Link>
          ))}
        </div>
        
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/markalar" className="btn secondary">Tüm Markaları Gör</Link>
        </div>
      </div>
    </section>
  );
}
