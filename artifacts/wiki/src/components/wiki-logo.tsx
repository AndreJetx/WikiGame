import { cn } from "@/lib/utils";

export function WikiLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-end text-primary leading-none select-none",
        className,
      )}
    >
      <span className="relative inline-block font-mitshuka text-[1.2rem] sm:text-[1.5rem] md:text-[2.15rem] pt-[0.5em] leading-none">
        <span className="pointer-events-none absolute top-0 left-[26.5%] w-[57.5%] text-center font-serif text-[0.255em] font-normal uppercase tracking-[0.16em] text-primary/90">
          Legend of
        </span>
        Elements
      </span>
      <span className="font-mitshuka text-[1.2rem] sm:text-[1.5rem] md:text-[2.15rem] leading-none pl-[0.18em]">
        Wiki
      </span>
    </span>
  );
}
