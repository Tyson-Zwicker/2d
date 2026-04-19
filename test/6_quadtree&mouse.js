import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { View, Camera } from '../dist/view.js';
import { RectBounds } from '../dist/geometry.js';


let collisionBoxRadius = 10;
let numObjects = 12;
for (let i = 0; i < numObjects; i++) {
  let obj = new SimObject('obj' + i, 'always');
  new Part('op' + i, Polygon.regular(3 + i, collisionBoxRadius, Mien.Yellow)).addTo(obj, { x: 0, y: 0 }, 0);
  obj.finalize();
  Sim.add(obj, { x: 1000 - Math.random() * 2000, y: 1000 - Math.random() * 2000 }, 0);
}

Main.creatorsFunction = () => {
  //Draw a box around the mouse...
  let x = View.mouse.x;
  let y = View.mouse.y;
  let r = collisionBoxRadius; 
  let gfx = View.context;
  gfx.strokeStyle = '#fff';
  gfx.lineWidth = '1';
  gfx.beginPath();
  gfx.rect(x - r, y - r, r * 2, r * 2);
  gfx.stroke();
  gfx.closePath();

  let worldMouse = View.screenToWorld(x, y);
  let br = collisionBoxRadius/Camera.zoom;
  let wb = new RectBounds(worldMouse.x - br, worldMouse.y - br, worldMouse.x + br, worldMouse.y + br);
  //Check the quadtree for stuff inside the mouse box...
  let result = Sim.dynamicQuadtree.findInRange(wb);
  //Console log it if there is any...
  if (result.length>0){
    console.log ('-Collision Detected-');
    for (let rCount = 0;rCount<result.length;rCount++){
      console.log (result[rCount]);
    }
  }
}
Main.run(60);