import Main from './main.js';
import Vec from './vec.js';
export default class GameObject {
  localPosition = { "x": 0, "y": 0 }; //Leave as own center.
  localRotation = 0;                  //This changes.
  worldPosition = { "x": 0, "y": 0 }; //This changes
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
    this.localRotation = (this.localRotation + (this.spin * Main.delta)) % 360;
    this.body.applySpin();
  }
}