import Main from './main.js';
import Vec from './vec.js';
import View from './view.js';
export default class GameObject {
  rotatedOffset = { "x": 0, "y": 0 }; //Leave as own center.
  bodyPosition = { "x": 0, "y": 0 };  //Leave as own center.
  worldRotation = 0;                  //This is calculated elsewhere.
  root = this;

  bodyRotation = 0;                  //You CAN change this!!!
  worldPosition = { "x": 0, "y": 0 }; //You CAN changes!!!

  name = undefined;                   //constructor..
  body = undefined;                   //constructor..
  velocity = undefined;               //constructor..
  spin = undefined;                   //constructor..
  isGameObject = true;                //constructor..

  constructor(name, bodyPart, position = { "x": 0, "y": 0 }, rotation = 0, spin = 0) {
    this.name = name;
    this.body = bodyPart;
    this.body.parent = this;
    this.body.root = this;
    this.worldPosition = position;
    this.velocity = { "x": 0, "y": 0 };
    this.localRotation = rotation;
    this.body.offsetPosition = { "x": 0, "y": 0 };
    this.body.ownRotation = 0;
    this.spin = spin;
    
    console.log('body.root:', this.body.root);
  }
  move() {
    Vec.addInPlace(this.worldPosition, Vec.scale(this.velocity, Main.delta));
    this.localRotation = (this.bodyRotation + (this.spin * Main.delta)) % 360;
    this.body.applySpin();
  }
  applyPointForce(forceVector, bodyPart) {
    let result = bodyPart.applyPointForce(forceVector);
    this.velocity = Vec.add(
      this.velocity,
      Vec.scale(
        Vec.toPolar({ "a": this.localRotation, "l": 1 }), //basis vector for (rotation)
        result.linear)
    );
    this.spin += result.angular;
    return result;
  }
  update() {
    this.body.update();
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