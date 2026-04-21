import { Vec } from './geometry.js';
import { Mien } from './mien.js';
export class Polygon {
    points;
    mien;
    constructor(points, mien = Mien.Gray) {
        this.points = points;
        this.mien = mien;
    }
    static fromArray(points, mien = Mien.Gray) {
        const r = [];
        for (let p = 0; p < points.length; p++) {
            if (points[p].length === 2) {
                r.push({ x: points[p][0], y: points[p][1] });
            }
            else
                throw new Error(`Polygon.fromArray: bad element at [${p}]`);
        }
        return new Polygon(r, mien);
    }
    static translate(polygon, vector) {
        const pts = [];
        for (const p of polygon.points) {
            pts.push(Vec.add(vector, p));
        }
        return new Polygon(pts, polygon.mien);
    }
    static flipVertical(polygon) {
        const pts = [];
        for (const p of polygon.points) {
            pts.push({ x: p.x, y: p.y * -1 });
        }
        return new Polygon(pts, polygon.mien);
    }
    static flipHorizontal(polygon) {
        const pts = [];
        for (const p of polygon.points) {
            pts.push({ x: p.x * -1, y: p.y });
        }
        return new Polygon(pts, polygon.mien);
    }
    static scale(polygon, scale) {
        const pts = [];
        for (const p of polygon.points) {
            pts.push(Vec.scale(p, scale));
        }
        return new Polygon(pts, polygon.mien);
    }
    static rotate(polygon, angle) {
        const pts = [];
        for (const p of polygon.points) {
            pts.push(Vec.rotate(p, angle));
        }
        return new Polygon(pts, polygon.mien);
    }
    static regular(sides, radius, mien = Mien.Gray) {
        const pts = [];
        for (let a = 0; a < 360; a += 360 / sides) {
            a = Math.ceil(a);
            pts.push(Vec.fromAngleAndMagnitude(a, radius));
        }
        return new Polygon(pts, mien);
    }
}
//# sourceMappingURL=polygon.js.map