export class Effects {
    static foreground = [];
    static background = [];
    static addForeground(effect) {
        if (Array.isArray(effect)) {
            this.foreground.push(...effect);
        }
        else {
            this.foreground.push(effect);
        }
    }
    static addBackground(effect) {
        if (Array.isArray(effect)) {
            this.background.push(...effect);
        }
        else {
            this.background.push(effect);
        }
    }
    static renderForeground() {
        const survivors = [];
        for (const effect of this.foreground) {
            if (effect.render())
                survivors.push(effect);
        }
        this.foreground = survivors;
    }
    static renderBackground() {
        const survivors = [];
        for (const effect of this.background) {
            if (effect.render())
                survivors.push(effect);
        }
        this.background = survivors;
    }
}
//# sourceMappingURL=effects.js.map