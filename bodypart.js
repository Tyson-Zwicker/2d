
import View from './view.js';
import Vec from './vec.js';
import Main from './main.js';
import GameObject from './gameobject.js';
export default class BodyPart {
  name = undefined;
  parent = undefined;
  root = undefined;
  offsetPosition = undefined;   //offset from parent (if it were unrotated) -Assigned by partAdd()
  rotatedOffset = undefined;    //position in the the offset from parent accountng for rotation of all ancestors.
  bodyPosition = undefined;     //position of offset translated by all ancestor positions.
  worldPosition = undefined;    //calculated..
  ownRotation = undefined;      //calculated..
  bodyRotation = undefined;     //calculated..
  bodyPosition = undefined;     //calculated..
  worldRotation = undefined;    //Same as local unless the world starts spinning..
  ownFaces = [];
  localFaces = [];              //calculated..
  worldFaces = [];              //calculated..
  spin = undefined;
  parts = [];
  mass = 1;                     //Mass of this..
  totalMass = undefined;        //calculated..
  centerOfMass = undefined;     //calculated.. mass of this and all its children.
  #radius = undefined;          //calculated..
  constructor(name, faces, mass = 1, spin = 0) {
    this.name = name;
    this.ownFaces = faces;
    this.spin = 0;
    this.rotatedOffset = { "x": 0, "y": 0 };
    this.mass = mass;
    this.spin = spin;
  }
  getRadius() {
    if (!this.#radius) {
      let r = 0;
      for (let f of this.ownFaces) {
        for (let p of f.points) {
          let m = Vec.magnitude(p);
          if (m > r) r = m;
        }
      }
      this.#radius = r;
      return r;
    } else {
      return this.#radius;
    }
  }

  applyPointForce(force, directionVector, localPos, angle) {
    let r = Vec.dist(this.getCenterOfMass(), this.rotatedOffset);
    let t = r * Math.sin(angle * Vec.radians) * force;
    let f = Math.cos(angle * Vec.radians) * force;
    let la = f / this.getTotalMass();
    let linearAcceleration = Vec.scale(directionVector, la);
    let angularAcceleration = t / this.getMomentOfInertia();
    return { "linear": linearAcceleration, "angular": angularAcceleration };
  }

  getTotalMass() {
    if (this.totalMass) return this.totalMass;
    let sum = this.mass;
    for (let part of this.parts) sum += part.getTotalMass();
    this.totalMass = sum;
    return sum;
  }
  getCenterOfMass() {
    let cm = Vec.scale(this.bodyPosition, this.mass / this.root.getTotalMass());//TODO: changed to: this.mass/root.TotalMass..
    for (let part of this.parts) cm = Vec.add(cm, part.getCenterOfMass());
    this.centerOfMass = cm;
    return cm;
  }
  getMomentOfInertia() { //Aka "Resistance to rotation"..
    let I = 0;
    for (let part of this.parts) I += part.getMomentOfInertia();
    let dist = Vec.magnitude(this.bodyPosition);
    if (dist < 1) {
      return I + (2 / 5) * this.mass * this.getRadius() ** 2;//<-treate the thing in middle as an ideal sphere..
    } else {
      return I + this.mass * dist ** 2;
    }
  }

  applySpin() {
    this.ownRotation += this.spin * Main.delta;
    for (let part of this.parts) part.applySpin();
  }
  update() {
    this.#getBodyRotation();
    this.#getRotatedOffset();
    this.#getLocalFaces();
    this.#getBodyPosition();
    this.#getWorldRotation();
    this.#getWorldPosition();
    this.#getWorldFaces();
    this.getTotalMass();
    //this.getCenterOfMass();
    this.getMomentOfInertia();
  }

