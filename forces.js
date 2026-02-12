import View from './view.js';
import Main from './main.js';
import Game from './game.js';
import GameObject from './gameobject.js';
import BodyPart from './bodypart.js';
import Keyboard from './keyboard.js';

View.initialize('#222');

let l = 100;
let w = 20;

let arrow = [//rotates around center.
  { "x": -l, "y": -w },
  { x: 0, y: -w },
  { x: 0, y: -w * 2 },
  { x: l, y: 0 },
  { x: 0, y: w * 2 },
  { x: 0, y: w },
  { x: -l, y: w }
];
let arrow2 = [ //rotates around base.
  { "x": 0, "y": -w },
  { x: l, y: -w },
  { x: l, y: -w * 2 },
  { x: 2 * l, y: 0 },
  { x: l, y: w * 2 },
  { x: l, y: w },
  { x: 0, y: w }
];
let forceStrength = 0;
Keyboard.setKeyFunction ("7",()=>{forceStrength=1});
Keyboard.setKeyFunction ("4",()=>{forceStrength=1});
Keyboard.setKeyFunction ("1",()=>{forceStrength=1});
Keyboard.setKeyFunction ("9",()=>{forceStrength=1});
Keyboard.setKeyFunction ("6",()=>{forceStrength=1});
Keyboard.setKeyFunction ("3",()=>{forceStrength=1});
Keyboard.setKeyFunction ('9',()=>{;});
Keyboard.setKeyFunction ('2',()=>{;});

const greenArrow = new BodyPart('green-arrow', [{ "color": '#0f0', "points": arrow }]);
greenArrow.ownRotation = 0;
greenArrow.offsetPosition = { "x": 0, "y": 0 };

//const blueArrow = new BodyPart('blue-arrow', [{ color: '#00f', points: arrow2 }]);
//const redArrow = new BodyPart('red-arrow', [{ color: '#f00', points: arrow2 }]);

//greenArrow.partAdd(blueArrow, { x: l, y: 0 }, 0);
//blueArrow.partAdd(redArrow, { x: l*2, y: 0 }, 0);


const ship = new GameObject('ship', greenArrow);
Game.addGameObject(ship);

Main.creatorsFunction = function () {
  greenArrow.ownRotation += .1;
  blueArrow.ownRotation +=0.1;
  redArrow.ownRotation +=-.3;
}

Main.run(60);
