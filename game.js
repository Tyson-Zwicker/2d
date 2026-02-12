import GameObject from './gameobject.js';
export default class Game {
  static gameObjects = new Map();
  static add(obj) {
    if (obj instanceof GameObject) Game.gameObjects.set(obj.name, obj);
    else throw new Error ('unknown object type');
  };
  static get (name){
    if (Game.gameObjects.has (name)) return Game.gameObjects.get (name);
    throw new Error (`unknown object [${name}]`);
  }
  static remove(name) {
    if (obj instanceof GameObject) Game.gameObjects.delete(name);
    else throw new Error ('unknown object type');
  }
}