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
    const worldPosition = Vec.add(anchorWorldPosition, this.offset);
    const opacity = Math.floor(this.life * this.opacityScale);
    const color = this.color + opacity.toString(16);
    View.context.fillStyle = color;

    const screenPoint = Vec.add(
      Vec.scale(Vec.sub(worldPosition, Camera), Camera.zoom),
      View.screenCenter
    );
    View.context.fillRect(
      screenPoint.x - this.thickness / 2,
      screenPoint.y - this.thickness / 2,
      this.thickness,
      this.thickness
    );

    this.life -= Main.delta;
    this.offset = Vec.add(this.offset, Vec.scale(this.velocity, Main.delta));
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
