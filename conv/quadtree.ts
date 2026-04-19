import { Point, RectBounds } from './geometry.js';
import { SimObject } from './simobject.js';

// ============================================================================
// QuadTree
// ============================================================================

export class QuadTree {
  bounds: RectBounds;
  capacity: number;
  minimumSize: number;
  objects: SimObject[];
  divided: boolean;
  hasReachedMinimumSize: boolean;

  northeast: QuadTree | undefined;
  northwest: QuadTree | undefined;
  southeast: QuadTree | undefined;
  southwest: QuadTree | undefined;

  // Shared pool across all QuadTree instances
  private static pool: QuadTree[] = [];

  constructor(bounds: RectBounds, capacity: number = 4, minimumSize: number = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.minimumSize = minimumSize;
    this.objects = [];
    this.divided = false;
    this.hasReachedMinimumSize = false;
    this.init(bounds, capacity, minimumSize);
  }

  private acquire(
    bounds: RectBounds,
    capacity: number = this.capacity,
    minimumSize: number = this.minimumSize
  ): QuadTree {
    const node = QuadTree.pool.length
      ? QuadTree.pool.pop()!
      : new QuadTree(bounds, capacity, minimumSize);
    node.init(bounds, capacity, minimumSize);
    return node;
  }

  private release(node: QuadTree | undefined): void {
    if (!node) return;
    node.clear();
    QuadTree.pool.push(node);
  }

  clear(): void {
    this.objects.length = 0;
    if (this.divided) {
      this.release(this.northeast);
      this.release(this.northwest);
      this.release(this.southeast);
      this.release(this.southwest);
      this.northeast = undefined;
      this.northwest = undefined;
      this.southeast = undefined;
      this.southwest = undefined;
      this.divided = false;
    }
  }

  init(bounds: RectBounds, capacity: number, minimumSize: number): void {
    if (!bounds.isValid) {
      throw new Error(`Quadtree boundary was not valid: ${JSON.stringify(bounds)}`);
    }
    this.bounds = bounds;
    this.capacity = capacity;
    this.minimumSize = minimumSize;
    this.objects = this.objects || [];
    this.objects.length = 0;
    this.divided = false;
    this.northeast = undefined;
    this.northwest = undefined;
    this.southeast = undefined;
    this.southwest = undefined;
    this.hasReachedMinimumSize =
      bounds.width <= minimumSize || bounds.height <= minimumSize;
  }

  findInRange(rectBounds: RectBounds, found: SimObject[] = []): SimObject[] {
    const touchesThisBoundary = rectBounds.touches(this.bounds);
    if (!touchesThisBoundary) return found;

    for (const object of this.objects) {
      const objectBoundary = new RectBounds(
        object.position.x - object.radius,
        object.position.y - object.radius,
        object.position.x + object.radius,
        object.position.y + object.radius
      );
      if (rectBounds.touches(objectBoundary)) {
        found.push(object);
      }
    }

    if (this.divided) {
      this.northwest!.findInRange(rectBounds, found);
      this.northeast!.findInRange(rectBounds, found);
      this.southwest!.findInRange(rectBounds, found);
      this.southeast!.findInRange(rectBounds, found);
    }

    return found;
  }

  insert(object: SimObject): boolean {
    if (isNaN(object.radius)) {
      throw new Error(`Sim Object ${object.name} has bad radius: ${object.radius}`);
    }

    const objectBoundary = new RectBounds(
      object.position.x - object.radius,
      object.position.y - object.radius,
      object.position.x + object.radius,
      object.position.y + object.radius
    );

    const objectTouchesThisBoundary = this.bounds.touches(objectBoundary);
    if (!objectTouchesThisBoundary) return false;

    const width = this.bounds.width;
    const height = this.bounds.height;
    const tooBigToSplit = object.radius >= Math.min(width / 2, height / 2);

    const rules =
      tooBigToSplit ||
      this.objects.length < this.capacity ||
      this.hasReachedMinimumSize;

    if (rules) {
      this.objects.push(object);
      return true;
    }

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

  subdivide(): void {
    const { x0, y0, x1, y1 } = this.bounds;
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;

    this.northwest = this.acquire(
      new RectBounds(x0, y0, midX, midY),
      this.capacity,
      this.minimumSize
    );
    this.northeast = this.acquire(
      new RectBounds(midX, y0, x1, midY),
      this.capacity,
      this.minimumSize
    );
    this.southwest = this.acquire(
      new RectBounds(x0, midY, midX, y1),
      this.capacity,
      this.minimumSize
    );
    this.southeast = this.acquire(
      new RectBounds(midX, midY, x1, y1),
      this.capacity,
      this.minimumSize
    );

    this.divided = true;
  }
}
