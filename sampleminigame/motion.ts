import * as THREE from 'three';

type Move = { object: THREE.Object3D; start: THREE.Vector3; end: THREE.Vector3; from: THREE.Quaternion; to: THREE.Quaternion; elapsed: number; duration: number; arc: number; done?: () => void };
export class Motion {
  moves = new Map<THREE.Object3D, Move>();
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  move(object: THREE.Object3D, end: THREE.Vector3, rotation: THREE.Euler, duration = 0.6, arc = 0.4, done?: () => void) {
    const to = new THREE.Quaternion().setFromEuler(rotation);
    const pending = this.moves.get(object);
    if (pending && pending.end.distanceToSquared(end) < 0.000001 && pending.to.angleTo(to) < 0.0001) return;
    if (!pending && object.position.distanceToSquared(end) < 0.000001 && object.quaternion.angleTo(to) < 0.0001) return;
    if (this.reduced) {
      object.position.copy(end);
      object.quaternion.copy(to);
      done?.();
      return;
    }
    this.moves.set(object, { object, start: object.position.clone(), end, from: object.quaternion.clone(), to, elapsed: 0, duration, arc, done });
  }
  tick(delta: number) {
    for (const [object, move] of this.moves) {
      move.elapsed += delta;
      const t = Math.min(1, move.elapsed / move.duration);
      const eased = t * t * (3 - 2 * t);
      object.position.lerpVectors(move.start, move.end, eased);
      object.position.y += Math.sin(Math.PI * t) * move.arc;
      object.quaternion.slerpQuaternions(move.from, move.to, eased);
      if (t === 1) {
        this.moves.delete(object);
        move.done?.();
      }
    }
  }
  remove(object: THREE.Object3D) { this.moves.delete(object); }
  clear() { this.moves.clear(); }
}