  #getBodyRotation() {
    this.bodyRotation = this.parent.bodyRotation + this.ownRotation;
    for (let part of this.parts) {
      part.#getBodyRotation();
    }
  }

  #getRotatedOffset() {
    this.rotatedOffset = Vec.rotate(this.offsetPosition, this.parent.bodyRotation);
    for (let part of this.parts) {
      part.#getRotatedOffset();
    }
  }

  #getLocalFaces() {
    this.localFaces.length = 0;
    for (let face of this.ownFaces) {
      let localPoints = [];
      for (let point of face.points) {
        localPoints.push(Vec.add(this.rotatedOffset, Vec.rotate(point, this.bodyRotation)));
      }
      this.localFaces.push({ "color": face.color, "points": localPoints });
    }
    for (let part of this.parts) {
      part.#getLocalFaces();
    }
  }

  #getWorldRotation() {
    this.worldRotation = this.bodyRotation;
    for (let part of this.parts) {
      part.#getWorldRotation();
    }
  }
  #getBodyPosition() {
    this.bodyPosition = Vec.add(this.parent.bodyPosition, this.rotatedOffset);
    for (let part of this.parts) {
      part.#getBodyPosition();
    }
  }
  #getWorldPosition() {
    this.worldPosition = Vec.add(this.parent.worldPosition, this.rotatedOffset);
    for (let part of this.parts) {
      part.#getWorldPosition();
    }
  }

  #getWorldFaces() {
    this.worldFaces.length = 0;
    for (let face of this.ownFaces) {
      let worldPoints = [];
      for (let point of face.points) {
        worldPoints.push(Vec.add(this.worldPosition, Vec.rotate(point, this.bodyRotation)));
      }
      this.worldFaces.push({ "color": face.color, "points": worldPoints });
    }
    for (let part of this.parts) {
      part.#getWorldFaces();
    }
  }

  draw() {
    let points = [];
    for (let face of this.worldFaces) {
      points.length = 0;
      for (let p of face.points) {
        points.push(Vec.add(Vec.scale(Vec.sub(p, View.camera), View.camera.zoom), View.screenCenter));
      }
      View.context.fillStyle = face.color;
      let path = new Path2D();
      path.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        path.lineTo(points[i].x, points[i].y);
      }
      path.closePath();
      View.context.fill(path);
      
    }
    for (let part of this.parts) {
      part.draw();
    }
  
    //Draw debugging shit where kids won't draw over it...
      let pos = { "x": this.worldPosition.x, "y": this.worldPosition.y };
      pos = Vec.add(Vec.scale(Vec.sub(pos, View.camera), View.camera.zoom), View.screenCenter)
      View.context.fillStyle = '#fff';
      View.context.fillRect(pos.x - 1, pos.y - 1, 3, 3);
    
    this.#drawCenterOfGravity();
  }
  #drawCenterOfGravity() {
    let oldStyle = View.context.strokeStyle;
    let oldWidth = View.context.lineWidth;
    let cm = this.getCenterOfMass();
    cm = Vec.add(cm, this.worldPosition);
    let pos = Vec.add(Vec.scale(Vec.sub(cm, View.camera), View.camera.zoom), View.screenCenter)
    if (this.parent.isGameObject) {
      View.context.strokeStyle = '#fff';
      View.context.lineWidth = 3;
    } else {
      View.context.strokeStyle = '#888';
      View.context.lineWidth = 1;
    }
    View.context.beginPath();
    View.context.moveTo(pos.x, pos.y - 10);
    View.context.lineTo(pos.x, pos.y + 10);
    View.context.moveTo(pos.x - 10, pos.y);
    View.context.lineTo(pos.x + 10, pos.y);
    View.context.stroke();
    View.context.lineWidth = oldWidth;
    View.context.strokeStyle = oldStyle;
  }
  partAdd(part, offset, rotation = 0) {
    part.offsetPosition = offset;
    part.parent = this;
    if (this.root === undefined) console.log('UNDEFINED ROOT:' + this.name);
    part.root = this.root; //always points back to GameObject that owns the part..
    part.ownRotation = rotation;
    this.parts.push(part);
  }

  partGet(name) {
    if (this.name == name) {
      return this;
    }
    for (let part of this.parts) {
      let result = part.partGet(name);
      if (result) return result;
    }
  }
}

