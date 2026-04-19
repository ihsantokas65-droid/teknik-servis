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
        .location-picker-card select {
          appearance: none;
          background-size: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding: 14px 40px 14px 16px !important;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          color: var(--brand-900);
          font-weight: 500;
          border-radius: 12px;
          border: 1px solid var(--border);
          transition: all 0.2s ease;
          width: 100%;
        }
        .location-picker-card select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 4px var(--brand-soft);
          outline: none;
        }
        .location-picker-card label {
          font-family: inherit;
          font-weight: 700;
          color: var(--brand-900);
          margin-bottom: 8px;
          display: block;
          font-size: 13px;
        }
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
          <label htmlFor="city-select">Şehir</label>
          <select id="city-select" value={citySlug} onChange={(e) => onCityChange(e.target.value)}>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "span 3" }}>
          <label htmlFor="district-select">İlçe</label>
          <select id="district-select" value={districtSlug} onChange={(e) => setDistrictSlug(e.target.value)}>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "span 3" }}>
          <label htmlFor="service-select">Hizmet</label>
          <select id="service-select" value={serviceSlug} onChange={(e) => setServiceSlug(e.target.value)}>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "span 3" }}>
          <label htmlFor="brand-select">Marka (Opsiyonel)</label>
          <select id="brand-select" value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)}>
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

