import { Fragment, useMemo } from 'react'
import { clamp01, lerp, polar, TAU } from '../geometry'
import { createRng, range, subSeed } from '../random'

interface Lobe {
  /** Direction and distance from the middle of the cloud, in units of its size. */
  angle: number
  reach: number
  radius: number
  /** Ages (0–1) at which the lobe starts to thin and at which it is gone. */
  thin: number
  gone: number
  /** How much of the lobe is lit: lobes on the underside sit mostly in shade. */
  lit: number
}

function makeLobes(seed: number, count: number): Lobe[] {
  const rng = createRng(seed)
  const turn = range(rng, 0, TAU)
  const around: Lobe[] = Array.from({ length: count }, (_, i) => {
    const angle = turn + ((i + range(rng, -0.22, 0.22)) / count) * TAU
    return {
      angle,
      reach: range(rng, 0.4, 0.52),
      radius: range(rng, 0.4, 0.54),
      thin: range(rng, 0.2, 0.4),
      gone: range(rng, 0.72, 1),
      lit: lerp(0.9, 0.58, (Math.sin(angle) + 1) / 2),
    }
  })
  // Upper lobes are painted first so the shaded ones underneath overlap them.
  around.sort((a, b) => Math.sin(a.angle) - Math.sin(b.angle))
  // One big body in the middle keeps the puff solid until the lobes have drifted off.
  return [{ angle: 0, reach: 0, radius: 0.78, thin: 0.3, gone: 0.86, lit: 0.82 }, ...around]
}

/** Scale of the first drawings: the puff bursts past its size, then relaxes. */
const pop = (age: number) =>
  age < 0.1 ? lerp(0.78, 1.12, age / 0.1) : lerp(1.12, 1, clamp01((age - 0.1) / 0.14))

const smooth = (t: number) => t * t * (3 - 2 * t)

/** Half-sweep of the outline arc drawn on a lobe's outward side, in radians. */
const ARC = (116 / 180) * Math.PI

interface CloudProps {
  seed: number
  /** Rough radius of the whole puff, in px. */
  size: number
  /** 0 is a fresh puff, 1 is fully dissipated. */
  age: number
  /** Which redraw this is; each one wobbles the outline a little. */
  drawing?: number
  lobes?: number
  /** Outline width, in px. */
  line?: number
}

/**
 * A cel-shaded smoke puff: white lobes with a lilac underside and one
 * outline around the lot. It is drawn afresh for every `age`, which is how
 * it dissipates — lobes drift apart and shrink away one by one.
 */
export function Cloud({ seed, size, age, drawing = 0, lobes = 5, line = 2 }: CloudProps) {
  const shape = useMemo(() => makeLobes(seed, lobes), [seed, lobes])
  if (age >= 1) return null

  const boil = createRng(subSeed(seed, drawing))
  const scale = size * pop(age)
  const spread = 1 + 0.5 * age

  const discs = shape.flatMap((lobe) => {
    const left = 1 - smooth(clamp01((age - lobe.thin) / (lobe.gone - lobe.thin)))
    const r = lobe.radius * scale * left * range(boil, 0.96, 1.04)
    const [x, y] = polar(lobe.angle, lobe.reach * scale * spread)
    const wobble = size * 0.03
    const disc = { x: x + range(boil, -wobble, wobble), y: y + range(boil, -wobble, wobble), r, lobe }
    return r > 1.5 ? [disc] : []
  })

  return (
    <g>
      {discs.map(({ x, y, r }, i) => (
        <circle key={i} cx={x} cy={y} r={r + line} className="fill-line" />
      ))}
      {discs.map(({ x, y, r, lobe }, i) => {
        const glow = r * lobe.lit
        const shift = (r - glow) * 0.6
        const edge = r + line / 2
        const [ax, ay] = polar(lobe.angle - ARC, edge)
        const [bx, by] = polar(lobe.angle + ARC, edge)
        return (
          <Fragment key={i}>
            <circle cx={x} cy={y} r={r} className="fill-lilac" />
            <circle cx={x - shift} cy={y - shift} r={glow} className="fill-white" />
            {lobe.reach > 0 && (
              <path
                d={`M${x + ax} ${y + ay}A${edge} ${edge} 0 1 1 ${x + bx} ${y + by}`}
                className="fill-none stroke-line"
                strokeWidth={line}
                strokeLinecap="round"
              />
            )}
          </Fragment>
        )
      })}
    </g>
  )
}
