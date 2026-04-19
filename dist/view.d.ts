import { Point, RectBounds } from './geometry.js';
/** Mouse state tracking */
interface MouseState {
    x: number;
    y: number;
    buttonDown: boolean;
}
export declare class Camera {
    #private;
    static get zoom(): number;
    static set zoom(newZoom: number);
    static get zoomFactor(): number;
    static get x(): number;
    static get y(): number;
    static set x(val: number);
    static set y(val: number);
    static setCameraBounds(): void;
    static get cameraBounds(): RectBounds;
    static get canMove(): boolean;
    static anchorTo(simObject: Point): void;
    static freeAnchor(): void;
    static get isPanning(): boolean;
    static panTo(x: number, y: number, zoom?: number): void;
    static move(): void;
    static moveToUpperLeftScreen(): void;
}
export declare class View {
    static canvas: HTMLCanvasElement;
    static context: CanvasRenderingContext2D;
    static bgPressed: boolean;
    static bgPressCoord: Point | undefined;
    static bgColor: string;
    static mouse: MouseState;
    static screenCenter: Point;
    static initialize(): void;
    static screenToWorld(x: number, y: number): Point;
    static mouseToWorld(): Point;
    static worldToScreen(w: Point): Point;
    static canSee(point: Point, radius?: number): boolean;
    static clear(): void;
    static handleCameraDrag(mouseInteractedWithSomething: boolean): void;
    static cancelDrag(): void;
    static handleContextMenu: (event: MouseEvent) => boolean;
    static handleMouseMove: (event: MouseEvent) => void;
    static handleMouseDown: (event: MouseEvent) => boolean | void;
    static handleMouseUp: (_event: MouseEvent) => void;
    static handleWheel: (event: WheelEvent) => void;
    static resizeCanvas(): void;
}
export {};
//# sourceMappingURL=view.d.ts.map