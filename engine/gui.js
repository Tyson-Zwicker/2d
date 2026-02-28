
import GUIPanel from './guipanel.js';
import Mien from './mien.js';
import View from './view.js';

export default class GUI {
  static locations = ['top', 'bottom', 'left', 'right', 'float'];
  static listElements = new Map();
  static elements = [];
  static panels = new Map();
  static activeListItemElements = [];
  static mien = undefined;  //set in constructor
  static columnWidth = 100;       //set in constructor
  static rowHeight = 30;          //set in constructor  
  static gap = 5;                 //set in constructor
  static padding = 5;             //set in constructor
  static initialized = false;
  static initialize(columnWidth, rowHeight, gap, padding, mien) {
    GUI.columnWidth = columnWidth;
    GUI.rowHeight = rowHeight;
    GUI.gap = gap;
    GUI.padding = padding;

    GUI.panels.set('top', new GUIPanel('top'));
    GUI.panels.set('bottom', new GUIPanel('bottom'));
    GUI.panels.set('left', new GUIPanel('left'));
    GUI.panels.set('right', new GUIPanel('right'));
    GUI.elements = [];
    if (mien) {
      GUI.mien = mien;
    } else {
      GUI.mien = Mien.Green;  //Default- can be set anytime later..
    }
    GUI.initialized = true;
    console.log('GUI initialized..');
  }
  static isMouseIn(element) {
    let x = View.mouse.x;
    let y = View.mouse.y;
    return (
      x > element.drawnBounds.x0 &&
      x < element.drawnBounds.x1 &&
      y > element.drawnBounds.y0 &&
      y < element.drawnBounds.y1);
  }
  static resize() {
    //Don't resize 'float' -floating panes are dismissed 
    //if a window is resized so they don't care..
    GUI.panels.get('top').recalculate();
    GUI.panels.get('bottom').recalculate();
    GUI.panels.get('left').recalculate();
    GUI.panels.get('right').recalculate();
    GUI.render();
  }
  static render() {
    GUI.panels.get('top').drawPanel();
    GUI.panels.get('bottom').drawPanel();
    GUI.panels.get('left').drawPanel();
    GUI.panels.get('right').drawPanel();
  }
  static addText(location, text) {
    let panel = GUI.panels.get(location);
    let textElement = panel.addText(text);
    GUI.elements.push(textElement);
  }
  static addButton(location, text, toggle, fn, value) {
    let panel = GUI.panels.get(location);
    let buttonElement = panel.addButton(text, toggle, fn, value);
    GUI.elements.push(buttonElement);
  }
  static addList(location, text, listItems, fn, defaultValue) {
    let panel = GUI.panels.get(location);
    let listElement = panel.addList(text, listItems, fn, defaultValue);
    GUI.elements.push(listElement);
  }
}