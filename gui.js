
import GUIPanel from './guipanel.js';
import GUIElement from './guielement.js';

export default class GUI {
  static locations = ['top', 'bottom', 'left', 'right', 'float'];
  static renderer = undefined;
  static listElements = new Map();
  static elements = [];
  static panels = new Map();
  static activeListItemElements = [];
  static appearance = undefined;  //set in constructor
  static columnWidth = 100;       //set in constructor
  static rowHeight = 30;          //set in constructor  
  static gap = 5;                 //set in constructor
  static padding = 5;             //set in constructor
  static initialize(columnWidth, rowHeight, gap, padding, appearance) {
    GUI.columnWidth = columnWidth;
    GUI.rowHeight = rowHeight;
    GUI.gap = gap;
    GUI.padding = padding;
    GUI.appearance = appearance;
    GUI.panels.set('top', new GUIPanel('top'));
    GUI.panels.set('bottom', new GUIPanel('bottom'));
    GUI.panels.set('left', new GUIPanel('left'));
    GUI.panels.set('right', new GUIPanel('right'));
    GUI.elements = [];
  }
  static isMouseIn(element) {
    let x = View.mouse.x;
    let y = View.mouse.y;
    return (
      x > element.drawBounds.x0 &&
      x < element.drawBounds.x1 &&
      y > element.drawBounds.y0 &&
      y < element.drawBounds.y1);
  }  
  static resize() {
    //Don't resize 'float' -floating panes are dismissed 
    //if a window is resized so they don't care..
    GUI.panels.get('top').recalculate();
    GUI.panels.get('bottom').recalculate();
    GUI.panels.get('left').recalculate();
    GUI.panels.get('right').recalculate();
    GUI.draw();
  }
  static draw() {
    GUI.panels.get('top').drawPanel();
    GUI.panels.get('bottom').drawPanel();
    GUI.panels.get('left').drawPanel();
    GUI.panels.get('right').drawPanel();
  }
  static addText(location, text, appearance, shadowAppearance) {
    let panel = GUI.panels.get(location);
    GUI.elements.push(panel.addText(text));
  }
  static addButton(location, text, toggle, fn, value) {
    let panel = GUI.panels.get(location);
    GUI.elements.push(panel.addButton(text, toggle, fn, value));
  }
  static addList(location, text, listItems, fn, defaultValue) {
    let panel = GUI.panels.get(location);
    GUI.elements.push(panel.addList(text, listItems, fn, defaultValue));
  }
}