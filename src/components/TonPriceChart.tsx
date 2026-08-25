"use client"

import * as React from "react"
import { useTonPrice } from "@/contexts/TonPriceContext"
import { TON_LOGO } from "@/constants"

export function TonPriceChart() {
  const { price } = useTonPrice();
  const currentPrice = price ? price.toFixed(2) : '6.45';

  return (
    <div className="flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-md rounded-full px-3 py-1.5 select-none transition-all">
      <img src={TON_LOGO} alt="TON" className="w-4 h-4 object-contain shrink-0" />
      <span className="text-xs font-mono font-bold text-white/90">
        ${currentPrice}
      </span>
      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
        +3.4%
      </span>
    </div>
  )
}


