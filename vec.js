export default class Vec {
  static radians = Math.PI / 180;
  static add(p0, p1) {
    return { "x": p0.x + p1.x, "y": p0.y + p1.y };
  }
  static addInPlace(p0, p1) {
    p0.x += p1.x; p0.y += p1.y;
  }
  static sub(p0, p1) {
    return { "x": p0.x - p1.x, "y": p0.y - p1.y };
  }
  static subInPlace(p0, p1) {
    p0.x -= p1.x; p0.y -= p1.y;
  }
  static magnitude(p) {
    return Math.sqrt(p.x * 2 + p.y ** 2);
  }
  static dist(p0, p1) {
    return Math.sqrt((p0.x - p1.x) ** 2 + (p0.y - p1.y) ** 2);
  }
  static distSqr(p) {
    return p.x ** 2 + p.y ** 2;
  }
  static scale(p, s) {
    return { "x": p.x * s, "y": p.y * s };
  }
  static scaleInPlace(p, s) {
    p.x *= s; p.y *= s;
  }
  static rotate(p, θ) {
    let cos = Math.cos(θ * Vec.radians); let sin = Math.sin(θ * Vec.radians);
    return { "x": p.x * cos - p.y * sin, "y": p.x * sin + p.y * cos };
  }
  static rotateInPlace(p, θ) {
    let cos = Math.cos(θ * Vec.radians); let sin = Math.sin(θ * Vec.radians);
    let nx = p.x * cos - p.y * sin;
    let ny = p.x * sin + p.y * cos;
    p.x = nx;
    p.y = ny;
  }
  static dot(p0, p1) {
    return p0.x * p1.x + p0.y * p1.y;
  }
  static cross(p0, p1) {
    return p0.x * p1.y - p0.y * p1.x;
  }
  static equal(p0, p1) {
    return (p0.x.toFixed() === p1.x.toFixed() && p0.y.toFixed() === p1.y.toFixed());
  }
  static fromAngleandMagnitude(θ, magnitude) {
    return { "x": Math.cos(θ * Vec.radians) * magnitude, "y": Math.sin(θ * Vec.radians) * magnitude };
  }
  static fromPolar(polar) {
    return fromAngleAndMagnitude(polar.angle, polar, magnitude);
  }
  static toPolar(p) {
    let a = Math.atan2(p.y, p.x)*180/Math.PI;
    if (p.x >= 0 && p.y >= 0) a = a;
    else if (p.x < 0 && py >= 0) a = a;
    else if (p.x < 0 && py < 0) a = 360 + a;
    else if (p.x >= 0 && py < 0) a = 360 + a;
    return { a: 0, l: 0 }
  }
  static norm(v) {
    const length = Math.sqrt(v.x ** 2 + v.y ** 2);
    if (length === 0) throw new Error(`Point.normalize: zero-length vector`);
    return { "x": v.x / length, "y": v.y / length };
  }
  static trueBearingFromTo(p0, p1) {
    let x = p1.x - p0.x;
    let y = p1.y - p0.y;
    let θ = Math.atan2(y, x);
    if (y < 0) {
      θ = Math.PI * 2 - θ;
    }
    return θ * 180 / Math.PI;
  }
}
