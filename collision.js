import RectBounds from './rectbounds.js';
import Vec from './vec.js';
import Game from './game.js';
import Part from './part.js';
import GameObject from './gameobject.js';

class Collision {
  static collisions = Map();
  static #getCollisionID(gameObject1, gameObject2) {
    return gameObject1.name+'|'+gameObject2.name;
  }
  static #getaltCollisionID(gameObject1, gameObject2) {
    return gameObject2.name+'|'+gameObject1.name;
  }
  static check(gameObject) {
    let candidates = Collision.#broadPhase(gameObject);
    if (candidates.length === 0) return; //No possible collisions.
    Collision.#narrowPhase(gameObject, candidates); 
  }
  static #broadPhase(gameObject) {
    //Use the quadtree to find possible collisions.  This is the broad phase of collision detection, where we quickly eliminate anything that is not close enough to collide.  The remaining candidates will be checked more thoroughly in the narrow phase.    
    let bounds = RectBounds(gameObject.position.x - gameObject.radius, gameObject.position.y - gameObject.radius, gameObject.position.x + gameObject.radius, gameObject.position.y + gameObject.radius);
    //Ther returned objects are qtObject's: { ref: gameObject, position: obj.worldPosition, radius: obj.radius };
    let possibleCollisions = Game.quadTree.findInRange(bounds);
    let candidates = [];
    for (let candidate of possibleCollisions) {
      let gObj = candidate.ref;
      if (gObj.name === gameObject.name) continue; //Don't collide with self.
      if (Collision.collisions.has(gObj.name)) continue; //Already collided with something.
      candidates.push(gObj);
    }
    return candidates;
  }

  static #narrowPhase(gameObject, candidates) {
    //Check the candidates more thoroughly to determine if they are actually colliding.  This is the narrow phase of collision detection, where we check the actual shapes of the objects to see if they are colliding.  The broad phase is used to quickly eliminate anything that is not close enough to collide, so we only have to check a few candidates in the narrow phase.    
    for (let candidate of candidates) {
      // Step 1: Check if the distance between the centers of the two objects is less than the sum of their radii.  If not, they are not colliding.
      let dx = candidate.position.x - gameObject.position.x;
      let dy = candidate.position.y - gameObject.position.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < candidate.radius + gameObject.radius) {
        /* Step 2: If they are close enough to be colliding
        * we check narrowit even further to check which parts of the objects are colliding
        * this is done by checking the radii of the parts.  If the distance between the centers of the parts 
        * is less than the sum of their radii, then those parts are colliding.
        */
        let parts1 = gameObject.allParts;
        let parts2 = candidate.allParts;
        let collisionDetected = false;
        for (let part1 of parts1) {
          for (let part2 of parts2) {
            let dx = part2.worldPosition.x - part1.worldPosition.x;
            let dy = part2.worldPosition.y - part1.worldPosition.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < part1.radius + part2.radius) {
              collisionDetected = true;
              break;
            }
          }
          if (collisionDetected) break;
        }
      }
      if (collisionDetected) {
        Collision.collisions.set(gameObject.name, candidate.name);
        Collision.collisions.set(candidate.name, gameObject.name);
        break;
      }
    }
  }
}