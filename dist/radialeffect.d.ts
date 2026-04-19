import { Point } from './geometry.js';
import { Effect } from './effects.js';
export declare class RadialEffect implements Effect {
    point: Point;
    initialRadius: number;
    currentRadius: number;
    expansionRate: number;
    color: string;
    thickness: number;
    durationInSeconds: number;
    startAngle: number | undefined;
    endAngle: number | undefined;
    life: number;
    startAngleRadians: number;
    endAngleRadians: number;
    radius: number;
    constructor(point: Point, initialRadius: number, expansionRate: number, color: string, thickness: number, durationInSeconds: number, startAngle?: number, endAngle?: number);
    render(): boolean;
}
//# sourceMappingURL=radialeffect.d.ts.map