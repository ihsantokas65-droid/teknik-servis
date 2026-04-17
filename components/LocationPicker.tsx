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
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 950 }}>Bölgenizi seçin</div>
      <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
        Şehir + ilçe + hizmet seçerek doğrudan servis sayfasına gidin.
      </div>

      <div className="grid" style={{ marginTop: 12 }}>
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
          <label htmlFor="brand-select" className="label">Marka</label>
          <select id="brand-select" className="select" value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)}>
            {topBrands.map((b) => (
              <option key={b.label} value={b.slug}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button type="button" className="btn focus-ring" onClick={go}>
          Servis Sayfasına Git
        </button>
      </div>
    </div>
  );
}

