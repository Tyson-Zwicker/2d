import View from './view.js';
import Vec from './vec.js';
import Main from './main.js';
export default class LineEffect {
  life = undefined;
  constructor(startPoint, endPoint, color, thickness, durationInSeconds) {//Points should be in World Coordinates.
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.color = color;
    this.thickness = thickness;
    this.durationInSeconds = durationInSeconds;
    this.life = durationInSeconds;    
  }
  render() {
    let screenPoint0 = Vec.add(Vec.scale(Vec.sub(this.startPoint, View.camera), View.camera.zoom), View.screenCenter);
    let screenPoint1 = Vec.add(Vec.scale(Vec.sub(this.endPoint, View.camera), View.camera.zoom), View.screenCenter);
    let opacity = Math.floor (15 * (this.life/ this.durationInSeconds));    
    let color = this.color + opacity.toString(16);
    View.context.strokeStyle = color;
    View.context.lineWidth = this.thickness;
    View.context.beginPath();
    View.context.moveTo(screenPoint0.x, screenPoint0.y);
    View.context.lineTo(screenPoint1.x, screenPoint1.y);
    View.context.stroke();
    this.life -= Main.delta;
    let stillAlive = (this.life > 0 && opacity>0)
    return stillAlive;
  }
}