import Vec from './vec.js';
import View from './view.js';

export default class Transform {
  static gameObjectToWorld(obj) {
    let scale = View.camera.zoom;
    obj.calculatedFaces.length = 0;
    if (obj.faces) {//Bodies don't have faces, only their parts do..
      for (let face of obj.faces) {//local rotation of own points.. (Game object won't have any of its own)
        let rotatedPoints = [];
        for (let p of face.points) {
          rotatedPoints.push(Vec.rotate(Vec.scale(p, scale), obj.facing));
        }
        obj.calculatedFaces.push({ color: face.color, points: rotatedPoints });
      }
      if (obj.parts.length === 0) return; // required to return from recursion..this is a this was a "leaf" node
    }
    for (let part of obj.parts) {//Process all the parts in the whole obj..
      Transform.gameObjectToWorld(part, scale); //let children orientate themselves
      let scaledPartPosition = Vec.scale(part.position, scale)
      for (let cf of part.calculatedFaces) { //Now the part will offset them, and assert its rotation..
        for (let p of cf.points) {
          Vec.addInPlace(p, scaledPartPosition);//the parts position its its offset from its parent..
          Vec.rotateInPlace(p, part.facing);
        }
      }
      part.calculatedPosition = scaledPartPosition;//Let this part know where it is (so it knows if it has been hit by anything)
      obj.calculatedFaces.push(...part.calculatedFaces); //so this parts parent can do the same to this AND its grand kids..
    }
    //Now that parts have asserted themselves,  apply THIS Obj rotation and position to all the calculatedFaces..
    for (let cf of obj.calculatedFaces) {
      for (let p of cf.points) {
        Vec.rotateInPlace(p, obj.facing); //Are the changes made here visible outside of this scope..
        Vec.addInPlace(p, obj.position);  //like, is 'p' local and not a reference to an object in an array?
      }
    }
  }
  static worldToScreen(worldCoordinate) {
    let screen = Vec.add(Vec.scale(Vec.sub(worldCoordinate, View.camera), View.camera.zoom), View.screenCenter);
    return screen;
  }
}
