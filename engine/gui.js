
import GUIPanel from './guipanel.js';
import Mien from './mien.js';
import View from './view.js';

export default class GUI {
  static panelNames = ['top', 'bottom', 'left', 'right'];
  static panels = new Map();
  static initialized = false;
  static initialize(gap, padding, mien = Mien.Green) {
    GUI.gap = gap;
    GUI.padding = padding;
    this.mien = mien;
    GUI.initialized = true;
    console.log('GUI initialized..');
  }
  static isMouseIn(element) {
    let x = View.mouse.x;
    let y = View.mouse.y;
    return (
      x > element.bounds.x0 &&
      x < element.bounds.x1 &&
      y > element.bounds.y0 &&
      y < element.bounds.y1);
  }
  static render() {  
    for (let name of GUI.panelNames) if (this.panels.has(name)) GUI.panels.get(name).render();
    for (let name of GUI.panelNames) {
      if (name === 'left' || name === 'right' || name === 'top' || name === 'bottom') continue;
      GUI.panels.get(name).render();
    }
  }
  static setTopPanel(minCellHeight, maxCellHeight) {
    GUI.panels.set('top', GUIPanel.makeTopPanel(minCellHeight, maxCellHeight));
  }
  static setBottomPanel(minCellHieght, maxCellHeight) {
    GUI.panels.set('bottom', GUIPanel.makeBottomPanel(minCellHieght, maxCellHeight));
  }
  static setLeftPanel(minCellWidth, maxCellWidth) {
    GUI.panels.set('left', GUIPanel.makeLeftPanel(minCellWidth, maxCellWidth));
  }
  static setRightPanel(minCellWidth, maxCellWidth) {
    GUI.panels.set('right', GUIPanel.makeRightPanel(minCellWidth, maxCellWidth));
  }
  static addText(panelName, text) {
    if (!GUI.panels.has(panelName)) throw new Error('Panel constraints not set.')
    GUIElement.makeButton(GUI.panels.get(panelName), text);
  }
  static addButton(panelName, text, value, toggle, fn) {
    if (!GUI.panels.has(panelName)) throw new Error('Panel constraints not set.')
    GUIElement.makeButton(GUI.panels.get(panelName), text, value, toggle, fn);
  }
  /*
  static addList(panelName, text, defaultValue, listItems, fn) {
    if (!GUI.panels.has(panelName)) throw new Error('Panel constraints not set.')
    GUIElement.makeList(GUI.panels.get(panelName), text, defaultValue, listItems, fn);
  }
  */
}