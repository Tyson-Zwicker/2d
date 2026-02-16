import Vec from 'vec.js';
import View from 'view.js';

export default class Part {
  root = undefined;             //assigned when added (refers to a GameObject)
  ownPosition = undefined;      //assigned when added
  ownRotation = undefined;      //assigned when added
  parent = undefined;           //assigned when added
  localPosition = undefined;    //calculated when added
  localRotation = undefined;    //calculated when added
  spin = 0;                     //should by 0 for anything but a leaf node or Root.
  worldPosition = undefined;    //calculated when needed by getter. (Root assigned when adde to Game)
  worldRotation = undefined;    //ONLY assigned to root when added to Game
  name = undefined;             //assigned by constructor
  parts = [];                   //added to by addPart();
  faces = [];                   //assigned by constructor

  constructor(name, faces) {
    this.name = name;
    this.polygon.push(faces);
  }
  get worldPosiion() {
    return Vec.add(this.root.worldPosition, this.localPosition)
  }
  get worldRotation() {
    return (this.root.worldRotation + this.localRotation) % 360;
  };
  calculateLocals() {
    /*
    Only called on nodes that have had their rotation changed.
    If this is called on anything except a leaf node,  the all the children must also be re-calculated
    and Root must recalculate its Center of Mass and Moment of Inertia.  So basically: don't.
    */
    this.localRotation = (rotation + parent.localRotation) % 360;
    this.localPosition = Vec.add(parent.localPosition, Vec.rotate(offset, parent.localRotation));
  }
  addTo(parent, offset, rotation) {    
    this.parent = parent;
    this.root = parent.root;
    this.ownPosition = offset;
    this.ownRotation = rotation;        
    this.calculateLocals();
    this.parent.parts.push (this);
  }
  get(name) {
    if (this.name == name) {
      return this;
    }
    for (let part of this.parts) {
      let result = part.partGet(name);
      if (result) return result;
    }
  }
  getWorldFaces() {                                     //The "rendering pipeline"
    let worldFaces = [];
    for (let face in this.faces) {
      let worldFace = { color: face.color, points: [] };
      for (let point in this.faces.points) {
        let p = structuredClone(point);
        p = Vec.scale(p, View.camera.zoom);
        p = Vec.rotate(p, this.localRotation);
        p = Vec.add(p, this.localPosition);
        p = Vec.rotate(p, this.root.worldRotation);
        p = Vec.add(p, this.root.worldPosition);
        p = Vec.sub(p, View.camera);
        p = p.add(View.screenCenter);
        worldFace.points.push(p);
      }
      worldFaces.push(worldFace);
    }
    return worldFaces;
  }
}