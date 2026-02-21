export default class Boundary {
  static make(x0, y0, x1, y1) {
    if (isNaN(x0 + y0 + x1 + y1)) throw new Error(`Invalid boundry (${x0},${y0},${x1},${y1})`);
    let bound = { x0: undefined, y0: undefined, x1: undefined, y1: undefined };
    if (x1 - x0 > 0 && y1 - y0 > 0) { //x1,y1 = upper left, and x2,y2 = bottom right..
      bound.x0 = x0;
      bound.x1 = x1;
      bound.y0 = y0;
      bound.y1 = y1;
    } else if (x1 - x0 < 0 && y1 - y0 > 0) {  //x1,y1 = upper right, and x2,y2 = bottom left
      bound.x0 = x1;
      bound.x1 = x0;
      bound.y0 = y0;
      bound.y1 = y1;
    } else if (x1 - x0 > 0 && y1 - y0 < 0) { //x1,y1 = bottom left, x2,y2 == upper right
      bound.x0 = x0;
      bound.x1 = x1;
      bound.y0 = y1;
      bound.y1 = y0;
    } else if (x1 - x0 < 0 && y1 - y0 < 0) {// x1,y
      bound.x0 = x1;
      bound.x1 = x0;
      bound.y0 = y1;
      bound.y1 = y0;
    } else {
      throw new Error(`Invalid boundary (${x0},${y0},${x1},${y1})`);
    }
    return bound;
  }
  static width(bound) {
    return bound.x1 - bound.x0;
  }
  static height(bound) {
    return bound.y1 - bound.y0;
  }
  static isValidBoundary(bound) {
    return (bound.x1 > bound.x0) && (bound.y1 > bound.y0) && (!isNaN(bound.x0 + bound.x1 + bound.y0 + bound.y1));
  }
  static isPointInside(x, y, bound) {
    return (x > bound.x0 && x < bound.x1 && y > bound.y0 && y < bound.y1);
  }
  static isPointOnEdge(x, y, bound) {
    if (x === bound.x0 && y > bound.y0 && y < bound.y1) return true; //left edge
    if (x === bound.x1 && y > bound.y0 && y < bound.y1) return true; //right edge
    if (y === bound.y0 && x > bound.x0 && x < bound.x1) return true //top edge
    if (y === bound.y1 && x > bound.x0 && x < bound.x1) return true //bottom edge
    return false;
  }

  static touches(bound1, bound2) {
    if (!bound1 || !bound2) return false;
    const horizontalOverlap = bound1.x0 <= bound2.x1 && bound1.x1 >= bound2.x0;
    const verticalOverlap = bound1.y0 <= bound2.y1 && bound1.y1 >= bound2.y0;
    return horizontalOverlap && verticalOverlap;
  }
}