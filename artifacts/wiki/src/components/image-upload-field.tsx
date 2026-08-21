import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { ImagePlus, Loader2, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
};

export function ImageUploadField({ value, onChange, folder = "wiki-articles/covers" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, folder);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Imagem de capa</label>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL Cloudinary ou https://..."
            className="flex-1"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*,image/gif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading || !isCloudinaryConfigured()}
            onClick={() => inputRef.current?.click()}
            title={
              isCloudinaryConfigured()
                ? "Enviar para Cloudinary"
                : "Configure VITE_CLOUDINARY_* no .env"
            }
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {!isCloudinaryConfigured() && (
          <p className="text-xs text-muted-foreground">
            Defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET no .env (preset unsigned).
          </p>
        )}
        {value ? (
          <div className="relative rounded-lg overflow-hidden border border-border/50 bg-muted/30 h-36">
            <CloudinaryImage
              src={value}
              alt="Capa"
              className="w-full h-full object-cover"
              width={640}
              height={288}
              crop="fill"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => onChange("")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
