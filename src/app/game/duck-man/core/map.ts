import type { Tile, Pos } from './types';

export const LEVEL_MAPS: string[][] = [
  [
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
],[
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
  ]
];

// Legend:
// # = wall, . = coin, P = pacman spawn, G = ghost spawn, B = booster, H = heal, space = empty

export function parseLevel(levelIndex = 0): {
  grid: Tile[][];
  width: number;
  height: number;
  pacmanSpawn: Pos;
  ghostSpawns: Pos[];
  coinsLeft: number;
  totalLevels: number;
} {
  const map = LEVEL_MAPS[levelIndex % LEVEL_MAPS.length];
  const height = map.length;
  const width = map[0].length;
  const grid: Tile[][] = Array.from({ length: height }, () => Array<Tile>(width).fill(' '));
  let pacmanSpawn: Pos = { x: 1, y: 1 };
  const ghostSpawns: Pos[] = [];
  let coinsLeft = 0;

  for (let y = 0; y < height; y++) {
    const row = map[y];
    for (let x = 0; x < width; x++) {
      const c = row[x];
      switch (c) {
        case '#': grid[y][x] = '#'; break;
        case '.': grid[y][x] = '.'; coinsLeft++; break;
        case 'B': grid[y][x] = 'B'; break;
        case 'H': grid[y][x] = 'H'; break;
        case 'P': pacmanSpawn = { x, y }; grid[y][x] = ' '; break;
        case 'G': ghostSpawns.push({ x, y }); grid[y][x] = ' '; break;
        default: grid[y][x] = ' ';
      }
    }
  }
  return { grid, width, height, pacmanSpawn, ghostSpawns, coinsLeft, totalLevels: LEVEL_MAPS.length };
}

export function inBounds(x: number, y: number, width: number, height: number) {
  return x >= 0 && x < width && y >= 0 && y < height;
}
