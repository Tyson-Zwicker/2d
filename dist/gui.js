import { View } from './view.js';
import { Mien } from './mien.js';
import { SimObject } from './simobject.js';
import { Button } from './button.js';
import { Events } from './events.js';
import { Text } from './text.js';
// ============================================================================
// GUIElement
// ============================================================================
export class GUIElement {
    name = '';
    alignment;
    drawnBounds = { x0: 0, y0: 0, x1: 0, y1: 0 };
    active = true;
    highlighted = false;
    trimmedText;
    size;
    panel;
    button = undefined;
    type = 'text';
    itemPanelDirection = 'vertical';
    listItems = [];
    attachedPanel = undefined;
    constructor(panel, textArray, alignment) {
        if (alignment !== 'center' && alignment !== 'left') {
            throw new Error('invalid alignment: ' + alignment);
        }
        this.alignment = alignment;
        this.trimmedText = Text.getTextFromArray(textArray, { w: panel.constraint.width, h: panel.constraint.height, m: GUI.margin }, GUI.mien.normal.fontName, GUI.mien.normal.fontSize, GUI.lineSpace, GUI.margin);
        this.size = { width: this.trimmedText.w, height: this.trimmedText.h };
        this.panel = panel;
        panel.elements.push(this);
        GUI.elements.push(this);
    }
    get drawnSize() {
        return {
            width: this.drawnBounds.x1 - this.drawnBounds.x0,
            height: this.drawnBounds.y1 - this.drawnBounds.y0
        };
    }
    attachListItemPanel(listElement, direction) {
        const constraint = { width: listElement.size.width, height: listElement.size.height };
        const listItemPanel = new GUIPanel(listElement, direction, constraint);
        for (const item of listElement.listItems) {
            listItemPanel.addButton(item.textArray, 'center', item.value, false, (data) => {
                const anchor = data.owner;
                const parentList = anchor.panel.anchor;
                parentList.receiveListItemSelection(data);
            });
        }
        listElement.attachedPanel = listItemPanel;
    }
    receiveListItemSelection(data) {
        if (this.button) {
            this.button.value = data.value;
        }
        if (this.attachedPanel) {
            GUI.removePanel(this.attachedPanel);
            this.attachedPanel.anchor = undefined;
            this.attachedPanel = undefined;
        }
        data.owner = this;
        Events.add('listItemSelected', this.name, {
            owner: this,
            type: 'listItemSelected',
            value: data.value
        });
    }
}
// ============================================================================
// GUIPanel
// ============================================================================
export class GUIPanel {
    #screenPosition = { x: 0, y: 0 };
    anchor = undefined;
    #visible = true;
    flex;
    direction;
    constraint;
    elements = [];
    constructor(anchor, direction, constraint, flex = false, visible = true) {
        if (!constraint || !constraint.width || !constraint.height) {
            throw new Error('Constraint must define a width and height.');
        }
        this.#visible = visible;
        if (!anchor) {
            throw new Error('Anchor must be a point {x,y} or a SimObject or a GUIElement.');
        }
        if (anchor instanceof GUIElement) {
            this.anchor = anchor;
        }
        else if (anchor instanceof SimObject) {
            this.anchor = anchor;
        }
        else if ('x' in anchor && 'y' in anchor) {
            this.#screenPosition.x = anchor.x;
            this.#screenPosition.y = anchor.y;
        }
        else {
            throw new Error('Anchor must be {x,y} or SimObject or GUIElement');
        }
        this.flex = flex;
        if (direction !== 'vertical' && direction !== 'horizontal') {
            throw new Error('Invalid Direction for GUIPanel construction = ' + direction);
        }
        this.direction = direction;
        this.constraint = constraint;
        GUI.panels.push(this);
    }
    show() {
        this.#visible = true;
    }
    isVisible() {
        return this.#visible;
    }
    hide() {
        this.#visible = false;
    }
    get position() {
        if (!this.anchor)
            return this.#screenPosition;
        if (this.anchor instanceof GUIElement) {
            if (this.anchor.panel.direction === 'horizontal') {
                return { x: this.anchor.drawnBounds.x0, y: this.anchor.drawnBounds.y1 };
            }
            else if (this.anchor.panel.direction === 'vertical') {
                return { x: this.anchor.drawnBounds.x1, y: this.anchor.drawnBounds.y0 };
            }
            throw new Error('invalid direction:' + this.anchor.panel.direction);
        }
        if (this.anchor instanceof SimObject) {
            const radius = this.anchor.body?.radius ?? this.anchor.radius;
            if (this.direction === 'horizontal') {
                return View.worldToScreen({
                    x: this.anchor.worldPosition.x + radius * 2,
                    y: this.anchor.worldPosition.y
                });
            }
            return View.worldToScreen({
                x: this.anchor.worldPosition.x,
                y: this.anchor.worldPosition.y + radius * 2
            });
        }
        return this.#screenPosition;
    }
    drawConnector(corner, size, direction) {
        View.context.fillStyle = GUI.mien.highlighted.bgColor;
        if (direction === 'vertical') {
            View.context.fillRect(corner.x, corner.y, size.width, GUI.gap);
        }
        else {
            View.context.fillRect(corner.x, corner.y, GUI.gap, size.height);
        }
    }
    render() {
        if (!this.#visible)
            return;
        const cursor = { x: this.position.x, y: this.position.y };
        if (this.anchor !== undefined && this.anchor instanceof GUIElement) {
            this.drawConnector(cursor, this.anchor.drawnSize, this.direction);
            if (this.direction === 'vertical') {
                cursor.y += GUI.gap;
            }
            else {
                cursor.x += GUI.gap;
            }
        }
        for (const el of this.elements) {
            this.#renderElement(el, cursor);
            if (this.direction === 'vertical') {
                cursor.y += el.size.height + GUI.gap;
            }
            else if (this.direction === 'horizontal') {
                cursor.x += el.size.width + GUI.gap;
            }
        }
    }
    #renderElement(el, cursor) {
        let w = el.trimmedText.w;
        let h = el.trimmedText.h;
        const x0 = cursor.x;
        const y0 = cursor.y;
        if (this.direction === 'vertical') {
            if (w < this.constraint.width)
                w = this.constraint.width;
            if (!this.flex && h < this.constraint.height)
                h = this.constraint.height;
        }
        if (this.direction === 'horizontal') {
            if (h < this.constraint.height)
                h = this.constraint.height;
            if (!this.flex && w < this.constraint.width)
                w = this.constraint.width;
        }
        const x1 = x0 + w;
        const y1 = y0 + h;
        const verticalSpacer = (h - el.trimmedText.h) / 2 + GUI.margin;
        el.drawnBounds = { x0, y0, x1, y1 };
        el.size = { width: w, height: h };
        let mien = GUI.mien.normal;
        if (!el.active) {
            mien = GUI.mien.shadowed;
        }
        else {
            if (el.highlighted)
                mien = GUI.mien.highlighted;
            if (el.button?.hovered)
                mien = GUI.mien.hovered;
            if (el.button?.pressed)
                mien = GUI.mien.pressed;
            if (el.button?.toggled)
                mien = GUI.mien.highlighted;
        }
        View.context.lineWidth = mien.borderWidth;
        View.context.strokeStyle = mien.borderColor;
        View.context.fillStyle = mien.bgColor;
        View.context.beginPath();
        View.context.rect(x0, y0, w, h);
        View.context.fill();
        View.context.stroke();
        View.context.fillStyle = mien.textColor;
        View.context.textBaseline = 'top';
        View.context.textAlign = 'left';
        View.context.font = `${mien.fontSize}px ${mien.fontName}`;
        let x = x0 + GUI.margin;
        let y = y0 + verticalSpacer;
        let i = 0;
        for (const line of el.trimmedText.lines) {
            if (el.alignment === 'center') {
                x = x0 + (w - el.trimmedText.lineLengths[i]) / 2 + GUI.margin;
            }
            View.context.fillText(line, x, y);
            y += GUI.lineSpace + mien.fontSize;
            i++;
        }
    }
    addText(textArray, alignment) {
        const textElement = new GUIElement(this, textArray, alignment);
        textElement.type = 'text';
        return textElement;
    }
    addButton(textArray, alignment, value, toggle, fn) {
        const buttonElement = new GUIElement(this, textArray, alignment);
        buttonElement.type = 'button';
        new Button(value, toggle, buttonElement, fn);
        return buttonElement;
    }
    addList(textArray, alignment, listItems, defaultValue, itemPanelDirection) {
        const listElement = new GUIElement(this, textArray, alignment);
        listElement.type = 'list';
        listElement.itemPanelDirection = itemPanelDirection;
        listElement.listItems = listItems;
        new Button(defaultValue, false, listElement, (r) => {
            listElement.attachListItemPanel(r.owner, itemPanelDirection);
        });
        return listElement;
    }
}
// ============================================================================
// GUI
// ============================================================================
export class GUI {
    static elements = [];
    static panels = [];
    static mien = Mien.Green;
    static gap = 5;
    static margin = 5;
    static lineSpace = 1;
    static initialized = false;
    static initialize(gap = 5, lineSpace = 1, margin = 5, mien = Mien.Green) {
        GUI.gap = gap;
        GUI.margin = margin;
        GUI.lineSpace = lineSpace;
        GUI.elements = [];
        GUI.mien = mien;
        GUI.initialized = true;
        console.log('GUI initialized..');
    }
    static isMouseIn(element) {
        return (element.active &&
            View.mouse.x > element.drawnBounds.x0 &&
            View.mouse.x < element.drawnBounds.x1 &&
            View.mouse.y > element.drawnBounds.y0 &&
            View.mouse.y < element.drawnBounds.y1);
    }
    static render() {
        for (const p of this.panels)
            p.render();
    }
    static removePanel(panel) {
        // Recursively remove panels anchored to elements in this panel
        for (const el of panel.elements) {
            for (const pnl of this.panels) {
                if (pnl.anchor === el)
                    GUI.removePanel(pnl);
            }
        }
        // Remove elements from the global list
        GUI.elements = GUI.elements.filter((el) => !panel.elements.includes(el));
        // Remove the panel itself
        GUI.panels = GUI.panels.filter((p) => p !== panel);
    }
}
//# sourceMappingURL=gui.js.map