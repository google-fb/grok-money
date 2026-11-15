import { motion, useAnimate, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { DON_CELS, DonBack, DonFront, type DonLayout } from '../sakuga/bursts/DonBurst'
import { PuffBurst } from '../sakuga/bursts/PuffBurst'
import { ShardSpray } from '../sakuga/bursts/ShardSpray'
import { FxLayer, Sprite } from '../sakuga/FxLayer'
import { seedFrom, subSeed } from '../sakuga/random'
import { Cloud } from '../sakuga/shapes/Cloud'
import { frames, onTwos } from '../sakuga/timing'
import { useBursts } from '../sakuga/useBursts'
import { useCel, useXSheet } from '../sakuga/useXSheet'
import { useStage } from '../showcase/stage-context'
import { CheckMark } from './CheckMark'

const WIDTH = 280
const BORDER = 5
/** Width the fill can grow to. */
const INNER = WIDTH - BORDER * 2

/** The explosion goes off at the far end of the bar, where the fill slams home. */
const BURST: DonLayout = {
  origin: [108, 0],
  radius: 100,
  lettering: { x: -44, y: -84, em: 74 },
  clouds: [
    { x: 58, y: -30, size: 19 },
    { x: 150, y: -36, size: 20 },
    { x: 160, y: 24, size: 17 },
    { x: 84, y: 36, size: 18 },
    { x: 14, y: -8, size: 15 },
  ],
  sparks: [
    [128, -110],
    [196, -44],
  ],
}

/** Edge travel between two trail puffs, in px. */
const PUFF_EVERY = 15
const PEBBLE_SIZES = [4, 8] as const

type Phase = 'idle' | 'running' | 'done'

/** The smoke the fill pushes ahead of itself: it never dissipates, only boils. */
function Steam({ seed }: { seed: number }) {
  const drawing = onTwos(useCel(Infinity))
  const breath = 0.1 + (drawing % 3) * 0.07
  return (
    <>
      <g transform="translate(-30 13)">
        <Cloud seed={subSeed(seed, 1)} size={15} lobes={4} age={breath} drawing={drawing} />
      </g>
      <g transform="translate(6 -17)">
        <Cloud seed={seed} size={37} lobes={7} age={breath} drawing={drawing} line={2.5} />
      </g>
      <g transform="translate(24 16)">
        <Cloud seed={subSeed(seed, 2)} size={14} lobes={4} age={breath} drawing={drawing + 1} />
      </g>
    </>
  )
}

/** The scratched ground line the bar seems to grind along. */
function Ground() {
  return (
    <svg width={WIDTH} height="12" className="fill-none stroke-line" strokeWidth={2} strokeLinecap="round">
      <path d={`M1 10H${WIDTH - 1}`} />
      {[26, 66, 104, 146, 184, 226].map((x) => (
        <path key={x} d={`M${x} 10l4-6M${x + 7} 10l4-6`} />
      ))}
    </svg>
  )
}

export function Progress() {
  const stage = useStage()
  const [phase, setPhase] = useState<Phase>('idle')
  const [percent, setPercent] = useState(0)
  const [runs, setRuns] = useState(0)
  const [bar, animate] = useAnimate<HTMLDivElement>()
  const [cel, play] = useXSheet(DON_CELS)
  const { bursts, spawn, dismiss } = useBursts<{ x: number; count: number }>(10)

  const progress = useMotionValue(0)
  const width = useTransform(progress, (p) => `${p * 100}%`)
  const edge = useTransform(progress, (p) => (p - 0.5) * INNER)
  const ground = useTransform(progress, (p) => 14 + p * INNER)
  const lastPuff = useRef({ x: -INNER / 2, count: 0 })

  useMotionValueEvent(progress, 'change', (p) => {
    setPercent(Math.round(p * 100))
    const x = (p - 0.5) * INNER
    if (phase !== 'running' || Math.abs(x - lastPuff.current.x) < PUFF_EVERY) return
    const count = lastPuff.current.count + 1
    lastPuff.current = { x, count }
    spawn({ x, count })
  })

  async function run() {
    if (phase === 'running') return
    setPhase('running')
    setRuns((count) => count + 1)
    lastPuff.current = { x: -INNER / 2, count: 0 }
    progress.set(0)

    if (!stage.fx) {
      await animate(progress, 1, { duration: 1.4, ease: 'linear' })
      setPhase('done')
      return
    }

    stage.raise()
    // It charges, stalls and lurches forward rather than filling evenly.
    await animate(progress, [0, 0.26, 0.31, 0.6, 0.64, 0.88], {
      duration: 1.9,
      times: [0, 0.2, 0.34, 0.6, 0.74, 1],
      ease: ['easeOut', 'easeInOut', 'easeOut', 'easeInOut', 'easeOut'],
    })
    // Anticipation: it draws back a little before the last hit.
    await animate(progress, 0.84, { duration: frames(6), ease: 'easeOut' })
    await animate(progress, 1, { duration: frames(2), ease: 'easeIn' })

    setPhase('done')
    play()
    stage.shake(1)
    animate(
      bar.current,
      { scaleX: [1.07, 1], scaleY: [0.82, 1] },
      { type: 'spring', stiffness: 560, damping: 12 },
    )
  }

  const struck = cel === 1 || cel === 2
  const seed = seedFrom(runs)

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[38px] w-[280px]">
        <FxLayer depth="back">
          {stage.fx && (phase === 'running' || cel !== null) && (
            <motion.div className="absolute top-[30px] left-[-140px] h-3 overflow-hidden" style={{ width: ground }}>
              <Ground />
            </motion.div>
          )}
          {cel !== null && <DonBack key={runs} cel={cel} seed={seed} layout={BURST} />}
        </FxLayer>

        <div
          ref={bar}
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          onClick={run}
          className={`relative z-10 size-full cursor-pointer overflow-hidden rounded-full border-[5px] border-ink ${
            struck ? 'bg-ink' : 'bg-white'
          }`}
        >
          <motion.div
            className={`relative h-full rounded-r-[5px] ${struck ? 'bg-white' : 'bg-hot'}`}
            style={{ width }}
          >
            <span className="absolute top-[7px] left-[22px] h-[9px] w-[5px] -skew-x-[24deg] rounded-[2px] bg-white/75" />
            <span className="absolute top-[7px] left-[34px] h-[9px] w-[5px] -skew-x-[24deg] rounded-[2px] bg-white/75" />
          </motion.div>
        </div>

        <FxLayer depth="front">
          {bursts.map(({ id, seed: burstSeed, data }) => (
            <PuffBurst
              key={id}
              seed={burstSeed}
              puffs={[
                data.count % 2
                  ? { x: data.x - 16, y: -24, size: 11, dx: -40, dy: -24 }
                  : { x: data.x - 22, y: 22, size: 9, dx: -34, dy: 4 },
              ]}
              onDone={() => dismiss(id)}
            >
              {data.count % 3 === 0 && (
                <ShardSpray
                  seed={burstSeed}
                  at={[data.x - 6, 26]}
                  count={2}
                  reach={34}
                  size={PEBBLE_SIZES}
                  hang={0}
                />
              )}
            </PuffBurst>
          ))}
          {stage.fx && phase === 'running' && (
            <Sprite style={{ x: edge }}>
              <Steam seed={seed} />
            </Sprite>
          )}
          {cel !== null && (
            <DonFront key={runs} cel={cel} seed={seed} layout={BURST} impact={BURST.origin} />
          )}
        </FxLayer>
      </div>

      <div className="relative mt-[46px]">
        <span aria-hidden className="absolute inset-0 translate-x-[5px] translate-y-[6px] -skew-x-12 bg-hot" />
        <motion.button
          key={phase === 'done' ? 'done' : 'live'}
          type="button"
          onClick={run}
          style={{ skewX: -12 }}
          initial={phase === 'done' && stage.fx ? { scale: 1.45 } : false}
          animate={{ scale: 1 }}
          whileHover={{ x: -2, y: -2 }}
          whileTap={{ x: 4, y: 5 }}
          transition={{ type: 'spring', stiffness: 620, damping: 13 }}
          className="focus-ring relative flex h-[38px] min-w-[86px] cursor-pointer items-center justify-center gap-2 border-[3px] border-ink bg-white px-4 text-[19px] font-bold tabular-nums select-none"
        >
          {phase === 'idle' && 'Start'}
          {phase === 'running' && `${percent}%`}
          {phase === 'done' && (
            <>
              Complete
              <CheckMark drawn size={17} className="stroke-ink" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
