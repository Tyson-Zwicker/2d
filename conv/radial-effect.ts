import { Point, Vec } from './geometry.js';
import { Camera, View } from './view.js';
import { Main } from './main.js';
import { Effect, EffectAnchor, resolveEffectAnchor } from './effects.js';

export class RadialEffect implements Effect {
  anchor: EffectAnchor;
  radiusAtStart: number;
  radiusNow: number;
  expansionRate: number;
  color: string;
  thickness: number;
  maxLife: number;
  opacityScale: number;
  startAngleDegrees: number | undefined;
  endAngleDegrees: number | undefined;
  startAngleRadians: number;
  endAngleRadians: number;
  life: number;

  constructor(
    anchor: EffectAnchor,
    initialRadius: number,
    expansionRate: number,
    color: string,
    thickness: number,
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
    this.thickness = thickness;
    this.maxLife = safeMaxLife;
    this.opacityScale = 15 / safeMaxLife;
    this.startAngleDegrees = startAngle;
    this.endAngleDegrees = endAngle;
    this.startAngleRadians = startAngle === undefined ? 0 : startAngle * (Math.PI / 180);
    this.endAngleRadians = endAngle === undefined ? Math.PI * 2 : endAngle * (Math.PI / 180);
    this.life = safeMaxLife;
  }

  render(): boolean {
    const worldPosition = resolveEffectAnchor(this.anchor);
    const opacity = Math.floor(this.life * this.opacityScale);
    const color = this.color + opacity.toString(16);
    const screenPoint = Vec.add(
      Vec.scale(Vec.sub(worldPosition, Camera), Camera.zoom),
      View.screenCenter
    );
    const zoomedRadius = this.radiusNow * Camera.zoom;

    View.context.strokeStyle = color;
    View.context.lineWidth = this.thickness;
    View.context.beginPath();
    View.context.ellipse(
      screenPoint.x,
      screenPoint.y,
      zoomedRadius,
      zoomedRadius,
      0,
      this.startAngleRadians,
      this.endAngleRadians
    );
    View.context.stroke();

    this.radiusNow += this.expansionRate * Main.delta;
    this.life -= Main.delta;
    return this.life > 0 && opacity > 0;
  }
}
