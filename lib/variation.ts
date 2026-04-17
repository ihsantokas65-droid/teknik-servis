function fnv1a32(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export function createRng(seedKey: string): Rng {
  return mulberry32(fnv1a32(seedKey));
}

export function randInt(rng: Rng, minInclusive: number, maxInclusive: number) {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxInclusive);
  if (max < min) throw new Error("randInt() invalid range");
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pickOne<T>(rng: Rng, items: T[]) {
  if (items.length === 0) throw new Error("pickOne() items is empty");
  return items[randInt(rng, 0, items.length - 1)];
}

export function shuffle<T>(rng: Rng, items: T[]) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickManyUnique<T>(rng: Rng, items: T[], count: number) {
  if (count <= 0) return [];
  return shuffle(rng, items).slice(0, Math.min(count, items.length));
}

