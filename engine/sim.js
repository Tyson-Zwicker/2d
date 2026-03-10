import SimObject from './simobject.js';
import QuadTree from './quadtree.js';
import RectBounds from './rectbounds.js';
export default class Sim {
  static simObjects = new Map();
  /*
  * There are two quadtrees.  One if for things that don't move (static) and the other is
  * for things that do move (dynamic).  This is because moving objects will need to be removed
  * and re-added to the quadtree frequently dynamic tree every frame, and the other never changes.
  */
  static staticObjects = new Map(); //Objects that don't move, are added to this map and the static quadtree.
  static dynamicObjects = new Map(); //Objects that do move, are added to this map and the dynamic quadtree.
  static staticQuadTreeInvalidated = false;
  static staticQuadtree = new QuadTree(RectBounds.make(-50000, -50000, 50000, 50000));
  static dynamicQuadtree = new QuadTree(RectBounds.make(-50000, -50000, 50000, 50000));
  static add(obj, position, rotation = 0) {
    if (!obj || !position || isNaN(rotation)) throw new Error('Bad or missing parameter(s)');
    if (obj instanceof SimObject) {
      if (!obj.finalized) throw new Error(`SimObject not finalized: ${obj.name}`);
      Sim.simObjects.set(obj.name, obj);
      obj.worldPosition = position;
      obj.worldRotation = rotation;
      let qtObject = { ref: obj, position: obj.worldPosition, radius: obj.radius };
      if (obj.canMove) {
        Sim.dynamicQuadtree.insert(qtObject);
        Sim.dynamicObjects.set(obj.name, obj);
      } else {
        Sim.staticQuadtree.insert(qtObject);
        Sim.staticObjects.set(obj.name, obj);
        Sim.staticQuadTreeInvalidated = true;  
      }      
    }
    else throw new Error('Only SimObjects can be added to the Sim.');
  };
  static get(name) {
    if (Sim.simObjects.has(name)) return Sim.simObjects.get(name);
    throw new Error(`unknown object [${name}]`);
  }
  static remove(name) {
    if (Sim.simObjects.has(name)) Sim.simObjects.delete(name);
    else throw new Error('unknown object type');
  }
  static rebuildQuadTrees() {
    if (Sim.staticQuadTreeInvalidated) {
      Sim.staticQuadTreeInvalidated = false;
      Sim.staticQuadtree.clear();
      for (let simObject of Sim.simObjects.values()) {
        if (!simObject.canMove) {
          let qtObject = { ref: simObject, position: simObject.worldPosition, radius: simObject.radius };
          Sim.staticQuadtree.insert(qtObject);
        }
      }
    }
    Sim.dynamicQuadtree.clear();
    for (let simObject of Sim.simObjects.values()) {
      if (simObject.canMove) {
        let qtObject = { ref: simObject, position: simObject.worldPosition, radius: simObject.radius };
        Sim.dynamicQuadtree.insert(qtObject);
      }
    }
  }
}