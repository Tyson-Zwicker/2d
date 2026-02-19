import Vec from './vec.js';

export default class View {
  static bgPressed = false;
  static bgPressCoord = null;
  static bgColor = "#555";
  static bounds = undefined;
  static camera = { x: 0, y: 0, zoom: 1 };//World Coordinates.. update this to keep view on a particular thing/place otherwise mouse moves it around.
  static minimumZoom = 0.01;
  static mouse = { x: 0, y: 0, buttonDown: false };
  static screenCenter = undefined;
  static zoomFactor = 10; //How much each zoom changes when the wheel is scrolled.

  static initialize(){
    View.canvas = document.createElement('canvas');
    View.canvas.style.margin = 0;
    View.canvas.style.padding = 0;
    View.canvas.id = 'canvas';
    View.context = View.canvas.getContext('2d');
    View.mouse.buttonDown = false;
    let body = document.getElementsByTagName('body')[0];
    body.appendChild(View.canvas);
    body.style.margin = 0;
    body.style.padding = 0;
    View.canvas.width = window.innerWidth;
    View.canvas.height = window.innerHeight;
    View.canvas.style = 'display:block;';
    View.screenCenter = { x: View.canvas.width / 2, y: View.canvas.height / 2 };
    View.canvas.addEventListener('wheel', View.handleWheel, { passive: false });
    View.canvas.onmousemove = View.handleMouseMove;
    View.canvas.onmousedown = View.handleMouseDown;
    View.canvas.onmouseup = View.handleMouseUp;
    View.canvas.oncontextmenu = View.handleContextMenu;
    window.addEventListener('resize', View.resizeCanvas);
    View.#calcBounds();
    console.log ('View Initialized.');
  }
  static canSee(point, radius) {
    let { x0, y0, x1, y1 } = View.bounds;
    if (radius && typeof radius === 'number') {
      x0 -= radius;
      y0 -= radius;
      x1 += radius;
      y1 += radius;
    }
    return (
      point.x >= x0 &&
      point.y >= y0 &&
      point.x <= x1 &&
      point.y <= y1
    );
  }
  static #calcBounds() {
    View.bounds = {
      "x0": View.camera.x - View.screenCenter.x / View.camera.zoom,
      "y0": View.camera.y - View.screenCenter.y / View.camera.zoom,
      "x1": View.camera.x + View.screenCenter.x / View.camera.zoom,
      "y1": View.camera.y + View.screenCenter.y / View.camera.zoom
    }
  }
  static clear() {
    View.context.fillStyle = View.bgColor;
    View.context.fillRect(0, 0, View.canvas.width, View.canvas.height);
  }
  static handleCameraDrag(mouseInteractedWithSomething) {
    
    if (!mouseInteractedWithSomething) {
      if (View.bgPressed && View.mouse.buttonDown) {        //drag occuring..         
        let drag;
        if (View.bgPressCoord !== undefined) {
          drag = { x: View.bgPressCoord.x, y: View.bgPressCoord.y };
        } else {
          drag = { x: View.mouse.x, y: View.mouse.y };
        }
        let inverseMouse = Vec.scale(View.mouse, -1);
        drag = Vec.add(drag, inverseMouse);
        drag = Vec.scale(drag, 1 / View.camera.zoom);
        Vec.addInPlace(View.camera, drag); //If you don't add in place it will give back a new Vec and it won't have zoom anymore!
        View.#calcBounds();
        View.bgPressCoord = { x: View.mouse.x, y: View.mouse.y };
      }
      else if (View.bgPressed && !View.mouse.buttonDown) {
        //drag ended.
        View.bgPressed = false;
        View.bgPressCoord = undefined;
      }
      else if (!View.bgPressed && View.mouse.buttonDown) {
        //initiated drag on background..        
        View.bgPressed = true;
        View.bgPressCoord = { x: View.mouse.x, y: View.mouse.y };
      }
    }
    else {
      if (View.bgPressed) {
        View.bgPressed = false;
        View.bgPressCoord = undefined;
      }
    }
  }
  static handleContextMenu = function (event) {
    event.preventDefault();
    return false;
  }
  static handleMouseMove = function (event) {
    View.mouse.x = event.clientX;
    View.mouse.y = event.clientY;
  };
  static handleMouseDown = function (event) {
    if (event.button === 0) {
      View.mouse.buttonDown = true;
    } else if (event.button === 2) {
      event.preventDefault();
      return false;
    }
  };
  static handleMouseUp = function (event) {
    View.mouse.buttonDown = false;
  };
  static handleWheel = function (event) {
    let zoomChange = View.camera.zoom * -Math.sign(event.deltaY) / View.zoomFactor;
    let oldZoom = View.camera.zoom;
    View.camera.zoom = View.camera.zoom + zoomChange;
    let xdiff = View.canvas.width / oldZoom - View.canvas.width / View.camera.zoom;
    let ydiff = View.canvas.height / oldZoom - View.canvas.height / View.camera.zoom;
    let xratio = (View.mouse.x - (View.canvas.width / 2)) / View.canvas.width;
    let yratio = (View.mouse.y - (View.canvas.height / 2)) / View.canvas.height;
    let xchange = xdiff * xratio;
    let ychange = ydiff * yratio;
    View.camera.x += xchange;
    View.camera.y += ychange;
    View.camera.zoom = Math.max(View.minimumZoom, View.camera.zoom);
    View.#calcBounds();
  }
  static resizeCanvas() {
    View.canvas.width = window.innerWidth;
    View.canvas.height = window.innerHeight;
    View.screenCenter = { x: View.canvas.width / 2, y: View.canvas.height / 2 };
    View.#calcBounds();
  }
}