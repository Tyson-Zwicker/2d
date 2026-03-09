//from SimObject:

#calcMass() {
  let totalMass = 0;
  let centerOfMass = { "x": 0, "y": 0 };
  for (let part of this.allParts) {
    totalMass += part.mass;
    centerOfMass = Vec.add(centerOfMass, Vec.scale(part.localPosition, part.mass));
  }
  if (totalMass === 0) {
    return { "total": 0, "center": { "x": 0, "y": 0 } };
  } else {
    centerOfMass = Vec.scale(centerOfMass, 1 / totalMass);
    return { "total": totalMass, "center": centerOfMass };
  }
}
#calcMomentOfInertia() {
  let moment = 0;
  for (let part of this.allParts) {
    moment += part.mass * (part.localPosition.x ** 2 + part.localPosition.y ** 2);
  }
  return moment;
}
 applyForce(forceVector, localPosition) { //Used by thrusters and other internally generated forces.
    let forceScale = Main.delta;
    let impulse = Vec.scale(forceVector, forceScale);
    let linearAcceleration = Vec.scale(impulse, 1 / this.totalMass);
    let rotatedLocalPos = Vec.rotate(localPosition, this.worldRotation);
    let arm = Vec.sub(rotatedLocalPos, this.centerOfMass); //<-this local position is not rotated
    let torque = Vec.cross(arm, impulse);
    let angularAcceleration = (torque / this.momentOfInertia) * (180 / Math.PI);
    this.velocity = Vec.add(this.velocity, linearAcceleration);
    this.spin += angularAcceleration;
    return { "linear": linearAcceleration, "angular": angularAcceleration };
  }
//was in finalize:

let mass = this.#calcMass();
this.centerOfMass = mass.center;
this.totalMass = mass.total;
this.momentOfInertia = this.#calcMomentOfInertia();
