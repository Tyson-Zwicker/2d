import Vec from './vec.js';
export default class Line {
  p0 = { x: 0, y: 0 };
  p1 = { x: 0, y: 0 };
  static ray(origin, angle, startMagnitude, endMagnitude) {
    let v0 = Vec.fromAngleAndMagnitude(angle, startMagnitude);
    let v1 = Vec.fromAngleAndMagnitude(angle, endMagnitude);
    return {
      p0: Vec.add(origin, v0),
      p1: Vec.add(origin, v1)
    };
  }
  static angleBetweenLines(lineAStart, lineAEnd, lineBStart, lineBEnd) {
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


  static lineIntersection(lineAStart, lineAEnd, lineBStart, lineBEnd) {
    const r = { x: lineAEnd.x - lineAStart.x, y: lineAEnd.y - lineAStart.y };
    const s = { x: lineBEnd.x - lineBStart.x, y: lineBEnd.y - lineBStart.y };
    const denom = r.x * s.y - r.y * s.x;
    if (Math.abs(denom) < 1e-6) {
      return null;
    }
    const u =
      ((lineBStart.x - lineAStart.x) * r.y - (lineBStart.y - lineAStart.y) * r.x) / denom;
    const t =
      ((lineBStart.x - lineAStart.x) * s.y - (lineBStart.y - lineAStart.y) * s.x) / denom;
    if (t < 0 || t > 1 || u < 0 || u > 1) {
      return null;
    }
    return {
      x: lineAStart.x + t * r.x,
      y: lineAStart.y + t * r.y,
    };
  }
  static closestPointOnSegment(segmentStart, segmentEnd, point) {
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
      (pointVector.x * segmentVector.x + pointVector.y * segmentVector.y) / segmentLengthSq;
    const clamped = Math.max(0, Math.min(1, projection));
    return {
      x: segmentStart.x + segmentVector.x * clamped,
      y: segmentStart.y + segmentVector.y * clamped,
    };
  }

}