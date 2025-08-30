'use client';

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Image from "next/image";
import { Howl } from "howler";
import UserShip from "./UserShipClass";
import EnemyShip from "./EnemyShipClass";
import BossShip from "./BossShipClass";
import { setupParallaxStars } from "./helpers/setupParallaxStars";
import { preloadTextures } from "./helpers/preloadTextures";
import inGameLive from "../../../assets/invaders/inGameLive.svg";
import inGameLiveDeath from "../../../assets/invaders/inGameLiveDeath.svg";
import { preloadAnimationFrames } from "./helpers/createFrames";
import { createWaveConfig } from "./helpers/createWaveConfig";
import { waves } from "./wavesConfig";
import { useAppDispatch }                              from '@/app/store/hooks';
import { addScore, loseLife, resetGameData, setLevel } from '@/app/store/gameSlice';

const userShipConfig = {
  speedX: 1,
  speedY: 1,
  shootInterval: 500,
  bulletSpeed: 300,
  hp: 3,
  size: { width: 95, height: 100 },
  hitbox: { type: "rectangle", width: 150, height: 160 },
  texture: "/invaders/gameAtlases/user_ship_s3.png",
  bulletTexture: "/invaders/gameAtlases/bulletUserAtlas2.png",
  shineTexture: "/invaders/gameAtlases/shine/userShipShine.png",
  shineSize: { width: 300, height: 300 },
  rotation: 0,
  bulletDirection: { x: 0, y: 1 }
};

const playEnemyShotUserSound = () => {
	const sound = new Howl({
		src: ["/invaders/sounds/gameSounds/enemyShot.mp3"],
		autoplay: false,
		volume: 0.2,
		loop: false,
	});
	//sound.play();
};

const getDamage = () => {
	const sound = new Howl({
		src: ["/invaders/sounds/gameSounds/getDamage.mp3"],
		autoplay: false,
		volume: 0.1,
		loop: false,
	});
	//sound.play();
};

const get500Points = () => {
	const sound = new Howl({
		src: ["/invaders/sounds/gameSounds/get1kPoints.mp3"],
		autoplay: false,
		loop: false,
	});
	//sound.play();
};

const readySteadyGo = () => {
	const sound = new Howl({
		src: ["/invaders/sounds/gameSounds/startGame.mp3"],
		autoplay: false,
		loop: false,
	});
	//sound.play();
};
const enemyDead = () => {
	const sound = new Howl({
		src: ["/invaders/sounds/gameSounds/enemyDead.mp3"],
		autoplay: false,
		volume: 0.1,
		loop: false,
	});
	//sound.play();
};

const bossWave = () => {
	const sound = new Howl({
		src: ["/invaders/sounds/gameSounds/bossWave.mp3"],
		autoplay: false,
		loop: false,
	});
	//sound.play();
};

