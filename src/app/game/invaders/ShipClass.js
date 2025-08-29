import * as THREE from "three";
import Bullet from "./BulletClass";

class Ship {
	constructor(scene, config, textures, bulletTexture, shineTexture, animationTextures) {
		this.scene = scene;
		this.config = config;
		this.hp = config.hp;
		this.bullets = [];
		this.targetPosition = null;
		this.bulletTexture = bulletTexture;
		this.shineTexture = shineTexture;

		const initialTexture = animationTextures.moveLeft ? animationTextures.moveLeft[0] : animationTextures.idle[0];
		const material = new THREE.MeshBasicMaterial({ map: initialTexture, transparent: true });
		const geometry = new THREE.PlaneGeometry(config.size.width, config.size.height);
		this.mesh = new THREE.Mesh(geometry, material);

		this.currentAnimation = animationTextures.moveLeft || [];

		this.currentFrame = 0;
		this.frameDelay = 200;
		this.lastFrameChangeTime = Date.now();
		this.isDestroyed = false;
		this.isBulletsExist = false;

		this.scene.add(this.mesh);

		if (this.shineTexture) {
			this.createShineMesh();
		}

		// Create hitbox visualization
		// this.hitboxLine = this.createHitboxLine();
		// this.scene.add(this.hitboxLine);

		this.animationTextures = animationTextures;
	}

	createShineMesh() {
		const shineMaterial = new THREE.MeshBasicMaterial({ map: this.shineTexture, transparent: true });
		const shineGeometry = new THREE.PlaneGeometry(this.config.shineSize.width, this.config.shineSize.height);
		this.shineMesh = new THREE.Mesh(shineGeometry, shineMaterial);
		this.shineMesh.position.set(0, 0, -1);
		this.mesh.add(this.shineMesh);
	}

	createHitboxLine() {
		const hitbox = this.getHitbox();
		let geometry;

		if (hitbox.type === "rectangle") {
			const vertices = [new THREE.Vector3(-hitbox.width / 2, -hitbox.height / 2, 0), new THREE.Vector3(hitbox.width / 2, -hitbox.height / 2, 0), new THREE.Vector3(hitbox.width / 2, hitbox.height / 2, 0), new THREE.Vector3(-hitbox.width / 2, hitbox.height / 2, 0), new THREE.Vector3(-hitbox.width / 2, -hitbox.height / 2, 0)];
			geometry = new THREE.BufferGeometry().setFromPoints(vertices);
		} else if (hitbox.type === "circle") {
			const segments = 32;
			const vertices = [];
			for (let i = 0; i <= segments; i++) {
				const theta = (i / segments) * Math.PI * 2;
				vertices.push(new THREE.Vector3(hitbox.radius * Math.cos(theta), hitbox.radius * Math.sin(theta), 0));
			}
			geometry = new THREE.BufferGeometry().setFromPoints(vertices);
		} else if (hitbox.type === "oval") {
			const segments = 32;
			const vertices = [];
			for (let i = 0; i <= segments; i++) {
				const theta = (i / segments) * Math.PI * 2;
				vertices.push(new THREE.Vector3((hitbox.width / 2) * Math.cos(theta), (hitbox.height / 2) * Math.sin(theta), 0));
			}
			geometry = new THREE.BufferGeometry().setFromPoints(vertices);
		}

		const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
		const line = new THREE.Line(geometry, material);
		line.position.copy(this.mesh.position);
		return line;
	}

	updateHitboxLine() {
		const hitbox = this.getHitbox();
		let vertices;

		if (hitbox.type === "rectangle") {
			vertices = [new THREE.Vector3(-hitbox.width / 2, -hitbox.height / 2, 0), new THREE.Vector3(hitbox.width / 2, -hitbox.height / 2, 0), new THREE.Vector3(hitbox.width / 2, hitbox.height / 2, 0), new THREE.Vector3(-hitbox.width / 2, hitbox.height / 2, 0), new THREE.Vector3(-hitbox.width / 2, -hitbox.height / 2, 0)];
		} else if (hitbox.type === "circle") {
			const segments = 32;
			vertices = [];
			for (let i = 0; i <= segments; i++) {
				const theta = (i / segments) * Math.PI * 2;
				vertices.push(new THREE.Vector3(hitbox.radius * Math.cos(theta), hitbox.radius * Math.sin(theta), 0));
			}
		} else if (hitbox.type === "oval") {
			const segments = 32;
			vertices = [];
			for (let i = 0; i <= segments; i++) {
				const theta = (i / segments) * Math.PI * 2;
				vertices.push(new THREE.Vector3((hitbox.width / 2) * Math.cos(theta), (hitbox.height / 2) * Math.sin(theta), 0));
			}
		}

		// HITBOX vizualization
		this.hitboxLine.geometry.setFromPoints(vertices);
		this.hitboxLine.position.copy(this.mesh.position);
	}

