import Main from './main.js';
import Vec from './vec.js';
export default class GameObject {
  localPosition = { "x": 0, "y": 0 }; //Leave as own center.
  bodyPosition = {"x":0,"y":0};       //Leave as own center.
  bodyRotation = 0;                  //You CAN change this!!!
  worldPosition = { "x": 0, "y": 0 }; //You CAN changes!!!
  worldRotation = 0;                  //This is calculated elsewhere.
  name = undefined;
  body = undefined;
  velocity = undefined;
  spin = 0;
  constructor(name, bodyPart, position = { "x": 0, "y": 0 }, rotation = 0) {
    this.name = name;
    this.body = bodyPart;
    this.body.parent = this;
    this.worldPosition = position;
    this.velocity = { "x": 0, "y": 0 };
    this.localRotation = rotation;
    this.body.offsetPosition = { "x": 0, "y": 0 };
    this.body.ownRotation = 0;
  }
  move() {
    Vec.addInPlace(this.worldPosition, Vec.scale(this.velocity, Main.delta));
    this.localRotation = (this.bodyRotation + (this.spin * Main.delta)) % 360;
    this.body.applySpin();
  }
  applyPointForce(force, directionVector, position, angle) {
    let result = this.body.applyPointForce(force, directionVector, position,angle);
    this.velocity = Vec.add (this.velocity,result.linear);
    this.spin +=result.angular;
    return result;
  }
  update() {
    this.body.update();
    console.log (this.body);
  }
  draw() {
    this.body.draw();
  }
  getTotalMass() {
    return this.body.getTotalMass();
  }
  getCenterOfMass() {
    return this.body.getCenterOfMass();
  }
  getMomentOfIntertia() {
    return this.body.getMomentOfInertia();
  }
}