export type Point = readonly [x: number, y: number]

export const TAU = Math.PI * 2

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export const polar = (angle: number, radius: number): Point => [
  Math.cos(angle) * radius,
  Math.sin(angle) * radius,
]

const round = (v: number) => Math.round(v * 10) / 10

/** Closed SVG path through the given points. */
export const polygon = (points: readonly Point[]) =>
  `M${points.map(([x, y]) => `${round(x)} ${round(y)}`).join('L')}Z`
