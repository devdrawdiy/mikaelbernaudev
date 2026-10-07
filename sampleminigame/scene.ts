import * as THREE from 'three';
import { makeSlice } from './cake-mesh';
import { Bakery, flavors, type Flavor } from './domain';
import { Motion } from './motion';
import { makeRoom } from './room';
import { makeGuest } from './guest';
import { GuestGreeting } from './guest-greeting';
import { loadProps } from './props';
import { cakePose, trayPose, shelfPosition } from './positions';
import { buildPlans, type Selection } from './scene-plans';
export type { Selection } from './scene-plans';
export class BakeryScene {
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-7, 7, 5, -5, 0.1, 80);
  renderer: THREE.WebGLRenderer;
  motion = new Motion();
  objects = new Map<string, THREE.Group>();
  guest = makeGuest();
  guestHome = this.guest.position.clone();
  greeting = new GuestGreeting(this.guest);
  raycaster = new THREE.Raycaster();
  canvas: HTMLCanvasElement;
  observer: ResizeObserver;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.scene.background = new THREE.Color('#c5ded4');
    this.scene.add(makeRoom(), this.guest, new THREE.HemisphereLight('#fff9ea', '#80988c', 2.6));
    const light = new THREE.DirectionalLight('#fff5dc', 3.4);
    light.position.set(-3, 9, 7); light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    Object.assign(light.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
    light.shadow.bias = -0.001; this.scene.add(light);
    this.camera.position.set(0.3, 6.4, 12); this.camera.lookAt(0.3, 1.8, 0);
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(canvas); this.resize();
    loadProps(this.scene).then((count) => { canvas.dataset.props = String(count); }).catch(() => { canvas.dataset.props = '0'; });
    this.greeting.start(this.motion.reduced);
  }
  resize() {
    const width = this.canvas.clientWidth, height = this.canvas.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    const viewWidth = width < 761 ? 10.6 : 14.4, viewHeight = viewWidth * height / width;
    this.camera.left = -viewWidth / 2; this.camera.right = viewWidth / 2;
    this.camera.top = viewHeight / 2; this.camera.bottom = -viewHeight / 2;
    this.camera.updateProjectionMatrix();
  }
  sync(state: Bakery, spread: boolean) {
    const plans = buildPlans(state), keep = new Set(plans.map(({ key }) => key));
    for (const plan of plans) {
      const pose = plan.tray ? trayPose(plan.plate, plan.index, plan.denominator) : cakePose(plan.flavor, plan.index, plan.denominator, state.active, spread);
      let object = this.objects.get(plan.key);
      if (!object) {
        object = makeSlice(plan.flavor, plan.denominator);
        const origins = [...this.objects.values()].filter((item) => {
          const old = item.userData.selection;
          return old?.flavor === plan.flavor && old.cakeId === plan.cakeId && (plan.ids.some((id) => old.ids.includes(id)) || !old.tray && old.denominator !== plan.denominator);
        });
        object.position.copy(origins.length ? origins.reduce((sum, item) => sum.add(item.position), new THREE.Vector3()).divideScalar(origins.length) : shelfPosition(plan.flavor));
        object.rotation.set(-0.16, 0, plan.index * Math.PI * 2 / plan.denominator);
        this.objects.set(plan.key, object); this.scene.add(object);
      }
      object.userData.selection = plan;
      object.scale.setScalar(pose.scale);
      this.motion.move(object, pose.position, pose.rotation);
    }
    for (const [key, object] of this.objects) if (!keep.has(key)) {
      this.motion.remove(object); this.scene.remove(object);
      object.traverse((child) => { if (child instanceof THREE.Mesh && child.geometry.type !== 'ExtrudeGeometry') child.geometry.dispose(); });
      this.objects.delete(key);
    }
    const body = this.guest.children[2] as THREE.Mesh;
    this.guest.visible = !state.complete;
    (body.material as THREE.MeshStandardMaterial).color.set(['#edb862', '#86acc0', '#d67e99', '#8faf85', '#be96c5', '#edb862'][state.index % 6]);
  }
  pick(event: PointerEvent): Selection | null {
    const rect = this.canvas.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), this.camera);
    for (const hit of this.raycaster.intersectObjects([...this.objects.values()], true)) {
      let object: THREE.Object3D | null = hit.object;
      while (object && !object.userData.selection) object = object.parent;
      if (object && !this.motion.moves.has(object)) return object.userData.selection;
    }
    return null;
  }
  busy(flavor: Flavor, ids: number[], cakeId: number) {
    return [...this.objects.values()].some((object) => object.userData.selection.flavor === flavor && object.userData.selection.cakeId === cakeId && ids.some((id) => object.userData.selection.ids.includes(id)) && this.motion.moves.has(object));
  }
  flyOrderRight() {
    for (const object of this.objects.values()) if (object.userData.selection.tray) {
      const end = object.position.clone(); end.x += this.camera.right + this.camera.position.x + 2;
      this.motion.move(object, end, object.rotation.clone(), 0.65, 0.5);
    }
  }
  guestExit() {
    this.greeting.stop();
    const end = this.guestHome.clone(); end.x = this.camera.right + this.camera.position.x + 2;
    return new Promise<void>((resolve) => this.motion.move(this.guest, end, new THREE.Euler(), 0.75, 0, resolve));
  }
  resetGuest() {
    this.greeting.stop();
    this.motion.remove(this.guest); this.guest.position.copy(this.guestHome); this.guest.rotation.set(0, 0, 0);
  }
  guestEntrance() {
    this.resetGuest(); this.guest.position.x = this.camera.left + this.camera.position.x - 2;
    return new Promise<void>((resolve) => this.motion.move(this.guest, this.guestHome.clone(), new THREE.Euler(), 0.75, 0, resolve)).then(() => this.greeting.start(this.motion.reduced));
  }
  render(delta: number, time: number) {
    this.motion.tick(delta);
    this.greeting.tick(delta);
    if (!this.motion.reduced) this.guest.rotation.z = this.motion.moves.has(this.guest) ? Math.sin(time * 9) * 0.045 : Math.sin(time * 1.4) * 0.025;
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.observer.disconnect(); this.motion.clear();
    this.scene.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose()); } });
    this.renderer.dispose();
  }
}
