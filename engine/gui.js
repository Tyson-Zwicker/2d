import Mien from './mien.js';
import View from './view.js';
export default class GUI {
  static elements = [];
  static panels = [];
  static mien = undefined;  //set in constructor
  static gap = 5;           //set in constructor - the gap between GUIElements.
  //set in constructor
  static initialized = false;
   //padding {w,h,g} 
   // w = padding from left and right.
   // h = padding from top and bottom.
   // g = vertical space between text lines;
   
  static initialize(gap =5, lineSpace = 1,mien = Mien.Green) {
    GUI.gap = gap;
    GUI.lineSpace = lineSpace;
    GUI.elements = [];
    GUI.mien = mien;
    GUI.initialized = true;
    console.log('GUI initialized..');
  }
  static isMouseIn(element) {
    return (
      View.mouse.x > element.drawnBounds.x0 &&
      View.mouse.x < element.drawnBounds.x1 &&
      View.mouse.y > element.drawnBounds.y0 &&
      View.mouse.y < element.drawnBounds.y1);
  }

  static render() {
    for (let p of this.panels) p.render();
  }
  static removePanel(panel) {
    //remove of all its elements..
    let keep = [];
    for (let el of GUI.elements) {
      let found = false;
      for (let pel of panel.elements) {
        if (pel === el) found = true;
      }
      if (!found) keep.push(el);
    }
    GUI.elements = keep;
    //now remove the panel..
    let keeppanels = [];
    for (let p of GUI.panels) {
      if (p !== panel) keeppanels.push(p);
    }
    GUI.panels = keeppanels;
  }
}