import * as THREE from 'three';
import { flavors, type Flavor } from './domain';
export const focus = new THREE.Vector3(-1.65, 2.15, 1.5);
export const trayLayout = { centerX: 2.65, spacing: 1.28, radius: 0.60, z: 1.7 };
export const trayX = (index: number) => trayLayout.centerX + (index - 1) * trayLayout.spacing;
const guide = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-4.05, 1.75, 1.5),
  new THREE.Vector3(-1.65, 2.55, 1.5),
  new THREE.Vector3(0.75, 1.75, 1.5),
]);
export function cakePose(flavor: Flavor, index: number, denominator: number, active: Flavor, spread: boolean) {
  const angle = Math.PI * 2 / denominator;
  if (flavor !== active) return {
    position: new THREE.Vector3(-3.1 + flavors.findIndex(({ id }) => id === flavor) * 3.1, 1.78, -1.8),
    rotation: new THREE.Euler(-Math.PI / 2, 0, index * angle), scale: 0.75,
  };
  if (!spread || denominator === 1) return { position: focus.clone(), rotation: new THREE.Euler(-0.16, 0, index * angle), scale: 1 };
  const t = denominator === 2 ? (index + 0.25) / 1.5 : index / (denominator - 1);
  return { position: guide.getPoint(t), rotation: new THREE.Euler(-0.16, 0, Math.PI / 2 - angle / 2), scale: 0.83 };
}
export function trayPose(flavor: Flavor, index: number, denominator: number) {
  return {
    position: new THREE.Vector3(trayX(flavors.findIndex(({ id }) => id === flavor)), 0.94, trayLayout.z),
    rotation: new THREE.Euler(-Math.PI / 2, 0, index * Math.PI * 2 / denominator), scale: 0.46,
  };
}