const Game = ({ postEndGame, postAddTicket, setGameResultScore, setIsInGameModalOpen, isGameStarted, setIsGameInitialized }) => {
	const dispatch = useAppDispatch();
	const mountRef = useRef(null);
	const userShipRef = useRef(null);
	const enemyShipsRef = useRef([]);
	const enemyDeadShipsRef = useRef([]);
	const shootIntervalRef = useRef(null);
	const currentMoveIndexRef = useRef(0);
	const targetPositionsRef = useRef([]);
	const currentWaveRef = useRef(0);
	const totalUserPlayedWaveRef = useRef(0);
	const sceneRef = useRef(null);
	const rendererRef = useRef(null);
	const cameraRef = useRef(null);
	const starsRef = useRef({ starsT1: null, starsT2: null });
	const gameStartedRef = useRef(isGameStarted);
	const animationTextures = useRef(null);
	const [isContinueLoading, setIsContinueLoading] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [countWinTickets, setCountWinTickets] = useState(0);

  const [audioInitialized, setAudioInitialized] = useState(false);

	const [score, setScore] = useState(0);
	const scoreRef = useRef(0);
	const scoreRefStack = useRef(0);
	const winTicketsRef = useRef(0);
	const [userHp, setUserHp] = useState(userShipConfig.hp);
  const [userBalance, setUserBalance] = useState(5);
  const [userLives, setUserLives] = useState(5);
  const [useTickets, setUserTickets] = useState(5);
  const [userChatId, setUserChatId] = useState(0);


  const [isSoundOn, setIsSoundOn] = useState(null);
/*	const userBalance = useAppSelector((state) => state.main.user.balance);
	const useTickets = useAppSelector((state) => state.main.user.tickets);
	const userLives = useAppSelector((state) => state.main.user.lives);
	const userChatId = useAppSelector((state) => state.main.user.chatId);*/

  const onTouchStart = (event) => {
    initializeAudio(); // Add this line
    if (userShipRef.current && enemyShipsRef.current.length > 0) {
      userShipRef.current.onTouchStart(event);
    }
  };

  const onMouseClick = () => {
    initializeAudio();
  };

  useEffect(() => {
    setIsSoundOn(localStorage.getItem("isSoundOn"));
  }, []);

  const createGamePlayMusic = () => new Howl({
    src: ["/invaders/sounds/gameSounds/gamePlay.mp3"],
    autoplay: false,
    loop: true,
  });

  const createGameOverSound = () => new Howl({
    src: ["/invaders/sounds/gameSounds/gameOver.mp3"],
    autoplay: false,
    loop: false,
  });

  const gamePlayMusicRef = useRef(null);
  const gameOverRef = useRef(null);

  const initializeAudio = () => {
    if (!audioInitialized) {
      gamePlayMusicRef.current = createGamePlayMusic();
      gameOverRef.current = createGameOverSound();
      setAudioInitialized(true);
    }
  };

	const waveConfig = createWaveConfig(waves);
	useEffect(() => {
		scoreRef.current = score;
	}, [score]);

	useEffect(() => {
		winTicketsRef.current = countWinTickets;
	}, [countWinTickets]);

  const initializeScene = () => {
    const mountEl = mountRef.current;
    const { width, height } = mountEl.getBoundingClientRect();

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    camera.position.z = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    mountEl.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.load("/invaders/gameAtlases/gameBackground.png", (texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const bgGeo = new THREE.PlaneGeometry(1, 1);
      const bgMat = new THREE.MeshBasicMaterial({ map: texture });
      const bg = new THREE.Mesh(bgGeo, bgMat);
      bg.position.z = -900;
      scene.add(bg);

      const updateBG = () => {
        bg.scale.set(
          camera.right - camera.left,
          camera.top - camera.bottom,
          1
        );
        bg.position.x = camera.position.x;
        bg.position.y = camera.position.y;
      };

      const loop = () => {
        requestAnimationFrame(loop);
        updateBG();
        renderer.render(scene, camera);
      };
      loop();
    });

    starsRef.current = setupParallaxStars(scene);

    const handleResize = () => {
      if (!mountRef.current) return;
      const { width: w, height: h } = mountRef.current.getBoundingClientRect();
      camera.left = w / -2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = h / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);
    // Store for cleanup
    initializeScene.cleanup = () => {
      window.removeEventListener("resize", handleResize);
    };
  };


  const loadUserShip = (textures) => {
    const userShip = new UserShip(sceneRef.current, cameraRef.current, userShipConfig, textures[userShipConfig.texture], textures[userShipConfig.bulletTexture], textures[userShipConfig.shineTexture]);
    userShipRef.current = userShip;
  };

	const respawnUserShip = (textures) => {
		if (!userShipRef.current) {
			loadUserShip(textures);
		}
		setUserHp(userShipConfig.hp);
	};

  const loadWave = (waveIndex, textures, animationTextures) => {
    if (!animationTextures) return;
    const wave = waveConfig[waveIndex];

    // Spacing configuration
    const columnSpacingX = 110;   // horizontal distance between columns
    const enemySpacingY = 60;     // vertical distance between enemies in a column
    const topMargin = 120;        // distance from top screen edge

    // Treat every group as a vertical column; ignore front/back lateral offsets
    const groups = wave.enemies;

    const enemyHeight = groups[0].config.size?.height || 100;
    const topY = cameraRef.current.top - enemyHeight / 2; // flush with top
    const numColumns = groups.length;
    const totalWidth = (numColumns - 1) * columnSpacingX;
    const startX = -totalWidth / 2; // centers the formation at x = 0

    const enemyShips = [];

    groups.forEach((group, colIndex) => {
      const x = startX + colIndex * columnSpacingX;
      const count = group.count;

      for (let i = 0; i < count; i++) {
        // Each enemy in the column goes downward from the top
        const y = topY - i * enemySpacingY;

        const cfg = group.config;
        const ship = cfg.isBoss
          ? new BossShip(
            sceneRef.current,
            cfg,
            textures[cfg.texture],
            textures[cfg.bulletTexture],
            textures[cfg.shineTexture],
            animationTextures[cfg.texture]
          )
          : new EnemyShip(
            sceneRef.current,
            cfg,
            textures[cfg.texture],
            textures[cfg.bulletTexture],
            textures[cfg.shineTexture],
            animationTextures[cfg.texture]
          );

        ship.mesh.position.set(x, y, 0);
        ship.hp = cfg.hp;
        enemyShips.push(ship);
      }
    });

    enemyShipsRef.current = enemyShips;
    currentMoveIndexRef.current = 0;
    // Initialize first downward targets using the first group's move pattern
    targetPositionsRef.current = EnemyShip.calculateNextTarget(
      enemyShips,
      wave.enemies[0].config.movePattern,
      currentMoveIndexRef.current
    );
  };
	const cleanUpScene = () => {
		sceneRef.current.children.forEach((child) => {
			if (child instanceof THREE.Mesh) {
				sceneRef.current.remove(child);
				child.geometry.dispose();
				child.material.dispose();
			}
		});
	};

	const cleanUpBullets = () => {
		userShipRef.current.bullets.forEach((bullet) => {
			bullet.despawn();
		});
		userShipRef.current.bullets = [];

		enemyShipsRef.current.forEach((enemyShip) => {
			enemyShip.bullets.forEach((bullet) => {
				bullet.despawn();
			});
			enemyShip.bullets = [];
		});
	};

	const resetGame = (textures) => {
		//dispatch(setUser({ balance: userBalance + scoreRefStack.current, tickets: useTickets + winTicketsRef.current }));
		setGameResultScore(scoreRef.current);
		postEndGame(scoreRef.current);
		//dispatch(incUserLives(-1));

		cleanUpScene();
		cleanUpBullets();

		enemyShipsRef.current.forEach((enemyShip) => {
			enemyShip.despawn();
		});
		enemyShipsRef.current = [];

		if (userShipRef.current) {
			userShipRef.current.despawn();
			userShipRef.current = null;
		}

		setScore(0);
		setCountWinTickets(0);
		setUserHp(userShipConfig.hp);
    dispatch(resetGameData());
		currentWaveRef.current = 0;
		totalUserPlayedWaveRef.current = 0;
		currentMoveIndexRef.current = 0;
		targetPositionsRef.current = [];

		clearInterval(shootIntervalRef.current);
		setIsInGameModalOpen(true);

		respawnUserShip(textures);
	};

	const texturePaths = [
		"/invaders/gameAtlases/enemyCClass.png",
		"/invaders/gameAtlases/enemyBClass.png",
		"/invaders/gameAtlases/enemyEClass.png",
		"/invaders/gameAtlases/enemyDClass.png",
		"/invaders/gameAtlases/enemyJClass.png",
		"/invaders/gameAtlases/enemyHClass.png",
		"/invaders/gameAtlases/enemyGClass.png",
		"/invaders/gameAtlases/enemyCClassBullet.png",
		"/invaders/gameAtlases/enemyBClassBullet.png",
		"/invaders/gameAtlases/enemyEClassBullet.png",
		"/invaders/gameAtlases/enemyDClassBullet.png",
		"/invaders/gameAtlases/enemyJClassBullet.png",
		"/invaders/gameAtlases/enemyHClassBullet.png",
		"/invaders/gameAtlases/enemyGClassBullet.png",
		"/invaders/gameAtlases/shine/enemyCClass.png",
		"/invaders/gameAtlases/shine/enemyBClass.png",
		"/invaders/gameAtlases/shine/enemyEClass.png",
		"/invaders/gameAtlases/shine/enemyDClass.png",
		"/invaders/gameAtlases/shine/enemyJClass.png",
		"/invaders/gameAtlases/shine/enemyHClass.png",
		"/invaders/gameAtlases/shine/enemyGClass.png",
		"/invaders/gameAtlases/userShipAtlas.png",
		"/invaders/gameAtlases/bulletUserAtlas2.png",
		"/invaders/gameAtlases/shine/userShipShine.png",
		"/invaders/gameAtlases/enemyAClass.png",
		"/invaders/gameAtlases/enemyAClassBullet.png",
		"/invaders/gameAtlases/shine/enemyAClass.png",
		"/invaders/gameAtlases/enemyFClass.png",
		"/invaders/gameAtlases/enemyFClassBullet.png",
		"/invaders/gameAtlases/shine/enemyFClass.png",
		"/invaders/gameAtlases/enemyIClass.png",
		"/invaders/gameAtlases/enemyIClassBullet.png",
		"/invaders/gameAtlases/shine/enemyIClass.png",
		"/invaders/gameAtlases/enemyKClass.png",
		"/invaders/gameAtlases/enemyKClassBullet.png",
		"/invaders/gameAtlases/shine/enemyKClass.png",
    "/invaders/gameAtlases/user_ship_s3.png",
  ];

	const [textures, setTextures] = useState(null);
	const animationsPaths = ["/invaders/gameAtlases/enemyAClass.png", "/invaders/gameAtlases/enemyFClass.png", "/invaders/gameAtlases/enemyIClass.png", "/invaders/gameAtlases/enemyKClass.png", "/invaders/gameAtlases/enemyCClass.png", "/invaders/gameAtlases/enemyBClass.png", "/invaders/gameAtlases/enemyEClass.png", "/invaders/gameAtlases/enemyDClass.png", "/invaders/gameAtlases/enemyJClass.png", "/invaders/gameAtlases/enemyHClass.png", "/invaders/gameAtlases/enemyGClass.png"];

  const handleEnemyShooting = () => {
    if (gameStartedRef.current && enemyShipsRef.current.length > 0) {
      const activeEnemyIndex = Math.floor(Math.random() * enemyShipsRef.current.length);
      const activeEnemy = enemyShipsRef.current[activeEnemyIndex];
      activeEnemy.shoot(new THREE.Vector3(0, -1, 0));
      if (isSoundOn !== "false") {
        playEnemyShotUserSound();
      }
    }
  };


	useEffect(() => {
		preloadTextures(texturePaths).then(setTextures).catch(console.error);
	}, []);

  useEffect(() => {
    if (!textures) return;
    const handleKeyDown = (e) => {
      if (!userShipRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        userShipRef.current.setKey("left", true);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        userShipRef.current.setKey("right", true);
      }
    };
    const handleKeyUp = (e) => {
      if (!userShipRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        userShipRef.current.setKey("left", false);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        userShipRef.current.setKey("right", false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [textures]);

	useEffect(() => {
		if (!textures) return;

		initializeScene();

		loadUserShip(textures);

		const clock = new THREE.Clock();
		const animate = () => {
			requestAnimationFrame(animate);

			let allShipsReachedTarget = true;
			const deltaTime = clock.getDelta();

      if (userShipRef.current && gameStartedRef.current) {
        userShipRef.current.update(deltaTime);
      }

			const { starsT1, starsT2 } = starsRef.current;
			if (userShipRef.current) {
				starsT1.position.x = cameraRef.current.position.x * 0.1;
				starsT1.position.y = cameraRef.current.position.y * 0.1;

				starsT2.position.x = cameraRef.current.position.x * 0.3;
				starsT2.position.y = cameraRef.current.position.y * 0.3;
			}

      enemyShipsRef.current.forEach((enemyShip, index) => {
        if (targetPositionsRef.current[index]) {
          enemyShip.setTargetPosition(targetPositionsRef.current[index]);
        }
        enemyShip.update(deltaTime);

        if (enemyShip.mesh.position && targetPositionsRef.current[index] &&
          !enemyShip.mesh.position.equals(targetPositionsRef.current[index])) {
          allShipsReachedTarget = false;
        }

        const halfScreenBottom = -window.innerHeight / 2;
        const enemyBottomLimit =
          halfScreenBottom - (enemyShip.config.size?.height || 0) / 2; // trigger once sprite fully leaves

        if (enemyShip.mesh.position.y < enemyBottomLimit && gameStartedRef.current) {
          gameStartedRef.current = false;
          resetGame(textures);
          return; // stop further processing this frame
        }
      });

			if (!gameStartedRef.current) {
				return;
			}

			for (let i = enemyDeadShipsRef.current.length - 1; i >= 0; i--) {
				const enemyDeadShip = enemyDeadShipsRef.current[i];
				if (enemyDeadShip.isBulletsExist) {
					enemyDeadShip.updateBullets(deltaTime);
					enemyDeadShip.bullets.forEach((bullet, bulletIndex) => {
						if (userShipRef.current && bullet.checkCollision(userShipRef.current)) {
							bullet.despawn();
							enemyDeadShip.bullets.splice(bulletIndex, 1);
							userShipRef.current.hp -= 1;
							setUserHp((prevHp) => prevHp - 1);
              dispatch(loseLife());
							if (isSoundOn !== "false") {
								getDamage();
							}

							const isVibrationOn = localStorage.getItem("isVibrationOn");
							if (isVibrationOn !== "false") {

							}

							if (userShipRef.current.hp <= 0) {
								if (isSoundOn !== "false") {
									//gameOver.play();
								}
								gameStartedRef.current = false;
								resetGame(textures);
							}
						}
					});
				} else {
					enemyDeadShipsRef.current.splice(i, 1);
				}
			}

			if (allShipsReachedTarget) {
				currentMoveIndexRef.current = (currentMoveIndexRef.current + 1) % waveConfig[currentWaveRef.current].enemies[0].config.movePattern.length;
				targetPositionsRef.current = EnemyShip.calculateNextTarget(enemyShipsRef.current, waveConfig[currentWaveRef.current].enemies[0].config.movePattern, currentMoveIndexRef.current);
			}

			if (userShipRef.current) {
				userShipRef.current.bullets.forEach((bullet, bulletIndex) => {
					let bulletRemoved = false;
					enemyShipsRef.current.forEach((enemyShip) => {
						if (!enemyShip.isDestroyed && bullet.checkCollision(enemyShip) && !bulletRemoved) {
							bullet.despawn();
							userShipRef.current.bullets.splice(bulletIndex, 1);
							bulletRemoved = true;
							if (isSoundOn !== "false") {
								getDamage();
							}

							enemyShip.hp -= 1;
							if (enemyShip.hp <= 0) {
								if (isSoundOn !== "false") {
									enemyDead();
								}
								enemyShip.hitByBullet();
							}
						}
					});
				});
			}

			for (let i = enemyShipsRef.current.length - 1; i >= 0; i--) {
				const enemyShip = enemyShipsRef.current[i];
				if (enemyShip.isExplosionAnimationComplete()) {
					enemyShip.despawn();
					setScore((prevScore) => {
            const gained = enemyShip.config.SWC;
            const newScore = prevScore + gained;

            // Award ticket every 500 points (use newScore for the modulus check)
            if (newScore % 500 === 0) {
              postAddTicket();
              if (isSoundOn !== "false") {
                get500Points();
              }
              setCountWinTickets(prev => prev + 1);
            }

            scoreRefStack.current += gained;

            // Sync Redux score (GameHUD reads from store)
            dispatch(addScore(gained));

            return newScore;
					});
					enemyDeadShipsRef.current.push(...enemyShipsRef.current.splice(i, 1));
					targetPositionsRef.current.splice(i, 1);
				}
			}

			enemyShipsRef.current.forEach((enemyShip) => {
				enemyShip.bullets.forEach((bullet, bulletIndex) => {
					if (userShipRef.current && bullet.checkCollision(userShipRef.current)) {
						bullet.despawn();
						enemyShip.bullets.splice(bulletIndex, 1);
						userShipRef.current.hp -= 1;
						setUserHp((prevHp) => prevHp - 1);
            dispatch(loseLife());
						if (isSoundOn !== "false") {
							getDamage();
						}

						const isVibrationOn = localStorage.getItem("isVibrationOn");
						if (isVibrationOn !== "false") {

						}

						if (userShipRef.current.hp <= 0) {
							if (isSoundOn !== "false") {
								//gameOver.play();
							}
							gameStartedRef.current = false;
							resetGame(textures);
						}
					}
				});
			});

			if (enemyShipsRef.current.length === 0 && gameStartedRef.current) {
				currentWaveRef.current++;
				totalUserPlayedWaveRef.current++;
        dispatch(setLevel(currentWaveRef.current));
				if (currentWaveRef.current < waveConfig.length) {
					cleanUpBullets();
					if (gameStartedRef.current) {
						// trackLevelAchieved(userChatId, currentWaveRef.current);
						loadWave(currentWaveRef.current, textures, animationTextures.current);
						clearInterval(shootIntervalRef.current);
						shootIntervalRef.current = setInterval(handleEnemyShooting, waveConfig[currentWaveRef.current].enemies[0].config.shootInterval);
					}
				} else {
					// resetGame(textures);
					// TODO REMOVE
					currentWaveRef.current = 0;
				}

				if (currentWaveRef.current % 9 === 0) {
					if (isSoundOn !== "false") {
						bossWave();
					}
				}
			}

			rendererRef.current.render(sceneRef.current, cameraRef.current);
		};

		animate();

		const onTouchStart = (event) => {
			if (userShipRef.current && enemyShipsRef.current.length > 0) {
				userShipRef.current.onTouchStart(event);
			}
		};

		const onTouchMove = (event) => {
			if (userShipRef.current && enemyShipsRef.current.length > 0) {
				userShipRef.current.onTouchMove(event);
			}
		};

		const onTouchEnd = () => {
			if (userShipRef.current && enemyShipsRef.current.length > 0) {
				userShipRef.current.onTouchEnd();
			}
		};

		window.addEventListener("touchstart", onTouchStart);
		window.addEventListener("touchmove", onTouchMove);
		window.addEventListener("touchend", onTouchEnd);



		shootIntervalRef.current = setInterval(handleEnemyShooting, waveConfig[currentWaveRef.current].enemies[0].config.shootInterval);

		return () => {
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("touchend", onTouchEnd);
			if (mountRef.current) {
				mountRef.current.removeChild(rendererRef.current.domElement);
			}
			clearInterval(shootIntervalRef.current);
		};
	}, [textures]);

	useEffect(() => {
		gameStartedRef.current = isGameStarted;
		if (isGameStarted && textures) {
			if (isSoundOn !== "false") {
				//gamePlayMusic.play();
			}
			currentWaveRef.current = 0;
			// trackLevelAchieved(userChatId, currentWaveRef.current);
			loadWave(currentWaveRef.current, textures, animationTextures.current);

			const handleEnemyShooting = () => {
				if (enemyShipsRef.current.length > 0) {
					const activeEnemyIndex = Math.floor(Math.random() * enemyShipsRef.current.length);
					const activeEnemy = enemyShipsRef.current[activeEnemyIndex];
          activeEnemy.shoot(new THREE.Vector3(-1, 0, 0));
					if (isSoundOn !== "false") {
						playEnemyShotUserSound();
					}
				}
			};
			clearInterval(shootIntervalRef.current);
			shootIntervalRef.current = setInterval(handleEnemyShooting, waveConfig[currentWaveRef.current].enemies[0].config.shootInterval);
		}
		return () => {
			//gamePlayMusic.stop();
		};
	}, [isGameStarted, textures]);

	useEffect(() => {
		if (!textures) return;
		if (isContinueLoading) return;

		localStorage.setItem("userLivesState", userLives.leftLives);

		const loadAnimations = () => {
			const enemiesAnimations = animationsPaths.reduce((acc, path) => {
				acc[path] = preloadAnimationFrames(textures[path]);
				return acc;
			}, {});

			animationTextures.current = { ...animationTextures.current, ...enemiesAnimations };
			setIsContinueLoading(true);
		};

		loadAnimations();

    console.log('loading animations')
	}, [textures, animationsPaths]);

	useEffect(() => {
		if (!isLoaded) return;
		setIsGameInitialized(true);
		if (isSoundOn !== "false") {
			readySteadyGo();
		}
	}, [isLoaded]);

	const setLivesArray = () => {
		const arrayImages = [];
		for (let i = 0; i < 3; i += 1) {
			if (i < userHp) {
				arrayImages.push(<Image src={inGameLive} alt="live-icon" height={16} width={24} />);
			} else {
				arrayImages.push(<Image src={inGameLiveDeath} alt="live-icon" height={16} width={24} />);
			}
		}
		return arrayImages;
	};

	const liveImagesArray = setLivesArray();
	return (
			<div     style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden"
      }} ref={mountRef}/>
	);
};

export default Game;
