import { Point, Vec } from './geometry.js';
import { Camera, View } from './view.js';
import { Main } from './main.js';
import { Effect, EffectAnchor, resolveEffectAnchor } from './effects.js';

export class CircleEffect implements Effect {
  static nextID: number = 0;

  anchor: EffectAnchor;
  radiusAtStart: number;
  radiusNow: number;
  expansionRate: number;
  color: string;
  maxLife: number;
  opacityScale: number;
  startAngleDegrees: number | undefined;
  endAngleDegrees: number | undefined;
  startAngleRadians: number;
  endAngleRadians: number;
  life: number;
  id: number;
  private _lastOpacity: number = -1;
  private _cachedColor: string = '';

  constructor(
    anchor: EffectAnchor,
    initialRadius: number,
    expansionRate: number,
    color: string,
    durationInSeconds: number,
    startAngle?: number,
    endAngle?: number
  ) {
    const safeMaxLife = durationInSeconds > 0 ? durationInSeconds : Number.EPSILON;
    this.anchor = anchor;
    this.radiusAtStart = initialRadius;
    this.radiusNow = initialRadius;
    this.expansionRate = expansionRate;
    this.color = color;
    this.maxLife = safeMaxLife;
    this.opacityScale = 15 / safeMaxLife;
    this.startAngleDegrees = startAngle;
    this.endAngleDegrees = endAngle;
    this.startAngleRadians = startAngle === undefined ? 0 : startAngle * (Math.PI / 180);
    this.endAngleRadians = endAngle === undefined ? Math.PI * 2 : endAngle * (Math.PI / 180);
    this.life = safeMaxLife;
    this.id = CircleEffect.nextID++;
  }

  render(): boolean {
    const worldPosition = resolveEffectAnchor(this.anchor);
    const opacity = Math.floor(this.life * this.opacityScale);
    if (opacity !== this._lastOpacity) {
      this._cachedColor = this.color + opacity.toString(16);
      this._lastOpacity = opacity;
    }
    const p: Point = { x: worldPosition.x, y: worldPosition.y };
    Vec.subInPlace(p, Camera);
    Vec.scaleInPlace(p, Camera.zoom);
    Vec.addInPlace(p, View.screenCenter);
    const zoomedRadius = this.radiusNow * Camera.zoom;

    View.context.fillStyle = this._cachedColor;
    View.context.beginPath();
    View.context.ellipse(
      p.x,
      p.y,
      zoomedRadius,
      zoomedRadius,
      0,
      this.startAngleRadians,
      this.endAngleRadians
    );
    View.context.fill();

    this.radiusNow += this.expansionRate * Main.delta;
    this.life -= Main.delta;
    return this.life > 0 && opacity > 0;
  }
}
