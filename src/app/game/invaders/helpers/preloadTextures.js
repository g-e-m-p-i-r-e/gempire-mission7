import * as THREE from "three";

export const preloadTextures = async (texturePaths) => {
	const loader = new THREE.TextureLoader();
	const promises = texturePaths.map((path) => {
		return new Promise((resolve, reject) => {
			loader.load(path, resolve, undefined, reject);
		});
	});
	const textures = await Promise.all(promises);
	const textureMap = {};
	texturePaths.forEach((path, index) => {
		textureMap[path] = textures[index];
	});
	return textureMap;
};

