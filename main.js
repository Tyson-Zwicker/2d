import View from './view.js';
import Game from './game.js';
import Transform from './transform.js';
export default class Main {
  static delta = 0;
  static run(fps = 0) {
    let startTime = Date.now();
    if (fps === 0) {
      View.bgColor = '#302';
      Main.continue = false;
      Main.fpsMillis = 1 / 24;
    } else {
      View.bgColor = '#000';
      Main.continue = true;
      Main.fpsMillis = 1000 / fps;
    }
    Main.loop(startTime)
  }

  static loop(startTime) {
    if (startTime) Main.oldTime = startTime;
    Main.time = Date.now();
    Main.delta = (Main.time - Main.oldTime)/1000;;
    //if (Main.delta > Main.fpsMillis) console.warn(`Main loop is taking to long: Delta: ${Main.delta} > ${Main.fpsMillis}`);
    Main.oldTime = Main.time;
    Main.doWork();
    if (Main.continue) setTimeout(Main.loop, Main.fpsMillis);
  }
  static doWork() {
    View.clear();
    Main.draw();
    Main.move();
    Main.checkMouse();
    Main.showDelta();
  }
  static showDelta() {
    View.context.textBaseline = 'top';
    View.context.fillStyle = '#FFFFFF';
    View.context.strokeStyle = '#FFFFFF';
    let oldfont = View.context.font;
    View.context.font = "bold 16px Arial"
    View.context.fillText('Δ' + (String(Math.trunc(Main.delta*1000)).padStart(4, '0')), 5, 5);
    View.context.font = oldfont;
  }
  static draw() {
    for (let gameObject of Game.gameObjects.values()) {
      Transform.gameObjectToWorld(gameObject.body);
      gameObject.body.draw();
    }
  }
  static move() {
    for (let gameobject of Game.gameObjects.values()) {
      gameobject.body.move();
    }
  }
  static checkMouse() {
    let interactionOccured = false;  //TODO: add buttons and make body parts clickable..
    View.handleCameraDrag(interactionOccured);
  }
}