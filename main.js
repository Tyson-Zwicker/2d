import View from './view.js';
import Game from './game.js';
export default class Main {
  static delta = 0;
  static time = 0;
  static oldTime = 0;
  static creatorsFunction = undefined;  //A callback for the user to use once per loop.
  static tickMsg = [];
  static maxFrames = 0;
  static currentFrame = 0;
  static run(fps = 0) {
    let startTime = Date.now();
    Main.loopTime = 0;
    if (fps === 0) {
      View.bgColor = '#302';
      Main.continue = false;
      Main.maxFrames = 0;
      Main.fpsMillis = 1 / 24;
    } else {
      View.bgColor = '#000';
      Main.continue = true;
      Main.fpsMillis = 1000 / fps;
      Main.maxFrames = Number.MAX_VALUE;
    }
    Main.loop(startTime)
  }
  static runFrames(numFrames) {
    View.bgColor = '#302';
    Main.continue = false;
    Main.maxFrames = numFrames;
    Main.fpsMillis = 1 / 24;
  }
  static loop(startTime) {
    if (startTime) Main.oldTime = startTime;
    Main.time = Date.now();
    Main.delta = (Main.time - Main.oldTime) / 1000;;
    Main.oldTime = Main.time;
    Main.doWork();
    Main.currentFrame++;
    if (Main.currentFrame > Main.maxFrames) Main.continue = false;
    if (Main.continue) setTimeout(Main.loop, Main.fpsMillis);
  }
  static doWork() {
    let t = Date.now();
    View.clear();
    for (let gameObject of Game.gameObjects.values()) {      
      gameObject.move();
      gameObject.update();
      gameObject.draw();      
    }
    Main.checkMouse();
    Main.showDelta();
    if (Main.creatorsFunction) Main.creatorsFunction();
    Main.loopTime = Date.now() - t;
  }
  static checkMouse() {
    let interactionOccured = false;
    View.handleCameraDrag(interactionOccured);
  }
  static showDelta() {
    let y = 5;
    View.context.textBaseline = 'top';
    View.context.fillStyle = '#FFFFFF';
    View.context.strokeStyle = '#FFFFFF';
    let oldfont = View.context.font;
    View.context.font = "bold 16px Arial"
    View.context.fillText(String(Main.currentFrame).padStart(6, '0') + ' Δ' + String(Math.trunc(Main.delta * 1000)).padStart(4, '0') + ' : Σ' + String(Main.loopTime).padStart(4, '0'), 5, y);
    let debugIndent = 0;
    for (let msg of Main.tickMsg) {
      debugIndent += msg.indent;
      y += 20;
      let indStr = '';
      for (let i = 0; i < debugIndent; i++) indStr += '|   ';
      View.context.fillText(indStr + msg.text, 15, y);  //↳
    }
    Main.tickMsg.length = 0;
    View.context.font = oldfont;
  }
}