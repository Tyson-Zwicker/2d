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
let gameObjects = [];
for (let j = 0; j < 4; j++) {
  let gameObject = new GameObject('blocks' + j);
  gameObjects.push(gameObject);
  let redBlock = new Part('red-block', [{ color: "#f00", points: blockPoints }], 1);
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
  gameObject.finalize();
  Game.add(gameObject, { x: -600 + (300 * j), y: 0 }, j * 90);
}
Keyboard.setKeyFunction('7', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('green-block9');
    let position = part.localPosition; //use part's center..
    //Create a vector perpendicular to the body, with magnitude of desired force.
    let force = 20;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);
    
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
    //Main.continue = false;
  }
});

Keyboard.setKeyFunction('9', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('green-block9');
    let position = part.localPosition; //use part's center..
    //Create a vector perpendicular to the body, with magnitude of desired force.
    let force = -20;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);
    
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
    //Main.continue = false;
  }
});

Keyboard.setKeyFunction('1', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('blue-block9');
    let position = part.localPosition; //use part's center..
    //Create a vector perpendicular to the body, with magnitude of desired force.
    let force = 20;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);
    
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
    //Main.continue = false;
  }
});

Keyboard.setKeyFunction('3', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('blue-block9');
    let position = part.localPosition; //use part's center..
    //Create a vector perpendicular to the body, with magnitude of desired force.
    let force = -20;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);
    
    let forceVector = Vec.scale(Vec.perp(Vec.norm(rotatedPos)), force);
    obj.applyForce(forceVector, position);
    //Main.continue = false;
  }
});
Keyboard.setKeyFunction(' ', () => {
  for (let i = 0;i < 4; i++) {
    let obj = Game.get('blocks'+i);
    let part = obj.getPart('blue-block9');
    let position = part.localPosition; //use part's center..
    //Create a vector perpendicular to the body, with magnitude of desired force.
    let force = -100;
    let rotatedPos = Vec.rotate (position,obj.worldRotation);
    
    let forceVector = Vec.scale(Vec.norm(rotatedPos), force);
    obj.applyForce(forceVector, position);
    //Main.continue = false;
  }
});
Main.run(60);


