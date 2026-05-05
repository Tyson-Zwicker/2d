// Camera and View are tightly coupled — keep in same file to avoid circular references.

import { Point, Vec, RectBounds } from './geometry.js';

// ============================================================================
// Types
// ============================================================================

/** Pan state with position and zoom level */
interface PanState {
  x: number;
  y: number;
  zoom: number;
}

/** Mouse state tracking */
interface MouseState {
  x: number;
  y: number;
  buttonDown: boolean;
}

// ============================================================================
// Camera
// ============================================================================

export class Camera {
  static #x: number = 0;
  static #y: number = 0;

  static #maxZoom: number = 8;
  static #minZoom: number = 0.005;
  static #zoom: number = 1;
  static #zoomFactor: number = 2; // MUST BE > 2
  static #anchor: Point | undefined = undefined; // SimObject will implement Point
  static #bounds: RectBounds | undefined = undefined;
  static #panTimer: number = 0;
  static #panTimeSpan: number = 300; // milliseconds
  static #panStart: PanState = { x: 0, y: 0, zoom: Camera.#maxZoom };
  static #panTarget: PanState = { x: 0, y: 0, zoom: Camera.#maxZoom };
  static #panStartTime: number = 0;

  static get zoom(): number {
    return Camera.#zoom;
  }

