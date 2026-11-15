import {
  motion,
  time,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { PuffBurst } from '../sakuga/bursts/PuffBurst'
import { Cel, FxLayer } from '../sakuga/FxLayer'
import { SHU } from '../sakuga/glyphs'
import { Lettering } from '../sakuga/shapes/Lettering'
import { xsheet } from '../sakuga/timing'
import { useBursts } from '../sakuga/useBursts'
import { useCel } from '../sakuga/useXSheet'

const WIDTH = 280
const KNOB = 38
/** Distance the knob's left edge can travel. */
const TRAVEL = WIDTH - KNOB
const INITIAL = 87

const toPx = (value: number) => (value / 100) * TRAVEL
const toValue = (px: number) => Math.round((Math.min(TRAVEL, Math.max(0, px)) / TRAVEL) * 100)

/** Knob travel between two trail puffs, in px. */
const PUFF_EVERY = 32
/** Knob speed, in px/s, above which a drag earns a シュッ. */
const WHOOSH_SPEED = 900
const WHOOSH_COOLDOWN = 450

const KEY_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowUp: 1,
  ArrowLeft: -1,
  ArrowDown: -1,
  PageUp: 10,
  PageDown: -10,
  Home: -100,
  End: 100,
}

type Trail =
  | { kind: 'puff'; x: number; dir: number; size: number }
  | { kind: 'whoosh'; x: number; dir: number }

/** シュッ pops in above the knob while a speed line streaks out behind it. */
const WHOOSH = xsheet<{ scale: number; weight: number; from: number; to: number }>(
  [1, { scale: 1.5, weight: 1, from: 0.05, to: 0.6 }],
  [4, { scale: 1, weight: 1, from: 0.2, to: 1 }],
  [1, { scale: 1.05, weight: 0.6, from: 0.6, to: 1.1 }],
  [1, { scale: 1.1, weight: 0.32, from: 0.9, to: 1.16 }],
)

function Whoosh({ x, dir, onDone }: { x: number; dir: number; onDone: () => void }) {
  const cel = useCel(WHOOSH.length, onDone)
  const pose = WHOOSH[cel]
  if (!pose) return null

  const near = x - dir * (24 + pose.from * 120)
  const far = x - dir * (24 + pose.to * 120)
  return (
    <>
      <Cel>
        <path d={`M${near} 15.5L${far} 17L${near} 18.5Z`} className="fill-line" />
        <path d={`M${near - dir * 16} 24L${far + dir * 40} 25L${near - dir * 16} 26Z`} className="fill-line" />
      </Cel>
      <Cel x={x - dir * 4} y={-78}>
        <g transform={`scale(${pose.scale})`}>
          <Lettering word={SHU} em={17} drawing={cel >> 1} weight={pose.weight} className="fill-line" />
        </g>
      </Cel>
    </>
  )
}

