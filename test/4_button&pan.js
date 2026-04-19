
import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { Button } from '../dist/button.js';
import { Camera } from '../dist/view.js';

let greenHex = new SimObject('green', 'never');
new Part('green-part',Polygon.regular (6,20,Mien.Green)).addTo(greenHex, { x: 0, y: 0 }, 0);
greenHex.finalize();
Sim.add(greenHex, { x:-800, y: -800 }, 0);

let blueHex = new SimObject('blue', 'never');
new Part('blue-part',Polygon.regular (6,20,Mien.Blue)).addTo(blueHex, { x: 0, y: 0 }, 0);
blueHex.finalize();
Sim.add(blueHex, { x:800, y: 800 }, 0);

new Button ('blue','false',blueHex,(data)=>  {
  console.log ('click',data.owner)
  Camera.panTo (blueHex.worldPosition.x, blueHex.worldPosition.y,1);
});
new Button ('green','false',greenHex, (data)=>{
  console.log ('click',data.owner)
  Camera.panTo (greenHex.worldPosition.x, greenHex.worldPosition.y,1);
});
//YOU do not add buttons to things, they get their owner when constructed...
//returns data = { origin: 'unknown', owner: undefined, type: 'click', value: this.value };

//Two objects.. clicking on them causes camera to "Pan" and lock on them..

Main.run(60);