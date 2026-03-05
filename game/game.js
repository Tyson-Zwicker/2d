import Main from '../engine/main.js';
import Button from '../engine/button.js';
import Events from '../engine/events.js';
import Game from '../engine/game.js';
import GameObject from '../engine/gameobject.js';
import GUIElement from '../engine/guielement.js'
import GUIPanel from '../engine/guipanel.js';
import Part from '../engine/part.js';
import Polygon from '../engine/polygon.js';
import Mien from '../engine/mien.js';

let starMien = new Mien('star-yellow');
starMien.setColors('#882', '#ff0', '#fff', 'normal');
starMien.setColors('#ff0', '#ff6', '#000', 'hovered');
starMien.setColors('#f00', '#ff0', '#fff', 'pressed');
let homeStar = new GameObject('Home', true);

let star = new Part('Sol-0', Polygon.regular(11, 150, starMien));

let b = new Button('star-Home', false);
star.button = b;
b.gameObjectPart = star;


let planet1 = new Part('Sol-1', Polygon.regular(11, 10, Mien.Red));
planet1.spin = 10;
star.addTo(homeStar, { x: 0, y: 0 });
planet1.addTo(star, { x: 700, y: 0 });
homeStar.finalize();

let p = new GUIPanel({x:50, y:50}, 'vertical',
  { max: { width: 120, height: 80 }, min: { width: 120, height: 30 } }
);
GUIElement.addText(p, 'Hello');
GUIElement.addText(p, 'World');
GUIElement.addText(p, 'Text is too big to fit here, it should be in lines. Some it should be culled becuase its to tall?');
GUIElement.addButton (p,'Click me','button1',false,(r)=>{console.log (r);});
GUIElement.addList (p,'showlist',[{text:'aye',value:'A'},{text:'bee',value:'B'}],'A','horizontal');

let p2= new GUIPanel ({x:600,y:50},'horizontal',
  {max: {width: 100, height:55},min:{width:100,height:5}}
)
let hanch = GUIElement.addText (p2,'stzsd');
GUIElement.addText(p2,'paneltest ---- --- ---- ----  ---');
GUIElement.addButton(p2,'I am another button try me.','button2click',true);

let hanchpanel = new GUIPanel (undefined, 'vertical',
  {
    min:{width:40,height:40},
    max:{width:70,height: 80}
  }
);
GUIElement.addText (hanchpanel,'han?');
GUIElement.addText (hanchpanel,'h2');
GUIElement.addText (hanchpanel,'h');
GUIElement.addText (hanchpanel,'ha?');
hanchpanel.anchor =hanch;


let a1 = GUIElement.addText (p,'anchor1');
let anchoredpanel = new GUIPanel (undefined,'horizontal',
  {max:{width:100,height:30}, min:{width:15,height:5}}
);
anchoredpanel.anchor  = a1;
GUIElement.addText (anchoredpanel,'attached?');
GUIElement.addText (anchoredpanel,'...');
GUIElement.addText (anchoredpanel,'..!');
Game.add(homeStar, { x: 0, y: 0 });

Main.creatorsFunction = () => {
  let events = Events.getEvents();
  if (events.length > 0) {
    console.log('Events:');
    for (let e of events) {
      console.log(e);
    }
  }
};

Main.run(100);

1