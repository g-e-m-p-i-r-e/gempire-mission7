// javascript
import * as THREE from "three";
import Ship from "./ShipClass";

class EnemyShip extends Ship {
  constructor(scene, config, texture, bulletTexture, shineTexture, animationTextures) {
    super(scene, config, texture, bulletTexture, shineTexture, animationTextures);
    this.isEnemy = true;
    // Rotate 90° clockwise to face left
    /*this.mesh.rotation.z = -Math.PI / 2;
    this.mesh.position.set(window.innerWidth / 2 + 150, 0, 0);*/
  }

  setTargetPosition(targetPosition) {
    this.targetPosition = targetPosition.clone();
  }

// EnemyShipClass.js
  static calculateNextTarget(enemyShips, movePattern, currentMoveIndex) {
    const baseDownStep = 90;
    const verticalStep = 55;
    const jitterAmplitudeX = 40;

    const topMargin = 120;                 // keep existing top margin
    const extraBottomSpace = 260;          // how far below player enemies may travel
    const maxY = window.innerHeight / 2 - topMargin;
    const minY = -window.innerHeight / 2 - extraBottomSpace; // allow well below player

    const maxX = window.innerWidth / 2 - 120;
    const minX = -maxX;
    const directive = movePattern[currentMoveIndex];

    return enemyShips.map(ship => {
      const target = ship.mesh.position.clone();

      // Primary downward advance
      target.y -= baseDownStep;

      // Pattern modulation (still bounded by new min/max later)
      if (directive === "toTop") {
        target.y += verticalStep;
      } else if (directive === "toBot") {
        target.y -= verticalStep;
      }

      // Horizontal jitter
      const jitterX = (Math.random() - 0.5) * jitterAmplitudeX;
      target.x = Math.min(Math.max(target.x + jitterX, minX), maxX);

      // Clamp with new extended bottom
      target.y = Math.max(Math.min(target.y, maxY), minY);
      return target;
    });
  }
}

export default EnemyShip;