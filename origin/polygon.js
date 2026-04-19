import Vec from './vec.js';
export default class Polygon {
  points = [];
  mien = undefined;
  constructor(points, mien) {
    this.points = points;
    this.mien = mien;
  }
  static translate(polygon, vector) {
    let pts = [];
    for (let p of polygon.points) {
      pts.push(Vec.add(vector, p));
    }
    return new Polygon(pts, polygon.mien);
  }
  static flipVertical(polygon) {
    let pts = [];
    for (let p of polygon.points) {
      pts.push({ x: p.x, y: p.y * -1 });
    }
    return new Polygon(pts, polygon.mien);
  }
  static flipHorizontal(polygon) {
    let pts = [];
    for (let p of polygon.points) {
      pts.push({ x: p.x * -1, y: p.y });
    }
    return new Polygon(pts, polygon.mien);
  }
  static scale(polygon, scale) {
    let pts = [];
    for (let p of polygon.points) {
      pts.push(Vec.scale(p, scale));
    }
    return new Polygon(pts, polygon.mien);
  }
  static rotate(polygon, angle) {
    let pts = [];
    for (let p of polygon.points) {
      pts.push(Vec.rotate(p, angle));
    }
    return new Polygon(pts, polygon.mien);
  }
  static regular(sides, radius, mien) {
    let pts = [];
    for (let a = 0; a < 360; a += 360 / sides) {
      a = Math.ceil(a);
      pts.push(Vec.fromAngleAndMagnitude(a, radius));
    }
    return new Polygon(pts, mien);
  }
  static isosceles (base, height, mien){
    //Everything is always drawn 0 deg = right facing, clockwise + angle.. Y is not inverted.
    let a = [
      {x: -height/2, y:0},
      {x: height/2, y:0},
      {x: 0, y:base} // It looks backwards but remember x,y is screen and rendered angle has 0 = facing right... this will have its base at the  bottom.
    ];
    return new Polygon (a,mien);
  };
}