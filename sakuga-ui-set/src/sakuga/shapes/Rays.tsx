import { useMemo } from 'react'
import { polygon, TAU, type Point } from '../geometry'
import { createRng, range } from '../random'

interface Ray {
  angle: number
  /** Fraction of the burst radius this ray reaches. */
  length: number
  girth: number
}

function makeRays(seed: number, count: number, shortest: number): Ray[] {
  const rng = createRng(seed)
  const turn = range(rng, 0, TAU)
  return Array.from({ length: count }, (_, i) => ({
    angle: turn + ((i + range(rng, -0.35, 0.35)) / count) * TAU,
    // Long and short rays alternate, so the outline reads as a star rather than a disc.
    length: i % 2 === 0 ? range(rng, 0.8, 1) : range(rng, shortest, shortest + 0.28),
    girth: range(rng, 0.75, 1.25),
  }))
}

interface RaysProps {
  seed: number
  count: number
  /** Length of the longest ray at `reach` 1, in px. */
  radius: number
  /** Where each ray starts and ends, as fractions of its own length. */
  inner: number
  reach: number
  /** Horizontal stretch, for bursts behind wide controls. */
  stretch?: number
}

interface SpikesProps extends RaysProps {
  /** Thickness multiplier; spikes thin out as they fly off. */
  girth?: number
  /** `ink` is the solid silhouette of an impact frame. */
  tone?: 'lilac' | 'ink'
}

/** The jagged star of an impact: outlined spikes that shoot away from the centre. */
export function Spikes({
  seed,
  count,
  radius,
  inner,
  reach,
  girth = 1,
  tone = 'lilac',
  stretch = 1,
}: SpikesProps) {
  const rays = useMemo(() => makeRays(seed, count, 0.42), [seed, count])

  return (
    <g
      className={tone === 'ink' ? 'fill-ink' : 'fill-lilac stroke-line'}
      strokeWidth={1.5}
      strokeLinejoin="round"
    >
      {rays.map((ray, i) => {
        const ux = Math.cos(ray.angle)
        const uy = Math.sin(ray.angle)
        const from = inner * ray.length * radius
        const to = reach * ray.length * radius
        const half = ray.girth * girth * ray.length * radius * 0.085
        const at = (along: number, across: number): Point => [
          (ux * along - uy * across) * stretch,
          uy * along + ux * across,
        ]
        const notch = from + Math.min((to - from) * 0.3, half * 1.5)
        return <path key={i} d={polygon([at(from, half), at(to, 0), at(from, -half), at(notch, 0)])} />
      })}
    </g>
  )
}

interface NeedlesProps extends RaysProps {
  /** Widest point of a needle, in px. */
  width?: number
}

/** Speed lines: thin pink needles that outrun the spikes. */
export function Needles({ seed, count, radius, inner, reach, width = 3, stretch = 1 }: NeedlesProps) {
  const rays = useMemo(() => makeRays(seed, count, 0.55), [seed, count])

  return (
    <g className="fill-hot">
      {rays.map((ray, i) => {
        const ux = Math.cos(ray.angle)
        const uy = Math.sin(ray.angle)
        const from = inner * ray.length * radius
        const to = reach * ray.length * radius
        const half = (width * ray.girth) / 2
        const at = (along: number, across: number): Point => [
          (ux * along - uy * across) * stretch,
          uy * along + ux * across,
        ]
        const belly = from + (to - from) * 0.3
        return <path key={i} d={polygon([at(from, 0), at(belly, half), at(to, 0), at(belly, -half)])} />
      })}
    </g>
  )
}
