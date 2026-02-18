import View from './view.js';
import Main from './main.js';
import Rnd from './rnd.js';

export default class Effects {
  foreground = [];
  background = [];

  addForeground(effect) {
    this.foreground.push(effect);
  }
  addBackground(effect) {
    this.background.push (effect);
  }
  renderForeground() {
    let survivors = [];
    for (let effect of this.foreground) {
      if (effect.render()) survivors.push(effect);
    }
    this.foreground = survivors;
  }
  renderBackground() {
    let survivors = [];
    for (let effect of this.background) {
      if (effect.render()) survivors.push(effect);
    }
    this.background = survivors;
  }
}
export class LineEffect {
  life = undefined;
  constructor(startPoint, endPoint, color, thickness, durationInSeconds) {//Points should be in World Coordinates.
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.initialRadius = initialRadius;
    this.expansionRate = expansionRate;
    this.color = color;
    this.thickness = thickness;
    this.durationInSeconds = durationInSeconds;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.life = durationInSeconds;

  }
  render() {
    let screenPoint0 = Vec.add(Vec.scale(Vec.sub(this.startPoint, View.camera), View.camera.zoom), View.screenCenter);
    let screenPoint1 = Vec.add(Vec.scale(Vec.sub(this.endPoint, View.camera), View.camera.zoom), View.screenCenter);
    let opacity = 16 * (this.durationInSeconds / this.life);
    View.context.strokeStyle = this.color + opacity.toString(16);
    View.context.lineWidth = this.thickness;
    context.beginPath();
    context.moveTo(screenPoint0.x, screenPoint0.y);
    context.lineTo(screenPoint1.x, screenPoint1.y);
    context.stroke();
    this.life -= Main.delta;
    return (this.life > 0);
  }
}

export class RadialEffect {
  constructor(point, initialRadius, expansionRate, color, thickness, durationInSeconds, startAngle, endAngle) {
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
    if (isNaN(startAngle)) {
      this.startAngleRadians = 0;
      this.endAngleRadians = Math.PI * 2;
    }
    this.startAngleRadians = startAngle * (Math.PI / 180);
    this.endAngleRadians = endAngle * (Math.PI / 180);
  }
  render() {
    View.context.lineWidth = this.thickness;
    let opacity = 16 * (this.durationInSeconds / this.life);
    View.context.strokeStyle = this.color + opacity.toString(16);
    let screenPoint = Vec.add(Vec.scale(Vec.sub(this.point, View.camera), View.camera.zoom), View.screenCenter);
    let zoomedRadius = this.radius * Director.view.camera.zoom;
    context.context.ellipse(screenPoint.x, screenPoint.y, zoomedRadius, zoomedRadius, 0, this.startAngleRadians, this.endAngleRadians);
    context.stroke();
    this.life -= Main.delta;
    return (this.life > 0);
  }
}
class ParticleEffect {
  constructor(point, velocity, color, thickness, durationInSeconds) {
    this.point = point;
    this.initialRadius = initialRadius;
    this.velocity = velocity;
    this.color = color;
    this.thickness = thickness;
    this.durationInSeconds = durationInSeconds;
    this.life = durationInSeconds;
  }
  render() {
    let opacity = 16 * (this.durationInSeconds / this.life);
    View.context.fillStyle = this.color + opacity.toString(16);
    View.context.lineWidth = this.thickness;
    let screenPoint = Vec.add(Vec.scale(Vec.sub(this.point, View.camera), View.camera.zoom), View.screenCenter);
    context.fillRect(screenPoint.x - this.thickness / 2, screenPoint.y - this.thickness / 2, this.thickness, this.thickness);
    this.life -= Main.delta;
    this.position = Vec.add(this.position, this.velocity);
    return (this.life > 0);
  }
  generateGroup(origin, angle, angleSpan, velMin, velMax, thickness, color, groupSize, durMin, durMax) {
    let particles = [];
    for (let i = 0; i < groupSize; i++) {
      particles.push(new ParticleEffect(origin, Rnd.angle(angle, angleSpan), Rnd.float(velMin, velMax), color, thickness, Rnd.float(durMin, durMax)));
    }
    return particles;
  }
}
