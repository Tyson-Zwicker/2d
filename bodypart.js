
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
}

