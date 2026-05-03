import type { CompetitorFormData } from "@/types/workflow";
import Papa, { type ParseError } from "papaparse";
import {
  inferCompetitorColumnMapping,
  normalizeHeaderKey,
  type InferredCompetitorColumnMapping,
} from "@/lib/competitors/inferCompetitorColumnMapping";
import { normalizeWebsiteUrl } from "@/lib/utils/normalizeWebsiteUrl";

/** Matches API columns; `type` is a string from DB — narrowed when coercing cells */
export type CompetitorColumnLike = {
  name: string;
  type: string;
};

export type CompetitorImportParseIssue = {
  row: number;
  message: string;
};

/** Papa reports these even when parse output is usable (see papaparse.js). */
const PAPA_NON_FATAL_CODES = new Set<string>(["UndetectableDelimiter"]);

function partitionPapaErrors(errors: ParseError[] | undefined) {
  const fatal: ParseError[] = [];
  const notices: ParseError[] = [];
  for (const e of errors ?? []) {
    if (PAPA_NON_FATAL_CODES.has(e.code)) {
      notices.push(e);
    } else {
      fatal.push(e);
    }
  }
  return { fatal, notices };
}

function firstLineOfText(text: string): string {
  const m = text.match(/^[^\r\n]*/);
  return m ? m[0] : "";
}

/** When the file is tab-separated but saved as .csv, comma parsing often yields one column. */
function shouldRetryCsvWithTab(
  text: string,
  fieldCount: number | undefined
): boolean {
  if ((fieldCount ?? 0) > 1) return false;
  const line = firstLineOfText(text);
  const tabs = line.split("\t").length - 1;
  const commas = line.split(",").length - 1;
  return tabs >= 1 && tabs > commas;
}

const NAME_KEYS = new Set([
  "name",
  "competitor",
  "company",
  "organization",
  "brand",
  "business",
  "competitorname",
  "companyname",
  "businessname",
]);
const WEBSITE_KEYS = new Set([
  "website",
  "url",
  "site",
  "web",
  "homepage",
  "domain",
]);
const DESCRIPTION_KEYS = new Set([
  "description",
  "desc",
  "notes",
  "about",
  "summary",
]);
const LOGO_KEYS = new Set(["logo", "logoimage", "logourl", "favicon", "icon"]);

function stringVal(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v).trim();
}

/** Maps normalized header → actual key present in row objects */
function buildHeaderMap(headers: string[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const h of headers) {
    if (!h?.trim()) continue;
    const n = normalizeHeaderKey(h);
    if (!m.has(n)) m.set(n, h);
  }
  return m;
}

function pickFromRow(
  row: Record<string, unknown>,
  normToOriginal: Map<string, string>,
  candidates: Set<string>
): string {
  for (const c of candidates) {
    const orig = normToOriginal.get(c);
    if (orig !== undefined) {
      const s = stringVal(row[orig]);
      if (s !== "") return s;
    }
  }
  for (const [key, val] of Object.entries(row)) {
    if (candidates.has(normalizeHeaderKey(key))) return stringVal(val);
  }
  return "";
}

function coerceAttribute(
  val: string,
  col: CompetitorColumnLike
): string | number | boolean {
  const t = col.type;
  if (t === "number") {
    const n = parseFloat(val.replace(/,/g, ""));
    return Number.isFinite(n) ? n : val;
  }
  if (t === "boolean") {
    const s = val.toLowerCase();
    if (["true", "yes", "1", "y"].includes(s)) return true;
    if (["false", "no", "0", "n"].includes(s)) return false;
    return val;
  }
  if (t === "date") {
    const d = Date.parse(val);
    if (!Number.isNaN(d)) return new Date(d).toISOString();
    return val;
  }
  return val;
}

function mapRowToCompetitor(
  row: Record<string, unknown>,
  normToOriginal: Map<string, string>,
  customColumns: CompetitorColumnLike[],
  inferred: InferredCompetitorColumnMapping
): CompetitorFormData | null {
  const fromInferred = (h: string | null) =>
    h ? stringVal(row[h]) : "";

  let name = fromInferred(inferred.name);
  let website = fromInferred(inferred.website);
  if (!name) name = pickFromRow(row, normToOriginal, NAME_KEYS);
  if (!website) website = pickFromRow(row, normToOriginal, WEBSITE_KEYS);
  if (!name && !website) return null;

  let description = fromInferred(inferred.description);
  let logoImage = fromInferred(inferred.logo);
  if (!description) {
    description = pickFromRow(row, normToOriginal, DESCRIPTION_KEYS);
  }
  if (!logoImage) {
    logoImage = pickFromRow(row, normToOriginal, LOGO_KEYS);
  }

  const consumedStd = new Set(
    [inferred.name, inferred.website, inferred.description, inferred.logo].filter(
      (x): x is string => !!x
    )
  );

  const attributes: Record<string, string | number | boolean> = {};
  const colByNorm = new Map(
    customColumns.map((c) => [normalizeHeaderKey(c.name), c])
  );

  for (const [key, raw] of Object.entries(row)) {
    if (consumedStd.has(key)) continue;
    const nk = normalizeHeaderKey(key);
    if (
      NAME_KEYS.has(nk) ||
      WEBSITE_KEYS.has(nk) ||
      DESCRIPTION_KEYS.has(nk) ||
      LOGO_KEYS.has(nk)
    ) {
      continue;
    }
    const col = colByNorm.get(nk);
    if (!col) continue;
    const s = stringVal(raw);
    if (s === "") continue;
    attributes[col.name] = coerceAttribute(s, col);
  }

  return {
    name: name || website || "Untitled",
    description: description || "",
    website: normalizeWebsiteUrl(website || ""),
    logoImage: logoImage || "",
    attributes,
  };
}

