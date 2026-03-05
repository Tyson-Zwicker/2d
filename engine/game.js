import GameObject from './gameobject.js';
import QuadTree from './quadtree.js';
import RectBounds from './rectbounds.js';
export default class Game {
  static gameObjects = new Map();
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
    if (obj instanceof GameObject) {
      if (!obj.finalized) throw new Error(`Game Object not finalized: ${obj.name}`);
      Game.gameObjects.set(obj.name, obj);
      obj.worldPosition = position;
      obj.worldRotation = rotation;
      let qtObject = { ref: obj, position: obj.worldPosition, radius: obj.radius };
      if (obj.canMove) {
        Game.dynamicQuadtree.insert(qtObject);
        Game.dynamicObjects.set(obj.name, obj);
      } else {
        Game.staticQuadtree.insert(qtObject);
        Game.staticObjects.set(obj.name, obj);
        Game.staticQuadTreeInvalidated = true;  
      }      
    }
    else throw new Error('Only Game Objects can be added to the Game.');
  };
  static get(name) {
    if (Game.gameObjects.has(name)) return Game.gameObjects.get(name);
    throw new Error(`unknown object [${name}]`);
  }
  static remove(name) {
    if (Game.gameObjects.has(name)) Game.gameObjects.delete(name);
    else throw new Error('unknown object type');
  }
  static rebuildQuadTrees() {
    if (Game.staticQuadTreeInvalidated) {
      Game.staticQuadTreeInvalidated = false;
      Game.staticQuadtree.clear();
      for (let gameObject of Game.gameObjects.values()) {
        if (!gameObject.canMove) {
          let qtObject = { ref: gameObject, position: gameObject.worldPosition, radius: gameObject.radius };
          Game.staticQuadtree.insert(qtObject);
        }
      }
    }
    Game.dynamicQuadtree.clear();
    for (let gameObject of Game.gameObjects.values()) {
      if (gameObject.canMove) {
        let qtObject = { ref: gameObject, position: gameObject.worldPosition, radius: gameObject.radius };
        Game.dynamicQuadtree.insert(qtObject);
      }
    }
  }
}