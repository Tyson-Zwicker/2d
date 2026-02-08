
export default class BodyPart {
  name = undefined;
  position = undefined; //offset from parent.
  facing = 0;
  spin = 0;
  parts = [];
  mass = 0;
  faces = [];
  collides = true;
  calculatedPosition = undefined; //World Coordinates. Transfor sets this.
  calculatedFaces = []; //World Coordinates.  Transfomer makes them.. 
  constructor(name, facing, mass, collides, spin = 0) {
    this.name = name;
    this.facing = facing;
    this.mass = mass;
    this.spin = spin;
    this.collides = collides;
  }
  partAdd(part, offset) {
    part.position = offset;
    this.parts.push(part);
  }
  partGet(name) {
    for (let part of this.parts) {
      if (part.name === name) return part;
      for (let innerpart of part.parts) {
        let p = innerpart.getPart(name);
        if (p instanceof BodyPart) return p;
      }
    }
    throw new Error(`body.partGet: part not found [${name}]`);
  }
}

