import Main from './main.js';
import Vec from './vec.js';
import View from './view.js';

export default class GameObject {
  #localPosition = { x: 0, y: 0 };    //READ ONLY
  get localPosition() {
    return this.#localPosition;
  }
  #localRotation = 0;                 //READ ONLY
  get localRotation() {
    return this.#localRotation;
  }
  worldPosition = undefined;          //assigned when added to Game.
  worldRotation = undefined;          //assigned when added to Game.
  velocity = { x: 0, y: 0 };          //Is changed by application of linear acceleration.
  spin = 0;                           //Is changed by application of angular acceleration.
  name = undefined;                   //assigned by constructor  
  body = undefined;                   //assigned by when object adds itself to this.
  allParts = [];                      //collected during "finalize" step..
  spinningParts = [];                 //collected during "finalize" step..
  totalMass = undefined;              //Calculated in "finalize" step.
  centerOfMass = undefined;           //Calculated in "finalize" step. (Local Coordinate Space)
  momentOfInertia = undefined;        //Calculated in "finalize" step.
  radius = undefined;                //Calculated in "finalize" step. (The radius of the smallest circle that can enclose all parts).
  canMove = true;                     //Determines which QuadTree this object is added to.
  finalized = false;                  //Set to true, when "finalized". (Game will not allow unfinalized objects to be added).

  constructor(name, canMove = true) {
    this.name = name;
    this.canMove = canMove;
  }
  finalize() {                        //Once after all the parts have been added.    
    if (this.body === undefined) throw new Error(`GameObject [${this.name}] has no body.`);
    this.allParts = this.#getAllParts(this.body);
    let mass = this.#calcMass();
    this.centerOfMass = mass.center;
    this.totalMass = mass.total;
    this.momentOfInertia = this.#calcMomentOfInertia();
    this.radius = this.#calcRadius();
    this.spinningParts = this.#getSpinningParts();
    this.finalized = true;
  }
  getPart(name) {
    for (let i = 0; i < this.allParts.length; i++) {
      if (this.allParts[i].name === name) return this.allParts[i];
    }
  }
  #getAllParts(part, found = []) {
    for (let innerPart of part.parts) {
      found.push(...this.#getAllParts(innerPart));
    }
    found.push(part);
    return found;
  }
  #getSpinningParts() {
    let spinningParts = [];
    for (let part of this.allParts) {
      if (part.parts.length === 0 && part.spin !== 0) {
        spinningParts.push(part);
      }
    }
    return spinningParts;
  }
  #calcMass() {
    let totalMass = 0;
    let centerOfMass = { "x": 0, "y": 0 };
    for (let part of this.allParts) {
      totalMass += part.mass;
      centerOfMass = Vec.add(centerOfMass, Vec.scale(part.localPosition, part.mass));
    }
    if (totalMass === 0) {
      return { "total": 0, "center": { "x": 0, "y": 0 } };
    } else {
      centerOfMass = Vec.scale(centerOfMass, 1 / totalMass);
      return { "total": totalMass, "center": centerOfMass };
    }
  }
  #calcMomentOfInertia() {
    let moment = 0;
    for (let part of this.allParts) {
      moment += part.mass * (part.localPosition.x ** 2 + part.localPosition.y ** 2);
    }
    return moment;
  }
  #calcRadius() {
    let maxDistance = 0;
    for (let part of this.allParts) {
      let distance = Math.sqrt(part.localPosition.x ** 2 + part.localPosition.y ** 2) + part.radius;
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
    return maxDistance;
  }
  move() {
    this.worldPosition = Vec.add(this.worldPosition, Vec.scale(this.velocity, Main.delta));
    this.worldRotation = this.worldRotation + this.spin * Main.delta;
  }
  render() {
    if (this.allParts.length === 0) {
      throw new Error('No Parts found to render.  GameObject has not body, or it is has not been finalized.');
    }
    for (let part of this.allParts) {
      let faces = part.getWorldFaces();
      for (let face of faces) {
        View.context.fillStyle = face.appearance.normal.backgroundColor;        
        View.context.strokeStyle = face.appearance.normal.borderColor;
        let path = new Path2D();
        let points = face.points;
        if (points.length === 0) continue;
        path.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          path.lineTo(points[i].x, points[i].y);
        }
        path.closePath();
        View.context.fill(path);
        View.context.stroke(path);
      }
    }
    this.#drawCenterOfMass();
  }
  #drawCenterOfMass() {
    let oldStyle = View.context.strokeStyle;
    let oldWidth = View.context.lineWidth;
    let cm = this.centerOfMass;
    cm = Vec.add(cm, this.worldPosition);
    let pos = Vec.add(Vec.scale(Vec.sub(cm, View.camera), View.camera.zoom), View.screenCenter) //Camera can be used as a vector. It has x and y.
    View.context.strokeStyle = '#fff';
    View.context.lineWidth = 3;
    View.context.beginPath();
    View.context.moveTo(pos.x, pos.y - 10);
    View.context.lineTo(pos.x, pos.y + 10);
    View.context.moveTo(pos.x - 10, pos.y);
    View.context.lineTo(pos.x + 10, pos.y);
    View.context.stroke();
    View.context.lineWidth = oldWidth;
    View.context.strokeStyle = oldStyle;
  }
  applyForce(forceVector, localPosition) {
    let forceScale = Main.delta;
    let impulse = Vec.scale(forceVector, forceScale);
    let linearAcceleration = Vec.scale(impulse, 1/this.totalMass);
    let rotatedLocalPos = Vec.rotate (localPosition,this.worldRotation);
    let arm = Vec.sub(rotatedLocalPos, this.centerOfMass); //<-this local position is not rotated
    let torque = Vec.cross(arm, impulse);
    //let torque = arm.x * impulse.y - arm.y * impulse.x;
    let angularAcceleration = (torque / this.momentOfInertia) * (180/Math.PI);
    this.velocity = Vec.add (this.velocity, linearAcceleration);
    this.spin += angularAcceleration;
    return { "linear": linearAcceleration, "angular": angularAcceleration };
  }
}