import View from './view.js';

export default class Text {
  static ellipsis = '...';

//  constructor() {
//    this.lines = [];
//    this.lineLengths = [];
//    this.size = { w: 0, h: 0 };
 // }
  
  static getTextFromArray(text, maxSize, fontName, fontSize, lineSpace) {
    View.context.font = `${fontSize}px ${fontName}`;
    let r = { lines: [], lineLengths:[], w: 0, h: 0 };
    let h = fontSize+lineSpace;    
    for (let line of text) {
      if (h  > maxSize.h) break;
      let trunc = this.#truncateLine(line, maxSize.w);
      r.lines.push(trunc.text);
      r.lineLengths.push (trunc.w);      
      if (r.w < trunc.w) r.w = trunc.w;
      h += fontSize + lineSpace;
    }
    r.h = h - (fontSize + lineSpace);
    return r;
  }
  static #truncateLine(text, maxWidth) {
    let r = { text: '', w: 0 }
    let naturalWidth = View.context.measureText(text).width
    if (naturalWidth <= maxWidth) return { text: text, w: naturalWidth };
    for (let i = text.length; i > 0; i--) {
      const candidate = text.slice(0, i) + Text.ellipsis;
      let truncWidth = View.context.measureText(candidate).width;
      if (truncWidth <= maxWidth) return { text: candidate, w: truncWidth };
    }
    return r;
  }
}
