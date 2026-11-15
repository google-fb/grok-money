import { Cel, Sprite } from '../FxLayer'
import { polar, type Point } from '../geometry'
import { DON } from '../glyphs'
import { subSeed } from '../random'
import { Cloud } from '../shapes/Cloud'
import { Flash, SparkFan } from '../shapes/Flash'
import { Lettering } from '../shapes/Lettering'
import { Needles, Spikes } from '../shapes/Rays'
import { frames, onTwos, xsheet } from '../timing'
import { ShardSpray } from './ShardSpray'

/** Length of the whole effect, in frames. */
export const DON_CELS = 22

/** Where the pieces of the explosion go, in px from the middle of the control. */
export interface DonLayout {
  origin: Point
  /** Reach of the longest spike. */
  radius: number
  /** Horizontal stretch of the star, for wide controls. */
  stretch?: number
  /** Where ドン！ lands and how tall it is. */
  lettering: { x: number; y: number; em: number }
  /** Smoke puffs. They drift away from the origin. */
  clouds: readonly { x: number; y: number; size: number }[]
  /** Pink emphasis marks. They point away from the origin. */
  sparks: readonly Point[]
}

interface DonProps {
  /** Current frame of the effect. */
  cel: number
  seed: number
  layout: DonLayout
}

/*
 * Exposure sheets. Frame 0 is the impact frame: the star flashes as a solid
 * ink silhouette. It then turns lilac and its spikes break away outward,
 * redrawn every second frame, while the pink needles outrun them.
 */
const SPIKES = xsheet<{ tone: 'ink' | 'lilac'; inner: number; reach: number; girth: number }>(
  [1, { tone: 'ink', inner: 0, reach: 1.16, girth: 1.3 }],
  [2, { tone: 'lilac', inner: 0, reach: 1, girth: 1 }],
  [2, { tone: 'lilac', inner: 0.32, reach: 1.07, girth: 0.86 }],
  [2, { tone: 'lilac', inner: 0.6, reach: 1.12, girth: 0.62 }],
  [2, { tone: 'lilac', inner: 0.86, reach: 1.16, girth: 0.36 }],
)

const NEEDLES = xsheet<{ inner: number; reach: number; width: number }>(
  [2, { inner: 0.22, reach: 1, width: 3.6 }],
  [2, { inner: 0.5, reach: 1.06, width: 3 }],
  [2, { inner: 0.76, reach: 1.1, width: 2.4 }],
  [2, { inner: 0.96, reach: 1.13, width: 1.6 }],
)

/** The star and its speed lines: everything that bursts out from behind the control. */
export function DonBack({ cel, seed, layout }: DonProps) {
  const spikes = SPIKES[cel]
  const needles = NEEDLES[cel]

  return (
    <Cel x={layout.origin[0]} y={layout.origin[1]}>
      {needles && (
        <Needles
          seed={subSeed(seed, 1)}
          count={11}
          radius={layout.radius * 1.6}
          stretch={layout.stretch}
          {...needles}
        />
      )}
      {spikes && (
        <Spikes seed={seed} count={22} radius={layout.radius} stretch={layout.stretch} {...spikes} />
      )}
    </Cel>
  )
}

const CLOUDS_IN = 1
const CLOUD_LIFE = 18

/** ドン！ slams in oversized, rebounds, holds, then runs dry over three frames. */
const LETTERS = xsheet<{ scale: number; tilt: number; weight: number } | null>(
  [1, null],
  [1, { scale: 1.7, tilt: -6, weight: 1 }],
  [1, { scale: 0.9, tilt: 3, weight: 1 }],
  [1, { scale: 1.07, tilt: -1.5, weight: 1 }],
  [13, { scale: 1, tilt: 0, weight: 1 }],
  [1, { scale: 1.03, tilt: 0, weight: 0.74 }],
  [1, { scale: 1.06, tilt: 0, weight: 0.5 }],
  [1, { scale: 1.1, tilt: 0, weight: 0.28 }],
)

const SPARKS = xsheet<{ size: number; push: number } | null>(
  [1, null],
  [1, { size: 0.75, push: -4 }],
  [4, { size: 1, push: 2 }],
  [1, { size: 0.7, push: 6 }],
  [1, { size: 0.4, push: 9 }],
)

interface DonFrontProps extends DonProps {
  /** Exact point that was hit: the flash and the flying shards start here. */
  impact: Point
}

/** Smoke, shards, the flash and the lettering: everything that lands on top of the control. */
export function DonFront({ cel, seed, layout, impact }: DonFrontProps) {
  const [originX, originY] = layout.origin
  const letters = LETTERS[cel]
  const sparks = SPARKS[cel]
  const cloudDrawing = onTwos(cel - CLOUDS_IN)

  return (
    <>
      {cel >= CLOUDS_IN &&
        layout.clouds.map((cloud, i) => {
          const away = Math.atan2(cloud.y - originY, cloud.x - originX)
          const [driftX, driftY] = polar(away, cloud.size * 1.5)
          return (
            <Sprite
              key={i}
              initial={{ x: cloud.x - driftX * 0.5, y: cloud.y - driftY * 0.5 }}
              animate={{ x: cloud.x + driftX, y: cloud.y + driftY - cloud.size * 0.3 }}
              transition={{ duration: frames(CLOUD_LIFE), ease: [0.16, 1, 0.3, 1] }}
            >
              <Cloud
                seed={subSeed(seed, 20 + i)}
                size={cloud.size}
                age={(cloudDrawing * 2) / CLOUD_LIFE}
                drawing={cloudDrawing}
              />
            </Sprite>
          )
        })}

      {sparks &&
        layout.sparks.map(([x, y], i) => {
          const away = Math.atan2(y - originY, x - originX)
          const [pushX, pushY] = polar(away, sparks.push)
          return (
            <Cel key={i} x={x + pushX} y={y + pushY}>
              <SparkFan angle={away} size={18 * sparks.size} />
            </Cel>
          )
        })}

      {cel >= 1 && (
        <ShardSpray seed={subSeed(seed, 2)} at={impact} count={9} reach={layout.radius * 1.05} />
      )}

      {letters && (
        <Cel x={layout.lettering.x} y={layout.lettering.y}>
          <g transform={`rotate(${letters.tilt}) scale(${letters.scale})`}>
            <Lettering
              word={DON}
              em={layout.lettering.em}
              drawing={onTwos(cel)}
              weight={letters.weight}
              halo={5}
            />
          </g>
        </Cel>
      )}

      {cel < 2 && (
        <Cel x={impact[0]} y={impact[1]}>
          <Flash seed={subSeed(seed, 3 + cel)} radius={layout.radius * (cel === 0 ? 0.46 : 0.28)} />
        </Cel>
      )}
    </>
  )
}
