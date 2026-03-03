import Draw from './draw.js';
import GUI from './gui.js';
/*GUIElement
* Only job: Using own text and panel constraints to establish size.
* Figure out what text can be drawn (needed for own size to be calculated)
*/
export default class GUIElement {
  panel = undefined;          //Assigned by constructor
  #text = 'insert text';      //Assigned by constructor
  #words = undefined;         //calculate on construction
  #size = undefined;         //calculated on addition to panel (because contraints are needed)  
  #lines = undefined;         //calculate on addition to panel (because contraints are needed)
  position = undefined;       //calculated on render.

  constructor(panel, text = '*insert text*') {
    this.#text = text;
    this.#words = text = this.#text.split(' ');
    this.panel = panel;
    this.active = true;
    this.bounds = undefined; //defined when rendered..
  }
  render (cursor){
    let lines = this.lines; //Call first, everything else needs it.
    this.position = cursor;
    Draw.textBox (
      this.position,
      this.size,
      lines
    );
  }

  get lines() {
    if (!this.#lines) this.#lines = this.#getLines();
    return this.#lines();
  }
  get size() {
    //use text size, unless thats not big enough, then extend to panel min constraints...
    let textSize = this.lines;
    this.#size = {width: textSize.width, height: textSize.height};
    if (textSize.width < this.panel.constraint.min.width) this.#size.width = this.panel.constraint.min.width;
    if (textSize.height < this.panel.contraint.min.height) this.#size.height = this.panel.constraint.min.height;
    return this.#size;
  }

  #getLines() {
    //** When rendering, knowing the actual text size PER LINE vs. what the panels
    // want would be very helpful. Lets collect that information here... */
    //First, go by word until width exceeded..
    let remainingWords = structuredClone(this.#words);
    let currentLineLength = 0;
    let currentLine = '';
    let parsedLines = [];
    let longestLine = 0;
    while (remainingWords.length > 0) {
      let nextWord = remainingWords[remainingWords.length - 1] + ' ';
      let wordLength = Draw.getTextSize(word, GUI.mien);
      //Break out into lines based on width constraint...
      if (this.panel.constraint.max.width > 0) {
        //it cares about width..
        if (currentLineLength + wordLength <= this.panel.constraint.width) { //but you fit..
          currentLineLength += wordLength;
          currentLine = currentLine + nextWord;
          if (currentLineLength > longestLine) longestLine = len;
          remainingWords.pop();
        } else {
          //This word does not fit.. so push the line we have into parsedLines
          //FIXME: ?? Probably fine but I slipped this because its were I think it should be.
          currentLine.textWidth = currentLineLength; //** Render wants this */
          parsedLines.push(currentLine);
          //Start new line..
          currentLine += remainingWords.pop() + ' ';
          currentLineLength = Draw.getTextSize(currentLine, GUI.mien);
          if (currentLineLength > longestLine) longestLine = len;
        }
      } else {
        //It doesn't care about width, shove everything into current line...
        for (let w of remainingWords) {
          currentLine += w + ' ';
        }
        parsedLines.push(currentLine);
        longestLine = Draw.getTextSize(currentLine, GUI.mien);
        remainingWords.length = 0; //No more words to cut up into lines..
      }
      return parsedLines;
    }
    //Next cull lines that will not fit vertically..
    let currentHeight = 0;
    let remainingLines = [];
    for (let lineNum = 0; lineNum < parsedLines.length; lineNum++) {
      if (currentHeight + GUI.mien.fontSize > this.panel.constraint.max.height) break;
      currentHeight += GUI.mien.fontSize;
      remainingLines.push(parsedLines[lineNum]);
    }
    this.#lines = remainingLines;
    return { textHeight: currentHeight, textWidth: longestLine};
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
  /*

  //TODO: Lists are a specialcase of attached..

  //This is where you need to define  how you want he elemnts listed
  //aka how the panel is going to layout
  //horizontal, vertical ?
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
  */
}
