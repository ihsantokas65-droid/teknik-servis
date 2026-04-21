import { Container } from "@/components/Container";
import Image from "next/image";
import { site } from "@/lib/site";
import Link from "next/link";
import {
  AlertTriangle,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Building2,
  Wrench,
  ShieldCheck,
  FileText,
  Lock,
  Globe,
  BarChart2,
  Bot,
  Rss,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { type City, type District } from "@/lib/geo";
import { type Brand } from "@/lib/brands";
import { type BlogArticle } from "@/lib/blog";

type FooterProps = {
  city?: City | null;
  district?: District | null;
  brand?: Brand | null;
  relatedBlogs?: BlogArticle[];
  variant?: "home" | "city" | "district" | "brand" | "blog" | "standard";
};

export function Footer({ 
  city, 
  district, 
  brand, 
  relatedBlogs, 
  variant = "standard" 
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Dynamic branding text based on location
  const locationName = district ? `${city?.name} ${district.name}` : city?.name || "";
  const brandContext = locationName 
    ? brand 
      ? `${brand.name} ${locationName} Teknik Servis`
      : `${locationName} Yetkili Teknik Servis Merkezi`
    : site.businessName;

  // Dynamic Map URL calculation
  const defaultMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3122.3988788506485!2d43.375358175770515!3d38.501510571811124!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!3m3!1m2!1s0x4012707200502a49%3A0x1da89ecc636aa36e!2sAlipa%C5%9Fa%2C%20Suvaro%C4%1Flu%20Cd%20No%3A6%2C%2065130%20Van%20Merkez%2FVan!5e0!3m2!1str!2str!4v1776280064609!5m2!1str!2str";
  const mapQuery = locationName 
    ? brand 
      ? `${brand.name} Servisi ${locationName}`
      : `Yetkili Kombi Servisi ${locationName}`
    : "";
  
  const mapUrl = mapQuery 
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed` 
    : defaultMapUrl;

  return (

    <footer 
      style={{ 
        background: "var(--bg)", 
        color: "var(--text)", 
        padding: "60px 0 20px", 
        marginTop: 60,
        fontFamily: "inherit",
        borderTop: "1px solid var(--border)"
      }}
    >
      <Container>
        {/* 1. Yasal Uyarı Bölümü (Google Ads Policy Compliance) */}
        <div id="legal-disclaimer" style={{ 
          background: "rgba(240, 68, 56, 0.05)", 
          border: "2px solid #D92D20", 
          borderRadius: 16, 
          padding: "32px", 
          marginBottom: 60,
          display: "flex", 
          gap: 24,
          alignItems: "flex-start",
          boxShadow: "0 4px 20px rgba(217, 45, 32, 0.08)"
        }}>
          <div style={{ color: "#D92D20", flexShrink: 0 }}><AlertTriangle size={32} /></div>
          <div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              marginBottom: 12 
            }}>
              <span style={{ 
                background: "#D92D20", 
                color: "white", 
                padding: "4px 12px", 
                borderRadius: 6, 
                fontSize: 12, 
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 1
              }}>Bağımsız Özel Servis</span>
              <strong style={{ color: "#991B1B", fontSize: 18, fontWeight: 950 }}>Yasal Bilgilendirme</strong>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: "#7F1D1D", fontWeight: 500 }}>
              <p style={{ margin: 0 }}>
                <strong>{brandContext || "Yetkili Kombi Servisi"}</strong> markası ve bu web sitesi, herhangi bir beyaz eşya, kombi veya klima markasının <strong>yetkili satıcısı, bayisi veya yetkili servisi DEĞİLDİR.</strong> 
                {site.businessName}, tam bağımsız bir <strong>Özel Teknik Servis</strong> kuruluşu olup, markalarla resmi bir bağı bulunmamaktadır.
              </p>
              <p style={{ margin: "12px 0 0 0" }}>
                Sitemizde yer alan marka logoları ve isimleri bilgi amaçlı olup, hakları ilgili marka sahiplerine aittir. 
                Servisimiz, garanti süresi dolmuş veya garanti dışı kalmış cihazlara, müşteri talebiyle <strong>ücretli özel teknik destek</strong> sağlamaktadır. 
                Yapılan tüm işlemler {site.businessName} güvencesiyle 1 yıl parça ve işçilik garantilidir.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Ana Link Izgarası */}
        <div className="grid" style={{ gap: 40, marginBottom: 80 }}>
          <div style={{ gridColumn: "span 4" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ position: "relative", width: 44, height: 44 }}>
                <Image 
                  src="/images/branding/yetkili-kombi-servisi-logo.png" 
                  alt={site.name} 
                  fill 
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div style={{ display: "grid", gap: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 20, color: "var(--brand-900)", lineHeight: 1.1 }}>{site.name.toLocaleUpperCase("tr-TR")}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.2 }}>{site.businessName.toLocaleUpperCase("tr-TR")}</div>
              </div>
            </Link>
            <p style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.7, marginBottom: 24 }}>
              <strong style={{ color: "var(--brand-900)" }}>{brandContext}</strong>, {locationName ? `${locationName} bölgesinde ` : ""}beyaz eşya, kombi ve klima servis alanında bağımsız servis hizmeti sunar. 
              Şeffaf bilgilendirme anlayışımızla müşterilerimize güvenilir bir servis süreci yaşatıyoruz.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <SocialIcon
                href="https://www.facebook.com"
                label="Facebook"
                icon={<FacebookIcon />}
              />
              <SocialIcon
                href="https://www.instagram.com"
                label="Instagram"
                icon={<InstagramIcon />}
              />
              <SocialIcon
                href="https://x.com"
                label="X"
                icon={<XIcon />}
              />
              <SocialIcon
                href={`https://wa.me/${site.whatsapp.replace(/[^\d]/g, "")}`}
                label="WhatsApp"
                icon={<WhatsAppIcon />}
              />
            </div>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <h4 style={ColumnTitleStyle}>Hızlı Linkler</h4>
            <div style={ListGridStyle}>
              <FooterLink href="/" label="Ana Sayfa" />
              <FooterLink href="/hizmetler/beyaz-esya-servisi" label="Beyaz Eşya Servisi" />
              <FooterLink href="/hizmetler/kombi-servisi" label="Kombi Servisi" />
              <FooterLink href="/hizmetler/klima-servisi" label="Klima Servisi" />
              <FooterLink href="/servis-bolgelerimiz" label="Servis Bölgelerimiz" />
              <FooterLink href="/servis-ucretleri" label="Servis Ücretleri" />
              <FooterLink href="/hakkimizda" label="Hakkımızda" />
              <FooterLink href="/iletisim" label="İletişim" />
            </div>
          </div>

          <div style={{ gridColumn: "span 3" }}>
            <h4 style={ColumnTitleStyle}>Kurumsal</h4>
            <div style={ListGridStyle}>
              <FooterLink href="/hakkimizda" label="Hakkımızda" />
              <FooterLink href="/servis-ucretleri" label="Servis Ücretleri" />
              <FooterLink href="/cerez-politikasi" label="Çerez Politikası" />
              <FooterLink href="/kvkk-aydinlatma-metni" label="KVKK Aydınlatma" />
              <FooterLink href="/iptal-iade-politikasi" label="İptal ve İade" />
              <FooterLink href="/gizlilik-politikasi" label="Gizlilik Politikası" />
              <FooterLink href="/kullanim-kosullari" label="Kullanım Şartları" />
            </div>
          </div>

          <div style={{ gridColumn: "span 3" }}>
            <h4 style={ColumnTitleStyle}>İletişim</h4>
            <div style={{ display: "grid", gap: 16 }}>
              <ContactBlock icon={<PhoneCall size={18} />} title="Çağrı Merkezi" value={site.phone} />
              <ContactBlock icon={<Mail size={18} />} title="E-posta" value={site.email} />
              <ContactBlock icon={<MapPin size={18} />} title="Merkez Ofis" value={`${site.address.city}/${site.address.region}`} />
            </div>
            
            <div style={{ 
              marginTop: 32, 
              padding: 16, 
              background: "white", 
              borderRadius: 12, 
              border: "1px solid var(--border)",
              fontSize: 11,
              color: "var(--muted)",
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 800, color: "var(--brand-900)", marginBottom: 8, fontSize: 12 }}>Kurumsal Veriler</div>
              <div><strong>Firma:</strong> {site.corporate.legalName}</div>
              <div><strong>Mersis:</strong> {site.corporate.mersisNumber}</div>
              <div><strong>Vergi Dairesi:</strong> {site.corporate.taxOffice}</div>
              <div><strong>Vergi No:</strong> {site.corporate.taxNumber}</div>
              <div style={{ marginTop: 8, fontSize: 10, fontStyle: "italic" }}>* Bu işletme <strong>&quot;{site.businessName}&quot;</strong> tescilli markasıyla özel servis hizmeti vermektedir.</div>
            </div>
          </div>
        </div>

        {relatedBlogs && relatedBlogs.length > 0 && (
          <div style={{ 
            background: "var(--bg-alt)", 
            borderRadius: 20, 
            padding: 32, 
            marginBottom: 24,
            border: "1px solid var(--border)" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 950, color: "var(--brand-900)", display: "flex", alignItems: "center", gap: 10 }}>
                <BookOpen size={22} color="var(--brand)" /> Popüler Teknik Rehberler
              </h4>
              <Link href="/blog" style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)" }}>Tümünü Gör →</Link>
            </div>
            <div className="grid">
              {relatedBlogs.map((blog) => (
                <Link 
                  key={blog.slug} 
                  href={`/blog/${blog.slug}`} 
                  className="card hover" 
                  style={{ gridColumn: "span 3", background: "white", padding: 16, display: "flex", gap: 12, alignItems: "center", textDecoration: "none" }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)", flexShrink: 0 }}></div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>{blog.title}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {city && city.districts && city.districts.length > 0 && (
          <div style={{ 
            background: "white", 
            borderRadius: 20, 
            padding: 32, 
            marginBottom: 60,
            border: "1px solid var(--border)" 
          }}>
            <h4 style={{ margin: "0 0 24px 0", fontSize: 18, fontWeight: 950, color: "var(--brand-900)", display: "flex", alignItems: "center", gap: 10 }}>
              <MapPin size={22} color="var(--brand)" /> {city.name} Yakın Hizmet Noktaları
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {city.districts.slice(0, 15).map((d) => (
                <Link 
                  key={d.slug} 
                  href={`/${city.slug}/${d.slug}`}
                  style={{ 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: "var(--muted)", 
                    padding: "8px 16px", 
                    borderRadius: 30, 
                    background: "var(--bg-alt)",
                    border: "1px solid var(--border)",
                    transition: "all 0.2s"
                  }}
                  className="hover-brand"
                >
                  {d.name}
                </Link>
              ))}
              <Link href={`/${city.slug}`} style={{ fontSize: 13, fontWeight: 800, color: "var(--brand)", padding: "8px 16px" }}>
                Tüm İlçeler →
              </Link>
            </div>
          </div>
        )}

        {/* 3. Firma Bilgileri ve Harita Bölümü */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 60 }}>
          <div className="card" style={{ background: "var(--surface)", padding: 32, borderColor: "var(--border)", borderRadius: 16, boxShadow: "var(--shadow-sm)", gridColumn: "span 2", minWidth: 0 }}>
            <h4 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, borderLeft: "4px solid var(--brand)", paddingLeft: 16, color: "var(--brand-900)" }}>
              {brandContext.toLocaleUpperCase("tr-TR")}
            </h4>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 32, paddingLeft: 20 }}>
              {locationName ? `${locationName} bölgesine özel ` : ""}teknik servis çözümleri, uzman kadro ve garantili yedek parça desteği.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <InfoBox icon={<Building2 size={20} />} label="Hizmet Adı" value={brandContext} />
              <InfoBox icon={<PhoneCall size={20} />} label="Yerel Destek Hattı" value={site.phone} />
              <InfoBox icon={<Mail size={20} />} label="E-posta" value={site.email} />
              <InfoBox icon={<Wrench size={20} />} label="Kapsam" value={brand ? `${brand.name} Marka Uzmanlığı` : "Genel Teknik Servis"} />
              <div style={{ gridColumn: "1 / -1" }}>
                <InfoBox icon={<MapPin size={20} />} label="Bölge Ofisi" value={`${site.address.street} ${site.address.city}/${site.address.region}`} />
              </div>
            </div>
          </div>

          <div className="card" style={{ background: "var(--surface)", padding: 24, borderColor: "var(--border)", borderRadius: 16, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}>
             <h4 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 900, color: "var(--brand-900)" }}>{locationName || site.name} Saha Haritası</h4>
             <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>{locationName ? `${locationName} çevresindeki ` : ""}merkez ofisimizi harita üzerinden görüntüleyebilirsiniz.</p>
             
             <div style={{ position: "relative", width: "100%", height: 350, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 20, background: "#f1f5f9" }}>
               <iframe 
                  src={mapUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, display: "block" }} 
                  allowFullScreen={true}
                  loading="lazy" 
                  title="Saha Haritası"
                ></iframe>
             </div>

             <Link 
               href="https://www.google.com/maps/dir/?api=1&destination=38.5015106,43.3753582" 
               target="_blank"
               className="btn" 
               style={{ width: "100%", textAlign: "center", borderRadius: 30, padding: "12px 0", fontSize: 14, fontWeight: 700 }}
             >
               Yol Tarifi Al
             </Link>
          </div>
        </div>


        {/* 4. Alt Bilgi Çubuğu */}
        <div style={{ 
          borderTop: "1px solid var(--border)", 
          paddingTop: 30,
          paddingBottom: 80, // Space for ChatBot mobile sticky bar
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20
        }}>
          <div style={{ fontSize: 13, color: "var(--muted)", flex: "1 0 100%", textAlign: "center", order: 2 }}>
            © {currentYear} <strong style={{ color: "var(--brand-900)" }}>{site.businessName}</strong>. Tüm hakları saklıdır.
          </div>

          <div style={{ display: "flex", gap: 20, fontSize: 13, fontWeight: 700, alignItems: "center", flexWrap: "wrap", justifyContent: "center", order: 1, width: "100%" }}>
             <LegalLink href="/gizlilik-politikasi" label="Gizlilik Politikası" icon={<ShieldCheck size={14} />} />
             <LegalLink href="/kullanim-kosullari" label="Kullanım Koşulları" icon={<FileText size={14} />} />
             <LegalLink href="/kvkk-aydinlatma-metni" label="KVKK" icon={<Lock size={14} />} />
             <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }}></div>
             <UtilityLink href="/sitemap" label="Sitemap" icon={<Globe size={14} />} />
             <UtilityLink href="/sitemap.xml" label="Sitemap (XML)" icon={<BarChart2 size={14} />} />
             <UtilityLink href="/llms.txt" label="LLMs.txt" icon={<Bot size={14} />} />
             <UtilityLink href="/feed" label="RSS" icon={<Rss size={14} />} />
          </div>
        </div>
      </Container>
    </footer>
  );
}

