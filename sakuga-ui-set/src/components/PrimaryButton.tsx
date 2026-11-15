import { motion } from 'framer-motion'
import { useState, type MouseEvent } from 'react'
import { DON_CELS, DonBack, DonFront, type DonLayout } from '../sakuga/bursts/DonBurst'
import { FxLayer } from '../sakuga/FxLayer'
import type { Point } from '../sakuga/geometry'
import { seedFrom } from '../sakuga/random'
import { xsheet } from '../sakuga/timing'
import { useXSheet } from '../sakuga/useXSheet'
import { useStage } from '../showcase/stage-context'
import { CheckMark } from './CheckMark'

const BURST: DonLayout = {
  origin: [0, 0],
  radius: 104,
  stretch: 1.22,
  lettering: { x: 10, y: -102, em: 82 },
  clouds: [
    { x: -112, y: -22, size: 24 },
    { x: -118, y: 32, size: 21 },
    { x: 116, y: -38, size: 22 },
    { x: 114, y: 36, size: 21 },
  ],
  sparks: [
    [-128, -92],
    [142, -80],
  ],
}

/**
 * The button's own acting for the first frames of the burst: flattened by
 * the hit, thrown at the camera in negative, then a recoil. After that a
 * spring carries it back to rest.
 */
const POSES = xsheet(
  [1, { scaleX: 1.12, scaleY: 0.8, rotate: 0 }],
  [2, { scaleX: 1.08, scaleY: 1.08, rotate: -3 }],
  [1, { scaleX: 0.95, scaleY: 1.05, rotate: 1.5 }],
)
const REST = { scaleX: 1, scaleY: 1, rotate: 0 }

/** Frame on which the tick starts to draw. */
const CHECK_IN = 7

const SNAP = { duration: 0 }
const SETTLE = { type: 'spring', stiffness: 520, damping: 13 } as const
const FOLLOW = { type: 'spring', stiffness: 700, damping: 28 } as const

export function PrimaryButton() {
  const stage = useStage()
  const [cel, play] = useXSheet(DON_CELS)
  const [take, setTake] = useState<{ count: number; impact: Point }>({ count: 0, impact: [0, 0] })
  const [confirmed, setConfirmed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const pose = cel === null ? undefined : POSES[cel]
  const struck = pose !== undefined
  const inverted = cel === 1 || cel === 2

  const face = pressed ? (confirmed ? [4, 6] : [1, 2]) : hovered ? [-2, -2] : [0, 0]
  const shadow = struck ? [0, 0] : confirmed ? [7, 9] : hovered && !pressed ? [3, 4] : [0, 0]

  function confirm(event: MouseEvent<HTMLButtonElement>) {
    setConfirmed(true)
    if (!stage.fx) return

    const box = event.currentTarget.getBoundingClientRect()
    // Keyboard activation has no pointer position, so it strikes dead centre.
    const impact: Point =
      event.detail === 0
        ? [0, 0]
        : [event.clientX - box.left - box.width / 2, event.clientY - box.top - box.height / 2]

    setTake(({ count }) => ({ count: count + 1, impact }))
    play()
    stage.shake()
    stage.raise()
  }

  return (
    <div className="relative">
      <FxLayer depth="back">
        {cel !== null && (
          <DonBack key={take.count} cel={cel} seed={seedFrom(take.count)} layout={BURST} />
        )}
      </FxLayer>

      <motion.div className="relative z-10" animate={pose ?? REST} transition={struck ? SNAP : SETTLE}>
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-[18px] bg-lilac"
          animate={{ x: shadow[0], y: shadow[1] }}
          transition={struck ? SNAP : FOLLOW}
        />
        <motion.button
          type="button"
          onClick={confirm}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onTapStart={() => setPressed(true)}
          onTap={() => setPressed(false)}
          onTapCancel={() => setPressed(false)}
          animate={{ x: face[0], y: face[1] }}
          transition={FOLLOW}
          className={`focus-ring relative flex h-[66px] w-[200px] cursor-pointer items-center justify-center rounded-[18px] border-4 border-ink text-[23px] font-bold italic select-none ${
            inverted ? 'bg-ink text-white' : 'bg-white text-ink'
          }`}
        >
          Confirm
          <motion.span
            className="flex justify-end overflow-hidden"
            initial={false}
            animate={{ width: confirmed ? 36 : 0 }}
            transition={FOLLOW}
          >
            <CheckMark drawn={confirmed && (cel === null || cel >= CHECK_IN)} />
          </motion.span>
        </motion.button>
      </motion.div>

      <FxLayer depth="front">
        {cel !== null && (
          <DonFront
            key={take.count}
            cel={cel}
            seed={seedFrom(take.count)}
            layout={BURST}
            impact={take.impact}
          />
        )}
      </FxLayer>
    </div>
  )
}
