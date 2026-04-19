import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';

let count = 0;
for (let x = -300; x <= 300; x += 300) {
  let complexObject = new SimObject('complex-thing' + (count++), 'always');

  let arrowPoints = [{ x: -50, y: -15 }, { x: 5, y: -15 }, { x: 5, y: -50 }, { x: 50, y: 0 }, { x: 5, y: 50 }, { x: 5, y: 15 }, { x: -50, y: 15 }];
  let greenArrowPoly = new Polygon(arrowPoints, Mien.Green);

  let greenArrowPart = new Part('green-arrow-part', greenArrowPoly,);
  greenArrowPart.addTo(complexObject, { x: 0, y: 0 });

  let blueArrowPoly = Polygon.translate(Polygon.scale(greenArrowPoly, 0.5), { x: 25, y: 0 });
  blueArrowPoly.mien = Mien.Blue;
  let blueArrowPart = new Part('blue-arrow-part', blueArrowPoly);
  blueArrowPart.addTo(greenArrowPart, { x: 50, y: 0 }, 0);


  let redArrowPoly = Polygon.translate(Polygon.scale(greenArrowPoly, 0.25), { x: 12.5, y: 0 });
  redArrowPoly.mien = Mien.Red;
  let redArrowPart = new Part('red-arrow-part', redArrowPoly);
  redArrowPart.addTo(blueArrowPart, { x: 50, y: 0 });

  let yellowArrowPoly = Polygon.translate(Polygon.scale(greenArrowPoly, 0.25), { x: 12.5, y: 0 });
  yellowArrowPoly.mien = Mien.Yellow;
  let yellowArrowPart = new Part('yellow-arrow-part', yellowArrowPoly);
  yellowArrowPart.addTo(redArrowPart, { x: 25, y: 0 }, 0);

  greenArrowPart.spin = .1;
  blueArrowPart.spin = -.3;
  redArrowPart.spin = .5;
  yellowArrowPart.spin = -1;



  let magentaArrowPoly = Polygon.translate(Polygon.scale(greenArrowPoly, 0.33), { x: 33, y: 0 });
  magentaArrowPoly.mien = Mien.Magenta;
  let magentaHexPart = new Part('magenta-hex-part', magentaArrowPoly);
  magentaHexPart.addTo(greenArrowPart, { x: 5, y: -33 }, -90);

  let anchorPoly = Polygon.regular(3, 1, Mien.Transparent);
  let anchorPart = new Part('anchor-part', anchorPoly);
  anchorPart.addTo(greenArrowPart, { x: -50, y: 0 }, 0);

  let orbiterPoly = Polygon.regular(5, 15, Mien.Cyan);
  let orbiterPart = new Part('orbiter-part', orbiterPoly);
  orbiterPart.addTo(anchorPart, { x: -100, y: 0 }, 0);

  greenArrowPart.spin = .1 + Math.random() * .1;
  blueArrowPart.spin = -.3 + Math.random() * .3;
  redArrowPart.spin = .5 + Math.random() * .5;
  yellowArrowPart.spin = -1 + Math.random() * -1;
  anchorPart.spin = -.5 + Math.random() * -.5;
  orbiterPart.spin = 2 + Math.random() * 2;

  complexObject.finalize();
  Sim.add(complexObject, { x: x, y: 0 }, x);
}

Main.run(60);