export default class Keyboard {
  static functions = new Map();
  static events = new Map();
  static status = new Map();

  static {
    window.addEventListener('keydown', Keyboard.#keyDown);
    window.addEventListener('keyup', Keyboard.#keyUp);
  }

  static setKeyFunction(key, fn) {
    Keyboard.functions.set(key, fn);
    console.log(`function set for [${key}]`);
  }

  static processKeyEvents(delta) {
    for (let key of Keyboard.events.keys()) {
      if (Keyboard.functions.has(key) && Keyboard.events.has(key)) {
        let fn = Keyboard.functions.get(key);
        if (!Keyboard.events.get(key)) throw new error ('no event..');
        fn(Keyboard.events.get(key));
      }
      if (Keyboard.events.get(key).action === 'release') {
        Keyboard.events.delete(key);        
      }
    }
  }

  static #keyDown(e) {
    let eventInfo;
    eventInfo = Keyboard.#getPressEvent(e);
    Keyboard.events.set(e.key, eventInfo);
  }

  static #keyUp(e) {
    let eventInfo;
    if (Keyboard.events.has(e.key)) {
      let lastEvent = Keyboard.events.get(e.key);
      if (lastEvent.action === 'press') {
        eventInfo = Keyboard.#getReleaseEvent(e, lastEvent);
      } else if (lastEvent.action === 'hold') {
        eventInfo = Keyboard.#getReleaseHoldEvent(e, lastEvent);
      }
      Keyboard.events.set(e.key, eventInfo);
    }
  }

  static #getPressEvent(e) {
    let holdStartTime = Date.now();
    return { "key": e.key, "when": Date.now(), "holdStartTime": holdStartTime, "action": 'press' };
  }
  static #getReleaseEvent(e, lastEvent) {
    let duration = Date.now() - lastEvent.holdStartTime; // it had to have been pressed to get released..
    return { "key": e.key, "when": Date.now(), "duration": duration, "action": 'release' };
  }

  static #getReleaseHoldEvent(e, lastEvent) {   
    let duration = Date.now - lastEvent.holdStartTime;
    return { "key": e.key, "when": Date.now(), "duration": duration, "action": 'release' };
  }

}