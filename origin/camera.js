import View from './view.js';
export default class Camera {
  static #x = 0;
  static #y = 0;

  static #maxZoom = 4;
  static #minZoom = 0.005;
  static #zoom = 1;
  static #zoomFactor = 2; //MUST BE >2
  static #anchor = undefined;
  static #bounds = undefined;
  static #panTimer = 0;
  static #panTimeSpan = 300;//milliseconds.
  static #panStart = { x: 0, y: 0, zoom: Camera.#maxZoom };
  static #panTarget = { x: 0, y: 0, zoom: Camera.#maxZoom };
  static #panStartTime = 0;
  static get zoom() {
    return Camera.#zoom;
  }
  static set zoom(newZoom) {
    if (newZoom > Camera.#maxZoom) newZoom = Camera.#maxZoom;
    if (newZoom < Camera.#minZoom) newZoom = Camera.#minZoom;
    Camera.#zoom = newZoom;
    Camera.setCameraBounds();
  }
  static get zoomFactor() {
    return this.#zoomFactor;
  }
  static get x() {
    return Camera.#x;
  }
  static get y() {
    return Camera.#y;
  }
  static set x(val) {
    Camera.#x = val;
    Camera.setCameraBounds();
  }
  static set y(val) {
    Camera.#y = val;
    Camera.setCameraBounds();
  }
  static setCameraBounds() {
    Camera.#bounds = {
      "x0": Camera.#x - (View.canvas.width / 2) / Camera.#zoom,
      "y0": Camera.#y - (View.canvas.height / 2) / Camera.#zoom,
      "x1": Camera.#x + (View.canvas.width / 2) / Camera.#zoom,
      "y1": Camera.#y + (View.canvas.height / 2) / Camera.#zoom
    };
  }
  static get cameraBounds() {
    if (Camera.#bounds === undefined) Camera.setCameraBounds();
    return Camera.#bounds;
  }
  static get canMove() {
    if (Camera.#panTimer > 0 || Camera.#anchor !== undefined) return false;
    return true;
  }
  static anchorTo(simObject) {    
    Camera.#anchor = simObject;
    Camera.panTo(simObject.worldPosition.x, simObject.worldPosition.y, Camera.#maxZoom);
  }
  static freeAnchor() {
    Camera.#anchor = undefined;
    Camera.#panTimer = 0;
  }
  static get isPanning() {
    return (Camera.#panTimer > 0);
  }
  static panTo(x, y, zoom) {
    const targetZoom = Math.min(Camera.#maxZoom, Math.max(Camera.#minZoom, zoom ?? Camera.#zoom));
    Camera.#panStart = { x: Camera.#x, y: Camera.#y, zoom: Camera.#zoom };
    Camera.#panTarget = { x, y, zoom: targetZoom };
    if (Camera.#panTimeSpan <= 0) {
      Camera.#x = x;
      Camera.#y = y;
      Camera.zoom = targetZoom;
      Camera.#panTimer = 0;
      Camera.#panStartTime = 0;
      return;
    }
    Camera.#panStartTime = Date.now();
    Camera.#panTimer = Camera.#panTimeSpan;
  }

  static move() {
    if (Camera.#panTimer <= 0) return;
    const elapsed = Date.now() - Camera.#panStartTime;
    const t = Math.min(1, elapsed / Camera.#panTimeSpan);
    const lerp = (a, b) => a + (b - a) * t;
    const nextZoom = lerp(Camera.#panStart.zoom, Camera.#panTarget.zoom, t);

    // Keep the target point moving toward the screen center even while zooming.
    const target = Camera.#panTarget;
    const s0x = (target.x - Camera.#panStart.x) * Camera.#panStart.zoom + View.screenCenter.x;
    const s0y = (target.y - Camera.#panStart.y) * Camera.#panStart.zoom + View.screenCenter.y;
    const sx = lerp(s0x, View.screenCenter.x, t);
    const sy = lerp(s0y, View.screenCenter.y, t);

    Camera.#x = target.x - (sx - View.screenCenter.x) / nextZoom;
    Camera.#y = target.y - (sy - View.screenCenter.y) / nextZoom;
    Camera.zoom = nextZoom;
    Camera.setCameraBounds();
    if (t >= 1) {
      Camera.#panTimer = 0;
      Camera.#panStartTime = 0;
    } else {
      Camera.#panTimer = Math.max(0, Camera.#panTimeSpan - elapsed);
    }
  }
  static moveToUpperLeftScreen (){
    let wcoord = View.screenToWorld (0,0);
    Camera.panTo (wcoord,Camera.zoom);
  }
}