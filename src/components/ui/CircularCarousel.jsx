import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import '@/styles/circular-carousel.css'

const VISIBLE_COUNT = 5

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
function getItemPosition(index, activeIndex, total, radiusX, radiusY) {
  const offset = index - activeIndex
  const half = Math.floor(VISIBLE_COUNT / 2) // half = 2
  let adjustedOffset = offset

  // Wrap around circularly
  if (offset > half) adjustedOffset = offset - total
  if (offset < -half) adjustedOffset = offset + total

  // ONLY render items within visible count (-2 to +2: 2 left, 1 center, 2 right)
  // This guarantees perfect symmetry: never leaves one side empty or piles extra cards on the other
  if (Math.abs(adjustedOffset) > half) return null

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI
  const x = Math.sin(angle) * radiusX
  const y = -Math.cos(angle) * radiusY

  const distance = Math.abs(adjustedOffset)
  // Calibrated scale, opacity and z-index: active is crisp, neighbors readable, far cards subtle
  const scale = distance === 0 ? 1 : distance === 1 ? 0.9 : 0.74
  const opacity = distance === 0 ? 1 : distance === 1 ? 0.75 : 0.25
  const zIndex = distance === 0 ? 10 : distance === 1 ? 8 : 4

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
 * @param {number} [props.autoPlayInterval=4500] - Duration in ms between auto-rotations
 * @param {number} [props.radiusX] - Custom horizontal elliptical radius
 * @param {number} [props.radiusY] - Custom vertical elliptical radius
 * @param {string} [props.className] - Optional custom container class
 */
export function CircularCarousel({
  items = [],
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 4500,
  radiusX,
  radiusY,
  className,
}) {
  const [internalIndex, setInternalIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  )

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Responsive radius calibrated so the 5 cards fan out with generous breathing room
  // and stay perfectly centered inside the container without overflowing
  const effectiveRadiusX =
    radiusX ??
    (windowWidth >= 1200
      ? 350
      : windowWidth >= 960
        ? 285
        : windowWidth >= 640
          ? 210
          : 130)

  const effectiveRadiusY =
    radiusY ??
    (windowWidth >= 1200
      ? 120
      : windowWidth >= 960
        ? 95
        : windowWidth >= 640
          ? 75
          : 50)

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

  // Auto-play interval timer (pauses on hover or focus)
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

  // Drag/swipe gesture handling
  const handleDragEnd = (_, info) => {
    const threshold = 40
    if (info.offset.x < -threshold) {
      next()
    } else if (info.offset.x > threshold) {
      prev()
    }
  }

  if (!items || items.length === 0) {
    return null
  }

  const activeItem = items[activeIndex] || items[0]

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="3D Circular Carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn('circular-carousel', className)}
    >
      {/* 3D Circular / Elliptical Orbit Track with Swipe/Drag Support */}
      <motion.div
        className="circular-carousel__track"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const pos = getItemPosition(i, activeIndex, total, effectiveRadiusX, effectiveRadiusY)
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
                    {ItemIcon && <ItemIcon size={13} strokeWidth={2.4} />}
                    <span>{item.tag}</span>
                  </span>
                )}

                {/* Card Title & Full Description */}
                <div className="circular-carousel__content">
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
      </motion.div>

      {/* Center Index Count (e.g. 01 of 06) matching Image 2 */}
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

      {/* Navigation Controls matching Image 2 */}
      <div className="circular-carousel__controls">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={prev}
          aria-label="Previous card"
          className="circular-carousel__btn"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
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
          <ChevronRight size={22} strokeWidth={2.4} />
        </motion.button>
      </div>
    </div>
  )
}

export default CircularCarousel
