
In this example, we create a Solar System.  When run, you will see that the planets are circling around the star at different rates.  This is unlike the behvious observed in the [[Rotation and Spin of Parts|previous example]], where the hexagons rotated in lock-step with the object they were attached to.


```javascript
import Main from '../engine/main.js';
import Sim from '../engine/sim.js';
import SimObject from '../engine/simobject.js';
import Part from '../engine/part.js';
import Polygon from '../engine/polygon.js';
import Mien from '../engine/mien.js';

let starSize = 150;
let planet1Size = 20;
let planet2Size = 10;
let planet3Size = 50;
let starSystem = new SimObject('Star-System', true);
let star = new Part('Star', Polygon.regular(21, starSize, Mien.Yellow));
star.addTo(starSystem, { x: 0, y: 0 });

let planet1Polygon = Polygon.regular(11, planet1Size, Mien.Blue);
let planet2Polygon = Polygon.regular(11, planet2Size, Mien.Red);
let planet3Polygon = Polygon.regular(11, planet3Size, Mien.Green);
planet1Polygon = Polygon.translate(planet1Polygon, { x: starSize + 150, y: 0 });
planet2Polygon = Polygon.translate(planet2Polygon, { x: starSize + 300, y: 0 });
planet3Polygon = Polygon.translate(planet3Polygon, { x: starSize + 600, y: 0 });
let planet1 = new Part('Planet-1', planet1Polygon);
let planet2 = new Part('Planet-2', planet2Polygon);
let planet3 = new Part('Planet-3', planet3Polygon);
planet1.spin = .05;
planet2.spin = .3;
planet3.spin = -.01;
planet1.addTo(star, { x: 0, y: 0 });
planet2.addTo(star, { x: 0, y: 0 });
planet3.addTo(star, { x: 0, y: 0 });

//Finalize and add to the Library...
starSystem.finalize();
Sim.add(starSystem, {x:0,y:0}, 0);

let fps = 60;
Main.run(fps);
```

This achieved by using translating (moving) the polygons offcenter, but attaching them to the star with an offset of (0,0).  So, when the part (in this case a planet) spins, its still spinning around its own axis, but the polygon being drawn for that part is offset from its center.

