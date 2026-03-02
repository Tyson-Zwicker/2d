
import Draw from './draw.js';
import GUI from './gui.js';

export default class GUIElement {
  panel = undefined;          //Assigned by constructor
  #words = undefined;         //calculate on construction
  #text = 'insert text';    //required..
  #finalized = false;       //resize makes it true..
  get words() {
    if (!this.#words) this.#words = this.#text.split(' ');
    return this.#words;
  }
  resize() {
    //First, go by word until width exceeded..
    let startLines = [];
    let remainingWords = structuredClone(this.words);
    let currentLineLength = 0;
    let currentLine = '';
    while (remainingWords.length > 0) {
      let word = remainingWords.pop() + ' ';
      let wordLength = Draw.getTextSize(word);
      if (this.panel.constraint.width > 0 && lineLength + wordLength <= this.panel.constraint.width) {
        currentLineLength += wordLength;
        currentLine = word + currentLine;
      } else {
        startLines.push({ text: currentLine, width: currentLineLength });
        currentLine = word;
      }
    }
    //Then AFTER, go by line to see when height exceed...
    let keepLines = [];
    let i = 0;
    while (keepLines.length * GUI.mein.fontSize < this.panel.constraint.largest.height) {
      keepLines.push(startLines[i]);
      i++;
    }
    //FINALLY, Use keepLines and constraints to establish size 
    //POSITION IS NOT OUR PROBLEM, BECAUSE RENDERING OFFSETS WILL COME FROM ANCHOR WHEN NEEDED

  }

  constructor(panel, text = '*insert text*') {
    this.#text = text;
    this.panel = panel;
    this.active = true;
    this.drawnBounds = undefined;
    this.resize();
  }
  static makeText(panel, text) {
    let el = new GUIElement(panel, text);
    el.type = 'text';
    panel.elements.push(el);
    GUI.elements.push(el);
    return el;
  }
  static makeButton(panel, text, value, toggle, fn) {
    let el = new GUIElement(panel, text);
    el.type = 'button';
    panel.elements.push(el);
    GUI.elements.push(el);
    new Button(value, toggle, fn).bind(el);
    return el;
  }
  static makeList(panel, text, defaultValue, listItems, fn) {
    let el = new GUIElement(panel, text);
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
