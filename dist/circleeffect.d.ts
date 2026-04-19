import { Point } from './geometry.js';
import { Effect } from './effects.js';
export declare class CircleEffect implements Effect {
    static nextID: number;
    point: Point;
    initialRadius: number;
    currentRadius: number;
    expansionRate: number;
    color: string;
    durationInSeconds: number;
    startAngle: number | undefined;
    endAngle: number | undefined;
    life: number;
    startAngleRadians: number;
    endAngleRadians: number;
    radius: number;
    id: number;
    constructor(point: Point, initialRadius: number, expansionRate: number, color: string, durationInSeconds: number, startAngle?: number, endAngle?: number);
    render(): boolean;
}
//# sourceMappingURL=circleeffect.d.ts.map