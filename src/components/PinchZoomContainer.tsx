import { useRef, useState, useEffect, type ReactNode } from 'react'

interface PinchZoomContainerProps {
  children: ReactNode
  minScale?: number
  maxScale?: number
}

export default function PinchZoomContainer({
  children,
  minScale = 0.5,
  maxScale = 3,
}: PinchZoomContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPinching, setIsPinching] = useState(false)

  // Touch state refs (to avoid re-renders during gesture)
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 1,
    initialPosition: { x: 0, y: 0 },
    lastTouchCenter: { x: 0, y: 0 },
    isDragging: false,
  })

  // Calculate distance between two touch points
  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Calculate center point between two touches
  const getTouchCenter = (touch1: Touch, touch2: Touch) => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        setIsPinching(true)
        touchState.current.initialDistance = getDistance(e.touches[0], e.touches[1])
        touchState.current.initialScale = scale
        touchState.current.initialPosition = { ...position }
        touchState.current.lastTouchCenter = getTouchCenter(e.touches[0], e.touches[1])
      } else if (e.touches.length === 1 && scale > 1) {
        // Allow panning when zoomed in
        touchState.current.isDragging = true
        touchState.current.lastTouchCenter = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
        touchState.current.initialPosition = { ...position }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinching) {
        e.preventDefault()
        const currentDistance = getDistance(e.touches[0], e.touches[1])
        const currentCenter = getTouchCenter(e.touches[0], e.touches[1])

        // Calculate new scale
        const scaleChange = currentDistance / touchState.current.initialDistance
        let newScale = touchState.current.initialScale * scaleChange
        newScale = Math.min(Math.max(newScale, minScale), maxScale)

        // Calculate position adjustment for zoom center
        const dx = currentCenter.x - touchState.current.lastTouchCenter.x
        const dy = currentCenter.y - touchState.current.lastTouchCenter.y

        setScale(newScale)
        setPosition((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }))

        touchState.current.lastTouchCenter = currentCenter
      } else if (e.touches.length === 1 && touchState.current.isDragging && scale > 1) {
        // Pan while zoomed
        const dx = e.touches[0].clientX - touchState.current.lastTouchCenter.x
        const dy = e.touches[0].clientY - touchState.current.lastTouchCenter.y

        setPosition((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }))

        touchState.current.lastTouchCenter = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        setIsPinching(false)
      }
      if (e.touches.length === 0) {
        touchState.current.isDragging = false

        // Reset to default if zoomed out
        if (scale <= 1) {
          setScale(1)
          setPosition({ x: 0, y: 0 })
        }
      }
    }

    // Add event listeners with passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [scale, position, isPinching, minScale, maxScale])

  // Double tap to reset
  const lastTap = useRef(0)
  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      // Double tap detected - reset zoom
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
    lastTap.current = now
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden touch-none"
      onTouchEnd={handleDoubleTap}
    >
      <div
        ref={contentRef}
        className="w-full h-full origin-center transition-transform duration-75"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
      {/* Zoom indicator */}
      {scale !== 1 && (
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  )
}
