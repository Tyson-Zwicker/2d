
import GUIPanel from './guipanel.js';
import GUIElement from './guielement.js';

export default class GUI {
  static locations = ['top', 'bottom', 'left', 'right', 'float'];
  static renderer = undefined;
  static listElements = new Map();
  static elements = [];
  static panels = new Map();
  static activeListItemElements = [];
  static initialize(columnWidth, rowHeight, gap, padding, fontSize, fontName) {
    if (!Check.num(columnWidth) || !Check.num(rowHeight)) throw new Error(`GUI.constructor colWidth and rowHeight should be numbers [${colWidth},${rowHeight}].`);
    if (!Check.num(padding)) throw new Error(`GUI.constructor(): padding is not a number: ${padding}`);
    if (!Check.str(fontName) || !Check.num(fontSize)) throw new Error(`GUIConstructor: bad font name [${fontName}] or size [${fontSize}]`);
    GUI.columnWidth = columnWidth;
    GUI.rowHeight = rowHeight;
    GUI.gap = gap;
    GUI.padding = padding;
    GUI.fontSize = fontSize;
    GUI.fontName = fontName;
    GUI.panels.set('top', new GUIPanel('top'));
    GUI.panels.set('bottom', new GUIPanel('bottom'));
    GUI.panels.set('left', new GUIPanel('left'));
    GUI.panels.set('right', new GUIPanel('right'));
    GUI.elements = [];
  }
  static isMouseIn(element, mouse) {
    return element.drawnBounds.isPointInside(mouse.x, mouse.y);
  }
  static isControl(element) {
    return Check.obj(element, GUIElement);
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
  static draw( ) {
    GUI.panels.get('top').drawPanel(); 
    GUI.panels.get('bottom').drawPanel();
    GUI.panels.get('left').drawPanel();
    GUI.panels.get('right').drawPanel();
  }
  static addText(location, text, appearance, shadowAppearance) {
    let panel = GUI.panels.get(location);
    GUI.elements.push(panel.addText(text, appearance, shadowAppearance));
  }
  static addButton(location, text, appearance, shadowAppearance, hoveredAppearance, pressedAppearance, toggle, fn, value) {
    let panel = GUI.panels.get(location);
    GUI.elements.push(panel.addButton(text, appearance, shadowAppearance, hoveredAppearance, pressedAppearance, toggle, fn, value));
  }
  static addList(location, text, appearance, shadowAppearance, hoveredAppearance, pressedAppearance, listItems, fn, defaultValue) { 
    let panel = GUI.panels.get (location);
    GUI.elements.push(panel.addList(text, appearance, shadowAppearance, hoveredAppearance, pressedAppearance, listItems,fn, defaultValue));
  }
}