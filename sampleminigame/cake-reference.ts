import * as THREE from 'three';
import { type Cake } from './domain';
import { focus } from './positions';

export class CakeReference {
  group = new THREE.Group();
  material = new THREE.LineBasicMaterial({ color: '#467d6b', transparent: true, opacity: 0.45 });
  signature = '';
  constructor() {
    this.group.position.copy(focus);
    this.group.position.z -= 0.08;
    this.group.rotation.x = -0.16;
    this.group.scale.setScalar(0.83);
  }
  update(cake: Cake, spread: boolean) {
    this.group.visible = spread && cake.division > 0;
    if (String(cake.division) === this.signature) return;
    this.signature = String(cake.division);
    for (const child of [...this.group.children]) {
      (child as THREE.Line).geometry.dispose();
      this.group.remove(child);
    }
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const angle = i / 96 * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * 1.14, Math.sin(angle) * 1.14, 0));
    }
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), this.material));
    for (let i = 0; i < cake.division; i++) {
      const angle = i / cake.division * Math.PI * 2;
      const edge = [new THREE.Vector3(), new THREE.Vector3(Math.cos(angle) * 1.14, Math.sin(angle) * 1.14, 0)];
      this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(edge), this.material));
    }
  }
  dispose() {
    this.group.traverse((child) => { if (child instanceof THREE.Line) child.geometry.dispose(); });
    this.material.dispose();
  }
}
