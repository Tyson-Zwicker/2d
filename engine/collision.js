import RectBounds from './rectbounds.js';
import Game from './game.js';

export default class Collision {
  static collisions = new Map();
  static #getCollisionID(gameObject1, gameObject2) {
    return `${gameObject1.name}|${gameObject2.name}`;
  }
  static #getaltCollisionID(gameObject1, gameObject2) {
    return `${gameObject2.name}|${gameObject1.name}`;
  }
  static reset(){
    this.collisions.clear();
  }
  static check(gameObject) {
    const candidates = Collision.#broadPhase(gameObject);
    if (!candidates.length) return; // No possible collisions.
    Collision.#narrowPhase(gameObject, candidates);
  }

  static #broadPhase(gameObject) {
    if (!gameObject?.worldPosition) return [];
    const { x, y } = gameObject.worldPosition;
    const bounds = RectBounds.make(
      x - gameObject.radius,
      y - gameObject.radius,
      x + gameObject.radius,
      y + gameObject.radius
    );
    // Returned objects are qtObject's: { ref: gameObject, position: obj.worldPosition, radius: obj.radius }.
    const possibleCollisions = [];
    const quadTrees = [Game.dynamicQuadtree, Game.staticQuadtree, Game.quadTree];
    for (const tree of quadTrees) {
      if (tree?.findInRange) tree.findInRange(bounds, possibleCollisions);
    }
    const candidates = [];
    const seenNames = new Set();
    for (const candidate of possibleCollisions) {
      const gObj = candidate?.ref ?? candidate;
      if (!gObj?.name || gObj.name === gameObject.name) continue; // Skip self or invalid entries.
      const collisionID = Collision.#getCollisionID(gameObject, gObj);
      const altCollisionID = Collision.#getaltCollisionID(gameObject, gObj);
      if (Collision.collisions.has(collisionID) || Collision.collisions.has(altCollisionID)) continue; // Already tracked.
      if (seenNames.has(gObj.name)) continue; // Prevent duplicate candidates when querying multiple quadtrees.
      candidates.push(gObj);
      seenNames.add(gObj.name);
    }
    return candidates;
  }

  static #narrowPhase(gameObject, candidates) {
    // Check the candidates more thoroughly to determine if they are actually colliding.
    for (const candidate of candidates) {
      const collisionData = { object1: gameObject, object2: candidate };
      const dx = candidate.worldPosition.x - gameObject.worldPosition.x;
      const dy = candidate.worldPosition.y - gameObject.worldPosition.y;
      const distance = Math.hypot(dx, dy);
      let collisionDetected = false;

      if (distance < candidate.radius + gameObject.radius) {
        // Within enclosing radii, so check individual parts.
        const parts1 = gameObject.allParts;
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
        const collisionID = Collision.#getCollisionID(gameObject, candidate);
        Collision.collisions.set(collisionID, { object1: gameObject, object2: candidate});
        break;
      }
    }
  }
}