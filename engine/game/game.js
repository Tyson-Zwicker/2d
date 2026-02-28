import Main from '../engine/main.js';
import Button from '../engine/button.js';
import Events from '../engine/events.js';
import Game from '../engine/game.js';
import GameObject from '../engine/gameobject.js';
import GUI from '../engine/gui.js';
import Part from '../engine/part.js';
import Polygon from '../engine/polygon.js';
import Mien from '../engine/mien.js';

let homeStar = new GameObject('Home', true);
let star = new Part('Sol-0', Polygon.regular(11, 150, Mien.Yellow));
let b = new Button(() => { 'star-Home', false, console.log('star clicked'); }); //change order: functions less necessary now.
b.gameObjectPart = star;  ///Add a binding method for this..
star.button = b;

let planet1 = new Part('Sol-1', Polygon.regular(11, 10, Mien.Red));
planet1.spin = 10;
star.addTo(homeStar, { x: 0, y: 0 });
planet1.addTo(star, { x: 700, y: 0 });
homeStar.finalize();
GUI.addText('left', 'Left Text 2');
GUI.addButton('left', 'Click Me', false, (response) => { console.log(response); alert(`${response.owner} says ${response.value}`) }, 'Hello');
Game.add(homeStar, { x: 500, y: 500 });
Main.creatorsFunction = () => {
  let events = Events.get();
  if (events.length > 0) {
    console.log ('Events:');  
    console.log(Events.get());
  }
};

Main.run(100);

