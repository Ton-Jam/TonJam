import React from 'react'
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ButtonGroupInputProps {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearch?: () => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  className?: string
  inputClassName?: string
  autoFocus?: boolean
  variant?: 'default' | 'search'
}

export function ButtonGroupInput({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  onSearch,
  onFocus,
  onKeyDown,
  className,
  inputClassName,
  autoFocus,
  variant = 'default'
}: ButtonGroupInputProps) {
  const isSearch = variant === 'search';
  
  return (
    <ButtonGroup className={cn(className, isSearch && "bg-white border border-zinc-300 rounded-md overflow-hidden")}>
      <Input 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        className={cn("rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 border-r-0", isSearch && "bg-transparent border-none", inputClassName)}
      />
      <Button 
        variant="ghost"                
        aria-label="Search" 
        onClick={onSearch}
        className={cn("rounded-l-none", isSearch && "bg-transparent hover:bg-zinc-100 text-zinc-500")}
      >
        <SearchIcon className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  )
}
