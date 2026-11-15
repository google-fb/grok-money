import { createContext, useContext } from 'react'

export interface StageApi {
  /** False when the visitor prefers reduced motion: controls still work, bursts stay home. */
  fx: boolean
  /** Jolts the cell's contents, like a camera shake on impact. */
  shake: (power?: number) => void
  /** Lifts this cell above its neighbours so a burst can spill over them. */
  raise: () => void
}

export const StageContext = createContext<StageApi>({ fx: false, shake() {}, raise() {} })

export const useStage = () => useContext(StageContext)
