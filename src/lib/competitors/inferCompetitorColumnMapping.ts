/**
 * Infers which spreadsheet columns correspond to standard competitor fields
 * using normalized exact/substring match, Levenshtein similarity, and optional
 * value-shape hints (URL vs text) for single-column or fallback cases.
 */

export type StandardCompetitorField =
  | "name"
  | "website"
  | "description"
  | "logo";

export type InferredCompetitorColumnMapping = Record<
  StandardCompetitorField,
  string | null
>;

const NAME_SYNONYMS = [
  "name",
  "competitor",
  "company",
  "organization",
  "org",
  "brand",
  "business",
  "competitorname",
  "companyname",
  "businessname",
  "firm",
  "title",
  "label",
];

const WEBSITE_SYNONYMS = [
  "website",
  "url",
  "site",
  "web",
  "homepage",
  "domain",
  "link",
  "uri",
  "webpage",
];

const DESCRIPTION_SYNONYMS = [
  "description",
  "desc",
  "notes",
  "about",
  "summary",
  "details",
  "info",
  "overview",
  "bio",
];

const LOGO_SYNONYMS = [
  "logo",
  "logoimage",
  "logourl",
  "favicon",
  "icon",
  "image",
  "avatar",
  "picture",
  "photo",
];

const ROLE_SYNONYMS: Record<StandardCompetitorField, readonly string[]> = {
  name: NAME_SYNONYMS,
  website: WEBSITE_SYNONYMS,
  description: DESCRIPTION_SYNONYMS,
  logo: LOGO_SYNONYMS,
};

/** Minimum score [0,1] to consider a header for a role before greedy assignment */
const ASSIGN_THRESHOLD = 0.42;

/** Fallback first-column assignment uses value sampling above this URL ratio */
const URL_RATIO_FOR_WEBSITE = 0.45;

export function normalizeHeaderKey(k: string): string {
  return k
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[_-]/g, "");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, row[j], row[j - 1]);
      prev = row[j];
      row[j] = cur;
    }
  }
  return row[b.length];
}

function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length, 1);
  return 1 - levenshtein(a, b) / maxLen;
}

function scoreAgainstSynonyms(headerNorm: string, synonyms: readonly string[]): number {
  let best = 0;
  for (const syn of synonyms) {
    if (headerNorm === syn) {
      best = 1;
      break;
    }
    if (headerNorm.includes(syn) && syn.length >= 3) {
      best = Math.max(best, 0.88);
    } else if (syn.includes(headerNorm) && headerNorm.length >= 3) {
      best = Math.max(best, 0.82);
    }
    best = Math.max(best, stringSimilarity(headerNorm, syn) * 0.95);
  }
  return best;
}

function scoreHeaderForRole(
  headerNorm: string,
  role: StandardCompetitorField,
  headerIndex: number
): number {
  let score = scoreAgainstSynonyms(headerNorm, ROLE_SYNONYMS[role]);
  if (role === "name" && headerIndex === 0) {
    score += 0.06;
  }
  if (role === "website" && headerIndex === 0) {
    score += 0.03;
  }
  return Math.min(score, 1);
}

export function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^www\./i.test(t)) return true;
  if (
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+(\/[^\s]*)?$/i.test(t)
  ) {
    return true;
  }
  return false;
}

function columnUrlRatio(
  sampleRows: Record<string, unknown>[] | undefined,
  header: string
): number {
  if (!sampleRows?.length || !header) return 0;
  let n = 0;
  let urls = 0;
  const cap = Math.min(sampleRows.length, 12);
  for (let i = 0; i < cap; i++) {
    const v = sampleRows[i]?.[header];
    if (v == null || v === "") continue;
    n += 1;
    const str = typeof v === "string" ? v.trim() : String(v).trim();
    if (looksLikeUrl(str)) urls += 1;
  }
  if (n === 0) return 0;
  return urls / n;
}

function emptyMapping(): InferredCompetitorColumnMapping {
  return {
    name: null,
    website: null,
    description: null,
    logo: null,
  };
}

/**
 * @param headers - Original header labels (after trim), in column order
 * @param sampleRows - Optional first rows for URL-vs-name disambiguation
 */
export function inferCompetitorColumnMapping(
  headers: string[],
  sampleRows?: Record<string, unknown>[]
): InferredCompetitorColumnMapping {
  const clean = headers.map((h) => (typeof h === "string" ? h.trim() : "")).filter(Boolean);
  if (clean.length === 0) {
    return emptyMapping();
  }

  if (clean.length === 1) {
    const h = clean[0];
    const ratio = columnUrlRatio(sampleRows, h);
    const out = emptyMapping();
    if (ratio >= URL_RATIO_FOR_WEBSITE) {
      out.website = h;
    } else {
      out.name = h;
    }
    return out;
  }

  type Assignment = {
    header: string;
    role: StandardCompetitorField;
    score: number;
    index: number;
  };

  const assignments: Assignment[] = [];
  clean.forEach((header, index) => {
    const norm = normalizeHeaderKey(header);
    if (!norm) return;
    const roles: StandardCompetitorField[] = [
      "name",
      "website",
      "description",
      "logo",
    ];
    for (const role of roles) {
      const score = scoreHeaderForRole(norm, role, index);
      if (score >= ASSIGN_THRESHOLD) {
        assignments.push({ header, role, score, index });
      }
    }
  });

  assignments.sort((a, b) => b.score - a.score);

  const out = emptyMapping();
  const usedHeaders = new Set<string>();
  const usedRoles = new Set<StandardCompetitorField>();

  for (const a of assignments) {
    if (usedHeaders.has(a.header) || usedRoles.has(a.role)) continue;
    out[a.role] = a.header;
    usedHeaders.add(a.header);
    usedRoles.add(a.role);
  }

  if (out.name == null && out.website == null && clean.length > 0) {
    const hFirst = clean.find((h) => !usedHeaders.has(h)) ?? null;
    if (hFirst) {
      const ratio = columnUrlRatio(sampleRows, hFirst);
      if (ratio >= URL_RATIO_FOR_WEBSITE) {
        out.website = hFirst;
      } else {
        out.name = hFirst;
      }
    }
  }

  return out;
}
