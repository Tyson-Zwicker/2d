import Button from './button.js';
import GUI from './gui.js';
import GUIElement from './guielement.js';
import View from './view.js';
import SimObject from './simobject.js';

export default class GUIPanel {
  #screenPosition = { x: 0, y: 0 };
  anchor = undefined;
  #visible = true;
  /*Rewrite: 
    constructor(position, direction, constraint, flex = false) {
    
    change:

    position -> anchor. Undefined sets #position 
    IF its NOT a GUIElement or SimObject, and it has an x and y property, 
    //Set #screenCoordinates = x,y
    
    //When getting position, use #screenCoordinates if not anchored.
    //Remove #position variable.
    */
  constructor(anchor, direction, constraint, flex = false, visible = true) {
    if (!constraint||!constraint.width||!constraint.height) throw new Error ('Contraint must defined a width and height.');
    this.#visible = visible;
    if (!anchor) throw new Error('Anchor must be a point {x,y} or a SimObject or a GUIElement.');
    if (anchor instanceof GUIElement) {
      this.anchor = anchor;       //Assumed canvas upper-left corner (if undefined) or a GUIElement or SimObject
    }
    else if (anchor instanceof SimObject) {
      this.anchor = anchor;       //Assumed canvas upper-left corner (if undefined) or a GUIElement or SimObject    
    }
    else if (Object.hasOwn(anchor, 'x') && Object.hasOwn(anchor, 'y')) {
      this.#screenPosition.x = anchor.x;
      this.#screenPosition.y = anchor.y;
    } else throw new Error('Anchor must be {x,y} or SimObject or GUIElement');

    this.flex = flex;              //if true, it will shrink to only use what space it needs.
    if (direction === 'vertical' || direction === 'horizontal') {
      this.direction = direction;
    } else throw new Error('Invalid Diretion for GUIPanel construciton = ' + direction);
    this.constraint = constraint; //Constraint {width,height} to apply to individual elements (forces it to use all space)
    this.elements = [];
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
  //Either (x,y) from upperleft, or based on its anchor...
  get position() {
    if (!this.anchor) return this.#screenPosition
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
      //vertical..
      let screenCoord = View.worldToScreen({
        x: this.anchor.worldPosition.x,
        y: this.anchor.worldPosition.y + this.anchor.body.radius * 2
      });
      //horizontal..
      if (this.direction == 'horizontal') {
        screenCoord = View.worldToScreen({
          x: this.anchor.worldPosition.x + this.anchor.body.radius * 2,
          y: this.anchor.worldPosition.y
        });
      }
      return screenCoord;
    }
  }
  drawConnector(corner, size, direction) {
    View.context.fillStyle = GUI.mien.highlighted.bgColor;
    if (direction === 'vertical') {
      View.context.fillRect(corner.x, corner.y, size.width, GUI.gap);
    } else {
      View.context.fillRect(corner.x, corner.y, GUI.gap, size.height);
    }
  }
  render() {
    if (this.#visible) {
      let cursor = {};
      cursor.x = this.position.x;
      cursor.y = this.position.y;
      //Insert a small sliver here that visually attaches the panel to its anchor (if it has one)
      if (this.anchor !== undefined && this.anchor instanceof GUIElement) {
        this.drawConnector(cursor, this.anchor.drawnSize, this.direction);
        if (this.direction === 'vertical') {
          cursor.y += GUI.gap;
        } else {
          cursor.x += GUI.gap;
        }
      }
      for (let el of this.elements) {
        this.#renderElement(el, cursor);
        if (this.direction === 'vertical') {
          cursor.y += el.size.height + GUI.gap;
        } else if (this.direction === 'horizontal') {
          cursor.x += el.size.width + GUI.gap;
        } else {
          throw new Error('unknown direction: ' + this.direction);
        }
      }
    }
  }
  #renderElement(el, cursor) {
    let w = el.trimmedText.w;
    let h = el.trimmedText.h;
    let x0 = cursor.x;
    let y0 = cursor.y;
    if (this.direction === 'vertical') {
      if (w < this.constraint.width) {
        w = this.constraint.width;
      }
      if (!this.flex) {
        if (h < this.constraint.height) {
          h = this.constraint.height;
        }
      }
    }
    if (this.direction === 'horizontal') {
      if (h < this.constraint.height) {
        h = this.constraint.height;
      }
      if (!this.flex) {
        if (w < this.constraint.width) {
          w = this.constraint.width;
        }
      }
    }
    //calc bottom right..
    let x1 = x0 + w;
    let y1 = y0 + h;
    //calc "centering" offsets..    
    let verticalSpacer = (h - el.trimmedText.h) / 2 + GUI.margin;
    //update the element with rendering size and outline..
    el.drawnBounds = { x0, y0, x1, y1 };
    el.size = { width: w, height: h };

    // Get the colors to use.. 
    let mien = GUI.mien.normal;
    if (!el.active) mien = GUI.mien.shadowed;
    else {
      if (el.highlighted) mien = GUI.mien.highlighted;
      if (el.button && el.button.hovered) mien = GUI.mien.hovered;
      if (el.button && el.button.pressed) mien = GUI.mien.pressed;
      if (el.button && el.button.toggled) mien = GUI.mien.highlighted;
    }
    //draw the box..
    View.context.lineWidth = mien.borderWidth;
    View.context.strokeStyle = mien.borderColor;
    View.context.fillStyle = mien.bgColor;
    View.context.beginPath();
    View.context.rect(x0, y0, w, h);
    View.context.fill();
    View.context.stroke();
    //draw the text..
    View.context.fillStyle = mien.textColor;
    View.context.textBaseline = 'top';
    View.context.textAlign = 'left';
    View.context.font = `${mien.fontSize}px ${mien.fontName}`;
    let x = x0 + GUI.margin;
    let y = y0 + verticalSpacer;
    let i = 0;
    for (let line of el.trimmedText.lines) {
      if (el.alignment === 'center') x = x0 + (w - el.trimmedText.lineLengths[i]) / 2 + GUI.margin;
      View.context.fillText(line, x, y);
      y += GUI.lineSpace + mien.fontSize;
      i++;
    }
  }
  addText(textArray, alignment) {
    let textElement = new GUIElement(this, textArray, alignment);
    textElement.type = 'text';
    return textElement;
  }
  addButton(textArray, alignment, value, toggle, fn) {
    let buttonElement = new GUIElement(this, textArray, alignment);
    buttonElement.type = 'button';
    new Button(value, toggle, buttonElement, fn);
    return buttonElement;
  }
  addList(textArray, alignment, listItems, defaultValue, itemPanelDirection) {
    let listElement = new GUIElement(this, textArray, alignment);
    listElement.type = 'list';
    listElement.itemPanelDirection = itemPanelDirection;
    listElement.listItems = listItems;
    new Button(defaultValue, false, listElement, (r) => { listElement.attachListItemPanel(r.owner, itemPanelDirection) });
    return listElement;
  }
}
