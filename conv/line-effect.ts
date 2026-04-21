import { Point, Vec } from './geometry.js';
import { Camera, View } from './view.js';
import { Main } from './main.js';
import { Effect, EffectAnchor, resolveEffectAnchor } from './effects.js';

export class LineEffect implements Effect {
  startAnchor: EffectAnchor;
  endAnchor: EffectAnchor;
  color: string;
  thickness: number;
  maxLife: number;
  opacityScale: number;
  life: number;

  constructor(
    startAnchor: EffectAnchor,
    endAnchor: EffectAnchor,
    color: string,
    thickness: number,
    durationInSeconds: number
  ) {
    const safeMaxLife = durationInSeconds > 0 ? durationInSeconds : Number.EPSILON;
    this.startAnchor = startAnchor;
    this.endAnchor = endAnchor;
    this.color = color;
    this.thickness = thickness;
    this.maxLife = safeMaxLife;
    this.opacityScale = 15 / safeMaxLife;
    this.life = safeMaxLife;
  }

  render(): boolean {
    const worldStartPoint: Point = resolveEffectAnchor(this.startAnchor);
    const worldEndPoint: Point = resolveEffectAnchor(this.endAnchor);
    const screenPoint0 = Vec.add(
      Vec.scale(Vec.sub(worldStartPoint, Camera), Camera.zoom),
      View.screenCenter
    );
    const screenPoint1 = Vec.add(
      Vec.scale(Vec.sub(worldEndPoint, Camera), Camera.zoom),
      View.screenCenter
    );
    const opacity = Math.floor(this.life * this.opacityScale);
    const color = this.color + opacity.toString(16);
    const oldstroke = View.context.strokeStyle;

    View.context.strokeStyle = color;
    View.context.lineWidth = this.thickness;
    View.context.beginPath();
    View.context.moveTo(screenPoint0.x, screenPoint0.y);
    View.context.lineTo(screenPoint1.x, screenPoint1.y);
    View.context.stroke();

    this.life -= Main.delta;
    const stillAlive = this.life > 0 && opacity > 0;
    View.context.strokeStyle = oldstroke;
    return stillAlive;
  }
}
