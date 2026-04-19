import { RectBounds } from './geometry.js';
import { SimObject } from './simobject.js';
export declare class QuadTree {
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
    private static pool;
    constructor(bounds: RectBounds, capacity?: number, minimumSize?: number);
    private acquire;
    private release;
    clear(): void;
    init(bounds: RectBounds, capacity: number, minimumSize: number): void;
    findInRange(rectBounds: RectBounds, found?: SimObject[]): SimObject[];
    insert(object: SimObject): boolean;
    subdivide(): void;
}
//# sourceMappingURL=quadtree.d.ts.map