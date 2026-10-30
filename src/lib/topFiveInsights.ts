export type Region = "US West Coast" | "US East Coast" | "US South" | "US Midwest" | "International";

const WEST = ["CA", "CALIFORNIA", "WA", "WASHINGTON", "OR", "OREGON", "NV", "NEVADA", "AZ", "ARIZONA", "HI", "HAWAII", "AK", "ALASKA", "CO", "COLORADO", "UT", "UTAH", "NM", "NEW MEXICO", "ID", "IDAHO", "MT", "MONTANA", "WY", "WYOMING"];
const EAST = ["NY", "NEW YORK", "NJ", "NEW JERSEY", "PA", "PENNSYLVANIA", "MA", "MASSACHUSETTS", "CT", "CONNECTICUT", "RI", "RHODE ISLAND", "MD", "MARYLAND", "DE", "DELAWARE", "DC", "D.C.", "WASHINGTON, D.C.", "VT", "VERMONT", "NH", "NEW HAMPSHIRE", "ME", "MAINE"];
const SOUTH = ["GA", "GEORGIA", "TX", "TEXAS", "FL", "FLORIDA", "LA", "LOUISIANA", "TN", "TENNESSEE", "AL", "ALABAMA", "MS", "MISSISSIPPI", "NC", "NORTH CAROLINA", "SC", "SOUTH CAROLINA", "VA", "VIRGINIA", "KY", "KENTUCKY", "AR", "ARKANSAS", "OK", "OKLAHOMA", "WV", "WEST VIRGINIA"];
const MIDWEST = ["IL", "ILLINOIS", "MI", "MICHIGAN", "OH", "OHIO", "MO", "MISSOURI", "MN", "MINNESOTA", "WI", "WISCONSIN", "IN", "INDIANA", "IA", "IOWA", "KS", "KANSAS", "NE", "NEBRASKA", "ND", "NORTH DAKOTA", "SD", "SOUTH DAKOTA"];
const CITIES: Record<string, Region> = {
  "LOS ANGELES": "US West Coast", "COMPTON": "US West Coast", "OAKLAND": "US West Coast", "SAN FRANCISCO": "US West Coast", "LONG BEACH": "US West Coast", "SEATTLE": "US West Coast",
  "BROOKLYN": "US East Coast", "QUEENS": "US East Coast", "BRONX": "US East Coast", "HARLEM": "US East Coast", "HARLEM, NY": "US East Coast", "PHILADELPHIA": "US East Coast", "BOSTON": "US East Coast", "BALTIMORE": "US East Coast", "NEWARK": "US East Coast", "WASHINGTON, D.C.": "US East Coast",
  "ATLANTA": "US South", "HOUSTON": "US South", "NEW ORLEANS": "US South", "MEMPHIS": "US South", "MIAMI": "US South", "DALLAS": "US South",
  "CHICAGO": "US Midwest", "DETROIT": "US Midwest", "CLEVELAND": "US Midwest", "ST. LOUIS": "US Midwest", "MINNEAPOLIS": "US Midwest", "KANSAS CITY": "US Midwest", "MILWAUKEE": "US Midwest",
};

export function classifyRegion(origin: string | null | undefined): Region | null {
  if (!origin) return null;
  const o = origin.trim().toUpperCase();
  if (CITIES[o]) return CITIES[o];
  if (o.includes("D.C.") || o.includes("DC")) return "US East Coast";
  const parts = o.split(",").map((p) => p.trim()).filter(Boolean);
  const last = parts[parts.length - 1];
  if (parts.length > 1) {
    if (WEST.includes(last)) return "US West Coast";
    if (EAST.includes(last)) return "US East Coast";
    if (SOUTH.includes(last)) return "US South";
    if (MIDWEST.includes(last)) return "US Midwest";
    if (last === "USA" || last === "US") return CITIES[parts[0]] ?? null;
    return "International";
  }
  if (WEST.includes(o)) return "US West Coast";
  if (EAST.includes(o)) return "US East Coast";
  if (SOUTH.includes(o)) return "US South";
  if (MIDWEST.includes(o)) return "US Midwest";
  return null;
}

/** A region wins only if 3+ rappers share it; otherwise "Balanced". */
export function favoriteRegion(origins: (string | null | undefined)[]): Region | "Balanced" | null {
  const counts: Record<string, number> = {};
  let known = 0;
  for (const o of origins) {
    const r = classifyRegion(o);
    if (r) { counts[r] = (counts[r] || 0) + 1; known++; }
  }
  if (known === 0) return null;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top[1] > 2 ? (top[0] as Region) : "Balanced";
}

export function rapperAge(birthYear: number | null, deathYear: number | null, now = new Date().getFullYear()): number | null {
  if (!birthYear) return null;
  return (deathYear ?? now) - birthYear;
}

export function topStyles(tagLists: string[][], n = 3): string[] {
  const counts: Record<string, number> = {};
  tagLists.flat().forEach((t) => (counts[t] = (counts[t] || 0) + 1));
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n).map(([t]) => t);
}

export function average(values: (number | null | undefined)[]): number | null {
  const v = values.filter((x): x is number => typeof x === "number" && !isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}
