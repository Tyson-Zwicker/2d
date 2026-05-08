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
  private _lastOpacity: number = -1;
  private _cachedColor: string = '';

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
    const opacity = Math.floor(this.life * this.opacityScale);
    if (opacity !== this._lastOpacity) {
      this._cachedColor = this.color + opacity.toString(16);
      this._lastOpacity = opacity;
    }
    const p0: Point = { x: worldStartPoint.x, y: worldStartPoint.y };
    Vec.subInPlace(p0, Camera);
    Vec.scaleInPlace(p0, Camera.zoom);
    Vec.addInPlace(p0, View.screenCenter);
    const p1: Point = { x: worldEndPoint.x, y: worldEndPoint.y };
    Vec.subInPlace(p1, Camera);
    Vec.scaleInPlace(p1, Camera.zoom);
    Vec.addInPlace(p1, View.screenCenter);

    View.context.strokeStyle = this._cachedColor;
    View.context.lineWidth = this.thickness;
    View.context.beginPath();
    View.context.moveTo(p0.x, p0.y);
    View.context.lineTo(p1.x, p1.y);
    View.context.stroke();

    this.life -= Main.delta;
    const stillAlive = this.life > 0 && opacity > 0;
    return stillAlive;
  }
}
