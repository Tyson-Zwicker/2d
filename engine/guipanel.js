import GUI from './gui.js';
import View from './view.js';
import GameObject from './gameobject.js';
export default class GUIPanel {
  #position;
  constructor(position, direction, constraint) {
    this.anchor = undefined;       //Assumed canvas upper-left corner (if undefined) or a GUIElement or GameObject
    this.#position = position;
    this.direction = direction;
    this.constraint = constraint;
    this.elements = [];
    GUI.panels.push(this);    
  }
  get position() {
    if (!this.anchor) return this.#position
    if (this.anchor instanceof GUIPanel) {
      if (this.anchor.panel.direction === 'horizontal') {
        return {
          x: this.anchor.drawnBounds.x0,
          y: this.anchor.drawnBounds.y1
        };
      }
      else if (this.anchor.panel.direction === 'vertical') {
        return {
          x: this.anchor.drawnBounds.x1,
          y: this.anchor.drawnBounds.y0
        };
      }
    }
    if (this.anchor instanceof GameObject) {
      let screenCoord = View.worldToScreen(
        {
          x: this.anchor.worldPosition.x - this.anchor.body.radius,
          y: this.anchor.worldPosition.y + this.anchor.body.radius*2 +5
        });
      return screenCoord;
    }
    console.log (this.anchor);
  }

  render() {
    let cursor = {};
    cursor.x = this.position.x;
    cursor.y = this.position.y;
    for (let el of this.elements) {
      el.render(cursor);
      if (this.direction === 'vertical') {
        cursor.y += el.size.height;
      } else if (this.direction === 'horizontal') {
        cursor.x += el.size.width;
      } else {
        throw new Error('unknown direction: ' + this.direction);
      }
    }
  }
}