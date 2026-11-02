import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import '@/styles/circular-carousel.css'

const VISIBLE_COUNT = 5
const DEFAULT_RADIUS_X = 250
const DEFAULT_RADIUS_Y = 105

/**
 * Calculates the elliptical 3D coordinate and transform values for an item in the carousel.
 *
 * @param {number} index - Index of the item
 * @param {number} activeIndex - Currently active item index
 * @param {number} total - Total count of items
 * @param {number} radiusX - Horizontal radius of the orbital ellipse
 * @param {number} radiusY - Vertical radius of the orbital ellipse
 * @returns {{ x: number, y: number, scale: number, opacity: number, zIndex: number, adjustedOffset: number } | null}
 */
function getItemPosition(
  index,
  activeIndex,
  total,
  radiusX = DEFAULT_RADIUS_X,
  radiusY = DEFAULT_RADIUS_Y,
) {
  const offset = index - activeIndex
  const half = Math.floor(VISIBLE_COUNT / 2)
  let adjustedOffset = offset

  if (offset > half) adjustedOffset = offset - total
  if (offset < -half) adjustedOffset = offset + total

  if (Math.abs(adjustedOffset) > half * 2) return null

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI
  const x = Math.sin(angle) * radiusX
  const y = -Math.cos(angle) * radiusY

  const distance = Math.abs(adjustedOffset)
  const maxDistance = half + 1
  const scale = Math.max(0, 1 - (distance / maxDistance) * 0.3)
  const opacity = Math.max(0.3, 1 - (distance / maxDistance) * 0.7)
  const zIndex = VISIBLE_COUNT - distance

  return { x, y, scale, opacity, zIndex, adjustedOffset }
}

/**
 * Circular 3D Movable Carousel Component
 *
 * @param {Object} props
 * @param {Array<{ id: string, title: string, description: string, tag?: string, icon?: any }>} props.items
 * @param {number} [props.activeIndex] - Controlled active index
 * @param {(index: number) => void} [props.onActiveChange] - Callback invoked when active card changes
 * @param {boolean} [props.autoPlay=true] - Whether the carousel auto-advances
 * @param {number} [props.autoPlayInterval=4000] - Duration in ms between auto-rotations
 * @param {number} [props.radiusX=220] - Horizontal elliptical radius
 * @param {number} [props.radiusY=100] - Vertical elliptical radius
 * @param {string} [props.className] - Optional custom container class
 */
export function CircularCarousel({
  items = [],
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 4000,
  radiusX = DEFAULT_RADIUS_X,
  radiusY = DEFAULT_RADIUS_Y,
  className,
}) {
  const [internalIndex, setInternalIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex
  const total = items.length

  const goTo = useCallback(
    (index) => {
      if (total === 0) return
      const newIndex = ((index % total) + total) % total
      if (controlledIndex === undefined) {
        setInternalIndex(newIndex)
      }
      onActiveChange?.(newIndex)
    },
    [total, controlledIndex, onActiveChange],
  )

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  // Auto-play interval timer (pauses when user hovers or focuses)
  useEffect(() => {
    if (!autoPlay || isHovered || isFocused || total <= 1) return
    intervalRef.current = setInterval(next, autoPlayInterval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next, total])

  // Keyboard navigation support (Arrow Left & Arrow Right)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    const el = containerRef.current
    el?.addEventListener('keydown', handler)
    return () => el?.removeEventListener('keydown', handler)
  }, [next, prev])

  if (!items || items.length === 0) {
    return null
  }

  const activeItem = items[activeIndex] || items[0]

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn('circular-carousel', className)}
    >
      {/* 3D Circular / Elliptical Orbit Track */}
      <div className="circular-carousel__track">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const pos = getItemPosition(i, activeIndex, total, radiusX, radiusY)
            if (!pos) return null

            const isActive = i === activeIndex
            const ItemIcon = item.icon

            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  x: pos.x,
                  y: pos.y,
                  scale: pos.scale,
                  opacity: pos.opacity,
                  zIndex: pos.zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => goTo(i)}
                aria-label={item.title}
                aria-selected={isActive}
                role="option"
                className={cn(
                  'circular-carousel__card',
                  isActive
                    ? 'circular-carousel__card--active'
                    : 'circular-carousel__card--inactive',
                )}
              >
                {/* Card Tag Badge */}
                {item.tag && (
                  <span className="circular-carousel__tag">
                    {ItemIcon && <ItemIcon size={11} strokeWidth={2.4} />}
                    <span>{item.tag}</span>
                  </span>
                )}

                {/* Card Title & Description */}
                <div style={{ width: '100%' }}>
                  <h3 className="circular-carousel__title">
                    {item.title}
                  </h3>
                  <p className="circular-carousel__desc">
                    {item.description}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Center Index Count (e.g. 01 of 06) */}
      <motion.div
        key={activeItem.id || activeIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="circular-carousel__center"
      >
        <span className="circular-carousel__center-num">
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
        <span className="circular-carousel__center-sub">
          of {String(total).padStart(2, '0')}
        </span>
      </motion.div>

      {/* Navigation Controls */}
      <div className="circular-carousel__controls">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={prev}
          aria-label="Previous card"
          className="circular-carousel__btn"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </motion.button>

        {/* Dot Indicators */}
        <div className="circular-carousel__dots" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={cn(
                'circular-carousel__dot',
                i === activeIndex
                  ? 'circular-carousel__dot--active'
                  : 'circular-carousel__dot--inactive',
              )}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={next}
          aria-label="Next card"
          className="circular-carousel__btn"
        >
          <ChevronRight size={18} strokeWidth={2.4} />
        </motion.button>
      </div>
    </div>
  )
}

export default CircularCarousel
