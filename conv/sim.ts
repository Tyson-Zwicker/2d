import { Point, RectBounds, Vec } from './geometry.js';
import { SimObject } from './simobject.js';
import { CollisionPair, QuadTree } from './quadtree.js';

export class Sim {
  static simObjects: Map<string, SimObject> = new Map();

  /*
   * There are two quadtrees. One is for things that don't move (static) and the other is
   * for things that do move (dynamic). This is because moving objects will need to be removed
   * and re-added to the quadtree frequently (dynamic tree every frame), and the other never changes.
   */
  static names: Set<string> = new Set();
  static staticObjects: Map<string, SimObject> = new Map();
  static dynamicObjects: Map<string, SimObject> = new Map();
  static staticQuadTreeInvalidated: boolean = false;
  static staticQuadtree: QuadTree = new QuadTree(
    new RectBounds(-500000, -500000, 500000, 500000)
  );
  static dynamicQuadtree: QuadTree = new QuadTree(
    new RectBounds(-500000, -500000, 500000, 500000)
  );
  static dynamicCollisionPairs: CollisionPair[] = [];

  static add(obj: SimObject, position: Point, rotation: number = 0): void {
    if (typeof position.x !== 'number') {
      throw new Error(
        `Bad position parameter for ${obj.name} = ${position.x},${position.y}`
      );
    }
    if (typeof position.y !== 'number') {
      throw new Error(
        `Bad position parameter for ${obj.name} = ${position.x},${position.y}`
      );
    }
    if (Sim.names.has(obj.name)) {
      throw new Error('SimObject with name already exists: ' + obj.name);
    }
    if (!obj.finalized) {
      throw new Error(`SimObject not finalized: ${obj.name}`);
    }

    Sim.simObjects.set(obj.name, obj);
    Sim.names.add(obj.name);
    obj.worldPosition = position;
    obj.worldRotation = rotation;

    if (obj.canMove === 'always' || obj.canMove === 'onscreen') {
      Sim.dynamicQuadtree.insert(obj);
      Sim.dynamicObjects.set(obj.name, obj);
    } else if (obj.canMove === 'never') {
      Sim.staticQuadtree.insert(obj);
      Sim.staticObjects.set(obj.name, obj);
      Sim.staticQuadTreeInvalidated = true;
    } else {
      throw new Error(`unexpected canMove property ${obj.canMove}`);
    }
  }

  static get(name: string): SimObject {
    if (Sim.simObjects.has(name)) {
      return Sim.simObjects.get(name)!;
    }
    throw new Error(`unknown object [${name}]`);
  }

  static remove(name: string): void {
    if (Sim.simObjects.has(name)) {
      Sim.simObjects.delete(name);
      Sim.names.delete(name);
      Sim.staticObjects.delete(name);
      Sim.dynamicObjects.delete(name);
    } else {
      throw new Error('unknown object: ' + name);
    }
  }

  static rebuildQuadTrees(): void {
    if (Sim.staticQuadTreeInvalidated) {
      Sim.staticQuadTreeInvalidated = false;
      Sim.staticQuadtree.clear();
      for (const simObject of Sim.staticObjects.values()) {
        Sim.staticQuadtree.insert(simObject);
      }
    }

    Sim.dynamicQuadtree.clear();
    for (const simObject of Sim.dynamicObjects.values()) {
      Sim.dynamicQuadtree.insert(simObject);
    }
  }

  static detectDynamicCollisions(): CollisionPair[] {
    Sim.rebuildQuadTrees();
    Sim.dynamicCollisionPairs = Sim.dynamicQuadtree.findCollisionPairs();
    return Sim.dynamicCollisionPairs;
  }

  static resolveDynamicCollisions(elasticity: number): CollisionPair[] {
    const collisionPairs = Sim.detectDynamicCollisions();

    for (const { objectA, objectB } of collisionPairs) {
      const response = Vec.collisionResponse(objectA, objectB, elasticity);
      objectA.applyCollisionFrom(objectB, response.velocityA, response.correctionA);
      objectB.applyCollisionFrom(objectA, response.velocityB, response.correctionB);
    }

    return collisionPairs;
  }
}
