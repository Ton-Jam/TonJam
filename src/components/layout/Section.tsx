import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface SectionProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  onSeeAll?: () => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
  lazy?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  actionButton,
  onSeeAll,
  children,
  className = '',
  id,
  lazy = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [shouldRender, setShouldRender] = useState(!lazy);

  useEffect(() => {
    if (isInView && lazy) {
      setShouldRender(true);
    }
  }, [isInView, lazy]);

  return (
    <section id={id} ref={ref} className={`my-[24px] px-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-end justify-between mb-[14px]">
        <div className="space-y-0.5">
          <h2 className="text-base font-black uppercase tracking-wider text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs font-medium text-[#9AA0AE]">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Actions side */}
        <div className="flex items-center gap-2">
          {actionButton}
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="flex items-center gap-0.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors py-1 px-2 rounded-md hover:bg-white/5 active:scale-95"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content wrapper with entrance animation */}
      <motion.div
        initial={lazy ? { opacity: 0, y: 16 } : false}
        animate={shouldRender ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full"
      >
        {shouldRender ? children : <div className="h-[200px]" />}
      </motion.div>
    </section>
  );
};
export default Section;
