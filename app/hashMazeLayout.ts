import { Cell, CellType, Position, GateType } from './types';

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

// HASH_MAZE includes gates (replace internal wall cells only): 3 of each $ % & @ ?
export const HASH_MAZE = `##############S##############
#   # 9                     #
### # ########### ######### #
# # # #         #     #     #
# # ### ##%#### ##@## # ### #
#   #   #   9 # #   # # #   #
# ### ### ### # # # # # ### #
#     # # # * # # # # #   # #
####?## # # ### # # #&### # #
# #   #   #   #   # #     $ #
# # # # ##### ##### # ##### #
# # #   #   # #   #   #   # #
# # ##### ### # # ##### # # #
# ?   #     #   #   #   # # #
# ### ### # ##%#### # ### # #
#   #   # #       # #9#   # #
### ### ##### ### # # # ### #
#     #   *   # # #   #   # #
# #######$##### # ####### # #
#     #     #   #   #   9 # #
# ### # # # # # # ### ### # #
#   # # # #   # # @   #   # #
# ### # # ### ### # ####### #
#9#   # #   # #   # #     * #
# # ### ### ####### # #######
# # #   # #  9  # # #   #   #
#*# # ########### # ####### #
# #    $           #   #     #
##############E##############`
export interface ParsedHashMaze {
  grid: Cell[][];
  start: Position;
  exit: Position;
  width: number;
  height: number;
  enemies: { id: number; kind: 'stationary' | 'roaming'; position: Position }[];
}

export function parseHashMaze(ascii: string): ParsedHashMaze {
  const lines = ascii.split(/\r?\n/);
  const height = lines.length;
  const width = lines[0]?.length || 0;
  const grid: Cell[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => ({ type: 'floor', isWalkable: true })));
  let start: Position = { x: 0, y: 0 };
  let exit: Position = { x: width - 1, y: height - 1 };
  const enemies: { id: number; kind: 'stationary' | 'roaming'; position: Position }[] = [];
  let enemyIdCounter = 1;

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
      } else if (ch === '9') {
        // Stationary enemy (chaser that needs to be clicked to activate)
        cellType = 'floor';
        isWalkable = true;
        enemies.push({ id: enemyIdCounter++, kind: 'stationary', position: { x, y } });
      } else if (ch === '*') {
        // Roaming enemy (moves randomly until seeing player)
        cellType = 'floor';
        isWalkable = true;
        enemies.push({ id: enemyIdCounter++, kind: 'roaming', position: { x, y } });
      } else if (['$', '%', '&', '@', '?'].includes(ch)) {
        cellType = 'gate';
        // gate walkability determined later using gateStatus; default false until opened
        isWalkable = false;
        const mapping: Record<string, GateType> = {
          '$': 'gateA',
          '%': 'gateB',
          '&': 'gateC',
          '@': 'gateD',
          '?': 'gateE',
        };
        grid[y][x] = { type: cellType, isWalkable, gateType: mapping[ch] };
        continue; // already set cell; skip below assignment
      }
      grid[y][x] = { type: cellType, isWalkable };
    }
  }

  return { grid, start, exit, width, height, enemies };
}
