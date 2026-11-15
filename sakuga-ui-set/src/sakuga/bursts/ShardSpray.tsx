import { useMemo } from 'react'
import { Sprite } from '../FxLayer'
import { polar, TAU, type Point } from '../geometry'
import { createRng, range, sign, subSeed } from '../random'
import { Shard } from '../shapes/Shard'
import { frames } from '../timing'

interface ShardSprayProps {
  seed: number
  /** Point the fragments break away from. */
  at: Point
  count: number
  /** Distance the farthest fragment travels, in px. */
  reach: number
  /** Size range of the fragments, in px. */
  size?: readonly [number, number]
  /** Frames the fragments sit clustered at the point of impact before flying. */
  hang?: number
}

const FLIGHT = 12
const SIZES = [7, 15] as const

/**
 * Fragments that sit as a tight crystal on the impact for a beat, then
 * scatter: fast out, tumbling, and falling as they shrink away.
 */
export function ShardSpray({ seed, at, count, reach, size = SIZES, hang = 1 }: ShardSprayProps) {
  const shards = useMemo(() => {
    const rng = createRng(seed)
    const turn = range(rng, 0, TAU)
    return Array.from({ length: count }, (_, i) => ({
      seed: subSeed(seed, i),
      angle: turn + ((i + range(rng, -0.3, 0.3)) / count) * TAU,
      size: range(rng, size[0], size[1]),
      travel: range(rng, 0.45, 1) * reach,
      spin: range(rng, 100, 340) * sign(rng),
    }))
  }, [seed, count, reach, size])

  const flight = { delay: frames(hang), duration: frames(FLIGHT) }

  return shards.map((shard, i) => {
    const [nearX, nearY] = polar(shard.angle, shard.size * 0.8)
    const [farX, farY] = polar(shard.angle, shard.travel)
    const tilt = (shard.angle / TAU) * 360 + 90

    return (
      <Sprite
        key={i}
        initial={{ x: at[0] + nearX, y: at[1] + nearY, rotate: tilt, scale: 1.3 }}
        animate={{
          x: at[0] + farX,
          y: [at[1] + nearY, at[1] + farY * 0.85 - reach * 0.12, at[1] + farY + reach * 0.22],
          rotate: tilt + shard.spin,
          scale: [1.3, 1, 1, 0],
        }}
        transition={{
          x: { ...flight, ease: [0.1, 0.8, 0.3, 1] },
          y: { ...flight, times: [0, 0.42, 1], ease: ['easeOut', 'easeIn'] },
          rotate: { ...flight, ease: 'easeOut' },
          scale: { ...flight, times: [0, 0.2, 0.72, 1], ease: 'linear' },
        }}
      >
        <Shard seed={shard.seed} size={shard.size} />
      </Sprite>
    )
  })
}
