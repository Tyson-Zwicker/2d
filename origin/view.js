import Vec from './vec.js';
import Camera from './camera.js';

export default class View {
  static bgPressed = false;
  static bgPressCoord = undefined;
  static bgColor = "#555";
  static mouse = { x: 0, y: 0, buttonDown: false }; //Screen coordinates
  static screenCenter = undefined;  //Screen coordinates: offset from top left of the canvas.


  static initialize() {
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
    View.canvas.addEventListener('mouseleave', View.cancelDrag);
    View.canvas.addEventListener('mouseenter', View.cancelDrag);

    window.addEventListener('resize', View.resizeCanvas);
    Camera.setCameraBounds();
    console.log('View Initialized..');
  }
  static screenToWorld(x, y) {
    if (typeof x === 'number' && typeof y === 'number') {
      const centered = Vec.sub({ x, y }, View.screenCenter);
      const scaled = Vec.scale(centered, 1 / Camera.zoom);
      return Vec.add(scaled, Camera);
    }
    const centered = Vec.sub(View.mouse, View.screenCenter);
    const scaled = Vec.scale(centered, 1 / Camera.zoom);
    return Vec.add(scaled, Camera);
  }
  static worldToScreen(w) {
    let centerByCamera = Vec.sub(w, Camera);
    let scaled = Vec.scale(centerByCamera, Camera.zoom)
    return Vec.add(scaled, View.screenCenter);
  }
  static canSee(point, radius) {
    let { x0, y0, x1, y1 } = Camera.cameraBounds;
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

  static clear() {
    View.context.fillStyle = View.bgColor;
    View.context.fillRect(0, 0, View.canvas.width, View.canvas.height);
  }
  static handleCameraDrag(mouseInteractedWithSomething) {
    if (!mouseInteractedWithSomething) {
      if (Camera.canMove) {
        if (View.bgPressed && View.mouse.buttonDown) {        //drag occuring..         
          let drag;
          if (View.bgPressCoord !== undefined) {
            drag = { x: View.bgPressCoord.x, y: View.bgPressCoord.y };
          } else {
            drag = { x: View.mouse.x, y: View.mouse.y };
          }
          let inverseMouse = Vec.scale(View.mouse, -1);
          drag = Vec.add(drag, inverseMouse);
          drag = Vec.scale(drag, 1 / Camera.zoom);
          Vec.addInPlace(Camera, drag); //If you don't add in place it will give back a new Vec and it won't have zoom anymore!
          Camera.setCameraBounds();
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
    }
    else {
      if (View.bgPressed) {
        View.bgPressed = false;
        View.bgPressCoord = undefined;
      }
    }
  }
  static cancelDrag() {
    View.bgPressed = false;
    View.bgPressCoord = undefined;
    View.mouse.buttonDown = false;
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
    if (Camera.canMove) {
      let sgn = Math.sign(event.deltaY);
      let zoomChange = Camera.zoom * -sgn / Camera.zoomFactor;
      let oldZoom = Camera.zoom;
      Camera.zoom = Camera.zoom + zoomChange;
      let xdiff = View.canvas.width / oldZoom - View.canvas.width / Camera.zoom;
      let ydiff = View.canvas.height / oldZoom - View.canvas.height / Camera.zoom;
      let xratio = (View.mouse.x - (View.canvas.width / 2)) / View.canvas.width;
      let yratio = (View.mouse.y - (View.canvas.height / 2)) / View.canvas.height;
      let xchange = xdiff * xratio;
      let ychange = ydiff * yratio;
      Camera.x = Camera.x + xchange;
      Camera.y = Camera.y + ychange;
    }
  }
  static resizeCanvas() {
    View.canvas.width = window.innerWidth;
    View.canvas.height = window.innerHeight;
    View.screenCenter = { x: View.canvas.width / 2, y: View.canvas.height / 2 };
    Camera.setCameraBounds();
  }
}