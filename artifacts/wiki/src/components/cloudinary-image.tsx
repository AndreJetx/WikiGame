import { AdvancedImage } from "@cloudinary/react";
import { buildOptimizedImage, type ImageTransformOptions } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt?: string;
  className?: string;
} & ImageTransformOptions;

/**
 * Renders a Cloudinary-optimized image when `src` is a Cloudinary URL;
 * otherwise falls back to a normal <img>.
 */
export function CloudinaryImage({
  src,
  alt = "",
  className,
  width = 1200,
  height,
  crop = "limit",
}: Props) {
  const cldImg = buildOptimizedImage(src, { width, height, crop });

  if (!cldImg) {
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }

  return <AdvancedImage cldImg={cldImg} alt={alt} className={cn(className)} />;
}
