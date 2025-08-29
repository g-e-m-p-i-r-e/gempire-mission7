import { DIR_VECTORS, Direction, type Pos } from './types';
import { inBounds } from './map';

export function bfsNextStep(grid: string[][], from: Pos, to: Pos): Pos | null {
  const h = grid.length;
  const w = grid[0].length;
  const q: Pos[] = [from];
  const visited = new Set<number>();
  const prev = new Map<number, number>();
  const key = (p: Pos) => p.y * w + p.x;
  visited.add(key(from));

  const isWalkable = (x: number, y: number) => inBounds(x, y, w, h) && grid[y][x] !== '#';

  while (q.length) {
    const cur = q.shift()!;
    if (cur.x === to.x && cur.y === to.y) break;
    for (const v of Object.values(DIR_VECTORS)) {
      if (v.x === 0 && v.y === 0) continue;
      const nx = cur.x + v.x;
      const ny = cur.y + v.y;
      if (!isWalkable(nx, ny)) continue;
      const k = ny * w + nx;
      if (visited.has(k)) continue;
      visited.add(k);
      prev.set(k, key(cur));
      q.push({ x: nx, y: ny });
    }
  }

  // reconstruct one step
  let cursorKey = key(to);
  if (!prev.has(cursorKey)) return null;
  let parent = prev.get(cursorKey)!;
  while (parent !== key(from)) {
    cursorKey = parent;
    parent = prev.get(cursorKey)!;
  }
  return { x: cursorKey % w, y: Math.floor(cursorKey / w) };
}

export function farthestStep(grid: string[][], from: Pos, awayFrom: Pos): Pos {
  // Pick the neighboring walkable tile that maximizes distance to awayFrom (greedy)
  let best = from;
  let bestDist = -1;
  const isWalkable = (x: number, y: number) => y >= 0 && y < grid.length && x >= 0 && x < grid[0].length && grid[y][x] !== '#';

  for (const v of Object.values(DIR_VECTORS)) {
    if (v.x === 0 && v.y === 0) continue;
    const nx = from.x + v.x;
    const ny = from.y + v.y;
    if (!isWalkable(nx, ny)) continue;
    const dx = nx - awayFrom.x;
    const dy = ny - awayFrom.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > bestDist) {
      bestDist = d2;
      best = { x: nx, y: ny };
    }
  }
  return best;
}

export function randomStep(grid: string[][], from: Pos, lastDir?: Direction): Pos {
  const h = grid.length;
  const w = grid[0].length;
  const isWalkable = (x: number, y: number) => inBounds(x, y, w, h) && grid[y][x] !== '#';

  const dirs: Direction[] = ['up', 'right', 'down', 'left'];
  const reverse: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
    none: 'none',
  };

  const options = dirs
    .map((d) => ({ d, p: { x: from.x + DIR_VECTORS[d].x, y: from.y + DIR_VECTORS[d].y } }))
    .filter((o) => isWalkable(o.p.x, o.p.y));

  if (options.length === 0) return from;

  // Prefer not reversing direction if other options exist
  const nonReverse = lastDir ? options.filter((o) => o.d !== reverse[lastDir!]) : options;

  const pool = nonReverse.length > 0 ? nonReverse : options;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.p;
}