  static set zoom(newZoom: number) {
    if (newZoom > Camera.#maxZoom) newZoom = Camera.#maxZoom;
    if (newZoom < Camera.#minZoom) newZoom = Camera.#minZoom;
    Camera.#zoom = newZoom;
    Camera.setCameraBounds();
  }

  static get zoomFactor(): number {
    return this.#zoomFactor;
  }

  static get x(): number {
    return Camera.#x;
  }

  static get y(): number {
    return Camera.#y;
  }

  static set x(val: number) {
    Camera.#x = val;
    Camera.setCameraBounds();
  }

  static set y(val: number) {
    Camera.#y = val;
    Camera.setCameraBounds();
  }

  static setCameraBounds(): void {
    Camera.#bounds = new RectBounds(
      Camera.#x - (View.canvas.width / 2) / Camera.#zoom,
      Camera.#y - (View.canvas.height / 2) / Camera.#zoom,
      Camera.#x + (View.canvas.width / 2) / Camera.#zoom,
      Camera.#y + (View.canvas.height / 2) / Camera.#zoom,
    );
  }

  static get cameraBounds(): RectBounds {
    if (Camera.#bounds === undefined) Camera.setCameraBounds();
    return Camera.#bounds!;
  }

  static get canMove(): boolean {
    if (Camera.#panTimer > 0 || Camera.#anchor !== undefined) return false;
    return true;
  }

  static anchorTo(simObject: Point): void {
    Camera.#anchor = simObject;
    Camera.panTo(simObject.x, simObject.y, Camera.#maxZoom);
  }

  static freeAnchor(): void {
    Camera.#anchor = undefined;
    Camera.#panTimer = 0;
  }

  static get isPanning(): boolean {
    return Camera.#panTimer > 0;
  }

  static panTo(x: number, y: number, zoom?: number): void {
    const targetZoom = Math.min(
      Camera.#maxZoom,
      Math.max(Camera.#minZoom, zoom ?? Camera.#zoom)
    );
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

  static move(): void {
    if (Camera.#panTimer <= 0) return;
    const elapsed = Date.now() - Camera.#panStartTime;
    const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
    const t = Math.min(1, elapsed / Camera.#panTimeSpan);
    const nextZoom = lerp(Camera.#panStart.zoom, Camera.#panTarget.zoom, t);

    // Keep the target point moving toward the screen center even while zooming.
    const target = Camera.#panTarget;
    const s0x =
      (target.x - Camera.#panStart.x) * Camera.#panStart.zoom +
      View.screenCenter.x;
    const s0y =
      (target.y - Camera.#panStart.y) * Camera.#panStart.zoom +
      View.screenCenter.y;
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

  static moveToUpperLeftScreen(): void {
    const wcoord = View.screenToWorld(0, 0);
    Camera.panTo(wcoord.x, wcoord.y, Camera.zoom);
  }
}

// ============================================================================
// View
// ============================================================================

export class View {
  static canvas: HTMLCanvasElement;
  static context: CanvasRenderingContext2D;

  static bgPressed: boolean = false;
  static bgPressCoord: Point | undefined = undefined;
  static bgColor: string = '#555';
  static mouse: MouseState = { x: 0, y: 0, buttonDown: false };
  static screenCenter: Point = { x: 0, y: 0 };

  static initialize(): void {
    View.canvas = document.createElement('canvas');
    View.canvas.style.margin = '0';
    View.canvas.style.padding = '0';
    View.canvas.id = 'canvas';
    View.context = View.canvas.getContext('2d')!;
    View.mouse.buttonDown = false;
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(View.canvas);
    body.style.margin = '0';
    body.style.padding = '0';
    View.canvas.width = window.innerWidth;
    View.canvas.height = window.innerHeight;
    View.canvas.style.display = 'block';
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

  static screenToWorld(x: number, y: number): Point {
    const centered = Vec.sub({ x, y }, View.screenCenter);
    const scaled = Vec.scale(centered, 1 / Camera.zoom);
    return Vec.add(scaled, Camera);
  }

  static mouseToWorld(): Point {
    const centered = Vec.sub(View.mouse, View.screenCenter);
    const scaled = Vec.scale(centered, 1 / Camera.zoom);
    return Vec.add(scaled, Camera);
  }

  static worldToScreen(w: Point): Point {
    const centerByCamera = Vec.sub(w, Camera);
    const scaled = Vec.scale(centerByCamera, Camera.zoom);
    return Vec.add(scaled, View.screenCenter);
  }

  static canSee(point: Point, radius?: number): boolean {
    let { x0, y0, x1, y1 } = Camera.cameraBounds;
    if (radius !== undefined) {
      x0 -= radius;
      y0 -= radius;
      x1 += radius;
      y1 += radius;
    }
    return point.x >= x0 && point.y >= y0 && point.x <= x1 && point.y <= y1;
  }

  static clear(): void {
    View.context.fillStyle = View.bgColor;
    View.context.fillRect(0, 0, View.canvas.width, View.canvas.height);
  }

  static handleCameraDrag(mouseInteractedWithSomething: boolean): void {
    if (!mouseInteractedWithSomething) {
      if (Camera.canMove) {
        if (View.bgPressed && View.mouse.buttonDown) {
          // drag occurring
          let drag: Point;
          if (View.bgPressCoord !== undefined) {
            drag = { x: View.bgPressCoord.x, y: View.bgPressCoord.y };
          } else {
            drag = { x: View.mouse.x, y: View.mouse.y };
          }
          const inverseMouse = Vec.scale(View.mouse, -1);
          drag = Vec.add(drag, inverseMouse);
          drag = Vec.scale(drag, 1 / Camera.zoom);
          Vec.addInPlace(Camera, drag);
          Camera.setCameraBounds();
          View.bgPressCoord = { x: View.mouse.x, y: View.mouse.y };
        } else if (View.bgPressed && !View.mouse.buttonDown) {
          // drag ended
          View.bgPressed = false;
          View.bgPressCoord = undefined;
        } else if (!View.bgPressed && View.mouse.buttonDown) {
          // initiated drag on background
          View.bgPressed = true;
          View.bgPressCoord = { x: View.mouse.x, y: View.mouse.y };
        }
      }
    } else {
      if (View.bgPressed) {
        View.bgPressed = false;
        View.bgPressCoord = undefined;
      }
    }
  }

  static cancelDrag(): void {
    View.bgPressed = false;
    View.bgPressCoord = undefined;
    View.mouse.buttonDown = false;
  }

  static handleContextMenu = function (event: MouseEvent): boolean {
    event.preventDefault();
    return false;
  };

  static handleMouseMove = function (event: MouseEvent): void {
    View.mouse.x = event.clientX;
    View.mouse.y = event.clientY;
  };

  static handleMouseDown = function (event: MouseEvent): boolean | void {
    if (event.button === 0) {
      View.mouse.buttonDown = true;
    } else if (event.button === 2) {
      event.preventDefault();
      return false;
    }
  };

  static handleMouseUp = function (_event: MouseEvent): void {
    View.mouse.buttonDown = false;
  };

  static handleWheel = function (event: WheelEvent): void {
    if (Camera.canMove) {
      const sgn = Math.sign(event.deltaY);
      const zoomChange = (Camera.zoom * -sgn) / Camera.zoomFactor;
      const oldZoom = Camera.zoom;
      Camera.zoom = Camera.zoom + zoomChange;
      const xdiff =
        View.canvas.width / oldZoom - View.canvas.width / Camera.zoom;
      const ydiff =
        View.canvas.height / oldZoom - View.canvas.height / Camera.zoom;
      const xratio =
        (View.mouse.x - View.canvas.width / 2) / View.canvas.width;
      const yratio =
        (View.mouse.y - View.canvas.height / 2) / View.canvas.height;
      const xchange = xdiff * xratio;
      const ychange = ydiff * yratio;
      Camera.x = Camera.x + xchange;
      Camera.y = Camera.y + ychange;
    }
  };

  static resizeCanvas(): void {
    View.canvas.width = window.innerWidth;
    View.canvas.height = window.innerHeight;
    View.screenCenter = { x: View.canvas.width / 2, y: View.canvas.height / 2 };
    Camera.setCameraBounds();
  }
}
