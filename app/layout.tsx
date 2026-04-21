import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Script from "next/script";
import { site } from "@/lib/site";
import { Outfit } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { headers } from "next/headers";

const outfit = Outfit({ 
  subsets: ["latin", "latin-ext"], 
  display: "swap" 
});


const ChatBot = dynamic(() => import("@/components/ChatBot").then((mod) => mod.ChatBot));
const CookieConsent = dynamic(() => import("@/components/CookieConsent").then((mod) => mod.CookieConsent), { ssr: false });
const LocationSuggest = dynamic(() => import("@/components/LocationSuggest").then((mod) => mod.LocationSuggest), { ssr: false });
const FloatingCall = dynamic(() => import("@/components/FloatingCall").then((mod) => mod.FloatingCall), { ssr: false });
const GTM_ID = "GTM-54KMZ2CX";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Yetkili Kombi Servisi",
    template: `%s | Yetkili Kombi Servisi`
  },
  description: site.description,
  applicationName: "Yetkili Kombi Servisi",
  icons: {
    icon: [{ url: "/images/branding/yetkili-kombi-servisi-logo.png", type: "image/png" }]
  }
};

const minifiedCss = `
:root{--bg:#F4F7F6;--surface:#ffffff;--text:#1d211c;--muted:#64748b;--brand:#F26522;--brand-700:#d94e10;--brand-900:#1A2B3C;--brand-soft:rgba(242,101,34,0.08);--accent:#2563eb;--accent-2:#1e3a8a;--border:#e2e8f0;--ring:rgba(242,101,34,0.4);--radius:16px;--shadow-sm:0 1px 3px rgba(26,43,60,0.05),0 1px 2px rgba(26,43,60,0.02);--shadow:0 20px 25px -5px rgba(26,43,60,0.1),0 8px 10px -6px rgba(26,43,60,0.1)}
@keyframes reveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
*{box-sizing:border-box}
html,body{height:100%;overflow-x:hidden !important;width:100% !important;position:relative}
body{margin:0;color:var(--text);background:var(--bg);font-family:inherit;line-height:1.6;-webkit-font-smoothing:antialiased}
img,video{max-width:100%;height:auto}
main{min-height:70vh}
a{color:inherit;text-decoration:none;transition:all 0.2s ease}
a:hover{color:var(--accent)}
.muted{color:var(--muted)}
.container{width:100%;max-width:1200px;margin:0 auto;padding:0 24px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-sm);overflow:hidden;transition:all 0.2s ease}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:14px 28px;border-radius:8px;background:var(--brand);color:var(--brand-900);font-weight:800;border:none;transition:all 0.2s ease;cursor:pointer;box-shadow:0 4px 0 var(--brand-700)}
.btn:hover{background:var(--brand-700);color:white}
.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:4px;background:var(--brand-soft);border:1px solid var(--brand);color:var(--brand-900);font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:1px}
.input, .select, .textarea {
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--border);
  color: var(--brand-900);
  transition: all 0.2s;
  font-size: 15px;
  font-family: inherit !important;
  font-weight: 500;
}
.select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 48px !important;
  cursor: pointer;
}
.input:focus, .select:focus, .textarea:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-soft);
  outline: none;
}
.label {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  display: block;
  color: var(--brand-900);
  font-family: inherit !important;
}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}
.h1{font-size:56px;line-height:1.1;margin:0;letter-spacing:-2px;color:var(--brand-900);font-weight:900}
.h2{font-size:36px;line-height:1.2;margin:0;letter-spacing:-1px}
.h3{font-size:20px;line-height:1.4;margin:0;font-weight:800}
.section{padding:80px 0;animation:reveal 0.8s ease backwards}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:24px}
@media (max-width:1100px){
  .grid{grid-template-columns:repeat(auto-fit, minmax(280px, 1fr))!important}
  .grid > [style*="span"] { grid-column: span 12 !important; }
}
@media (max-width:768px){
  .grid{display:flex !important;flex-direction:column !important;gap:16px !important}
  .container{padding:0 16px !important}
  .h1{font-size:32px;letter-spacing:-1px}
  .section{padding:40px 0}
  .desktopOnly{display:none !important}
}
@media (min-width:769px){
  .mobileOnly{display:none !important}
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const detectedCity = headersList.get("x-vercel-ip-city") || "";

  return (
    <html lang="tr" className={outfit.className}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <Script
          id="google-tag"
          src="https://www.googletagmanager.com/gtag/js?id=G-484KPLZHJC"
          strategy="afterInteractive"
        />
        <Script id="google-tag-config" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-484KPLZHJC');`}
        </Script>
        <style dangerouslySetInnerHTML={{ __html: minifiedCss }} />
        <link rel="alternate" type="application/rss+xml" title={`${site.name} RSS`} href="/feed" />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <TopBar />
        <Header />
        <main>{children}</main>

        <ChatBot />
        <CookieConsent />
        <LocationSuggest ipCity={detectedCity} />
        <FloatingCall />
      </body>
    </html>
  );
}
