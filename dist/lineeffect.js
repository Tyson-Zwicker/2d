import { Vec } from './geometry.js';
import { Camera, View } from './view.js';
import { Main } from './main.js';
export class LineEffect {
    startPoint;
    endPoint;
    color;
    thickness;
    durationInSeconds;
    life;
    constructor(startPoint, endPoint, color, thickness, durationInSeconds) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.color = color;
        this.thickness = thickness;
        this.durationInSeconds = durationInSeconds;
        this.life = durationInSeconds;
    }
    render() {
        const screenPoint0 = Vec.add(Vec.scale(Vec.sub(this.startPoint, Camera), Camera.zoom), View.screenCenter);
        const screenPoint1 = Vec.add(Vec.scale(Vec.sub(this.endPoint, Camera), Camera.zoom), View.screenCenter);
        const opacity = Math.floor(15 * (this.life / this.durationInSeconds));
        const color = this.color + opacity.toString(16);
        const oldstroke = View.context.strokeStyle;
        View.context.strokeStyle = color;
        View.context.lineWidth = this.thickness;
        View.context.beginPath();
        View.context.moveTo(screenPoint0.x, screenPoint0.y);
        View.context.lineTo(screenPoint1.x, screenPoint1.y);
        View.context.stroke();
        this.life -= Main.delta;
        const stillAlive = this.life > 0 && opacity > 0;
        View.context.strokeStyle = oldstroke;
        return stillAlive;
    }
}
//# sourceMappingURL=lineeffect.js.map