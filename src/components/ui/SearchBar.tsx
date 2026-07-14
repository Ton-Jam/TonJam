import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.ComponentProps<"input"> {
  onSearch?: (value: string) => void;
}

export function SearchBar({ className, onSearch, onChange, ...props }: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
      <input
        type="text"
        className={cn(
          "w-full pl-10 pr-4 py-2.5 rounded-input bg-surface border border-border-subtle text-xs font-semibold text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}
