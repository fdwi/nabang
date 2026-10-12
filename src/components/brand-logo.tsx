import { cn } from "@/lib/utils";

type BrandLogoProps = { className?: string; compact?: boolean };

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg aria-hidden="true" className="size-10 shrink-0" fill="none" viewBox="0 0 40 40">
        <rect fill="currentColor" height="40" rx="12" width="40" />
        <path d="M12 10h8.5c5.25 0 8.5 3.95 8.5 10s-3.25 10-8.5 10H12V10Z" fill="white" fillOpacity="0.96" />
        <path d="M17 15h3.1c2.45 0 3.9 1.75 3.9 5s-1.45 5-3.9 5H17V15Z" fill="currentColor" />
        <path d="M27.8 9.5c0 0-1.5 2.5-4.5 3.1" stroke="white" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
      {!compact && <span className="text-lg font-semibold tracking-tight text-foreground">DwiSave</span>}
    </div>
  );
}
