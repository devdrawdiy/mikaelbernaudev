import { Bakery, flavorInfo, type Flavor } from './domain';
import { BakeryScene, type Selection } from './scene';
import { BakeryUI } from './ui';
export class Controller {
  state = new Bakery(); ui = new BakeryUI();
  scene: BakeryScene;
  spread = false; locked = false; muted = true;
  sound?: AudioContext;
  disposed = false;
  constructor(canvas: HTMLCanvasElement) {
    this.scene = new BakeryScene(canvas);
    this.ui.root.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
      if (button && !(button as HTMLButtonElement).disabled) this.action(button);
    });
    canvas.addEventListener('pointerup', (event) => { const hit = this.scene.pick(event); if (hit) this.pick(hit); });
    canvas.addEventListener('pointermove', (event) => { canvas.style.cursor = this.scene.pick(event) ? 'pointer' : 'default'; });
    this.ui.input.addEventListener('input', () => { this.ui.input.setCustomValidity(''); });
    document.querySelector('#cut-form')!.addEventListener('submit', (event) => { event.preventDefault(); this.cut(); });
    this.refresh();
  }
  refresh() { this.ui.render(this.state, this.spread, this.locked); this.scene.sync(this.state, this.spread); }
  action(button: HTMLElement) {
    const { action, flavor, id, ids, cake } = button.dataset;
    if (action === 'sound') return this.toggleSound(button);
    if (this.locked) return;
    if (action === 'replay') { this.state.replay(); this.spread = false; this.scene.resetGuest(); this.scene.greeting.start(this.scene.motion.reduced); this.ui.reset(); this.refresh(); return; }
    if (this.state.complete) return;
    if (action === 'flavor') return this.select(flavor as Flavor);
    if (action === 'batch' && this.state.selectCake(this.state.active, Number(cake))) { this.ui.select(this.state.active, this.state.cakes[this.state.active].division); this.refresh(); return; }
    if (action === 'minus' || action === 'plus') {
      const next = Math.max(2, Math.min(12, (Number(this.ui.input.value) || 4) + (action === 'plus' ? 1 : -1)));
      this.ui.input.value = String(next); this.ui.input.setCustomValidity(''); return;
    }
    if (action === 'spread') { this.spread = !this.spread; this.refresh(); }
    if (action === 'take' || action === 'whole') this.pick({ flavor: this.state.active, cakeId: this.state.cakes[this.state.active].id, ids: [action === 'whole' ? 0 : Number(id)], tray: false, shelf: false, whole: action === 'whole' });
    if (action === 'return') this.pick({ flavor: flavor as Flavor, cakeId: Number(cake), ids: ids!.split(',').map(Number), tray: true, shelf: false });
    if (action === 'simplify' && this.state.simplify(flavor as Flavor)) { this.ui.say(`${flavorInfo(flavor as Flavor).name} pieces joined. Same amount of cake!`, 'success'); this.chime(); this.refresh(); }
    if (action === 'clear') { this.state.clear(); this.ui.say(''); this.refresh(); }
    if (action === 'serve') this.serve();
  }
  select(flavor: Flavor) { this.state.active = flavor; this.ui.select(flavor, this.state.cakes[flavor].division); this.ui.say(''); this.refresh(); }
  pick(selection: Selection) {
    if (this.locked || this.state.complete) return;
    if (selection.shelf) return this.select(selection.flavor);
    if (this.scene.busy(selection.flavor, selection.ids, selection.cakeId)) return;
    const changed = selection.tray ? this.state.returnPiece(selection.flavor, selection.ids, selection.cakeId) : selection.whole ? this.state.takeWhole(selection.flavor, selection.cakeId) : this.state.take(selection.flavor, selection.ids[0], selection.cakeId);
    if (changed) {
      if (selection.tray || this.state.cakes[selection.flavor].id !== selection.cakeId) {
        this.spread = selection.tray && this.state.cakes[selection.flavor].division > 0;
        this.ui.select(this.state.active, this.state.cakes[this.state.active].division);
      }
      this.ui.say(''); this.chime(520); this.refresh();
    } else if (!selection.tray && this.state.trayFull) this.ui.say('All seven plates are in use. Return a portion to free a plate.');
  }
  async cut() {
    if (this.locked || this.state.complete) return;
    const count = Number(this.ui.input.value);
    if (!Number.isInteger(count) || count < 2 || count > 12) {
      this.ui.input.setCustomValidity('Choose a whole number from 2 to 12.'); this.ui.input.reportValidity(); return;
    }
    this.ui.pending[this.state.active] = count;
    const cake = this.state.cakes[this.state.active];
    if (cake.division) {
      this.locked = true; this.state.restoreCurrent();
      this.spread = false; this.refresh(); await this.pause(650);
      if (this.disposed) return;
    }
    this.state.cut(this.state.active, count);
    this.locked = false; this.spread = true; this.ui.say(''); this.chime(650); this.refresh();
  }
  async serve() {
    const mismatch = this.state.mismatch();
    if (mismatch) { this.ui.say(mismatch); return; }
    this.locked = true; this.ui.say(`Thank you! ${this.state.order.guest}'s cake is ready.`, 'success');
    this.ui.render(this.state, this.spread, this.locked); this.chime(780);
    this.scene.flyOrderRight();
    await this.pause(180);
    if (this.disposed) return;
    await this.scene.guestExit();
    if (this.disposed) return;
    this.state.serve(); this.spread = false;
    this.ui.select(this.state.active); this.refresh();
    if (!this.state.complete) await this.scene.guestEntrance();
    if (this.disposed) return;
    this.locked = false; this.ui.say(''); this.ui.render(this.state, this.spread, this.locked);
  }
  pause(ms: number) { return new Promise<void>((resolve) => setTimeout(resolve, this.scene.motion.reduced ? 0 : ms)); }
  toggleSound(button: HTMLElement) {
    this.muted = !this.muted;
    button.innerHTML = `<i class="fa-solid fa-volume-${this.muted ? 'xmark' : 'high'}" aria-hidden="true"></i>`;
    button.setAttribute('aria-pressed', String(!this.muted));
    button.setAttribute('aria-label', this.muted ? 'Turn sound on' : 'Turn sound off');
    button.title = this.muted ? 'Turn sound on' : 'Turn sound off';
    if (!this.muted) this.chime();
  }
  chime(frequency = 600) {
    if (this.muted) return;
    this.sound ??= new AudioContext(); this.sound.resume();
    const oscillator = this.sound.createOscillator(), gain = this.sound.createGain(), now = this.sound.currentTime;
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.035, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    oscillator.connect(gain); gain.connect(this.sound.destination); oscillator.start(); oscillator.stop(now + 0.18);
  }
  dispose() { this.disposed = true; this.scene.dispose(); this.sound?.close(); }
}
