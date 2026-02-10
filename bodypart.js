
export default class BodyPart {
  name = undefined;
  root = undefined;
  position = undefined; //offset from parent.
  rotation = 0;
  spin = 0;
  parts = [];
  mass = 0;
  faces = [];
  collides = true;
  calculatedPosition = undefined; //World Coordinates. Transformer sets this.
  calculatedFaces = []; //World Coordinates.  Transfomer makes them.. 
  constructor(name, rotation, mass, collides, spin = 0) {
    this.name = name;
    this.rotation = rotation;
    this.mass = mass;
    this.spin = spin;
    this.collides = collides;
  }
  partAdd(part, offset) {
    part.position = offset;
    this.parts.push(part);
    part.root = this.root;    
    this.root.recalculateProperties();//TODO:  THIS IS THE BUG.  YOU NEED TO SEPERATE THE TRANSFORM into two parts..
    //One part should do the calculated position and rotation (call THAT from here..)
    //The other part should do calculated Faces-> BUT NOT HERE ONLY IN DRAW.
    //SEE ALSO: BODY
  }
  partGet(name) {
    for (let part of this.parts) {
      if (part.name === name) return part;
      for (let innerpart of part.parts) {
        let p = innerpart.partGet(name);
        if (p instanceof BodyPart) return p;
      }
    }
    throw new Error(`body.partGet: part not found [${name}]`);
  }
}

