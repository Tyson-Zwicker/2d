import Vec from './vec.js';
import View from './view.js';

export default class Transform {
  static bodyPartsToLocal(obj) {
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
      Transform.bodyPartsToLocal(part, scale); //let children orientate themselves
      let scaledPartPosition = Vec.scale(part.position, scale)
      for (let cf of part.calculatedFaces) {
        for (let p of cf.points) {
          Vec.rotateInPlace(p, part.facing);
          Vec.addInPlace(p, scaledPartPosition);
        }
      }
      part.calculatedPosition = scaledPartPosition;
      obj.calculatedFaces.push(...part.calculatedFaces);
    }
  }
  static localToWorld(obj) {  
    console.log ('localtoWord obj:',obj);              
    let world = [];
    for (let cf of obj.calculatedFaces) {
      let wf = {color:cf.color, points:[]}
      for (let p of cf.points) {
        wf.points.push (Vec.add(Vec.rotation (p,obj.facing), obj.position));
      }
      world.push (wf);
    }
    return world;
  }
  static worldToScreen(worldCoordinate) {
    let screen = Vec.add(Vec.scale(Vec.sub(worldCoordinate, View.camera), View.camera.zoom), View.screenCenter);
    return screen;
  }
}
