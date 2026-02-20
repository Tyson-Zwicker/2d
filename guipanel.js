import GUI from './gui.js';
import GUIElement from './guielement.js';
import Button from './button.js';
import Draw from './draw.js';
import View from './view.js';
export default class GUIPanel {
  elements = [];
  listElements = new Map();
  listPanel = undefined; //showList sets this..
  constructor(location, parentElement) {
    this.location = location;
    this.activeList = undefined;
    if (location === 'float') {
      let calcs = this.calculateFloat(parentElement);
      this.offset = calcs.offset;
      this.boundry = calcs.boundry;
      this.direction = calcs.direction; //The vector direction for the panel.
      GUI.activeListItemElements.length = 0;
      for (let item of parentElement.listItemsData) {
        let itemElement = new GUIElement(item.text);
        itemElement.type = 'button';
        itemElement.callbackPanel = parentElement.panel;
        let callbackFn = function (result) {
          result.owner.callbackPanel.hideList(result.value);
        }
        let button = new Button(callbackFn, false, item.value);
        button.guiElement = itemElement;
        itemElement.button = button;
        GUI.activeListItemElements.push(itemElement);
        this.elements.push(itemElement);
      }
    }else{
      this.recalculate();
    }
  }
  calculateFloat(listElement) {
    let itemsWidth = this.#getFloatElementsCollectiveWidth(listElement);
    let itemsHeight = this.#getFloatElementsCollectiveHeight(listElement);
    let x0, y0, x1, y1, direction;
    if (listElement.panel.location === 'bottom') {
      direction = { x: 0, y: 1 };
      x0 = listElement.drawnBounds.x0;
      y0 = listElement.drawnBounds.y0 - itemsHeight;
      x1 = x0 + itemsWidth;
      y1 = listElement.drawnBounds.y0;
    }
    if (listElement.panel.location === 'top') {
      direction = { x: 0, y: 1 };
      x0 = listElement.drawnBounds.x0;
      y0 = listElement.drawnBounds.y1;
      x1 = x0 + itemsWidth;
      y1 = listElement.drawnBounds.y1 + itemsHeight;
    }
    if (listElement.panel.location === 'right') {
      direction = { x: 1, y: 0 };
      x0 = listElement.drawnBounds.x0 - itemsWidth;
      y0 = listElement.drawnBounds.y0;
      x1 = listElement.drawnBounds.x0;
      y1 = listElement.drawnBounds.y1;
    }
    if (listElement.panel.location === 'left') {
      direction = { x: 1, y: 0 };
      x0 = listElement.drawnBounds.x1;
      y0 = listElement.drawnBounds.y0;
      x1 = listElement.drawnBounds.x1 + itemsWidth;
      y1 = listElement.drawnBounds.y1;
    }
    return { offset: { x: x0, y: y0 }, boundry: { x0, y0, x1, y1 }, direction: direction };
  }

  showList(listElement) {
    if (GUI.activeListItemElements.length === 0) {//Do not allow other lists to be shown when one is already shown.
      let floatingPanel = new GUIPanel('float', listElement); //floating panel just needs items..    
      this.listPanel = floatingPanel;
      this.activeList = listElement;
      for (let element of this.elements) element.active = false; //deactive everything so list is only active elemenet..    
    }
  }

  hideList(selectedValue) {
    this.activeList.value = selectedValue;
    this.activeList.changeFn(this.activeList.value);
    this.activeList = undefined;
    for (let element of this.elements) element.active = true; //Re-active everything- floating panel is gone..
    this.listPanel = undefined;
    GUI.activeListItemElements.length = 0;
    this.recalculate();

  }

