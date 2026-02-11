
import View from './view.js';
import Vec from './vec.js';
import Main from './main.js';
export default class BodyPart {
  name = undefined;
  parent = undefined;
  offsetPosition = undefined; //offset from parent (if it were unrotated)
  localPosition = undefined;  //position in the body, gameobject is local (0,0) and the Center of Rotation.
  worldPosition = undefined;
  ownRotation = undefined;
  localRotation = undefined;
  worldRotation = undefined; //Same as local unless the world starts spinning..
  ownFaces = [];
  localFaces = [];
  worldFaces = [];
  spin = undefined;
  parts = [];
  constructor(name, faces) {
    this.name = name;
    this.ownFaces = faces;
    this.spin = 0;
    this.localPosition = { "x": 0, "y": 0 };
  }

  partAdd(part, offset, rotation = 0) {
    part.offsetPosition = offset;
    part.parent = this;
    part.ownRotation = rotation;
    part.spin = 0;
    this.parts.push(part);
  }
  applySpin (){
    this.ownRotation +=this.spin*Main.delta;
    for (let part of this.parts) part.applySpin();
  }
  update() {
    this.#getLocalRotation();
    this.#getLocalPosition();
    this.#getLocalFaces();
    this.#getWorldRotation();
    this.#getWorldPosition();
    this.#getWorldFaces();
  }

  #getLocalRotation() {
    this.localRotation = this.parent.localRotation + this.ownRotation;
    for (let part of this.parts) {
      part.#getLocalRotation();
    }
  }

  #getLocalPosition() {    
    this.localPosition = Vec.rotate (this.offsetPosition, this.parent.localRotation);
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

