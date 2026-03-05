
import Draw from './draw.js';
import GUI from './gui.js';
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
      console.log(processedText);
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
      }else{
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
    //let h = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) ?? mien.normal.fontSize
    let h = GUI.mien.normal.fontSize;
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


  //So just a normal button that carries fn.. which launches a other panel.
  //this is where the idea that panel has an 'anchor' to calculate its own positin from.
  //normal panels just treat the top-left of the screen as a default anchor,\
  //but if one IS defined, its position + sideoffset must be added to this position as well.
  static addList(panel, text, listItems, fn, defaultValue) {
  }
  /*
  static addList(panel, text, listItems, fn, defaultValue) {
    let listElement = new GUIElement(panel, text);
    listElement.listItemsData = listItems;//{text, value}
    listElement.type = "list"
    listElement.changeFn = fn;
    let listCallback = (e) => { e.owner.panel.showList(e.owner); }
    let listButton = new Button(defaultValue, false, listCallback);
    listButton.guiElement = listElement;
    listElement.button = listButton;
    return listElement;
  }
  */
}
