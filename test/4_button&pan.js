import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { Button } from '../dist/button.js';
import { Camera } from '../dist/view.js';
import { Rnd } from '../dist/rnd.js';

let mapSize = { x: 1000, y: 1000 };
for (let i = 0; i < 40; i++) {
  let obj = new SimObject(`${i}`, 'never');
  new Part(`${i}`, Polygon.regular(5, 50, Mien.Yellow)).addTo(obj, { x: 0, y: 0 }, 0);
  
  new Button(`${i}`, false, obj, (data) => {
    let pos = Sim.get(data.owner.name).worldPosition;
    Camera.panTo(pos.x, pos.y, 1);
  });
  obj.finalize();
  Sim.add(obj, { x: Math.random() * mapSize.x - mapSize.x / 2, y: Math.random() * mapSize.y - mapSize.y / 2 });
}
Main.run(60);