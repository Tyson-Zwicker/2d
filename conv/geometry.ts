// Geometry Library - Unified TypeScript Module

// ============================================================================
// Interfaces
// ============================================================================

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

// ============================================================================
// Vec - 2D Vector Operations
// ============================================================================

export class Vec {
  static readonly radians = Math.PI / 180;

  static add(p0: Point, p1: Point): Point {
    return { x: p0.x + p1.x, y: p0.y + p1.y };
  }

  static addInPlace(p0: Point, p1: Point): void {
    p0.x += p1.x;
    p0.y += p1.y;
  }

  static sub(p0: Point, p1: Point): Point {
    return { x: p0.x - p1.x, y: p0.y - p1.y };
  }

  static subInPlace(p0: Point, p1: Point): void {
    p0.x -= p1.x;
    p0.y -= p1.y;
  }

  static magnitude(p: Point): number {
    return Math.sqrt(p.x ** 2 + p.y ** 2);
  }

  static dist(p0: Point, p1: Point): number {
    return Math.sqrt((p0.x - p1.x) ** 2 + (p0.y - p1.y) ** 2);
  }

  static scale(p: Point, s: number): Point {
    return { x: p.x * s, y: p.y * s };
  }

  static scaleInPlace(p: Point, s: number): void {
    p.x *= s;
    p.y *= s;
  }

  static perp(p: Point): Point {
    return { x: -p.y, y: p.x };
  }

  static norm(v: Point): Point {
    const length = Math.sqrt(v.x ** 2 + v.y ** 2);
    if (length === 0) throw new Error(`Vec.normalize: zero-length vector`);
    return { x: v.x / length, y: v.y / length };
  }

  static rotate(p: Point, θ: number): Point {
    const cos = Math.cos(θ * Vec.radians);
    const sin = Math.sin(θ * Vec.radians);
    return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos };
  }

  static rotateInPlace(p: Point, θ: number): void {
    const cos = Math.cos(θ * Vec.radians);
    const sin = Math.sin(θ * Vec.radians);
    const nx = p.x * cos - p.y * sin;
    const ny = p.x * sin + p.y * cos;
    p.x = nx;
    p.y = ny;
  }

  static dot(p0: Point, p1: Point): number {
    return p0.x * p1.x + p0.y * p1.y;
  }

  static cross(p0: Point, p1: Point): number {
    return p0.x * p1.y - p0.y * p1.x;
  }

  static equal(p0: Point, p1: Point, fixed: number = 0): boolean {
    const epsilon = fixed === 0 ? 0 : 0.5 * 10 ** -fixed;
    return Math.abs(p0.x - p1.x) <= epsilon && Math.abs(p0.y - p1.y) <= epsilon;
  }

  static fromAngleAndMagnitude(θ: number, magnitude: number): Point {
    return {
      x: Math.cos(θ * Vec.radians) * magnitude,
      y: Math.sin(θ * Vec.radians) * magnitude,
    };
  }

  static fromPolar(polar: Polar): Point {
    return Vec.fromAngleAndMagnitude(polar.a, polar.l);
  }

  static toPolar(p: Point): Polar {
    let a = (Math.atan2(p.y, p.x) * 180) / Math.PI;
    if (p.x >= 0 && p.y >= 0) a = a;
    else if (p.x < 0 && p.y >= 0) a = a;
    else if (p.x < 0 && p.y < 0) a = 360 + a;
    else if (p.x >= 0 && p.y < 0) a = 360 + a;
    return { a: a, l: Vec.magnitude(p) };
  }

  static trueBearingFromTo(p0: Point, p1: Point): number {
    const x = p1.x - p0.x;
    const y = p1.y - p0.y;
    let a = Math.atan2(y, x);
    if (y < 0) {
      a = Math.PI * 2 + a;
    }
    return (a * 180) / Math.PI;
  }

  static turnToFace(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    currentFacingAngle: number
  ): number {
    const targetAngle = Math.atan2(y1 - y0, x1 - x0);
    let delta = targetAngle - currentFacingAngle * Vec.radians;
    delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
    if (delta <= -Math.PI) delta += 2 * Math.PI;
    return delta / Vec.radians;
  }
}

// ============================================================================
// LineSeg - Line Segment Operations
// ============================================================================

export class LineSeg {
  p0: Point = { x: 0, y: 0 };
  p1: Point = { x: 0, y: 0 };

  static ray(
    origin: Point,
    angle: number,
    startMagnitude: number,
    endMagnitude: number
  ): Line {
    const v0 = Vec.fromAngleAndMagnitude(angle, startMagnitude);
    const v1 = Vec.fromAngleAndMagnitude(angle, endMagnitude);
    return {
      p0: Vec.add(origin, v0),
      p1: Vec.add(origin, v1),
    };
  }

