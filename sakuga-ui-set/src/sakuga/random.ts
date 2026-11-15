export type Rng = () => number

/**
 * Seeded generator (mulberry32). Every burst draws from its own seed so its
 * shapes stay put across re-renders but differ from the burst before it.
 */
export function createRng(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Turns a counter (1, 2, 3…) into a well-mixed seed. */
export const seedFrom = (count: number) => Math.imul(count, 0x9e3779b1) >>> 0

/** Derives an independent seed, e.g. one per drawing of the same burst. */
export const subSeed = (seed: number, salt: number) =>
  (Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) + Math.imul(salt + 1, 0xc2b2ae35)) >>> 0

export const range = (rng: Rng, min: number, max: number) => min + (max - min) * rng()

export const sign = (rng: Rng) => (rng() < 0.5 ? -1 : 1)
