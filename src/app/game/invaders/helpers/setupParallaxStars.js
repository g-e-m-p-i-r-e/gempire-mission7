import * as THREE from "three";

export const getRandomParticelPos = (particleCount) => {
	const arr = new Float32Array(particleCount * 3);
	for (let i = 0; i < particleCount; i++) {
		arr[i * 3] = (Math.random() - 0.5) * 1000;
		arr[i * 3 + 1] = (Math.random() - 0.5) * 1000;
		arr[i * 3 + 2] = (Math.random() - 0.5) * 1000;
	}
	return arr;
};

export const setupParallaxStars = (scene) => {
	const loader = new THREE.TextureLoader();

	const geometrys = [new THREE.BufferGeometry(), new THREE.BufferGeometry()];
	geometrys[0].setAttribute("position", new THREE.BufferAttribute(getRandomParticelPos(350), 3));
	geometrys[1].setAttribute("position", new THREE.BufferAttribute(getRandomParticelPos(5000), 3));

	const materials = [
		new THREE.PointsMaterial({
			size: 10,
			map: loader.load("https://raw.githubusercontent.com/Kuntal-Das/textures/main/sp1.png"),
			transparent: true,
			depthTest: true,
			opacity: 0.5,
			depthWrite: false,
		}),
		new THREE.PointsMaterial({
			size: 5,
			map: loader.load("https://raw.githubusercontent.com/Kuntal-Das/textures/main/sp2.png"),
			transparent: true,
			depthTest: true,
			opacity: 0.5,
			depthWrite: false,
		}),
	];

	const starsT1 = new THREE.Points(geometrys[0], materials[0]);
	const starsT2 = new THREE.Points(geometrys[1], materials[1]);

	starsT1.position.z = -995;
	starsT2.position.z = -995;

	scene.add(starsT1);
	scene.add(starsT2);

	return { starsT1, starsT2 };
};
