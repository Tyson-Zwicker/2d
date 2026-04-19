import Main from './main.js';
import Vec from './vec.js';
import View from './view.js';
import RectBounds from './rectbounds.js';

export default class SimObject {
  #localPosition = { x: 0, y: 0 };    //READ ONLY
  get localPosition() {
    return this.#localPosition;
  }
  #localRotation = 0;                 //READ ONLY
  get localRotation() {
    return this.#localRotation;
  }
  worldPosition = undefined;          //assigned when added to Sim.
  worldRotation = undefined;          //assigned when added to Sim.
  velocity = { x: 0, y: 0 };          //Is changed by application of linear acceleration.
  spin = 0;                           //Is changed by application of angular acceleration.
  name = undefined;                   //assigned by constructor  
  body = undefined;                   //assigned by when object adds itself to this.
  allParts = [];                      //collected during "finalize" step..
  spinningParts = [];                 //collected during "finalize" step..
  radius = undefined;                //Calculated in "finalize" step. (The radius of the smallest circle that can enclose all parts).
  canMove = 'always';                 //Determines which QuadTree this object is added to.
  finalized = false;                  //Set to true, when "finalized". (Sim will not allow unfinalized objects to be added).
  depth = 0;                           //used to sort part rendering order.  (low #'s render first)
  button = undefined;
  collides = false;                   //If true, collision detection in Main will add an event when this object collisdes with something.
  steerable = false;                  //If true, rudder and speed are used to change the World Position/Rotation when update occurs.

  get position () {                   //Position getter is necessary for compatability with quadtrees
    return this.worldPosition;
  }
  //SimObjects can hav a different kinematic system based on "speed and rudder".
  //If "movementType" can be "rudder" or "vector". Default is vector.
  rudder = 0;
  speed = 0;

  static moveStates = ['always', 'never', 'onscreen'];
  constructor(name, canMove = 'always') {
    if (!name || (!SimObject.moveStates.includes(canMove))) throw new Error(`Bad parameters: name [${name}] canMove [${canMove}] must be 'never','oncscreen' or 'always.'`);
    this.name = name;
    this.canMove = canMove;
  }
  finalize() {                        //Once after all the parts have been added.    
    if (this.body === undefined) throw new Error(`SimObject [${this.name}] has no body.`);
    this.allParts = this.#getAllParts(this.body);
    this.allParts.sort((a, b) => a.depth - b.depth);
    for (let part of this.allParts) {
      if (part.button) this.buttons.push(part.button);
    }
    this.radius = this.#calcRadius();
    this.spinningParts = this.#getSpinningParts();
    this.finalized = true;
  }
  getPart(name) {
    for (let i = 0; i < this.allParts.length; i++) {
      if (this.allParts[i].name === name) return this.allParts[i];
    }
  }
  #getAllParts(part, found = []) {
    for (let innerPart of part.parts) {
      found.push(...this.#getAllParts(innerPart));
    }
    found.push(part);
    return found;
  }
  #getSpinningParts() {
    let spinningParts = [];
    for (let part of this.allParts) {
      if (part.parts.length === 0 && part.spin !== 0) {
        spinningParts.push(part);
      }
    }
    return spinningParts;
  }

  #calcRadius() {
    let maxDistance = 0;
    for (let part of this.allParts) {
      let distance = Math.sqrt(part.localPosition.x ** 2 + part.localPosition.y ** 2) + part.radius;
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
    return maxDistance;
  }
  static isMouseIn(simObject) {
    const mouseWorld = View.screenToWorld();
    const bounds = RectBounds.make(
      simObject.worldPosition.x - simObject.radius,
      simObject.worldPosition.y - simObject.radius,
      simObject.worldPosition.x + simObject.radius,
      simObject.worldPosition.y + simObject.radius
    );
    return RectBounds.isPointInside(mouseWorld.x, mouseWorld.y, bounds);
  }
  move() {
    if (this.canMove !== 'never') {
      if (this.steerable) {
        this.worldPosition.x += Math.cos(this.worldRotation * Vec.radians) * this.speed * Main.delta;
        this.worldPosition.y += Math.sin(this.worldRotation * Vec.radians) * this.speed * Main.delta;
        this.worldRotation += this.rudder * Main.delta;
      } else {
        this.worldPosition = Vec.add(this.worldPosition, Vec.scale(this.velocity, Main.delta));
        this.worldRotation = this.worldRotation + this.spin * Main.delta;
      }
      this.moveParts(this.body);
    }
  }
  moveParts(part) {
    part.ownRotation = (part.ownRotation + part.spin) % 360;
    part.calculateLocals();
    for (let innerPart of part.parts) {
      this.moveParts(innerPart);
    }
  }

  render() {
    if (this.allParts.length === 0) {
      throw new Error('No Parts found to render.  SimObject has no body, or it has not been finalized.');
    }
    for (let part of this.allParts) {
      try {
        let polygons = part.getWorldPolygons();
        for (let polygon of polygons) {
          if (!polygon.mien) {
            throw new Error(
              `Polygon has no Mien.  SimObject.render: Object Name: ${this.name}`);
          }

          let fillStyle = polygon.mien.normal.bgColor;
          let strokeStyle = polygon.mien.normal.borderColor;
          let lineWidth =polygon.mien.normal.borderWidth;
          if (part.button) {
            if (part.button.hovered) {
              fillStyle = polygon.mien.hovered.bgColor;
              strokeStyle = polygon.mien.hovered.borderColor;
              lineWidth =polygon.mien.normal.borderWidth;
            }
            else if (part.button.pressed) {
              fillStyle = polygon.mien.pressed.bgColor;
              strokeStyle = polygon.mien.pressed.borderColor;
              lineWidth =polygon.mien.normal.borderWidth;
            }
          }
          View.context.fillStyle = fillStyle;
          View.context.strokeStyle = strokeStyle;
          View.context.lineWidth = lineWidth;
          let path = new Path2D();
          let points = polygon.points;
          if (points.length === 0) continue;
          path.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            path.lineTo(points[i].x, points[i].y);
          }
          path.closePath();
          View.context.fill(path);
          View.context.stroke(path);
        }
       
      } catch (e) {
        throw new Error('Rendering Part [' + part.name + ']:' + e.message + ' : ' + e.stack);
      }
    }
  }
}