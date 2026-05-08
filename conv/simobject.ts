import { Point, Vec, RectBounds } from './geometry.js';
import { Mien } from './mien.js';
import { Polygon } from './polygon.js';
import { Camera, View } from './view.js';

// ============================================================================
// Interfaces
// ============================================================================

/** Shared interface for objects that can be parents (SimObject or Part) */
export interface PartParent {
  localPosition: Point;
  localRotation: number;
  depth: number;
  parts: Part[];
}

/** World polygon ready for rendering */
interface WorldPolygon {
  mien: Mien;
  points: Point[];
}

/** Button state for interactive parts */
export interface Button {
  hovered: boolean;
  pressed: boolean;
  checkForMouse(): boolean;
}

/** Movement states for SimObject */
export type MoveState = 'always' | 'never' | 'onscreen';

// ============================================================================
// Part
// ============================================================================

export class Part implements PartParent {
  root: SimObject | undefined = undefined;
  ownPosition: Point = { x: 0, y: 0 };
  ownRotation: number = 0;
  parent: PartParent | undefined = undefined;
  localPosition: Point = { x: 0, y: 0 };
  localRotation: number = 0;
  spin: number = 0;
  name: string;
  parts: Part[] = [];
  polygons: Polygon[];
  radius: number;
  depth: number = 0;
  button: Button | undefined = undefined;

  constructor(name: string, polygons: Polygon | Polygon[]) {
    if (!name || !polygons) {
      throw new Error(`Missing parameter. name=${name} polygons=${polygons}`);
    }
    this.name = name;
    if (Array.isArray(polygons)) {
      this.polygons = [...polygons];
    } else {
      this.polygons = [polygons];
    }
    this.radius = this.calcRadius();
  }

  private calcRadius(): number {
    let maxDistance = 0;
    for (const polygon of this.polygons) {
      for (const point of polygon.points) {
        const distance = Math.sqrt(point.x * point.x + point.y * point.y);
        maxDistance = Math.max(maxDistance, distance);
      }
    }
    return maxDistance;
  }

  clone(): Part {
    return new Part(this.name, this.polygons);
  }

  get worldPosition(): Point {
    if (!this.root) throw new Error('Part not attached to SimObject');
    return Vec.add(this.root.worldPosition, this.localPosition);
  }

  get worldRotation(): number {
    if (!this.root) throw new Error('Part not attached to SimObject');
    return (this.root.worldRotation + this.localRotation) % 360;
  }

  calculateLocals(): void {
    if (!this.parent) throw new Error('Part has no parent');
    this.localRotation = (this.ownRotation + this.parent.localRotation) % 360;
    this.localPosition = Vec.add(
      this.parent.localPosition,
      Vec.rotate(this.ownPosition, this.parent.localRotation)
    );
  }

  addTo(
    parent: SimObject | Part,
    offset: Point,
    rotation: number = 0,
    depthModifier: number = 0
  ): void {
    if (!parent) throw new Error('Missing parameter (parent): ' + this.name);
    if (!offset) throw new Error('Missing parameter (offset): ' + this.name);
    if (isNaN(rotation)) throw new Error('Missing parameter (rotation): ' + this.name);

    if (parent instanceof SimObject) {
      this.root = parent;
      parent.body = this;
    } else {
      if (parent.root === undefined) {
        throw new Error('Cannot attach to an unattached object. Attach objects in parent first order.');
      }
      this.root = parent.root;
      parent.parts.push(this);
    }
    this.parent = parent;
    this.ownPosition = offset;
    this.ownRotation = rotation;
    this.depth = parent.depth + 1 + depthModifier;
    this.calculateLocals();
  }

  get(name: string): Part {
    if (this.name === name) {
      return this;
    }
    for (const part of this.parts) {
      try {
        return part.get(name);
      } catch {
        // Continue searching
      }
    }
    throw new Error(`Part [${name}] not found.`);
  }

  getWorldPolygons(): WorldPolygon[] {
    if (!this.root) throw new Error('Part not attached to SimObject');
    const worldPolygons: WorldPolygon[] = [];
    for (const polygon of this.polygons) {
      const worldPolygon: WorldPolygon = { mien: polygon.mien, points: [] };
      for (const point of polygon.points) {
        const p: Point = { x: point.x, y: point.y };
        Vec.rotateInPlace(p, this.localRotation);
        Vec.addInPlace(p, this.localPosition);
        Vec.rotateInPlace(p, this.root.worldRotation);
        Vec.addInPlace(p, this.root.worldPosition);
        Vec.subInPlace(p, Camera);
        Vec.scaleInPlace(p, Camera.zoom);
        Vec.addInPlace(p, View.screenCenter);
        worldPolygon.points.push(p);
      }
      worldPolygons.push(worldPolygon);
    }
    return worldPolygons;
  }
}

// ============================================================================
// SimObject
// ============================================================================

export class SimObject implements PartParent {
  static readonly moveStates: MoveState[] = ['always', 'never', 'onscreen'];

  readonly #localPosition: Point = { x: 0, y: 0 };
  readonly #localRotation: number = 0;

  get localPosition(): Point {
    return this.#localPosition;
  }

  get localRotation(): number {
    return this.#localRotation;
  }

