import { Point, RectBounds } from './geometry.js';
export interface ButtonInterface {
    hovered: boolean;
    pressed: boolean;
    checkForMouse(): boolean;
}
export declare class GUIElement {
    name: string;
    position: Point;
    size: Point;
    button: ButtonInterface | undefined;
    constructor(name: string, position: Point, size: Point);
    get bounds(): RectBounds;
}
//# sourceMappingURL=guielement.d.ts.map