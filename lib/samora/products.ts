export const SAMORA_TAG_SLUG = "samora";

type TagLike = {
  slug?: string | null;
};

export const hasSamoraTag = (tags: TagLike[] | null | undefined): boolean =>
  (tags ?? []).some((tag) => (tag?.slug || "").trim().toLowerCase() === SAMORA_TAG_SLUG);
