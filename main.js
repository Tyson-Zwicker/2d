import Appearance from './appearance.js';
import View from './view.js';
import Game from './game.js';
import GUI from './gui.js';
import Keyboard from './keyboard.js';
import Effects from '../effects.js';
export default class Main {
  static delta = 0;
  static time = 0;
  static oldTime = 0;
  static creatorsFunction = undefined;  //A callback for the user to use once per loop.
  static tickMsg = [];
  static currentFrame = 0;
  static lastKeyCheck = 0;
  static keyCheckInterval = 100;
  static maxLoopTime =0;
  static {
    View.initialize();
    GUI.initialize(100, 30, 5, 5, Appearance.Green);
    console.log('Main initialized..');
  }
  static run(fps = 0) {
    let startTime = Date.now();
    Main.loopTime = 0;
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
    Main.delta = (Main.time - Main.oldTime) / 1000;;
    Main.oldTime = Main.time;
    Main.doWork();
    Main.currentFrame++;

    if (Main.continue) {
      setTimeout(Main.loop, Main.fpsMillis);
    } else {
      console.log('stopping..');
    }
  }
  static doWork() {
    let t = Date.now();
    try {
      Game.rebuildQuadTrees();
      View.clear();
      for (let gameObject of Game.gameObjects.values()) gameObject.move();
      Effects.renderBackground();
      for (let gameObject of Game.gameObjects.values()) gameObject.render();
      Effects.renderForeground();
      GUI.render();
      Main.checkMouse();
      if (Main.time - Main.lastKeyCheck > Main.keyCheckInterval) Keyboard.processKeyEvents(Main.delta);
      Main.showDelta();
      if (Main.creatorsFunction) Main.creatorsFunction();
      Main.loopTime = Date.now() - t;
      if (Main.loopTime> Main.maxLoopTime &&Main.currentFrame>10) Main.maxLoopTime = Main.loopTime;
    } catch (error) {
      Main.continue = false;
      throw error;
    }
  }
  static checkMouse() {
    let interactionOccured = false;
    /*The order here is important: The activeListElements need to be drawn once
    before they can be checked for mouse interaction BECAUSE they need their drawnBounds set.
    And the draw method will occur again before checkMouse is called again.\
    */
    for (let element of GUI.activeListItemElements) {
      if (element.button) element.button.checkForMouse();
    }
    for (let element of GUI.elements) {
      if (element.button) element.button.checkForMouse();
    }
   
    View.handleCameraDrag(interactionOccured);
  }
  static showDelta() {
    View.context.textBaseline = 'top';
    View.context.fillStyle = '#FFFFFF';
    View.context.strokeStyle = '#FFFFFF';
    let oldfont = View.context.font;
    View.context.font = "bold 14px Arial"
    let frameStr = String(Main.currentFrame).padStart(6, '0');
    let deltaStr = 'Δ ' + String(Math.trunc(Main.delta * 1000)).padStart(4, '0');
    let loopTimeStr = 'Σ ' + String(Main.loopTime).padStart(4, '0');
    let maxLoopTimeStr = 'Ω ' + String(Main.maxLoopTime).padStart(4, '0');
    View.context.fillText(frameStr, 20, 8);
    View.context.fillText(deltaStr, 20, View.canvas.height - 20);
    View.context.fillText(loopTimeStr, View.canvas.width - 70, 8);
    View.context.fillText(maxLoopTimeStr, View.canvas.width - 70, View.canvas.height - 20);
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