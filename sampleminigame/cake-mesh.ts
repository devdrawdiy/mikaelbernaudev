import * as THREE from 'three';
import { flavorInfo, type Flavor } from './domain';

const geometryCache = new Map<string, THREE.ExtrudeGeometry>();
const materialCache = new Map<string, THREE.MeshStandardMaterial>();
function material(color: string) {
  if (!materialCache.has(color)) materialCache.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.72 }));
  return materialCache.get(color)!;
}
function sector(parts: number, radius: number, depth: number) {
  const key = `${parts}:${radius}:${depth}`;
  if (geometryCache.has(key)) return geometryCache.get(key)!;
  const angle = Math.PI * 2 / parts;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(radius, 0);
  shape.absarc(0, 0, radius, 0, angle, false);
  shape.lineTo(0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 28 });
  geometry.computeVertexNormals();
  geometryCache.set(key, geometry);
  return geometry;
}
export function makeSlice(flavor: Flavor, parts: number) {
  const info = flavorInfo(flavor), group = new THREE.Group();
  const layers = [
    { color: info.sponge, depth: 0.14, z: 0, radius: 1.12 },
    { color: info.cream, depth: 0.075, z: 0.14, radius: 1.115 },
    { color: info.sponge, depth: 0.14, z: 0.215, radius: 1.12 },
    { color: info.frosting, depth: 0.09, z: 0.355, radius: 1.14 },
  ];
  layers.forEach(({ color, depth, z, radius }) => {
    const mesh = new THREE.Mesh(sector(parts, radius, depth), material(color));
    mesh.position.z = z;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });
  const trim = new THREE.Mesh(new THREE.TorusGeometry(1.11, 0.026, 5, 48, Math.PI * 2 / parts), material(info.cream));
  trim.position.z = 0.46;
  group.add(trim);
  const toppingCount = Math.max(1, Math.round(8 / parts));
  for (let i = 0; i < toppingCount; i++) {
    const angle = (i + 0.5) / toppingCount * Math.PI * 2 / parts;
    const topping = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), material(info.accent));
    topping.position.set(Math.cos(angle) * 0.86, Math.sin(angle) * 0.86, 0.51);
    topping.scale.z = 0.7;
    group.add(topping);
  }
  return group;
}
export function makeWhole(flavor: Flavor) { return makeSlice(flavor, 1); }
export function plate(radius: number, color = '#f9f7ef') {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.94, 0.075, 48), material(color));
  base.receiveShadow = true;
  group.add(base);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.94, 0.036, 6, 64), material(color));
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.045;
  group.add(rim);
  return group;
}
