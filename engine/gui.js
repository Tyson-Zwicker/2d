import Mien from './mien.js';
import View from './view.js';
export default class GUI {
  static elements = [];
  static panels = [];
  static mien = undefined;  //set in constructor
  static gap = 5;                 //set in constructor
             //set in constructor
  static initialized = false;
  static initialize( gap = 5, mien= Mien.Green) {
    GUI.gap = gap;
    GUI.elements = [];
    GUI.mien = mien;
    GUI.initialized = true;
    console.log('GUI initialized..');
    console.log ('Mien:');
    console.log (GUI.mien);
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
}