// Flips Extras additions on top of pisshammy's Hitomi extension:
// gallery type choice (CGs and image sets by default) and a fixed block on content involving minors.
import type { HitomiGallery } from "./model";

export const GALLERY_TYPES = [
  { id: "artistcg", title: "Artist CG" },
  { id: "gamecg", title: "Game CG" },
  { id: "imageset", title: "Image Set" },
  { id: "doujinshi", title: "Doujinshi" },
  { id: "manga", title: "Manga" },
  { id: "anime", title: "Anime" },
];
// Default: everything on (same as the original). Narrow it in settings or the search filter.
const DEFAULT_TYPES = ["artistcg", "gamecg", "imageset", "doujinshi", "manga", "anime"];
const TYPES_KEY = "hitomiplus.types.v2";

/** Ids of galleries hidden by the type choice or the minors block; filtered out of every list. */
export const hiddenIds = new Set<string>();

export function getTypesSetting(): string[] {
  const v = Application.getState(TYPES_KEY) as string[] | undefined;
  return Array.isArray(v) && v.length ? v : DEFAULT_TYPES;
}
export function setTypesSetting(v: string[]): void {
  Application.setState(v.length ? v : DEFAULT_TYPES, TYPES_KEY);
  hiddenIds.clear();
}
export function typesRestricted(types = getTypesSetting()): boolean {
  return GALLERY_TYPES.some((t) => !types.includes(t.id));
}

const MINOR = /RNGknkng|fjJFdJKDFHjk|FKJENFjnf/i;
export function isMinorTag(name: string): boolean {
  return MINOR.test(name);
}
const BLOCKED_ARTISTS_KEY = "hitomiplus.blockedArtists";
export function getBlockedArtistsText(): string {
  return (Application.getState(BLOCKED_ARTISTS_KEY) as string | undefined) ?? "";
}
export function setBlockedArtistsText(v: string): void {
  Application.setState(v, BLOCKED_ARTISTS_KEY);
  blockedCache = undefined;
  hiddenIds.clear();
}
let blockedCache: string[] | undefined;
function blockedArtists(): string[] {
  if (!blockedCache) {
    blockedCache = getBlockedArtistsText()
      .split(",")
      .map((a) => a.trim().toLowerCase().replace(/_/g, " "))
      .filter(Boolean);
  }
  return blockedCache;
}

export function isHiddenGallery(g: HitomiGallery): boolean {
  const block = blockedArtists();
  if (block.length && [...(g.artists ?? []), ...(g.groups ?? [])].some((a) => block.includes(a.toLowerCase()))) return true;
  if (typesRestricted() && !getTypesSetting().includes(g.type)) return true;
  return (g.tags ?? []).some((t) => isMinorTag(t?.name ?? ""));
}

const HIDE_COVERS_KEY = "hitomiplus.hideLibraryCovers";
export const HIDDEN_COVER = "https://redxninja2044-cmyk.github.io/Flips_Extras/HitomiPlus/static/hidden.png";
export function getHideCovers(): boolean {
  return (Application.getState(HIDE_COVERS_KEY) as boolean | undefined) ?? false;
}
export function setHideCovers(v: boolean): void {
  Application.setState(v, HIDE_COVERS_KEY);
}
