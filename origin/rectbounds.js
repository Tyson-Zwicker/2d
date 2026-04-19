export default class RectBounds {
  static make(x0, y0, x1, y1) {
    if (isNaN(x0 + y0 + x1 + y1)) throw new Error(`Invalid boundry (${x0},${y0},${x1},${y1})`);
    let bounds = { x0: undefined, y0: undefined, x1: undefined, y1: undefined };
    if (x1 - x0 > 0 && y1 - y0 > 0) { //x1,y1 = upper left, and x2,y2 = bottom right..
      bounds.x0 = x0;
      bounds.x1 = x1;
      bounds.y0 = y0;
      bounds.y1 = y1;
    } else if (x1 - x0 < 0 && y1 - y0 > 0) {  //x1,y1 = upper right, and x2,y2 = bottom left
      bounds.x0 = x1;
      bounds.x1 = x0;
      bounds.y0 = y0;
      bounds.y1 = y1;
    } else if (x1 - x0 > 0 && y1 - y0 < 0) { //x1,y1 = bottom left, x2,y2 == upper right
      bounds.x0 = x0;
      bounds.x1 = x1;
      bounds.y0 = y1;
      bounds.y1 = y0;
    } else if (x1 - x0 < 0 && y1 - y0 < 0) {// x1,y
      bounds.x0 = x1;
      bounds.x1 = x0;
      bounds.y0 = y1;
      bounds.y1 = y0;
    } else {
      throw new Error(`Invalid boundary (${x0},${y0},${x1},${y1})`);
    }
    return bounds;
  }
  static width(bounds) {
    return bounds.x1 - bounds.x0;
  }
  static height(bounds) {
    return bounds.y1 - bounds.y0;
  }
  static area (bounds){
    return this.width(bounds)*this.height(bounds);
  }
  static isValidRectBound(bounds) {
    return (bounds.x1 > bounds.x0) && (bounds.y1 > bounds.y0) && (!isNaN(bounds.x0 + bounds.x1 + bounds.y0 + bounds.y1));
  }
  static isPointInside(x, y, bounds) {
    return (x > bounds.x0 && x < bounds.x1 && y > bounds.y0 && y < bounds.y1);
  }
  static isPointOnEdge(x, y, bounds) {
    if (x === bounds.x0 && y > bounds.y0 && y < bounds.y1) return true; //left edge
    if (x === bounds.x1 && y > bounds.y0 && y < bounds.y1) return true; //right edge
    if (y === bounds.y0 && x > bounds.x0 && x < bounds.x1) return true //top edge
    if (y === bounds.y1 && x > bounds.x0 && x < bounds.x1) return true //bottom edge
    return false;
  }
  static touches(bounds1, bounds2) {
    if (!bounds1 || !bounds2) return false;
    const horizontalOverlap = bounds1.x0 <= bounds2.x1 && bounds1.x1 >= bounds2.x0;
    const verticalOverlap = bounds1.y0 <= bounds2.y1 && bounds1.y1 >= bounds2.y0;
    return horizontalOverlap && verticalOverlap;
  }
}