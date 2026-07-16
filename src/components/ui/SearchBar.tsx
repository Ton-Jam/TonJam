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

  const inputStyle: React.CSSProperties = {
    backgroundColor: colors.dark.surface,
    borderColor: colors.dark.border,
    borderRadius: radius.input,
    fontFamily: typography.fontFamily.primary,
    ...style,
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
      <input
        type="text"
        style={inputStyle}
        className={cn(
          "w-full pl-10 pr-4 py-2.5 border text-xs font-semibold text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}

