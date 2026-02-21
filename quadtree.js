import Boundry from './boundary.js';
import Draw from './draw.js';

export default class Quadtree {
  constructor(bounds, capacity, minimumSize = 1) {
    if (!bounds.isBoundry()) throw (`Quadtree boundry was not a boundry: ${bounds}`);
    this.bounds = bounds; // { x1, y1, x2, y2 }
    this.capacity = capacity; // Maximum objects before subdivision
    this.minimumSize = minimumSize; // Minimum size (the side of the square, defined in world coordinates) before subdivision
    this.actors = [];
    this.divided = false;
    this.hasReachedMinimumSize = bounds.width <= minimumSize || bounds.height <= minimumSize;
  }
  clear() {
    this.actors = [];
    if (this.divided) {
      this.northeast = undefined;
      this.northwest = undefined;
      this.southeast = undefined;
      this.southwest = undefined;
      this.divided = false;
    }
  }
  findInRange(rangeBoundry, found = []) {
    let touchesThisBoundry = Boundry.touches(rangeBoundry, this.bounds)
    if (!touchesThisBoundry) return found; //Safely ignore this whole quadrant..
    for (let actor of this.actors) {
      let actorBoundry = new Boundry(
        actor.position.x - actor.radius,
        actor.position.y - actor.radius,
        actor.position.x + actor.radius,
        actor.position.y + actor.radius
      );
      if (Boundry.touches(rangeBoundry, actorBoundry)) {
        found.push(actor);                                //Anything in the same quadrant is worth looking at more closely..
      }
    }
    if (this.divided) {                                   //Probably nothing in the top level quadrant because it has been subdivided,
      this.northwest.findInRange(rangeBoundry, found);    //and the actors moved to other locations, so we check the subquadants
      this.northeast.findInRange(rangeBoundry, found);
      this.southwest.findInRange(rangeBoundry, found);
      this.southeast.findInRange(rangeBoundry, found);
    }
    return found;                                         //Recurse..
  }
  insert(actor) {
    //If the object is not in the quadtree, check if it is within the bounds
    let actorBoundry = new Boundry(
      actor.position.x - actor.radius,
      actor.position.y - actor.radius,
      actor.position.x + actor.radius,
      actor.position.y + actor.radius);

    let actorTouchesThisBoundry = Boundry.touches(this.bounds, actorBoundry);
    if (!actorTouchesThisBoundry) return false;
    //If this cannot be put into a subquadrant because it would be to big... it gets an exemption!
    let toBigtoSplit = actor.radius >= Math.min(this.bounds.width / 2, this.bounds.height / 2);
    //Insert the actor in this quadrant ONLY if there is room, BUT exceed the capacity rule if:
    //  the quadrant cannot be reduced because it is at minimize allowed size
    //  or the object would not fit in a subdivision of this quadrant
    let rules = toBigtoSplit || this.actors.length < this.capacity || this.hasReachedMinimumSize;

    if (rules) {
      this.actors.push(actor);
      return true;
    }

    //The quadrant is full, but the actor will fit in a subquarant,and there is space for another subdivision so find one for it...
    if (!this.divided) this.subdivide();
    if (!this.northeast) throw Error('subdivision failed NE.');
    if (!this.northwest) throw Error('subdivision failed NW.');
    if (!this.southeast) throw Error('subdivision failed SE.');
    if (!this.southwest) throw Error('subdivision failed SW.');
    if (this.northeast.insert(actor)) return true;
    if (this.northwest.insert(actor)) return true;
    if (this.southeast.insert(actor)) return true;
    if (this.southwest.insert(actor)) return true;
    throw new Error('Quadtree unable to insert object.');
  }
  subdivide() {
    const { x1, y1, x2, y2 } = this.bounds;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    this.northwest = new Quadtree(
      new Boundry(x1, y1, midX, midY),
      this.capacity,
      this.minimumSize
    );
    this.northeast = new Quadtree(
      new Boundry(midX, y1, x2, midY),
      this.capacity,
      this.minimumSize
    );
    this.southwest = new Quadtree(
      new Boundry(x1, midY, midX, y2),
      this.capacity,
      this.minimumSize
    );
    this.southeast = new Quadtree(
      new Boundry(midX, midY, x2, y2),
      this.capacity,
      this.minimumSize
    );

    this.divided = true;
  }

  draw(context, offsetX, offsetY, currentColorIndex) {
   
    let colors = ['#d00', '#090', '#00f'];
    if (!currentColorIndex) currentColorIndex = 0;
    let x1 = this.bounds.x1 + offsetX;
    let y1 = this.bounds.y1 + offsetY;
    let x2 = this.bounds.x2 + offsetX;
    let y2 = this.bounds.y2 + offsetY;

    Draw.rect(x1, y1, x2, y2, colors[currentColorIndex % colors.length], false);
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    if (this.northeast) this.northeast.draw(context, offsetX, offsetY, currentColorIndex);
    if (this.southeast) this.southeast.draw(context, offsetX, offsetY, currentColorIndex);
    if (this.northwest) this.northwest.draw(context, offsetX, offsetY, currentColorIndex);
    if (this.southwest) this.southwest.draw(context, offsetX, offsetY, currentColorIndex);
    for (let actor of this.actors) {
      draw.circleHex(actor.position.x + offsetX, actor.position.y + offsetY, actor.radius, '#fff');
    }
  }
}