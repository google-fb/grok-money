/**
 * Effects are timed like an animator's exposure sheet: 24 frames a second,
 * with most drawings held for two frames ("on twos").
 */
export const FPS = 24
export const FRAME_MS = 1000 / FPS

/** Seconds spanned by `n` frames, for Motion durations and delays. */
export const frames = (n: number) => n / FPS

/** Index of the drawing shown on a frame when each drawing is held for two. */
export const onTwos = (cel: number) => cel >> 1

/**
 * Easing that holds every keyframe until the next one, so a Motion tween
 * plays as distinct poses instead of gliding between them.
 */
export const hold = (t: number) => (t < 1 ? 0 : 1)

/**
 * Builds an exposure sheet from runs of `[frames, drawing]`: the drawing to
 * show on every frame of an effect. Frames past the end show nothing.
 */
export function xsheet<T>(...runs: (readonly [frames: number, drawing: T])[]): T[] {
  return runs.flatMap(([length, drawing]) => Array.from({ length }, () => drawing))
}
