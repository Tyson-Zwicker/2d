
import GUIPanel from './guipanel.js';
import View from './view.js';

export default class GUI {
  static locations = ['top', 'bottom', 'left', 'right', 'float'];
  static listElements = new Map();
  static elements = [];
  static panels = new Map();
  static activeListItemElements = [];
  static appearance = undefined;  //set in constructor
  static columnWidth = 100;       //set in constructor
  static rowHeight = 30;          //set in constructor  
  static gap = 5;                 //set in constructor
  static padding = 5;             //set in constructor
  static initialized = false;
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
    GUI.initialized = true;
    console.log('GUI initialized with columnWidth', columnWidth, 'rowHeight', rowHeight, 'gap', gap, 'padding', padding);
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
    GUI.render();
  }
  static render() {
    let top = GUI.panels.get('top');
    top.drawPanel();
    let bottom = GUI.panels.get('bottom');
    bottom.drawPanel();
    let left = GUI.panels.get('left');
    left.drawPanel();
    let right = GUI.panels.get('right');
    right.drawPanel();
    console.log('rendering GUI with', GUI.elements.length, 'elements');
  }
  static addText(location, text) {
    console.log('adding text to', location, ':', text);
    let panel = GUI.panels.get(location);
    let textElement = panel.addText(text);
    console.log(text, 'bounds', textElement.bounds);
    GUI.elements.push(textElement);
    console.log(GUI.elements.length, 'total GUI elements');
  }
  static addButton(location, text, toggle, fn, value) {
    console.log('adding button to', location, ':', text);
    let panel = GUI.panels.get(location);
    let buttonElement = panel.addButton(text, toggle, fn, value);
    console.log(text, 'bounds', buttonElement.bounds);
    GUI.elements.push(buttonElement);
    console.log(GUI.elements.length, 'total GUI elements');
  }
  static addList(location, text, listItems, fn, defaultValue) {
    console.log('adding list to', location, ':', text);
    let panel = GUI.panels.get(location);
    let listElement = panel.addList(text, listItems, fn, defaultValue);
    console.log('list element bounds', listElement.bounds);
    GUI.elements.push(listElement);
    console.log(GUI.elements.length, 'total GUI elements');
  }
}