export default class Facade {
  static normal = new Facade();
  static hovered = new Facade('#555', '#fff', '#fff', 1, 'Arial', 12);
  static pressed = new Facade('#fff', '#666', '#000', 1, 'Arial', 12);  
  static shadowed = new Facade('#222', '#222', '#777', 1, 'Arial', 12);
  static highlighted = new Facade('#666', '#444', '#222', 1, 'Arial', 12);
  constructor(backgroundColor = '#444', borderColor = '#eee', textColor = '#ddd', borderWidth = 1, fontName = 'Arial', fontSize = 12, name) {
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.textColor = textColor;
    this.borderWidth = borderWidth;
    this.fontName = fontName;
    this.fontSize = fontSize;
    this.name = name; //used for debugging.. not used by the code itself.
  }
}