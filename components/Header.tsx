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
          <Link onClick={toggle} href="/servis-bolgeleri" style={{ fontWeight: 700, fontSize: 18 }}>Bölgeler</Link>
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
            <Link href="/" rel="home" aria-label="Ana sayfa" className="focus-ring" style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12,
              flexShrink: 1
            }}>
              <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                <Image 
                  src="/images/branding/yetkili-kombi-servisi-logo.png" 
                  alt={site.name} 
                  fill
                  priority={true}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div style={{ display: "grid", gap: 0, overflow: "hidden" }}>
                <div style={{ 
                  fontWeight: 900, 
                  fontSize: "clamp(14px, 4vw, 18px)", 
                  color: "var(--brand-900)", 
                  lineHeight: 1, 
                  letterSpacing: "-0.5px",
                  whiteSpace: "nowrap"
                }}>
                  {site.name.toLocaleUpperCase("tr-TR")}
                </div>
                <div style={{ 
                  fontSize: 9, 
                  fontWeight: 700, 
                  color: "var(--muted)", 
                  letterSpacing: 0.5,
                  whiteSpace: "nowrap"
                }}>
                  TEKNİK SERVİS AĞI
                </div>
              </div>
            </Link>

            {/* Nav Wrapper */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <nav aria-label="Üst menü" className="desktopOnly" style={{ color: "var(--brand-900)", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <Link className="focus-ring" href="/" style={{ padding: "10px 12px", borderRadius: 12, fontSize: 13 }}>Anasayfa</Link>
                <Link className="focus-ring" href="/servis-bolgeleri" style={{ padding: "10px 12px", borderRadius: 12, fontSize: 13 }}>Bölgeler</Link>
                <Link className="focus-ring" href="/blog" style={{ padding: "10px 12px", borderRadius: 12, fontSize: 13 }}>Blog</Link>
              </nav>

              <Link 
                className="btn focus-ring desktopOnly" 
                style={{ padding: "10px 16px", fontSize: 13 }} 
                href="/iletisim"
              >
                Randevu Al
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
        </Container>
      </header>

    </>
  );
}
