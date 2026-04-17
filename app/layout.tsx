import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Outfit } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";

const outfit = Outfit({ 
  subsets: ["latin", "latin-ext"], 
  display: "swap" 
});

const Footer = dynamic(() => import("@/components/Footer").then((mod) => mod.Footer));
const ChatBot = dynamic(() => import("@/components/ChatBot").then((mod) => mod.ChatBot));
const CookieConsent = dynamic(() => import("@/components/CookieConsent").then((mod) => mod.CookieConsent), { ssr: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "SERVİSUZMANI",
    template: `%s | SERVİSUZMANI`
  },
  description: site.description,
  applicationName: "SERVİSUZMANI",
  icons: {
    icon: [{ url: "/images/branding/servisuzmani-logo.png", type: "image/png" }]
  }
};

const minifiedCss = `
:root{--bg:#F4F7F6;--surface:#ffffff;--text:#1d211c;--muted:#64748b;--brand:#F26522;--brand-700:#d94e10;--brand-900:#1A2B3C;--brand-soft:rgba(242,101,34,0.08);--accent:#2563eb;--accent-2:#1e3a8a;--border:#e2e8f0;--ring:rgba(242,101,34,0.4);--radius:16px;--shadow-sm:0 1px 3px rgba(26,43,60,0.05),0 1px 2px rgba(26,43,60,0.02);--shadow:0 20px 25px -5px rgba(26,43,60,0.1),0 8px 10px -6px rgba(26,43,60,0.1)}@keyframes reveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}img,video{max-width:100%;height:auto}html,body{height:100%;overflow-x:hidden;position:relative;width:100%}body{margin:0;color:var(--text);background:var(--bg);font-family:inherit;line-height:1.6;-webkit-font-smoothing:antialiased}main{min-height:70vh}a{color:inherit;text-decoration:none;transition:all 0.2s ease}a:hover{color:var(--accent)}.muted{color:var(--muted)}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.focus-ring:focus-visible{outline:3px solid var(--ring);outline-offset:2px}.container{max-width:1200px;margin:0 auto;padding:0 24px}.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-sm);overflow:hidden;transition:all 0.2s ease}.card.hover{transition:all 0.3s cubic-bezier(0.4,0,0.2,1)}.card.hover:hover{transform:translateY(-8px);box-shadow:var(--shadow);border-color:var(--brand);background:var(--surface)}.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:14px 28px;border-radius:8px;background:var(--brand);color:var(--brand-900);font-weight:800;border:none;transition:all 0.2s ease;cursor:pointer;box-shadow:0 4px 0 var(--brand-700)}.btn:active{transform:translateY(2px);box-shadow:0 2px 0 var(--brand-700)}.btn:hover{background:var(--brand-700);color:white}.btn.secondary{background:white;color:var(--brand-900);border:1px solid var(--border);box-shadow:none}.btn.secondary:hover{background:#f1f5f9;border-color:var(--brand)}.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:4px;background:var(--brand-soft);border:1px solid var(--brand);color:var(--brand-900);font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:1px}.h1{font-size:56px;line-height:1.1;margin:0;letter-spacing:-2px;color:var(--brand-900);font-weight:900}.h1 span{display:block}.h2{font-size:36px;line-height:1.2;margin:0;letter-spacing:-1px}.h3{font-size:20px;line-height:1.4;margin:0;font-weight:800}.section{padding:80px 0;animation:reveal 0.8s ease backwards}.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:24px}.hero{position:relative;background:radial-gradient(circle at 100% 0%,rgba(59,130,246,0.1) 0%,transparent 40%),radial-gradient(circle at 0% 100%,rgba(129,140,248,0.1) 0%,transparent 40%)}.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:32px}.kpi .card{padding:24px;background:#f8fafc}.kpi strong{display:block;font-size:18px;margin-bottom:4px}.kpi span{font-size:14px;opacity:0.7}.input,.select,.textarea{width:100%;padding:16px;border-radius:8px;background:white;border:1px solid var(--border);color:var(--text);transition:all 0.2s;font-size:15px}.input:focus,.select:focus,.textarea:focus{border-color:var(--brand);background:#fcfcfc;outline:none}.section:nth-child(even){animation-delay:0.2s}.section:nth-child(odd){animation-delay:0.4s}@media (max-width:968px){.h1{font-size:38px}.grid{grid-template-columns:repeat(6,1fr)}.kpi{grid-template-columns:repeat(2,1fr)}.statsRow{grid-template-columns:repeat(2,1fr)}}@media (max-width:768px){.grid{display:flex!important;flex-direction:column!important;gap:16px!important}.container{padding:0 16px!important}.hero{padding:20px!important}.h1{font-size:32px;letter-spacing:-1px}.section{padding:40px 0}.kpi{grid-template-columns:1fr}.statsRow{grid-template-columns:1fr}}@media (max-width:768px){.desktopOnly{display:none!important}}@media (min-width:769px){.mobileOnly{display:none!important}}.prose h2{color:var(--brand-900);font-weight:900;margin-top:2rem}.prose p{margin-top:1rem;color:var(--text)}.prose ul{margin-top:1rem;padding-left:1.5rem}.prose li{margin-top:0.5rem}.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{padding:6px 12px;border-radius:999px;background:#f1f5f9;border:1px solid var(--border);font-size:13px;font-weight:700;transition:all 0.2s}.chip:hover{background:#e2e8f0;border-color:var(--brand)}
`;

import { headers } from "next/headers";
import { GeoBanner } from "@/components/GeoBanner";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const heads = headers();
  const rawCity = heads.get("x-vercel-ip-city") || "";
  
  // Vercel encodes headers (e.g. İstanbul -> %C4%B0stanbul). We must decode it.
  let detectedCity = "";
  try {
    detectedCity = rawCity ? decodeURIComponent(rawCity) : "";
  } catch (e) {
    detectedCity = rawCity;
  }

  return (
    <html lang="tr" className={outfit.className}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: minifiedCss }} />
      </head>
      <body>
        <GeoBanner detectedCityName={detectedCity} />
        <TopBar />
        <Header />
        <main>{children}</main>
        <Footer />
        <ChatBot />
        <CookieConsent />
      </body>
    </html>
  );
}
