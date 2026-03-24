import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlaceholderImage(seed: string, width: number = 400, height: number = 400) {
  // Using picsum.photos for reliable placeholder images as recommended in guidelines
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
