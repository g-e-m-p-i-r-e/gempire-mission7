// File: `src/app/game/invaders/UserShipClass.js`
import * as THREE from "three";
import { Howl } from "howler";
import Ship                                                                      from "./ShipClass";
import {
  createFrames,
  preloadAnimationFramesExact,
  preloadAnimationFramesExactSpaced,
  preloadAnimationFramesSync
} from "./helpers/createFrames";

const animationsConfig = {
  columns: 3,
  rows: 1,
  frameWidthPx: 284,     // реальная ширина одного кадра
  frameHeightPx: 300,    // реальная высота кадра
  spacingX: -1,          // горизонтальный зазор между кадрами (ВАШИ 32px)
  spacingY: 0,
  marginX: 0,            // если есть отступ слева
  marginY: 0,            // если есть отступ сверху
  frames: {
    idle: [0],
    move: [1],
    fire: [2],
  },
};

const playUserShotEnemySound = () => {
  const sound = new Howl({
    src: ["/invaders/sounds/gameSounds/playerShot.mp3"],
    autoplay: false,
    volume: 0.2,
    loop: false,
  });
  sound.play();
};

class UserShip extends Ship {
  constructor(scene, camera, config, texture, bulletTexture, shineTexture) {
    const animationTextures = preloadAnimationFramesExactSpaced(texture, animationsConfig);
    super(scene, config, texture, bulletTexture, shineTexture, animationTextures);
    this.camera = camera;
    this.isDragging = false;
    this.lastShootTime = 0;
    this.fireUntil = 0;
    this.isSoundOn = localStorage.getItem("isSoundOn");

    // Правильный расчёт позиции внутри видимой области камеры
    const camBottom = this.camera.bottom;              // отрицательное число
    const padding = 20;
    const spawnY = camBottom + this.config.size.height / 2 + padding;
    this.mesh.position.set(0, spawnY, 0);
    this.mesh.rotation.z = 0;
    this.currentAnimation = this.animationTextures.idle;
    this.input = { left: false, right: false };
  }
  move(x) {
    // Используем границы камеры вместо window.*
    const halfWidth = (this.camera.right - this.camera.left) / 2;
    x = Math.max(-halfWidth + 120, Math.min(halfWidth - 120, x));
    const deltaX = x - this.mesh.position.x;
    this.mesh.position.x += deltaX * this.config.speedX;
    this.camera.position.x = this.mesh.position.x * 0.1;
    if (Math.abs(deltaX) > 0.1 && performance.now() > this.fireUntil) {
      this.currentAnimation = this.animationTextures.move;
    }
  }

  updateMovement(deltaTime) {
    const dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    if (dir !== 0) {
      const speedPxPerSec = 600; // скорость
      const targetX = this.mesh.position.x + dir * speedPxPerSec * deltaTime;
      this.move(targetX);
    }
  }

  update(deltaTime) {
    this.updateMovement(deltaTime);
    super.update(deltaTime);
    const now = performance.now();
    if (now - this.lastShootTime >= this.config.shootInterval) {
      if (this.isSoundOn !== "false") playUserShotEnemySound();
      this.shoot(new THREE.Vector3(0, 1, 0));
      this.lastShootTime = now;
      this.fireUntil = now + 120;
      this.currentAnimation = this.animationTextures.fire;
    } else if (now > this.fireUntil && this.currentAnimation !== this.animationTextures.move) {
      this.currentAnimation = this.animationTextures.idle;
    }
  }

  onTouchStart(event) {
    const touch = event.touches[0];
    const xNdc = (touch.clientX / window.innerWidth) * 2 - 1;
    const yNdc = -(touch.clientY / window.innerHeight) * 2 + 1;
    const touchX = ((xNdc + 1) / 2) * window.innerWidth;
    const touchY = ((-yNdc + 1) / 2) * window.innerHeight;

    const shipScreenPosition = this.toScreenPosition(this.mesh, this.camera);
    const shipWidth = this.config.size.width;
    const shipHeight = this.config.size.height;

    const expandedZone = {
      left: shipScreenPosition.x - shipWidth / 2 - 60,
      right: shipScreenPosition.x + shipWidth / 2 + 60,
      top: shipScreenPosition.y - shipHeight / 2,
      bottom: shipScreenPosition.y + shipHeight / 2,
    };

    if (
      touchX >= expandedZone.left &&
      touchX <= expandedZone.right &&
      touchY >= expandedZone.top &&
      touchY <= expandedZone.bottom
    ) {
      this.isDragging = true;
    }
  }

  toScreenPosition(obj, camera) {
    const vector = new THREE.Vector3();
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);
    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;
    vector.x = vector.x * widthHalf + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;
    return { x: vector.x, y: vector.y };
  }

  onTouchMove(event) {
    if (!this.isDragging) return;
    const touch = event.touches[0];
    const xNdc = (touch.clientX / window.innerWidth) * 2 - 1;
    this.move(xNdc * (window.innerWidth / 2));
  }

  onTouchEnd() {
    this.isDragging = false;
  }

  setKey(side, pressed) {
    if (side === "left") this.input.left = pressed;
    if (side === "right") this.input.right = pressed;
  }
}

export default UserShip;