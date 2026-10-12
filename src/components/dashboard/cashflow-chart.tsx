"use client";

import { formatRupiah } from "@/lib/formatters/currency";
import { useState } from "react";

export type ChartDataPoint = {
  expense: number;
  income: number;
  label: string;
};

type CashflowChartProps = {
  data: ChartDataPoint[];
};

export function CashflowChart({ data }: CashflowChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Belum ada riwayat transaksi untuk grafik periode ini.
        </p>
      </div>
    );
  }

  // Cari nilai maksimum untuk skala grafik
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    100000 // nilai minimum skala
  );

  const chartHeight = 200;
  const chartWidth = 500;
  const barGroupWidth = chartWidth / data.length;
  const barWidth = Math.min(22, (barGroupWidth - 16) / 2);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-xs bg-[#2d7a4d] dark:bg-[#7ee2a6]" />
            <span className="text-muted-foreground">Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-xs bg-[#b34455] dark:bg-[#ffb9c3]" />
            <span className="text-muted-foreground">Pengeluaran</span>
          </div>
        </div>

        {hoveredIndex !== null && data[hoveredIndex] ? (
          <div className="text-right text-xs font-medium text-foreground">
            <span>{data[hoveredIndex].label}: </span>
            <span className="text-[#2d7a4d] dark:text-[#7ee2a6]">
              +{formatRupiah(data[hoveredIndex].income)}
            </span>{" "}
            |{" "}
            <span className="text-[#b34455] dark:text-[#ffb9c3]">
              -{formatRupiah(data[hoveredIndex].expense)}
            </span>
          </div>
        ) : null}
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <svg
            aria-label="Grafik perbandingan arus kas pemasukan dan pengeluaran"
            className="w-full overflow-visible"
            height={chartHeight + 40}
            role="img"
            viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
          >
            {/* Garis Grid Horizontal */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - ratio * (chartHeight - 20);
              return (
                <g key={ratio}>
                  <line
                    className="stroke-border/70"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                    x1="0"
                    x2={chartWidth}
                    y1={y}
                    y2={y}
                  />
                  <text
                    className="fill-muted-foreground text-[10px]"
                    x="4"
                    y={y - 4}
                  >
                    {formatRupiah(maxValue * ratio)}
                  </text>
                </g>
              );
            })}

            {/* Batang Data */}
            {data.map((item, idx) => {
              const groupCenterX = idx * barGroupWidth + barGroupWidth / 2;
              const incomeHeight = (item.income / maxValue) * (chartHeight - 20);
              const expenseHeight = (item.expense / maxValue) * (chartHeight - 20);

              const incomeY = chartHeight - incomeHeight;
              const expenseY = chartHeight - expenseHeight;

              const isHovered = hoveredIndex === idx;

              return (
                <g
                  className="cursor-pointer transition-opacity"
                  key={item.label}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  opacity={hoveredIndex === null || isHovered ? 1 : 0.6}
                >
                  {/* Area hover latar */}
                  <rect
                    fill="transparent"
                    height={chartHeight + 30}
                    width={barGroupWidth}
                    x={idx * barGroupWidth}
                    y={0}
                  />

                  {/* Batang Pemasukan (Hijau) */}
                  <rect
                    className="fill-[#2d7a4d] dark:fill-[#7ee2a6]"
                    height={Math.max(incomeHeight, 2)}
                    rx="3"
                    width={barWidth}
                    x={groupCenterX - barWidth - 2}
                    y={incomeY}
                  />

                  {/* Batang Pengeluaran (Merah/Mawar) */}
                  <rect
                    className="fill-[#b34455] dark:fill-[#ffb9c3]"
                    height={Math.max(expenseHeight, 2)}
                    rx="3"
                    width={barWidth}
                    x={groupCenterX + 2}
                    y={expenseY}
                  />

                  {/* Label Sumbu X */}
                  <text
                    className={`text-[11px] font-medium transition-colors ${
                      isHovered
                        ? "fill-foreground font-bold"
                        : "fill-muted-foreground"
                    }`}
                    textAnchor="middle"
                    x={groupCenterX}
                    y={chartHeight + 24}
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
