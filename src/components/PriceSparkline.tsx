import React, { useMemo, useState } from "react";
import * as RechartsPrimitive from "recharts";

const {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} = RechartsPrimitive as any;

interface PriceSparklineProps {
  basePrice: number;
}

interface SparklineDataPoint {
  day: string;
  price: number;
}

export const PriceSparkline: React.FC<PriceSparklineProps> = ({ basePrice }) => {
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const sparklineData = useMemo(() => {
    const data: SparklineDataPoint[] = [];
    const now = new Date();
    const prices: number[] = new Array(30);
    prices[29] = basePrice;

    // Walk backwards deterministically to create a smooth, beautiful floor price path
    for (let i = 28; i >= 0; i--) {
      // Create a wavy trend with a minor overall downward walk back in time (upward drift forward in time)
      const wave = Math.sin(i * 0.45) * 0.07 + Math.cos(i * 0.8) * 0.03;
      prices[i] = prices[i + 1] * (1 - wave - 0.004);
      if (prices[i] < 0.01) prices[i] = 0.01;
    }

    // Now construct the chronological array
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(now.getDate() - (29 - i));
      const dayStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      data.push({
        day: dayStr,
        price: Number(prices[i].toFixed(2)),
      });
    }

    return data;
  }, [basePrice]);

  // Calculate percentage change over last 30 days
  const changePercent = useMemo(() => {
    if (sparklineData.length < 2) return 0;
    const start = sparklineData[0].price;
    const end = sparklineData[sparklineData.length - 1].price;
    if (start === 0) return 0;
    return Number((((end - start) / start) * 100).toFixed(1));
  }, [sparklineData]);

  // Custom tool-less hover handling by passing callbacks to Recharts
  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      setHoveredPrice(state.activePayload[0].payload.price);
      setHoveredDay(state.activePayload[0].payload.day);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPrice(null);
    setHoveredDay(null);
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[140px] sm:min-w-[170px] bg-transparent selection:bg-transparent">
      <div className="flex items-center justify-between">
        <span className="text-[7px] sm:text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          {hoveredDay ? hoveredDay : "30d Floor Trend"}
        </span>
        <span
          className={`text-[8px] font-black tracking-tight ${
            changePercent >= 0 ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {hoveredPrice !== null ? (
            `${hoveredPrice.toFixed(2)} TON`
          ) : (
            `${changePercent >= 0 ? "+" : ""}${changePercent}%`
          )}
        </span>
      </div>

      <div className="h-[28px] sm:h-[32px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sparklineData}
            margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="price"
              stroke={changePercent >= 0 ? "#10b981" : "#f43f5e"}
              strokeWidth={1.5}
              fill="url(#sparklineGrad)"
              dot={false}
              activeDot={{
                r: 3,
                stroke: "#ffffff",
                strokeWidth: 1,
                fill: changePercent >= 0 ? "#10b981" : "#f43f5e",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
