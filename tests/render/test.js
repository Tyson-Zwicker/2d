import Main from '../../main.js';
import Game from '../../game.js';
import GameObject from '../../gameobject.js';
import Part from '../../part.js';

let blockPoints = [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }];
let redBlock = new Part( 'red-block',   [{ color: "f00", points: blockPoints }],1);
let greenBlock = new Part('green-block', [{ color: '#0f0', points: blockPoints }],1);
let blueBlock = new Part('blue-block', [{color: '#00f', points: blockPoints}],1);
let gameObject = new GameObject ('blocks');
redBlock.addTo (gameObject,{x:0,y:0},0);
blueBlock.addTo (redBlock,{x:10,y:0},0);
greenBlock.addTo (redBlock,{x:-10,y:0},0);
gameObject.finalize();
Game.add (gameObject);
Main.run (10);

