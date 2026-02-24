import Facade from './facade.js';
export default class Appearance {
  normal = Facade.normal;
  hovered = Facade.hovered;
  pressed = Facade.pressed;
  shadowed = Facade.shadowed;
  highlighted = Facade.highlighted;
  constructor(normal, hovered, pressed, shadowed, highlighted) {
    this.normal = normal;             //Required to render parts, the rest are required for interactive things (like gui buttons/lists)
    this.hovered = hovered;
    this.pressed = pressed;
    this.shadowed = shadowed;
    this.highlighted = highlighted;
  }
  static Default = new Appearance(
    new Facade('#444', '#ccc', '#fff', 1, 'Arial', 12),
    new Facade('#ddd', '#fff', '#000', 1, 'Arial', 12),
    new Facade('#eee', '#eee', '#000', 1, 'Arial', 12),
    new Facade('#222', '#444', '#777', 1, 'Arial', 12),
    new Facade('#fff', '#eee', '#222', 1, 'Arial', 12)
  );
  static Red = new Appearance(
    new Facade('#720', '#f00', '#fff', 1, 'Arial', 12),
    new Facade('#f55', '#f55', '#fff', 1, 'Arial', 12),
    new Facade('#fff', '#f66', '#000', 1, 'Arial', 12),
    new Facade('#900', '#900', '#777', 1, 'Arial', 12),
    new Facade('#f66', '#f66', '#222', 1, 'Arial', 12)
  );
  static Green = new Appearance(
    new Facade('#060', '#2f4', '#fff', 1, 'Arial', 12),
    new Facade('#5f5', '#5f5', '#fff', 1, 'Arial', 12),
    new Facade('#fff', '#6f6', '#000', 1, 'Arial', 12),
    new Facade('#090', '#090', '#777', 1, 'Arial', 12),
    new Facade('#6f6', '#6f6', '#222', 1, 'Arial', 12)
  );
  static Blue = new Appearance(
    new Facade('#027', '#26f', '#fff', 1, 'Arial', 12),
    new Facade('#55f', '#55f', '#fff', 1, 'Arial', 12),
    new Facade('#fff', '#66f', '#000', 1, 'Arial', 12),
    new Facade('#009', '#009', '#777', 1, 'Arial', 12),
    new Facade('#66f', '#66f', '#222', 1, 'Arial', 12)
  );  
  static Yellow = new Appearance(
    new Facade('#aa0', '#ff0', '#fff', 1, 'Arial', 12),
    new Facade('#ff5', '#ff5', '#fff', 1, 'Arial', 12),
    new Facade('#fff', '#ff6', '#000', 1, 'Arial', 12),
    new Facade('#990', '#990', '#777', 1, 'Arial', 12),
    new Facade('#ff6', '#ff6', '#222', 1, 'Arial', 12)
  );
  static Cyan = new Appearance(
    new Facade('#066', '#0ff', '#fff', 1, 'Arial', 12),
    new Facade('#5ff', '#5ff', '#fff', 1, 'Arial', 12),
    new Facade('#fff', '#6ff', '#000', 1, 'Arial', 12),
    new Facade('#099', '#099', '#777', 1, 'Arial', 12),
    new Facade('#6ff', '#6ff', '#222', 1, 'Arial', 12)
  );
  static Magenta = new Appearance(
    new Facade('#606', '#f0f', '#fff', 1, 'Arial', 12),
    new Facade('#f5f', '#f5f', '#fff', 1, 'Arial', 12),
    new Facade('#fff', '#f6f', '#000', 1, 'Arial', 12),
    new Facade('#909', '#909', '#777', 1, 'Arial', 12),
    new Facade('#f6f', '#f6f', '#222', 1, 'Arial', 12)
  );
}

