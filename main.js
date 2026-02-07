import View from './view.js';
import Game from './game.js';

export default class Main {
  static delta = 0;
  static run(fps = 0) {
    let startTime = Date.now();
    let fpsMillis;
    if (fps === 0) {
      View.background = '#404';
      Main.continue = false;
      Main.fpsMillis = 0.1;
    } else {
      View.background = '#132';
      Main.continue = true;
      Main.fpsMillis = 1000 / fps;
    }
    Main.loop(startTime)
  }

  static loop(startTime) {
    if (startTime) Main.oldTime = startTime;
    Main.time = Date.now();
    Main.delta = Main.time - Main.oldTime;
    if (Main.delta > Main.fpsMillis) console.log(`Main loop is taking to long: Delta: ${Main.delta} > ${Main.fpsMillis}`);
    Main.oldTime = Main.time;
    Main.doWork();
    if (Main.continue) setTimeout(Main.loop, Main.fpsMillis);
  }
  static doWork() {
    View.clear();
    Main.draw();
    Main.move();
  }
  static draw() {
    for (let gameobject of Game.gameObjects.values()) {
      gameobject.body.draw();
    }
  }
  static move() {
    for (let gameobject of Game.gameObjects.values()) {
      gameobject.body.move();
    }
  }
}