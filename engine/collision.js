import RectBounds from './rectbounds.js';
import Sim from './sim.js';

export default class Collision {
  static collisions = new Map();
  static #getCollisionID(simObject1, simObject2) {
    return `${simObject1.name}|${simObject2.name}`;
  }
  static #getaltCollisionID(simObject1, simObject2) {
    return `${simObject2.name}|${simObject1.name}`;
  }
  static reset(){
    this.collisions.clear();
  }
  static check(simObject) {
    const candidates = Collision.#broadPhase(simObject);
    if (!candidates.length) return; // No possible collisions.
    Collision.#narrowPhase(simObject, candidates);
  }
  static #broadPhase(simObject) {
    if (!simObject?.worldPosition) return [];
    const { x, y } = simObject.worldPosition;
    const bounds = RectBounds.make(
      x - simObject.radius,
      y - simObject.radius,
      x + simObject.radius,
      y + simObject.radius
    );
    // Returned objects are qtObject's: { ref: simObject, position: obj.worldPosition, radius: obj.radius }.
    const possibleCollisions = [];
    const quadTrees = [Sim.dynamicQuadtree, Sim.staticQuadtree, Sim.quadTree];
    for (const tree of quadTrees) {
      if (tree?.findInRange) tree.findInRange(bounds, possibleCollisions);
    }
    const candidates = [];
    const seenNames = new Set();
    for (const candidate of possibleCollisions) {
      const gObj = candidate?.ref ?? candidate;
      if (!gObj?.name || gObj.name === simObject.name) continue; // Skip self or invalid entries.
      const collisionID = Collision.#getCollisionID(simObject, gObj);
      const altCollisionID = Collision.#getaltCollisionID(simObject, gObj);
      if (Collision.collisions.has(collisionID) || Collision.collisions.has(altCollisionID)) continue; // Already tracked.
      if (seenNames.has(gObj.name)) continue; // Prevent duplicate candidates when querying multiple quadtrees.
      candidates.push(gObj);
      seenNames.add(gObj.name);
    }
    return candidates;
  }

  static #narrowPhase(simObject, candidates) {
    // Check the candidates more thoroughly to determine if they are actually colliding.
    for (const candidate of candidates) {
      const collisionData = { object1: simObject, object2: candidate };
      const dx = candidate.worldPosition.x - simObject.worldPosition.x;
      const dy = candidate.worldPosition.y - simObject.worldPosition.y;
      const distance = Math.hypot(dx, dy);
      let collisionDetected = false;
      if (distance < candidate.radius + simObject.radius) {
        // Within enclosing radii, so check individual parts.
        const parts1 = simObject.allParts;
        const parts2 = candidate.allParts;
        for (const part1 of parts1) {
          for (const part2 of parts2) {
            const partDx = part2.worldPosition.x - part1.worldPosition.x;
            const partDy = part2.worldPosition.y - part1.worldPosition.y;
            const partDistance = Math.hypot(partDx, partDy);
            if (partDistance < part1.radius + part2.radius) {
              collisionData.part1 = part1;
              collisionData.part2 = part2;
              collisionDetected = true;
              break;
            }
          }
          if (collisionDetected) break;
        }
      }
      if (collisionDetected) {
        const collisionID = Collision.#getCollisionID(simObject, candidate);
        Collision.collisions.set(collisionID, { object1: simObject, object2: candidate});
        break;
      }
    }
  }
}