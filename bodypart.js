
import View from './view.js';
import Vec from './vec.js';
import Main from './main.js';
export default class BodyPart {
  name = undefined;
  parent = undefined;
  offsetPosition = undefined;   //offset from parent (if it were unrotated) -Assigned by partAdd()
  localPosition = undefined;    //position in the body, gameobject is local (0,0) and the Center of Rotation.
  worldPosition = undefined;    //calculated..
  ownRotation = undefined;      //calculated..
  localRotation = undefined;    //calculated..
  worldRotation = undefined;    //Same as local unless the world starts spinning..
  ownFaces = [];
  localFaces = [];              //calculated..
  worldFaces = [];              //calculated..
  spin = undefined;
  parts = [];
  mass = 1;                     //Mass of this..
  #radius = undefined;           //calculated (roughly) from points..
  totalMass = undefined;        //calculated..
  centerOfMass = undefined;     //calculated.. mass of this and all its children.

  constructor(name, faces, mass = 1, spin = 0) {
    this.name = name;
    this.ownFaces = faces;
    this.spin = 0;
    this.localPosition = { "x": 0, "y": 0 };
    this.mass = mass;
    this.spin = spin;
    this.#radius = this.getRadius();
  }
  getRadius() {
    if (!this.#radius) {
      for (let f of this.ownFaces) {
        for (let p of f.points) {
          let m = Vec.magnitude(p);
          if (m > this.radius) this.radius = m;
        }
      }
    }else{
      return this.#radius;
    }
  }

  applyPointForce(force, position) {
    console.log ('bodyPart.applyPointForce: (polar, r, torq, invMass)');
    let polar = Vec.toPolar(force);
    console.log (polar);
    let r = Vec.dist(position, this.getCenterOfMass());
    console.log (r);
    let torq = r* polar.l;
    console.log (torq);
    let invMass = 1 / this.getTotalMass();
    console.log (invMass);
    //TODO: //check this part... are angular and linear scalar because they're orthogonal?
    let angularAcceleration = tow *invMass; Vec.scale(Vec.scale(torq, Math.sin(polar.a)), invMass);
    let linearAcceleration = Vec.scale(Vec.scale(force, Math.cos(polar.a)), invMass);
    return { "linear": linearAcceleration, "angular": angularAcceleration };
  }
  applyDistrubutedForce(force) {
    //apply the force to the center of mass
    let polar = Vec.toPolar(force);
    return { "linear": polar.l / this.getTotalMass(), "angular": 0 }
  }

  getTotalMass() {
    if (this.totalMass) return this.totalMass;
    let sum = this.mass;
    for (let part of this.parts) sum += part.getTotalMass();
    this.totalMass = sum;
    return sum;
  }
  getCenterOfMass() {
    let cm = Vec.scale(this.localPosition, this.getTotalMass());
    for (let part of this.parts) cm = Vec.add(cm,part.getCenterOfMass());
    this.centerOfMass = cm;
    return cm;
  }
  getMomentOfInertia() { //Aka "Resistance to rotation"..
    let I = 0;
    for (let part of this.parts) I += part.getMomentOfInertia();
    let dist = Vec.dot(this.localPosition, this.localPosition);
    if (dist < 1) {
      return I + (2 / 5) * this.mass * this.getRadius() ** 2;//<-treate the thing in middle as an ideal sphere..
    } else {
      return I + this.mass * dist ** 2; //<- "distributes axis theorem"
    }
  }

  applySpin() {
    this.ownRotation += this.spin * Main.delta;
    for (let part of this.parts) part.applySpin();
  }
  update() {
    this.#getLocalRotation();
    this.#getLocalPosition();
    this.#getLocalFaces();
    this.#getWorldRotation();
    this.#getWorldPosition();
    this.#getWorldFaces();
    this.getTotalMass();
    this.getCenterOfMass();
    this.getMomentOfInertia();
  }

  #getLocalRotation() {
    this.localRotation = this.parent.localRotation + this.ownRotation;
    for (let part of this.parts) {
      part.#getLocalRotation();
    }
  }

  #getLocalPosition() {
    this.localPosition = Vec.rotate(this.offsetPosition, this.parent.localRotation);
    for (let part of this.parts) {
      part.#getLocalPosition();
    }
  }

  #getLocalFaces() {
    this.localFaces.length = 0;
    for (let face of this.ownFaces) {
      let localPoints = [];
      for (let point of face.points) {
        localPoints.push(Vec.add(this.localPosition, Vec.rotate(point, this.localRotation)));
      }
      this.localFaces.push({ "color": face.color, "points": localPoints });
    }
    for (let part of this.parts) {
      part.#getLocalFaces();
    }
  }

  #getWorldRotation() {
    this.worldRotation = this.localRotation;
    for (let part of this.parts) {
      part.#getWorldRotation();
    }
  }
  #getWorldPosition() {
    this.worldPosition = Vec.add(this.parent.worldPosition, this.localPosition);
    for (let part of this.parts) {
      part.#getWorldPosition();
    }
  }

  #getWorldFaces() {
    this.worldFaces.length = 0;
    for (let face of this.ownFaces) {
      let worldPoints = [];
      for (let point of face.points) {
        worldPoints.push(Vec.add(this.worldPosition, Vec.rotate(point, this.localRotation)));
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
      //draw  dot in the middle of the object.. for debugging
      let pos = { "x": this.worldPosition.x, "y": this.worldPosition.y };
      pos = Vec.add(Vec.scale(Vec.sub(pos, View.camera), View.camera.zoom), View.screenCenter)
      View.context.fillStyle = '#fff';
      View.context.fillRect(pos.x - 1, pos.y - 1, 3, 3);
    }
    for (let part of this.parts) {
      part.draw();
    }
  }

  partAdd(part, offset, rotation = 0) {
    part.offsetPosition = offset;
    part.parent = this;
    part.ownRotation = rotation;
    this.parts.push(part);
  }

  partGet(name) {
    for (let part of this.parts) {
      if (part.name === name) return part;
      for (let innerpart of part.parts) {
        innerpart.partGet(name);
      }
    }
    throw new Error(`body.partGet: part not found [${name}]`);
  }
}

