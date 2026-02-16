import GameObject from './gameobject.js';
export default class Game {
  static gameObjects = new Map();
  static add(obj, position ,rotation) {
    if (!obj || !position || isNaN(rotation)) throw new Error ('Bad or missing parameter(s)');
    if (obj instanceof GameObject){
      if (!obj.finalized) throw new Error (`Game Object not finalized: ${obj.name}`);
       Game.gameObjects.set(obj.name, obj);
       obj.worldPosition = position;       
       obj.worldRotation = rotation;
    }
    else throw new Error ('Only Game Objects can be added to the Game.');
  };
  static get (name){
    if (Game.gameObjects.has (name)) return Game.gameObjects.get (name);
    throw new Error (`unknown object [${name}]`);
  }
  static remove(name) {
    if (Game.gameObjects.has (name)) Game.gameObjects.delete (name);
    else throw new Error ('unknown object type');
  }
}