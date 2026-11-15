import { motion } from 'framer-motion'
import { frames } from '../sakuga/timing'

interface CheckMarkProps {
  /** The tick strokes itself in when this turns true and vanishes when it turns false. */
  drawn: boolean
  /** Width in px. */
  size?: number
  className?: string
}

export function CheckMark({ drawn, size = 26, className = 'stroke-hot' }: CheckMarkProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 26 22"
      width={size}
      height={(size * 22) / 26}
      className="shrink-0 overflow-visible"
    >
      <motion.path
        d="M3 11.5 9.5 18 23 3.5"
        fill="none"
        className={className}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
        transition={
          drawn
            ? { pathLength: { duration: frames(5), ease: [0.3, 0, 0.2, 1] }, opacity: { duration: 0 } }
            : { duration: 0 }
        }
      />
    </svg>
  )
}
