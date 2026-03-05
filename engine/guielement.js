
import Draw from './draw.js';
import Events from './events.js';
import GUI from './gui.js';
import GUIPanel from './guipanel.js';
import Button from './button.js';
import View from './view.js';

export default class GUIElement {
  constructor(panel, text) {
    this.drawnBounds = {}//determined when draw..
    this.active = true;
    this.text = text;    
    this.processedText = GUIElement.#cutTextIntoLines(text, panel);
    this.size = GUIElement.#getSize(panel, this.processedText);
    this.panel = panel;
    panel.elements.push(this);
    GUI.elements.push(this);
  }
  render(position) {
    let mien = GUI.mien.normal;
    if (this.button && this.button.hovered) mien = GUI.mien.hovered;
    if (this.button && this.button.pressed) mien = GUI.mien.pressed;
    if (this.button && this.button.toggled) mien = GUI.mien.highlighted;
    Draw.multiLineText(
      position.x, position.y,
      position.x + this.size.width, position.y + this.size.height,
      this.processedText.lines, this.processedText.lineHeight, mien
    );
    this.drawnBounds.x0 = position.x;
    this.drawnBounds.y0 = position.y;
    this.drawnBounds.x1 = position.x + this.size.width;
    this.drawnBounds.y1 = position.y + this.size.height;
  }

  static #getSize(panel, processedText) {
    if (panel.direction === 'vertical') {
      let w = panel.constraint.max.width;
      let h = processedText.height;
      if (panel.constraint.min.height > 0 && h < panel.constraint.min.height) {
        h = panel.constraint.min.height;
      }
      return { width: w, height: h };
    } else if (panel.direction === 'horizontal') {
      let w = processedText.width;
      let h = panel.constraint.max.height;
      if (panel.constraint.min.width > 0 && panel.constraint.min.width > processedText.width) {
        w = panel.constraint.min.width;
      }
      return { width: w, height: h };
    } else {
      throw new Error('unknown panel direction:' + panel.direction);
    }
  }
  static #cutTextIntoLines(text, panel) {
    let lines = [];
    let remainingWords = text.split(' ');
    let currentLine = '';
    let maxWidth = 0;
    let lineHeight = 0;
    do {
      let word = remainingWords.shift();
      let currentLineMetric = GUIElement.#getTextSize(currentLine + ' ' + word);
      if (lineHeight < currentLineMetric.height) lineHeight = currentLineMetric.height;
      if (currentLineMetric.width > panel.constraint.max.width) {
        lines.push(currentLine);
        let ts = GUIElement.#getTextSize(currentLine);
        if (ts.width > maxWidth) maxWidth = ts.width;
        currentLine = '';
      } else {
        if (currentLineMetric.width > maxWidth) maxWidth = currentLineMetric.width;
      }
      currentLine += word + ' ';
    } while (remainingWords.length > 0);
    lines.push(currentLine);
    while (lines.length * lineHeight > panel.constraint.max.height) {
      lines.pop();
    }
    return {
      lines: lines,
      width: maxWidth,
      height: lines.length * lineHeight,
      lineHeight: lineHeight
    };

  }
  static #getTextSize(text) {
    View.context.textBaseline = 'top';
    View.context.textAlign = 'left';
    View.context.font = `${GUI.mien.normal.fontSize}px ${GUI.mien.normal.fontName}`;
    let metrics = View.context.measureText(text);
    let h = GUI.mien.normal.fontSize;//let h = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) ?? mien.normal.fontSize
    return {
      "width": metrics.width,
      "height": h
    };
  }
  static addText(panel, text) {
    let textElement = new GUIElement(panel, text);
    textElement.type = 'text';
    return textElement;
  }
  static addButton(panel, text, value, toggle, fn) {
    let buttonElement = new GUIElement(panel, text);
    buttonElement.type = 'button';
    let button = new Button(value, toggle, fn);
    button.guiElement = buttonElement;
    buttonElement.button = button;
    return buttonElement;
  }
  static addList(panel, text, listItems, defaultValue, itemPanelDirection) {
    let listElement = new GUIElement(panel, text);
    listElement.type = 'list';
    listElement.itemPanelDirection = itemPanelDirection;
    listElement.listItems = listItems;

    let button = new Button(defaultValue, false, (r) => { GUIElement.attachListItemPanel(r.owner) });
    button.guiElement = listElement;
    listElement.button = button;
    return listElement;
  }

  static attachListItemPanel(listElement) {
    //Lets try just using the size of the listElement and see how it goes..
    let constraint = {
      max: { width: listElement.size.width, height: listElement.size.height },
      min: { width: listElement.size.width, height: listElement.size.height }
    };
/*    if (listElement.itemPanelDirection === 'horizontal') {
    }
    else if (listElement.itemPanelDirection === 'vertical') {
    } else {
      throw new Error('unknown direction ': listElement.itemPanelDirection);
    }
*/
    let listItemPanel = new GUIPanel(undefined, listElement.itemPanelDirection, constraint);
    for (let item of listElement.listItems) {
      GUIElement.addButton(
        listItemPanel,
        item.text,
        item.value,
        false,
        (data) => {
          let listElement = data.owner.panel.anchor;//<-- the item that showed the panel in the first place.
          listElement.receiveListItemSelection(data); //Give it the selected Value..
        }
      );
    }
    listItemPanel.anchor = listElement;
    listElement.attachedPanel = listItemPanel;
  }
  receiveListItemSelection(data) { //should only be called by a button element that is part of a list item panel..
    this.button.value = data.value; //change this button value to selected value..
    GUI.removePanel(this.attachedPanel); //thrown away, won't be drawn    
    this.attachedPanel.anchor = undefined;
    this.attachedPanel = undefined;
    data.owner = this;
    Events.add ('listItemSelected',this.text, data);
  }
}
//So just a normal button that carries fn.. which launches a other panel.
//and it sets itself as THAT panels anchor..
//The devious part: It autogenerates the panel,
//AND makes those panels buttons which have a fn. also autogenerated,
//that sets the value of the origina list element to the value of the list item..
//And then UNATTACHES the anchored panel, and removes it from the GUI's list of panels.