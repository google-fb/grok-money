import { useMemo } from 'react'
import { polygon, type Point } from '../geometry'
import { createRng, range } from '../random'

interface ShardProps {
  seed: number
  /** Distance from the middle to the tip, in px. */
  size: number
  /** 1 is a long splinter, 0 a squat pebble. */
  slim?: number
}

/** A faceted fragment pointing up: one lit face, one in shade. */
export function Shard({ seed, size, slim = 1 }: ShardProps) {
  const [whole, shade] = useMemo(() => {
    const rng = createRng(seed)
    const width = size * range(rng, 0.34, 0.5) * (2 - slim)
    const tip: Point = [range(rng, -0.12, 0.12) * size, -size]
    const right: Point = [width, range(rng, -0.3, 0.1) * size]
    const tail: Point = [range(rng, -0.3, 0.3) * width, size * range(rng, 0.4, 0.7) * (0.6 + 0.4 * slim)]
    const left: Point = [-width * range(rng, 0.7, 1), range(rng, -0.1, 0.25) * size]
    const ridge: Point = [range(rng, -0.2, 0.15) * width, range(rng, -0.2, 0.1) * size]
    return [polygon([tip, right, tail, left]), polygon([tip, right, tail, ridge])]
  }, [seed, size, slim])

  return (
    <g className="stroke-line" strokeWidth={1.5} strokeLinejoin="round">
      <path d={whole} className="fill-white" />
      <path d={shade} className="fill-lilac" />
    </g>
  )
}
