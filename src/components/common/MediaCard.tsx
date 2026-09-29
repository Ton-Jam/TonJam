import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';
import { cardTokens } from '@/design';

export interface MediaCardProps extends Omit<HTMLMotionProps<'div'>, 'title' | 'children'> {
  type?: 'track' | 'nft' | 'playlist' | 'collection' | 'album';
  artwork?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  artworkClassName?: string;
  isActive?: boolean;
}

export const MediaCard = React.forwardRef<HTMLDivElement, MediaCardProps>(
  (
    {
      type = 'track',
      artwork,
      title,
      subtitle,
      badge,
      meta,
      action,
      onClick,
      className = '',
      artworkClassName = '',
      isActive = false,
      children,
      ...motionProps
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        layout
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClick}
        className={cn(
          "group relative cursor-pointer flex flex-col shrink-0 select-none",
          "w-[168px] p-[10px] rounded-[12px] bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-200",
          className
        )}
        style={{
          width: 'var(--card-width, 168px)',
          borderRadius: 'var(--card-radius, 12px)',
          padding: 'var(--card-padding, 10px)',
          ...motionProps.style,
        }}
        {...motionProps}
      >
        {/* 1:1 Aspect Ratio Artwork Container */}
        <div
          className={cn(
            "relative aspect-square w-full rounded-[10px] overflow-hidden bg-neutral-900 flex-shrink-0",
            artworkClassName
          )}
          style={{
            borderRadius: 'var(--card-image-radius, 10px)',
          }}
        >
          {artwork}

          {/* Optional Badge Overlay */}
          {badge && (
            <div className="absolute top-2 right-2 z-10 pointer-events-none">
              {badge}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div
          className="flex flex-col w-full min-w-0 mt-[6px] text-left"
          style={{ marginTop: 'var(--card-content-gap, 6px)' }}
        >
          {/* Title */}
          {typeof title === 'string' ? (
            <h3
              className={cn(
                "text-[14px] leading-[20px] font-semibold tracking-tight truncate w-full transition-colors",
                isActive ? "text-cyan-400 font-bold" : "text-white/95 group-hover:text-white"
              )}
              style={{
                fontSize: 'var(--card-title-size, 14px)',
                lineHeight: 'var(--card-title-line-height, 20px)',
              }}
            >
              {title}
            </h3>
          ) : (
            title
          )}

          {/* Subtitle / Artist */}
          {subtitle && (
            typeof subtitle === 'string' ? (
              <p
                className="text-[12px] leading-[17px] font-normal text-zinc-400 truncate w-full mt-0.5 hover:text-white transition-colors"
                style={{
                  fontSize: 'var(--card-meta-size, 12px)',
                  lineHeight: 'var(--card-meta-line-height, 17px)',
                }}
              >
                {subtitle}
              </p>
            ) : (
              subtitle
            )
          )}

          {/* Optional Extra Meta (e.g., Price, Count) */}
          {meta && <div className="mt-1">{meta}</div>}

          {/* Optional Action Button */}
          {action && (
            <div
              className="mt-2 w-full"
              style={{
                minHeight: 'var(--card-action-height, 34px)',
              }}
            >
              {action}
            </div>
          )}

          {/* Extra Children */}
          {children}
        </div>
      </motion.div>
    );
  }
);

MediaCard.displayName = 'MediaCard';
export default MediaCard;
