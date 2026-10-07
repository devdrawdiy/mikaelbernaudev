import '@fortawesome/fontawesome-free/css/all.min.css';
import { Controller } from './controller';
import { t } from './i18n';
const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
let controller: Controller | undefined;
let animation = 0;
try {
  controller = new Controller(canvas);
  let last = performance.now();
  const frame = (now: number) => {
    controller!.scene.render(Math.min((now - last) / 1000, 0.05), now / 1000);
    last = now; animation = requestAnimationFrame(frame);
  };
  animation = requestAnimationFrame(frame);
} catch (error) {
  document.querySelector('#message')!.textContent = t('startupError');
  console.error(error);
}
function dispose() { cancelAnimationFrame(animation); controller?.dispose(); }
window.addEventListener('pagehide', (event) => { if (!event.persisted) dispose(); });
if (import.meta.hot) import.meta.hot.dispose(dispose);
