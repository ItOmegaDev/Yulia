import React, { useState } from "react";

interface ChartDataItem {
  date: string;
  "Продажі (₴)": number;
}

interface CustomSalesChartProps {
  data: ChartDataItem[];
}

export default function CustomSalesChart({ data }: CustomSalesChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Layout dimensions
  const width = 600;
  const height = 240;
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Extract values
  const salesValues = data.map((d) => d["Продажі (₴)"]);
  const maxSales = Math.max(...salesValues, 1000);
  
  // Nice tick values for Y axis (4 ticks)
  const yTicksCount = 4;
  const yTicks = Array.from({ length: yTicksCount }).map((_, i) => {
    return Math.round((maxSales / (yTicksCount - 1)) * i);
  });

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * plotWidth;
    const y = height - paddingBottom - (d["Продажі (₴)"] / (maxSales || 1)) * plotHeight;
    return { x, y, data: d, index };
  });

  // Construct SVG Path for the Area and the Line
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    areaPath = `
      ${linePath} 
      L ${points[points.length - 1].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} 
      L ${points[0].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} 
      Z
    `;
  }

  return (
    <div className="relative w-full h-full font-sans select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2A2420" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#2A2420" stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Horizontal Grid Lines */}
        {yTicks.map((val, i) => {
          const y = height - paddingBottom - (val / (maxSales || 1)) * plotHeight;
          return (
            <g key={i} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#E5E5E5"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              {/* Y Axis Label */}
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-editorial-text text-[10px] font-mono tracking-tighter"
              >
                {val.toLocaleString("uk-UA")} ₴
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - paddingBottom + 18}
            textAnchor="middle"
            className="fill-editorial-text opacity-70 text-[10px] font-mono"
          >
            {p.data.date}
          </text>
        ))}

        {/* Area Fill */}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#colorSales)"
            className="transition-all duration-300"
          />
        )}

        {/* Stroke Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#2A2420"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}

        {/* Interactive hover elements */}
        {points.map((p, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <g key={i}>
              {/* Hover vertical reference line */}
              {isHovered && (
                <line
                  x1={p.x}
                  y1={paddingTop}
                  x2={p.x}
                  y2={height - paddingBottom}
                  stroke="#2A2420"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  className="opacity-60"
                />
              )}

              {/* Data point circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4}
                className={`${
                  isHovered ? "fill-[#2A2420]" : "fill-white"
                } stroke-[#2A2420] transition-all duration-150`}
                strokeWidth={2}
              />

              {/* Big transparent interaction target area */}
              <rect
                x={p.x - plotWidth / (data.length - 1 || 1) / 2}
                y={paddingTop}
                width={plotWidth / (data.length - 1 || 1)}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating HTML Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute z-20 bg-[#2A2420] text-[#F5F2EB] text-[11px] p-2 px-3 shadow-xl border border-editorial-border/30 pointer-events-none rounded-none"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100 - 45}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-mono text-[9px] text-[#F5F2EB]/60 leading-none mb-1">
            {points[hoveredIndex].data.date}
          </div>
          <div className="font-bold whitespace-nowrap">
            {points[hoveredIndex].data["Продажі (₴)"].toLocaleString("uk-UA")} ₴
          </div>
        </div>
      )}
    </div>
  );
}
