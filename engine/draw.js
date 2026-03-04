import Main from './main.js';
import View from './view.js';

export default class Draw {
  static circle(x, y, radius, color, fill) {
    View.context.beginPath();
    View.context.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
    View.context.fillStyle = color;
    if (fill) View.context.fill();
    else View.context.stroke();
  }
  static ellipse(x, y, radiusX, radiusY, color, fill) {
    View.context.beginPath();
    View.context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    View.context.fillStyle = color;
    if (fill) View.context.fill();
    else View.context.stroke();
  }
  static rect(x0, y0, x1, y1, color, fill) {
    if (fill) {
      View.context.fillStyle = color;
      View.context.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    else {
      View.context.strokeStyle = color;
      View.context.beginPath();
      View.context.strokeRect(x0, y0, x1 - x0, y1 - y0);
      View.context.stroke();
    }
  }
  static line(x0, y0, x1, y1, color, lineWidth) {
    View.context.beginPath();
    View.context.moveTo(x0, y0);
    View.context.lineTo(x1, y1);
    View.context.strokeStyle = color;
    View.context.lineWidth = lineWidth;
    View.context.stroke();
  }
  static getTextSize(text, mien) {
    View.context.textBaseline = 'top';
    View.context.textAlign = 'left';
    View.context.font = `${mien.fontSize}px ${mien.fontName}`;
    let metrics = View.context.measureText(text);
    return { "width": metrics.width, "height": (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) ?? mien.fontSize };
  }
  static textBox(x0, y0, x1, y1, text, mien) {
    Draw.rect(x0, y0, x1, y1, mien.borderColor, false);
    Draw.rect(x0, y0, x1, y1, mien.bgColor, true);
    View.context.fillStyle = mien.textColor;
    View.context.textBaseline = 'top';
    View.context.textAlign = 'left';
    View.context.font = `${mien.fontSize}px ${mien.fontName}`;
    let textSize = this.getTextSize(text, mien);
    let tx = x0 + ((x1 - x0) - textSize.width) / 2;
    let ty = y0 + ((y1 - y0) - textSize.height) / 2;
    View.context.fillText(text, tx, ty);
  }
  static multiLineText(x0, y0, x1, y1, lines, lineHeight, mien) {
    Draw.rect(x0, y0, x1, y1, mien.borderColor, false);
    Draw.rect(x0, y0, x1, y1, mien.bgColor, true);
    View.context.fillStyle = mien.textColor;
    View.context.textBaseline = 'top';
    View.context.textAlign = 'left';
    View.context.font = `${mien.fontSize}px ${mien.fontName}`;
    //calculate Y offset from top to center the block of text VERTICALLY.
    let oy = ((y1 - y0) - lines.length * lineHeight) / 2;
    let ty = y0;
    for (let text of lines) {
      let textSize = this.getTextSize(text, mien);
      let tx = x0 + ((x1 - x0) - textSize.width) / 2;
      View.context.fillText(text, tx, oy+ty);
      ty += lineHeight;
    }
  }
}