	updateAnimation() {
		const now = Date.now();
		if (now - this.lastFrameChangeTime > this.frameDelay) {
			if (!this.currentAnimation || this.currentAnimation.length === 0) {
				return;
			}

			this.currentFrame = (this.currentFrame + 1) % this.currentAnimation.length;
			this.lastFrameChangeTime = now;

			this.mesh.material.map = this.currentAnimation[this.currentFrame];
			this.mesh.material.needsUpdate = true;
		}
	}

	setTargetPosition(targetPosition) {
		this.targetPosition = targetPosition;
	}

	update(deltaTime) {
		if (this.targetPosition) {
			const direction = new THREE.Vector3().subVectors(this.targetPosition, this.mesh.position).normalize();
			let speed = this.config.speedX;
			if (direction.y < 0 || direction.y > 0) {
				speed = this.config.speedY;
			}

			const distance = speed * deltaTime;
			const newPosition = this.mesh.position.clone().add(direction.multiplyScalar(distance));

			if (newPosition.distanceTo(this.targetPosition) < distance) {
				this.mesh.position.copy(this.targetPosition);
				this.targetPosition = null;
			} else {
				this.mesh.position.copy(newPosition);
			}

			if (!this.isDestroyed) {
				if (direction.x < 0) {
					this.currentAnimation = this.animationTextures.moveLeft || [];
				} else if (direction.x > 0) {
					this.currentAnimation = this.animationTextures.moveRight || [];
				} else if (direction.y < 0) {
					this.currentAnimation = this.animationTextures.moveDown || [];
				}
			}
		}

		this.updateAnimation();
		this.updateBullets(deltaTime);

		// HITBOX
		// this.updateHitboxLine(); // Update hitbox visualization
	}

	despawn() {
		this.scene.remove(this.mesh);
		// this.bullets.forEach((bullet) => bullet.despawn());
		// this.bullets = [];

		// HITBOX
		// this.scene.remove(this.hitboxLine); // Remove hitbox visualization
	}

	shoot(direction) {
		const bulletPosition = this.mesh.position.clone();
		const bullet = new Bullet(this.scene, bulletPosition, direction, this.config.bulletSpeed, this.bulletTexture, this);
		this.isBulletsExist = true;
		this.bullets.push(bullet);
	}

// ShipClass.js (optional: extend bullet despawn lower bound)
  updateBullets(deltaTime) {
    this.bullets.forEach(b => b.update(deltaTime));
    const offTop = window.innerHeight / 2;
    const offBottom = -window.innerHeight / 2 - 400; // extended to match new enemy travel
    this.bullets = this.bullets.filter(b => {
      if (b.mesh.position.y > offTop || b.mesh.position.y < offBottom) {
        b.despawn();
        return false;
      }
      return true;
    });
    this.isBulletsExist = this.bullets.length > 0;
  }

	destroyShip() {
		this.isDestroyed = true;
		this.currentAnimation = this.animationTextures.explosion || [];
		this.currentFrame = 0;
		this.lastFrameChangeTime = Date.now();
		const isVibrationOn = localStorage.getItem("isVibrationOn");
		if (isVibrationOn !== "false") {

		}
	}

	isExplosionAnimationComplete() {
		return this.isDestroyed && this.currentFrame === this.animationTextures.explosion.length - 1;
	}

	hitByBullet() {
		if (this.isDestroyed) {
			return;
		}
		this.destroyShip();
	}

	getHitbox() {
		const { type, width, height } = this.config.hitbox;
		const position = this.mesh.position;
		const hitbox = { type, position, width, height };

		if (type === "circle") {
			hitbox.radius = width / 2; // Assuming width is the diameter for circle
		}

		return hitbox;
	}
}

export default Ship;
