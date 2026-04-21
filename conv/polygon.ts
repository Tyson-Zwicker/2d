import { Point, Vec } from './geometry.js';
import { Mien } from './mien.js';

export class Polygon {
  points: Point[];
  mien: Mien;

  constructor(points: Point[], mien: Mien = Mien.Gray) {
    this.points = points;
    this.mien = mien;
  }
  static fromArray(points: number[][],mien: Mien = Mien.Gray) {
    const r : Point[] =  [];
    for (let p = 0; p < points.length; p++) {
      if (points[p].length === 2) {
        r.push({ x: points[p][0], y: points[p][1] });
      } else throw new Error(`Polygon.fromArray: bad element at [${p}]`);
    }
    return new Polygon (r, mien);
  }
  static translate(polygon: Polygon, vector: Point): Polygon {
    const pts: Point[] = [];
    for (const p of polygon.points) {
      pts.push(Vec.add(vector, p));
    }
    return new Polygon(pts, polygon.mien);
  }

  static flipVertical(polygon: Polygon): Polygon {
    const pts: Point[] = [];
    for (const p of polygon.points) {
      pts.push({ x: p.x, y: p.y * -1 });
    }
    return new Polygon(pts, polygon.mien);
  }

  static flipHorizontal(polygon: Polygon): Polygon {
    const pts: Point[] = [];
    for (const p of polygon.points) {
      pts.push({ x: p.x * -1, y: p.y });
    }
    return new Polygon(pts, polygon.mien);
  }

  static scale(polygon: Polygon, scale: number): Polygon {
    const pts: Point[] = [];
    for (const p of polygon.points) {
      pts.push(Vec.scale(p, scale));
    }
    return new Polygon(pts, polygon.mien);
  }

  static rotate(polygon: Polygon, angle: number): Polygon {
    const pts: Point[] = [];
    for (const p of polygon.points) {
      pts.push(Vec.rotate(p, angle));
    }
    return new Polygon(pts, polygon.mien);
  }

  static regular(sides: number, radius: number, mien: Mien = Mien.Gray): Polygon {
    const pts: Point[] = [];
    for (let a = 0; a < 360; a += 360 / sides) {
      a = Math.ceil(a);
      pts.push(Vec.fromAngleAndMagnitude(a, radius));
    }
    return new Polygon(pts, mien);
  }

}
