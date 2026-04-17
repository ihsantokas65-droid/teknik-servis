import Link from "next/link";
import { Mail, Clock, PhoneCall } from "lucide-react";
import { Container } from "@/components/Container";
import { site } from "@/lib/site";

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function TopBar() {
  const tel = digitsOnly(site.phone);
  const wa = digitsOnly(site.whatsapp);

  return (
    <div
      style={{
        background: "var(--brand-900)",
        color: "white",
        fontSize: 13,
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}
    >
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <div className="desktopOnly" style={{ display: "flex", gap: 20 }}>
            <Link 
              className="focus-ring" 
              href={`mailto:${site.email}`} 
              style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              <Mail size={14} /> {site.email}
            </Link>
            <span style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>
              <Clock size={14} /> {site.workingHours}
            </span>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <Link 
              className="focus-ring" 
              style={{ color: "var(--brand)", fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }} 
              href={`tel:${tel}`}
            >
              <PhoneCall size={16} /> Müşteri Hattı: {site.phone}
            </Link>
            <Link
              className="focus-ring"
              style={{ color: "white", opacity: 0.9, textDecoration: "none" }}
              href={`https://wa.me/${wa.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
