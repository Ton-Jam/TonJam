"use client"

import * as React from "react"
import { useTonPrice } from "@/contexts/TonPriceContext"
import { TON_LOGO } from "@/constants"

export function TonPriceChart() {
  const { price } = useTonPrice();
  const currentPrice = price ? price.toFixed(2) : '6.45';

  return (
    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-2xl px-3.5 py-2 select-none transition-all">
      <img src={TON_LOGO} alt="TON" className="w-5 h-5 object-contain shrink-0" />
      <span className="text-sm font-mono font-black text-cyan-400">
        ${currentPrice}
      </span>
      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
        +3.4%
      </span>
    </div>
  )
}


