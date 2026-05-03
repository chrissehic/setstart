/**
 * Ensures website values persisted to the DB open in a browser with a proper origin.
 * Leaves empty, mailto/tel, and already-absolute http(s) URLs unchanged.
 */
export function normalizeWebsiteUrl(raw: string): string {
  const input = raw.trim();
  if (!input) return "";

  if (/^(https?|mailto|tel|ftp):/i.test(input)) {
    return input;
  }

  if (/^\/\//.test(input)) {
    return `https:${input}`;
  }

  if (/^www\./i.test(input)) {
    return `https://${input}`;
  }

  // Host or host/path without scheme (single token path segments, no spaces)
  if (
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(\/[^\s]*)?$/i.test(
      input
    )
  ) {
    return `https://${input}`;
  }

  return input;
}
