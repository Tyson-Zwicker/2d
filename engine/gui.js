
import GUIPanel from './guipanel.js';
import Mien from './mien.js';
import View from './view.js';
import Draw from './draw.js';

export default class GUI {
  static locations = ['top', 'bottom', 'left', 'right', 'listPanel'];
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
  static activeModal = null; // { backdrop: {bounds}, dialog: { draw, bounds, onMouse?, onKey? } }
  static initialize(gap, padding, mien = Mien.Green) {
    GUI.gap = gap;
    GUI.padding = padding;
    GUI.panels.set('top', new GUIPanel('top'));
    GUI.panels.set('bottom', new GUIPanel('bottom'));
    GUI.panels.set('left', new GUIPanel('left'));
    GUI.panels.set('right', new GUIPanel('right'));
    GUI.panels.set('modal', new GUIPanel('modal'));
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
    //TODO: IGNORE PANELS:  they contain constraints and directions.. let the elements determine their own size based
    //ontheir needs and the constraint placed upon them by the panels.
    GUI.panels.get('top').recalculate();
    GUI.panels.get('bottom').recalculate();
    GUI.panels.get('left').recalculate();
    GUI.panels.get('right').recalculate();
    GUI.render();
  }
  static render() {
    //TODO: Ignore panels. Call elements render instead.
    GUI.panels.get('top').drawPanel();
    GUI.panels.get('bottom').drawPanel();
    GUI.panels.get('left').drawPanel();
    GUI.panels.get('right').drawPanel();
    if (GUI.activeModal) GUI.renderModal();
  }
  static addText(panelName, text) {
    GUIElement.makeButton (GUI.panels.get(panelName), text);
  }
  static addButton(panelName, text, value, toggle, fn) {
    GUIElement.makeButton (GUI.panels.get(panelName),text,value,toggle,fn);
  }
  static addList(panelName, text, defaultValue, listItems, fn) {
    GUIElement.makeList (GUI.panels.get(panelName),text, defaultValue, listItems, fn);
  }
  static addInfoPanel(attachedTo, panel){ //ataches to a part and uses its world xcoords
    //TODO: THIS IS JUST A LESS-SPECIFIC CASE OF LIST...
  }

  // Modal helpers: render-only scaffolding. Event gating should be done by callers
  // before dispatching to other GUI/game handlers.
  static showModal(dialog) {
    // dialog: { draw(), bounds: {x0,y0,x1,y1}, onMouse?, onKey? }
    const backdrop = {
      bounds: { x0: 0, y0: 0, x1: View.canvas.width, y1: View.canvas.height }
    };
    GUI.activeModal = { backdrop, dialog };
  }

  static hideModal() {
    GUI.activeModal = null;
  }

  static renderModal() {
    if (!GUI.activeModal) return;
    const { backdrop, dialog } = GUI.activeModal;
    // Dim the scene; relies on Draw.rect supporting rgba fill.
    Draw.rect(backdrop.bounds.x0, backdrop.bounds.y0, backdrop.bounds.x1, backdrop.bounds.y1, 'rgba(0,0,0,0.5)', true);
    dialog.draw();
  }
}