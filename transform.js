import Vec from './vec.js';
import View from './view.js';
import Main from './main.js';
export default class Transform {
  static bodyPartsToLocal(obj) {
    console.log('Tranform.bodyPartsToLocal: ' + obj.name + ' (' + obj.parts.length + ') parts.');
    console.log(obj);
    let scale = View.camera.zoom;
    obj.calculatedFaces.length = 0;
    //if (obj.parts.length > 0) {
    console.log(JSON.stringify(obj.parts));
    for (let innerPart of obj.parts) {//Process all the parts in the whole obj..      
      console.log('  has part: ' + innerPart.name + ' with ' + innerPart.parts.length + ' parts');
      //BUG HERE
      console.log(JSON.stringify(innerPart.parts));

      //TODO: PROBLEM IS RIGHT HERE. 
      //innerPart.partss.length says 0 but yet, it IS NOT zero, its got shit in it.
      //And then called in recursion, sure  enought the fucking parts are back.. except not IT'S innerparts...
      //WTF!?
      Transform.bodyPartsToLocal(innerPart, scale); //let children orientate themselves
      console.log('   returned from recursive call. innerPart: ' + innerPart.name);

      let scaledPartPosition = Vec.scale(innerPart.position, scale)
      for (let cf of innerPart.calculatedFaces) {
        for (let p of cf.points) {
          Vec.rotateInPlace(p, innerPart.rotation);
          Vec.addInPlace(p, scaledPartPosition);
        }
      }
      innerPart.calculatedPosition = scaledPartPosition;
      obj.calculatedFaces.push(...innerPart.calculatedFaces);
    }
    //} else {
    if (obj.faces) {//Bodies don't have faces, only their parts do..
      console.log('  doing own (' + obj.name + ') faces.');
      for (let face of obj.faces) {//local rotation of own points.. (Game object won't have any of its own)
        let rotatedPoints = [];
        for (let p of face.points) {
          rotatedPoints.push(Vec.rotate(Vec.scale(p, scale), obj.rotation));
        }
        obj.calculatedFaces.push({ "color": face.color, "points": rotatedPoints, "part": obj });
      }
    }
    //}
  }
  static localToWorld(obj) {
    let world = [];
    for (let cf of obj.calculatedFaces) {
      let wf = { "color": cf.color, "part": cf.part, "points": [] }
      for (let p of cf.points) {
        wf.points.push(Vec.add(Vec.rotate(p, obj.rotation), obj.position));
      }
      world.push(wf);
    }

    return world;
  }
  static worldToScreen(worldCoordinate) {
    let screen = Vec.add(Vec.scale(Vec.sub(worldCoordinate, View.camera), View.camera.zoom), View.screenCenter);
    return screen;
  }
}
