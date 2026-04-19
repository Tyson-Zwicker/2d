import { Point, Vec } from './geometry.js';
import { Camera, View } from './view.js';
import { Main } from './main.js';
import { Effect } from './effects.js';

export class RadialEffect implements Effect {
  point: Point;
  initialRadius: number;
  currentRadius: number;
  expansionRate: number;
  color: string;
  thickness: number;
  durationInSeconds: number;
  startAngle: number | undefined;
  endAngle: number | undefined;
  life: number;
  startAngleRadians: number;
  endAngleRadians: number;
  radius: number;

  constructor(
    point: Point,
    initialRadius: number,
    expansionRate: number,
    color: string,
    thickness: number,
    durationInSeconds: number,
    startAngle?: number,
    endAngle?: number
  ) {
    this.point = point;
    this.initialRadius = initialRadius;
    this.currentRadius = initialRadius;
    this.expansionRate = expansionRate;
    this.color = color;
    this.thickness = thickness;
    this.durationInSeconds = durationInSeconds;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.life = durationInSeconds;
    if (startAngle === undefined) {
      this.startAngleRadians = 0;
      this.endAngleRadians = Math.PI * 2;
    } else {
      this.startAngleRadians = startAngle * (Math.PI / 180);
      this.endAngleRadians = endAngle! * (Math.PI / 180);
    }
    this.radius = initialRadius;
  }

  render(): boolean {
    const opacity = Math.floor(15 * (this.life / this.durationInSeconds));
    const color = this.color + opacity.toString(16);
    View.context.strokeStyle = color;
    const screenPoint = Vec.add(
      Vec.scale(Vec.sub(this.point, Camera), Camera.zoom),
      View.screenCenter
    );
    const zoomedRadius = this.radius * Camera.zoom;
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
    this.radius += this.expansionRate * Main.delta;
    this.life -= Main.delta;
    return this.life > 0 && opacity > 0;
  }
}
