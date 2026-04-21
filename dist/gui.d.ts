import { Point } from './geometry.js';
import { Mien } from './mien.js';
import { SimObject } from './simobject.js';
import { EventData } from './events.js';
import { Text } from './text.js';
export interface ButtonInterface {
    hovered: boolean;
    pressed: boolean;
    toggled: boolean;
    checkForMouse(): boolean;
    value: unknown;
}
interface DrawnBounds {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}
interface Constraint {
    width: number;
    height: number;
}
interface ListItem {
    textArray: string[];
    value: unknown;
}
type PanelDirection = 'vertical' | 'horizontal';
type ElementAlignment = 'center' | 'left';
type ElementType = 'text' | 'button' | 'list' | 'graph';
export declare class GUIElement {
    name: string;
    alignment: ElementAlignment;
    drawnBounds: DrawnBounds;
    active: boolean;
    highlighted: boolean;
    mien: Mien | undefined;
    trimmedText: Text | undefined;
    size: {
        width: number;
        height: number;
    };
    panel: GUIPanel;
    button: ButtonInterface | undefined;
    type: ElementType;
    itemPanelDirection: PanelDirection;
    listItems: ListItem[];
    attachedPanel: GUIPanel | undefined;
    graphValue: number;
    constructor(panel: GUIPanel, textArray: string[] | undefined, alignment: ElementAlignment, mien?: Mien);
    get drawnSize(): {
        width: number;
        height: number;
    };
    attachListItemPanel(listElement: GUIElement, direction: PanelDirection): void;
    receiveListItemSelection(data: {
        value: unknown;
        owner?: {
            name: string;
        };
    }): void;
}
export declare class GUIPanel {
    #private;
    anchor: GUIElement | SimObject | undefined;
    flex: boolean;
    direction: PanelDirection;
    constraint: Constraint;
    mien: Mien | undefined;
    elements: GUIElement[];
    constructor(anchor: Point | GUIElement | SimObject, direction: PanelDirection, constraint: Constraint, flex?: boolean, visible?: boolean, mien?: Mien);
    show(): void;
    isVisible(): boolean;
    hide(): void;
    get position(): Point;
    drawConnector(corner: Point, size: {
        width: number;
        height: number;
    }, direction: PanelDirection): void;
    render(): void;
    addText(textArray: string[], alignment: ElementAlignment, mien?: Mien): GUIElement;
    addButton(textArray: string[], alignment: ElementAlignment, value: unknown, toggle: boolean, fn?: (data: EventData) => void, mien?: Mien): GUIElement;
    addList(textArray: string[], alignment: ElementAlignment, listItems: ListItem[], defaultValue: unknown, itemPanelDirection: PanelDirection, mien?: Mien): GUIElement;
    addGraph(value?: number, mien?: Mien): GUIElement;
}
export declare class GUI {
    static elements: GUIElement[];
    static panels: GUIPanel[];
    static mien: Mien;
    static gap: number;
    static margin: number;
    static lineSpace: number;
    static initialized: boolean;
    static initialize(lineSpace?: number, margin?: number, mien?: Mien): void;
    static isMouseIn(element: GUIElement): boolean;
    static render(): void;
    static removePanel(panel: GUIPanel): void;
}
export {};
//# sourceMappingURL=gui.d.ts.map