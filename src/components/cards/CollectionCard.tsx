import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CollectionCardProps {
  name: string;
  itemCount: string;
  coverUrl: string;
  className?: string;
}

export const CollectionCard = ({ name, itemCount, coverUrl, className }: CollectionCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn("relative w-36 h-36 rounded-xl overflow-hidden cursor-pointer", className)}
    >
      <img src={coverUrl} alt={name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A24] to-transparent p-3 flex flex-col justify-end">
        <h4 className="text-[14px] font-semibold text-white truncate">{name}</h4>
        <p className="text-[11px] text-[#9AA0AE]">{itemCount} items</p>
      </div>
    </motion.div>
  );
};
