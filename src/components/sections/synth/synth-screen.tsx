import {
  CLEF,
  INSTRUMENT_ICONS,
  PixelWord,
  Pixels,
} from "@/components/sections/synth/synth-pixels";
import { NOTES, prettyNote } from "@/lib/synth";

/**
 * Treble staff, bottom line up: E4 G4 B4 D5 F5. The keyboard starts a third
 * below that, so C4 lands on its ledger line and D4 in the space under the
 * staff — which is exactly what `step` counts from.
 */
const GAP = 8;
const BOTTOM_LINE = 65;
const STAFF_LEFT = 34;
const STAFF_RIGHT = 186;

/** Where the last few notes get written, left to right after the clef. */
const SLOTS = [78, 106, 134, 162];
/** Newest note first: how much of the ink is left as it scrolls off. */
const INK = [1, 0.55, 0.34, 0.2];

const ICON_SCALE = 2;
const ICON_X = 234;
const ICON_Y = 24;

const NOTE_BY_ID = new Map(NOTES.map((note) => [note.id, note]));

/** E4 is `step` 2 and sits on the bottom line; every step is half a gap. */
const noteY = (step: number) => BOTTOM_LINE - (step - 2) * (GAP / 2);

interface SynthScreenProps {
  /** Before this, the screen is a PLAY button and nothing else. */
  enabled: boolean;
  instrumentId: string;
  instrumentName: string;
  /** The last few notes played, oldest first. */
  history: readonly string[];
  startLabel: string;
  shuffleLabel: string;
  prevLabel: string;
  nextLabel: string;
  onStart: () => void;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
}

const SynthScreen: React.FC<SynthScreenProps> = ({
  enabled,
  instrumentId,
  instrumentName,
  history,
  startLabel,
  shuffleLabel,
  prevLabel,
  nextLabel,
  onStart,
  onPrev,
  onNext,
  onShuffle,
}) => {
  const written = history
    .map((id) => NOTE_BY_ID.get(id))
    .filter((note) => note !== undefined);
  const current = written.at(-1);

  return (
    <g>
      <rect
        className="fill-[var(--synth-lcd)]"
        x={19}
        y={14}
        width={282}
        height={70}
        rx={8}
      />

      {!enabled ? (
        <g className="synth_start cursor-pointer" onClick={onStart}>
          <title>{startLabel}</title>
          <rect x={19} y={14} width={282} height={70} rx={8} fillOpacity={0} />
          <PixelWord
            className="fill-[var(--synth-lcd-ink)]"
            text="PLAY"
            centerX={160}
            centerY={49}
            scale={6}
          />
        </g>
      ) : (
        <>
          {/* Staff */}
          <g
            className="stroke-[var(--synth-lcd-dim)]"
            strokeWidth={1}
            strokeLinecap="square"
          >
            {[0, 1, 2, 3, 4].map((line) => (
              <line
                key={line}
                x1={STAFF_LEFT}
                x2={STAFF_RIGHT}
                y1={BOTTOM_LINE - line * GAP}
                y2={BOTTOM_LINE - line * GAP}
              />
            ))}
            <line
              x1={STAFF_RIGHT}
              x2={STAFF_RIGHT}
              y1={BOTTOM_LINE - 4 * GAP}
              y2={BOTTOM_LINE}
            />
          </g>

          {/* The clef never leaves — it is what makes the five lines a staff. */}
          <Pixels
            className="fill-[var(--synth-lcd-ink)]"
            grid={CLEF}
            x={36}
            y={25}
            scale={ICON_SCALE}
          />

          {written.map((note, index) => {
            const x = SLOTS[index];
            const y = noteY(note.step);
            // B4 and up hang their stem downwards, the usual engraving rule.
            const stemDown = note.step >= 6;

            return (
              <g
                key={`${index}-${note.id}`}
                className="fill-[var(--synth-lcd-ink)]"
                opacity={INK[written.length - 1 - index]}
              >
                {/* C4 sits a whole space below the staff, so it needs a ledger. */}
                {note.step === 0 && (
                  <line
                    className="stroke-[var(--synth-lcd-ink)]"
                    strokeWidth={1.2}
                    x1={x - 9}
                    x2={x + 9}
                    y1={y}
                    y2={y}
                  />
                )}
                <ellipse
                  cx={x}
                  cy={y}
                  rx={5}
                  ry={3.8}
                  transform={`rotate(-18 ${x} ${y})`}
                />
                <rect
                  x={stemDown ? x - 5 : x + 3.6}
                  y={stemDown ? y : y - 22}
                  width={1.4}
                  height={22}
                />
                {note.black && (
                  <text
                    className="font-jetbrains select-none"
                    x={x - 15}
                    y={y + 4.5}
                    fontSize={13}
                    textAnchor="middle"
                  >
                    ♯
                  </text>
                )}
              </g>
            );
          })}

          <line
            className="stroke-[var(--synth-lcd-dim)]"
            strokeWidth={1}
            strokeDasharray="2 3"
            x1={200}
            x2={200}
            y1={24}
            y2={74}
          />

          {/* Instrument selector */}
          <g
            className="synth_control cursor-pointer"
            role="button"
            aria-label={prevLabel}
            onClick={onPrev}
          >
            <title>{prevLabel}</title>
            <rect x={204} y={29} width={22} height={22} fillOpacity={0} />
            <path
              className="fill-[var(--synth-lcd-ink)]"
              d="M219 34 L219 46 L210 40 Z"
            />
          </g>

          <g
            className="synth_control cursor-pointer"
            role="button"
            aria-label={nextLabel}
            onClick={onNext}
          >
            <title>{nextLabel}</title>
            <rect x={276} y={29} width={22} height={22} fillOpacity={0} />
            <path
              className="fill-[var(--synth-lcd-ink)]"
              d="M283 34 L283 46 L292 40 Z"
            />
          </g>

          {/* The icon is the button that reshuffles, as on the machine this is
              modelled after. Its name lives in the tooltip and the aria label. */}
          <g
            className="synth_control cursor-pointer"
            role="button"
            aria-label={`${instrumentName} — ${shuffleLabel}`}
            onClick={onShuffle}
          >
            <title>{`${instrumentName} — ${shuffleLabel}`}</title>
            <rect x={230} y={20} width={40} height={40} fillOpacity={0} />
            <Pixels
              className="fill-[var(--synth-lcd-ink)]"
              grid={INSTRUMENT_ICONS[instrumentId] ?? INSTRUMENT_ICONS.piano}
              x={ICON_X}
              y={ICON_Y}
              scale={ICON_SCALE}
            />
          </g>

          <text
            className="font-jetbrains fill-[var(--synth-lcd-ink)] select-none"
            x={250}
            y={77}
            fontSize={14}
            fontWeight={600}
            textAnchor="middle"
          >
            {current ? prettyNote(current.id) : "––"}
          </text>
        </>
      )}
    </g>
  );
};

export default SynthScreen;
