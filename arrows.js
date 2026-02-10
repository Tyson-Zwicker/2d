import View from './view.js';
import Main from './main.js';
import Game from './game.js';
import GameObject from './gameobject.js';
import Body from './body.js';
import BodyPart from './bodypart.js';

View.initialize('#222');

const body = new Body('shipBody');
body.position = { x: 0, y: 0 };
body.velocity = { x: 0, y: 0 };
body.spin = 0;

const greenArrow = new BodyPart ('green-arrow',0,1,false);
greenArrow.faces = [{color:'#0f0', points: [
  {x:-50,y:-8},
  {x: 20,y:-8},
  {x:0,y:-50},
  {x:50,y:0},
  {x:0,y:50},
  {x:20,y:8},
  {x:-50,y:8}
]}];
const blueArrow = new BodyPart ('blue-arrow',0,1,false);
blueArrow.faces = [{color:'#00f', points: [
  {x:-25,y:-5},
  {x: 10,y:-5},
  {x:0,y:-25},
  {x:25,y:0},
  {x:0,y:25},
  {x:10,y:5},
  {x:-25,y:5}
]}];
const redArrow = new BodyPart ('red-arrow',0,1,false);
redArrow.faces = [{color:'#f00', points: [
  {x:-20,y:-3},
  {x: 0,y:-3},
  {x:0,y:-15},
  {x:20,y:0},
  {x:0,y:15},
  {x:0,y:3},
  {x:-20,y:3}
]}];

body.partAdd(greenArrow,{x:0,y:0});
greenArrow.partAdd (blueArrow, {x:75,y:0});
blueArrow.partAdd (redArrow, {x:40,y:0});

const ship = new GameObject('ship', body);
Game.addGameObject(ship);
Main.creatorsFunction = function (){
  greenArrow.rotation +=1;
  blueArrow.rotation +=0;
  redArrow.rotation -=1;
  //Main.tickMsg.push ({"text":'current Green rotation: '+greenArrow.rotation, "indent":0});
  //Main.tickMsg.push ({"text":'current Blue rotation: '+greenArrow.rotation, "indent":1});
  //Main.tickMsg.push ({"text":'current Red rotation: '+redArrow.rotation, "indent":1});
}
Main.run();
