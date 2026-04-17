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
:root{--bg:#F4F7F6;--surface:#ffffff;--text:#1d211c;--muted:#64748b;--brand:#F26522;--brand-700:#d94e10;--brand-900:#1A2B3C;--brand-soft:rgba(242,101,34,0.08);--accent:#2563eb;--accent-2:#1e3a8a;--border:#e2e8f0;--ring:rgba(242,101,34,0.4);--radius:16px;--shadow-sm:0 1px 3px rgba(26,43,60,0.05),0 1px 2px rgba(26,43,60,0.02);--shadow:0 20px 25px -5px rgba(26,43,60,0.1),0 8px 10px -6px rgba(26,43,60,0.1)}@keyframes reveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}img,video{max-width:100%;height:auto}html,body{height:100%;overflow-x:hidden;position:relative;width:100%}body{margin:0;color:var(--text);background:var(--bg);font-family:inherit;line-height:1.6;-webkit-font-smoothing:antialiased}main{min-height:70vh}a{color:inherit;text-decoration:none;transition:all 0.2s ease}a:hover{color:var(--accent)}.muted{color:var(--muted)}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.focus-ring:focus-visible{outline:3px solid var(--ring);outline-offset:2px}.container{max-width:1200px;margin:0 auto;padding:0 32px;width:100%;position:relative;display:flow-root}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={outfit.className}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: minifiedCss }} />
      </head>
      <body>
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
