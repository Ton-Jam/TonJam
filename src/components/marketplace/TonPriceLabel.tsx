import React from "react";
import { cn } from "@/lib/utils";

interface TonPriceLabelProps {
  price: string | number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const TonPriceLabel: React.FC<TonPriceLabelProps> = ({
  price,
  label,
  size = "md",
  className,
}) => {
  const numericPrice = typeof price === "number" ? price.toString() : price.replace(/[^0-9.]/g, "");
  const formattedPrice = numericPrice ? `${numericPrice} TON` : typeof price === "string" ? price : "0 TON";

  const sizeClasses = {
    sm: "text-xs font-semibold",
    md: "text-sm font-bold",
    lg: "text-base font-extrabold",
  };

  return (
    <div className={cn("inline-flex flex-col", className)}>
      {label && (
        <span className="text-[10px] uppercase tracking-wider text-[#9BAAC5]/80 font-medium">
          {label}
        </span>
      )}
      <div className="inline-flex items-center gap-1.5">
        {/* TON Diamond Gem Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn(
            "text-[#65B8FF] shrink-0",
            size === "sm" ? "w-3 h-3" : size === "md" ? "w-3.5 h-3.5" : "w-4 h-4"
          )}
          aria-hidden="true"
        >
          <path
            d="M12 2L3 8L12 22L21 8L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M3 8L12 13L21 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 13V22"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <span className={cn("text-[#F5F8FF] tracking-tight", sizeClasses[size])}>
          {formattedPrice}
        </span>
      </div>
    </div>
  );
};

export default TonPriceLabel;
