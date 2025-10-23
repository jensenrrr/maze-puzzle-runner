// ASCII maze layout parsing to wall edges and start/exit positions
import { Position } from './types';

// Note: WallEdge type for legacy compatibility
interface WallEdge {
  from: Position;
  to: Position;
  type: string;
}

export const ASCII_MAZE = `+-+---+-----+-----+---+--S------------+---+-------+
| |   |     |     |   |               |   |       |
| | | +---+ | | | | | +-+ +---+-----+ | | | --+ --+
|   |     |   | |   |   | |   |     |   |     |   |
+---+---+ +---+ +-+-+-+ +-+ | | +-+ +---+ +---+-- |
|       |     |   |   |     | | | |     | |   |   |
+------ +-+-+ +-+ | | +-+---+ | | +---+ | | | | | |
|         | |   |   | | |   |   |     | | | |   | |
| ----+-- | +-+ +-+ | | | | +---+ +-- | +-+ +---+ |
|     |       |   | | |   |     | |   |   | |   | |
| --+ +-+-- +-+-+ +-+ | --+ --+-+ | --+-+ | | | | |
|   |   |   |   | |   |   |   |   |     | | | | | |
+---+-+ +---+ | | | +-+ +-+-+ | +-+-+ | | | +-+ | |
|     | |     | | | |   |   | | |   | | | |   | | |
| --+ | | +---+ | | +-+-+ | | | | | | +-+ +-- | | |
|   |   | |   |   |   |   |   | | | |   | |   |   |
| | +---+ +-- +---+-- | +-+-- | +-+ +-- | | +-+ +-+
| |     |             | |     |     |   |   | | | |
| +---+ +-------------+ +-----+---- | --+---+ | | |
|     |                             |             |
+-----+------------------E----------+-------------+`;

// Parsing strategy (space-as-square model):
// Lines alternate between wall rows ('+' first char) and square rows ('|' first char).
// Square rows: squares are spans between successive '|' characters. Count of squares in a row = number of '|' - 1.
// Vertical wall edges: each '|' denotes a boundary; create vertical edges between squares on its left/right for that row.
// Horizontal wall rows: segments of '-' between '+' denote horizontal wall boundaries between square rows above and below.
// Start 'S' and Exit 'E': appear inside square rows; determine square index by locating which bar pair surrounds the character.

export interface ParsedMaze {
  width: number; // number of squares horizontally
  height: number; // number of squares vertically
  walls: WallEdge[];
  start: Position;
  exit: Position;
}

function normalizeEdge(a: Position, b: Position): WallEdge {
  return { from: a, to: b, type: 'wall' };
}

export function parseAsciiMaze(ascii: string): ParsedMaze {
  const lines = ascii.split(/\r?\n/);
  const walls: WallEdge[] = [];
  let start: Position = { x: 0, y: 0 };
  let exit: Position = { x: 0, y: 0 };

  // Determine width from first square row
  const firstSquareRow = lines.find(l => l.startsWith('|'));
  if (!firstSquareRow) return { width: 0, height: 0, walls, start, exit };
  const barPositions = [...firstSquareRow].map((c, i) => c === '|' ? i : -1).filter(i => i !== -1);
  const width = barPositions.length - 1;
  const height = lines.filter(l => l.startsWith('|')).length;

  // Horizontal walls
  lines.forEach((line, lineIdx) => {
    if (!line.startsWith('+')) return;
    // Square row above index
    const squareRowsAbove = lines.slice(0, lineIdx).filter(l => l.startsWith('|')).length - 1;
    const rowAbove = squareRowsAbove;
    const rowBelow = rowAbove + 1;
    const plusPositions = [...line].map((c, i) => c === '+' ? i : -1).filter(i => i !== -1);
    for (let p = 0; p < plusPositions.length - 1; p++) {
      const leftPlus = plusPositions[p];
      const rightPlus = plusPositions[p + 1];
      const segment = line.slice(leftPlus + 1, rightPlus);
      if (segment.includes('-') && rowAbove >= 0 && rowBelow < height) {
        // Wall between rowAbove and rowBelow for each column spanned
        for (let col = p; col < p + 1; col++) {
          // Represent vertical separation edge between squares (col,rowAbove) and (col,rowBelow)
          const a: Position = { x: col, y: rowAbove };
          const b: Position = { x: col, y: rowBelow };
          walls.push(normalizeEdge(a, b));
        }
      }
    }
  });

  // Vertical walls & start/exit
  let squareRowIndex = 0;
  lines.forEach(line => {
    if (!line.startsWith('|')) return;
    const bars = [...line].map((c, i) => c === '|' ? i : -1).filter(i => i !== -1);
    // For each interior bar (excluding first and last), add vertical wall between adjacent squares
    for (let b = 1; b < bars.length - 1; b++) {
      const col = b - 1; // square to left
      const left: Position = { x: col, y: squareRowIndex };
      const right: Position = { x: col + 1, y: squareRowIndex };
      walls.push(normalizeEdge(left, right));
    }
    // Detect start/exit within the spans
    [...line].forEach((ch, idx) => {
      if (ch === 'S' || ch === 'E') {
        // Find which square span this character belongs to
        let col = 0;
        for (let s = 0; s < bars.length - 1; s++) {
          if (idx > bars[s] && idx < bars[s + 1]) {
            col = s;
            break;
          }
        }
        if (ch === 'S') start = { x: col, y: squareRowIndex };
        if (ch === 'E') exit = { x: col, y: squareRowIndex };
      }
    });
    squareRowIndex++;
  });

  // Outer border walls: add edges around perimeter
  for (let x = 0; x < width; x++) {
    walls.push(normalizeEdge({ x, y: 0 }, { x, y: -1 })); // top implicit
    walls.push(normalizeEdge({ x, y: height - 1 }, { x, y: height })); // bottom implicit
  }
  for (let y = 0; y < height; y++) {
    walls.push(normalizeEdge({ x: 0, y }, { x: -1, y })); // left implicit
    walls.push(normalizeEdge({ x: width - 1, y }, { x: width, y })); // right implicit
  }

  return { width, height, walls, start, exit };
}

export function debugParsed() {
  const parsed = parseAsciiMaze(ASCII_MAZE);
  console.log('Parsed maze', parsed);
  return parsed;
}
