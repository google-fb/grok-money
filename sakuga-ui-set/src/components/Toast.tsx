import { AnimatePresence, delay, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { PuffBurst, type Puff } from '../sakuga/bursts/PuffBurst'
import { FlickBurst } from '../sakuga/bursts/SparkleBurst'
import { FxLayer } from '../sakuga/FxLayer'
import { frames } from '../sakuga/timing'
import { useBursts } from '../sakuga/useBursts'
import { useStage } from '../showcase/stage-context'
import { CheckMark } from './CheckMark'

/** How long the toast stays up, in ms. */
const STAY = 2600
/** Frames the toast takes to fall from the button and hit its slot. */
const DROP = 2

/** Dust squeezed out from under both ends when the toast lands. */
const DUST: Puff[] = [
  { x: -152, y: 28, size: 21, dx: -36, dy: -6, wait: DROP },
  { x: -124, y: 44, size: 13, dx: -22, dy: 8, wait: DROP + 1 },
  { x: 154, y: 28, size: 20, dx: 36, dy: -6, wait: DROP },
  { x: 126, y: 44, size: 13, dx: 22, dy: 8, wait: DROP + 1 },
  { x: -40, y: 46, size: 10, dx: -8, dy: 12, wait: DROP + 1 },
  { x: 56, y: 46, size: 10, dx: 10, dy: 12, wait: DROP + 1 },
]

const FOLLOW = { type: 'spring', stiffness: 700, damping: 26 } as const
const LAND = frames(9)

export function Toast() {
  const stage = useStage()
  const [toast, setToast] = useState(0)
  const [saves, setSaves] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const { bursts, spawn, dismiss } = useBursts(2)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(0), STAY)
    return () => clearTimeout(timer)
  }, [toast])

  function save() {
    const next = saves + 1
    setSaves(next)
    setToast(next)
    spawn(undefined)
    delay(() => stage.shake(0.45), frames(DROP) * 1000)
  }

  const face = pressed ? [6, 8] : hovered ? [-2, -2] : [0, 0]

  return (
    <div className="flex flex-col items-center gap-9">
      <div className="relative">
        <span aria-hidden className="absolute inset-0 translate-x-[7px] translate-y-[9px] rounded-[18px] bg-lilac" />
        <motion.button
          type="button"
          onClick={save}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onTapStart={() => setPressed(true)}
          onTap={() => setPressed(false)}
          onTapCancel={() => setPressed(false)}
          animate={{ x: face[0], y: face[1] }}
          transition={FOLLOW}
          className="focus-ring relative block h-[64px] w-[132px] cursor-pointer rounded-[18px] border-4 border-ink bg-white text-[23px] font-bold italic select-none"
        >
          Save
        </motion.button>
      </div>

      <div className="relative h-[70px] w-[292px]">
        <FxLayer depth="back">
          {bursts.map((burst) => (
            <FlickBurst
              key={burst.id}
              seed={burst.seed}
              y={30}
              count={12}
              radius={120}
              stretch={1.7}
              wait={DROP}
            />
          ))}
        </FxLayer>

        <div role="status" className="absolute inset-0 z-10">
          <AnimatePresence>
            {toast !== 0 && (
              <motion.div
                key={toast}
                className="absolute inset-0"
                style={{ originY: 1 }}
                initial={{ y: -62, scaleX: 0.9, scaleY: 0.5 }}
                animate={{ y: [-62, 0, 0, 0], scaleX: [0.9, 1.09, 0.97, 1], scaleY: [0.5, 0.7, 1.1, 1] }}
                exit={{ scaleX: 1.08, scaleY: 0.2, opacity: 0, transition: { duration: frames(3) } }}
                transition={{
                  duration: LAND,
                  times: [0, DROP / 9, 0.56, 1],
                  ease: ['easeIn', 'easeOut', 'easeInOut'],
                }}
              >
                <span className="absolute inset-0 translate-x-[8px] translate-y-[9px] rounded-[18px] bg-lilac" />
                <div className="relative flex size-full items-center gap-[13px] rounded-[18px] border-4 border-ink bg-white pr-[14px] pl-[18px]">
                  <motion.span
                    className="grid size-[34px] shrink-0 place-items-center rounded-full border-[3px] border-ink bg-iris"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: frames(DROP + 1), type: 'spring', stiffness: 700, damping: 11 }}
                  >
                    <CheckMark drawn size={17} className="stroke-white" />
                  </motion.span>
                  <span className="flex-1 text-[19px] font-bold whitespace-nowrap">Saved successfully!</span>
                  <motion.button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => setToast(0)}
                    whileHover={{ rotate: 90, scale: 1.2 }}
                    whileTap={{ scale: 0.85 }}
                    className="focus-ring grid size-7 cursor-pointer place-items-center rounded-full"
                  >
                    <svg aria-hidden viewBox="0 0 12 12" width="12" height="12">
                      <path d="M2 2 10 10M10 2 2 10" className="stroke-ink" strokeWidth={2.6} strokeLinecap="round" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <FxLayer depth="front">
          {bursts.map((burst) => (
            <PuffBurst key={burst.id} seed={burst.seed} puffs={DUST} onDone={() => dismiss(burst.id)} />
          ))}
        </FxLayer>
      </div>
    </div>
  )
}
