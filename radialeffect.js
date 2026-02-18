
import View from './view.js';

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