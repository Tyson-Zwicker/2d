import View from './view.js';

export default class Text {
  static ellipsis = '...';
  
  constructor (linesArray, lineLengthsArray, width, height){
    this.lines = linesArray;
    this.lineLengths = lineLengthsArray;
    this.w = width;
    this.h = height;    
  }
  /* Caller:
   this.trimmedText = Text.getTextFromArray(
        textArray,
        { w: panel.constraint.width, h: panel.constraint.height, m: GUI.margin },
        GUI.mien.normal.fontName,
        GUI.mien.normal.fontSize,
        GUI.lineSpace,
        GUI.margin
      );
  */
  static getTextFromArray(text, maxSize, fontName, fontSize, lineSpace, margin) {    
    View.context.font = `${fontSize}px ${fontName}`;
    //let r = { lines: [], lineLengths:[], w: 0, h: 0 };
    let lines = [];
    let lineLengths=[];
    let w = 0;
    let h = fontSize+lineSpace+margin*2;    
    for (let line of text) {
      if (h  > maxSize.h) break;
      let trunc = this.#truncateLine(line, maxSize.w, maxSize.m);
      lines.push(trunc.text);
      lineLengths.push (trunc.w);      
      if (w < trunc.w) w = trunc.w;
      h += fontSize + lineSpace;
    }
    h = h - (fontSize + lineSpace);
    
    let t= new Text (lines, lineLengths, w, h);    
    return t;
  }
  static #truncateLine(text, maxWidth, margin) {
    let r = { text: '', w: 0 }
    let naturalWidth = View.context.measureText(text).width + margin*2;
    if (naturalWidth <= maxWidth) return { text: text, w: naturalWidth  };
    for (let i = text.length; i > 0; i--) {
      const candidate = text.slice(0, i) + Text.ellipsis;
      let truncWidth = View.context.measureText(candidate).width +margin*2;
      if (truncWidth <= maxWidth) return { text: candidate, w: truncWidth };
    }
    return r;
  }
}
