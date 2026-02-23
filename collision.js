import RectBounds from './rectbounds.js';
import Vec from './vec.js';
import Game from './game.js';

class Collision {
  static collisions = new Map();

  static #getCollisionID(gameObject1, gameObject2) {
    return `${gameObject1.name}|${gameObject2.name}`;
  }

  static #getaltCollisionID(gameObject1, gameObject2) {
    return `${gameObject2.name}|${gameObject1.name}`;
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
        const details = Collision.#addCollisionDetails(collisionData) ?? collisionData;
        const collisionID = Collision.#getCollisionID(gameObject, candidate);
        Collision.collisions.set(collisionID, { object1: gameObject, object2: candidate, data: details });
        break;
      }
    }
  }

  static #addCollisionDetails(collisionData) {
    if (!collisionData?.part1 || !collisionData?.part2) return collisionData;

    // Calculate force vectors for each part based on the collision normal and relative velocity.
    let restitution = 0.5; // Default coefficient of restitution.
    if (collisionData.part1.restitution !== undefined) restitution = collisionData.part1.restitution;
    else if (collisionData.part2.restitution !== undefined) restitution = collisionData.part2.restitution;

    const offset = Vec.sub(collisionData.part2.worldPosition, collisionData.part1.worldPosition);
    const normalVector = Vec.magnitude(offset) === 0 ? { x: 1, y: 0 } : Vec.norm(offset);
    const velocity1 = collisionData.part1.velocity ?? collisionData.object1?.velocity ?? { x: 0, y: 0 };
    const velocity2 = collisionData.part2.velocity ?? collisionData.object2?.velocity ?? { x: 0, y: 0 };
    const relativeVelocity = Vec.sub(velocity2, velocity1);
    const velocityAlongNormal = Vec.dot(relativeVelocity, normalVector);
    if (velocityAlongNormal > 0) return collisionData; // Objects moving apart.

    let impulseMagnitude = -(1 + restitution) * velocityAlongNormal;
    impulseMagnitude /= (1 / collisionData.part1.mass) + (1 / collisionData.part2.mass);
    const impulse = Vec.scale(normalVector, impulseMagnitude);
    collisionData.forceOnPart1 = Vec.scale(impulse, -1);
    collisionData.forceOnPart2 = impulse;
    collisionData.normal = normalVector;
    collisionData.relativeVelocity = relativeVelocity;
    return collisionData;
  }
}

export default Collision;