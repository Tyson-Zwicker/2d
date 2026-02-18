import View from './view.js';
import Main from './main.js';


export default class Effects {
  foreground = [];
  background = [];

  addForeground(effect) {
    this.foreground.push(effect);
  }
  addBackground(effect) {
    this.background.push (effect);
  }
  renderForeground() {
    let survivors = [];
    for (let effect of this.foreground) {
      if (effect.render()) survivors.push(effect);
    }
    this.foreground = survivors;
  }
  renderBackground() {
    let survivors = [];
    for (let effect of this.background) {
      if (effect.render()) survivors.push(effect);
    }
    this.background = survivors;
  }
}


