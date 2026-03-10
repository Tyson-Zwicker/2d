
import View from './view.js';
import Rnd from './rnd.js';
import Main from './main.js';
import Vec from './vec.js';
export default class ParticleEffect {
  constructor(position, velocity, color, thickness, durationInSeconds) {
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.thickness = thickness;
    this.durationInSeconds = durationInSeconds;
    this.life = durationInSeconds;
  }
  render() {
    let opacity = Math.floor (15 * (this.life/ this.durationInSeconds));
    let color = this.color + opacity.toString(16);
    View.context.fillStyle = color;
    let screenPoint = Vec.add(Vec.scale(Vec.sub(this.position, View.camera), View.camera.zoom), View.screenCenter);    
    View.context.fillRect(screenPoint.x - this.thickness / 2, screenPoint.y - this.thickness / 2, this.thickness, this.thickness);
    this.life -= Main.delta;
    this.position = Vec.add(this.position, Vec.scale(this.velocity, Main.delta));    
    let stillAlive = (this.life > 0 && opacity>0)
    return stillAlive;
  }
  static generateGroup(origin, angle, angleSpan, velMin, velMax, thickness, color, groupSize, durMin, durMax) {
    let particles = [];
    for (let i = 0; i < groupSize; i++) {
      let velocity = Rnd.vec (angle-angleSpan/2, angle+angleSpan/2,velMin, velMax);
      let duration = Rnd.float (durMin, durMax);
      particles.push(
        new ParticleEffect (origin, velocity, color, thickness, duration)
      );
    }
    return particles;
  }
}