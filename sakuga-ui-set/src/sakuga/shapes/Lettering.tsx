import { useMemo } from 'react'
import { brushOutline } from '../brush'
import { polygon, type Point } from '../geometry'
import type { Glyph } from '../glyphs'
import { createRng, subSeed } from '../random'

/** Distinct redraws of the same word that the boil cycles through. */
const REDRAWS = 3

function wordPath(word: readonly Glyph[], em: number, redraw: number, weight: number): string {
  const unit = em / 100
  const rng = createRng(subSeed(0x51ab, redraw))
  const total = word.reduce((sum, glyph) => sum + glyph.advance * (glyph.scale ?? 1), 0)
  let cursor = -total / 2
  let d = ''

  for (const glyph of word) {
    const scale = glyph.scale ?? 1
    const lift = glyph.lift ?? 0
    const left = cursor
    const place = ([x, y]: Point): Point => [
      (left + x * scale) * unit,
      ((y - 50) * scale + lift) * unit,
    ]

    for (const stroke of glyph.strokes) {
      const placed = {
        from: place(stroke.from),
        to: place(stroke.to),
        via: stroke.via && place(stroke.via),
        width: [stroke.width[0] * scale * unit, stroke.width[1] * scale * unit] as const,
        fray: stroke.fray,
      }
      d += polygon(brushOutline(placed, rng, weight))
    }
    cursor += glyph.advance * scale
  }
  return d
}

interface LetteringProps {
  word: readonly Glyph[]
  /** Height of a full-size character, in px. */
  em: number
  /** Which redraw this is; the brush edges differ a little on each. */
  drawing?: number
  /** 1 draws full strokes; lower values erode them into streaks. */
  weight?: number
  /** Width of the white halo that lifts the letters off whatever is behind them. */
  halo?: number
  className?: string
}

/** A sound effect in slanted brush lettering, centred on the origin. */
export function Lettering({
  word,
  em,
  drawing = 0,
  weight = 1,
  halo = 0,
  className = 'fill-ink',
}: LetteringProps) {
  const redraw = drawing % REDRAWS
  const d = useMemo(() => wordPath(word, em, redraw, weight), [word, em, redraw, weight])

  return (
    <path
      d={d}
      transform="rotate(-9) skewX(-15)"
      className={className}
      stroke={halo ? 'white' : undefined}
      strokeWidth={halo}
      strokeLinejoin="round"
      paintOrder="stroke"
    />
  )
}
