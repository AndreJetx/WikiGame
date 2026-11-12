export const ARTWORK_ASPECTS = [
  { id: "16:9", label: "16:9", css: "16 / 9", widthClass: "max-w-4xl" },
  { id: "4:3", label: "4:3", css: "4 / 3", widthClass: "max-w-3xl" },
  { id: "3:2", label: "3:2", css: "3 / 2", widthClass: "max-w-3xl" },
  { id: "1:1", label: "1:1", css: "1 / 1", widthClass: "max-w-xl" },
  { id: "2:3", label: "2:3", css: "2 / 3", widthClass: "max-w-md" },
  { id: "3:4", label: "3:4", css: "3 / 4", widthClass: "max-w-md" },
  { id: "9:16", label: "9:16", css: "9 / 16", widthClass: "max-w-sm" },
] as const;

export type ArtworkAspectId = (typeof ARTWORK_ASPECTS)[number]["id"];

const DEFAULT_ASPECT = ARTWORK_ASPECTS[5];

export function artworkFrame(value?: string | null) {
  return ARTWORK_ASPECTS.find((item) => item.id === value) ?? DEFAULT_ASPECT;
}