  addText(text) {
    let textElement = new GUIElement(text);
    textElement.type = 'text';
    this.elements.push(textElement);    
    return textElement;
  }
  addButton(text, toggle, fn, value) {
    let buttonElement = new GUIElement(text);
    buttonElement.type = 'button';
    this.elements.push(buttonElement);
    //extra button stuff..
    let button = new Button(fn, toggle, value);
    button.guiElement = buttonElement;
    buttonElement.button = button;
    return buttonElement;
  }
  addList(text, listItems, fn, defaultValue) {
    let listElement = new GUIElement(text);
    listElement.listItemsData = listItems;//{text, value}
    listElement.type = "list"
    listElement.panel = this;
    listElement.changeFn = fn;
    this.elements.push(listElement);
    let listCallback = (e) => { e.owner.panel.showList(e.owner); }
    let listButton = new Button(listCallback, false, defaultValue);
    listButton.guiElement = listElement;
    listElement.button = listButton;
    return listElement;
  }

  recalculate() {
    this.activeList = undefined; //If a list was opened, close it when they start fiddling with the window..
    let width = View.canvas.width;
    let height = View.canvas.height;
    switch (this.location) {
      case 'top':
        this.direction = { x: 1, y: 0 };
        this.boundry = { x0: GUI.columnWidth, y0: 0, x1: width - GUI.columnWidth, y1: GUI.rowHeight };        
        break;
      case 'bottom':
        this.direction = { x: 1, y: 0 }   ;
        this.boundry = { x0: GUI.columnWidth, y0: height - GUI.rowHeight, x1: width - GUI.columnWidth, y1: height };
        break;
      case 'left':
        this.direction = { x: 0, y: 1 };
        this.boundry = { x0: 0, y0: GUI.rowHeight, x1: GUI.columnWidth, y1: height - GUI.rowHeight };
        break;
      case 'right':
        this.direction = { x: 0, y: 1 };
        this.boundry = { x0: width - GUI.columnWidth, y0: GUI.rowHeight, x1: width, y1: height - GUI.rowHeight };
        break;
      default:
        throw new Error('GUIPanel:calculate(): unknown location :' + this.location);
    }    
    this.offset = { x: this.boundry.x0, y: this.boundry.y0 };
  }
  #getFloatElementsCollectiveWidth(listElement) {
    if (listElement.panel.location === 'top' || listElement.panel.location === 'bottom') {
      return listElement.drawnBounds.width;
    } else {
      return GUI.columnWidth * listElement.listItemsData.length;
    }
  }
  #getFloatElementsCollectiveHeight(listElement) {
    if (listElement.panel.location === 'top' || listElement.panel.location === 'bottom') {
      return GUI.rowHeight * listElement.listItemsData.length;
    } else {
      return listElement.drawnBounds.height;
    }
  }
  drawPanel() {
    if (this.elements.length > 0) {
      Draw.rect(this.boundry.x0, this.boundry.y0, this.boundry.x1, this.boundry.y1, '#022', false);
      let cursor = {x:this.offset.x, y:this.offset.y};
      for (let element of this.elements) {        
        if (element.type === 'list' && element === this.activeList) {
          this.drawElement(element, cursor, true);
          this.listPanel.drawPanel();
        } else {
          this.drawElement(element, cursor, this.activeList !== undefined);//passing where to start drawing and if it should look "shadowed" or not.
        }
        cursor.x += this.direction.x * (GUI.gap + (element.bounds.x1-element.bounds.x0));
        cursor.y += this.direction.y * (GUI.gap + (element.bounds.y1-element.bounds.y0));        
      }
    }
  }
  drawElement(element, cursor, shadow) {
    let facade = GUI.appearance.normal;
    
    if (shadow) {
      facade = GUI.appearance.shadowed;
    } else if (element.type === 'button') {
      if (element.button.pressed) {
        facade = GUI.appearance.pressed;
      } else if (element.button.hovered) {
        facade = GUI.appearance.hovered;
      }
    }
    
    Draw.textBox(
      element.bounds.x0 + cursor.x, element.bounds.y0 + cursor.y,
      element.bounds.x1 + cursor.x, element.bounds.y1 + cursor.y,
      element.text,
      facade);
    element.drawnBounds = {
      x0: element.bounds.x0 + cursor.x,
      y0: element.bounds.y0 + cursor.y,
      x1: element.bounds.x1 + cursor.x,
      y1: element.bounds.y1 + cursor.y
    };
    
  }
}