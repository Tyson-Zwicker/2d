import Main from '../../main.js';
import Game from '../../game.js';
import GameObject from '../../gameobject.js';
import Part from '../../part.js';
import Keyboard from '../../keyboard.js';
import Vec from '../../vec.js';
import Appearance from '../../appearance.js';
let blockPoints = [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }];
let redBlock = new Part('red-block', [{ appearance: Appearance.Red, points: blockPoints }], 1);
let greenBlock = new Part('green-block', [{ appearance: Appearance.Green, points: blockPoints }], 1);
let blueBlock = new Part('blue-block', [{ appearance: Appearance.Blue, points: blockPoints }], 1);
let gameObject = new GameObject('blocks');

redBlock.addTo(gameObject, { x: 0, y: 0 }, 0);
let gameObjects = [];
for (let j = 0; j < 4; j++) {
  let gameObject = new GameObject('blocks' + j);
  gameObjects.push(gameObject);
  let r = redBlock.clone();
  r.addTo(gameObject, { x: 0, y: 0 }, 0);
  for (let i = 0; i < 10; i++) {
    let g = greenBlock.clone();
    g.name = 'green-block' + i;
    let b = blueBlock.clone();
    b.name = 'blue-block' + i;
    let sign = (i % 2 == 0) ? -1 : 1;
    g.addTo(r, { x: sign * 20 * i, y: 0 }, 0);
    b.addTo(r, { x: sign * -20 * i, y: 0 }, 0);
  }
  gameObject.finalize();
  Game.add(gameObject, { x: -600 + (300 * j), y: 0 }, j * 90);
}
Keyboard.setKeyFunction('7', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('green-block9');
    let position = part.localPosition; 
    let force = 20;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);    
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
  }
});

Keyboard.setKeyFunction('9', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('green-block9');
    let position = part.localPosition;
    let force = -20;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);    
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);    
  }
});

Keyboard.setKeyFunction('1', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('blue-block9');
    let position = part.localPosition;
    let force = 20;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);    
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);    
  }
});

Keyboard.setKeyFunction('3', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('blue-block9');
    let position = part.localPosition; 
    let force = -20;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
  }
});
Keyboard.setKeyFunction(' ', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('blue-block9');
    let position = part.localPosition; 
    let force = -100;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);    
    let forceVector = Vec.scale(Vec.norm(rotatedPos), force);
    obj.applyForce(forceVector, position);
  }
});
Main.run(60);


