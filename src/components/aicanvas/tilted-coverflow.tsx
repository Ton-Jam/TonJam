import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { motion, type PanInfo } from 'motion/react'

export interface CoverflowItem {
  id: string | number
  title: string
  subtitle?: string
  imageUrl: string
  onClick?: () => void
}

interface TiltedCoverflowProps {
  items: CoverflowItem[]
  onItemClick?: (item: CoverflowItem) => void
  onFocusChange?: (index: number) => void
  initialFocus?: number
}

const ROTATION_PER_STEP = 14 // degrees per offset step
const ARC_Y = 8              // px of vertical arc per |offset|
const GAP_PX = 30            // constant visible pixel gap between adjacent cards

// Runtime transitions (drag, click, key) — snappy, no bounce.
const SPRING = { type: 'spring' as const, stiffness: 240, damping: 30 }
const MOUNT_SPRING = { type: 'spring' as const, stiffness: 180, damping: 18 }
const STAGGER_MS = 0.09

function visibleOffset(cardIndex: number, focus: number, total: number) {
  const half = Math.floor(total / 2)
  let off = cardIndex - focus
  if (off > half) off -= total
  if (off < -half) off += total
  return off
}

function buildXPositions(scales: number[], baseWidth: number, gap: number, half: number) {
  const positions = new Map<number, number>()
  positions.set(0, 0)
  let cursor = 0
  for (let i = 1; i <= half; i++) {
    const prevScale = scales[i - 1] !== undefined ? scales[i - 1] : 0.6
    const currScale = scales[i] !== undefined ? scales[i] : 0.6
    const step = (prevScale / 2 + currScale / 2) * baseWidth + gap
    cursor += step
    positions.set(i, cursor)
    positions.set(-i, -cursor)
  }
  return positions
}

export default function TiltedCoverflow({
  items,
  onItemClick,
  onFocusChange,
  initialFocus,
}: TiltedCoverflowProps) {
  const TOTAL = items.length
  if (TOTAL === 0) return null

  const HALF = Math.min(3, Math.floor(TOTAL / 2))
  const [focus, setFocus] = useState(
    initialFocus !== undefined 
      ? initialFocus 
      : Math.floor(TOTAL / 2)
  )
  const [maxSide, setMaxSide] = useState(3)
  const [cardWidth, setCardWidth] = useState(180)
  const [mounted, setMounted] = useState(false)

  const cardRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Collapse to 1 visible side card under 640px wide.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 640px)')
    const apply = () => setMaxSide(mq.matches ? 3 : 1)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Measure the rendered card width so translateX scales with viewport.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const measure = () => {
      if (cardRef.current) {
        const w = cardRef.current.getBoundingClientRect().width
        if (w > 0) setCardWidth(w)
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (cardRef.current) ro.observe(cardRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const step = useCallback((dir: 1 | -1) => {
    setFocus((current) => {
      return (current + dir + TOTAL) % TOTAL
    })
  }, [TOTAL])

  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(focus)
    }
  }, [focus, onFocusChange])

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const distance = info.offset.x
      const velocity = info.velocity.x
      if (distance < -60 || velocity < -400) {
        step(1)
      } else if (distance > 60 || velocity > 400) {
        step(-1)
      }
    },
    [step],
  )

  // Generate dynamic scales array up to HALF
  const SCALE_BY_OFFSET = useMemo(() => {
    return Array.from({ length: HALF + 1 }, (_, i) => {
      return Math.max(0.6, 1.0 - i * 0.12)
    })
  }, [HALF])

  const positions = useMemo(() => {
    return buildXPositions(SCALE_BY_OFFSET, cardWidth, GAP_PX, HALF)
  }, [SCALE_BY_OFFSET, cardWidth, HALF])

  return (
    <div className="relative flex w-full flex-col items-center gap-6 select-none overflow-hidden py-4">
      <motion.div
        className="relative flex w-full items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: '1400px', height: 'clamp(240px, 28vw, 320px)' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {items.map((item, index) => {
          const offset = visibleOffset(index, focus, TOTAL)
          const absOffset = Math.abs(offset)
          const hidden = absOffset > maxSide
          const isFocus = offset === 0

          const scale = SCALE_BY_OFFSET[absOffset] ?? 0.6
          const rotateY = -offset * ROTATION_PER_STEP
          const translateX = positions.get(offset) ?? 0
          const translateY = absOffset * ARC_Y

          const mountDelay = (3 - absOffset) * STAGGER_MS
          const transition = mounted
            ? SPRING
            : { ...MOUNT_SPRING, delay: mountDelay }

          const breathDuration = 5 + index * 0.6

          return (
            <motion.button
              key={`${item.id}-${index}`}
              ref={index === 0 ? cardRef : undefined}
              type="button"
              aria-label={item.title}
              onClick={(event) => {
                event.preventDefault()
                if (!hidden) {
                  if (!isFocus) {
                    setFocus(index)
                  } else if (onItemClick) {
                    onItemClick(item)
                  } else if (item.onClick) {
                    item.onClick()
                  }
                }
              }}
              className="absolute aspect-[4/5] w-[clamp(140px,15vw,190px)] focus:outline-none"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
                pointerEvents: hidden ? 'none' : 'auto',
                cursor: isFocus ? 'grab' : 'pointer',
                zIndex: TOTAL - absOffset,
              }}
              initial={{ opacity: 0, scale: 0.45, y: 70, x: 0, rotateY: 0 }}
              animate={{
                x: translateX,
                y: translateY,
                rotateY,
                scale,
                opacity: hidden ? 0 : 1,
              }}
              transition={transition}
              whileTap={isFocus ? { scale: 0.98 } : undefined}
            >
              <motion.div
                className="relative h-full w-full overflow-hidden rounded-2xl ring-1 ring-white/10"
                style={{
                  boxShadow: isFocus
                    ? '0 25px 50px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)'
                    : '0 10px 20px rgba(0,0,0,0.3)',
                }}
                animate={{
                  y: [0, -6, 0, 4, 0],
                  rotate: [0, 1, 0, -1, 0],
                }}
                transition={{
                  duration: breathDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end px-3 pb-4 pt-12">
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-2/3"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%)',
                    }}
                  />
                  <div className="relative text-center">
                    <span
                      className="block leading-tight text-white font-extrabold text-sm sm:text-base uppercase tracking-tight truncate px-1"
                      style={{
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      }}
                    >
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span
                        className="block text-[10px] font-mono tracking-wider text-blue-400 mt-1 uppercase"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        }}
                      >
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Dot indicators */}
      <div className="flex items-center gap-1.5 mt-2">
        {items.map((item, index) => {
          const isCurrent = focus === index
          return (
            <motion.button
              key={`dot-${item.id}-${index}`}
              type="button"
              aria-label={`Focus ${item.title}`}
              onClick={() => setFocus(index)}
              animate={{
                width: isCurrent ? 16 : 6,
                opacity: isCurrent ? 1 : 0.3,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="h-1.5 rounded-full bg-blue-500"
            />
          )
        })}
      </div>
    </div>
  )
}
