import Main from '../..main.js';
import Game from '../../game.js';
import GameObject from '../../gameobject.js';
import Part from '../../part.js';

let blockPoints = [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }];
let redBlock = new Part('red-block', { color: "f00", points: blockPoints });
let greenBlock = new Part('green-block', { color: '#0f0', points: blockPoints });
let blueBlock = new Part('blue-block', {color: '#00f', points: blockPoints});

blueBlock.addTo (redBlock,{x:10,y:0},0);
greenBlock.addTo (redBlock,{x:-10,y:0},0);
let gameObject = new GameObject ('blocks',redBlock);
Game.add (gameObject);
Main.run ();

