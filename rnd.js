import Vec from './vec.js';
export default class Rnd {
  static bool() {
    return (Math.random() < .5);
  }
  static int(min, max) { //IF ONLY ONE provided, range is 0->min, otherwise its min->max. max not inclusive..
    if (typeof max === 'undefined' && typeof min === 'number') {
      max = min;
      min = 0;
    }
    if (typeof min === 'undefined') {
      throw new Error(`Rnd.int: min must be a number. Given: [${min}]`);
    }
    return Math.floor(min + Math.random() * (Math.abs(max) - min));
  }
  static float(min, max) { //max not inclusive..
    if (typeof max === 'undefined' && typeof min === 'undefined') {
      min = 0;
      max = 1;
    }
    if (typeof max !== 'number') {
      max = min;
      min = 0;
    }
    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Rnd.float requires numeric parameters');
    }
    return min + Math.random() * (Math.abs(max) - min);
  }
  static hex(min, max, digits) { //0->15 but 0->F
    if (typeof min === 'undefined' && typeof max === 'undefined' && typeof digits === 'undefined') return Rnd.int(0, 16).toString(16);
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
  static angle (center, span){
    return ((center - span / 2) + Rnd.int (span))%360;
  }
  static point(bounds) {
    return { x: Rnd.int(bounds.x0, bounds.x1), y: Rnd.int(bounds.y0, bounds.y1) };
  }
  static vec(minAngle, maxAngle, minMag, maxMag) {
    let a = Rnd.int(minAngle, maxAngle);
    let m = Rnd.int(minMag, maxMag);
    return Vec.fromPolar(a, m);
  }
  static color(min) {
    if (typeof min !== 'number') {
      console.warn(`WARNING: Rnd.color min not a number ${min}`);
      min = 0;
    }
    let m = parseInt(min);
    if (m > 14 || m < 0) throw new Error(`Rnd.color: min [${min} must be between 0 and 14 (inclusive)`);
    let i = Rnd.int(6);
    let a = Rnd.int(m, 15).toString(16);
    let b = Rnd.int(m, 15).toString(16);
    if (i === 0) return new '#' + a + '00';
    if (i === 1) return new '#0' + a + '0';
    if (i === 2) return new '#00' + a;
    if (i === 3) return new '#' + a + '0' + b;
    if (i === 4) return new '#' + a + b + '0';
    if (i === 5) return new '#0' + a + b;
  }
}