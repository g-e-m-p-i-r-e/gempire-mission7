// file: src/game/core/types.ts
export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export interface Pos {
  x: number;
  y: number;
}

export interface Pacman {
  pos: Pos;
  dir: Direction;
  pendingDir: Direction;
  lives: number;
  speed: number;
  targetPos: Pos;
  poweredUntil: number;
  moveProgress: number;
  facing: 'left' | 'right';
}

export type GhostMode = 'chase' | 'frightened';

export interface Ghost {
  id: number;
  pos: Pos;
  dir: Direction;
  targetPos: Pos;
  speed: number;
  home: Pos;
  moveProgress: number;
  respawnUntil: number;
}

export type Tile = ' ' | '#' | '.' | 'B' | 'H'; // empty, wall, coin, booster, heal

export interface GameState {
  grid: Tile[][];
  width: number;
  height: number;
  coinsLeft: number;
  pacman: Pacman;
  ghosts: Ghost[];
  running: boolean;
  won: boolean;
  lost: boolean;
  score: number;
}

export const DIR_VECTORS: Record<Direction, Pos> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};
