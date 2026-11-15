import { lerp, type Point } from './geometry'
import { range, type Rng } from './random'

/** One stroke of a brush pen: a centre line whose width changes along it. */
export interface BrushStroke {
  from: Point
  to: Point
  /** Control point that bends the stroke. */
  via?: Point
  /** Width at the start and at the end. */
  width: readonly [number, number]
  /** How far dry-brush streaks run past the start and the end, as a fraction of the width there. */
  fray: readonly [number, number]
}

function centreAt({ from, via, to }: BrushStroke, t: number): Point {
  if (!via) return [lerp(from[0], to[0], t), lerp(from[1], to[1], t)]
  const u = 1 - t
  return [
    u * u * from[0] + 2 * u * t * via[0] + t * t * to[0],
    u * u * from[1] + 2 * u * t * via[1] + t * t * to[1],
  ]
}

function headingAt({ from, via, to }: BrushStroke, t: number): Point {
  const dx = via ? lerp(via[0] - from[0], to[0] - via[0], t) : to[0] - from[0]
  const dy = via ? lerp(via[1] - from[1], to[1] - via[1], t) : to[1] - from[1]
  const length = Math.hypot(dx, dy) || 1
  return [dx / length, dy / length]
}

/**
 * The ragged edge where a brush lifts off: a zigzag from corner `a` to
 * corner `b` whose teeth run along the stroke, like separated bristles.
 */
function streaks(a: Point, b: Point, [hx, hy]: Point, fray: number, rng: Rng): Point[] {
  const width = Math.hypot(b[0] - a[0], b[1] - a[1])
  const reach = width * fray
  const count = Math.min(5, Math.max(2, Math.round(width / 5)))
  const points: Point[] = []

  for (let i = 0; i < count; i++) {
    const peak = (i + range(rng, 0.3, 0.7)) / count
    const out = reach * range(rng, 0.35, 1)
    points.push([lerp(a[0], b[0], peak) + hx * out, lerp(a[1], b[1], peak) + hy * out])

    if (i < count - 1) {
      const valley = (i + 1) / count
      const back = reach * range(rng, 0, 0.4)
      points.push([lerp(a[0], b[0], valley) - hx * back, lerp(a[1], b[1], valley) - hy * back])
    }
  }
  return points
}

/**
 * Outline of a brush stroke as a closed polygon. `rng` roughens the edges,
 * so redrawing with another seed makes the line "boil". A `weight` below 1
 * thins the stroke and lengthens its streaks, as if the ink were running out.
 */
export function brushOutline(stroke: BrushStroke, rng: Rng, weight = 1): Point[] {
  const samples = stroke.via ? 8 : 2
  const left: Point[] = []
  const right: Point[] = []

  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const [x, y] = centreAt(stroke, t)
    const [hx, hy] = headingAt(stroke, t)
    const half = (lerp(stroke.width[0], stroke.width[1], t) * weight * range(rng, 0.93, 1.07)) / 2
    left.push([x + hy * half, y - hx * half])
    right.push([x - hy * half, y + hx * half])
  }

  const [startX, startY] = headingAt(stroke, 0)
  const ragged = 1 + (1 - weight) * 2

  return [
    ...left,
    ...streaks(left[samples], right[samples], headingAt(stroke, 1), stroke.fray[1] * ragged, rng),
    ...right.toReversed(),
    ...streaks(right[0], left[0], [-startX, -startY], stroke.fray[0] * ragged, rng),
  ]
}
