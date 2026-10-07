import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const sources = [
  { url: new URL('./CoffeeShopStarterPack/Models/PW_cupboard01.fbx', import.meta.url).href, width: 2.4, x: -4.7, y: 0, z: -3.3 },
  { url: new URL('./CoffeeShopStarterPack/Models/PW_cupboard02.fbx', import.meta.url).href, width: 2.4, x: -2.3, y: 0, z: -3.3 },
  { url: new URL('./CoffeeShopStarterPack/Models/PW_stove.fbx', import.meta.url).href, width: 1.7, x: 0, y: 0, z: -4.1 },
  { url: new URL('./CoffeeShopStarterPack/Models/PW_fridge.fbx', import.meta.url).href, width: 1.5, x: 6.0, y: 0, z: -3.1 },
  { url: new URL('./CoffeeShopStarterPack/Models/PW_macaron_tower.fbx', import.meta.url).href, width: 0.66, x: -5.0, y: 1.61, z: -1.55 },
  { url: new URL('./CoffeeShopStarterPack/Models/PW_sculent01_S.fbx', import.meta.url).href, width: 0.65, x: 5.1, y: 1.61, z: -1.55 },
];
export async function loadProps(scene: THREE.Scene) {
  const texture = await new THREE.TextureLoader().loadAsync(new URL('./CoffeeShopStarterPack/Textures/color_palette02.png', import.meta.url).href);
  texture.colorSpace = THREE.SRGBColorSpace;
  const manager = new THREE.LoadingManager();
  manager.addHandler(/\.(png|jpg|jpeg|tga|bmp)$/i, { load: () => texture } as unknown as THREE.Loader);
  const loader = new FBXLoader(manager);
  const results = await Promise.allSettled(sources.map(async ({ url, width, x, y, z }) => {
    const model = await loader.loadAsync(url);
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
      child.castShadow = true;
      child.receiveShadow = true;
    });
    const bounds = new THREE.Box3().setFromObject(model), size = bounds.getSize(new THREE.Vector3());
    model.scale.setScalar(width / Math.max(size.x, size.z));
    const scaled = new THREE.Box3().setFromObject(model), center = scaled.getCenter(new THREE.Vector3());
    model.position.set(x - center.x, y - scaled.min.y, z - center.z);
    scene.add(model);
  }));
  return results.filter((result) => result.status === 'fulfilled').length;
}
