export default class Keyboard {
  static functions = new Map();
  static events = new Map();

  static {
    window.addEventListener('keydown', Keyboard.#keyDown);
    window.addEventListener('keyup', Keyboard.#keyUp);
  }

  static setKeyFunction(key, fn) {
    Keyboard.functions.set(key, fn);
    console.log (`function set for [${key}]`);
  }

  static processKeyEvents(delta) {    
    for (let key of Keyboard.events.keys()) {      
      if (Keyboard.functions.has(key)) {
        let fn = Keyboard.functions.get(key);
        fn (Keyboard.events.get(key));
      }
      if (Keyboard.events.get(key).action === 'release') {
        Keyboard.events.delete(key);
      }
    }
  }

  static #keyDown(e) {    
    let eventInfo;
    let lastEvent = Keyboard.events.get(e.key);
    if (Keyboard.events.has(e.key)) {
      if (lastEvent.action === 'press') {
        eventInfo = Keyboard.#getHoldEvent(e, lastEvent.when);
      } else if (lastEvent.action === 'hold') {
        eventInfo = Keyboard.#getUpdateHoldEvent(e, lastEvent.holdStartTime);
      } else if (lastEvent.action === 'release') {
        eventInfo = Keyboard.#getPressEvent(e);
      }
    } else {
      eventInfo = Keyboard.#getPressEvent(e);
    }
    Keyboard.events.set(e.key, eventInfo);    
  }

  static #keyUp(e) {
    let eventInfo;
    if (Keyboard.events.has(e.key)) {
      let lastEvent = Keyboard.events.get(e.key);
      if (lastEvent.action === 'press') {
        eventInfo = Keyboard.#getReleaseEvent(e, 0);
      } else if (lastEvent.action === 'hold') {
        eventInfo = Keyboard.#getReleaseHoldEvent(e, lastEvent.duration);
      }
      Keyboard.events.set(e.key, eventInfo);
    }
  }

  static #getPressEvent(e) {
    return { "key": e.key, "when": Date.now(), "duration": 0, "action": 'press' };
  }

  static #getHoldEvent(e, pressStartTime) {
    let now = Date.now();
    let dur = now - pressStartTime;
    return { "key": e.key, "when": now, "holdStartTime": pressStartTime, "duration": dur, "action": 'hold' };
  }

  static #getUpdateHoldEvent(e, holdStartTime) {
    let now = Date.now();
    let dur = now - holdStartTime;
    return { "key": e.key, "when": Date.now(), "holdStartTime": holdStartTime, "duration": dur, "action": 'hold' };
  }

  static #getReleaseEvent(e, duration) {
    return { "key": e.key, "when": Date.now(), "duration": duration, "action": 'release' };
  }

  static #getReleaseHoldEvent(e, duration) {
    return { "key": e.key, "when": Date.now(), "duration": duration, "action": 'release' };
  }
 
}