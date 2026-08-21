import { Cloudinary } from "@cloudinary/url-gen";
import { auto as autoResize, fill, limitFit } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import type { CloudinaryImage as CldImage } from "@cloudinary/url-gen";

const cloudName =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) || "si1eo7do";
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const cld = new Cloudinary({
  cloud: { cloudName },
});

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && uploadPreset);
}

export async function uploadImageToCloudinary(
  file: File,
  folder = "wiki-articles",
): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary não configurado. Defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET no .env",
    );
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);
  body.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body },
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Falha no upload Cloudinary (${res.status}): ${errText || res.statusText}`);
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Cloudinary não retornou secure_url");
  }
  return data.secure_url;
}

/** Extract public_id from a Cloudinary delivery URL (with or without transforms). */
export function extractPublicId(url: string): string | null {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return null;
  }
  const afterUpload = url.split("/upload/")[1];
  if (!afterUpload) return null;

  const parts = afterUpload.split("/");
  let i = 0;
  while (i < parts.length) {
    const part = parts[i];
    if (part.includes(",")) {
      i += 1;
      continue;
    }
    if (/^v\d+$/.test(part)) {
      i += 1;
      break;
    }
    break;
  }

  const publicIdWithExt = parts.slice(i).join("/");
  if (!publicIdWithExt) return null;
  return publicIdWithExt.replace(/\.[a-zA-Z0-9]+$/, "");
}

export type ImageTransformOptions = {
  width?: number;
  height?: number;
  /** cover crop with auto gravity */
  crop?: "fill" | "limit" | "auto";
};

export function buildOptimizedImage(
  src: string,
  options: ImageTransformOptions = {},
): CldImage | null {
  const publicId = extractPublicId(src);
  if (!publicId) return null;

  const { width = 1200, height, crop = "limit" } = options;
  let img = cld
    .image(publicId)
    .format("auto")
    .quality("auto");

  if (crop === "fill" && height) {
    img = img.resize(fill().width(width).height(height).gravity(autoGravity()));
  } else if (crop === "auto" && height) {
    img = img.resize(autoResize().gravity(autoGravity()).width(width).height(height));
  } else {
    img = img.resize(limitFit().width(width));
  }

  return img;
}

export function cloudinaryOptimizedUrl(
  src: string,
  options: ImageTransformOptions = {},
): string {
  const img = buildOptimizedImage(src, options);
  return img ? img.toURL() : src;
}
