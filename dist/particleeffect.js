import { Vec } from './geometry.js';
import { Camera, View } from './view.js';
import { Main } from './main.js';
import { Rnd } from './rnd.js';
export class ParticleEffect {
    position;
    velocity;
    color;
    thickness;
    durationInSeconds;
    life;
    constructor(position, velocity, color, thickness, durationInSeconds) {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.thickness = thickness;
        this.durationInSeconds = durationInSeconds;
        this.life = durationInSeconds;
    }
    render() {
        const opacity = Math.floor(15 * (this.life / this.durationInSeconds));
        const color = this.color + opacity.toString(16);
        View.context.fillStyle = color;
        const screenPoint = Vec.add(Vec.scale(Vec.sub(this.position, Camera), Camera.zoom), View.screenCenter);
        View.context.fillRect(screenPoint.x - this.thickness / 2, screenPoint.y - this.thickness / 2, this.thickness, this.thickness);
        this.life -= Main.delta;
        this.position = Vec.add(this.position, Vec.scale(this.velocity, Main.delta));
        const stillAlive = this.life > 0 && opacity > 0;
        return stillAlive;
    }
    static generateGroup(origin, angle, angleSpan, velMin, velMax, thickness, color, groupSize, durMin, durMax) {
        const particles = [];
        for (let i = 0; i < groupSize; i++) {
            const a1 = angle - angleSpan / 2;
            const a2 = angle + angleSpan / 2;
            const velocity = Rnd.vec(a1, a2, velMin, velMax);
            const duration = Rnd.float(durMin, durMax);
            particles.push(new ParticleEffect({ x: origin.x, y: origin.y }, velocity, color, thickness, duration));
        }
        return particles;
    }
}
//# sourceMappingURL=particleeffect.js.map