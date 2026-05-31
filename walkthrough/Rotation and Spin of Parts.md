
From [[Creating Complex SimObjects|the last example]]

Right after the blueSquare was given its spin, add the following code:

```javascript

let hexSize = 10;
let hex1 = new Part('hex1', Polygon.regular(6, hexSize, Mien.Green))
hex1.addTo(blueSquare, { x: squareSize, y: 0 }, 0);

let hex2 = new Part('hex2', Polygon.regular(6, hexSize, Mien.Magenta));
hex2.addTo(blueSquare, { x: - (squareSize + hexSize), y: 0 }, 0);

//Finalize and add to the Library...
```

Now when it runs, two hexagons are attached to the spinning blue square.

Notice that both are spinning with their parent object, around *it's* axis of rotation, not their own.  Also take notice that both where given different offsets.  The green triangle was offset the the size of the square, so its center is on the edge of the square, while the magenta hexagon appears to be attached by its tip to the square, because it's offset included its own radius as well.

If you are creating a complex object and the parts are overlapping "wrong" (like the green hex) its worth checking for that your offset accounted for the distance from the parent's center *and* the distance from child part's center to its own edge- like the magenta hex.

Now we'll add the following code to set the hexagons spinning too:

```javascript
//Existing code...
hex1.spin =-10;
hex2.spin =10;
//Finalize and add to the Library...
```

Their own spin causes them to rotate around their own axes, while still attached to the rotation of the blue square.  Next we'll see how to make things appear to [[Parts orbitting Part|"orbit" their parent part.]]

