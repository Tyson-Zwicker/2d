/** 2D point/vector with x and y coordinates */
export interface Point {
    x: number;
    y: number;
}
/** Polar coordinate with angle (degrees) and length */
export interface Polar {
    a: number;
    l: number;
}
/** Line segment defined by two endpoints */
export interface Line {
    p0: Point;
    p1: Point;
}
export declare class Vec {
    static readonly radians: number;
    static add(p0: Point, p1: Point): Point;
    static addInPlace(p0: Point, p1: Point): void;
    static sub(p0: Point, p1: Point): Point;
    static subInPlace(p0: Point, p1: Point): void;
    static magnitude(p: Point): number;
    static dist(p0: Point, p1: Point): number;
    static scale(p: Point, s: number): Point;
    static scaleInPlace(p: Point, s: number): void;
    static perp(p: Point): Point;
    static norm(v: Point): Point;
    static rotate(p: Point, θ: number): Point;
    static rotateInPlace(p: Point, θ: number): void;
    static dot(p0: Point, p1: Point): number;
    static cross(p0: Point, p1: Point): number;
    static equal(p0: Point, p1: Point, fixed?: number): boolean;
    static fromAngleAndMagnitude(θ: number, magnitude: number): Point;
    static fromPolar(polar: Polar): Point;
    static toPolar(p: Point): Polar;
    static trueBearingFromTo(p0: Point, p1: Point): number;
    static turnToFace(x0: number, y0: number, x1: number, y1: number, currentFacingAngle: number): number;
}
export declare class LineSeg {
    p0: Point;
    p1: Point;
    static ray(origin: Point, angle: number, startMagnitude: number, endMagnitude: number): Line;
    static angleBetweenLines(lineAStart: Point, lineAEnd: Point, lineBStart: Point, lineBEnd: Point): number | null;
    static lineIntersection(lineAStart: Point, lineAEnd: Point, lineBStart: Point, lineBEnd: Point): Point | null;
    static closestPointOnSegment(segmentStart: Point, segmentEnd: Point, point: Point): Point;
}
export declare class RectBounds {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    constructor(x0: number, y0: number, x1: number, y1: number);
    get width(): number;
    get height(): number;
    get area(): number;
    get isValid(): boolean;
    isPointInside(x: number, y: number): boolean;
    isPointOnEdge(x: number, y: number): boolean;
    touches(other: RectBounds): boolean;
}
//# sourceMappingURL=geometry.d.ts.map