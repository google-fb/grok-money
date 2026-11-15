import type { ReactNode } from 'react'
import { Sprite } from '../FxLayer'
import { subSeed } from '../random'
import { Cloud } from '../shapes/Cloud'
import { frames, onTwos } from '../timing'
import { useCel } from '../useXSheet'

export interface Puff {
  x: number
  y: number
  size: number
  /** How far it drifts while it dissipates, in px. */
  dx: number
  dy: number
  /** Frames to wait before it appears. */
  wait?: number
}

interface PuffBurstProps {
  seed: number
  puffs: readonly Puff[]
  /** Frames a puff takes to dissipate. */
  life?: number
  lobes?: number
  onDone?: () => void
  /** Other drawings that stay up for as long as the burst does. */
  children?: ReactNode
}

/** Smoke puffs that pop, drift and thin out, redrawn on twos. */
export function PuffBurst({ seed, puffs, life = 12, lobes = 4, onDone, children }: PuffBurstProps) {
  const longestWait = Math.max(0, ...puffs.map((puff) => puff.wait ?? 0))
  const cel = useCel(life + longestWait, onDone)

  return (
    <>
      {children}
      {puffs.map((puff, i) => {
        const local = cel - (puff.wait ?? 0)
        if (local < 0 || local >= life) return null
        const drawing = onTwos(local)
        return (
          <Sprite
            key={i}
            initial={{ x: puff.x, y: puff.y }}
            animate={{ x: puff.x + puff.dx, y: puff.y + puff.dy }}
            transition={{ duration: frames(life), ease: [0.16, 1, 0.3, 1] }}
          >
            <Cloud
              seed={subSeed(seed, i)}
              size={puff.size}
              age={(drawing * 2) / life}
              drawing={drawing}
              lobes={lobes}
              line={puff.size < 12 ? 1.5 : 2}
            />
          </Sprite>
        )
      })}
    </>
  )
}
