import * as THREE from "three";

export const createFrames = (row, count, rows) => {
	const frames = [];
	const frameWidth = 1 / count;
	const frameHeight = 1 / rows;

	for (let i = 0; i < count; i++) {
		frames.push({ x: i * frameWidth, y: row * frameHeight });
	}

	return frames;
};

export const defaultAnimationsConfig = {
	columns: 8,
	rows: 4,
	frames: {
		explosion: createFrames(0, 8, 4),
		moveLeft: createFrames(1, 8, 4),
		moveRight: createFrames(2, 8, 4),
		moveDown: createFrames(3, 8, 4),
	},
};

// File: 'src/app/game/invaders/helpers/createFrames.js'
// ADD this new exact loader (leave existing exports untouched)
export const preloadAnimationFramesExact = (texture, config) => {
  const animationTextures = {};
  const framesConfig = config;
  for (const [key, frames] of Object.entries(framesConfig.frames)) {
    animationTextures[key] = frames.map(frame => {
      const atlasWidth = texture.image.width;
      const atlasHeight = texture.image.height;
      const frameWidth = atlasWidth / framesConfig.columns;
      const frameHeight = atlasHeight / framesConfig.rows;

      // Use real frame pixel size (or clamp if too huge)
      const MAX_DIM = 1024; // safety cap; adjust if needed
      const scale = Math.min(1, MAX_DIM / Math.max(frameWidth, frameHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(frameWidth * scale);
      canvas.height = Math.round(frameHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        texture.image,
        frame.x * atlasWidth,
        frame.y * atlasHeight,
        frameWidth,
        frameHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const frameTexture = new THREE.CanvasTexture(canvas);
      frameTexture.minFilter = THREE.NearestFilter;
      frameTexture.magFilter = THREE.NearestFilter;
      frameTexture.needsUpdate = true;
      return frameTexture;
    });
  }
  return animationTextures;
};

export const preloadAnimationFramesSync = (texture, config) => {
	const animationTextures = {};
	const framesConfig = config || defaultAnimationsConfig;

	for (const [key, frames] of Object.entries(framesConfig.frames)) {
		animationTextures[key] = frames.map((frame) => {
			const canvas = document.createElement("canvas");
			canvas.width = 64;
			canvas.height = 64;
			const ctx = canvas.getContext("2d");
			const atlasWidth = texture.image.width;
			const atlasHeight = texture.image.height;
			const frameWidth = atlasWidth / framesConfig.columns;
			const frameHeight = atlasHeight / framesConfig.rows;

			ctx.drawImage(texture.image, frame.x * atlasWidth, frame.y * atlasHeight, frameWidth, frameHeight, 0, 0, canvas.width, canvas.height);

			const frameTexture = new THREE.CanvasTexture(canvas);
			frameTexture.minFilter = THREE.NearestFilter;
			frameTexture.magFilter = THREE.NearestFilter;
			return frameTexture;
		});
	}

	return animationTextures;
};

export const preloadAnimationFrames = (texture, config) => {
	const animationTextures = {};
	const framesConfig = config || defaultAnimationsConfig;

	for (const [key, frames] of Object.entries(framesConfig.frames)) {
		animationTextures[key] = [];

		for (const frame of frames) {
			const frameTexture = new THREE.Texture(texture.image);
			frameTexture.repeat.set(1 / framesConfig.columns, 1 / framesConfig.rows);
			frameTexture.offset.set(frame.x, 1 - frame.y - frameTexture.repeat.y);
			frameTexture.minFilter = THREE.NearestFilter;
			frameTexture.magFilter = THREE.NearestFilter;
			frameTexture.needsUpdate = true;

			animationTextures[key].push(frameTexture);
		}
	}

	return animationTextures;
};

export const buildFrameRects = (config) => {
  const {
    columns,
    rows,
    frameWidthPx,
    frameHeightPx,
    spacingX = 0,
    spacingY = 0,
    marginX = 0,
    marginY = 0,
  } = config;

  const rects = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const xPx = marginX + col * (frameWidthPx + spacingX);
      const yPx = marginY + row * (frameHeightPx + spacingY);
      rects.push({ xPx, yPx, widthPx: frameWidthPx, heightPx: frameHeightPx });
    }
  }
  return rects;
};

// Loader that extracts real pixels (canvas copy) with spacing support
export const preloadAnimationFramesExactSpaced = (texture, config) => {
  const {
    frames,              // e.g. { idle:[0], move:[1], fire:[2] }
    columns,
    rows,
    frameWidthPx,
    frameHeightPx,
    spacingX = 0,
    spacingY = 0,
    marginX = 0,
    marginY = 0,
    MAX_DIM = 2048       // safety cap
  } = config;

  const atlasWidth = texture.image.width;
  const atlasHeight = texture.image.height;

  const rects = buildFrameRects({ columns, rows, frameWidthPx, frameHeightPx, spacingX, spacingY, marginX, marginY });
  const animationTextures = {};

  for (const [key, indices] of Object.entries(frames)) {
    animationTextures[key] = indices.map(index => {
      const r = rects[index];
      const scale = Math.min(1, MAX_DIM / Math.max(r.widthPx, r.heightPx));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(r.widthPx * scale);
      canvas.height = Math.round(r.heightPx * scale);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        texture.image,
        r.xPx, r.yPx, r.widthPx, r.heightPx,
        0, 0, canvas.width, canvas.height
      );

      const frameTex = new THREE.CanvasTexture(canvas);
      frameTex.minFilter = THREE.NearestFilter;
      frameTex.magFilter = THREE.NearestFilter;
      frameTex.needsUpdate = true;
      return frameTex;
    });
  }
  return animationTextures;
};

// UV‑based loader (no pixel copy) that supports spacing
export const preloadAnimationFramesUVSpaced = (texture, config) => {
  const {
    frames,
    columns,
    rows,
    frameWidthPx,
    frameHeightPx,
    spacingX = 0,
    spacingY = 0,
    marginX = 0,
    marginY = 0,
  } = config;

  const atlasWidth = texture.image.width;
  const atlasHeight = texture.image.height;
  const rects = buildFrameRects({ columns, rows, frameWidthPx, frameHeightPx, spacingX, spacingY, marginX, marginY });
  const animationTextures = {};

  for (const [key, indices] of Object.entries(frames)) {
    animationTextures[key] = indices.map(index => {
      const r = rects[index];
      const repeatX = r.widthPx / atlasWidth;
      const repeatY = r.heightPx / atlasHeight;
      const offsetX = r.xPx / atlasWidth;
      // THREE uses bottom-left origin for UV; yPx is from top, so invert:
      const offsetY = 1 - (r.yPx + r.heightPx) / atlasHeight;

      const frameTex = new THREE.Texture(texture.image);
      frameTex.repeat.set(repeatX, repeatY);
      frameTex.offset.set(offsetX, offsetY);
      frameTex.minFilter = THREE.NearestFilter;
      frameTex.magFilter = THREE.NearestFilter;
      frameTex.needsUpdate = true;
      return frameTex;
    });
  }
  return animationTextures;
};