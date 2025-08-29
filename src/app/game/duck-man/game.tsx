'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGameEngine } from '@/app/game/duck-man/core/engine';
import { Tile } from '@/app/game/duck-man/core/types';

let duckSprite1: HTMLImageElement | null = null;
let duckSprite2: HTMLImageElement | null = null;
let duckSprite3: HTMLImageElement | null = null;
let spritesLoaded = false;

let backgroundImage: HTMLImageElement | null = null;
let backgroundLoaded = false;

let boostImage: HTMLImageElement | null = null;
let boostLoaded = false;

let healImage: HTMLImageElement | null = null;
let healLoaded = false;

const GHOST_COUNT = 4;
const GHOST_FRAME_COUNT = 2;

let ghostSprites: HTMLImageElement[][] = [];
let ghostSpritesLoaded: boolean[] = [];
let allGhostSpritesLoaded = false;

if (typeof window !== 'undefined') {
  loadImages();
}

function loadImages() {
  if (!spritesLoaded) {
    duckSprite1 = new Image();
    duckSprite1.src = '/duck-man/player/bird1.svg';
    duckSprite2 = new Image();
    duckSprite2.src = '/duck-man/player/bird2.svg';
    duckSprite3 = new Image();
    duckSprite3.src = '/duck-man/player/bird3.svg';
    Promise.all([
      new Promise((r) => (duckSprite1!.onload = r)),
      new Promise((r) => (duckSprite2!.onload = r)),
      new Promise((r) => (duckSprite3!.onload = r)),
    ]).then(() => {
      spritesLoaded = true;
    });
  }
  if (!backgroundLoaded) {
    backgroundImage = new Image();
    backgroundImage.src = '/duck-man/background.png';
    backgroundImage.onload = () => {
      backgroundLoaded = true;
    };
  }
  if (!boostLoaded) {
    boostImage = new Image();
    boostImage.src = '/duck-man/boost/killer.svg';
    boostImage.onload = () => {
      boostLoaded = true;
    };
  }
  if (!healLoaded) {
    healImage = new Image();
    healImage.src = '/duck-man/boost/heal.svg';
    healImage.onload = () => {
      healLoaded = true;
    };
  }
  if (ghostSprites.length === 0) {
    ghostSprites = Array.from({ length: GHOST_COUNT }, () => Array<HTMLImageElement>(GHOST_FRAME_COUNT));
    ghostSpritesLoaded = Array(GHOST_COUNT).fill(false);
    const promises: Promise<void>[] = [];
    for (let gi = 0; gi < GHOST_COUNT; gi++) {
      for (let fi = 0; fi < GHOST_FRAME_COUNT; fi++) {
        const img = new Image();
        img.src = `/duck-man/ghosts/${gi + 1}-${fi + 1}.svg`;
        ghostSprites[gi][fi] = img;
        promises.push(
          new Promise((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          }),
        );
      }
    }
    Promise.all(promises).then(() => {
      ghostSpritesLoaded = ghostSprites.map((fr) => fr.every((im) => im.complete));
      allGhostSpritesLoaded = ghostSpritesLoaded.every((v) => v);
    });
  }
}
export interface GamePageProps {
  postEndGame: (score: number, isWin: boolean) => void;
}

export default function GamePage({ postEndGame }: GamePageProps) {
  const state = useGameEngine({ postEndGame });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setContainerSize({ w: Math.floor(cr.width), h: Math.floor(cr.height) });
    });
    ro.observe(el);
    setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const canvasW = containerSize.w;
  const canvasH = containerSize.h;
  const tileW = canvasW / state.width;
  const tileH = canvasH / state.height;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasW === 0 || canvasH === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);
    const ctx = canvas.getContext('2d')!;
    ctx.reset?.();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    draw(ctx, state.grid, state.width, state.height, tileW, tileH);

    const pacPos = {
      x: state.pacman.pos.x + (state.pacman.targetPos.x - state.pacman.pos.x) * state.pacman.moveProgress,
      y: state.pacman.pos.y + (state.pacman.targetPos.y - state.pacman.pos.y) * state.pacman.moveProgress,
    };
    drawPac(
      ctx,
      pacPos.x,
      pacPos.y,
      state.pacman.poweredUntil > performance.now(),
      state.pacman.moveProgress,
      state.pacman.dir,
      state.pacman.facing,
      tileW,
      tileH,
    );

    const now = performance.now();
    const frightened = state.pacman.poweredUntil > now;
    const remainingMs = Math.max(0, state.pacman.poweredUntil - now);
    for (const g of state.ghosts) {
      const gPos = {
        x: g.pos.x + (g.targetPos.x - g.pos.x) * g.moveProgress,
        y: g.pos.y + (g.targetPos.y - g.pos.y) * g.moveProgress,
      };
      drawGhost(ctx, g.id, gPos.x, gPos.y, g.dir, tileW, tileH, frightened, remainingMs);
    }
  }, [state, canvasW, canvasH, tileW, tileH]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg,#0a0a0a,#16213e)',
        overflow: 'hidden',
        fontFamily: 'monospace',
        position: 'relative',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
