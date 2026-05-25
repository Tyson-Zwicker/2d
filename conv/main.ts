import { Camera, View } from './view.js';
import { Effects } from './effects.js';
import { Events } from './events.js';
import { Sim } from './sim.js';
import { GUI } from './gui.js';
import { SimObject } from './simobject.js';

export class Main {
  static delta: number = 0;
  static time: number = 0;
  static oldTime: number = 0;
  static creatorsFunction: (() => void) | undefined = undefined;
  static currentFrame: number = 0;
  static maxLoopTime: number = 0;
  static continue: boolean = false;
  static pauseSim: boolean = false;
  static fpsMillis: number = 0;
  static loopTime: number = 0;
  
  static {
    View.initialize();
    GUI.initialize();
    GUI.configurePauseHandlers(
      () => Main.pauseSim,
      (paused: boolean) => Main.setPaused(paused)
    );
    console.log('Main initialized...');
  }

  static run(fps: number = 0): void {
    const startTime = Date.now();
    Main.loopTime = 0;
    Main.pauseSim = false;
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

  static loop(startTime?: number): void {
    if (startTime) Main.oldTime = startTime;
    Main.time = Date.now();
    Main.delta = (Main.time - Main.oldTime) / 1000;
    Main.oldTime = Main.time;
    Main.doWork();
    Main.currentFrame++;
    if (Main.continue) {
      setTimeout(Main.loop, Main.fpsMillis);
    } else {
      console.log('stopping..');
    }
  }

  static doWork(): void {
    const t = Date.now();
    try {
      Events.reset();
      View.clear();
      if (!Main.pauseSim) {
        Sim.rebuildQuadTrees();
        const dynamicOnScreen = Sim.dynamicQuadtree.findInRange(Camera.cameraBounds);
        const staticOnScreen = Sim.staticQuadtree.findInRange(Camera.cameraBounds);
        Main.moveCameraAndSimObjects(dynamicOnScreen, staticOnScreen);
        Main.renderSimAndEffects(dynamicOnScreen, staticOnScreen);
        if (Main.creatorsFunction) Main.creatorsFunction();
      }
      GUI.render();
      Main.checkMouse();
      Main.showDelta();
      Main.loopTime = Date.now() - t;
      if (Main.loopTime > Main.maxLoopTime && Main.currentFrame > 10) {
        Main.maxLoopTime = Main.loopTime;
      }
    } catch (error) {
      Main.continue = false;
      throw error;
    }
  }
  static moveCameraAndSimObjects(dynamicOnScreen: SimObject[], staticOnScreen: SimObject[]) {
    if (Camera.isPanning) Camera.move();
    for (const candidate of dynamicOnScreen) {
      if (candidate.canMove === 'onscreen') {
        candidate.move(Main.delta);
      }
    }
    for (const simObject of Sim.dynamicObjects.values()) {
      if (simObject.canMove === 'always') {
        simObject.move(Main.delta);
      }
    }
  }
  static renderSimAndEffects(dynamicOnScreen: SimObject[], staticOnScreen: SimObject[]) {
    //Render sim and effects.
    Effects.renderBackground();
    for (const candidate of staticOnScreen) {
      candidate.render();
    }
    for (const candidate of dynamicOnScreen) {
      candidate.render();
    }
    Effects.renderForeground();
  }
  static checkMouse(): void {
    let interactionOccured = false;
    const modalActive = GUI.hasModal();

    for (const panel of GUI.getInteractivePanels()) {
      for (const element of panel.elements) {
        if (element.button) {
          if (element.button.checkForMouse()) interactionOccured = true;
        }
      }
    }

    if (!modalActive) {
      for (const object of Sim.simObjects.values()) {
        if (object.button && object.button.checkForMouse()) {
          interactionOccured = true;
        }
      }
    }

    View.handleCameraDrag(modalActive || interactionOccured);
  }

  static showDelta(): void {
    View.context.textBaseline = 'top';
    View.context.fillStyle = '#FFFFFF';
    View.context.strokeStyle = '#FFFFFF';
    const oldfont = View.context.font;
    View.context.font = 'bold 14px Arial';
    const frameStr = 'Φ ' + String(Main.currentFrame).padStart(4, '0');
    const deltaStr = 'Δ ' + String(Math.trunc(Main.delta * 1000)).padStart(4, '0');
    const loopTimeStr = 'Σ ' + String(Main.loopTime).padStart(4, '0');
    const maxLoopTimeStr = 'Ω ' + String(Main.maxLoopTime).padStart(4, '0');
    View.context.fillText(frameStr, 20, 8);
    View.context.fillText(deltaStr, 20, View.canvas.height - 20);
    View.context.fillText(loopTimeStr, View.canvas.width - 70, 8);
    View.context.fillText(maxLoopTimeStr, View.canvas.width - 70, 25);
    View.context.fillText(`ζ ${Camera.zoom}`, View.canvas.width - 70, View.canvas.height - 20);
    View.context.font = oldfont;
  }

  static setPaused(paused: boolean): boolean {
    Main.pauseSim = paused;
    return Main.pauseSim;
  }
}
