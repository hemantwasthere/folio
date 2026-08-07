/**
 * Pixel art for the screen, drawn by hand rather than borrowed. `#` is a lit
 * pixel; everything else is off. Grids are square-ish and read top to bottom.
 *
 * Pixels suit this better than smooth vector icons: an LCD that can only light
 * whole cells is the conceit of the whole component, and it means the artwork
 * scales with the SVG without ever needing a font or an image file.
 */

/** 16x16, one per instrument in `INSTRUMENTS`. */
export const INSTRUMENT_ICONS: Record<string, readonly string[]> = {
  // Lit pixels are the naturals and the gaps are the sharps, not the other way
  // round — an outlined keyboard just reads as a row of windows. The wide lit
  // span in the middle is the E-F pair, which is what makes it a piano rather
  // than a set of evenly spaced stripes.
  piano: [
    "................",
    "................",
    "................",
    "................",
    ".##############.",
    ".#..#..####..##.",
    ".#..#..####..##.",
    ".#..#..####..##.",
    ".#..#..####..##.",
    ".#..#..####..##.",
    ".##.##.##.##.##.",
    ".##.##.##.##.##.",
    ".##############.",
    "................",
    "................",
    "................",
  ],
  musicbox: [
    "................",
    "................",
    ".............##.",
    ".............#..",
    "..############..",
    "..#..........#..",
    "..#....####..#..",
    "..#....#..#..#..",
    "..#....#..#..#..",
    "..#...##.##..#..",
    "..#...##.##..#..",
    "..#..........#..",
    "..############..",
    "................",
    "................",
    "................",
  ],
  xylophone: [
    "................",
    "................",
    "................",
    ".##.............",
    ".##.##..........",
    ".##.##.##.......",
    ".##.##.##.##....",
    ".##.##.##.##.##.",
    ".##.##.##.##.##.",
    ".##.##.##.##.##.",
    ".##.##.##.##.##.",
    ".##.##.##.##.##.",
    ".##.##.##.##.##.",
    ".##.##.##.##.##.",
    "################",
    "................",
  ],
  // The triangle silhouette, not a frame with bars in it: strings hanging off a
  // diagonal neck down to the soundboard is the only shape that reads as a harp
  // at this size.
  harp: [
    "................",
    "..............#.",
    ".............##.",
    "............###.",
    "...........#.##.",
    "..........##.##.",
    ".........#.#.##.",
    "........##.#.##.",
    ".......#.#.#.##.",
    "......##.#.#.##.",
    ".....#.#.#.#.##.",
    "....##.#.#.#.##.",
    "...############.",
    "................",
    "................",
    "................",
  ],
  banjo: [
    ".............###",
    "............###.",
    "...........###..",
    "..........###...",
    ".........###....",
    "........###.....",
    "...####.##......",
    "..######.#......",
    ".########.......",
    ".###..###.......",
    ".###..###.......",
    ".########.......",
    "..######........",
    "...####.........",
    "................",
    "................",
  ],
  // Solid body with the finger holes punched out. Drawn as an outline the two
  // rows of holes read as a face.
  ocarina: [
    "................",
    "................",
    "................",
    "....######......",
    "..##########....",
    ".############...",
    ".###.##.##.#####",
    ".####.###.######",
    ".############...",
    "..##########....",
    "....######......",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  organ: [
    "................",
    ".##.............",
    ".##......##.....",
    ".##..##..##.....",
    ".##..##..##..##.",
    ".##..##..##..##.",
    ".##..##..##..##.",
    ".##..##..##..##.",
    ".##..##..##..##.",
    ".##..##..##..##.",
    ".##..##..##..##.",
    ".##..##..##..##.",
    "################",
    "################",
    "................",
    "................",
  ],
  vox: [
    "................",
    "......####......",
    ".....######.....",
    ".....#....#.....",
    ".....#....#.....",
    ".....#....#.....",
    "..#..#....#..#..",
    "..#..#....#..#..",
    "..#..######..#..",
    "..#..........#..",
    "...#........#...",
    "....########....",
    ".......##.......",
    ".......##.......",
    "....########....",
    "................",
  ],
  chip: [
    "................",
    "................",
    "................",
    "..############..",
    ".##..........##.",
    ".#....##...##.#.",
    ".#....##...##.#.",
    ".#..######....#.",
    ".#..######.##.#.",
    ".#....##...##.#.",
    ".#....##......#.",
    ".##..........##.",
    "..############..",
    "................",
    "................",
    "................",
  ],
  farts: [
    "................",
    "................",
    "................",
    "..####....####..",
    ".######..######.",
    ".######..######.",
    ".######..######.",
    ".######..######.",
    ".######..######.",
    ".######..######.",
    "..####....####..",
    "...##......##...",
    "................",
    "................",
    "................",
    "................",
  ],
};

/**
 * G clef, 11x26. It sits permanently at the head of the staff — a staff without
 * one does not read as music, it reads as five lines.
 */
export const CLEF: readonly string[] = [
  ".....###...",
  "....##..##.",
  "....#....#.",
  "....#...##.",
  "....#..##..",
  "....#.##...",
  "....##.....",
  "....#......",
  "...##......",
  "..##.#.....",
  ".##..#.....",
  ".#...#..##.",
  "#....#.#..#",
  "#....##...#",
  "#....#....#",
  ".#...#...#.",
  ".##..#.##..",
  "..#####....",
  "....#......",
  "...###.....",
  "..##.##....",
  "..#...#....",
  "..##.##....",
  "...###.....",
  "....#......",
  "...#.......",
];

/** Just enough of a 5x7 pixel face to spell the one word the screen needs. */
const FONT: Record<string, readonly string[]> = {
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
};

const GLYPH_W = 5;
const GLYPH_PITCH = 6;

export const gridWidth = (grid: readonly string[]) =>
  Math.max(...grid.map((row) => row.length));

interface PixelsProps {
  grid: readonly string[];
  x: number;
  y: number;
  scale: number;
  className?: string;
  opacity?: number;
}

/**
 * Paints a grid as SVG rects, merging each horizontal run of lit pixels into a
 * single rect — an icon comes out as a couple of dozen nodes rather than a
 * couple of hundred.
 */
export const Pixels: React.FC<PixelsProps> = ({
  grid,
  x,
  y,
  scale,
  className,
  opacity,
}) => {
  const runs: { col: number; row: number; length: number }[] = [];

  grid.forEach((row, rowIndex) => {
    let start = -1;

    // One past the end closes any run that reaches the right edge.
    for (let col = 0; col <= row.length; col++) {
      const lit = row[col] === "#";

      if (lit && start < 0) start = col;
      if (!lit && start >= 0) {
        runs.push({ col: start, row: rowIndex, length: col - start });
        start = -1;
      }
    }
  });

  return (
    <g className={className} opacity={opacity}>
      {runs.map((run) => (
        <rect
          key={`${run.row}-${run.col}`}
          x={x + run.col * scale}
          y={y + run.row * scale}
          width={run.length * scale}
          height={scale}
        />
      ))}
    </g>
  );
};

interface PixelWordProps {
  text: string;
  /** Centre of the word, not its left edge. */
  centerX: number;
  centerY: number;
  scale: number;
  className?: string;
}

export const PixelWord: React.FC<PixelWordProps> = ({
  text,
  centerX,
  centerY,
  scale,
  className,
}) => {
  const letters = [...text];
  const width = ((letters.length - 1) * GLYPH_PITCH + GLYPH_W) * scale;
  const left = centerX - width / 2;
  const top = centerY - (7 * scale) / 2;

  return (
    <g className={className}>
      {letters.map((letter, index) => {
        const grid = FONT[letter];
        if (!grid) return null;

        return (
          <Pixels
            key={`${letter}-${index}`}
            grid={grid}
            x={left + index * GLYPH_PITCH * scale}
            y={top}
            scale={scale}
          />
        );
      })}
    </g>
  );
};
