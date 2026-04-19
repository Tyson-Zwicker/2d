// Mien - Visual appearance/style definitions for polygons and GUI components

// ============================================================================
// Types & Interfaces
// ============================================================================

/** Mood names for different interaction states */
export type MoodName = 'normal' | 'hovered' | 'pressed' | 'shadowed' | 'highlighted';

/** Full appearance definition returned by mood getters */
export interface Appearance {
  name: MoodName | string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  fontName: string;
  fontSize: number;
  borderWidth: number;
}

/** Partial appearance for mood overrides (all properties optional) */
interface IMood {
  name?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  fontName?: string;
  fontSize?: number;
  borderWidth?: number;
}

// ============================================================================
// Mien Class
// ============================================================================

export class Mien {
  name: string | undefined = undefined;

  #fontName: string = 'monospace';
  #fontSize: number = 14;
  #borderWidth: number = 1;
  #bgColor: string = '#444';
  #borderColor: string = '#aaa';
  #textColor: string = '#fff';
  #moods: Map<string, IMood> = new Map();

  constructor(name?: string) {
    this.name = name;
  }

  setFont(name: string, size?: number, mood?: string): void {
    if (mood) {
      if (!this.#moods.has(mood)) this.#moods.set(mood, {});
      const moodData = this.#moods.get(mood)!;
      moodData.fontName = name;
      if (size !== undefined) moodData.fontSize = size;
    } else {
      this.#fontName = name;
      if (size !== undefined) this.#fontSize = size;
    }
  }

  setColors(bg: string, border: string, text: string, mood?: string): void {
    if (mood) {
      if (!this.#moods.has(mood)) this.#moods.set(mood, {});
      const moodData = this.#moods.get(mood)!;
      moodData.bgColor = bg;
      moodData.borderColor = border;
      moodData.textColor = text;
    }
    if (!mood || mood === 'normal') {
      this.#bgColor = bg;
      this.#borderColor = border;
      this.#textColor = text;
    }
  }

  setBorderWidth(width: number, mood?: string): void {
    if (mood) {
      if (!this.#moods.has(mood)) this.#moods.set(mood, {});
      this.#moods.get(mood)!.borderWidth = width;
    } else {
      this.#borderWidth = width;
    }
  }

  #get(mood?: string): Appearance {
    const appearance: Appearance = {
      name: 'normal',
      bgColor: this.#bgColor,
      borderColor: this.#borderColor,
      textColor: this.#textColor,
      fontName: this.#fontName,
      fontSize: this.#fontSize,
      borderWidth: this.#borderWidth,
    };

    if (!mood || mood === 'normal') return appearance;

    if (this.#moods.has(mood)) {
      const moodAppearance = this.#moods.get(mood)!;
      if (moodAppearance.bgColor) appearance.bgColor = moodAppearance.bgColor;
      if (moodAppearance.borderColor) appearance.borderColor = moodAppearance.borderColor;
      if (moodAppearance.textColor) appearance.textColor = moodAppearance.textColor;
      if (moodAppearance.fontName) appearance.fontName = moodAppearance.fontName;
      if (moodAppearance.fontSize) appearance.fontSize = moodAppearance.fontSize;
      if (moodAppearance.borderWidth) appearance.borderWidth = moodAppearance.borderWidth;
      appearance.name = mood;
    }

    return appearance;
  }

  get normal(): Appearance {
    return this.#get('normal');
  }

  get hovered(): Appearance {
    return this.#get('hovered');
  }

  get pressed(): Appearance {
    return this.#get('pressed');
  }

  get shadowed(): Appearance {
    return this.#get('shadowed');
  }

  get highlighted(): Appearance {
    return this.#get('highlighted');
  }

  // ===========================================================================
  // Preset Color Schemes
  // ===========================================================================

  static get Red(): Mien {
    const mien = new Mien();
    mien.setColors('#720', '#f00', '#fff', 'normal');
    mien.setColors('#f55', '#f55', '#420', 'hovered');
    mien.setColors('#fff', '#f66', '#000', 'pressed');
    mien.setColors('#900', '#900', '#777', 'shadowed');
    mien.setColors('#f66', '#f66', '#222', 'highlighted');
    return mien;
  }

  static get Green(): Mien {
    const mien = new Mien();
    mien.setColors('#060', '#2f4', '#fff', 'normal');
    mien.setColors('#5f5', '#5f5', '#042', 'hovered');
    mien.setColors('#030', '#6f6', '#fff', 'pressed');
    mien.setColors('#090', '#090', '#444', 'shadowed');
    mien.setColors('#6f6', '#6f6', '#222', 'highlighted');
    return mien;
  }

  static get Blue(): Mien {
    const mien = new Mien();
    mien.setColors('#027', '#26f', '#fff', 'normal');
    mien.setColors('#4af', '#29f', '#026', 'hovered');
    mien.setColors('#66f', '#008', '#0af', 'pressed');
    mien.setColors('#009', '#009', '#777', 'shadowed');
    mien.setColors('#66f', '#66f', '#222', 'highlighted');
    return mien;
  }

  static get Gray(): Mien {
    const mien = new Mien();
    mien.setColors('#444', '#aaa', '#fff', 'normal');
    mien.setColors('#555', '#555', '#fff', 'hovered');
    mien.setColors('#fff', '#666', '#000', 'pressed');
    mien.setColors('#099', '#099', '#777', 'shadowed');
    mien.setColors('#666', '#666', '#222', 'highlighted');
    return mien;
  }

  static get Yellow(): Mien {
    const mien = new Mien('yellow');
    mien.setColors('#aa0', '#ff0', '#fff', 'normal');
    mien.setColors('#ff0', '#fff', '#880', 'hovered');
    mien.setColors('#aa0', '#770', '#ff0', 'pressed');
    mien.setColors('#990', '#990', '#777', 'shadowed');
    mien.setColors('#ff6', '#ff6', '#222', 'highlighted');
    return mien;
  }

  static get Cyan(): Mien {
    const mien = new Mien();
    mien.setColors('#066', '#0ff', '#fff', 'normal');
    mien.setColors('#5ff', '#5ff', '#fff', 'hovered');
    mien.setColors('#fff', '#6ff', '#000', 'pressed');
    mien.setColors('#099', '#099', '#777', 'shadowed');
    mien.setColors('#6ff', '#6ff', '#222', 'highlighted');
    return mien;
  }

  static get Magenta(): Mien {
    const mien = new Mien();
    mien.setColors('#606', '#f0f', '#fff', 'normal');
    mien.setColors('#f5f', '#f5f', '#fff', 'hovered');
    mien.setColors('#fff', '#f6f', '#000', 'pressed');
    mien.setColors('#909', '#909', '#777', 'shadowed');
    mien.setColors('#f6f', '#f6f', '#222', 'highlighted');
    return mien;
  }

  static get Transparent(): Mien {
    const mien = new Mien();
    mien.setColors('#0000', '#0000', '#0000', 'normal');
    mien.setColors('#0000', '#0000', '#0000', 'hovered');
    mien.setColors('#0000', '#0000', '#0000', 'pressed');
    mien.setColors('#0000', '#0000', '#0000', 'shadowed');
    mien.setColors('#0000', '#0000', '#0000', 'highlighted');
    return mien;
  }
}