export function Slider() {
  const [value, setValue] = useState(INITIAL)
  const [dragging, setDragging] = useState(false)
  const { bursts, spawn, dismiss } = useBursts<Trail>(8)

  const knobX = useSpring(toPx(INITIAL), { stiffness: 1500, damping: 52, mass: 0.6 })
  // A smoothed velocity drives the follow-through: the knob stretches and the tooltip leans back.
  const lean = useSpring(useVelocity(knobX), { stiffness: 320, damping: 26 })
  const stretchX = useTransform(lean, (v) => 1 + Math.min(Math.abs(v) / 2400, 0.42))
  const stretchY = useTransform(lean, (v) => 1 - Math.min(Math.abs(v) / 7000, 0.2))
  const tilt = useTransform(lean, [-1400, 1400], [15, -15])
  const fill = useTransform(knobX, (px) => Math.max(0, px + KNOB / 2 - 4))
  const readout = useTransform(knobX, (px) => `${toValue(px)}%`)

  /** Offset between the pointer and the knob while it is held. */
  const grab = useRef<number | null>(null)
  const lastPuff = useRef(toPx(INITIAL))
  const lastWhoosh = useRef(0)

  useMotionValueEvent(knobX, 'change', (px) => {
    const gap = px - lastPuff.current
    if (Math.abs(gap) < PUFF_EVERY) return
    lastPuff.current = px

    const dir = Math.sign(gap)
    const speed = Math.abs(knobX.getVelocity())
    const x = px + KNOB / 2 - WIDTH / 2
    spawn({ kind: 'puff', x, dir, size: Math.min(27, 13 + speed / 110) })

    if (speed > WHOOSH_SPEED && time.now() - lastWhoosh.current > WHOOSH_COOLDOWN) {
      lastWhoosh.current = time.now()
      spawn({ kind: 'whoosh', x, dir })
    }
  })

  function moveTo(px: number) {
    const clamped = Math.min(TRAVEL, Math.max(0, px))
    knobX.set(clamped)
    setValue(toValue(clamped))
  }

  const pointerPx = (event: PointerEvent<HTMLDivElement>) =>
    event.clientX - event.currentTarget.getBoundingClientRect().left - KNOB / 2

  function press(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const px = pointerPx(event)
    const offset = px - knobX.get()
    // Grabbing the knob keeps it under the finger; pressing the track brings it over.
    grab.current = Math.abs(offset) <= KNOB / 2 ? offset : 0
    setDragging(true)
    moveTo(px - grab.current)
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    if (grab.current !== null) moveTo(pointerPx(event) - grab.current)
  }

  function release() {
    grab.current = null
    setDragging(false)
  }

  function nudge(event: KeyboardEvent) {
    const step = KEY_STEPS[event.key]
    if (step === undefined) return
    event.preventDefault()
    moveTo(toPx(Math.min(100, Math.max(0, value + step))))
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value}%`}
      onPointerDown={press}
      onPointerMove={drag}
      onPointerUp={release}
      onPointerCancel={release}
      onKeyDown={nudge}
      className={`focus-ring group relative h-[38px] w-[280px] touch-none rounded-full select-none ${
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div className="absolute inset-x-0 top-[9px] z-10 h-5 overflow-hidden rounded-full border-4 border-ink bg-white">
        <motion.div className="h-full bg-iris" style={{ width: fill }} />
      </div>

      <FxLayer depth="front">
        {bursts.map(({ id, seed, data }) =>
          data.kind === 'puff' ? (
            <PuffBurst
              key={id}
              seed={seed}
              lobes={5}
              life={12}
              puffs={[
                {
                  x: data.x - data.dir * 12,
                  y: -6,
                  size: data.size,
                  dx: -data.dir * (22 + data.size),
                  dy: -data.size * 0.9,
                },
              ]}
              onDone={() => dismiss(id)}
            />
          ) : (
            <Whoosh key={id} x={data.x} dir={data.dir} onDone={() => dismiss(id)} />
          ),
        )}
      </FxLayer>

      <motion.div className="absolute top-0 left-0 z-30 size-[38px]" style={{ x: knobX }}>
        <motion.div
          className="size-full rounded-full border-4 border-ink bg-white transition-colors group-hover:bg-rule"
          style={{ scaleX: stretchX, scaleY: stretchY }}
          animate={{ scale: dragging ? 1.16 : 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 12 }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-full left-1/2 mb-[13px]"
          style={{ x: '-50%', rotate: tilt, transformOrigin: '50% 140%' }}
          animate={{ scale: dragging ? 1.12 : 1, y: dragging ? -3 : 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 14 }}
        >
          <div className="rounded-[11px] border-[3px] border-ink bg-white px-[9px] py-[4px] text-[17px] leading-none font-bold tabular-nums">
            <motion.span>{readout}</motion.span>
          </div>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-ink" />
        </motion.div>
      </motion.div>
    </div>
  )
}
