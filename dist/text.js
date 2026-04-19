import { View } from './view.js';
export class Text {
    static ellipsis = '...';
    lines;
    lineLengths;
    w;
    h;
    constructor(linesArray, lineLengthsArray, width, height) {
        this.lines = linesArray;
        this.lineLengths = lineLengthsArray;
        this.w = width;
        this.h = height;
    }
    static getTextFromArray(text, maxSize, fontName, fontSize, lineSpace, margin) {
        View.context.font = `${fontSize}px ${fontName}`;
        const lines = [];
        const lineLengths = [];
        let w = 0;
        let h = fontSize + lineSpace + margin * 2;
        for (const line of text) {
            if (h > maxSize.h)
                break;
            const trunc = this.#truncateLine(line, maxSize.w, maxSize.m);
            lines.push(trunc.text);
            lineLengths.push(trunc.w);
            if (w < trunc.w)
                w = trunc.w;
            h += fontSize + lineSpace;
        }
        h = h - (fontSize + lineSpace);
        return new Text(lines, lineLengths, w, h);
    }
    static #truncateLine(text, maxWidth, margin) {
        const naturalWidth = View.context.measureText(text).width + margin * 2;
        if (naturalWidth <= maxWidth)
            return { text: text, w: naturalWidth };
        for (let i = text.length; i > 0; i--) {
            const candidate = text.slice(0, i) + Text.ellipsis;
            const truncWidth = View.context.measureText(candidate).width + margin * 2;
            if (truncWidth <= maxWidth)
                return { text: candidate, w: truncWidth };
        }
        return { text: '', w: 0 };
    }
}
//# sourceMappingURL=text.js.map