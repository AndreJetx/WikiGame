import { CloudinaryImage } from "@/components/cloudinary-image";
import { artworkFrame } from "@/lib/artwork-aspect";

type Props = {
  src: string;
  alt: string;
  aspect?: string | null;
  fit?: "page" | "card";
  className?: string;
};

export function ArtworkDisplay({ src, alt, aspect, fit = "page", className = "" }: Props) {
  const frame = artworkFrame(aspect);
  const frameClass = fit === "card" ? "w-full" : `mx-auto w-full ${frame.widthClass}`;

  return (
    <div
      className={`relative overflow-hidden bg-muted/20 ${frameClass} ${className}`}
      style={{ aspectRatio: frame.css }}
    >
      <CloudinaryImage
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain"
        width={1400}
        crop="limit"
      />
    </div>
  );
}
