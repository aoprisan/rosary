/**
 * An illuminated *champ* initial in the manner of a Book of Hours: the opening
 * letter of a prayer set as a versal in cinnabar upon a square of burnished
 * gold leaf, framed by a fine rule, with foliate sprays curling from each
 * corner and a slow sheen of reflected candlelight passing over the gold.
 *
 * The letter is real text (not decoration), so a prayer still reads correctly
 * to assistive tech — the caller renders the remainder of the line beside it.
 * The gold ground and tracery are aria-hidden.
 */

interface Props {
  letter: string;
  className?: string;
}

/** A small almond leaf, tip on +x, base at the origin, of length `len`. */
function leaf(len: number): string {
  const c1 = 0.26 * len;
  const c2 = 0.74 * len;
  const w = 0.24 * len;
  return (
    `M0 0 C ${c1} ${-w}, ${c2} ${-0.5 * w}, ${len} 0 ` +
    `C ${c2} ${0.5 * w}, ${c1} ${w}, 0 0 Z`
  );
}

/** A tendril with two leaves and a berry, springing inward from a corner. */
function CornerSpray({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path className="champ-vine" d="M0 0 C 9 1, 16 7, 19 18" />
      <path className="champ-leaf" d={leaf(10)} transform="translate(4 4) rotate(48)" />
      <path className="champ-leaf" d={leaf(8)} transform="translate(13 10) rotate(78)" />
      <circle className="champ-berry" cx="19" cy="18" r="1.9" />
    </g>
  );
}

export function IlluminatedInitial({ letter, className }: Props) {
  return (
    <span className={`champ${className ? ` ${className}` : ''}`}>
      <span className="champ__ground" aria-hidden="true" />
      <span className="champ__sheen" aria-hidden="true" />
      <svg
        className="champ__vines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <CornerSpray x={6} y={6} rot={0} />
        <CornerSpray x={94} y={6} rot={90} />
        <CornerSpray x={94} y={94} rot={180} />
        <CornerSpray x={6} y={94} rot={270} />
      </svg>
      <span className="champ__letter">{letter}</span>
    </span>
  );
}
