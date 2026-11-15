import type { BrushStroke } from './brush'

/**
 * Hand-lettered sound effects. Each character is a few brush strokes on a
 * 100-unit square (y grows downward), so the lettering needs no font.
 */
export interface Glyph {
  strokes: readonly BrushStroke[]
  /** Horizontal space the character takes. */
  advance: number
  /** Small kana are drawn at a fraction of the full size. */
  scale?: number
  /** Vertical shift, in units of the square. */
  lift?: number
}

const DO: Glyph = {
  advance: 98,
  strokes: [
    { from: [34, 0], to: [30, 100], width: [25, 22], fray: [0.25, 0.55] },
    { from: [40, 37], to: [88, 63], width: [22, 18], fray: [0, 0.5] },
    { from: [63, 3], to: [72, 22], width: [11, 9], fray: [0.15, 0.35] },
    { from: [83, -3], to: [93, 17], width: [11, 9], fray: [0.15, 0.35] },
  ],
}

const N: Glyph = {
  advance: 100,
  scale: 0.94,
  lift: 4,
  strokes: [
    { from: [8, 12], to: [38, 36], width: [21, 17], fray: [0.2, 0.45] },
    { from: [6, 96], via: [58, 92], to: [96, 14], width: [20, 27], fray: [0.55, 0.4] },
  ],
}

const BANG: Glyph = {
  advance: 52,
  scale: 1.14,
  lift: -6,
  strokes: [
    { from: [38, -10], to: [26, 66], width: [29, 10], fray: [0.45, 0.35] },
    { from: [23, 82], to: [20, 100], width: [15, 13], fray: [0.12, 0.25] },
  ],
}

const SHI: Glyph = {
  advance: 100,
  strokes: [
    { from: [10, 14], to: [32, 28], width: [15, 12], fray: [0.1, 0.3] },
    { from: [4, 44], to: [26, 57], width: [15, 12], fray: [0.1, 0.3] },
    { from: [12, 96], via: [62, 90], to: [94, 20], width: [14, 20], fray: [0.4, 0.3] },
  ],
}

const SMALL_YU: Glyph = {
  advance: 84,
  scale: 0.74,
  lift: 16,
  strokes: [
    { from: [20, 40], to: [74, 40], width: [14, 14], fray: [0.1, 0.1] },
    { from: [70, 36], to: [62, 92], width: [14, 13], fray: [0, 0.2] },
    { from: [4, 94], to: [98, 94], width: [15, 13], fray: [0.2, 0.4] },
  ],
}

const SMALL_TSU: Glyph = {
  advance: 84,
  scale: 0.74,
  lift: 16,
  strokes: [
    { from: [10, 28], to: [22, 54], width: [14, 12], fray: [0.1, 0.3] },
    { from: [38, 22], to: [50, 48], width: [14, 12], fray: [0.1, 0.3] },
    { from: [90, 20], via: [84, 70], to: [34, 98], width: [18, 12], fray: [0.2, 0.5] },
  ],
}

/** ドン！ — a heavy thud. */
export const DON: readonly Glyph[] = [DO, N, BANG]

/** シュッ — something whipping past. */
export const SHU: readonly Glyph[] = [SHI, SMALL_YU, SMALL_TSU]