function headerListFromObjects(
  objects: Record<string, unknown>[],
  hint?: string[]
): string[] {
  if (hint?.length) return hint.filter((h) => typeof h === "string" && h.trim() !== "");
  const first = objects.find((o) => o && typeof o === "object");
  if (!first) return [];
  return Object.keys(first);
}

export function parseCompetitorRowsFromObjects(
  objects: Record<string, unknown>[],
  customColumns: CompetitorColumnLike[],
  fieldNameHint?: string[]
): { rows: CompetitorFormData[]; issues: CompetitorImportParseIssue[] } {
  const clean = objects.filter((o) => o && typeof o === "object");
  if (clean.length === 0) {
    return {
      rows: [],
      issues: [{ row: 0, message: "No data rows found." }],
    };
  }

  const headers = headerListFromObjects(clean, fieldNameHint);
  if (headers.length === 0) {
    return {
      rows: [],
      issues: [{ row: 0, message: "No column headers found." }],
    };
  }

  const normToOriginal = buildHeaderMap(headers);
  const inferred = inferCompetitorColumnMapping(headers, clean.slice(0, 15));
  const rows: CompetitorFormData[] = [];
  const issues: CompetitorImportParseIssue[] = [];

  clean.forEach((obj, i) => {
    const rowNum = i + 2;
    const mapped = mapRowToCompetitor(
      obj,
      normToOriginal,
      customColumns,
      inferred
    );
    if (!mapped) {
      issues.push({
        row: rowNum,
        message: "Skipped empty row (needs Name or Website).",
      });
      return;
    }
    rows.push(mapped);
  });

  return { rows, issues };
}

/**
 * Parse a single CSV / Excel file into competitor rows.
 * — CSV: [Papa Parse](https://www.papaparse.com/) (RFC-style cells, quoted fields, BOM)
 * — .xlsx / .xls: [SheetJS](https://docs.sheetjs.com/) (first sheet only)
 */
export async function parseCompetitorImportFile(
  file: File,
  customColumns: CompetitorColumnLike[]
): Promise<{ rows: CompetitorFormData[]; issues: CompetitorImportParseIssue[] }> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
    const text = await file.text();
    const baseConfig = {
      header: true as const,
      skipEmptyLines: "greedy" as const,
      transformHeader: (h: string) =>
        typeof h === "string" ? h.trim() : String(h ?? ""),
    };

    let parsed = Papa.parse<Record<string, unknown>>(text, baseConfig);
    let { fatal, notices } = partitionPapaErrors(parsed.errors);

    if (
      fatal.length === 0 &&
      shouldRetryCsvWithTab(text, parsed.meta.fields?.length)
    ) {
      const tabParsed = Papa.parse<Record<string, unknown>>(text, {
        ...baseConfig,
        delimiter: "\t",
      });
      const tabParts = partitionPapaErrors(tabParsed.errors);
      if (tabParts.fatal.length === 0) {
        parsed = tabParsed;
        fatal = tabParts.fatal;
        notices = [...notices, ...tabParts.notices];
      }
    }

    if (fatal.length > 0) {
      const msg = fatal.map((e) => e.message).join("; ");
      return {
        rows: [],
        issues: [{ row: 0, message: `CSV parse error: ${msg}` }],
      };
    }

    const headerIssues: CompetitorImportParseIssue[] = notices.map((e) => ({
      row: 0,
      message: `CSV: ${e.message}`,
    }));

    const data = (parsed.data || []).filter(
      (r): r is Record<string, unknown> => r != null && typeof r === "object"
    );
    const { rows, issues } = parseCompetitorRowsFromObjects(
      data,
      customColumns,
      parsed.meta.fields ?? undefined
    );
    return { rows, issues: [...headerIssues, ...issues] };
  }

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) {
      return {
        rows: [],
        issues: [{ row: 0, message: "Spreadsheet has no sheets." }],
      };
    }
    const sheet = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });
    return parseCompetitorRowsFromObjects(json, customColumns);
  }

  return {
    rows: [],
    issues: [{ row: 0, message: `Unsupported file: ${file.name}` }],
  };
}
