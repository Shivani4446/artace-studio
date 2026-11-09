// lib/atelier/meta.ts
/**
 * Per-product Atelier meta readers.
 *
 * The CATEGORY (isAtelierProduct) decides *membership* and *presentation
 * chrome* — the lightbox, the one-of-one chip, the enquiry CTA. The META keys
 * here decide *optional per-piece content* that only some originals will have
 * (a certificate number, a provenance line).
 *
 * The split matters: an original with no certificate must still render as an
 * Atelier piece, so these are all optional and the panel simply omits the rows
 * it has no value for, rather than falling back to regular-product layout.
 *
 * MECHANICS (prints disabled, custom sizing disabled) are NOT read here for
 * *authoring* purposes, but are mirrored as ATELIER_META_KEYS so the PDP can
 * hide the print/custom-size affordances even before the product is filed
 * correctly. Category membership alone is enough to hide them; the meta flags
 * exist so a product can be opted in per-piece without re-categorising.
 */

export const ATELIER_META_KEYS = {
  provenance: "provenance",
  certificateId: "certificate_id",
  creationYear: "creation_year",
  artMedium: "art_medium",
  surface: "surface",
  frameNote: "frame_note",
  disablePrints: "disable_prints",
  disableCustomSize: "disable_custom_size",
} as const;

export type AtelierMeta = {
  provenance?: string;
  certificateId?: string;
  creationYear?: string;
  artMedium?: string;
  surface?: string;
  frameNote?: string;
  printsDisabled: boolean;
  customSizeDisabled: boolean;
};

type RawMetaItem = { key?: unknown; value?: unknown };

const FALSY_META_VALUES = new Set(["", "no", "0", "false", "off", "null", "undefined"]);

/** Trim a raw meta value to a non-empty string, or undefined. */
const readMetaString = (
  metaData: RawMetaItem[] | undefined,
  key: string
): string | undefined => {
  const entry = (metaData ?? []).find((meta) => meta?.key === key);
  if (!entry) return undefined;
  // Woo meta values are usually strings but can be numbers/booleans for typed
  // fields (e.g. a custom number field). Coerce rather than drop the value.
  const raw = typeof entry.value === "string" ? entry.value : String(entry.value ?? "");
  const trimmed = raw.trim();
  return trimmed ? trimmed : undefined;
};

/**
 * Treat a meta flag as "on" only for an explicit affirmative. Anything else —
 * missing, "", "no", "0", "false" — is off. Defaulting an *absent* flag to ON
 * would hide the print/custom-size UI on every Atelier piece; the safe default
 * here is to only restrict when someone explicitly asked.
 */
const readMetaFlag = (
  metaData: RawMetaItem[] | undefined,
  key: string
): boolean => {
  const entry = (metaData ?? []).find((meta) => meta?.key === key);
  if (!entry) return false;
  const raw = typeof entry.value === "string" ? entry.value : String(entry.value ?? "");
  const normalized = raw.trim().toLowerCase();
  if (FALSY_META_VALUES.has(normalized)) return false;
  return true;
};

/**
 * Build the AtelierMeta view model from a WooCommerce v3 product's meta_data.
 * Never throws: a malformed meta blob yields an all-empty model, and the PDP
 * still renders as Atelier (category-driven chrome still applies).
 */
export const readAtelierMeta = (
  metaData: RawMetaItem[] | undefined
): AtelierMeta => {
  try {
    return {
      provenance: readMetaString(metaData, ATELIER_META_KEYS.provenance),
      certificateId: readMetaString(metaData, ATELIER_META_KEYS.certificateId),
      creationYear: readMetaString(metaData, ATELIER_META_KEYS.creationYear),
      artMedium: readMetaString(metaData, ATELIER_META_KEYS.artMedium),
      surface: readMetaString(metaData, ATELIER_META_KEYS.surface),
      frameNote: readMetaString(metaData, ATELIER_META_KEYS.frameNote),
      printsDisabled: readMetaFlag(metaData, ATELIER_META_KEYS.disablePrints),
      customSizeDisabled: readMetaFlag(metaData, ATELIER_META_KEYS.disableCustomSize),
    };
  } catch {
    return {
      printsDisabled: false,
      customSizeDisabled: false,
    };
  }
};

/** The all-empty model, used when a fetch fails so the page never 500s. */
export const EMPTY_ATELIER_META: AtelierMeta = {
  printsDisabled: false,
  customSizeDisabled: false,
};

/** True when there is at least one provenance/certificate row worth rendering. */
export const hasAtelierDetail = (meta: AtelierMeta | undefined): boolean =>
  Boolean(
    meta?.provenance ||
      meta?.certificateId ||
      meta?.creationYear ||
      meta?.artMedium ||
      meta?.surface
  );
