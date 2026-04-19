import Camera from './camera.js';
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
    console.log('Main initialized...');
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
    Main.loop(startTime);
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
      if (Camera.isPanning) Camera.move();
      let dynamicOnScreen = Sim.dynamicQuadtree.findInRange(Camera.cameraBounds);
      let staticOnScreen = Sim.staticQuadtree.findInRange(Camera.cameraBounds);

      for (let candidate of dynamicOnScreen) {
        if (candidate.ref.canMove === 'onscreen') {
          candidate.ref.move();
        }
      }
      for (let simObject of Sim.dynamicObjects.values()) {
        if (simObject.canMove === 'always') {
          simObject.move();
        }
      }

      Effects.renderBackground();
      for (let candidate of staticOnScreen) {
        candidate.ref.render();
      }
      for (let candidate of dynamicOnScreen) {
        candidate.ref.render();
      }
      Effects.renderForeground();
      GUI.render();

      //Collisions //Remember quadtrees return objects with ref, pos and radius ONLY..
      Main.collisions = new Map();
      for (let simObject of Sim.dynamicObjects.values()) {
        if (simObject.collides) {
          let bounds = {
            x0: simObject.worldPosition.x - simObject.radius,
            y0: simObject.worldPosition.y - simObject.radius,
            x1: simObject.worldPosition.x + simObject.radius,
            y1: simObject.worldPosition.y + simObject.radius
          };
          let dynamicCandidates = Sim.dynamicQuadtree(findInRange(bounds));
          for (let candidate of dynamicCandidates) {
            if (candidate.ref.collides) {
              let r = candidate.radius + simObject.radius;
              let d = Math.hypot(candidate.position.x - simObject.position.x, candidate.position.y - simObject.position.y);
              if (r <= d) {
                if (!Main.collisions.has(simObject.name)) Main.collisions.set(simObject.name, []);
                Main.collision.get[simObject.name].push(candidate.ref);
              }
            }
          }
        }
      }
      /*
      //Should end with Map of everything that collided, 
      //key is collider's name, value is array of objects collided with..
      */

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
    for (let panel of GUI.panels) {
      if (panel.isVisible()) {
        for (let element of panel.elements) {
          if (element.button) {
            if (element.button.checkForMouse()) interactionOccured = true;
          }
        }
      }
    }
    for (let object of Sim.simObjects.values()) {
      if (object.button && object.button.checkForMouse()) interactionOccured = true;
    }
    View.handleCameraDrag(interactionOccured);
  }

  static showDelta() {
    View.context.textBaseline = 'top';
    View.context.fillStyle = '#FFFFFF';
    View.context.strokeStyle = '#FFFFFF';
    let oldfont = View.context.font;
    View.context.font = "bold 14px Arial"
    let frameStr = 'Φ ' + String(Main.currentFrame).padStart(4, '0');
    let deltaStr = 'Δ ' + String(Math.trunc(Main.delta * 1000)).padStart(4, '0');
    let loopTimeStr = 'Σ ' + String(Main.loopTime).padStart(4, '0');
    let maxLoopTimeStr = 'Ω ' + String(Main.maxLoopTime).padStart(4, '0');
    View.context.fillText(frameStr, 20, 8);
    View.context.fillText(deltaStr, 20, View.canvas.height - 20);
    View.context.fillText(loopTimeStr, View.canvas.width - 70, 8);
    View.context.fillText(maxLoopTimeStr, View.canvas.width - 70, 25);
    View.context.fillText(`ζ ${Camera.zoom}`, View.canvas.width - 70, View.canvas.height - 20);
    View.context.font = oldfont;
  }
}