Carrying on from [[Creating a SimObject and running the Simulation.|the last example ]]

This is a shortened version of the code from the last example, right up to the part where the SimObject was finalized. It does exactly the same thing, but names have been changed and its much shorter.
```javascript
import Main from '../engine/main.js';
import Sim from '../engine/sim.js';
import SimObject from '../engine/simobject.js';
import Part from '../engine/part.js';
import Polygon from '../engine/polygon.js';
import Mien from '../engine/mien.js';

let complexObj = new SimObject('complex-thing', 'always');
let size = 100;
let redTriangle = new Part('triangle', Polygon.regular(3, size, Mien.Red));
redTriangle.addTo(complexObj, {x:0,y:0});
```

This is the new part is. It defined 4 points (to make a square), and uses those points to define the polygon. a call to `regular (4,squareSize)` would have done the same thing, but its good to know how to make more complex polygons, because you'll probably want some eventually.  When you defined a polygon with points, the order matters: it will connect them with lines from the 1st to the last, and then close the polygon by connecting the last point to the first one.

```javascript
let squareSize = 15;
let pointsForSquare = [
  { x: -squareSize, y: -squareSize },
  { x: squareSize, y: -squareSize },
  { x: squareSize, y: squareSize },
  { x: -squareSize, y: squareSize }];
let bluePolygon = new Polygon(pointsForSquare, Mien.Blue);
let blueSquare = new Part ('square',bluePolygon, true);
let offset = {x:size, y:0}; //Offset it by triangle radius, so it will be on the tip.
blueSquare.addTo (redTriangle, offset, 45); //and rotated by 45 degrees.
blueSquare.spin = 5; //Degrees
```

The square is not attached directly to the SimObject, its attached to the SimObject's body: The red triangle.  It has been offset to the right by the "radius" of the triangle so it appears on the tip (an offse of (0,0) would have attached in to the center of the triangle instead).  It has been rotated by 45 degrees and been given "spin".

Then the finalization part occurs, and is the same as the last example, but note its called "complexObj" now:

```javascript
//Finalize and add the the Library...
complexObj.finalize();
let orientation = 0; //Degrees  
let worldCoordinates = { x: 0, y: 0 }; //Put it where the "camera" defaults to.
Sim.add(complexObj, worldCoordinates, orientation);

let fps = 60;
Main.run(fps);
```

Running this should draw the triangle from before, but now with a spinning blue square. 
Change the offset, rotation and spin to see how it affects things, or add more points to the polygon.

Example:

```javascript
let offset = {x:20, y:50}; 
blueSquare.addTo (redTriangle, offset, 25);
blueSquare.spin = 0;
```

Or keep adding more parts to the last part.