import Events from "./events.js";

export default class Keyboard {  
  static status = new Map();

  static {
    window.addEventListener('keydown', Keyboard.#keyDown);
    window.addEventListener('keyup', Keyboard.#keyUp);
  }
  static #keyDown(e) {
    Keyboard.status.set (e.key,'down');  
    Events.add ('key-down',e.key);  
  }
  
  static #keyUp(e) {
    Keyboard.status.set (e.key, 'up');    
    Events.add ('key-up',e.key);
  }
}