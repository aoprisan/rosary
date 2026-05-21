/**
 * Printed ornaments for the prayer-book leaf, drawn in the two inks of the
 * page (cinnabar strokes, iron-gall accents, a single glint of gold).
 *
 *  • `headpiece` — a frontispiece band (заставка): a central three-bar cross
 *    in a roundel, flanked by mirrored palmette scrolls and terminal curls.
 *  • `rule` — a slender divider: a hairline broken by a small cross and leaves.
 *
 * Colours come from CSS classes (.orn-*) so the ornament re-inks itself with
 * the rest of the page.
 */

interface Props {
  variant?: 'headpiece' | 'rule' | 'corner' | 'tailpiece';
  className?: string;
}

/** A small, crisp three-bar Orthodox cross that inherits the rubric ink. */
export function Cross({ className }: { className?: string }) {
  return (
    <svg
      className={`cross${className ? ` ${className}` : ''}`}
      viewBox="0 0 24 36"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <g className="orn-stroke-bold" strokeWidth={2.4}>
        <path d="M12 3 V 33" />
        <path d="M7 9 H 17" />
        <path d="M3 16 H 21" />
        <path d="M6 25 L 18 22" />
      </g>
    </svg>
  );
}

/** An almond leaf of length `len`, tip on +x, base at the origin. */
function leaf(len: number): string {
  const c1 = 0.26 * len;
  const c2 = 0.74 * len;
  const w = 0.23 * len;
  return (
    `M0 0 C ${c1} ${-w}, ${c2} ${-0.55 * w}, ${len} 0 ` +
    `C ${c2} ${0.55 * w}, ${c1} ${w}, 0 0 Z`
  );
}

/** A fan of leaves rising from (bx, by), opening toward `dir` (1 = right). */
function Palmette({ bx, by, dir }: { bx: number; by: number; dir: 1 | -1 }) {
  const angles = [-46, -22, 0, 22, 46];
  const lens = [13, 19, 24, 19, 13];
  return (
    <g transform={`translate(${bx} ${by})`}>
      {angles.map((a, i) => (
        <path
          key={a}
          className="orn-leaf"
          d={leaf(lens[i])}
          transform={`rotate(${dir === 1 ? a : 180 - a})`}
        />
      ))}
      <circle className="orn-dot-gold" cx={0} cy={0} r={2.4} />
    </g>
  );
}

/** The three-bar Orthodox cross within a roundel, centred at (cx, cy). */
function CrossRoundel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle className="orn-stroke" r={30} />
      <circle className="orn-ink" r={24} />
      <g className="orn-stroke-bold">
        <path d="M0 -22 V 24" />
        <path d="M-9 -13 H 9" />
        <path d="M-17 -2 H 17" />
        <path d="M-12 13 L 12 9" />
      </g>
    </g>
  );
}

/** One outward-running scroll: vine, mid-leaves and a terminal curl + berry. */
function Scroll({ dir }: { dir: 1 | -1 }) {
  // Drawn rightward, then mirrored for the left by the caller's transform.
  return (
    <g transform={dir === 1 ? undefined : 'translate(640 0) scale(-1 1)'}>
      <path
        className="orn-stroke"
        d="M356 60 C 392 54, 404 40, 432 42 C 458 44, 462 64, 488 62
           C 510 60, 516 48, 540 50"
      />
      <path
        className="orn-stroke"
        d="M356 60 C 388 66, 398 80, 422 78 C 442 76, 444 64, 462 64"
      />
      {/* a terminal curl */}
      <path
        className="orn-stroke"
        d="M540 50 C 556 51, 562 62, 552 68 C 545 72, 537 67, 540 60"
      />
      <g transform="translate(430 41) rotate(-32)">
        <path className="orn-leaf" d={leaf(15)} />
      </g>
      <g transform="translate(421 78) rotate(150)">
        <path className="orn-leaf" d={leaf(13)} />
      </g>
      <circle className="orn-dot-ink" cx={487} cy={62} r={2.6} />
      <circle className="orn-dot-gold" cx={548} cy={61} r={2.2} />
    </g>
  );
}

/**
 * A foliate corner-piece for the border of the leaf: two ivy arms running out
 * from a gilded boss along the top and left edges, drawn for the top-left
 * corner and rotated by CSS for the other three.
 */
