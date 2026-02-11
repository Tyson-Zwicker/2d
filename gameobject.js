import Main from './main.js';
import Vec from './vec.js';
export default class GameObject {
  static #localPosition = { "x": 0, "y": 0 };
  static #localRotation = 0;
  static #worldPosition = { "x": 0, "y": 0 };
  static #worldRotation = 0;
  get localPosition() { return GameObject.#localPosition; }
  get localRotation() { return GameObject.#localRotation; }
  get worldPosition() { return GameObject.#worldPosition; }
  get worldRotation() { return GameObject.#worldRotation; }

  name = undefined;
  body = undefined;
  position = undefined;
  velocity = undefined;
  rotation = 0;
  spin = 0;
  constructor(name, bodyPart, position = { "x": 0, "y": 0 }) {
    this.name = name;
    this.body = bodyPart;
    this.body.parent = this;
    this.position = position;
    this.velocity = { "x": 0, "y": 0 };
  }
  move() {
    Vec.addInPlace(this.position, Vec.scale(this.velocity, Main.delta));
    this.rotation += (this.spin * Main.delta);
    this.rotation = this.rotation % 360;
  }
}