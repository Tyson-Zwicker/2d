import Main from '../engine/main.js';
import Button from '../engine/button.js';
import Events from '../engine/events.js';
import Game from '../engine/game.js';
import GameObject from '../engine/gameobject.js';
import GUI from '../engine/gui.js';
import Part from '../engine/part.js';
import Polygon from '../engine/polygon.js';
import Mien from '../engine/mien.js';

let starMien = new Mien('star-yellow');
starMien.setColors ('#882','#ff0','#fff','normal');
starMien.setColors ('#ff0','#ff6','#000','hovered');
starMien.setColors ('#f00','#ff0','#fff','pressed'); 
let homeStar = new GameObject('Home', true);

let star = new Part('Sol-0', Polygon.regular(11, 150, starMien).translate (700,0));
new Button('star-Home', false, (response) => { alert('star clicked'); }).bind (star);

let planet1 = new Part('Sol-1', Polygon.regular(11, 10, Mien.Red));
planet1.spin = 10;
star.addTo(homeStar, { x: 0, y: 0 });
planet1.addTo(star, { x: 0, y: 0 });
homeStar.finalize();

GUI.addText('left', 'Left Text 2');
GUI.addButton('left', 'Button', false, (response) => { alert(`${response.owner} says ${response.value}`) }, 'Hello');
GUI.addList ('left',
   'List', 
   [{ text: 'Option 1', value: 1 },
    { text: 'Option 2', value: 2 },
    { text: 'Option 3', value: 3 },]
  ,(response)=>{alert (`${response.owner} says ${response.value}`)},2);
Game.add(homeStar, { x: 500, y: 500 });

Main.creatorsFunction = () => {
  let events = Events.getEvents();
  if (events.length > 0) {
    console.log ('Events:');  
    for (let e of events) {
      console.log (`${e.type} at ${e.when} from ${e.origin}`);
    }
  }
};

Main.run(100);

