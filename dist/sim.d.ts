import { Point } from './geometry.js';
import { SimObject } from './simobject.js';
import { QuadTree } from './quadtree.js';
export declare class Sim {
    static simObjects: Map<string, SimObject>;
    static names: Set<string>;
    static staticObjects: Map<string, SimObject>;
    static dynamicObjects: Map<string, SimObject>;
    static staticQuadTreeInvalidated: boolean;
    static staticQuadtree: QuadTree;
    static dynamicQuadtree: QuadTree;
    static add(obj: SimObject, position: Point, rotation?: number): void;
    static get(name: string): SimObject;
    static remove(name: string): void;
    static rebuildQuadTrees(): void;
}
//# sourceMappingURL=sim.d.ts.map