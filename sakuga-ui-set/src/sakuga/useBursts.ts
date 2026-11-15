import { useCallback, useState } from 'react'
import { useStage } from '../showcase/stage-context'
import { seedFrom } from './random'

export interface Burst<T> {
  id: number
  /** Feeds the burst's random shapes, so each one is drawn differently. */
  seed: number
  data: T
}

let nextId = 1

/**
 * Keeps the list of bursts currently on screen for one control. Each spawn
 * mounts a fresh burst that plays once and dismisses itself, so rapid input
 * simply stacks them. `limit` drops the oldest when input outruns playback.
 */
export function useBursts<T = undefined>(limit = 6) {
  const [bursts, setBursts] = useState<Burst<T>[]>([])
  const stage = useStage()

  const spawn = useCallback(
    (data: T) => {
      if (!stage.fx) return
      stage.raise()
      const id = nextId++
      const burst: Burst<T> = { id, seed: seedFrom(id), data }
      setBursts((live) => [...live.slice(Math.max(0, live.length - limit + 1)), burst])
    },
    [stage, limit],
  )

  const dismiss = useCallback((id: number) => {
    setBursts((live) => live.filter((burst) => burst.id !== id))
  }, [])

  return { bursts, spawn, dismiss }
}
