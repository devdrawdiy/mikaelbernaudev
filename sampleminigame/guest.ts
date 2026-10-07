import * as THREE from 'three';

function sphere(radius: number, color: string) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 10), new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
}
export function makeGuest() {
  const guest = new THREE.Group();
  const head = sphere(0.38, '#dba987');
  head.position.y = 2.58;
  guest.add(head);
  const hair = sphere(0.40, '#533b3d');
  hair.scale.set(1, 0.65, 1);
  hair.position.set(0, 2.81, -0.055);
  guest.add(hair);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.33, 0.5, 4, 12), new THREE.MeshStandardMaterial({ color: '#edb862' }));
  body.position.y = 1.93;
  guest.add(body);
  for (const x of [-0.12, 0.12]) {
    const eye = sphere(0.035, '#303431');
    eye.position.set(x, 2.6, 0.345);
    guest.add(eye);
    const cheek = sphere(0.065, '#c67a7d');
    cheek.scale.z = 0.4;
    cheek.position.set(x * 1.75, 2.5, 0.31);
    guest.add(cheek);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 4, 12, Math.PI), new THREE.MeshStandardMaterial({ color: '#774746' }));
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, 2.49, 0.357);
  guest.add(mouth);
  for (const x of [-0.38, 0.38]) {
    const shoulder = new THREE.Group();
    shoulder.name = x > 0 ? 'left-arm' : 'right-arm';
    shoulder.position.set(x, 2.2, 0.04);
    shoulder.rotation.z = x < 0 ? -0.4 : 0.4;
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.35, 3, 8), body.material);
    arm.position.y = -0.22;
    const hand = sphere(0.10, '#dba987'); hand.position.y = -0.49;
    shoulder.add(arm, hand); guest.add(shoulder);
  }
  guest.position.set(0.8, 0, -2.8);
  return guest;
}
