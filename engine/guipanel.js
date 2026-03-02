import GameObject from './gameobject.js';
import GUI from './gui.js';
import GUIElement from './guielement.js';
import View from './view.js';

class GUIPanel {
  #anchor = undefined; //either 'top','left',or another GUI element or a game object which will be its 'top; or left

  //NO MORE WORRYING ABOUT WRIING RIGHT TO LEFT OR BOTTOM TO TOP.

  position = undefined; // Only the fly calc.  The top-left corner of the panel. THey ALL DRAW left-to-right to Top-to-bottom
  direction = undefined; //Either 'vertical' or 'horizontal'
  constraints = undefined; //Set by GUI when Enabled
  elements = [];           //Add by GUI when addText/Button/List is called.
  #size = undefined;       //set on calling size the first time if it isn't set.  

  constructor(anchor, direction, constraints) {
    if (typeof anchor === 'string') {
      if (anchor !== 'top' || anchor !== 'left') throw new Error('Cannot anchor to the bottom or right panels.');
    } else {
      if (!(anchor instanceof GUIElement || anchor instanceof GameObject)) {
        throw new Error('Anchor must be one side of the screen or a GUIElement connected to one.');
      }
    }
    this.anchor = anchor;
    this.direction = direction;
    this.constraints = constraints;
  }

  get size() {
    if (this.#size) return this.#size;
    let s = { width: 0, height: 0 };
    for (let el of this.elements) {
      if (s.width < el.size.width) s.width = el.size.width;
      if (s.height < el.size.height) s.height = el.size.height;
    }
    this.#size = s;
    return s;
  }

  get position() {
    //Set top-left start position based on own element sizes and anchor type.
    if (typeof this.#anchor === 'string') {
      switch (this.#anchor) {
        case 'top': return { x: 0, y: 0 };
        case 'left': return { x: 0, y: 0 };
        case 'bottom': return { x: 0, y: View.canvas.height - this.size.height };
        case 'right': return ({ x: View.canvas.width - this.size.width, y: 0 });
      }
    }
    else if (this.anchor instanceof GUIElement) {
      let a = this.#anchor;
      switch (a.anchor) {
        case 'top': return ({ x: a.position.x, y: a.position.y + a.size.height });
        case 'left': return ({ x: a.position.x + a.size.width, y: a.position.y });
        default: throw Error('cannot anchor to bottom or right panels.');
      }
    }
    throw new Error('cannot calculate position.');
  }
  render() {
    let cursor = structuredClone(this.position);
    for (let el in this.elements) {
      el.render(cursor);
      if (this.direction === 'horizontal') {
        cursor.x += el.size.width + GUI.gap;
      } else {
        cursor.y += el.size.height + GUI.gap;
      }
    }
  }
  static makeLeftPanel(minCellWidth, maxCellWidth) {
    let p = new GUIPanel(
      'left',
      'vertical',
      { max: { width: maxCellWidth, height: -1 }, min: { width: minCellWidth, height: -1 } }
    );
    GUI.panels.set('left', p);
    return p;
  }
  static makeRightPanel(minCellWidth, maxCellWidth) {
    let p = new GUIPanel(
      'right',
      'vertical',
      { max: { width: maxCellWidth, height: -1 }, min: { width: minCellWidth, height: -1 } }
    );
    GUI.panels.set('right', p);
    return p;
  }
  static makeTopPanel(minCellHeight, maxCellHeight) {
    let p = new GUIPanel(
      'top',
      'horizontal',
      { max: { width: -1, height: maxCellHeight }, min: { width: -1, height: minCellHeight } }
    );
    GUI.panels.set('top', p);
    return p;
  }
  static makeBottonPanel(minCellHeigth, maxCellHeight) {
    let p = new GUIPanel(
      'bottom',
      'horizontal',
      { max: { width: -1, height: maxCellHeight }, min: { width: -1, height: minCellHeigth } }
    );
    GUI.panels.set('bottom', p);
    return p;
  }
  /*
  static makeAttachedPanel(anchor, direction, minCellWidth, maxCellWidth, minCellHieght, maxCellHeight) {
    let p = new GUIPanel(
      anchor,
      direction,
      { max: { width: maxCellWidth, height: maxCellHeight }, min: { width: minCellWidth, height: minCellHieght } }
    );
    GUI.panels.set('list', p);
    return p;
  }
    */
}