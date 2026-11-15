import { MotionConfig } from 'framer-motion'
import { useState } from 'react'
import { Checkbox } from './components/Checkbox'
import { PrimaryButton } from './components/PrimaryButton'
import { Progress } from './components/Progress'
import { Slider } from './components/Slider'
import { Toast } from './components/Toast'
import { Toggle } from './components/Toggle'
import { Stage } from './showcase/Stage'

export default function App() {
  const [forceMotion, setForceMotion] = useState(false)
  const reducedMotion = forceMotion ? 'never' : 'user'

  return (
    <MotionConfig reducedMotion={reducedMotion}>
      {/* Bursts spill past their cells; clipping here keeps them from adding scrollbars. */}
      <div className="min-h-dvh overflow-clip">
        <main className="mx-auto flex min-h-dvh max-w-[1240px] flex-col px-4 sm:px-8">
          <header className="flex items-center justify-between gap-4 pt-7 pb-1">
            <h1 className="text-[17px] leading-none font-bold tracking-tight italic">Sakuga UI Set</h1>
            <div className="flex items-center gap-2.5">
              <label
                htmlFor="force-animations"
                className="cursor-pointer text-[13px] leading-none font-bold text-label select-none"
              >
                Force animations
              </label>
              <button
                id="force-animations"
                type="button"
                role="switch"
                aria-checked={forceMotion}
                onClick={() => setForceMotion((on) => !on)}
                className={`focus-ring relative h-7 w-12 cursor-pointer rounded-full border-[3px] border-ink transition-colors ${
                  forceMotion ? 'bg-iris' : 'bg-mist'
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute top-[2px] left-[2px] block size-[18px] rounded-full border-[2.5px] border-ink bg-white transition-transform ${
                    forceMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </header>
          {/* Remount the stages when the motion mode flips so VisualElements pick up the new config. */}
          <div
            key={reducedMotion}
            className="grid flex-1 auto-rows-[minmax(300px,1fr)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Stage label="Toggle">
              <Toggle />
            </Stage>
            <Stage label="Primary button">
              <PrimaryButton />
            </Stage>
            <Stage label="Checkbox">
              <Checkbox />
            </Stage>
            <Stage label="Slider">
              <Slider />
            </Stage>
            <Stage label="Toast">
              <Toast />
            </Stage>
            <Stage label="Progress">
              <Progress />
            </Stage>
          </div>
        </main>
      </div>
    </MotionConfig>
  )
}
