import Effects from './effects.js';
import Events from './events.js';
import Sim from './sim.js';
import GUI from './gui.js';
import View from './view.js';
export default class Main {
  static delta = 0;
  static time = 0;
  static oldTime = 0;
  static creatorsFunction = undefined;  //A callback for the user to use once per loop.
  static currentFrame = 0;
  static maxLoopTime = 0;
  static {
    View.initialize();
    GUI.initialize();
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
      Events.reset();
      Sim.rebuildQuadTrees();
      View.clear();
      for (let simObject of Sim.dynamicObjects.values()) simObject.move();
      Effects.renderBackground();
      for (let simObject of Sim.staticObjects.values()) simObject.render();
      for (let simObject of Sim.dynamicObjects.values()) simObject.render();
      Effects.renderForeground();
      GUI.render();
      Main.checkMouse();
      Main.showDelta();
      if (Main.creatorsFunction) Main.creatorsFunction();
      Main.loopTime = Date.now() - t;
      if (Main.loopTime > Main.maxLoopTime && Main.currentFrame > 10) Main.maxLoopTime = Main.loopTime;
    } catch (error) {
      Main.continue = false;
      throw error;
    }
  }
  static checkMouse() {
    let interactionOccured = false;
    for (let element of GUI.elements) {      
      if (element.button) {
        if (element.button.checkForMouse()) interactionOccured = true;
      }
    }
    for (let object of Sim.simObjects.values()) {
      if (object.buttons && object.buttons.length > 0) {
        for (let button of object.buttons) {
          if (button.checkForMouse()) interactionOccured = true;
        }
      }
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
    View.context.font = oldfont;
  }
}