import { cancelFrame, frame, time, type FrameData } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FRAME_MS } from './timing'

/**
 * Counts 24fps frames on Motion's frame loop, reporting each new frame and
 * then `null` once `length` frames have played.
 */
function runCels(length: number, onCel: (cel: number | null) => void): VoidFunction {
  const start = time.now()
  let shown = 0

  const tick = ({ timestamp }: FrameData) => {
    const cel = Math.max(0, Math.floor((timestamp - start) / FRAME_MS))
    if (cel === shown) return
    shown = cel
    if (cel < length) {
      onCel(cel)
    } else {
      cancelFrame(tick)
      onCel(null)
    }
  }

  frame.update(tick, true)
  return () => cancelFrame(tick)
}

/**
 * Current frame of an effect that plays once from the moment it mounts.
 * `onDone` fires after the last frame, which is when a burst removes itself.
 */
export function useCel(length: number, onDone?: () => void): number {
  const [cel, setCel] = useState(0)
  const done = useRef(onDone)

  useEffect(() => {
    done.current = onDone
  })

  useEffect(
    () =>
      runCels(length, (next) => {
        if (next === null) done.current?.()
        else setCel(next)
      }),
    [length],
  )

  return cel
}

/**
 * A replayable frame counter for effects that a control drives itself.
 * The frame is `null` while idle; `play` restarts it from frame 0.
 */
export function useXSheet(length: number): [cel: number | null, play: () => void] {
  const [cel, setCel] = useState<number | null>(null)
  const stop = useRef<VoidFunction | null>(null)

  const play = useCallback(() => {
    stop.current?.()
    setCel(0)
    stop.current = runCels(length, setCel)
  }, [length])

  useEffect(() => () => stop.current?.(), [])

  return [cel, play]
}
