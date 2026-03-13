import View from './view.js';
export default class Camera {
  static #x = 0;
  static #y = 0;
  
  static #maxZoom = 0.25;
  static #minZoom = 0.005;
  static #zoom = Camera.#maxZoom;
  static #zoomFactor = 3;
  static #anchor = undefined;
  static #bounds = undefined;
  static #panSpeed = 500; //milliseconds to perform pan..
  static #panTime = 0; //millseconds left to do the pan..
  static #lastPanTime =0; //timestamp since last move..
  static #panDestinationX = 0; //Destination x coordinate for pan completion..
  static #panDestinationY = 0; //Destination y coordinate for pan complettion..
  static #panDelX = 0;
  static #panDelY = 0;
  static #panDelZoom = 0;
  static #panDestinationZoom = 0; //Destination zoom level for pan completion..

  static get zoom() {
    return Camera.#zoom;
  }
  static set zoom(newZoom) {
    if (newZoom > Camera.#maxZoom) newZoom = Camera.#maxZoom;
    if (newZoom < Camera.#minZoom) newZoom = Camera.#minZoom;
    Camera.#zoom = newZoom;
    Camera.setCameraBounds();
  }
  static get zoomFactor (){
    return this.#zoomFactor;
  }
  static get x() {
    return Camera.#x;
  }
  static get y() {
    return Camera.#y;
  }
  static set x (val){
    Camera.#x = val;
    Camera.setCameraBounds();
  }
  static set y (val){
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
    if (Camera.#bounds === undefined) setCameraBounds();
    return Camera.#bounds;
  }
  static get canMove(){
    if (Camera.#panTime > 0 || Camera.#anchor!==undefined) return false;
    return true;
  } 
  static anchorTo(simObject) {
    if (Camera.#panTime > 0) Camera.cancelPan();
    Camera.#anchor = simObject;    
  }
  static freeAnchor() {
    Camera.#anchor = undefined;
  }
  static panTo(x, y, zoom) {
    Camera.#panTime = Camera.#panSpeed;
    Camera.#panDestinationX = x;
    Camera.#panDestinationY = y;
    Camera.#panDelX = (x - Camera.#x) / Camera.#panSpeed;
    Camera.#panDelY = (y - Camera.#y) / Camera.#panSpeed;
    Camera.#panDelZoom = (zoom - Camera.#zoom) / Camera.#panSpeed;
    Camera.#panDestinationZoom = zoom;
  }
  static cancelPan() {
    Camera.#panTime = 0;
  }
  static move() {
    if (Camera.#panTime > 0) {
      let now = Date.now();
      let del = now - Camera.#lastPanTime;
      Camera.#x += Camera.#panDelX * del;
      Camera.#y += Camera.#panDelY * del;
      Camera.#zoom += Camera.#panDelZoom * del;
      Camera.#panTime -= del;
      Camera.#lastPanTime = now;
      if (Camera.#panTime < 1) {
        Camera.#panTime = 0;
        Camera.#x = Camera.#panDestinationX;
        Camera.#y = Camera.#panDestinationY;
        Camera.#zoom = Camera.#panDestinationZoom;
      }
      Camera.setCameraBounds();
    } else if (Camera.#anchor !== undefined) {
      this.#x = Camera.#anchor.worldPosition.x;
      this.#y = Camera.#anchor.worldPosition.y;
      Camera.setCameraBounds();
    }
  }
}