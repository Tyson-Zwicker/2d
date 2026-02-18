import View from './view.js';
export default class LineEffect {
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