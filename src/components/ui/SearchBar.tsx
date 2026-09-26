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
      className="relative w-full rounded-full border border-blue-500/30 hover:border-blue-500/50 focus-within:border-blue-500/60 transition-all flex items-center px-3.5 shadow-none"
    >
      <Search className="size-4 text-text-muted shrink-0 mr-2" />
      <input
        type="text"
        className={cn(
          "w-full bg-transparent border-0 !border-none outline-none ring-0 focus:outline-none focus:ring-0 text-xs font-semibold text-text-primary placeholder-text-muted transition-all py-2.5",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}

