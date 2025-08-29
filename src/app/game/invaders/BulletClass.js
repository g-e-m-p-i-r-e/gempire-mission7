// File: `src/app/game/invaders/BulletClass.js`
import * as THREE from "three";
import { createFrames } from "@/app/game/invaders/helpers/createFrames";

class Bullet {
  constructor(scene, position, direction, speed, texture, owner) {
    this.scene = scene;
    this.speed = speed;
    this.direction = direction.clone().normalize();
    this.owner = owner;

    // Canvas target (kept the same size)
    this.canvas = document.createElement("canvas");
    this.canvas.width = 256;
    this.canvas.height = 256;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    this.canvasTexture = new THREE.CanvasTexture(this.canvas);
    this.canvasTexture.minFilter = THREE.NearestFilter;
    this.canvasTexture.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshBasicMaterial({ map: this.canvasTexture, transparent: true });
    const geometry = new THREE.PlaneGeometry(20, 30);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);

    this.atlasTexture = texture;
    this.atlasTexture.wrapS = THREE.RepeatWrapping;
    this.atlasTexture.wrapT = THREE.RepeatWrapping;

    // 4 frames horizontally, 1 row
    this.columns = 4;
    this.atlasTexture.repeat.set(1 / this.columns, 1 / 1);

    this.frames = {
      fly: createFrames(0, this.columns, 1)
    };

    this.currentAnimation = this.frames.fly;
    this.currentFrame = 0;

    this.scene.add(this.mesh);

    this.animationInterval = 100;
    this.lastFrameTime = 0;

    this.updateAnimation(true);
  }

  updateAnimation(forceUpdate = false) {
    if (!this.currentAnimation || !this.atlasTexture.image) return;
    const now = performance.now();
    if (forceUpdate || now - this.lastFrameTime >= this.animationInterval) {
      this.lastFrameTime = now;
      this.currentFrame = (this.currentFrame + 1) % this.currentAnimation.length;
      const frame = this.currentAnimation[this.currentFrame];
      const atlasWidth = this.atlasTexture.image.width;
      const atlasHeight = this.atlasTexture.image.height;
      const frameWidth = atlasWidth / this.columns;
      const frameHeight = atlasHeight; // single row

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(
        this.atlasTexture.image,
        frame.x * atlasWidth,
        frame.y * atlasHeight,
        frameWidth,
        frameHeight,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.canvasTexture.needsUpdate = true;
    }
  }

  update(deltaTime) {
    const distance = this.speed * deltaTime;
    this.mesh.position.add(this.direction.clone().multiplyScalar(distance));
    this.updateAnimation();
  }

  despawn() {
    this.scene.remove(this.mesh);
  }

  checkCollision(target) {
    const bulletBox = new THREE.Box3().setFromObject(this.mesh);
    const targetHitbox = target.getHitbox();
    if (targetHitbox.type === "rectangle") {
      const targetBox = new THREE.Box3(
        new THREE.Vector3(
          targetHitbox.position.x - targetHitbox.width / 2,
          targetHitbox.position.y - targetHitbox.height / 2,
          targetHitbox.position.z
        ),
        new THREE.Vector3(
          targetHitbox.position.x + targetHitbox.width / 2,
          targetHitbox.position.y + targetHitbox.height / 2,
          targetHitbox.position.z
        )
      );
      return bulletBox.intersectsBox(targetBox);
    } else if (targetHitbox.type === "circle") {
      const distance = bulletBox.getCenter(new THREE.Vector3()).distanceTo(targetHitbox.position);
      return distance < targetHitbox.radius;
    } else if (targetHitbox.type === "oval") {
      const bulletCenter = bulletBox.getCenter(new THREE.Vector3());
      const dx = bulletCenter.x - targetHitbox.position.x;
      const dy = bulletCenter.y - targetHitbox.position.y;
      const hwidth = targetHitbox.width / 2;
      const hheight = targetHitbox.height / 2;
      return (dx * dx) / (hwidth * hwidth) + (dy * dy) / (hheight * hheight) <= 1;
    }
    return false;
  }
}

export default Bullet;