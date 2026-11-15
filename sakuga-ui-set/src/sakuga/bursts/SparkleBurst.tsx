import { Cel } from '../FxLayer'
import { Needles } from '../shapes/Rays'
import { Sparkle } from '../shapes/Sparkle'
import { xsheet } from '../timing'
import { useCel } from '../useXSheet'

export interface Glint {
  x: number
  y: number
  /** Half the height of the star at rest, in px. */
  size: number
  /** Frames to wait before it appears. */
  wait?: number
}

/** A twinkle: a small turned diamond flares into a thin oversized star, holds, then winks out. */
const TWINKLE = xsheet<{ scale: number; pinch: number; turn: number }>(
  [1, { scale: 0.45, pinch: 0.36, turn: 45 }],
  [2, { scale: 1.34, pinch: 0.07, turn: 0 }],
  [5, { scale: 1, pinch: 0.14, turn: 0 }],
  [2, { scale: 0.76, pinch: 0.1, turn: 0 }],
  [2, { scale: 0.4, pinch: 0.3, turn: 45 }],
)

interface SparkleBurstProps {
  glints: readonly Glint[]
  onDone?: () => void
}

/** Pink four-point stars that twinkle once, each on its own delay. */
export function SparkleBurst({ glints, onDone }: SparkleBurstProps) {
  const longestWait = Math.max(0, ...glints.map((glint) => glint.wait ?? 0))
  const cel = useCel(TWINKLE.length + longestWait, onDone)

  return glints.map((glint, i) => {
    const pose = TWINKLE[cel - (glint.wait ?? 0)]
    return (
      pose && (
        <Cel key={i} x={glint.x} y={glint.y}>
          <g transform={`rotate(${pose.turn}) scale(${pose.scale})`}>
            <Sparkle size={glint.size} pinch={pose.pinch} />
          </g>
        </Cel>
      )
    )
  })
}

/** Short pink lines that flick outward from a hit and are gone in five frames. */
const FLICK = xsheet<{ inner: number; reach: number; width: number }>(
  [1, { inner: 0.3, reach: 0.82, width: 3.4 }],
  [2, { inner: 0.56, reach: 1, width: 2.8 }],
  [2, { inner: 0.86, reach: 1.1, width: 2 }],
)

interface FlickBurstProps {
  seed: number
  x?: number
  y?: number
  count: number
  radius: number
  stretch?: number
  /** Frames to wait before it appears. */
  wait?: number
}

export function FlickBurst({ seed, x = 0, y = 0, count, radius, stretch, wait = 0 }: FlickBurstProps) {
  const pose = FLICK[useCel(FLICK.length + wait + 1) - wait]
  return (
    pose && (
      <Cel x={x} y={y}>
        <Needles seed={seed} count={count} radius={radius} stretch={stretch} {...pose} />
      </Cel>
    )
  )
}
