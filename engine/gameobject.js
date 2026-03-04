import Main from './main.js';
import Button from './button.js';
import Vec from './vec.js';
import View from './view.js';
import ParticleEffect from './particleeffect.js';
import RectBounds from './rectbounds.js';

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
  depth = 0;                           //used to sort part rendering order.  (low #'s render first)
  buttons = [];                       //Set in finalize (if any parts have a button, its added to this.)
  constructor(name, canMove = true) {
    this.name = name;
    this.canMove = canMove;
  }
  finalize() {                        //Once after all the parts have been added.    
    if (this.body === undefined) throw new Error(`GameObject [${this.name}] has no body.`);
    this.allParts = this.#getAllParts(this.body);
    this.allParts.sort((a, b) => a.depth - b.depth);
    for (let part of this.allParts) {
      if (part.button) this.buttons.push(part.button);
    }
    console.log(`Finalizing GameObject [${this.name}].  Found ${this.allParts.length} parts, ${this.buttons.length} button(s).`);
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
   static isMouseIn(gameObjectPart) {
    const mouseWorld = View.screenToWorld();
    const bounds = RectBounds.make(
      gameObjectPart.worldPosition.x - gameObjectPart.radius,
      gameObjectPart.worldPosition.y - gameObjectPart.radius,
      gameObjectPart.worldPosition.x + gameObjectPart.radius,
      gameObjectPart.worldPosition.y + gameObjectPart.radius
    );
    return RectBounds.isPointInside(mouseWorld.x, mouseWorld.y, bounds);
  }
  move() {
    this.worldPosition = Vec.add(this.worldPosition, Vec.scale(this.velocity, Main.delta));
    this.worldRotation = this.worldRotation + this.spin * Main.delta;
    this.moveParts();
  }
  moveParts() {
    for (let part of this.spinningParts) {
      part.ownRotation = (part.ownRotation + part.spin * Main.delta) % 360;
      part.calculateLocals();
    }
  }
  render() {
    if (this.allParts.length === 0) {
      throw new Error('No Parts found to render.  GameObject has not body, or it is has not been finalized.');
    }
    for (let part of this.allParts) {
      let polygons = part.getWorldPolygons();
      for (let polygon of polygons) {
        //TODO: This is where you'd change the mien based on if its got a button, and that button's state
        let fillStyle = polygon.mien.normal.bgColor;
        let strokeStyle = polygon.mien.normal.borderCololr;        
        if (part.button){
          if (part.button.hovered){
            fillStyle = polygon.mien.hovered.bgColor;
            strokeStyle = polygon.mien.hovered.borderColor;        
          }
          else if (part.button.pressed){
            fillStyle = polygon.mien.pressed.bgColor;
            strokeStyle = polygon.mien.pressed.borderColor;        
          }
        }
        View.context.fillStyle = fillStyle;
        View.context.strokeStyle = strokeStyle;
        let path = new Path2D();
        let points = polygon.points;
        if (points.length === 0) continue;
        path.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          path.lineTo(points[i].x, points[i].y);
        }
        path.closePath();
        View.context.fill(path);
        View.context.stroke(path);
      }
      if (part.particleGenParams !== undefined && part.particleGenState) {
        let pram = part.particleGeneratorParams;
        ParticleEffect.generateGroup(part.worldPosition, part.worldRotation, pram.angleSpan, pram.velMin, pram.velMax, pram.thickness, pram.color, pram.groupSize, pram.durMin, pram.durMax);
      }
    }
    //this.#drawCenterOfMass();
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
  applyForce(forceVector, localPosition) { //Used by thrusters and other internally generated forces.
    let forceScale = Main.delta;
    let impulse = Vec.scale(forceVector, forceScale);
    let linearAcceleration = Vec.scale(impulse, 1 / this.totalMass);
    let rotatedLocalPos = Vec.rotate(localPosition, this.worldRotation);
    let arm = Vec.sub(rotatedLocalPos, this.centerOfMass); //<-this local position is not rotated
    let torque = Vec.cross(arm, impulse);
    let angularAcceleration = (torque / this.momentOfInertia) * (180 / Math.PI);
    this.velocity = Vec.add(this.velocity, linearAcceleration);
    this.spin += angularAcceleration;
    return { "linear": linearAcceleration, "angular": angularAcceleration };
  }
}