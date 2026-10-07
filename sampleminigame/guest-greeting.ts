import * as THREE from 'three';

export class GuestGreeting {
  arm: THREE.Object3D;
  elapsed = Infinity;
  duration = 1.6;
  constructor(guest: THREE.Group) { this.arm = guest.getObjectByName('left-arm')!; }
  start(reduced = false) { this.elapsed = reduced ? Infinity : 0; this.arm.rotation.z = 0.4; }
  stop() { this.elapsed = Infinity; this.arm.rotation.z = 0.4; }
  tick(delta: number) {
    this.elapsed += delta;
    if (this.elapsed >= this.duration) { this.arm.rotation.z = 0.4; return; }
    const fade = Math.min(1, this.elapsed / 0.22, (this.duration - this.elapsed) / 0.3);
    const lift = 2.0 + Math.sin(this.elapsed * 16) * 0.25;
    this.arm.rotation.z = 0.4 + lift * Math.max(0, fade);
  }
}
