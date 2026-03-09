import GUI from './gui.js';
import GUIElement from './guielement.js';
import View from './view.js';
import GameObject from './gameobject.js';
export default class GUIPanel {
  #position;
  constructor(position, direction, constraint, flex = false) {

    this.anchor = undefined;       //Assumed canvas upper-  left corner (if undefined) or a GUIElement or GameObject
    this.#position = position;     //undefined if anchored..
    this.flex = flex;
    this.direction = direction;
    this.constraint = constraint; //Constraint to apply to individual elements.
    this.elements = [];
    GUI.panels.push(this);
  }

  //Either (x,y) from upperleft, or based on its anchor...
  get position() {
    if (!this.anchor) return this.#position
    if (this.anchor instanceof GUIElement) {
      if (this.anchor.panel.direction === 'horizontal') {
        return { x: this.anchor.drawnBounds.x0, y: this.anchor.drawnBounds.y1 };
      }
      else if (this.anchor.panel.direction === 'vertical') {
        return { x: this.anchor.drawnBounds.x1, y: this.anchor.drawnBounds.y0 };
      }
      throw new Error('invalid directinon:' + this.anchor.panel.direction);
    }
    if (this.anchor instanceof GameObject) {
      let screenCoord = View.worldToScreen(
        {
          x: this.anchor.worldPosition.x - this.anchor.body.radius,
          y: this.anchor.worldPosition.y + this.anchor.body.radius * 2 + 5
        });
      return screenCoord;
    }
    console.log(this.anchor);
  }

  render() {
    let cursor = {};
    cursor.x = this.position.x;
    cursor.y = this.position.y;
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
    let verticalSpacer = (h - el.trimmedText.h) / 2;
    //update the element with rendering size and outline..
    el.drawnBounds = { x0, y0, x1, y1 };
    el.size = { width: w, height: h };

    // Get the colors to use..
    let mien = GUI.mien.normal;
    if (el.button && el.button.hovered) mien = GUI.mien.hovered;
    if (el.button && el.button.pressed) mien = GUI.mien.pressed;
    if (el.button && el.button.toggled) mien = GUI.mien.highlighted;
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
    let x = x0 + 1;
    let y = y0 + verticalSpacer;
    let i = 0;
    for (let line of el.trimmedText.lines) {
      if (el.alignment === 'center') x = x0 + (w - el.trimmedText.lineLengths[i]) / 2;
      View.context.fillText(line, x, y);
      y += GUI.lineSpace + mien.fontSize;
      i++;
    }

  }
}