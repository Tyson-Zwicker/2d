Fundamentally a SimObject is composite of "Parts" with a presence in the simulation world (position and orientation, velocity and spin).  They are automatically moved and drawn every frame.

Every Simobject has a single part referred to as its "body".  That body can contain as many additional parts as you like (each with its own offset from the center of the body and rotation).  Those parts can also contain parts.

An example would be a human: a Torso has upper-arms connected to it, they can rotate freely.  The upper-arms are connected to a lower arm.  This can also rotate freely about the attachment point.  Those are connected to wrists, then to fingers, which themselves are three connected parts.

Let's start with a simpler example:  A red triangle.

```javascript

import Main from '../engine/main.js';
import Sim from '../engine/sim.js';
import SimObject from '../engine/simobject.js';
import Part from '../engine/part.js';
import Polygon from '../engine/polygon.js';
import Mien from '../engine/mien.js';

//Define the Polygon
let red = Mien.Red;
let size = 100;
let redTrianglePolygon = Polygon.regular(3, size, red);

//Define the Part
let trianglePart = new Part('triangle', redTrianglePolygon);
let canMove = 'always';//'onscreen' and 'never' also possible

//Make the SimObject
let simTriangle = new SimObject('the-red-triangle', canMove);

//Attach the Part to the SimObject..
let offset = { x: 0, y: 0 };
trianglePart.addTo(simTriangle, offset);

//Finalize and add the the Library
simTriangle.finalize();
let orientation = 0; //Degrees  
let worldCoordinates = {x:0,y:0}; //Put it where the "camera" defaults to.
Sim.add(simTriangle, worldCoordinates, orientation);

let fps = 60;
Main.run(fps);
```

An explanation of the imported classes can be found in [[Core Classes]].

First, a polygon is created with three sides, using the default red mien.

Then a part is created, given a name and a polygon.  The name is useful when you are debugging, but it does not need to be unique. An empty string will work.

A SimObject is defined.  These DO need unique names.  We are going to make this move so we set the move parameter to true.  You can speed up your simulation by setting this to false for any objects that do not need to move- they can still interact with the environment, but they wil be anchored to the wolrd-coordinate they are assigned to.

Next we attach the Part to the SimObject by using the Part's addTo method.  The SimObject requires one part in order to be drawn on the screen.  The offset for a part being added to a SimObject should almost always be {x:0,y:0} but there are valid reasons for giving a different offset LINK HERE.

In this case there is only a single part and a single polygon, but in later examples there will be more parts, and buttons attached to those parts.  All of this must be discovered by the SimObject before it can be used.  This is the reason for the call to the finalize() method.

The last thing to do is run the simulation by calling main.run wth an fps rate.  If 0 is selected the main loop will run once and exit, which can useful when debugging.  Note: This is a *requested* frame-rate: if the main loop takes to long to run, you will not achieve the fps you asked for.

By default you can see the number of millseconds the browser is waiting before it draws the next frame in the lower-left corner next to the delta (triangle) symbol.  a frame rate of 60 should show about 0012 (1000 ms / 60).  The time your main loop takes to run is shown in the upper right corner (again in milliseconds).  The longest your main loop has taken to run is shown in the bottom right (it ignores the first second because its not indicitive of run time because the browser is busy.  The # of frames that have been drawn shows in the upper left.

When you run this, you should see a stationary red triangle.  You can use your mouse to pan and zoom the screen.



