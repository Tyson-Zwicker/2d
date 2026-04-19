import { EventData } from './events.js';
import { SimObject } from './simobject.js';
import { GUIElement } from './gui.js';
export declare class Button {
    #private;
    guiElement: GUIElement | undefined;
    simObject: SimObject | undefined;
    value: unknown;
    clicked: boolean;
    clickFn: ((data: EventData) => void) | undefined;
    hovered: boolean;
    pressed: boolean;
    toggled: boolean;
    toggle: boolean;
    get owner(): GUIElement | SimObject | undefined;
    constructor(value: unknown, toggle: boolean | undefined, objectOrElement: SimObject | GUIElement, clickFn?: (data: EventData) => void);
    checkForMouse(): boolean;
}
//# sourceMappingURL=button.d.ts.map