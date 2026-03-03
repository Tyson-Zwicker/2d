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
  static textBox2(x0, y0, x1, y1, text, mien) {
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
  static textBox(pos, size, lines, mien, center = true) {
    Draw.rect(pos.x, pos.y, pos.x + size.width, pos.y + size.height, mien.borderColor, false);
    Draw.rect(pos.x, pos.y, pos.x + size.width, pos.y + size.height, mien.bgColor, true);
    View.context.fillStyle = mien.textColor;
    View.context.textBaseline = 'top';
    View.context.font = `${mien.fontSize}px ${mien.fontName}`;
    let y = pos.y;
    for (txt of lines) {
      if (center) {
        let textWidth = txt.textWidth;
        View.context.textAlign = 'center';
        let x = pos.x + textWidth / 2;
        View.context.fillText(txt, x, y);
      } else {
        View.Context.textAlign='left';
        let x = pos.x;
        View.context.fillText (txt,x,y);
      }
      y+=GUI.mien.fontSize;
    }
  }
}
