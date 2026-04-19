"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUIElement = void 0;
const geometry_js_1 = require("./geometry.js");
class GUIElement {
    name;
    position;
    size;
    button = undefined;
    constructor(name, position, size) {
        this.name = name;
        this.position = position;
        this.size = size;
    }
    get bounds() {
        return new geometry_js_1.RectBounds(this.position.x, this.position.y, this.position.x + this.size.x, this.position.y + this.size.y);
    }
}
exports.GUIElement = GUIElement;
//# sourceMappingURL=guielement.js.map