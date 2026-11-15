import { MotionConfig } from 'framer-motion'
import { Checkbox } from './components/Checkbox'
import { PrimaryButton } from './components/PrimaryButton'
import { Progress } from './components/Progress'
import { Slider } from './components/Slider'
import { Toast } from './components/Toast'
import { Toggle } from './components/Toggle'
import { Stage } from './showcase/Stage'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      {/* Bursts spill past their cells; clipping here keeps them from adding scrollbars. */}
      <div className="min-h-dvh overflow-clip">
        <main className="mx-auto flex min-h-dvh max-w-[1240px] flex-col px-4 sm:px-8">
          <header className="pt-7 pb-1">
            <h1 className="text-[17px] leading-none font-bold tracking-tight italic">Sakuga UI Set</h1>
          </header>
          <div className="grid flex-1 auto-rows-[minmax(300px,1fr)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
