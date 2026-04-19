import { Point } from './geometry.js';
import { Mien } from './mien.js';
import { Polygon } from './polygon.js';
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
export declare class Part implements PartParent {
    root: SimObject | undefined;
    ownPosition: Point;
    ownRotation: number;
    parent: PartParent | undefined;
    localPosition: Point;
    localRotation: number;
    spin: number;
    name: string;
    parts: Part[];
    polygons: Polygon[];
    radius: number;
    depth: number;
    button: Button | undefined;
    constructor(name: string, polygons: Polygon | Polygon[]);
    private calcRadius;
    clone(): Part;
    get worldPosition(): Point;
    get worldRotation(): number;
    calculateLocals(): void;
    addTo(parent: SimObject | Part, offset: Point, rotation?: number, depthModifier?: number): void;
    get(name: string): Part;
    getWorldPolygons(): WorldPolygon[];
}
export declare class SimObject implements PartParent {
    #private;
    static readonly moveStates: MoveState[];
    get localPosition(): Point;
    get localRotation(): number;
    worldPosition: Point;
    worldRotation: number;
    velocity: Point;
    spin: number;
    name: string;
    body: Part | undefined;
    allParts: Part[];
    spinningParts: Part[];
    radius: number;
    canMove: MoveState;
    finalized: boolean;
    depth: number;
    button: Button | undefined;
    collides: boolean;
    steerable: boolean;
    rudder: number;
    speed: number;
    get position(): Point;
    get parts(): Part[];
    constructor(name: string, canMove?: MoveState);
    finalize(): void;
    getPart(name: string): Part | undefined;
    private getAllParts;
    private getSpinningParts;
    private calcRadius;
    static isMouseIn(simObject: SimObject): boolean;
    move(delta: number): void;
    private moveParts;
    render(): void;
}
export {};
//# sourceMappingURL=simobject.d.ts.map