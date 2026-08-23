const SITE_ORIGIN = "https://www.emc2ops.com";

/**
 * Converts an HTML-rendered, root-relative internal href into the pathname
 * used to locate its generated file. Query parameters and fragments are not
 * part of an Astro output path.
 */
export function normalizeInternalHref(href) {
  const decoded = href.replace(/&amp;/g, "&");
  const withoutHash = decoded.split("#")[0];
  if (!withoutHash) return "";

  try {
    return new URL(withoutHash, SITE_ORIGIN).pathname;
  } catch {
    return withoutHash.split("?")[0];
  }
}
