
import Draw from './draw.js';
import GUI from './gui.js';

export default class GUIElement {
  panel = undefined;
  #words = undefined;
  #text = '*insert text*'
  //TODO: CALCULATED ON CONSTRUCTION
  get words() {
    if (!this.#words) this.#words = this.#text.split(' ');
    return this.#words;
  }
  get size() {

    let lineData = this.#getTextLineData;

    //text lines are already trimmed to panel width contraint
    // EXPAND width if to small..
    // EXPAND height if text is to small..
    // OR CULL height if text is too TALL    

  }

  #getTextLineData() {
    let lines = [];
    let remainingWords = structuredClone(this.words);
    let currentLineLength = 0;
    let currentLine = '';
    while (remainingWords.length > 0) {
      let word = remainingWords.pop() + ' ';
      let wordLength = Draw.getTextSize(word)
      if (this.panel.constraint.width > 0 && lineLength + wordLength <= this.panel.constraint.width) {
        currentLineLength += wordLength;
        currentLine = word + currentLine;
      } else {
        lines.push({ text: currentLine, width: currentLineLength });
        currentLine = word;
      }
    }
    lines.widest = this.#getWidestLine(lines);
    return lines;
  }
  #getWidestLine(lines) {
    let widest = 0;
    for (let line of lines) {
      if (line.width > widest) {
        widest = line.width;
      }
    }
    return widest;
  }

  constructor(panel, text = '*insert text*') {
    this.#text = text;
    this.panel = panel;
    this.active = true;
    this.drawnBounds = undefined;
  }
  static makeText(panel, text) {
    let el = new GUIElement(panel,text);
    el.type = 'text';
    panel.elements.push(el);
    GUI.elements.push(el);
    return el;
  }
  static makeButton(panel, text, value, toggle, fn) {
    let el = new GUIElement(panel,text);
    el.type = 'button';
    panel.elements.push(el);
    GUI.elements.push(el);
    new Button(value, toggle, fn).bind(el);
    return el;
  }
  static makeList(panel, text, defaultValue, listItems, fn) {
    let el = new GUIElement(panel,text);
    el.#text = text;
    el.defaultValue = defaultValue; 
    el.listItemData = listItems; //{text,value} used to make buttons
    el.type = 'list';
    el.panel = panel;
    el.changeFn = fn;
    panel.elements.push(el);
    GUI.elements.push(el);
    new Button(value, toggle, (e) => { e.owner.panel.showList(e.owner) }).bind(el);
    return el;
  }
}
