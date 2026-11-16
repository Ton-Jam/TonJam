"use client";

import * as React from "react";
import { useTonPrice } from "@/contexts/TonPriceContext";
import { TON_LOGO } from "@/constants";

export function TonPriceChart() {
  const { price, loading } = useTonPrice();
  const currentPrice = price ? `$${price.toFixed(2)}` : loading ? "—" : "$7.50";

  return (
    <div className="flex items-center gap-1.5 bg-[#121824] rounded-full px-3 py-1.5 select-none transition-all">
      <img
        src={TON_LOGO}
        alt="TON"
        className="w-4 h-4 object-contain shrink-0"
      />
      <span className="text-xs font-mono font-bold tabular-nums text-white/95">
        {currentPrice}
      </span>
      <span className="text-[10px] font-bold text-[#38BDF8] uppercase">
        TON
      </span>
    </div>
  );
}
