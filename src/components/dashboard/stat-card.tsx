import { formatRupiah } from "@/lib/formatters/currency";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  description?: string;
  icon: LucideIcon;
  title: string;
  trend?: "negative" | "neutral" | "positive";
  value: number;
};

export function StatCard({
  description,
  icon: Icon,
  title,
  trend = "neutral",
  value,
}: StatCardProps) {
  const getBadgeStyle = () => {
    switch (trend) {
      case "positive":
        return "bg-[#dcfce7] text-[#166534] dark:bg-[#14532d] dark:text-[#bbf7d0]";
      case "negative":
        return "bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={`flex size-9 items-center justify-center rounded-lg ${getBadgeStyle()}`}>
          <Icon aria-hidden="true" size={18} />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {formatRupiah(value)}
        </p>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
