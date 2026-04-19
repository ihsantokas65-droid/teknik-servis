"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { City } from "@/lib/geo";
import { services } from "@/lib/services";

const topBrands = [
  { slug: "", label: "Seçiniz (İsteğe Bağlı)" },
  { slug: "arcelik", label: "Arçelik" },
  { slug: "beko", label: "Beko" },
  { slug: "bosch", label: "Bosch" },
  { slug: "demirdokum", label: "DemirDöküm" },
  { slug: "vaillant", label: "Vaillant" },
  { slug: "baymak", label: "Baymak" },
  { slug: "samsung", label: "Samsung" },
  { slug: "lg", label: "LG" },
  { slug: "vestel", label: "Vestel" }
];

export function LocationPicker({ cities }: { cities: City[] }) {
  const router = useRouter();

  const [citySlug, setCitySlug] = useState<string>(cities[0]?.slug ?? "");
  const [districtSlug, setDistrictSlug] = useState<string>(cities[0]?.districts[0]?.slug ?? "merkez");
  const [serviceSlug, setServiceSlug] = useState<string>(services[0]?.slug ?? "kombi-servisi");
  const [brandSlug, setBrandSlug] = useState<string>("");

  const selectedCity = useMemo(() => cities.find((c) => c.slug === citySlug) ?? null, [cities, citySlug]);
  const districts = selectedCity?.districts ?? [];

  function onCityChange(nextCity: string) {
    setCitySlug(nextCity);
    const firstDistrict = cities.find((c) => c.slug === nextCity)?.districts?.[0]?.slug ?? "merkez";
    setDistrictSlug(firstDistrict);
  }

  function go() {
    if (!citySlug) return;
    const url = `/${citySlug}/${districtSlug}/${serviceSlug}${brandSlug ? `?marka=${brandSlug}` : ""}`;
    router.push(url);
  }

  return (
    <div className="location-picker-card" style={{ padding: "clamp(20px, 4vw, 32px)", background: "white", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "var(--shadow-sm)" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1000px) {
          .location-picker-card .grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .location-picker-card .grid {
            display: flex !important;
            flex-direction: column !important;
          }
          .location-picker-card { border-radius: 16px; }
        }
      `}} />

      <div style={{ fontWeight: 950, fontSize: 20, color: "var(--brand-900)", letterSpacing: "-0.5px" }}>Bölgenizi Seçin</div>
      <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
        Şehir, ilçe ve hizmet seçerek doğrudan servis sayfasına gidin.
      </div>

      <div className="grid" style={{ marginTop: 24, gap: 16 }}>
        <div className="field" style={{ gridColumn: "span 3" }}>
          <label htmlFor="city-select" className="label">Şehir</label>
          <select id="city-select" className="select" value={citySlug} onChange={(e) => onCityChange(e.target.value)}>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "span 3" }}>
          <label htmlFor="district-select" className="label">İlçe</label>
          <select id="district-select" className="select" value={districtSlug} onChange={(e) => setDistrictSlug(e.target.value)}>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "span 3" }}>
          <label htmlFor="service-select" className="label">Hizmet</label>
          <select id="service-select" className="select" value={serviceSlug} onChange={(e) => setServiceSlug(e.target.value)}>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "span 3" }}>
          <label htmlFor="brand-select" className="label">Marka (Opsiyonel)</label>
          <select id="brand-select" className="select" value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)}>
            {topBrands.map((b) => (
              <option key={b.label} value={b.slug}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button type="button" className="btn shadow-lg" onClick={go} style={{ width: "100%", height: 56, justifyContent: "center", fontSize: 16 }}>
          Hemen Servis Sayfasına Git
        </button>
      </div>
    </div>
  );
}

