'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { randomStep } from './ai';
import { parseLevel } from './map';
import { DIR_VECTORS, type Direction, type GameState, type Ghost, type Pacman, type Pos } from './types';
import { GamePageProps } from '@/app/game/duck-man/game';

const TICK_HZ = 60;
const POWER_DURATION_MS = 8000;
const MAX_LIVES = 3;
const MOVE_SPEED = 5;
const GHOST_SPEED = 5;
const GHOST_RESPAWN_DELAY_MS = 5000;

function canMove(grid: string[][], pos: Pos) {
  return grid[pos.y]?.[pos.x] !== '#';
}
function nextPos(pos: Pos, dir: Direction): Pos {
  const v = DIR_VECTORS[dir];
  return { x: pos.x + v.x, y: pos.y + v.y };
}
function samePos(a: Pos, b: Pos) {
  return a.x === b.x && a.y === b.y;
}

export function useGameEngine({ postEndGame }: GamePageProps) {
  const endPostedRef = useRef(false);
  const initial = useMemo<GameState>(() => {
    const parsed = parseLevel();
    const pac: Pacman = {
      pos: parsed.pacmanSpawn,
      targetPos: parsed.pacmanSpawn,
      dir: 'none',
      pendingDir: 'none',
      speed: MOVE_SPEED,
      lives: MAX_LIVES,
      poweredUntil: 0,
      moveProgress: 0,
      facing: 'right',
    };
    const ghosts: Ghost[] = Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      pos: parsed.ghostSpawns[i % parsed.ghostSpawns.length],
      targetPos: parsed.ghostSpawns[i % parsed.ghostSpawns.length],
      dir: 'left',
      speed: GHOST_SPEED,
      home: parsed.ghostSpawns[i % parsed.ghostSpawns.length],
      moveProgress: 0,
      respawnUntil: 0,
    }));
    return {
      grid: parsed.grid,
      width: parsed.width,
      height: parsed.height,
      coinsLeft: parsed.coinsLeft,
      pacman: pac,
      ghosts,
      running: true,
      won: false,
      lost: false,
      score: 0,
    };
  }, []);

  const stateRef = useRef<GameState>(initial);
  const [snapshot, setSnapshot] = useState<GameState>(initial);

  // Input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const code = e.code;
      const dirByCode: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        KeyW: 'up',
        KeyS: 'down',
        KeyA: 'left',
        KeyD: 'right',
      };
      const dir = dirByCode[code];
      if (dir) {
        e.preventDefault();
        stateRef.current.pacman.pendingDir = dir;
        return;
      }
      if (code === 'KeyR') {
        const parsed = parseLevel();
        stateRef.current = {
          grid: parsed.grid,
          width: parsed.width,
          height: parsed.height,
          coinsLeft: parsed.coinsLeft,
          pacman: {
            pos: parsed.pacmanSpawn,
            targetPos: parsed.pacmanSpawn,
            dir: 'none',
            pendingDir: 'none',
            speed: MOVE_SPEED,
            lives: MAX_LIVES,
            poweredUntil: 0,
            moveProgress: 0,
            facing: 'right',
          },
          ghosts: Array.from({ length: 4 }).map((_, i) => ({
            id: i,
            pos: parsed.ghostSpawns[i % parsed.ghostSpawns.length],
            targetPos: parsed.ghostSpawns[i % parsed.ghostSpawns.length],
            dir: 'left',
            speed: GHOST_SPEED,
            home: parsed.ghostSpawns[i % parsed.ghostSpawns.length],
            moveProgress: 0,
            respawnUntil: 0,
          })),
          running: true,
          won: false,
          lost: false,
          score: 0,
        };
        endPostedRef.current = false;
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Game loop
  useEffect(() => {
    let last = performance.now();
    let acc = 0;
    const stepMs = 1000 / TICK_HZ;
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      acc += now - last;
      last = now;
      while (acc >= stepMs) {
        tick(stateRef.current, now);
        acc -= stepMs;
      }
      const s = stateRef.current;
      setSnapshot({ ...s, grid: s.grid.map((r) => [...r]) });

      console.log(s.running);
      if ((s.lost || s.won) && !endPostedRef.current) {
        endPostedRef.current = true;
        postEndGame(s.score, s.won);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [postEndGame]);

  return snapshot;
}

function tick(s: GameState, now: number) {
  if (!s.running) return;
  const dt = 1 / TICK_HZ;

  // Pacman movement
  if (s.pacman.moveProgress >= 1) {
    s.pacman.pos = { ...s.pacman.targetPos };
    s.pacman.moveProgress = 0;

    if (s.pacman.pendingDir !== s.pacman.dir) {
      const np = nextPos(s.pacman.pos, s.pacman.pendingDir);
      if (canMove(s.grid, np)) s.pacman.dir = s.pacman.pendingDir;
    }

    const pNext = nextPos(s.pacman.pos, s.pacman.dir);
    if (canMove(s.grid, pNext)) s.pacman.targetPos = pNext;
    else s.pacman.targetPos = { ...s.pacman.pos };

    // Collect tile
    const tile = s.grid[s.pacman.pos.y][s.pacman.pos.x];
    if (tile === '.') {
      s.grid[s.pacman.pos.y][s.pacman.pos.x] = ' ';
      s.coinsLeft--;
      s.score += 10;
    } else if (tile === 'B') {
      s.grid[s.pacman.pos.y][s.pacman.pos.x] = ' ';
      s.pacman.poweredUntil = now + POWER_DURATION_MS;
      s.score += 50;
    } else if (tile === 'H') {
      s.grid[s.pacman.pos.y][s.pacman.pos.x] = ' ';
      s.pacman.lives = Math.min(MAX_LIVES, s.pacman.lives + 1);
      s.score += 25;
    }

    if (s.coinsLeft <= 0) {
      s.running = false;
      s.won = true;
      return;
    }
  } else {
    s.pacman.moveProgress = Math.min(1, s.pacman.moveProgress + s.pacman.speed * dt);
  }

  const frightened = now < s.pacman.poweredUntil;

  // Ghosts
  for (const g of s.ghosts) {
    if (now < g.respawnUntil) continue;

    if (g.moveProgress >= 1) {
      g.pos = { ...g.targetPos };
      g.moveProgress = 0;
      const target = randomStep(s.grid, g.pos, g.dir);
      g.targetPos = target;
      if (!samePos(target, g.pos)) g.dir = directionFromTo(g.pos, target);
    } else {
      g.moveProgress = Math.min(1, g.moveProgress + g.speed * dt);
    }

    // Collision check (continuous)
    const gReal = {
      x: g.pos.x + (g.targetPos.x - g.pos.x) * g.moveProgress,
      y: g.pos.y + (g.targetPos.y - g.pos.y) * g.moveProgress,
    };
    const pReal = {
      x: s.pacman.pos.x + (s.pacman.targetPos.x - s.pacman.pos.x) * s.pacman.moveProgress,
      y: s.pacman.pos.y + (s.pacman.targetPos.y - s.pacman.pos.y) * s.pacman.moveProgress,
    };
    if (Math.abs(gReal.x - pReal.x) < 0.5 && Math.abs(gReal.y - pReal.y) < 0.5) {
      if (frightened) {
        // Eat ghost
        g.pos = { ...g.home };
        g.targetPos = { ...g.home };
        g.moveProgress = 0;
        g.dir = 'left';
        g.respawnUntil = now + GHOST_RESPAWN_DELAY_MS;
        s.score += 200;
      } else {
        // Pacman hit
        s.pacman.lives -= 1;
        if (s.pacman.lives <= 0) {
          s.running = false;
          s.lost = true; // triggers callback in loop
        } else {
          respawn(s);
        }
        break;
      }
    }
  }

  if (s.pacman.dir === 'left' || s.pacman.dir === 'right') s.pacman.facing = s.pacman.dir;
}

function respawn(s: GameState) {
  const { pacmanSpawn, ghostSpawns } = parseLevel();
  s.pacman.pos = { ...pacmanSpawn };
  s.pacman.targetPos = { ...pacmanSpawn };
  s.pacman.moveProgress = 0;
  s.pacman.dir = 'none';
  s.pacman.pendingDir = 'none';
  s.pacman.poweredUntil = 0;
  s.pacman.facing = 'right';
  s.ghosts.forEach((g, i) => {
    g.pos = { ...ghostSpawns[i % ghostSpawns.length] };
    g.targetPos = { ...ghostSpawns[i % ghostSpawns.length] };
    g.moveProgress = 0;
    g.dir = 'left';
    g.respawnUntil = 0;
  });
}

function directionFromTo(a: Pos, b: Pos): Direction {
  if (b.x > a.x) return 'right';
  if (b.x < a.x) return 'left';
  if (b.y > a.y) return 'down';
  if (b.y < a.y) return 'up';
  return 'none';
}
