import { motion, useAnimate, useMotionValue, useTransform } from 'framer-motion'
import { useRef, useState, type MouseEvent } from 'react'
import { PuffBurst, type Puff } from '../sakuga/bursts/PuffBurst'
import { FlickBurst, SparkleBurst, type Glint } from '../sakuga/bursts/SparkleBurst'
import { FxLayer } from '../sakuga/FxLayer'
import { frames } from '../sakuga/timing'
import { useBursts } from '../sakuga/useBursts'
import { useStage } from '../showcase/stage-context'

const WIDTH = 172
const HEIGHT = 72
/** Distance the knob slides between off and on. */
const TRAVEL = WIDTH - HEIGHT

const GLINTS: Glint[] = [
  { x: 66, y: -60, size: 30 },
  { x: 104, y: -24, size: 11, wait: 2 },
  { x: 28, y: -66, size: 8, wait: 3 },
]

const DUST: Puff[] = [
  { x: -94, y: 16, size: 18, dx: -30, dy: 2 },
  { x: -90, y: -24, size: 13, dx: -24, dy: -14, wait: 1 },
  { x: -64, y: 42, size: 10, dx: -14, dy: 10, wait: 1 },
]

const RECOIL = { type: 'spring', stiffness: 620, damping: 12 } as const

export function Toggle() {
  const stage = useStage()
  const [on, setOn] = useState(false)
  const [track, animate] = useAnimate<HTMLButtonElement>()
  const knob = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0)
  const tint = useTransform(x, [0, TRAVEL], [0, 1])
  const pressX = useRef(0)
  const flips = useRef(0)
  const { bursts, spawn, dismiss } = useBursts<boolean>(3)

  async function flip(next: boolean) {
    setOn(next)
    const target = next ? TRAVEL : 0
    if (!stage.fx || !knob.current) {
      animate(x, target, { duration: 0.12 })
      return
    }

    const flipId = ++flips.current
    // Smear across, accelerating into the far wall.
    animate(knob.current, { scaleX: 1.3, scaleY: 0.88 }, { duration: frames(1) })
    await animate(x, target, { duration: frames(3), ease: [0.5, 0, 1, 0.6] })
    if (flipId !== flips.current) return

    // Flatten against the wall, then spring back to round.
    animate(knob.current, { scaleX: [0.72, 1], scaleY: [1.14, 1] }, RECOIL)
    animate(track.current, { x: [next ? 6 : -6, 0] }, RECOIL)
    spawn(next)
    stage.shake(0.35)
  }

  function click(event: MouseEvent) {
    // A press that travelled was a drag of the knob, which settles itself.
    if (event.detail !== 0 && Math.abs(event.clientX - pressX.current) > 4) return
    flip(!on)
  }

  function release() {
    const next = x.get() > TRAVEL / 2
    if (next !== on) flip(next)
    else animate(x, on ? TRAVEL : 0, { type: 'spring', stiffness: 700, damping: 30 })
  }

  return (
    <div className="relative">
      <FxLayer depth="back">
        {bursts.map(
          (burst) =>
            burst.data && (
              <FlickBurst key={burst.id} seed={burst.seed} x={TRAVEL / 2 + 26} count={9} radius={56} />
            ),
        )}
      </FxLayer>

      <motion.button
        ref={track}
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Toggle"
        onPointerDown={(event) => (pressX.current = event.clientX)}
        onClick={click}
        whileHover={{ y: -2 }}
        whileTap={{ y: 1 }}
        className="focus-ring relative z-10 block h-[72px] w-[172px] cursor-pointer rounded-full border-[5px] border-ink bg-mist"
      >
        <motion.span className="absolute inset-0 rounded-full bg-iris" style={{ opacity: tint }} />
        <motion.span
          ref={knob}
          drag="x"
          dragConstraints={{ left: 0, right: TRAVEL }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={release}
          style={{ x, originX: on ? 1 : 0 }}
          className="absolute -top-[5px] -left-[5px] block size-[72px] overflow-hidden rounded-full border-[5px] border-ink bg-lilac"
        >
          <span className="absolute -top-[11px] -left-[11px] size-[62px] rounded-full bg-white" />
          <span className="absolute top-[10px] left-[13px] h-[9px] w-[15px] -rotate-[32deg] rounded-full bg-lilac" />
        </motion.span>
      </motion.button>

      <FxLayer depth="front">
        {bursts.map((burst) =>
          burst.data ? (
            <SparkleBurst key={burst.id} glints={GLINTS} onDone={() => dismiss(burst.id)} />
          ) : (
            <PuffBurst key={burst.id} seed={burst.seed} puffs={DUST} onDone={() => dismiss(burst.id)} />
          ),
        )}
      </FxLayer>
    </div>
  )
}
