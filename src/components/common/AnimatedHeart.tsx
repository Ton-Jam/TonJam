import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnimatedHeartProps {
  liked: boolean;
  className?: string;
  containerClassName?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  /**
   * Optional monotonic counter or key to manually replay the subtle heart burst
   * even when `liked` doesn't flip (e.g., an inline "Unlike/Remove" row button).
   */
  pulseKey?: number;
}

/**
 * Subtle animated heart icon for Track and NFT like buttons.
 * Skips animation on initial mount and triggers immediate tactile feedback
 * when `liked` changes (soft spring pop + fading radial halo on like,
 * gentle recoil on unlike) without adding any border lines.
 */
export const AnimatedHeart: React.FC<AnimatedHeartProps> = ({
  liked,
  className,
  containerClassName,
  strokeWidth,
  style,
  pulseKey,
}) => {
  const isFirstRender = useRef(true);
  const prevLikedRef = useRef(liked);
  const prevPulseKeyRef = useRef(pulseKey);
  const timerRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<"idle" | "like" | "unlike">("idle");
  const [burstId, setBurstId] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevLikedRef.current = liked;
      prevPulseKeyRef.current = pulseKey;
      return;
    }

    const likedChanged = prevLikedRef.current !== liked;
    const pulseChanged = pulseKey !== undefined && prevPulseKeyRef.current !== pulseKey;

    if (!likedChanged && !pulseChanged) {
      return;
    }

    prevLikedRef.current = liked;
    prevPulseKeyRef.current = pulseKey;

    const nextPhase: "like" | "unlike" = liked ? "like" : "unlike";
    setPhase(nextPhase);
    setBurstId((prev) => prev + 1);

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(
      () => {
        setPhase("idle");
        timerRef.current = null;
      },
      nextPhase === "like" ? 380 : 220
    );
  }, [liked, pulseKey]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const iconAnimate =
    phase === "like"
      ? { scale: [1, 1.3, 0.94, 1] }
      : phase === "unlike"
      ? { scale: [1, 0.85, 1] }
      : { scale: 1 };

  const iconTransition =
    phase === "like"
      ? { duration: 0.36, ease: "easeOut" as const }
      : { duration: 0.2, ease: "easeOut" as const };

  return (
    <span
      data-testid="animated-heart"
      data-liked={liked ? "true" : "false"}
      data-animating={phase}
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 pointer-events-none",
        containerClassName
      )}
    >
      {phase === "like" && (
        <motion.span
          key={`halo-${burstId}`}
          aria-hidden="true"
          initial={{ scale: 0.65, opacity: 0.36 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.36, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-current pointer-events-none"
        />
      )}
      <motion.span
        key={`icon-${burstId}`}
        animate={iconAnimate}
        transition={iconTransition}
        className="inline-flex items-center justify-center"
      >
        <Heart
          className={className}
          strokeWidth={strokeWidth}
          style={style}
        />
      </motion.span>
    </span>
  );
};

export default AnimatedHeart;
