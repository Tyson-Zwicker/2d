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
    mien = undefined;
    trimmedText = undefined;
    size;
    panel;
    button = undefined;
    type = 'text';
    itemPanelDirection = 'vertical';
    listItems = [];
    attachedPanel = undefined;
    graphValue = 0.5;
    constructor(panel, textArray, alignment, mien) {
        if (alignment !== 'center' && alignment !== 'left') {
            throw new Error('invalid alignment: ' + alignment);
        }
        this.alignment = alignment;
        this.mien = mien;
        const appearanceMien = this.mien ?? panel.mien ?? GUI.mien;
        if (textArray !== undefined) {
            this.trimmedText = Text.getTextFromArray(textArray, { w: panel.constraint.width, h: panel.constraint.height, m: GUI.margin }, appearanceMien.normal.fontName, appearanceMien.normal.fontSize, GUI.lineSpace, GUI.margin);
            this.size = { width: this.trimmedText.w, height: this.trimmedText.h };
        }
        else {
            this.size = { width: panel.constraint.width, height: panel.constraint.height };
        }
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
        const inheritedMien = listElement.mien ?? listElement.panel.mien;
        const listItemPanel = new GUIPanel(listElement, direction, constraint, false, true, inheritedMien);
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
    mien = undefined;
    elements = [];
    constructor(anchor, direction, constraint, flex = false, visible = true, mien) {
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
        this.mien = mien;
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
        const connectorMien = this.mien ?? GUI.mien;
        View.context.fillStyle = connectorMien.highlighted.bgColor;
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
        const textWidth = el.trimmedText?.w ?? 0;
        const textHeight = el.trimmedText?.h ?? 0;
        let w = textWidth;
        let h = textHeight;
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
        const verticalSpacer = el.trimmedText ? (h - el.trimmedText.h) / 2 + GUI.margin : 0;
        el.drawnBounds = { x0, y0, x1, y1 };
        el.size = { width: w, height: h };
        const baseMien = el.mien ?? this.mien ?? GUI.mien;
        let mien = baseMien.normal;
        if (!el.active) {
            mien = baseMien.shadowed;
        }
        else {
            if (el.highlighted)
                mien = baseMien.highlighted;
            if (el.button?.hovered)
                mien = baseMien.hovered;
            if (el.button?.pressed)
                mien = baseMien.pressed;
            if (el.button?.toggled)
                mien = baseMien.highlighted;
        }
        View.context.lineWidth = mien.borderWidth;
        View.context.strokeStyle = mien.borderColor;
        View.context.fillStyle = mien.bgColor;
        View.context.beginPath();
        View.context.rect(x0, y0, w, h);
        View.context.fill();
        View.context.stroke();
        if (el.type === 'graph') {
            this.#renderGraph(el, x0, y0, w, h, mien);
        }
        else if (el.trimmedText) {
            this.#renderTextElement(el, x0, y0, w, h, verticalSpacer, mien);
        }
    }
    #renderGraph(el, x0, y0, w, h, mien) {
        const baseMien = el.mien ?? this.mien ?? GUI.mien;
        const graphMien = el.active ? baseMien.highlighted : baseMien.shadowed;
        // Filled bar (shows graphValue percentage from bottom up)
        const barHeight = h - 2 * GUI.margin;
        const fillHeight = barHeight * Math.max(0, Math.min(1, el.graphValue));
        const filledY = y0 + h - GUI.margin - fillHeight;
        View.context.fillStyle = graphMien.bgColor;
        View.context.fillRect(x0 + GUI.margin, filledY, w - 2 * GUI.margin, fillHeight);
        // Percentage text centered
        const percentText = Math.round(el.graphValue * 100) + '%';
        View.context.fillStyle = graphMien.textColor;
        View.context.textBaseline = 'middle';
        View.context.textAlign = 'center';
        View.context.font = `${mien.fontSize}px ${mien.fontName}`;
        View.context.fillText(percentText, x0 + w / 2, y0 + h / 2);
    }
    #renderTextElement(el, x0, y0, w, h, verticalSpacer, mien) {
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
    addText(textArray, alignment, mien) {
        const textElement = new GUIElement(this, textArray, alignment, mien);
        textElement.type = 'text';
        return textElement;
    }
    addButton(textArray, alignment, value, toggle, fn, mien) {
        const buttonElement = new GUIElement(this, textArray, alignment, mien);
        buttonElement.type = 'button';
        new Button(value, toggle, buttonElement, fn);
        return buttonElement;
    }
    addList(textArray, alignment, listItems, defaultValue, itemPanelDirection, mien) {
        const listElement = new GUIElement(this, textArray, alignment, mien);
        listElement.type = 'list';
        listElement.itemPanelDirection = itemPanelDirection;
        listElement.listItems = listItems;
        new Button(defaultValue, false, listElement, (r) => {
            listElement.attachListItemPanel(r.owner, itemPanelDirection);
        });
        return listElement;
    }
    addGraph(value = 0.5, mien) {
        const graphElement = new GUIElement(this, undefined, 'center', mien);
        graphElement.type = 'graph';
        graphElement.graphValue = Math.max(0, Math.min(1, value));
        return graphElement;
    }
}
// ============================================================================
// GUI
// ============================================================================
export class GUI {
    static elements = [];
    static panels = [];
    static mien = Mien.Green;
    static gap = 3;
    static margin = 5;
    static lineSpace = 1;
    static initialized = false;
    static initialize(lineSpace = 1, margin = 3, mien = Mien.Green) {
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