/** Mood names for different interaction states */
export type MoodName = 'normal' | 'hovered' | 'pressed' | 'shadowed' | 'highlighted';
/** Full appearance definition returned by mood getters */
export interface Appearance {
    name: MoodName | string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    fontName: string;
    fontSize: number;
    borderWidth: number;
}
export declare class Mien {
    #private;
    name: string | undefined;
    constructor(name?: string);
    setFont(name: string, size?: number, mood?: string): void;
    setColors(bg: string, border: string, text: string, mood?: string): void;
    setBorderWidth(width: number, mood?: string): void;
    get normal(): Appearance;
    get hovered(): Appearance;
    get pressed(): Appearance;
    get shadowed(): Appearance;
    get highlighted(): Appearance;
    static get Red(): Mien;
    static get Green(): Mien;
    static get Blue(): Mien;
    static get Gray(): Mien;
    static get Yellow(): Mien;
    static get Cyan(): Mien;
    static get Magenta(): Mien;
    static get Transparent(): Mien;
}
//# sourceMappingURL=mien.d.ts.map