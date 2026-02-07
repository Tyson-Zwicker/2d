export default class Game {
  static gameObjects = new Map();
  static addGameObject(gobj) {
    Game.gameObjects.set(gobj.name, gobj);
  };
  static removeGameObject(name) {
    Game.gameObjects.delete(name);
  }
}