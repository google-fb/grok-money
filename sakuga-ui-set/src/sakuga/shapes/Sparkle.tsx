const star = (rx: number, ry: number, pinch: number) => {
  const cx = rx * pinch
  const cy = ry * pinch
  return `M0 ${-ry}Q${cx} ${-cy} ${rx} 0Q${cx} ${cy} 0 ${ry}Q${-cx} ${cy} ${-rx} 0Q${-cx} ${-cy} 0 ${-ry}Z`
}

interface SparkleProps {
  /** Half the height of the star, in px. */
  size: number
  /** How fat the star is: near 0 it is a thin cross, near 0.5 almost a diamond. */
  pinch?: number
}

/** A four-point glint: hot pink with a white core. */
export function Sparkle({ size, pinch = 0.14 }: SparkleProps) {
  return (
    <g strokeLinejoin="round">
      <path d={star(size * 0.92, size, pinch)} className="fill-hot stroke-ink" strokeWidth={1.5} />
      {size > 6 && <path d={star(size * 0.5, size * 0.56, pinch * 1.25)} className="fill-white" />}
    </g>
  )
}
