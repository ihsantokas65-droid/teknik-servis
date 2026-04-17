"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import Image from "next/image";
import { site } from "@/lib/site";
import { services } from "@/lib/services";

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const tel = digitsOnly(site.phone);

  const toggle = () => setIsOpen(!isOpen);

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: 280,
    height: "100%",
    background: "white",
    zIndex: 2000,
    boxShadow: "20px 0 50px rgba(0,0,0,0.1)",
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    padding: 30,
    display: "flex",
    flexDirection: "column",
    gap: 20
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(1, 36, 90, 0.4)",
    backdropFilter: "blur(4px)",
    zIndex: 1999,
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.3s ease"
  };

  return (
    <>
      <div style={overlayStyle} onClick={toggle} />

      <aside style={sidebarStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-900)" }}>MENÜ</div>
          <button 
            onClick={toggle}
            style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <Link onClick={toggle} href="/" style={{ fontWeight: 700, fontSize: 18 }}>Anasayfa</Link>
          <div style={{ margin: "10px 0", borderTop: "1px solid var(--border)", paddingTop: 15 }}>
             <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)", marginBottom: 10 }}>HİZMETLERİMİZ</div>
             <div style={{ display: "grid", gap: 10 }}>
               {services.map(s => (
                 <Link key={s.slug} onClick={toggle} href={`/hizmetler/${s.slug}`} style={{ fontWeight: 600 }}>
                   {s.label}
                 </Link>
               ))}
             </div>
          </div>
          <Link onClick={toggle} href="/servis-bolgelerimiz" style={{ fontWeight: 700, fontSize: 18 }}>Bölgeler</Link>
          <Link onClick={toggle} href="/blog" style={{ fontWeight: 700, fontSize: 18 }}>Blog</Link>
          <Link onClick={toggle} href="/iletisim" className="btn" style={{ marginTop: 20 }}>
            Hemen Ara: {site.phone}
          </Link>
        </nav>
      </aside>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <Container>
          <div
            style={{
              padding: "12px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16
            }}
          >
            <Link href="/" rel="home" aria-label="Ana sayfa" className="focus-ring" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
              <div style={{ position: "relative", width: 44, height: 44 }}>
                <Image 
                  src="/images/branding/servisuzmani-logo.png" 
                  alt={`${site.name} Teknik Servis Ağı - Kurumsal Çözümler`} 
                  fill
                  priority={true}
                  fetchPriority="high"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div style={{ display: "grid", gap: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-900)", lineHeight: 1, letterSpacing: "-0.5px" }}>{site.name.toUpperCase()}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: 0.5 }}>
                  TEKNİK SERVİS AĞI
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <nav aria-label="Üst menü" className="desktopOnly" style={{ color: "var(--brand-900)", fontWeight: 700, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Link className="focus-ring" href="/" style={{ padding: "10px 16px", borderRadius: 12, fontSize: 14 }}>Anasayfa</Link>
                <details className="dropdown">
                  <summary className="focus-ring" style={{ listStyle: "none", cursor: "pointer", padding: "10px 16px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
                    Hizmetler <span className="muted" aria-hidden>▾</span>
                  </summary>
                  <div className="card" style={{ position: "absolute", top: "calc(100% + 12px)", left: 0, minWidth: 340, padding: 20, zIndex: 100, background: "white", boxShadow: "var(--shadow)", border: "1px solid var(--border)", borderRadius: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 12 }}>
                      {services.map((s) => (
                        <Link key={s.slug} className="focus-ring" href={`/hizmetler/${s.slug}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, background: "#f8fafc", border: "1px solid var(--border)", fontSize: 14 }}>
                          <span>{s.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
                <Link className="focus-ring" href="/servis-bolgelerimiz" style={{ padding: "10px 16px", borderRadius: 12, fontSize: 14 }}>Bölgeler</Link>
                <Link className="focus-ring" href="/blog" style={{ padding: "10px 16px", borderRadius: 12, fontSize: 14 }}>Blog</Link>
              </nav>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Link 
                  className="btn focus-ring desktopOnly" 
                  style={{ padding: "10px 18px", fontSize: 14 }} 
                  href="/iletisim"
                >
                  Ücretsiz Danışmanlık
                </Link>

                {/* Mobile Menu Toggle */}
                <button 
                  className="mobileOnly"
                  onClick={toggle}
                  aria-label="Menüyü aç"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 20
                  }}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </Container>
      </header>

    </>
  );
}
