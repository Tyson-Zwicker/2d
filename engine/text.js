import View from './view.js';

export default class Text {

  static ctx = View.context;
  //Doesn't care about minimum width, only fitting text
  //into maximums. something else that draws the text
  //can worry about centering it and whatnot.  This only
  //cares about the text and the size reflects the text +
  //the horizontal Padding and vertical Gap..
  static ellipsis = '...';

  constructor() {
    this.lines = [];
    this.size = { w: 0, h: 0 };
  }
  //padding {w,h,g} 
  // w = padding from leng and right.
  // h = padding from top and bottom.
  // g = vertical gap between text lines;
  static getTextFromArray(text, maxSize, fontName, fontSize, padding) {
    this.ctx.font =`${fontSize}px ${fontName}`;
    let r = { lines: [], w: 0, h: 0 };    
    r.h = padding.h * 2;
    for (line of text) {
      if (r.h +fontSize + padding.g > maxSize.h) break;
      let trunc = this.#truncateLine(line, maxSize.w, padding);
      r.lines.push(trunc.text);
      if (r.w < trunc.w) r.w = trunc.w;
      r.h += fontSize + padding.g; 
    }
    return r;
  }
  static #truncateLine(text, maxWidth, padding) {      
    let r = {text:'',w:0}
      let naturalWidth = ctx.measureText(text).width 
      if (naturalWidth  <= maxWidth+padding.w*2) return {text:text, w:naturalWidth};      
      const ellipsisWidth = ctx.measureText(this.ellipsis).width;
      if (ellipsisWidth > maxWidth) return r;
      for (let i = text.length; i > 0; i--) {
        const candidate = text.slice(0, i) + ellipsis;
        let truncWidth = ctx.measureText(candidate).width;
        if ( truncWidth<= maxWidth) return {text:text, w:truncWidth};
      }
      return r;
  }
}
//TODO: Also:  //Make panels create "used" text based on the
//optomist text that was provided to them by the elements
//when they are addTo (panel).

//Panel must center the text, which will always fit, but
//May be too,small.  The text itself should remain left
//aligned and top-orientated (with gap included.)