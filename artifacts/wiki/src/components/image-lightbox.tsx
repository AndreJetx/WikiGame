import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ImageLightbox({ src, alt, onClose }: Props) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef(offset);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pan = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinch = useRef<{ distance: number; scale: number } | null>(null);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [onClose]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      setScale((current) => {
        const next = clamp(current * factor, 1, 6);
        if (next === 1) setOffset({ x: 0, y: 0 });
        return next;
      });
    };
    image.addEventListener("wheel", onWheel, { passive: false });
    return () => image.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = (factor: number) => {
    setScale((current) => {
      const next = clamp(current * factor, 1, 6);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return createPortal(
    <div
      data-image-zoom
      className="pointer-events-auto fixed inset-0 z-[80] bg-black/95"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Imagem ampliada"}
    >
      <div className="absolute right-4 top-4 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
        <Button type="button" variant="secondary" size="icon" aria-label="Reduzir" onClick={() => zoomBy(1 / 1.25)}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button type="button" variant="secondary" size="icon" aria-label="Ampliar" onClick={() => zoomBy(1.25)}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button type="button" variant="secondary" size="icon" aria-label="Fechar" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        draggable={false}
        className="absolute left-1/2 top-1/2 max-h-[100vh] max-w-[100vw] select-none touch-none"
        style={{
          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
          cursor: scale > 1 ? "grab" : "zoom-in",
        }}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => {
          event.stopPropagation();
          if (scaleRef.current > 1) reset();
          else setScale(2);
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          if (pointers.current.size === 2) {
            const [first, second] = [...pointers.current.values()];
            pinch.current = {
              distance: Math.hypot(first.x - second.x, first.y - second.y) || 1,
              scale: scaleRef.current,
            };
            pan.current = null;
            return;
          }
          if (scaleRef.current > 1) {
            pan.current = {
              x: event.clientX,
              y: event.clientY,
              ox: offsetRef.current.x,
              oy: offsetRef.current.y,
            };
          }
        }}
        onPointerMove={(event) => {
          const point = pointers.current.get(event.pointerId);
          if (!point) return;
          point.x = event.clientX;
          point.y = event.clientY;
          if (pointers.current.size === 2 && pinch.current) {
            const [first, second] = [...pointers.current.values()];
            const distance = Math.hypot(first.x - second.x, first.y - second.y) || 1;
            const next = clamp((pinch.current.scale * distance) / pinch.current.distance, 1, 6);
            setScale(next);
            if (next === 1) setOffset({ x: 0, y: 0 });
            return;
          }
          if (!pan.current || scaleRef.current <= 1) return;
          setOffset({
            x: pan.current.ox + event.clientX - pan.current.x,
            y: pan.current.oy + event.clientY - pan.current.y,
          });
        }}
        onPointerUp={(event) => {
          pointers.current.delete(event.pointerId);
          if (pointers.current.size < 2) pinch.current = null;
          if (pointers.current.size === 0) pan.current = null;
        }}
        onPointerCancel={(event) => {
          pointers.current.delete(event.pointerId);
          pinch.current = null;
          pan.current = null;
        }}
      />
    </div>,
    document.body,
  );
}
