import { useRef, useState, useCallback, useEffect, useLayoutEffect, useMemo } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { 
  PaintBrush, 
  Megaphone, 
  Code, 
  ChartBar, 
  CaretLeft, 
  CaretRight, 
  ArrowUpRight,
  Flame,
  Trophy,
  Check,
  Gift,
  Crown,
  Play,
  Users,
  Wallet,
  Coins,
  Clock
} from '@phosphor-icons/react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { Task } from '@/types'
import { TJ_COIN_ICON } from '@/constants'

// ─── Data ────────────────────────────────────────────────────────────────────

const CARD_W = 220
const CARD_H = 280
const DECK_W = CARD_W + 180

const STATIC_TASKS: Array<{
  id: string | number
  title: string
  category: string
  description: string
  progress: number
  accent: string
  accentLight: string
  bg: string
  bgLight: string
  darkOnAccent?: boolean
  darkLabel?: string
  lightLabel?: string
  icon: PhosphorIcon
  reward?: string
  completed?: boolean
  claimed?: boolean
}> = [
  {
    id: 0,
    title: 'Brand Overhaul',
    category: 'Design',
    description: 'Complete visual identity refresh — logo, type scale, and colour system across all brand touchpoints.',
    progress: 45,
    accent: '#429EBD',
    accentLight: '#2980A0',
    bg: '#0C1E27',
    bgLight: '#EAF4F8',
    icon: PaintBrush,
    reward: '+100 TJ'
  },
  {
    id: 1,
    title: 'Product Launch',
    category: 'Marketing',
    description: 'Coordinate go-to-market strategy, press kit, social assets, and launch-day campaign timeline.',
    progress: 72,
    accent: '#053F5C',
    accentLight: '#032F45',
    bg: '#010810',
    bgLight: '#B8CEDB',
    darkLabel: '#2A9DC0',
    lightLabel: '#0A6A8E',
    icon: Megaphone,
    reward: '+250 TJ'
  },
  {
    id: 2,
    title: 'API Migration',
    category: 'Engineering',
    description: 'Migrate three legacy endpoints to v3 schema with full backward-compatibility and rollback plan.',
    progress: 28,
    accent: '#F7AD19',
    accentLight: '#D4900E',
    bg: '#1E1608',
    bgLight: '#FEF8E6',
    darkOnAccent: true,
    icon: Code,
    reward: '+500 TJ'
  },
  {
    id: 3,
    title: 'Q2 Metrics',
    category: 'Analytics',
    description: 'Build consolidated dashboard — retention, revenue, and activation funnels with weekly drill-down.',
    progress: 15,
    accent: '#F27F0C',
    accentLight: '#C96208',
    bg: '#1C1006',
    bgLight: '#FEF1E4',
    darkOnAccent: true,
    icon: ChartBar,
    reward: '+150 TJ'
  },
]

// Slot 0 = front, 1 = right peek, 2 = left peek, 3 = hidden back
const SLOTS = [
  { x: 0,    y: 0, rotate: 0, scale: 1,    z: 4, opacity: 1   },
  { x: 96,   y: 0, rotate: 0, scale: 0.88, z: 3, opacity: 0.75 },
  { x: -96,  y: 0, rotate: 0, scale: 0.88, z: 2, opacity: 0.75 },
  { x: 0,    y: 0, rotate: 0, scale: 0.78, z: 1, opacity: 0   },
]

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 26 }

// ─── Theme detection hook ─────────────────────────────────────────────────────

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function useIsDark(ref: React.RefObject<HTMLElement | null>) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  })

  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      setIsDark(card ? card.classList.contains('dark') : document.documentElement.classList.contains('dark'))
    }
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) obs.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [ref])
  return isDark
}

// ─── Animated progress bar ───────────────────────────────────────────────────

