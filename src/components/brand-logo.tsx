import { cn } from "@/lib/utils";
import Image from "next/image";

type BrandLogoProps = { className?: string; compact?: boolean };

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        alt="Nabang Logo"
        className="size-9 shrink-0 object-contain"
        height={36}
        priority
        src="/images/logonabang.png"
        unoptimized
        width={36}
      />
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          Nabang
        </span>
      )}
    </div>
  );
}