const ColumnTitleStyle = {
  fontWeight: 900,
  fontSize: 16,
  marginBottom: 24,
  display: "flex",
  alignItems: "center",
  gap: 12,
  borderLeft: "3px solid var(--brand)",
  paddingLeft: 12
};

const ListGridStyle = {
  display: "grid",
  gap: 14,
  fontSize: 14
};

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="focus-ring" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text)", opacity: 0.8 }}>
      <span style={{ color: "var(--brand-700)", fontSize: 12 }}>✔</span> {label}
    </Link>
  );
}

function ContactBlock({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
       <div style={{ 
         width: 40, height: 40, borderRadius: 8, background: "var(--brand-soft)", 
         display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-900)",
         flexShrink: 0
       }}>{icon}</div>
       <div>
         <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>{title}</div>
         <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{value}</div>
       </div>
    </div>
  );
}

function CorporateInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(0,0,0,0.1)", padding: 12, borderRadius: 8 }}>
       <div style={{ color: "var(--brand-900)", opacity: 0.8 }}>{icon}</div>
       <div>
         <div style={{ fontSize: 10, opacity: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
         <div style={{ fontSize: 13, fontWeight: 700 }}>{value}</div>
       </div>
    </div>
  );
}

function SocialIcon({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="focus-ring"
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .2s",
        color: "var(--brand-900)",
        textDecoration: "none"
      }}
    >
      {icon}
    </Link>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M14 8.5h2.2V5.8H14c-2.1 0-3.5 1.4-3.5 3.7V11H8.2v2.8h2.3V19h2.8v-5.2h2.3L16 11h-2.7V9.7c0-.8.4-1.2 1.2-1.2Z" fill="currentColor" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.4" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M5 5h3.3l5 6.6L18.5 5H20l-5.7 7.4L20 19h-3.3l-4.9-6.5L6.5 19H5l5.6-7.3L5 5Z" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M12 4.5A7.5 7.5 0 0 0 5 15.1L4 19l3.9-1A7.5 7.5 0 1 0 12 4.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.6 9.4c.2-.3.4-.4.7-.4h.5c.3 0 .5.2.6.5l.4 1c.1.3 0 .6-.2.8l-.4.4c.5 1 1.3 1.8 2.3 2.3l.4-.4c.2-.2.5-.3.8-.2l1 .4c.3.1.5.3.5.6v.5c0 .3-.1.5-.4.7-.4.3-.9.4-1.4.3-2.9-.6-5.2-2.9-5.8-5.8-.1-.5 0-1 .3-1.4Z" fill="currentColor" />
    </svg>
  );
}

function LegalLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontWeight: 500 }}>
      <span style={{ display: "flex" }}>{icon}</span> {label}
    </Link>
  );
}

function UtilityLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--brand-900)", fontWeight: 700 }}>
      <span style={{ display: "flex" }}>{icon}</span> {label}
    </Link>
  );
}
function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ 
      background: "var(--bg)", 
      border: "1px solid var(--border)",
      padding: "16px 20px", 
      borderRadius: 12, 
      display: "flex", 
      gap: 16, 
      alignItems: "center",
      height: "100%"
    }}>
      <div style={{ width: 40, height: 40, background: "var(--brand-soft)", borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-900)" }}>
        {icon}
      </div>
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", wordBreak: "break-word" }}>{value}</div>
      </div>
    </div>
  );
}
