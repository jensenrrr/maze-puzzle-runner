import { Cell, CellType, Position } from './types';

export const originalMaze = `##############S##############
#   #                       #
### # ########### ######### #
# # # #         #     #     #
# # ### ####### ##### # ### #
#   #   #     # #   # # #   #
# ### ### ### # # # # # ### #
#     # # #   # # # # #   # #
####### # # ### # # ##### # #
# #   #   #   #   # #     # #
# # # # ##### ##### # ##### #
# # #   #   # #   #   #   # #
# # ##### ### # # ##### # # #
# #   #     #   #   #   # # #
# ### ### # ####### # ### # #
#   #   # #       # # #   # #
### ### ##### ### # # # ### #
#     #       # # #   #   # #
# ############# # ####### # #
#     #     #   #   #     # #
# ### # # # # # # ### ### # #
#   # # # #   # # #   #   # #
# ### # # ### ### # ####### #
# #   # #   # #   # #       #
# # ### ### ### ### # #######
# # #   # #     # # #   #   #
# # # ### ####### # ### ### #
# #               #         #
##############E##############`

export const HASH_MAZE = `##############S##############
#   #                       #
### # ########### ######### #
# # # #         #     #     #
# # ### ####### ##### # ### #
#   #   #     # #   # # #   #
# ### ### ### # # # # # ### #
#     # # #   # # # # #   # #
####### # # ### # # ##### # #
# #   #   #   #   # #     # #
# # # # ##### ##### # ##### #
# # #   #   # #   #   #   # #
# # ##### ### # # ##### # # #
# #   #     #   #   #   # # #
# ### ### # ####### # ### # #
#   #   # #       # # #   # #
### ### ##### ### # # # ### #
#     #       # # #   #   # #
# ############# # ####### # #
#     #     #   #   #     # #
# ### # # # # # # ### ### # #
#   # # # #   # # #   #   # #
# ### # # ### ### # ####### #
# #   # #   # #   # #       #
# # ### ### ### ### # #######
# # #   # #     # # #   #   #
# # # ### ####### # ### ### #
# #               #         #
##############E##############`
export interface ParsedHashMaze {
  grid: Cell[][];
  start: Position;
  exit: Position;
  width: number;
  height: number;
}

export function parseHashMaze(ascii: string): ParsedHashMaze {
  const lines = ascii.split(/\r?\n/);
  const height = lines.length;
  const width = lines[0]?.length || 0;
  const grid: Cell[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => ({ type: 'floor', isWalkable: true })));
  let start: Position = { x: 0, y: 0 };
  let exit: Position = { x: width - 1, y: height - 1 };

  for (let y = 0; y < height; y++) {
    const row = lines[y];
    for (let x = 0; x < width; x++) {
      const ch = row[x];
      let cellType: CellType = 'floor';
      let isWalkable = true;
      if (ch === '#') {
        cellType = 'wall';
        isWalkable = false;
      } else if (ch === '.') {
        cellType = 'floor';
        isWalkable = true;
      } else if (ch === 'S') {
        cellType = 'start';
        start = { x, y };
      } else if (ch === 'E') {
        cellType = 'exit';
        exit = { x, y };
      }
      grid[y][x] = { type: cellType, isWalkable };
    }
  }

  return { grid, start, exit, width, height };
}
