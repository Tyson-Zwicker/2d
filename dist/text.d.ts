export declare class Text {
    #private;
    static ellipsis: string;
    lines: string[];
    lineLengths: number[];
    w: number;
    h: number;
    constructor(linesArray: string[], lineLengthsArray: number[], width: number, height: number);
    static getTextFromArray(text: string[], maxSize: {
        w: number;
        h: number;
        m: number;
    }, fontName: string, fontSize: number, lineSpace: number, margin: number): Text;
}
//# sourceMappingURL=text.d.ts.map