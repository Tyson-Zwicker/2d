import Main from '../../main.js';
import Game from '../../game.js';
import GameObject from '../../gameobject.js';
import Part from '../../part.js';
import Appearance from '../../appearance.js';
import Rnd from '../../rnd.js';
let blockPoints = [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }];
let redBlock = new Part('red-block', [{ appearance: Appearance.Red, points: blockPoints }], 1);
let greenBlock = new Part('green-block', [{ appearance: Appearance.Green, points: blockPoints }], 1);
let blueBlock = new Part('blue-block', [{ appearance: Appearance.Blue, points: blockPoints }], 1);

for (let i = 0; i < 1000; i++) {
  let gameObject = new GameObject('blocks');
  gameObject.velocity = { x: Rnd.int(-10, 10), y: Rnd.int(-10, 10) };
  redBlock.clone().addTo(gameObject, { x: 0, y: 0 }, 0);
  blueBlock.clone().addTo(redBlock, { x: 20, y: 0 }, 45);
  greenBlock.clone().addTo(redBlock, { x: -20, y: 0 }, 0);
  gameObject.finalize();
  
  Game.add(gameObject, { x: Rnd.int(-10000, 10000), y: Rnd.int(-10000, 10000) }, 0);
  
}

Main.run();

