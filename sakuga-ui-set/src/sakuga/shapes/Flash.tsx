import { useMemo } from 'react'
import { polar, polygon, TAU } from '../geometry'
import { createRng, range } from '../random'

interface FlashProps {
  seed: number
  radius: number
  points?: number
}

/** The white-hot star at the point of impact. */
export function Flash({ seed, radius, points = 9 }: FlashProps) {
  const d = useMemo(() => {
    const rng = createRng(seed)
    const turn = range(rng, 0, TAU)
    return polygon(
      Array.from({ length: points * 2 }, (_, i) =>
        polar(
          turn + (i / (points * 2)) * TAU,
          radius * (i % 2 === 0 ? range(rng, 0.6, 1) : range(rng, 0.2, 0.3)),
        ),
      ),
    )
  }, [seed, radius, points])

  return <path d={d} className="fill-white stroke-lilac" strokeWidth={1.5} strokeLinejoin="round" />
}

interface SparkFanProps {
  /** Direction the fan opens towards, in radians. */
  angle: number
  size: number
}

/** Three short pink wedges fanning outward: a comic-book emphasis mark. */
export function SparkFan({ angle, size }: SparkFanProps) {
  return (
    <g className="fill-hot">
      {[-0.5, 0, 0.5].map((offset) => {
        const length = offset === 0 ? size : size * 0.72
        const tip = polar(angle + offset, size * 0.3)
        const [ex, ey] = polar(angle + offset, size * 0.3 + length)
        const [nx, ny] = polar(angle + offset + TAU / 4, length * 0.2)
        return (
          <path
            key={offset}
            d={polygon([tip, [ex + nx, ey + ny], [ex - nx, ey - ny]])}
          />
        )
      })}
    </g>
  )
}
