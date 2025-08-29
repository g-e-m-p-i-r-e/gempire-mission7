// src/app/game/invaders/helpers/createWaveConfig.js
export const MOVE_PATTERNS_CONFIG = {
  FRONT: {
    movePattern: ["toLeft", "toBot", "toRight", "toRight", "toBot", "toLeft"],
    moveDistanceX: 30,
    moveDistanceY: 60,
    speedX: 20,
    speedY: 50,
  },
  BACK: {
    movePattern: ["toLeft", "toBot", "toRight", "toRight", "toBot", "toLeft"],
    moveDistanceX: 30,
    moveDistanceY: 30,
    speedX: 20,
    speedY: 20,
  },
};

export const WAVE_MULTIPLIER_CONFIG = {
  speedIncrease: 10,
  shootIntervalDecrease: 200,
  bulletSpeedIncrease: 200,
};

export const ENEMIES_CONFIG = {
  A: {
    hitbox: { type: "rectangle", width: 70, height: 22 },
    size: { width: 100, height: 60 },
    shootInterval: 2000,
    bulletSpeed: 500,
    hp: 1,
    texture: "/invaders/gameAtlases/enemyAClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyAClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyAClass.png",
    shineSize: { width: 120, height: 80 },
    SWC: 5,
  },
  B: {
    hitbox: { type: "rectangle", width: 70, height: 22 },
    size: { width: 100, height: 60 },
    shootInterval: 2000,
    bulletSpeed: 500,
    hp: 1,
    texture: "/invaders/gameAtlases/enemyBClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyBClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyBClass.png",
    shineSize: { width: 120, height: 80 },
    SWC: 5,
  },
  C: {
    hitbox: { type: "rectangle", width: 70, height: 22 },
    size: { width: 100, height: 60 },
    shootInterval: 2000,
    bulletSpeed: 500,
    hp: 2,
    texture: "/invaders/gameAtlases/enemyCClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyCClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyCClass.png",
    shineSize: { width: 120, height: 80 },
    SWC: 15,
  },
  D: {
    hitbox: { type: "rectangle", width: 70, height: 50 },
    size: { width: 100, height: 120 },
    shootInterval: 2000,
    bulletSpeed: 500,
    hp: 3,
    texture: "/invaders/gameAtlases/enemyDClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyDClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyDClass.png",
    shineSize: { width: 120, height: 140 },
    SWC: 15,
  },
  E: {
    hitbox: { type: "rectangle", width: 70, height: 22 },
    size: { width: 100, height: 60 },
    shootInterval: 2000,
    bulletSpeed: 500,
    hp: 3,
    texture: "/invaders/gameAtlases/enemyEClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyEClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyEClass.png",
    shineSize: { width: 120, height: 80 },
    SWC: 15,
  },
  F: {
    hitbox: { type: "rectangle", width: 75, height: 20 },
    size: { width: 100, height: 60 },
    shootInterval: 1800,
    bulletSpeed: 600,
    hp: 2,
    texture: "/invaders/gameAtlases/enemyFClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyFClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyFClass.png",
    shineSize: { width: 120, height: 80 },
    SWC: 15,
  },
  G: {
    hitbox: { type: "rectangle", width: 75, height: 20 },
    size: { width: 100, height: 60 },
    shootInterval: 1800,
    bulletSpeed: 600,
    hp: 4,
    texture: "/invaders/gameAtlases/enemyGClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyGClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyGClass.png",
    shineSize: { width: 120, height: 80 },
    SWC: 15,
  },
  H: {
    hitbox: { type: "oval", width: 50, height: 70 },
    size: { width: 100, height: 100 },
    shootInterval: 2000,
    bulletSpeed: 500,
    hp: 5,
    texture: "/invaders/gameAtlases/enemyHClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyHClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyHClass.png",
    shineSize: { width: 120, height: 120 },
    SWC: 15,
  },
  I: {
    hitbox: { type: "rectangle", width: 70, height: 20 },
    size: { width: 75, height: 55 },
    shootInterval: 1600,
    bulletSpeed: 700,
    hp: 6,
    texture: "/invaders/gameAtlases/enemyIClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyIClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyIClass.png",
    shineSize: { width: 95, height: 75 },
    SWC: 35,
  },
  J: {
    hitbox: { type: "oval", width: 50, height: 100 },
    size: { width: 100, height: 100 },
    shootInterval: 2000,
    bulletSpeed: 500,
    hp: 8,
    texture: "/invaders/gameAtlases/enemyJClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyJClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyJClass.png",
    shineSize: { width: 120, height: 120 },
    SWC: 35,
  },
  K: {
    hitbox: { type: "oval", width: 80, height: 100 },
    size: { width: 140, height: 140 },
    shootInterval: 1000,
    bulletSpeed: 700,
    hp: 20,
    isBoss: true,
    texture: "/invaders/gameAtlases/enemyKClass.png",
    bulletTexture: "/invaders/gameAtlases/enemyKClassBullet.png",
    shineTexture: "/invaders/gameAtlases/shine/enemyKClass.png",
    shineSize: { width: 160, height: 160 },
    SWC: 100,
  },
};

export const shuffleArray = (array) => {
  const lastElement = array.pop();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  array.push(lastElement);
  return array;
};

export const createWaveConfig = (waveConfig, { shuffle = false } = {}) => {
  const nonBoss = waveConfig.slice(0, -1);
  const baseWaves = shuffle ? shuffleArray([...nonBoss]) : [...nonBoss];
  const bossWave = waveConfig[waveConfig.length - 1];

  const waves = [];
  for (let x = 0; x < baseWaves.length + 10; x++) {
    let wave;
    if ((x + 1) % 10 === 0) {
      wave = bossWave;
    } else {
      wave = baseWaves[(x - Math.floor(x / 10)) % baseWaves.length];
    }

    const multiplier = Math.floor(x / 10);

    waves.push({
      enemies: wave.enemies.map((enemy) => {
        const preparedEnemy = {
          count: enemy.count,
          powerMultiplier: multiplier,
          config: {
            ...ENEMIES_CONFIG[enemy.type.toUpperCase()],
            ...MOVE_PATTERNS_CONFIG[enemy.position.toUpperCase()],
          },
        };

        if (multiplier > 0) {
          preparedEnemy.config.shootInterval = Math.max(
            preparedEnemy.config.shootInterval -
            WAVE_MULTIPLIER_CONFIG.shootIntervalDecrease * multiplier,
            100
          );
          preparedEnemy.config.bulletSpeed +=
            WAVE_MULTIPLIER_CONFIG.bulletSpeedIncrease * multiplier;
          preparedEnemy.config.speedX +=
            WAVE_MULTIPLIER_CONFIG.speedIncrease * multiplier;
          preparedEnemy.config.speedY +=
            WAVE_MULTIPLIER_CONFIG.speedIncrease * multiplier;
        }

        return preparedEnemy;
      }),
    });
  }

  return waves;
};