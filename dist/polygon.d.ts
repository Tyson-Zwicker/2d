import { Point } from './geometry.js';
import { Mien } from './mien.js';
export declare class Polygon {
    points: Point[];
    mien: Mien;
    constructor(points: Point[], mien?: Mien);
    static fromArray(points: number[][], mien?: Mien): Polygon;
    static translate(polygon: Polygon, vector: Point): Polygon;
    static flipVertical(polygon: Polygon): Polygon;
    static flipHorizontal(polygon: Polygon): Polygon;
    static scale(polygon: Polygon, scale: number): Polygon;
    static rotate(polygon: Polygon, angle: number): Polygon;
    static regular(sides: number, radius: number, mien?: Mien): Polygon;
}
//# sourceMappingURL=polygon.d.ts.map