function AnimatedProgress({ progress, isActive, darkText }: { progress: number; isActive: boolean; darkText?: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setCount(0)
      return
    }
    const duration = 1400
    const delay = 300
    let rafId: number
    let startTime: number | null = null

    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(eased * progress))
      if (t < 1) rafId = requestAnimationFrame(tick)
    }

    const timeout = setTimeout(() => { rafId = requestAnimationFrame(tick) }, delay)
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafId) }
  }, [progress, isActive])

  const labelColor = darkText ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'
  const pctColor   = darkText ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)'
  const trackBg    = darkText ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)'
  const fillBg     = darkText ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: labelColor, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Progress</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: pctColor }}>{count}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: trackBg, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 2, background: fillBg }}
          initial={{ width: '0%' }}
          animate={{ width: isActive ? progress + '%' : '0%' }}
          transition={isActive ? { duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 } : { duration: 0 }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TaskCardsProps {
  tasks?: Task[]
  onClaim?: (id: string) => Promise<void>
  onToggle?: (id: string, progress: number) => Promise<void>
  onClick?: (task: Task) => void
}

export default function TaskCards({ tasks, onClaim, onToggle, onClick }: TaskCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDark = useIsDark(containerRef)

  const dragX = useMotionValue(0)
  const cardRotateY = useTransform(dragX, [-200, 0, 200], [14, 0, -14])

  // Map dynamic tasks to card deck objects
  const finalTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return STATIC_TASKS
    }

    // Sort unclaimed/uncompleted ones first, limit to maximum 6 to keep it clean
    const activeTasks = [...tasks]
      .sort((a, b) => {
        if (a.completed && !b.completed) return 1
        if (!a.completed && b.completed) return -1
        if (a.claimed && !b.claimed) return 1
        if (!a.claimed && b.claimed) return -1
        return 0
      })
      .slice(0, 7)

    return activeTasks.map((t) => {
      // Pick icon based on type
      let icon: PhosphorIcon = Code
      if (t.type === 'daily') icon = Clock
      else if (t.type === 'achievement' || t.type === 'milestone') icon = Trophy
      else if (t.type === 'referral') icon = Users
      else if (t.type === 'onchain') icon = Wallet
      else if (t.type === 'social') icon = Megaphone
      else if (t.type === 'boost') icon = Flame

      // Pick background values
      let accent = '#3b82f6'
      let bg = '#0f172a'
      let bgLight = '#f8fafc'

      if (t.type === 'daily') {
        accent = '#eab308' // yellow
        bg = '#1c1917'
        bgLight = '#fefce8'
      } else if (t.type === 'achievement') {
        accent = '#a855f7' // purple
        bg = '#181024'
        bgLight = '#faf5ff'
      } else if (t.type === 'referral') {
        accent = '#06b6d4' // cyan
        bg = '#081c24'
        bgLight = '#ecfeff'
      } else if (t.type === 'onchain') {
        accent = '#10b981' // emerald
        bg = '#061f14'
        bgLight = '#f0fdf4'
      } else if (t.type === 'boost') {
        accent = '#f97316' // orange
        bg = '#241408'
        bgLight = '#fff7ed'
      }

      const progressPercent = t.total > 0 ? Math.min(100, Math.round((t.progress / t.total) * 100)) : 0

      return {
        id: t.id,
        title: t.title,
        category: t.type || 'Task',
        description: t.description || t.subtitle || 'Complete this task to earn rewards',
        progress: progressPercent,
        accent,
        accentLight: accent,
        bg,
        bgLight,
        icon,
        reward: t.reward || `+${t.points} TJ`,
        completed: t.completed,
        claimed: t.claimed,
        originalTask: t
      }
    })
  }, [tasks])

  const [order, setOrder] = useState<Array<string | number>>([])
  
  // Synchronize order state with the list of task IDs
  useEffect(() => {
    if (finalTasks.length > 0) {
      setOrder(finalTasks.map(t => t.id))
    }
  }, [finalTasks])

  const orderRef = useRef(order)
  useEffect(() => { orderRef.current = order }, [order])

  const dismissing = useRef(false)
  const dragDelta = useRef(0)
  const [exiting, setExiting] = useState<{ id: string | number; dir: 'left' | 'right' } | null>(null)
  const [returning, setReturning] = useState<Set<string | number>>(new Set())

  const dismiss = useCallback((dir: 'left' | 'right') => {
    if (dismissing.current || orderRef.current.length <= 1) return
    dismissing.current = true
    const frontId = orderRef.current[0]
    setExiting({ id: frontId, dir })
    setTimeout(() => {
      setReturning(prev => new Set([...prev, frontId]))
      setOrder(prev => [...prev.slice(1), prev[0]])
      setExiting(null)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setReturning(prev => { const s = new Set(prev); s.delete(frontId); return s })
        dismissing.current = false
      }))
    }, 420)
  }, [])

  if (finalTasks.length === 0) return null

  const isDynamic = !!tasks

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center justify-center w-full select-none",
        isDynamic ? "bg-transparent py-2 my-1" : "min-h-screen bg-[#E8E8DF] dark:bg-[#1A1A19]"
      )}
    >
      {/* Deck */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div style={{ position: 'relative', width: DECK_W, height: CARD_H }}>
          {finalTasks.map(task => {
            const slotIndex = order.indexOf(task.id)
            if (slotIndex === -1) return null

            const slot = SLOTS[slotIndex] || SLOTS[3]
            const isFront = slotIndex === 0
            const isExiting = exiting?.id === task.id
            const isReturning = returning.has(task.id)

            const cardBg = isDark ? task.accent : task.accentLight
            const topBg = isDark ? task.bg : task.bgLight
            const catColor = isDark ? task.accent : task.accentLight
            const titleColor = isDark ? 'rgba(255,255,255,0.92)' : '#21211F'
            const descColor = isDark ? 'rgba(255,255,255,0.52)' : '#52524E'
            const Icon = task.icon

            return (
              <motion.div
                key={task.id}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: CARD_W,
                  height: CARD_H,
                  marginLeft: -CARD_W / 2,
                  marginTop: -CARD_H / 2,
                  zIndex: isExiting ? 10 : slot.z,
                  borderRadius: 20,
                  overflow: 'hidden',
                  cursor: isFront ? 'grab' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  background: cardBg,
                  ...(isFront ? { rotateY: cardRotateY, transformPerspective: 900 } : {}),
                }}
                animate={
                  isExiting
                    ? {
                        x: exiting!.dir === 'left' ? -380 : 380,
                        y: 80,
                        rotate: exiting!.dir === 'left' ? -20 : 20,
                        scale: 0.85,
                        opacity: 0,
                      }
                    : {
                        x: slot.x,
                        y: slot.y,
                        rotate: slot.rotate,
                        scale: slot.scale,
                        opacity: slot.opacity,
                      }
                }
                transition={
                  isExiting
                    ? { duration: 0.42, ease: [0.4, 0, 0.2, 1] }
                    : isReturning
                    ? { duration: 0 }
                    : SPRING
                }
                whileHover={
                  isExiting ? undefined :
                  isFront
                    ? { scale: 1.025, boxShadow: `0 8px 24px ${cardBg}25` }
                    : slotIndex === 1 || slotIndex === 2
                    ? { opacity: 0.88, scale: slot.scale + 0.015 }
                    : undefined
                }
                whileTap={isFront ? { scale: 0.98 } : undefined}
                drag={isFront && !dismissing.current && order.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragStart={() => { dragDelta.current = 0; dragX.set(0) }}
                onDrag={(_, info) => { dragDelta.current = info.offset.x; dragX.set(info.offset.x) }}
                onDragEnd={(_, info) => {
                  dragX.set(0)
                  if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) {
                    dismiss(info.offset.x < 0 ? 'left' : 'right')
                  }
                }}
              >
                {/* Top content area */}
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                    background: topBg,
                    border: `1.5px solid ${cardBg}`,
                    borderRadius: 20,
                    padding: '24px 18px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                >
                  {/* Action/Detail trigger overlay button */}
                  {isFront && (
                    <motion.button
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        border: `1.2px solid ${catColor}`,
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: catColor,
                        zIndex: 20,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (task.originalTask && onClick) {
                          onClick(task.originalTask)
                        }
                      }}
                      whileHover={{ scale: 1.1, opacity: 0.8 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <ArrowUpRight weight="regular" size={13} />
                    </motion.button>
                  )}

                  {/* Category row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Icon weight="regular" size={12} style={{ color: catColor }} />
                    <span style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: catColor,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                      {task.category}
                    </span>
                  </div>

                  {/* Spacer */}
                  <div style={{ height: 18, flexShrink: 0 }} />

                  {/* Title */}
                  <h2 style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: titleColor,
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                    margin: 0,
                    flexShrink: 0,
                  }}>
                    {task.title}
                  </h2>

                  {/* Spacer */}
                  <div style={{ height: 6, flexShrink: 0 }} />

                  {/* Description */}
                  <p style={{
                    fontSize: 11,
                    color: descColor,
                    lineHeight: 1.5,
                    margin: 0,
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                  }}>
                    {task.description}
                  </p>

                  {/* Reward line & dynamic action */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-foreground/5 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <img
                        src={TJ_COIN_ICON}
                        alt="TJ"
                        className="w-3.5 h-3.5 object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs font-black text-rose-500">{task.reward}</span>
                    </div>

                    {isFront && task.originalTask && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (task.completed && !task.claimed) {
                            if (onClaim) await onClaim(task.id as string)
                          } else if (!task.completed) {
                            if (onClick) onClick(task.originalTask)
                          }
                        }}
                        className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full transition-all active:scale-95 cursor-pointer z-20",
                          task.completed 
                            ? task.claimed 
                              ? "bg-foreground/5 text-muted-foreground cursor-default" 
                              : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                            : "bg-foreground/10 hover:bg-foreground/15 text-foreground"
                        )}
                      >
                        {task.completed 
                          ? task.claimed 
                            ? "Claimed" 
                            : "Claim Reward"
                          : "Start"
                        }
                      </button>
                    )}
                  </div>

                </div>

                {/* Bottom accent footer */}
                <div style={{ padding: '8px 18px 10px', flexShrink: 0 }}>
                  <AnimatedProgress progress={task.progress} isActive={isFront} darkText={task.darkOnAccent} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Chevron navigation */}
      {order.length > 1 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {([
            { dir: 'left' as const, icon: <CaretLeft weight="regular" size={14} />, label: 'Previous' },
            { dir: 'right' as const, icon: <CaretRight weight="regular" size={14} />, label: 'Next' },
          ] as const).map(({ dir, icon, label }) => (
            <motion.button
              key={dir}
              onClick={() => dismiss(dir)}
              aria-label={label}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `1.2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}`,
                background: 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'center', justifyCenter: 'center',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.25)',
              }}
              whileHover={{
                scale: 1.08,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)',
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)',
              }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {icon}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
