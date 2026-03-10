export default class Mien {
  name = undefined;
  #fontName = 'monospace';
  #fontSize = 14;
  #borderWidth = 1;
  #bgColor = '#444';
  #borderColor = '#aaa';
  #textColor = '#fff';
  #moods = new Map();
  constructor(name) {
    this.name = name;
  }
  setFont(name, size, mood) {
    if (mood) {
      if (!this.#moods.has(mood)) this.#moods.set(mood, {});
      this.#moods.get(mood).fontName = name;
      this.#moods.get(mood).fontSize = size;
    } else {
      this.#fontName = name;
      if (size) this.#fontSize = size;
    }
  }
  setColors(bg, border, text, mood) {
    if (mood) {
      if (!this.#moods.has(mood)) this.#moods.set(mood, {});
      this.#moods.get(mood).bgColor = bg;
      this.#moods.get(mood).borderColor = border;
      this.#moods.get(mood).textColor = text;
    }
    if (!mood || mood === 'normal') {
      this.#bgColor = bg;
      this.#borderColor = border;
      this.#textColor = text;
    }
  }
  setBorderWidth(width, mood) {
    if (mood) {
      if (!this.#moods.has(mood)) this.#moods.set(mood, {});
      this.#moods.get(mood).borderWidth = width;
    } else {
      this.#borderWidth = width;
    }
  }
  #get(mood) {
    let appearance = { name: 'normal', bgColor: this.#bgColor, borderColor: this.#borderColor, textColor: this.#textColor, fontName: this.#fontName, fontSize: this.#fontSize, borderWidth: this.#borderWidth };
    if (!mood || mood === 'normal') return appearance;
    if (this.#moods.has(mood)) {
      let moodAppearance = this.#moods.get(mood);
      moodAppearance.name = mood;
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
  get normal() {
    return this.#get('normal');
  }
  get hovered() {
    return this.#get('hovered');
  }
  get pressed() {
    return this.#get('pressed');
  }
  get shadowed() {
    return this.#get('shadowed');
  }
  get highlighted() {
    return this.#get('highlighted');
  }
  static get Red() {
    let mien = new Mien();
    mien.setColors('#720', '#f00', '#fff', 'normal');
    mien.setColors('#f55', '#f55', '#420', 'hovered');
    mien.setColors('#fff', '#f66', '#000', 'pressed');
    mien.setColors('#900', '#900', '#777', 'shadowed');
    mien.setColors('#f66', '#f66', '#222', 'highlighted');
    return mien;
  }
  static get Green() {
    let mien = new Mien();
    mien.setColors('#060', '#2f4', '#fff', 'normal');
    mien.setColors('#5f5', '#5f5', '#042', 'hovered');
    mien.setColors('#030', '#6f6', '#fff', 'pressed');
    mien.setColors('#090', '#090', '#777', 'shadowed');
    mien.setColors('#6f6', '#6f6', '#222', 'highlighted');
    return mien;
  }
  static get Blue() {
    let mien = new Mien();
    mien.setColors('#027', '#26f', '#fff', 'normal');
    mien.setColors('#4af', '#29f', '#026', 'hovered');
    mien.setColors('#66f', '#008', '#0af', 'pressed');
    mien.setColors('#009', '#009', '#777', 'shadowed');
    mien.setColors('#66f', '#66f', '#222', 'highlighted');
    return mien;
  }
  static get Gray() {
    let mien = new Mien();
    mien.setColors('#444', '#aaa', '#fff', 'normal');
    mien.setColors('#555', '#555', '#fff', 'hovered');
    mien.setColors('#fff', '#666', '#000', 'pressed');
    mien.setColors('#099', '#099', '#777', 'shadowed');
    mien.setColors('#666', '#666', '#222', 'highlighted');
    return mien;
  }
  static get Yellow() {
    let mien = new Mien('yellow');
    mien.setColors('#aa0', '#ff0', '#fff', 'normal');
    mien.setColors('#ff0', '#fff', '#880', 'hovered');
    mien.setColors('#aa0', '#770', '#ff0', 'pressed');
    mien.setColors('#990', '#990', '#777', 'shadowed');
    mien.setColors('#ff6', '#ff6', '#222', 'highlighted');
    return mien;
  }
  static get Cyan() {
    let mien = new Mien();
    mien.setColors('#066', '#0ff', '#fff', 'normal');
    mien.setColors('#5ff', '#5ff', '#fff', 'hovered');
    mien.setColors('#fff', '#6ff', '#000', 'pressed');
    mien.setColors('#099', '#099', '#777', 'shadowed');
    mien.setColors('#6ff', '#6ff', '#222', 'highlighted');
    return mien;
  }
  static get Magenta() {
    let mien = new Mien();
    mien.setColors('#606', '#f0f', '#fff', 'normal');
    mien.setColors('#f5f', '#f5f', '#fff', 'hovered');
    mien.setColors('#fff', '#f6f', '#000', 'pressed');
    mien.setColors('#909', '#909', '#777', 'shadowed');
    mien.setColors('#f6f', '#f6f', '#222', 'highlighted');
    return mien;
  };
  static get Transparent(){
    let mien = new Mien();
    mien.setColors('#0000', '#0000', '#0000', 'normal');
    mien.setColors('#0000', '#0000', '#0000', 'hovered');
    mien.setColors('#0000', '#0000', '#0000', 'pressed');
    mien.setColors('#0000', '#0000', '#0000', 'shadowed');
    mien.setColors('#0000', '#0000', '#0000', 'highlighted');
    return mien;
  }
}