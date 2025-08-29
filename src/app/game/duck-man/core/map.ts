import type { Tile, Pos } from './types';

export const LEVEL_MAP: string[] = [
  '###################',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#B................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.###.#.###.####',
  '   #.#.......#.#   ',
  '####.#.##G##.#.####',
  '#......#GGG#......#',
  '#.##.#.#####.#.##.#',
  '#....#.......#....#',
  '#.##.#.#####.#.##.#',
  '#........P........#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.###.#.###.####',
  '#........H........#',
  '###################',
];

// Legend:
// # = wall, . = coin, P = pacman spawn, G = ghost spawn, B = booster, H = heal, space = empty

export function parseLevel(): {
  grid: Tile[][];
  width: number;
  height: number;
  pacmanSpawn: Pos;
  ghostSpawns: Pos[];
  coinsLeft: number;
} {
  const height = LEVEL_MAP.length;
  const width = LEVEL_MAP[0].length;
  const grid: Tile[][] = Array.from({ length: height }, () => Array<Tile>(width).fill(' '));
  let pacmanSpawn: Pos = { x: 1, y: 1 };
  const ghostSpawns: Pos[] = [];
  let coinsLeft = 0;

  for (let y = 0; y < height; y++) {
    const row = LEVEL_MAP[y];
    for (let x = 0; x < width; x++) {
      const c = row[x];
      switch (c) {
        case '#':
          grid[y][x] = '#';
          break;
        case '.':
          grid[y][x] = '.';
          coinsLeft++;
          break;
        case 'B':
          grid[y][x] = 'B';
          break;
        case 'H':
          grid[y][x] = 'H';
          break;
        case 'P':
          pacmanSpawn = { x, y };
          grid[y][x] = ' ';
          break;
        case 'G':
          ghostSpawns.push({ x, y });
          grid[y][x] = ' ';
          break;
        default:
          grid[y][x] = ' ';
      }
    }
  }
  return { grid, width, height, pacmanSpawn, ghostSpawns, coinsLeft };
}

export function inBounds(x: number, y: number, width: number, height: number) {
  return x >= 0 && x < width && y >= 0 && y < height;
}
