import Vec from './vec.js';
import View from './view.js';
import GameObject from './gameobject.js';

export default class Part {
  root = undefined;             //assigned when added (refers to a GameObject)
  ownPosition = undefined;      //assigned when added
  ownRotation = undefined;      //assigned when added
  parent = undefined;           //assigned when added
  localPosition = undefined;    //calculated when added
  localRotation = undefined;    //calculated when added
  spin = 0;                     //should by 0 for anything but a leaf node or Root.
  name = undefined;             //assigned by constructor
  parts = [];                   //added to by addPart();
  faces = [];                   //assigned by constructor
  mass = undefined;             //assigned by constructor.
  radius = undefined;           //Calculated upon construction. (The radius of the smallest circle that can enclose this part). 
  constructor(name, faces, mass) {
    if (!name || !faces || !mass) throw Error('Missing parameter');
    this.name = name;
    this.mass = mass;
    this.faces.push(...faces);
    this.radius = this.#calcRadius();
  }
  #calcRadius() {
    // Calculate the radius of the smallest circle that can enclose this part
    let maxDistance = 0;
    for (let face of this.faces) {
      for (let point of face.points) {
        const distance = Math.sqrt(point.x * point.x + point.y * point.y);
        maxDistance = Math.max(maxDistance, distance);
      }
    }
    return maxDistance;
  }
  clone (){
    return new Part (this.name, this.faces, this.mass);    
  }
  get worldPosition() {
    return Vec.add(this.root.worldPosition, this.localPosition)
  }
  get worldRotation() {
    return (this.root.worldRotation + this.localRotation) % 360;
  };
  calculateLocals() {
    /*
    Only called on nodes that have had their rotation changed *OR* when they are first added to parent.
    If this is called on anything except a leaf node,  the all the children must also be re-calculated
    and Root must recalculate its Center of Mass and Moment of Inertia.  So basically: don't call it.
    */
    this.localRotation = (this.ownRotation + this.parent.localRotation) % 360;
    this.localPosition = Vec.add(this.parent.localPosition, Vec.rotate(this.ownPosition, this.parent.localRotation));
  }
  addTo(parent, offset, rotation) {
    if (!parent) throw new Error('Missing parameter (parent): ' + this.name);
    if (!offset) throw new Error('Missing parameter (offset): ' + this.name);
    if (isNaN(rotation)) throw new Error('Missing parameter (rotation): ' + this.name);
    /*
    A part can have as many parts added to it as you want, but if your adding this to a GameObject 
    it will overwrite the existing (if any) body.  Because GameObjects can only have one part as 
    their "body".
    */
    if (parent instanceof GameObject) {
      this.root = parent;
      parent.body = this;
    } else {
      if (parent.root === undefined) throw new Error('Cannot attach to an unattached object. Attach objects in parent first order.');
      this.root = parent.root;
      parent.parts.push(this);
    }
    this.parent = parent;
    this.ownPosition = offset;
    this.ownRotation = rotation;
    this.calculateLocals();
  }
  get(name) {
    if (this.name == name) {
      return this;
    }
    for (let part of this.parts) {
      let result = part.get(name);
      if (result) return result;
    }
    throw new Error(`Part [${name}] not found.`);
  }
  getWorldFaces() {                                     //The "rendering pipeline"
    let worldFaces = [];
    for (let face of this.faces) {
      let worldFace = { appearance: face.appearance, points: [] };
      for (let point of face.points) {
        let p = structuredClone(point);        
        p = Vec.rotate(p, this.localRotation);
        p = Vec.add(p, this.localPosition);
        p = Vec.rotate(p, this.root.worldRotation);
        p = Vec.add(p, this.root.worldPosition);
        p = Vec.sub(p, View.camera);  //Camera can be a Vec because it has an x and y.
        p = Vec.scale(p, View.camera.zoom);
        p = Vec.add(p, View.screenCenter);
        worldFace.points.push(p);
      }
      worldFaces.push(worldFace);
    }
    return worldFaces;
  }
}