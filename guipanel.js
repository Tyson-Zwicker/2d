import GUI from './gui.js';
import GUIElement from './guielement.js';

export default class GUIPanel {
  elements = [];
  listElements = new Map();
  listPanel = undefined; //showList sets this..
  constructor(location, parentElement) {
    if (!Check.str(location) || !GUI.locations.includes(location)) throw new Error(`GUIPanel.constructor: location is invalid [${location}]`);
    this.location = location;
    this.activeList = undefined;
    if (location === 'float') {
      let calcs = this.calculateFloat(parentElement);
      this.offset = calcs.offset;
      this.boundry = calcs.boundry;
      this.direction = calcs.direction; //The vector direction for the panel.
      GUI.activeListItemElements.length = 0;
      for (let item of parentElement.listItemsData) {
        let itemElement = new GUIElement(item.text, parentElement.appearance, parentElement.shadowAppearance);
        itemElement.type = 'button';
        itemElement.callbackPanel = parentElement.panel;
        let callbackFn = function (result) {          
          result.owner.callbackPanel.hideList(result.value);
        }
        let button = new Button(
          parentElement.button.hoveredAppearance,
          parentElement.button.pressedAppearance,
          callbackFn, false, item.value);
        button.guiElement = itemElement;
        itemElement.button = button;
        GUI.activeListItemElements.push(itemElement);
        this.elements.push(itemElement);
      }
    }
  }
  calculateFloat(listElement) {
    let itemsWidth = this.#getFloatElementsCollectiveWidth( listElement);
    let itemsHeight = this.#getFloatElementsCollectiveHeight( listElement);
    let x1,y1,x2,y2,direction;
    if (listElement.panel.location === 'bottom') {
      direction = new Point(0, 1);
      x1 = listElement.drawnBounds.x1;
      y1 = listElement.drawnBounds.y1 - itemsHeight;
      x2 = x1 + itemsWidth;
      y2 = listElement.drawnBounds.y1;
    }
    if (listElement.panel.location === 'top') {
      direction = new Point(0, 1);
      x1 = listElement.drawnBounds.x1;
      y1 = listElement.drawnBounds.y2;
      x2 = x1 + itemsWidth;
      y2 = listElement.drawnBounds.y2 + itemsHeight;
    }
    if (listElement.panel.location === 'right') {
      direction = new Point(1, 0);
      x1 = listElement.drawnBounds.x1 - itemsWidth;
      y1 = listElement.drawnBounds.y1;
      x2 = listElement.drawnBounds.x1;
      y2 = listElement.drawnBounds.y2;      
    }
    if (listElement.panel.location === 'left') {
      direction = new Point(1, 0);
      x1 = listElement.drawnBounds.x2;
      y1 = listElement.drawnBounds.y1;
      x2 = listElement.drawnBounds.x2 + itemsWidth;
      y2 = listElement.drawnBounds.y2;  
    }
    return { offset: new Point(x1, y1), boundry: new Boundry(x1, y1, x2, y2), direction: direction };
  }

  drawPanel() {
    if (this.elements.length > 0) {
      let drawer = new Draw(Director.view.context);
      drawer.fillBox(this.boundry.x1, this.boundry.y1, this.boundry.x2, this.boundry.y2, '#022');
      let cursor = Point.from(this.offset);
      for (let element of this.elements) {
        if (element.type === 'list' && element === this.activeList) {
          this.drawElement(drawer, element, cursor, true);
          this.listPanel.drawPanel();
        } else {
          this.drawElement(drawer, element, cursor, this.activeList !== undefined);//passing where to start drawing and if it should look "shadowed" or not.
        }
        cursor.x += this.direction.x * (GUI.gap + element.bounds.width);
        cursor.y += this.direction.y * (GUI.gap + element.bounds.height);
      }
    }
  }
  drawElement(draw, element, cursor, shadow) {
    let appearance = element.appearance;
    if (shadow) {
      appearance = element.shadowAppearance;
    } else if (element.type === 'button') {
      if (element.button.pressed) {
        appearance = element.button.pressedAppearance;
      } else if (element.button.hovered) {
        appearance = element.button.hoveredAppearance;
      }
    }
    draw.textBox(
      element.bounds.x1 + cursor.x, element.bounds.y1 + cursor.y,
      element.bounds.x2 + cursor.x, element.bounds.y2 + cursor.y,
      element.text,
      GUI.fontSize, GUI.fontName, appearance);
    element.drawnBounds = new Boundry(
      element.bounds.x1 + cursor.x, element.bounds.y1 + cursor.y,
      element.bounds.x2 + cursor.x, element.bounds.y2 + cursor.y);
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
    this.activeList.changeFn (this.activeList.value);
    this.activeList = undefined;
    for (let element of this.elements) element.active = true; //Re-active everything- floating panel is gone..
    this.floatingPanel = undefined;
    GUI.activeListItemElements.length = 0;
    this.recalculate;

  }

