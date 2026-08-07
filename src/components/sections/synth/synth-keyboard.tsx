import { NOTES, prettyNote, type SynthNote } from "@/lib/synth";

/**
 * Ten white keys from C4 to E5 on a 28-unit pitch, with the sharps straddling
 * the gaps. Everything is derived from these numbers so the geometry stays
 * consistent if the range ever changes.
 */
const PITCH = 28;
const WHITE_X = 21;
const WHITE_W = 26.5;
const WHITE_Y = 94;
const WHITE_H = 88;
const BLACK_W = 17;
const BLACK_H = 55;
const LAST_STEP = 9;

/** Matches the backdrop's own corner, less its 2-unit border. */
const OUTER_R = 4;

const whiteX = (step: number) => WHITE_X + step * PITCH;
/** Centred on the seam between its two white neighbours. */
const blackX = (step: number) =>
  WHITE_X + (step + 1) * PITCH - (PITCH - WHITE_W) / 2 - BLACK_W / 2;

/**
 * Rounded rect with per-corner radii, clockwise from the top left. Keys are
 * square where they meet a neighbour and rounded where they meet the outside
 * world, so the two end keys have to round their outer top corner as well —
 * otherwise they poke a sharp point into the backdrop's curve.
 */
const keyPath = (
  x: number,
  y: number,
  w: number,
  h: number,
  [tl, tr, br, bl]: readonly [number, number, number, number]
) =>
  `M${x + tl} ${y}` +
  `H${x + w - tr}${tr ? `A${tr} ${tr} 0 0 1 ${x + w} ${y + tr}` : ""}` +
  `V${y + h - br}${br ? `A${br} ${br} 0 0 1 ${x + w - br} ${y + h}` : ""}` +
  `H${x + bl}${bl ? `A${bl} ${bl} 0 0 1 ${x} ${y + h - bl}` : ""}` +
  `V${y + tl}${tl ? `A${tl} ${tl} 0 0 1 ${x + tl} ${y}` : ""}Z`;

interface SynthKeyboardProps {
  pressed: ReadonlySet<string>;
  /** Keys are inert, and their letters hidden, until the screen is switched on. */
  enabled: boolean;
  /** Hidden on touch, where there is no keyboard to hint at. */
  showLetters: boolean;
  onPress: (note: SynthNote) => void;
  onRelease: (note: SynthNote) => void;
  /** Called on pointer-enter so dragging across the keys glissandos. */
  onEnter: (note: SynthNote) => void;
}

const SynthKeyboard: React.FC<SynthKeyboardProps> = ({
  pressed,
  enabled,
  showLetters,
  onPress,
  onRelease,
  onEnter,
}) => {
  // Whites first so the sharps paint on top of them.
  const ordered = [...NOTES].sort((a, b) => Number(a.black) - Number(b.black));

  return (
    <g>
      <rect
        className="fill-[var(--synth-edge)]"
        x={19}
        y={92}
        width={282}
        height={92}
        rx={6}
      />

      {ordered.map((note) => {
        const isPressed = pressed.has(note.id);
        const x = note.black ? blackX(note.step) : whiteX(note.step);
        const width = note.black ? BLACK_W : WHITE_W;
        const height = note.black ? BLACK_H : WHITE_H;
        const bottom = note.black ? 3 : OUTER_R;

        const corners = note.black
          ? ([0, 0, bottom, bottom] as const)
          : ([
              note.step === 0 ? OUTER_R : 0,
              note.step === LAST_STEP ? OUTER_R : 0,
              bottom,
              bottom,
            ] as const);

        return (
          <g
            key={note.id}
            className={`synth_key ${note.black ? "synth_key--black" : ""}`}
            data-pressed={isPressed || undefined}
            onPointerDown={(event) => {
              if (!enabled) return;

              // Keeps the browser from starting a text selection or a scroll
              // gesture halfway through a glissando.
              event.preventDefault();
              // Touch implicitly captures the pointer to the key it started on,
              // which would stop every other key from ever seeing a
              // pointerenter. Handing it back is what makes dragging work.
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              onPress(note);
            }}
            onPointerEnter={() => enabled && onEnter(note)}
            onPointerUp={() => onRelease(note)}
            onPointerLeave={() => onRelease(note)}
          >
            <title>{prettyNote(note.id)}</title>
            {/* Fill comes from CSS so the pressed state can swap it. */}
            <path
              d={keyPath(x, WHITE_Y, width, height, corners)}
              stroke="var(--synth-edge)"
              strokeWidth={0.75}
            />
            {showLetters && (
              <text
                className={`synth_letter font-jetbrains pointer-events-none select-none ${
                  note.black
                    ? "fill-[var(--synth-letter-on-black)]"
                    : "fill-[var(--synth-letter)]"
                }`}
                data-visible={enabled || undefined}
                // Staggered so the labels ripple in across the keyboard once
                // the synth wakes up, rather than all snapping on at once.
                style={{ transitionDelay: `${note.step * 35}ms` }}
                x={x + width / 2}
                y={note.black ? WHITE_Y + BLACK_H - 9 : WHITE_Y + WHITE_H - 10}
                fontSize={note.black ? 7.5 : 9}
                textAnchor="middle"
              >
                {note.key === ";" ? ";" : note.key.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

export default SynthKeyboard;
