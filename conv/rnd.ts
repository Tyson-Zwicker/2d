import { Point, Vec, LineSeg, RectBounds } from './geometry.js';

/* SUPER IMPORTANT 
 * Every time you try to do a refactor on this Project, this is the place within the 
 * Project you will discover all the weird interdependencies/assumptions/not-conventions/
 * and errors made in the haste to make a test work.
*/

/* 
* Random number utilities
*/
export class Rnd {
  static bool(): boolean {
    return Math.random() < 0.5;
  }

  static int(min?: number, max?: number): number {
    // If only one provided, range is 0->min, otherwise min->max. Max not inclusive.
    if (typeof max === 'undefined' && typeof min === 'number') {
      max = min;
      min = 0;
    }
    if (typeof min === 'undefined') {
      throw new Error(`Rnd.int: min must be a number. Given: [${min}]`);
    }
    return Math.floor(min + Math.random() * (Math.abs(max!) - min));
  }

  static float(min?: number, max?: number): number {
    // Max not inclusive.
    if (typeof max === 'undefined' && typeof min === 'undefined') {
      min = 0;
      max = 1;
    }
    if (typeof max !== 'number') {
      max = min!;
      min = 0;
    }
    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Rnd.float requires numeric parameters');
    }
    return min + Math.random() * (Math.abs(max) - min);
  }

  static hex(min?: number, max?: number, digits?: number): string {
    // 0->15 but returns 0->F
    if (typeof min === 'undefined' && typeof max === 'undefined' && typeof digits === 'undefined') {
      return Rnd.int(0, 16).toString(16);
    }
    if (typeof min !== 'number' || min < 0) min = 0;
    if (typeof max !== 'number' || max < 0 || max > 16) max = 16;
    if (digits && digits > 1) {
      let d = 0;
      let s = '';
      while (d < digits) {
        s += Rnd.hex(min, max);
        d++;
      }
      return s;
    }
    return Rnd.int(min, max).toString(16);
  }

  static angle(center: number, span: number): number {
    return ((center - span / 2) + Rnd.int(span)) % 360;
  }

  static point(bounds: RectBounds): Point {
    return { x: Rnd.int(bounds.x0, bounds.x1), y: Rnd.int(bounds.y0, bounds.y1) };
  }

  static vec(minAngle: number, maxAngle: number, minMag: number, maxMag: number): Point {
    const a = Rnd.float(minAngle, maxAngle);
    const m = Rnd.float(minMag, maxMag);
    return Vec.fromAngleAndMagnitude(a, m);
  }

  static bound(x: number, y: number, w: number = 1, h: number = 1) {
    return { x0: x - w, y0: y - h, x1: x + w, y1: y + h } as RectBounds;
  }

  static ray(
    origin: Point,
    minAngle: number,
    maxAngle: number,
    minStart: number,
    maxStart: number,
    minLength: number,
    maxLength: number
  ): LineSeg {
    const a = Rnd.float(minAngle, maxAngle);
    const s = Rnd.float(minStart, maxStart);
    const len = Rnd.float(minLength, maxLength);
    return LineSeg.ray(origin, a, s, s + len);
  }

  /**
   * Generates a random saturated color in 3-char hex shorthand (#RGB).
   * @param min Minimum brightness for hex digits (0-14)
   * @returns A CSS color string like '#F00', '#0AB', etc.
   */
  static color(min: number): string {
    if (typeof min !== 'number') {
      console.warn(`WARNING: Rnd.color min not a number ${min}`);
      min = 0;
    }
    const m = Math.floor(min);
    if (m > 14 || m < 0) {
      throw new Error(`Rnd.color: min [${min}] must be between 0 and 14 (inclusive)`);
    }
    const a = Rnd.int(m, 15).toString(16);
    const b = Rnd.int(m, 15).toString(16);
    switch (Rnd.int(6)) {
      case 0: return '#' + a + '00';
      case 1: return '#0' + a + '0';
      case 2: return '#00' + a;
      case 3: return '#' + a + '0' + b;
      case 4: return '#' + a + b + '0';
      case 5: return '#0' + a + b;
      default: return '#' + a + '00';
    }
  }
}
