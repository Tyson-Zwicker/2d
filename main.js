import View from './view.js';
import Game from './game.js';
import Transform from './transform.js';
export default class Main {
  static delta = 0;
  static time = 0;
  static oldTime = 0;
  static creatorsFunction = undefined;  //A callback for the user to use once per loop.
  static tickMsg = [];
  static debugIndent =0;
  static maxFrames =0;
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
  static runFrames (numFrames){
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
    Main.currentFrame ++;
    if (Main.currentFrame> Main.maxFrames) Main.continue = false;
    if (Main.continue) setTimeout(Main.loop, Main.fpsMillis);
  }
  static doWork() {
    let t = Date.now();
    View.clear();
    Main.draw();
    Main.move();
    Main.checkMouse();
    Main.showDelta();
    if (Main.creatorsFunction) Main.creatorsFunction ();
    Main.loopTime = Date.now() - t;
  }
  static showDelta() {
    let y=5;
    View.context.textBaseline = 'top';
    View.context.fillStyle = '#FFFFFF';
    View.context.strokeStyle = '#FFFFFF';
    let oldfont = View.context.font;
    View.context.font = "bold 16px Arial"
    View.context.fillText(String(Main.currentFrame).padStart(6, '0')+' Δ' + String(Math.trunc(Main.delta * 1000)).padStart(4, '0') + ' : Σ' + String(Main.loopTime).padStart(4, '0'), 5, y);
    
    for (let msg of Main.tickMsg){
      this.debugIndent += msg.indent;
      y+=20;
      let indStr = '|';
      for (let i=0;i<this.debugIndent;i++) indStr +='   ';
      View.context.fillText(indStr + msg.text, 15, y);  //↳
    }
    Main.tickMsg.length=0;
    View.context.font = oldfont;
  }
  static draw() {
    for (let gameObject of Game.gameObjects.values()) {   
      Transform.bodyPartsToLocal (gameObject.body);   
      let worldFaces = Transform.localToWorld(gameObject.body);
      for (let face of worldFaces) {
        let points = [];
        for (let p of face.points) points.push(Transform.worldToScreen(p));
        View.context.fillStyle = face.color;
        let path = new Path2D();
        path.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          path.lineTo(points[i].x, points[i].y);
        }
        path.closePath();
        View.context.fill(path);
        //TODO: Dot in center..
      }
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