  worldPosition: Point = { x: 0, y: 0 };
  worldRotation: number = 0;
  velocity: Point = { x: 0, y: 0 };
  spin: number = 0;
  name: string;
  body: Part | undefined = undefined;
  allParts: Part[] = [];
  spinningParts: Part[] = [];
  radius: number = 0;
  canMove: MoveState = 'always';
  finalized: boolean = false;
  depth: number = 0;
  button: Button | undefined = undefined;
  collides: boolean = false;
  steerable: boolean = false;
  rudder: number = 0;
  speed: number = 0;

  // For QuadTree compatibility
  get position(): Point {
    return this.worldPosition;
  }

  // Parts array (always empty for SimObject itself, children attach via body)
  get parts(): Part[] {
    return this.body?.parts ?? [];
  }

  constructor(name: string, canMove: MoveState = 'always') {
    if (!name || !SimObject.moveStates.includes(canMove)) {
      throw new Error(
        `Bad parameters: name [${name}] canMove [${canMove}] must be 'never', 'onscreen' or 'always.'`
      );
    }
    this.name = name;
    this.canMove = canMove;
  }

  finalize(): void {
    if (this.body === undefined) {
      throw new Error(`SimObject [${this.name}] has no body.`);
    }
    this.allParts = this.getAllParts(this.body);
    this.allParts.sort((a, b) => a.depth - b.depth);
    this.radius = this.calcRadius();
    this.spinningParts = this.getSpinningParts();
    this.finalized = true;
  }

  getPart(name: string): Part | undefined {
    for (const part of this.allParts) {
      if (part.name === name) return part;
    }
    return undefined;
  }

  private getAllParts(part: Part, found: Part[] = []): Part[] {
    for (const innerPart of part.parts) {
      this.getAllParts(innerPart, found);
    }
    found.push(part);
    return found;
  }

  private getSpinningParts(): Part[] {
    const spinningParts: Part[] = [];
    for (const part of this.allParts) {
      if (part.parts.length === 0 && part.spin !== 0) {
        spinningParts.push(part);
      }
    }
    return spinningParts;
  }

  private calcRadius(): number {
    let maxDistance = 0;
    for (const part of this.allParts) {
      const distance =
        Math.sqrt(part.localPosition.x ** 2 + part.localPosition.y ** 2) +
        part.radius;
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
    return maxDistance;
  }

  static isMouseIn(simObject: SimObject): boolean {
    const mouseWorld = View.mouseToWorld();
    const bounds = new RectBounds(
      simObject.worldPosition.x - simObject.radius,
      simObject.worldPosition.y - simObject.radius,
      simObject.worldPosition.x + simObject.radius,
      simObject.worldPosition.y + simObject.radius
    );
    return bounds.isPointInside(mouseWorld.x, mouseWorld.y);
  }

  move(delta: number): void {
    if (this.canMove !== 'never') {
      if (this.steerable) {
        this.worldPosition.x +=
          Math.cos(this.worldRotation * Vec.radians) * this.speed * delta;
        this.worldPosition.y +=
          Math.sin(this.worldRotation * Vec.radians) * this.speed * delta;
        this.worldRotation += this.rudder * delta;
      } else {
        this.worldPosition.x += this.velocity.x * delta;
        this.worldPosition.y += this.velocity.y * delta;
        this.worldRotation = this.worldRotation + this.spin * delta;
      }
      if (this.body) {
        this.moveParts(this.body);
      }
    }
  }

  private moveParts(part: Part): void {
    part.ownRotation = (part.ownRotation + part.spin) % 360;
    part.calculateLocals();
    for (const innerPart of part.parts) {
      this.moveParts(innerPart);
    }
  }

  render(): void {
    if (this.allParts.length === 0) {
      throw new Error(
        'No Parts found to render. SimObject has no body, or it has not been finalized.'
      );
    }
    for (const part of this.allParts) {
      try {
        const polygons = part.getWorldPolygons();
        for (const polygon of polygons) {
          if (!polygon.mien) {
            throw new Error(
              `Polygon has no Mien. SimObject.render: Object Name: ${this.name}`
            );
          }

          let fillStyle = polygon.mien.normal.bgColor;
          let strokeStyle = polygon.mien.normal.borderColor;
          let lineWidth = polygon.mien.normal.borderWidth;

          if (part.button) {
            if (part.button.hovered) {
              fillStyle = polygon.mien.hovered.bgColor;
              strokeStyle = polygon.mien.hovered.borderColor;
              lineWidth = polygon.mien.hovered.borderWidth;
            } else if (part.button.pressed) {
              fillStyle = polygon.mien.pressed.bgColor;
              strokeStyle = polygon.mien.pressed.borderColor;
              lineWidth = polygon.mien.pressed.borderWidth;
            }
          }

          const points = polygon.points;
          if (points.length === 0) continue;

          View.context.fillStyle = fillStyle;
          View.context.strokeStyle = strokeStyle;
          View.context.lineWidth = lineWidth;

          View.context.beginPath();
          View.context.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            View.context.lineTo(points[i].x, points[i].y);
          }
          View.context.closePath();
          View.context.fill();
          View.context.stroke();
        }
      } catch (e) {
        const err = e as Error;
        throw new Error(
          'Rendering Part [' + part.name + ']: ' + err.message + ' : ' + err.stack
        );
      }
    }
  }
}
