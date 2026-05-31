import { Point, RectBounds, Vec, LineSeg } from './geometry.js';
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

  /**
   * Check if two SimObjects have unobstructed line of sight.
   * Uses quadtree broad-phase filtering followed by precise segment-circle intersection tests.
   * @param observer The observing SimObject
   * @param target The target SimObject to check visibility to
   * @param padding The padding around the segment bounding box for quadtree queries (default: 90)
   * @returns true if the target is visible from the observer, false if blocked
   */
  static canSee(
    observer: SimObject,
    target: SimObject,
    padding: number = 90
  ): boolean {
    const bounds = Sim.segmentBounds(
      observer.worldPosition,
      target.worldPosition,
      padding
    );
    const candidates: SimObject[] = [];

    Sim.staticQuadtree.findInRange(bounds, candidates);
    Sim.dynamicQuadtree.findInRange(bounds, candidates);

    const seen = new Set<string>();
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const candidate of candidates) {
      if (candidate === observer || candidate === target) continue;
      if (seen.has(candidate.name)) continue;
      seen.add(candidate.name);

      const hitDistance = Sim.segmentBlockDistance(
        observer.worldPosition,
        target.worldPosition,
        candidate.worldPosition,
        candidate.radius
      );

      if (hitDistance !== null && hitDistance < nearestDistance) {
        nearestDistance = hitDistance;
      }
    }

    return nearestDistance === Number.POSITIVE_INFINITY;
  }

  /**
   * Create a padded bounding box around a line segment for quadtree queries.
   * Padding is necessary because circles whose centers are outside the raw segment
   * bounding box can still intersect the segment.
   */
  private static segmentBounds(
    start: Point,
    end: Point,
    padding: number
  ): RectBounds {
    return new RectBounds(
      Math.min(start.x, end.x) - padding,
      Math.min(start.y, end.y) - padding,
      Math.max(start.x, end.x) + padding,
      Math.max(start.y, end.y) + padding
    );
  }

  /**
   * Test if a line segment is blocked by a circular obstacle.
   * @returns The distance from start to the blocking point, or null if not blocked
   */
  private static segmentBlockDistance(
    start: Point,
    end: Point,
    circleCenter: Point,
    radius: number
  ): number | null {
    const closest = LineSeg.closestPointOnSegment(start, end, circleCenter);
    const separation = Vec.dist(closest, circleCenter);
    if (separation > radius) return null;
    return Vec.dist(start, closest);
  }
}
