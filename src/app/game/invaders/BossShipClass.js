import * as THREE from "three";
import EnemyShip from "./EnemyShipClass";

class BossShip extends EnemyShip {
	constructor(scene, config, texture, bulletTexture, shineTexture, animationTextures) {
		super(scene, config, texture, bulletTexture, shineTexture, animationTextures);
		this.specialAbilityCooldown = config.specialAbilityCooldown || 5000;
		this.lastSpecialAbilityTime = Date.now();
	}

	update(deltaTime) {
		super.update(deltaTime);
		const currentTime = Date.now();
		if (currentTime - this.lastSpecialAbilityTime > this.specialAbilityCooldown) {
			this.useSpecialAbility();
			this.lastSpecialAbilityTime = currentTime;
		}
	}

	useSpecialAbility() {
		for (let i = 0; i < 5; i++) {
			this.shoot(new THREE.Vector3(Math.sin((i * Math.PI) / 2.5), -1, 0));
		}
	}
}

export default BossShip;
