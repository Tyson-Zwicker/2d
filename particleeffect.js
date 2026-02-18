
import View from './view.js';
import Rnd from './rnd.js';
export default class ParticleEffect {
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