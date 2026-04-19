/** Base interface for all effects */
export interface Effect {
    render(): boolean;
}
export declare class Effects {
    static foreground: Effect[];
    static background: Effect[];
    static addForeground(effect: Effect | Effect[]): void;
    static addBackground(effect: Effect | Effect[]): void;
    static renderForeground(): void;
    static renderBackground(): void;
}
//# sourceMappingURL=effects.d.ts.map