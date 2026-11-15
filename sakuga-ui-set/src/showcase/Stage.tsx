import { useAnimate, useReducedMotionConfig } from 'framer-motion'
import { useMemo, useState, type ReactNode } from 'react'
import { frames, hold } from '../sakuga/timing'
import { StageContext, type StageApi } from './stage-context'

/** One displacement per frame, decaying: the shake starts already off-centre. */
const SHAKE_X = [-1, 0.85, -0.6, 0.45, -0.3, 0.15, 0]
const SHAKE_Y = [0.55, -0.8, 0.5, -0.35, 0.2, -0.1, 0]
const SHAKE_PX = 7

let topLayer = 0

interface StageProps {
  label: string
  children: ReactNode
}

/** A showcase cell: one control centred on white, its name bottom-left. */
export function Stage({ label, children }: StageProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const [layer, setLayer] = useState(0)
  const fx = !useReducedMotionConfig()

  const api = useMemo<StageApi>(
    () => ({
      fx,
      shake(power = 1) {
        if (!fx) return
        const reach = power * SHAKE_PX
        animate(
          scope.current,
          { x: SHAKE_X.map((v) => v * reach), y: SHAKE_Y.map((v) => v * reach) },
          { duration: frames(SHAKE_X.length - 1), ease: hold },
        )
      },
      raise() {
        setLayer(++topLayer)
      },
    }),
    [animate, scope, fx],
  )

  return (
    <section
      aria-label={label}
      className="relative isolate grid place-items-center px-6 pt-10 pb-14"
      style={{ zIndex: layer }}
    >
      <StageContext.Provider value={api}>
        <div ref={scope}>{children}</div>
      </StageContext.Provider>
      <h2 className="absolute bottom-5 left-6 text-[15px] leading-none font-bold text-label select-none">
        {label}
      </h2>
    </section>
  )
}