function CornerPiece() {
  return (
    <>
      {/* the two arms of the corner */}
      <path className="orn-stroke" d="M9 9 C 32 6, 54 11, 80 7" />
      <path className="orn-stroke" d="M9 9 C 6 32, 11 54, 7 80" />
      {/* ivy leaves trailing along each arm */}
      <g transform="translate(34 8) rotate(-26)"><path className="orn-leaf" d={leaf(15)} /></g>
      <g transform="translate(60 9) rotate(20)"><path className="orn-leaf" d={leaf(11)} /></g>
      <g transform="translate(8 34) rotate(116)"><path className="orn-leaf" d={leaf(15)} /></g>
      <g transform="translate(9 60) rotate(70)"><path className="orn-leaf" d={leaf(11)} /></g>
      {/* berries and the gilded boss at the angle */}
      <circle className="orn-dot-ink" cx={80} cy={7} r={2.2} />
      <circle className="orn-dot-ink" cx={7} cy={80} r={2.2} />
      <circle className="orn-dot-gold orn-boss" cx={9} cy={9} r={4.2} />
    </>
  );
}

export function Ornament({ variant = 'headpiece', className }: Props) {
  if (variant === 'corner') {
    return (
      <svg
        className={`ornament ornament--corner${className ? ` ${className}` : ''}`}
        viewBox="0 0 88 88"
        role="presentation"
        aria-hidden="true"
      >
        <CornerPiece />
      </svg>
    );
  }

  if (variant === 'tailpiece') {
    // A cul-de-lampe: a small foliate drop that closes the page.
    return (
      <svg
        className={`ornament ornament--tailpiece${className ? ` ${className}` : ''}`}
        viewBox="0 0 200 78"
        role="presentation"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* top hairline with terminal berries */}
        <path className="orn-stroke" d="M44 8 H 156" />
        <circle className="orn-dot-ink" cx={44} cy={8} r={2.4} />
        <circle className="orn-dot-ink" cx={156} cy={8} r={2.4} />
        {/* descending mirrored leaf-pairs, narrowing to a drop */}
        <g transform="translate(100 8)">
          <path className="orn-stroke" d="M0 0 V 56" />
          <g transform="translate(0 12)"><path className="orn-leaf" d={leaf(26)} /></g>
          <g transform="translate(0 12)"><path className="orn-leaf" d={leaf(26)} transform="scale(-1 1)" /></g>
          <g transform="translate(0 30)"><path className="orn-leaf" d={leaf(17)} transform="rotate(22)" /></g>
          <g transform="translate(0 30)"><path className="orn-leaf" d={leaf(17)} transform="rotate(22) scale(-1 1)" /></g>
          <g transform="translate(0 44)"><path className="orn-leaf" d={leaf(10)} transform="rotate(46)" /></g>
          <g transform="translate(0 44)"><path className="orn-leaf" d={leaf(10)} transform="rotate(46) scale(-1 1)" /></g>
          <circle className="orn-dot-gold orn-boss" cx={0} cy={60} r={3.4} />
        </g>
      </svg>
    );
  }

  if (variant === 'rule') {
    return (
      <svg
        className={`ornament ornament--rule${className ? ` ${className}` : ''}`}
        viewBox="0 0 320 28"
        role="presentation"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <path className="orn-stroke" d="M28 14 H 132" />
        <path className="orn-stroke" d="M188 14 H 292" />
        <circle className="orn-dot-ink" cx={28} cy={14} r={2.4} />
        <circle className="orn-dot-ink" cx={292} cy={14} r={2.4} />
        <g transform="translate(140 14) rotate(180)">
          <path className="orn-leaf" d={leaf(11)} />
        </g>
        <g transform="translate(180 14)">
          <path className="orn-leaf" d={leaf(11)} />
        </g>
        <g className="orn-stroke-bold" transform="translate(160 14)">
          <path d="M0 -9 V 9" />
          <path d="M-4 -5 H 4" />
          <path d="M-7 0 H 7" />
          <path d="M-5 5 L 5 3" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      className={`ornament ornament--headpiece${className ? ` ${className}` : ''}`}
      viewBox="0 0 640 120"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <Scroll dir={1} />
      <Scroll dir={-1} />
      <Palmette bx={350} by={60} dir={1} />
      <Palmette bx={290} by={60} dir={-1} />
      <CrossRoundel cx={320} cy={60} />
      {/* terminal diamonds */}
      <g className="orn-leaf">
        <rect x={28} y={56} width={8} height={8} transform="rotate(45 32 60)" />
        <rect x={604} y={56} width={8} height={8} transform="rotate(45 608 60)" />
      </g>
    </svg>
  );
}
