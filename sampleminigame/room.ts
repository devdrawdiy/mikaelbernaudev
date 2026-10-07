import * as THREE from 'three';
import { plate } from './cake-mesh';
import { flavors } from './domain';
import { trayLayout, trayX } from './positions';

function box(scene: THREE.Group, size: number[], position: number[], color: string) {
  const object = new THREE.Mesh(new THREE.BoxGeometry(...size as [number, number, number]), new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
  object.position.set(...position as [number, number, number]);
  object.castShadow = true;
  object.receiveShadow = true;
  scene.add(object);
  return object;
}
export function makeRoom() {
  const room = new THREE.Group();
  box(room, [24, 0.15, 18], [0, -0.15, 0], '#dfe9e2');
  box(room, [24, 9, 0.2], [0, 4, -4.3], '#add0c4');
  box(room, [0.2, 9, 18], [-8, 4, 0], '#d3e5de');
  for (let x = -8; x <= 8; x += 1) {
    for (let y = 0; y < 3; y++) {
      box(room, [0.94, 0.49, 0.025], [x + (y % 2 ? 0.5 : 0), 0.65 + y * 0.52, -4.16], '#ecf2ed');
    }
  }
  box(room, [3.3, 2.3, 0.15], [3.6, 4.2, -4.02], '#fff8ef');
  box(room, [3.0, 2.0, 0.12], [3.6, 4.2, -3.92], '#b9dfec');
  box(room, [0.09, 2.0, 0.13], [3.6, 4.2, -3.83], '#fff8ef');
  box(room, [3.0, 0.09, 0.13], [3.6, 4.2, -3.83], '#fff8ef');
  box(room, [11.4, 0.24, 2.5], [0, 1.45, -1.6], '#ece1cf');
  box(room, [11.1, 1.35, 2.3], [0, 0.72, -1.6], '#c77878');
  for (let x = -5; x <= 5; x += 0.38) box(room, [0.055, 1.1, 0.03], [x, 0.72, -0.43], '#e7a19a');
  box(room, [9.5, 0.16, 4], [0, 0.65, 1.65], '#f0e8db');
  box(room, [9.1, 0.52, 3.7], [0, 0.32, 1.65], '#e8d4c0');
  const trayWidth = (flavors.length - 1) * trayLayout.spacing + 2 * trayLayout.radius + 0.24;
  const serving = new THREE.Mesh(new THREE.BoxGeometry(trayWidth, 0.10, 2.5), new THREE.MeshStandardMaterial({ color: '#6faaa2', roughness: 0.55 }));
  serving.position.set(trayLayout.centerX, 0.79, trayLayout.z);
  serving.receiveShadow = true;
  room.add(serving);
  flavors.forEach((_, index) => {
    const dish = plate(trayLayout.radius);
    dish.position.set(trayX(index), 0.89, trayLayout.z);
    room.add(dish);
  });
  for (const x of [-3.1, 0, 3.1]) {
    const dish = plate(1.04, '#fff7e8');
    dish.position.set(x, 1.66, -1.8);
    room.add(dish);
  }
  return room;
}
