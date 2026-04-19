import { Point, LineSeg, RectBounds } from './geometry.js';
/**
 * Random number utilities
 */
export declare class Rnd {
    static bool(): boolean;
    static int(min?: number, max?: number): number;
    static float(min?: number, max?: number): number;
    static hex(min?: number, max?: number, digits?: number): string;
    static angle(center: number, span: number): number;
    static point(bounds: RectBounds): Point;
    static vec(minAngle: number, maxAngle: number, minMag: number, maxMag: number): Point;
    static ray(origin: Point, minAngle: number, maxAngle: number, minStart: number, maxStart: number, minLength: number, maxLength: number): LineSeg;
    /**
     * Generates a random saturated color in 3-char hex shorthand (#RGB).
     * @param min Minimum brightness for hex digits (0-14)
     * @returns A CSS color string like '#F00', '#0AB', etc.
     */
    static color(min: number): string;
}
//# sourceMappingURL=rnd.d.ts.map