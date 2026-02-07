import Main from './main.js';
import BodyPart from './bodypart.js';
import View from './view.js';
import Vec from './vec.js';
export default class Body {
  name = undefined;
  position = { x: 0, y: 0 };
  velocity = { x: 0, y: 0 };
  facing = 0;
  spin = 0;
  parts = [];
  totalMasss = 0;
  calculatedFaces = []]; //Applied by Transform..
  constructor(name) {
    this.name = name;
  }
  partAdd(part, offset) {
    part.position = offset;
    this.parts.push(part);
  }
  partGet(name) {
    for (let part of this.parts) {
      if (part.name === name) return part;
      for (let innerpart of part.parts) {
        let p = innerpart.getPart(name);
        if (p instanceof BodyPart) return p;
      }
    }
    throw new Error (`body.partGet: part not found [${name}]`);
  }
  move() {
    this.position = Vec.add (this.position, Vec.scale (this.velocity, Main.delta));
  }
  draw() {
    for (let face of this.calculatedFaces) {
      View.context.fillStyle = face.color;
      let path = new Path2D();
      path.moveTo(face.points[0].x,face.points[0].y);
      for (let i = 1; i < face.points.length; i++) {        
        path.lineTo(face.points[i].x,face.points[i].y);
        path.closePath();
        View.context.fill(path);
      }
    }
  }
}