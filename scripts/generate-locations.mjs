import fs from "node:fs/promises";
import path from "node:path";

function slugifyTR(value) {
  const map = {
    ı: "i",
    İ: "i",
    i: "i",
    I: "i",
    ş: "s",
    Ş: "s",
    ğ: "g",
    Ğ: "g",
    ü: "u",
    Ü: "u",
    ö: "o",
    Ö: "o",
    ç: "c",
    Ç: "c"
  };

  const replaced = String(value)
    .trim()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase();

  return replaced
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function titleCaseTR(value) {
  const cleaned = String(value).replace(/\s+/g, " ").trim();
  if (!cleaned) return "";

  return cleaned
    .split(" ")
    .map((part) => {
      const lower = part.toLocaleLowerCase("tr-TR");
      return lower.charAt(0).toLocaleUpperCase("tr-TR") + lower.slice(1);
    })
    .join(" ");
}

function uniq(arr) {
  return [...new Set(arr)];
}

async function main() {
  const root = process.cwd();
  const inputPath = path.join(root, "data", "legacy", "turkey-cities.json");
  const outMapPath = path.join(root, "data", "legacy", "city_district_map.json");
  const outNamesPath = path.join(root, "data", "legacy", "district_display_names.json");

  const raw = await fs.readFile(inputPath, "utf8");
  const cities = JSON.parse(raw);

  const cityDistrictMap = {};
  const districtNames = {};

  for (const c of cities) {
    const citySlug = slugifyTR(c.name);
    const counties = Array.isArray(c.counties) ? c.counties : [];

    const slugs = uniq(counties.map((x) => slugifyTR(x)).filter(Boolean));
    cityDistrictMap[citySlug] = slugs.length ? slugs : "merkez";

    const nameMap = {};
    for (const county of counties) {
      const dSlug = slugifyTR(county);
      if (!dSlug) continue;
      nameMap[dSlug] = titleCaseTR(county);
    }
    districtNames[citySlug] = nameMap;
  }

  // Deterministic ordering
  const sortedCityKeys = Object.keys(cityDistrictMap).sort((a, b) => a.localeCompare(b, "tr-TR"));
  const sortedMap = {};
  const sortedNames = {};
  for (const k of sortedCityKeys) {
    sortedMap[k] = cityDistrictMap[k];
    const names = districtNames[k] ?? {};
    const sortedDistrictKeys = Object.keys(names).sort((a, b) => a.localeCompare(b, "tr-TR"));
    const sortedDistrictNames = {};
    for (const dk of sortedDistrictKeys) sortedDistrictNames[dk] = names[dk];
    sortedNames[k] = sortedDistrictNames;
  }

  await fs.writeFile(outMapPath, JSON.stringify(sortedMap, null, 2), "utf8");
  await fs.writeFile(outNamesPath, JSON.stringify(sortedNames, null, 2), "utf8");

  console.log("Wrote:", path.relative(root, outMapPath), "and", path.relative(root, outNamesPath));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

