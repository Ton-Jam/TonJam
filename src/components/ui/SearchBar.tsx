import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors, radius, typography } from "@/design";

interface SearchBarProps extends React.ComponentProps<"input"> {
  onSearch?: (value: string) => void;
}

export function SearchBar({ className, onSearch, onChange, style, ...props }: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onSearch) onSearch(e.target.value);
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.dark.surface,
    borderRadius: '9999px',
    fontFamily: typography.fontFamily.primary,
    ...style,
  };

  return (
    <div 
      style={containerStyle}
      className="relative w-full rounded-full border border-[var(--tj-color-border-subtle)] hover:border-[var(--tj-color-border-strong)] focus-within:border-[var(--tj-color-brand-primary)] transition-all flex items-center px-3.5 shadow-none"
    >
      <Search className="size-4 text-[#8C8C8C] shrink-0 mr-2" />
      <input
        type="text"
        className={cn(
          "w-full bg-transparent border-0 !border-none outline-none ring-0 focus:outline-none focus:ring-0 text-xs font-semibold text-[#FFFFFF] placeholder:text-[#8C8C8C] transition-all py-2.5",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}