  static angleBetweenLines(
    lineAStart: Point,
    lineAEnd: Point,
    lineBStart: Point,
    lineBEnd: Point
  ): number | null {
    const v1 = { x: lineAEnd.x - lineAStart.x, y: lineAEnd.y - lineAStart.y };
    const v2 = { x: lineBEnd.x - lineBStart.x, y: lineBEnd.y - lineBStart.y };
    const mag1 = Math.hypot(v1.x, v1.y);
    const mag2 = Math.hypot(v2.x, v2.y);
    if (mag1 < 1e-6 || mag2 < 1e-6) {
      return null;
    }
    const dot = v1.x * v2.x + v1.y * v2.y;
    const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(cosTheta);
  }

  static lineIntersection(
    lineAStart: Point,
    lineAEnd: Point,
    lineBStart: Point,
    lineBEnd: Point
  ): Point | null {
    const r = { x: lineAEnd.x - lineAStart.x, y: lineAEnd.y - lineAStart.y };
    const s = { x: lineBEnd.x - lineBStart.x, y: lineBEnd.y - lineBStart.y };
    const denom = r.x * s.y - r.y * s.x;
    if (Math.abs(denom) < 1e-6) {
      return null;
    }
    const u =
      ((lineBStart.x - lineAStart.x) * r.y -
        (lineBStart.y - lineAStart.y) * r.x) /
      denom;
    const t =
      ((lineBStart.x - lineAStart.x) * s.y -
        (lineBStart.y - lineAStart.y) * s.x) /
      denom;
    if (t < 0 || t > 1 || u < 0 || u > 1) {
      return null;
    }
    return {
      x: lineAStart.x + t * r.x,
      y: lineAStart.y + t * r.y,
    };
  }

  static closestPointOnSegment(
    segmentStart: Point,
    segmentEnd: Point,
    point: Point
  ): Point {
    const segmentVector = {
      x: segmentEnd.x - segmentStart.x,
      y: segmentEnd.y - segmentStart.y,
    };
    const pointVector = {
      x: point.x - segmentStart.x,
      y: point.y - segmentStart.y,
    };
    const segmentLengthSq =
      segmentVector.x * segmentVector.x + segmentVector.y * segmentVector.y;
    if (segmentLengthSq < 1e-6) {
      return { x: segmentStart.x, y: segmentStart.y };
    }
    const projection =
      (pointVector.x * segmentVector.x + pointVector.y * segmentVector.y) /
      segmentLengthSq;
    const clamped = Math.max(0, Math.min(1, projection));
    return {
      x: segmentStart.x + segmentVector.x * clamped,
      y: segmentStart.y + segmentVector.y * clamped,
    };
  }
}

// ============================================================================
// Bounds - Rectangular Bounds Operations
// ============================================================================

export class RectBounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;

  constructor(x0: number, y0: number, x1: number, y1: number) {
    if (isNaN(x0 + y0 + x1 + y1)) {
      throw new Error(`Invalid boundary (${x0},${y0},${x1},${y1})`);
    }
    if (x1 - x0 > 0 && y1 - y0 > 0) {
      this.x0 = x0;
      this.x1 = x1;
      this.y0 = y0;
      this.y1 = y1;
    } else if (x1 - x0 < 0 && y1 - y0 > 0) {
      this.x0 = x1;
      this.x1 = x0;
      this.y0 = y0;
      this.y1 = y1;
    } else if (x1 - x0 > 0 && y1 - y0 < 0) {
      this.x0 = x0;
      this.x1 = x1;
      this.y0 = y1;
      this.y1 = y0;
    } else if (x1 - x0 < 0 && y1 - y0 < 0) {
      this.x0 = x1;
      this.x1 = x0;
      this.y0 = y1;
      this.y1 = y0;
    } else {
      throw new Error(`Invalid boundary (${x0},${y0},${x1},${y1})`);
    }
  }
  static fromCenterAndSize(x: number, y: number, width: number, height: number) {
    return { x0: x - width / 2, y0: y - height / 2, x1: x + width / 2, y1: y + height / 2 } as RectBounds;
  }
  setWithTrust(x0: number, y0: number, x1: number, y1: number) {
    return { x0, y0, x1, y1 } as RectBounds;
  }
  get width(): number {
    return this.x1 - this.x0;
  }

  get height(): number {
    return this.y1 - this.y0;
  }

  get area(): number {
    return this.width * this.height;
  }

  get isValid(): boolean {
    return (
      this.x1 > this.x0 &&
      this.y1 > this.y0 &&
      !isNaN(this.x0 + this.x1 + this.y0 + this.y1)
    );
  }

  isPointInside(x: number, y: number): boolean {
    return x > this.x0 && x < this.x1 && y > this.y0 && y < this.y1;
  }

  isPointOnEdge(x: number, y: number): boolean {
    if (x === this.x0 && y > this.y0 && y < this.y1) return true;
    if (x === this.x1 && y > this.y0 && y < this.y1) return true;
    if (y === this.y0 && x > this.x0 && x < this.x1) return true;
    if (y === this.y1 && x > this.x0 && x < this.x1) return true;
    return false;
  }

  touches(other: RectBounds): boolean {
    if (!other) return false;
    const horizontalOverlap = this.x0 <= other.x1 && this.x1 >= other.x0;
    const verticalOverlap = this.y0 <= other.y1 && this.y1 >= other.y0;
    return horizontalOverlap && verticalOverlap;
  }
}
