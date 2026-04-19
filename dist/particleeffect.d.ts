import { Point } from './geometry.js';
import { Effect } from './effects.js';
export declare class ParticleEffect implements Effect {
    position: Point;
    velocity: Point;
    color: string;
    thickness: number;
    durationInSeconds: number;
    life: number;
    constructor(position: Point, velocity: Point, color: string, thickness: number, durationInSeconds: number);
    render(): boolean;
    static generateGroup(origin: Point, angle: number, angleSpan: number, velMin: number, velMax: number, thickness: number, color: string, groupSize: number, durMin: number, durMax: number): ParticleEffect[];
}
//# sourceMappingURL=particleeffect.d.ts.map