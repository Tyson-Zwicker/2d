import { Vec } from './geometry.js';
import { Camera, View } from './view.js';
import { Main } from './main.js';
export class CircleEffect {
    static nextID = 0;
    point;
    initialRadius;
    currentRadius;
    expansionRate;
    color;
    durationInSeconds;
    startAngle;
    endAngle;
    life;
    startAngleRadians;
    endAngleRadians;
    radius;
    id;
    constructor(point, initialRadius, expansionRate, color, durationInSeconds, startAngle, endAngle) {
        this.point = point;
        this.initialRadius = initialRadius;
        this.currentRadius = initialRadius;
        this.expansionRate = expansionRate;
        this.color = color;
        this.durationInSeconds = durationInSeconds;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.life = durationInSeconds;
        if (startAngle === undefined) {
            this.startAngleRadians = 0;
            this.endAngleRadians = Math.PI * 2;
        }
        else {
            this.startAngleRadians = startAngle * (Math.PI / 180);
            this.endAngleRadians = endAngle * (Math.PI / 180);
        }
        this.radius = initialRadius;
        this.id = CircleEffect.nextID++;
    }
    render() {
        const opacity = Math.floor(15 * (this.life / this.durationInSeconds));
        const color = this.color + opacity.toString(16);
        const screenPoint = Vec.add(Vec.scale(Vec.sub(this.point, Camera), Camera.zoom), View.screenCenter);
        const zoomedRadius = this.radius * Camera.zoom;
        View.context.fillStyle = color;
        View.context.beginPath();
        View.context.ellipse(screenPoint.x, screenPoint.y, zoomedRadius, zoomedRadius, 0, this.startAngleRadians, this.endAngleRadians);
        View.context.fill();
        this.radius += this.expansionRate * Main.delta;
        this.life -= Main.delta;
        return this.life > 0 && opacity > 0;
    }
}
//# sourceMappingURL=circleeffect.js.map