function draw(ctx: CanvasRenderingContext2D, grid: Tile[][], w: number, h: number, tileW: number, tileH: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (backgroundLoaded && backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  const visited = Array.from({ length: h }, () => Array(w).fill(false));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (grid[y][x] === '#' && !visited[y][x]) drawWallGroup(ctx, grid, visited, x, y, w, h, tileW, tileH);

  const now = performance.now();
  const cycleMs = 3200;
  const t = (now % cycleMs) / cycleMs;
  const breath = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
  const scale = 0.88 + breath * 0.18;

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const tile = grid[y][x];
      const px = x * tileW;
      const py = y * tileH;
      if (tile === '.') {
        const r = Math.max(2, Math.floor(Math.min(tileW, tileH) * 0.2));
        ctx.save();
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = r * 2.2;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px + tileW / 2, py + tileH / 2, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (tile === 'B') {
        if (boostLoaded && boostImage) {
          ctx.save();
          const baseSizeW = tileW * 0.9;
          const baseSizeH = tileH * 0.9;
          const glow = 4 + breath * 6;
          ctx.shadowColor = '#ffeb3b';
          ctx.shadowBlur = glow;
          ctx.translate(px + tileW / 2, py + tileH / 2);
          ctx.scale(scale, scale);
          ctx.drawImage(boostImage, -baseSizeW / 2, -baseSizeH / 2, baseSizeW, baseSizeH);
          ctx.restore();
        } else {
          ctx.fillStyle = '#8ef';
          ctx.beginPath();
          ctx.arc(px + tileW / 2, py + tileH / 2, Math.max(3, Math.min(tileW, tileH) * 0.28), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (tile === 'H') {
        if (healLoaded && healImage) {
          const baseW = tileW * 0.9;
          const baseH = tileH * 0.9;
          const sizeW = Math.round(baseW + breath * tileW * 0.05);
          const sizeH = Math.round(baseH + breath * tileH * 0.05);
          const dx = Math.round(px + (tileW - sizeW) / 2);
          const dy = Math.round(py + (tileH - sizeH) / 2);
          ctx.save();
          const cx = dx + sizeW / 2;
          const cy = dy + sizeH / 2;
          const grad = ctx.createRadialGradient(cx, cy, Math.min(sizeW, sizeH) * 0.15, cx, cy, Math.min(sizeW, sizeH) * 0.55);
          grad.addColorStop(0, 'rgba(255,255,255,0.35)');
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.min(sizeW, sizeH) * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(healImage, dx, dy, sizeW, sizeH);
          ctx.restore();
        } else {
          const padX = Math.max(2, Math.floor(tileW * 0.15));
          const padY = Math.max(2, Math.floor(tileH * 0.15));
          ctx.fillStyle = '#7cffb2';
          ctx.fillRect(px + padX, py + padY, tileW - padX * 2, tileH - padY * 2);
        }
      }
    }
}

function drawWallGroup(
  ctx: CanvasRenderingContext2D,
  grid: Tile[][],
  visited: boolean[][],
  startX: number,
  startY: number,
  w: number,
  h: number,
  tileW: number,
  tileH: number,
) {
  const walls: { x: number; y: number }[] = [];
  const queue = [{ x: startX, y: startY }];
  while (queue.length) {
    const { x, y } = queue.shift()!;
    if (x < 0 || x >= w || y < 0 || y >= h || visited[y][x] || grid[y][x] !== '#') continue;
    visited[y][x] = true;
    walls.push({ x, y });
    queue.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
  }
  if (!walls.length) return;

  ctx.fillStyle = '#23003a';
  for (const wall of walls) ctx.fillRect(wall.x * tileW, wall.y * tileH, tileW, tileH);

  ctx.strokeStyle = (() => {
    const xs = walls.map((wl) => wl.x);
    const ys = walls.map((wl) => wl.y);
    const grad = ctx.createLinearGradient(
      Math.min(...xs) * tileW,
      Math.min(...ys) * tileH,
      (Math.max(...xs) + 1) * tileW,
      (Math.max(...ys) + 1) * tileH,
    );
    grad.addColorStop(0, 'rgba(83,161,252,1)');
    grad.addColorStop(0.5, 'rgba(126,116,234,1)');
    grad.addColorStop(1, 'rgba(251,77,238,1)');
    return grad;
  })();
  ctx.lineWidth = Math.max(1, Math.floor(Math.min(tileW, tileH) * 0.18));

  for (const wall of walls) {
    const px = wall.x * tileW;
    const py = wall.y * tileH;
    const has = (dx: number, dy: number) =>
      wall.x + dx >= 0 && wall.x + dx < w && wall.y + dy >= 0 && wall.y + dy < h && grid[wall.y + dy][wall.x + dx] === '#';
    const edges: [boolean, () => void][] = [
      [
        !has(0, -1) && wall.y > 0,
        () => {
          ctx.moveTo(px, py);
          ctx.lineTo(px + tileW, py);
        },
      ],
      [
        !has(0, 1) && wall.y < h - 1,
        () => {
          ctx.moveTo(px, py + tileH);
          ctx.lineTo(px + tileW, py + tileH);
        },
      ],
      [
        !has(-1, 0) && wall.x > 0,
        () => {
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + tileH);
        },
      ],
      [
        !has(1, 0) && wall.x < w - 1,
        () => {
          ctx.moveTo(px + tileW, py);
          ctx.lineTo(px + tileW, py + tileH);
        },
      ],
    ];
    ctx.beginPath();
    let drew = false;
    for (const [cond, drawEdge] of edges) {
      if (cond) {
        drawEdge();
        drew = true;
      }
    }
    if (drew) ctx.stroke();
  }
}

function drawPac(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  powered: boolean,
  _moveProgress: number,
  direction: string,
  facing: 'left' | 'right',
  tileW: number,
  tileH: number,
) {
  const px = x * tileW;
  const py = y * tileH;
  const face = facing || (direction === 'left' ? 'left' : 'right');
  if (spritesLoaded && duckSprite1 && duckSprite2 && duckSprite3) {
    const animationTime = performance.now() / 200;
    const frameIndex = Math.floor(animationTime) % 3;
    const sprite = frameIndex === 0 ? duckSprite1 : frameIndex === 1 ? duckSprite2 : duckSprite3;
    ctx.save();
    if (powered) ctx.filter = 'hue-rotate(180deg) brightness(1.2)';
    if (face === 'left') {
      ctx.translate(px + tileW, py);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, 0, 0, tileW, tileH);
    } else {
      ctx.drawImage(sprite, px, py, tileW, tileH);
    }
    ctx.restore();
  } else {
    const r = Math.min(tileW, tileH) * 0.45;
    ctx.fillStyle = powered ? '#8ef' : '#ffd54a';
    ctx.beginPath();
    ctx.arc(px + tileW / 2, py + tileH / 2, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  id: number,
  x: number,
  y: number,
  dir: string,
  tileW: number,
  tileH: number,
  frightened: boolean,
  remainingMs: number,
) {
  const px = x * tileW;
  const py = y * tileH;

  let alpha = 1;
  if (frightened) {
    const POWER_DURATION_MS = 8000;
    const remainRatio = remainingMs / POWER_DURATION_MS;
    const t = performance.now();
    const interval = remainRatio > 0.3 ? 400 : 140;
    const phaseOn = Math.floor(t / interval) % 2 === 0;
    alpha = phaseOn ? 1 : 0.5;
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  if (allGhostSpritesLoaded && ghostSprites[id]) {
    const frames = ghostSprites[id];
    const animTime = performance.now() / 220;
    const frameIndex = Math.floor(animTime) % frames.length;
    const sprite = frames[frameIndex];
    if (dir === 'left') {
      ctx.translate(px + tileW, py);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, 0, 0, tileW, tileH);
    } else {
      ctx.drawImage(sprite, px, py, tileW, tileH);
    }
  } else {
    ctx.fillStyle = '#ff4d6d';
    ctx.beginPath();
    ctx.arc(px + tileW / 2, py + tileH * 0.55, Math.min(tileW, tileH) * 0.45, Math.PI, 0);
    ctx.lineTo(px + tileW * 0.95, py + tileH * 0.95);
    ctx.lineTo(px + tileW * 0.05, py + tileH * 0.95);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
