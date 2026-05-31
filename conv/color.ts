// Color - RGB color representation with multiple construction methods
//
// IMPORTANT: Effect classes (LineEffect, CircleEffect, etc.) append a single
// hex digit for opacity (0-f). To ensure compatibility:
// - Use toHexShort() for 3-digit format (#RGB) when passing to effects
// - The effect will append one digit to create #RGBA (valid CSS)
// - Avoid using toHex() (6-digit #RRGGBB) with effects as it creates
//   #RRGGBBo (7 chars) which is non-standard

export class Color {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
  a: number;  // 0-255 (optional alpha/opacity)

  private constructor(r: number, g: number, b: number, a: number = 255) {
    // Validate integer range (0-255)
    this.validateIntRange(r, 'r');
    this.validateIntRange(g, 'g');
    this.validateIntRange(b, 'b');
    this.validateIntRange(a, 'a');
    
    this.r = Math.round(r);
    this.g = Math.round(g);
    this.b = Math.round(b);
    this.a = Math.round(a);
  }

  /**
   * Validate that a value is in the range 0-255
   */
  private validateIntRange(value: number, name: string): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Color component '${name}' must be a number, got ${typeof value}`);
    }
    if (value < 0 || value > 255) {
      throw new Error(`Color component '${name}' must be in range 0-255, got ${value}`);
    }
  }

  /**
   * Validate that a float value is in the range 0.0-1.0
   */
  private validateFloatRange(value: number, name: string): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Color component '${name}' must be a number, got ${typeof value}`);
    }
    if (value < 0.0 || value > 1.0) {
      throw new Error(`Color component '${name}' must be in range 0.0-1.0, got ${value}`);
    }
  }

  /**
   * Create a color from RGB integer values (0-255)
   * @throws {Error} if any value is outside the range 0-255
   */
  static fromRGB(r: number, g: number, b: number, a: number = 255): Color {
    return new Color(r, g, b, a);
  }

  /**
   * Create a color from RGB float values (0.0-1.0)
   * @throws {Error} if any value is outside the range 0.0-1.0
   */
  static fromRGBFloat(r: number, g: number, b: number, a: number = 1.0): Color {
    // Create a temporary instance to use validation
    const temp = new Color(0, 0, 0, 0);
    temp.validateFloatRange(r, 'r');
    temp.validateFloatRange(g, 'g');
    temp.validateFloatRange(b, 'b');
    temp.validateFloatRange(a, 'a');
    return new Color(r * 255, g * 255, b * 255, a * 255);
  }

  /**
   * Create a color from a hex string (#RGB, #RRGGBB, #RGBA, or #RRGGBBAA)
   */
  static fromHex(hex: string): Color {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    let r: number, g: number, b: number, a: number = 255;

    if (hex.length === 3) {
      // #RGB format - expand to #RRGGBB
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 4) {
      // #RGBA format - expand to #RRGGBBAA
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 6) {
      // #RRGGBB format
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      // #RRGGBBAA format
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16);
    } else {
      throw new Error(`Invalid hex color format: ${hex}`);
    }

    return new Color(r, g, b, a);
  }

  /**
   * Convert to hex string (#RRGGBB or #RRGGBBAA if alpha < 255)
   */
  toHex(): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    if (this.a < 255) {
      return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}${toHex(this.a)}`;
    }
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
  }

  /**
   * Convert to short hex string (#RGB or #RGBA if alpha < 255)
   * Useful for effect classes that append single-digit opacity
   * Note: Precision loss due to 4-bit per channel (16 values each)
   */
  toHexShort(): string {
    const toHex = (n: number) => Math.round(n / 17).toString(16);
    if (this.a < 255) {
      return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}${toHex(this.a)}`;
    }
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
  }

  /**
   * Convert to format compatible with effect classes
   * Returns 3-digit hex (#RGB) for effects to append opacity digit
   */
  toEffectColor(): string {
    const toHex = (n: number) => Math.round(n / 17).toString(16);
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
  }

  /**
   * Convert to RGB string for canvas (rgb(r, g, b))
   */
  toRGB(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  /**
   * Convert to RGBA string for canvas (rgba(r, g, b, a))
   */
  toRGBA(): string {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${(this.a / 255).toFixed(3)})`;
  }

  /**
   * Get RGB values as floats (0.0-1.0)
   */
  toRGBFloat(): { r: number; g: number; b: number } {
    return {
      r: this.r / 255,
      g: this.g / 255,
      b: this.b / 255,
    };
  }

  /**
   * Get RGBA values as floats (0.0-1.0)
   */
  toRGBAFloat(): { r: number; g: number; b: number; a: number } {
    return {
      r: this.r / 255,
      g: this.g / 255,
      b: this.b / 255,
      a: this.a / 255,
    };
  }

  /**
   * Create a new color with different alpha value
   * @throws {Error} if alpha is outside the range 0-255
   */
  withAlpha(alpha: number): Color {
    return new Color(this.r, this.g, this.b, alpha);
  }

  /**
   * Create a new color with alpha as a float (0.0-1.0)
   * @throws {Error} if alpha is outside the range 0.0-1.0
   */
  withAlphaFloat(alpha: number): Color {
    this.validateFloatRange(alpha, 'alpha');
    return new Color(this.r, this.g, this.b, alpha * 255);
  }
}
