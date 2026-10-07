import * as THREE from 'three';
import { flavors, plateCapacity, type Flavor } from './catalog';
export const focus = new THREE.Vector3(-1.65, 2.15, 1.5);
export const trayLayout = { centerX: 2.15, spacing: 1.16, radius: 0.52, z: 1.45, rowSpacing: 1.32, columns: 4 };
export function trayCenter(index: number) {
  const row = Math.floor(index / trayLayout.columns), column = index % trayLayout.columns;
  const count = Math.min(trayLayout.columns, plateCapacity - row * trayLayout.columns);
  return new THREE.Vector3(trayLayout.centerX + (column - (count - 1) / 2) * trayLayout.spacing, 0.89, trayLayout.z + (0.5 - row) * trayLayout.rowSpacing);
}
export const shelfPosition = (flavor: Flavor) => new THREE.Vector3(-3.1 + flavors.findIndex(({ id }) => id === flavor) * 3.1, 1.78, -1.8);
const guide = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-4.05, 1.75, 1.5),
  new THREE.Vector3(-1.65, 2.55, 1.5),
  new THREE.Vector3(0.75, 1.75, 1.5),
]);
export function cakePose(flavor: Flavor, index: number, denominator: number, active: Flavor, spread: boolean) {
  const angle = Math.PI * 2 / denominator;
  if (flavor !== active) return {
    position: shelfPosition(flavor),
    rotation: new THREE.Euler(-Math.PI / 2, 0, index * angle), scale: 0.75,
  };
  if (!spread || denominator === 1) return { position: focus.clone(), rotation: new THREE.Euler(-0.16, 0, index * angle), scale: 1 };
  const t = denominator === 2 ? (index + 0.25) / 1.5 : index / (denominator - 1);
  return { position: guide.getPoint(t), rotation: new THREE.Euler(-0.16, 0, Math.PI / 2 - angle / 2), scale: 0.83 };
}
export function trayPose(plate: number, index: number, denominator: number) {
  const position = trayCenter(plate); position.y = 0.94;
  return {
    position,
    rotation: new THREE.Euler(-Math.PI / 2, 0, index * Math.PI * 2 / denominator), scale: 0.42,
  };
}
