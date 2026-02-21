import RectBounds from './rectBounds.js';

export default class QuadTree {
  constructor(bounds, capacity = 1, minimumSize = 1) {
    if (!RectBounds.isValidRectBound(bounds)) throw new Error(`Quadtree boundary was not valid: ${JSON.stringify(bounds)}`);
    this.bounds = bounds;
    this.capacity = capacity; // Maximum objects before subdivision
    this.minimumSize = minimumSize; // Minimum side length (world units) before subdivision
    this.objects = [];
    this.divided = false;
    this.hasReachedMinimumSize = RectBounds.width(bounds) <= minimumSize || RectBounds.height(bounds) <= minimumSize;
  }
  clear() {
    this.objects = [];
    if (this.divided) {
      this.northeast = undefined;
      this.northwest = undefined;
      this.southeast = undefined;
      this.southwest = undefined;
      this.divided = false;
    }
  }
  findInRange(rectBounds, found = []) {
    const touchesThisBoundary = RectBounds.touches(rectBounds, this.bounds);
    if (!touchesThisBoundary) return found; // Safely ignore this whole quadrant

    for (const object of this.objects) {
      const objectBoundary = RectBounds.make(
        object.position.x - object.radius,
        object.position.y - object.radius,
        object.position.x + object.radius,
        object.position.y + object.radius
      );
      if (RectBounds.touches(rectBounds, objectBoundary)) {
        found.push(object); // Anything in the same quadrant is worth looking at more closely
      }
    }

    if (this.divided) { // Probably nothing in the top level quadrant because it has been subdivided,
      this.northwest.findInRange(rectBounds, found); // so we check the subquadrants
      this.northeast.findInRange(rectBounds, found);
      this.southwest.findInRange(rectBounds, found);
      this.southeast.findInRange(rectBounds, found);
    }
    return found; // Recurse
  }
  insert(object) {
    //If the object is not in the quadtree, check if it is within the bounds
    const objectBoundary = RectBounds.make(
      object.position.x - object.radius,
      object.position.y - object.radius,
      object.position.x + object.radius,
      object.position.y + object.radius);

    const objectTouchesThisBoundary = RectBounds.touches(this.bounds, objectBoundary);
    if (!objectTouchesThisBoundary) return false;

    const width = RectBounds.width(this.bounds);
    const height = RectBounds.height(this.bounds);
    const toBigToSplit = object.radius >= Math.min(width / 2, height / 2);
    // Insert the object in this quadrant ONLY if there is room, BUT exceed the capacity rule if:
    //  the quadrant cannot be reduced because it is at minimum allowed size
    //  or the object would not fit in a subdivision of this quadrant
    const rules = toBigToSplit || this.objects.length < this.capacity || this.hasReachedMinimumSize;

    if (rules) {
      this.objects.push(object);
      return true;
    }

    // The quadrant is full, but the object will fit in a subquadrant, and there is space for another subdivision so find one for it...
    if (!this.divided) this.subdivide();
    if (!this.northeast) throw new Error('subdivision failed NE.');
    if (!this.northwest) throw new Error('subdivision failed NW.');
    if (!this.southeast) throw new Error('subdivision failed SE.');
    if (!this.southwest) throw new Error('subdivision failed SW.');
    if (this.northeast.insert(object)) return true;
    if (this.northwest.insert(object)) return true;
    if (this.southeast.insert(object)) return true;
    if (this.southwest.insert(object)) return true;
    throw new Error('Quadtree unable to insert object.');
  }
  subdivide() {
    const { x0, y0, x1, y1 } = this.bounds;
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;

    this.northwest = new QuadTree(
      RectBounds.make(x0, y0, midX, midY),
      this.capacity,
      this.minimumSize
    );
    this.northeast = new QuadTree(
      RectBounds.make(midX, y0, x1, midY),
      this.capacity,
      this.minimumSize
    );
    this.southwest = new QuadTree(
      RectBounds.make(x0, midY, midX, y1),
      this.capacity,
      this.minimumSize
    );
    this.southeast = new QuadTree(
      RectBounds.make(midX, midY, x1, y1),
      this.capacity,
      this.minimumSize
    );

    this.divided = true;
  }

  draw(context, offsetX = 0, offsetY = 0, currentColorIndex = 0) {
    const colors = ['#d00', '#090', '#00f'];
    const { x0, y0, x1, y1 } = this.bounds;
    const width = RectBounds.width(this.bounds);
    const height = RectBounds.height(this.bounds);

    context.save();
    context.strokeStyle = colors[currentColorIndex % colors.length];
    context.lineWidth = 1;
    context.strokeRect(x0 + offsetX, y0 + offsetY, width, height);
    context.restore();

    const nextColorIndex = (currentColorIndex + 1) % colors.length;
    if (this.northeast) this.northeast.draw(context, offsetX, offsetY, nextColorIndex);
    if (this.southeast) this.southeast.draw(context, offsetX, offsetY, nextColorIndex);
    if (this.northwest) this.northwest.draw(context, offsetX, offsetY, nextColorIndex);
    if (this.southwest) this.southwest.draw(context, offsetX, offsetY, nextColorIndex);

    context.save();
    context.strokeStyle = '#fff';
    for (const object of this.objects) {
      context.beginPath();
      context.arc(object.position.x + offsetX, object.position.y + offsetY, object.radius, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }
}