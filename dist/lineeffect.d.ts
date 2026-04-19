import { Point } from './geometry.js';
import { Effect } from './effects.js';
export declare class LineEffect implements Effect {
    startPoint: Point;
    endPoint: Point;
    color: string;
    thickness: number;
    durationInSeconds: number;
    life: number;
    constructor(startPoint: Point, endPoint: Point, color: string, thickness: number, durationInSeconds: number);
    render(): boolean;
}
//# sourceMappingURL=lineeffect.d.ts.map