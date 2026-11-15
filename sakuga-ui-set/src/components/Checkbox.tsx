import { motion, useAnimate } from 'framer-motion'
import { useState } from 'react'
import { PuffBurst, type Puff } from '../sakuga/bursts/PuffBurst'
import { FlickBurst, SparkleBurst, type Glint } from '../sakuga/bursts/SparkleBurst'
import { FxLayer, Sprite } from '../sakuga/FxLayer'
import { frames } from '../sakuga/timing'
import { useBursts } from '../sakuga/useBursts'
import { useStage } from '../showcase/stage-context'
import { CheckMark } from './CheckMark'

const GLINTS: Glint[] = [
  { x: 36, y: -34, size: 15 },
  { x: -38, y: -24, size: 8, wait: 2 },
  { x: 42, y: 20, size: 7, wait: 3 },
]

const DUST: Puff[] = [
  { x: -28, y: 28, size: 15, dx: -24, dy: 6 },
  { x: 32, y: 30, size: 13, dx: 24, dy: 8, wait: 1 },
]

const FOLLOW = { type: 'spring', stiffness: 700, damping: 26 } as const
const FLIGHT = frames(11)

/** The tick knocked out of the box: it pops up, tumbles and drops away. */
function FlyingCheck() {
  return (
    <Sprite
      initial={{ x: 0, y: 0, rotate: 0, scale: 1.15 }}
      animate={{ x: 34, y: [0, -46, 36], rotate: 170, scale: [1.15, 1, 0] }}
      transition={{
        x: { duration: FLIGHT, ease: 'linear' },
        y: { duration: FLIGHT, times: [0, 0.4, 1], ease: ['easeOut', 'easeIn'] },
        rotate: { duration: FLIGHT, ease: 'linear' },
        scale: { duration: FLIGHT, times: [0, 0.7, 1], ease: 'linear' },
      }}
    >
      <path
        d="M-11.5 0.6-4 8.1 11.5-8.7"
        className="fill-none stroke-ink"
        strokeWidth={5.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Sprite>
  )
}

export function Checkbox() {
  const stage = useStage()
  const [checked, setChecked] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [box, animate] = useAnimate<HTMLSpanElement>()
  const { bursts, spawn, dismiss } = useBursts<boolean>(3)

  function toggle() {
    const next = !checked
    setChecked(next)
    if (!stage.fx) return

    spawn(next)
    if (next) {
      // Stamped: crushed for a frame, then it rebounds past its size.
      animate(
        box.current,
        { scale: [0.76, 1.18, 1] },
        { duration: frames(7), times: [0, 0.3, 1], ease: ['easeOut', 'easeInOut'] },
      )
      stage.shake(0.3)
    } else {
      animate(box.current, { scale: [0.88, 1] }, { type: 'spring', stiffness: 600, damping: 13 })
    }
  }

  const lift = hovered ? -2 : 0

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={toggle}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="focus-ring flex cursor-pointer items-center gap-[18px] rounded-[14px] text-[22px] select-none"
    >
      <span className="relative block size-[54px]">
        <FxLayer depth="back">
          {bursts.map(
            (burst) =>
              burst.data && <FlickBurst key={burst.id} seed={burst.seed} count={9} radius={58} />,
          )}
        </FxLayer>

        <motion.span ref={box} className="relative z-10 block size-full">
          <motion.span
            className="absolute inset-0 rounded-[13px] bg-lilac"
            initial={false}
            animate={checked ? { x: 8, y: 9 } : { x: 0, y: 0 }}
            transition={FOLLOW}
          />
          <motion.span
            className="relative grid size-full place-items-center rounded-[13px] border-[5px] border-ink bg-white"
            animate={{ x: lift, y: lift }}
            transition={FOLLOW}
          >
            <CheckMark drawn={checked} size={30} className="stroke-ink" />
          </motion.span>
        </motion.span>

        <FxLayer depth="front">
          {bursts.map((burst) =>
            burst.data ? (
              <SparkleBurst key={burst.id} glints={GLINTS} onDone={() => dismiss(burst.id)} />
            ) : (
              <PuffBurst key={burst.id} seed={burst.seed} puffs={DUST} onDone={() => dismiss(burst.id)}>
                <FlyingCheck />
              </PuffBurst>
            ),
          )}
        </FxLayer>
      </span>
      Remember me
    </motion.button>
  )
}
