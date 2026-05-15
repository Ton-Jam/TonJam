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
  autoFocus
}: ButtonGroupInputProps) {
  return (
    <ButtonGroup className={className}>
      <Input 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        className={cn("rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0", inputClassName)}
      />
      <Button 
        variant="outline" 
        aria-label="Search" 
        onClick={onSearch}
        className="rounded-l-none border-l-0"
      >
        <SearchIcon className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  )
}
