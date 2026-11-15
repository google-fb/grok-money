import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface FxLayerProps {
  /** `back` draws behind the control, `front` over it. */
  depth: 'back' | 'front'
  children: ReactNode
}

/**
 * A zero-size overlay pinned to the centre of its control. Effects draw
 * outward from that point and never take part in layout or hit-testing.
 * The control between the two layers needs `relative z-10`.
 */
export function FxLayer({ depth, children }: FxLayerProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-1/2 left-1/2 size-0 ${depth === 'back' ? 'z-0' : 'z-20'}`}
    >
      {children}
    </div>
  )
}

interface CelProps {
  x?: number
  y?: number
  children: ReactNode
}

/** A held drawing: plain SVG that is simply redrawn when the cel changes. */
export function Cel({ x = 0, y = 0, children }: CelProps) {
  return (
    <svg className="absolute overflow-visible" width="1" height="1" style={{ left: x, top: y }}>
      {children}
    </svg>
  )
}

type SpriteProps = Omit<HTMLMotionProps<'div'>, 'children' | 'className'> & { children: ReactNode }

/**
 * A drawing that Motion moves. The wrapper has no size, so rotation and
 * scale pivot on the drawing's own origin.
 */
export function Sprite({ children, ...motionProps }: SpriteProps) {
  return (
    <motion.div className="absolute top-0 left-0 size-0" {...motionProps}>
      <svg className="absolute top-0 left-0 overflow-visible" width="1" height="1">
        {children}
      </svg>
    </motion.div>
  )
}
