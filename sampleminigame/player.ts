const SPEED = 300;
const SIZE = 32;

export class Player {
   private x = 100;
   private y = 100;

   update(keys: Set<string>, dt: number) {
      this.x += this.axis(keys, "ArrowLeft", "ArrowRight") * SPEED * dt;
      this.y += this.axis(keys, "ArrowUp", "ArrowDown") * SPEED * dt;
   }

   draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = "#6cf";
      ctx.fillRect(this.x, this.y, SIZE, SIZE);
   }

   private axis(keys: Set<string>, neg: string, pos: string) {
      return Number(keys.has(pos)) - Number(keys.has(neg));
   }
}
