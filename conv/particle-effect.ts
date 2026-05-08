import { Point, Vec } from './geometry.js';
import { Camera, View } from './view.js';
import { Main } from './main.js';
import { Rnd } from './rnd.js';
import { Effect, EffectAnchor, resolveEffectAnchor } from './effects.js';

export class ParticleEffect implements Effect {
  anchor: EffectAnchor;
  offset: Point = { x: 0, y: 0 };
  velocity: Point;
  color: string;
  thickness: number;
  maxLife: number;
  opacityScale: number;
  life: number;
  private _lastOpacity: number = -1;
  private _cachedColor: string = '';

  constructor(
    anchor: EffectAnchor,
    velocity: Point,
    color: string,
    thickness: number,
    durationInSeconds: number
  ) {
    const safeMaxLife = durationInSeconds > 0 ? durationInSeconds : Number.EPSILON;
    this.anchor = anchor;
    this.velocity = velocity;
    this.color = color;
    this.thickness = thickness;
    this.maxLife = safeMaxLife;
    this.opacityScale = 15 / safeMaxLife;
    this.life = safeMaxLife;
  }

  render(): boolean {
    const anchorWorldPosition = resolveEffectAnchor(this.anchor);
    const opacity = Math.floor(this.life * this.opacityScale);
    if (opacity !== this._lastOpacity) {
      this._cachedColor = this.color + opacity.toString(16);
      this._lastOpacity = opacity;
    }
    View.context.fillStyle = this._cachedColor;

    const p: Point = { x: anchorWorldPosition.x + this.offset.x, y: anchorWorldPosition.y + this.offset.y };
    Vec.subInPlace(p, Camera);
    Vec.scaleInPlace(p, Camera.zoom);
    Vec.addInPlace(p, View.screenCenter);
    View.context.fillRect(
      p.x - this.thickness / 2,
      p.y - this.thickness / 2,
      this.thickness,
      this.thickness
    );

    this.life -= Main.delta;
    this.offset.x += this.velocity.x * Main.delta;
    this.offset.y += this.velocity.y * Main.delta;
    const stillAlive = this.life > 0 && opacity > 0;
    return stillAlive;
  }

  static generateGroup(
    origin: EffectAnchor,
    angle: number,
    angleSpan: number,
    velMin: number,
    velMax: number,
    thickness: number,
    color: string,
    groupSize: number,
    durMin: number,
    durMax: number
  ): ParticleEffect[] {
    const particles: ParticleEffect[] = [];
    for (let i = 0; i < groupSize; i++) {
      const a1 = angle - angleSpan / 2;
      const a2 = angle + angleSpan / 2;
      const velocity = Rnd.vec(a1, a2, velMin, velMax);
      const duration = Rnd.float(durMin, durMax);
      particles.push(new ParticleEffect(origin, velocity, color, thickness, duration));
    }
    return particles;
  }
}
