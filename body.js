import Main from './main.js';
import BodyPart from './bodypart.js';
import View from './view.js';
import Vec from './vec.js';
import Transform from './transform.js';
export default class Body {
  name = undefined;
  position = { x: 0, y: 0 };
  velocity = { x: 0, y: 0 };
  rotation = 0;
  spin = 0;
  parts = [];
  totalMass = 0;          //Done in recalculate(), after part addition
  centerOfMass = { x: 0, y: 0 }//Done in recalculate(), after part addition 
  momentOfInertia = 0;    //Done in recalcuate(), after part addition
  calculatedFaces = [];   //Applied by Transform..
  constructor(name) {
    this.name = name;
  }
  partAdd(part, offset) {
    part.position = offset
    part.root = this;
    this.parts.push(part);
    this.recalculateProperties()
  }
  recalculateProperties() {
    Transform.bodyPartsToLocal(this); //let all the parts know where they are
    this.totalMass = this.calcTotalMass(this, 0);
    this.invTotalMass = 1 / this.totalMass;
    this.centerOfMass = Vec.scale(this.calcCenterOfMass(this, {x:0,y:0}), this.invTotalMass);;
    this.momentOfInertia = this.calcMomentOfInertia(this, 0);
    this.invMomentOfInertia = 1 / this.momentOfInertia;
  }
  calcTotalMass(part, m) {
    for (let p of part.parts) {
      m += this.calcTotalMass(p, m,);
    }
    if (part.mass) m += part.mass;
    return m;
  }
  calcCenterOfMass(part, cm) {
    for (let p of part.parts) {
      cm  = Vec.add(cm, this.calcCenterOfMass(p, cm));
    }
    if (part.mass) {      
      cm = Vec.add(cm, Vec.scale(part.calculatedPosition, part.mass));      
    }
    return cm;
  }
  calcMomentOfInertia(part, i) {    
    for (let p of part.parts){
      i+= this.calcMomentOfInertia (p, i);
    }
    if (this.mass){
      let del = Vec.sub (part.calculatedPosition, this.centerOfMass);
      let dsqr = Vec.distSqr (del);
      console.log ('calcmoment',del,dsqr); //TODO: <- never called?
      i += (part.mass * dsqr); 
    }
    return i;
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
  move() {
    this.position = Vec.add(this.position, Vec.scale(this.velocity, Main.delta));
    this.rotation += this.spin * Main.delta;
    this.rotation = this.rotation % 360;
    for (let part of this.parts) {
      this.#spinPart(part);
    }
  }
  #spinPart(part) {
    for (let p of part.parts) {
      this.#spinPart(p);
      this.rotation = this.rotation % 360;
    }
    part.rotation += part.spin * Main.delta;
  }
}