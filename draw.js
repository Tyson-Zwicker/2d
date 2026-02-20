import View from './view.js';
export default class Draw{
  static circle(x, y, radius, color,fill) {
    View.context.beginPath();
    View.context.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
    View.context.fillStyle = color;
    if (fill) View.context.fill();
    else View.context.stroke();
  }
  static ellipse(x, y, radiusX  , radiusY, color, fill) {
    View.context.beginPath();
    View.context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    View.context.fillStyle = color;
    if (fill) View.context.fill();
    else View.context.stroke(); 
  }
  static rect(x0, y0, x1, y1, color, fill) {
    View.context.fillStyle = color;
    if (fill) View.context.fillRect(x0, y0, x1 - x0, y1 - y0);
    else View.context.strokeRect(x0, y0, x1 - x0, y1 - y0);
  }
  static line(x0, y0, x1, y1, color, lineWidth) {
    View.context.beginPath();
    View.context.moveTo(x0, y0);
    View.context.lineTo(x1, y1);
    View.context.strokeStyle = color;
    View.context.lineWidth = lineWidth;
    View.context.stroke();
  }
  static getTextSize(text, facade) {
    View.context.textBaseline = 'top';
    View.context.textAlign = 'left';
    View.context.font = `${facade.fontSize}px ${facade.fontName}`;
    let metrics = View.context.measureText(text);
    return { "width": metrics.width, "height": (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) ?? fontSize };
  }
  static textBox(x0, y0, x1, y1, text, facade) {
    console.log('Drawing text box:', text, 'in area:', x0, y0, x1, y1, 'with facade:', facade);
    Draw.rect(x0, y0, x1, y1, facade.borderColor, false);
    Draw.rect(x0, y0, x1, y1, facade.backgroundColor,true);
    View.context.fillStyle = facade.textColor;
    View.context.textBaseline = 'top';
    View.context.textAlign = 'left';
    View.context.font = `${facade.fontSize}px ${facade.fontName}`;
    let textSize = this.getTextSize(text, facade);
    let tx = x0 + ((x1 - x0) - textSize.width) / 2;
    let ty = y0 + ((y1 - y0) - textSize.height) / 2;
    View.context.fillText(text, tx, ty);
  }
}