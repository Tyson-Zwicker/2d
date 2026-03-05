
import View from './view.js';
import Main from './main.js';
import Vec from './vec.js';

export default class RadialEffect {
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
    if (startAngle === undefined) {
      this.startAngleRadians = 0;
      this.endAngleRadians = Math.PI * 2;
    } else {
      this.startAngleRadians = startAngle * (Math.PI / 180);
      this.endAngleRadians = endAngle * (Math.PI / 180);
    }
    this.radius = initialRadius;
  }
  render() {
    let opacity = Math.floor(15 * (this.life / this.durationInSeconds));
    let color = this.color + opacity.toString(16);
    View.context.strokeStyle = color;
    let screenPoint = Vec.add(Vec.scale(Vec.sub(this.point, View.camera), View.camera.zoom), View.screenCenter);
    let zoomedRadius = this.radius * View.camera.zoom;
    View.context.lineWidth = this.thickness;
    View.context.beginPath();
    View.context.ellipse(screenPoint.x, screenPoint.y, zoomedRadius, zoomedRadius, 0, this.startAngleRadians, this.endAngleRadians);
    View.context.stroke();
    this.radius += this.expansionRate * Main.delta;
    this.life -= Main.delta;
    return (this.life > 0 && opacity>0);
  }
}