  addText(text, appearance, shadowAppearance) {

    let textElement = new GUIElement(text, appearance, shadowAppearance);
    textElement.type = 'text';
    this.elements.push(textElement);
    return textElement;
  }
  addButton(text, appearance, shadowAppearance, hoveredAppearance, pressedAppearance, toggle, fn, value) {
    let buttonElement = new GUIElement(text, appearance, shadowAppearance);
    buttonElement.type = 'button';
    this.elements.push(buttonElement);
    //extra button stuff..
    let button = new Button(hoveredAppearance, pressedAppearance, fn, toggle, value);
    button.guiElement = buttonElement;
    buttonElement.button = button;
    return buttonElement;
  }
  addList(text, appearance, shadowAppearance, hoveredAppearance, pressedAppearance, listItems, fn,defaultValue) {
    let listElement = new GUIElement(text, appearance, shadowAppearance);
    listElement.listItemsData = listItems;//{text, value}
    listElement.type = "list"
    listElement.panel = this;
    listElement.changeFn = fn;
    this.elements.push(listElement);
    let listCallback = (e) => {
      e.owner.panel.showList(e.owner);
    }
    let listButton = new Button(hoveredAppearance, pressedAppearance, listCallback, false, defaultValue);
    listButton.guiElement = listElement;;
    listElement.button = listButton;
    return listElement;
  }

  recalculate() {
    this.activeList = undefined; //If a list was opened, close it when they start fiddling with the window..
    let width = Director.view.canvas.width;
    let height = Director.view.canvas.height;
    switch (this.location) {
      case 'top':
        this.direction = new Point(1, 0);
        this.boundry = new Boundry(
          GUI.columnWidth, 0,
          width - GUI.columnWidth, GUI.rowHeight
        );
        this.offset = new Point(this.boundry.x1, this.boundry.y1);
        break;
      case 'bottom':
        this.direction = new Point(1, 0);
        this.boundry = new Boundry(
          GUI.columnWidth, height - GUI.rowHeight,
          width - GUI.columnWidth, height
        );
        this.offset = new Point(this.boundry.x1, this.boundry.y1);
        break;
      case 'left':
        this.direction = new Point(0, 1);
        this.boundry = new Boundry(
          0, GUI.rowHeight,
          GUI.columnWidth, height - GUI.rowHeight
        );
        this.offset = new Point(this.boundry.x1, this.boundry.y1);
        break;
      case 'right':
        this.direction = new Point(0, 1);
        this.boundry = new Boundry(
          width - GUI.columnWidth, GUI.rowHeight,
          width, height - GUI.rowHeight
        );
        this.offset = new Point(this.boundry.x1, this.boundry.y1);
        break;
      default:
        throw new Error('GUIPanel:calculate(): unknown location :' + this.location);
    }//end switch
  }
  #getFloatElementsCollectiveWidth( listElement) {
    let width = 0;
    if (listElement.panel.location === 'top' || listElement.panel.location === 'bottom') {
      return listElement.drawnBounds.width;
    } else {
      return GUI.columnWidth * listElement.listItemsData.length;
    }
  }
  #getFloatElementsCollectiveHeight( listElement) {
    let hieght = 0;
    if (listElement.panel.location === 'top' || listElement.panel.location === 'bottom') {
      return GUI.rowHeight * listElement.listItemsData.length;
    } else {
      return listElement.drawnBounds.height;
    }
  }
}