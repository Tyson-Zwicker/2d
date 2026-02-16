import Main from '../../main.js';
import Game from '../../game.js';
import GameObject from '../../gameobject.js';
import Part from '../../part.js';
import Keyboard from '../../keyboard.js';
import Vec from '../../vec.js';

let blockPoints = [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }];
let redBlock = new Part('red-block', [{ color: "#f00", points: blockPoints }], 1);
let greenBlock = new Part('green-block', [{ color: '#0f0', points: blockPoints }], 1);
let blueBlock = new Part('blue-block', [{ color: '#00f', points: blockPoints }], 1);
let gameObject = new GameObject('blocks');
redBlock.addTo(gameObject, { x: 0, y: 0 }, 0);

for (let i = 0; i < 10; i++) {
  let g = greenBlock.clone();
  g.name = 'green-block' + i;
  let b = blueBlock.clone();
  b.name = 'blue-block' + i;
  let sign = (i % 2 == 0) ? -1 : 1;
  g.addTo(redBlock, { x: sign * 20 * i, y: 0 }, 0);
  b.addTo(redBlock, { x: sign * -20 * i, y: 0 }, 0);
}
//blueBlock.addTo(redBlock, { x: 20, y: 0 }, 45);
//greenBlock.addTo(redBlock, { x: -20, y: 0 }, 0);
gameObject.finalize();
Game.add(gameObject, { x: 0, y: 0 }, 0);

gameObject.velocity = { x: 0, y: 0 };
gameObject.spin = 0;

Keyboard.setKeyFunction('7', () => {
  let obj = Game.get('blocks');
  let part = obj.getPart('green-block9');
  let position = part.localPosition; //use part's center..
  //Create a vector perpendicular to the body, with magnitude of desired force.
  let force = 20;
  let forceVector = Vec.scale(Vec.perp(Vec.norm(position)), force);
  obj.applyForce(forceVector, position);  
});
Main.run(60);


