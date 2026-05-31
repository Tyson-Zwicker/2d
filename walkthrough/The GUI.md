
``` TypeScript
import Main from '../../engine/main.js';
import Button from '../../engine/button.js';
import Events from '../../engine/events.js';
import Sim from '../../engine/sim.js';
import SimObject from '../../engine/simobject.js';
import GUIElement from '../../engine/guielement.js'
import GUIPanel from '../../engine/guipanel.js';
import Part from '../../engine/part.js';
import Polygon from '../../engine/polygon.js';
import Mien from '../../engine/mien.js';

let p = new GUIPanel({ x: 50, y: 50 }, 'vertical', { width: 180, height: 80 });

GUIElement.addText(p, ['123'], 'center');
GUIElement.addText(p, ['12345', '12345'], 'center');
GUIElement.addText(p, ['12345678'], 'left');
GUIElement.addText(p, ['12345678901'], 'left');
GUIElement.addText(p, ['123456789011231231'], 'left');

GUIElement.addText(p, [
  '1234567890',
  '12345678901234567890',
  '123456789012345678901234567890',
  '1234567890123456789012345678901234567890',
  '1234567890',
  '12345678901234567890',
  '1234567890',
  '12345678901234567890',
  '1234567890',
  '12345678901234567890',
  '1234567890'], 'center');

let p2= new GUIPanel ({x:300,y:50},'horizontal',{width: 100, height:50});
GUIElement.addText(p2,['1234'],'left');
GUIElement.addText(p2,['2134 2314  34'],'center');
GUIElement.addText(p2,['234','23423'],'left');
GUIElement.addText(p2,['sdfsdf','1234'],'center');
GUIElement.addText(p2,['89763'],'left');
let hanger = GUIElement.addButton(p2,['I am another button try me.'],'center','button2click',true);



let hangpanel = new GUIPanel (undefined, 'vertical', {width:70,height: 80});
hangpanel.anchor =hanger;
GUIElement.addText (hangpanel,['hanging?'],'left');
GUIElement.addText (hangpanel,['847923 392'],'left');
GUIElement.addText (hangpanel,['328 23 230',' 329 239 32'],'center');
GUIElement.addText (hangpanel,['098'],'left');


/*

let a1 = GUIElement.addText (p,'anchor1');
let anchoredpanel = new GUIPanel (undefined,'horizontal',
  {max:{width:100,height:30}, min:{width:15,height:5}}
);
anchoredpanel.anchor  = a1;
GUIElement.addText (anchoredpanel,'attached?');
GUIElement.addText (anchoredpanel,'...');
GUIElement.addText (anchoredpanel,'..!');
Sim.add(homeStar, { x: 0, y: 0 });
*/

Main.creatorsFunction = () => {
  let events = Events.getEvents();
  if (events.length > 0) {
    console.log('Events:');
    for (let e of events) {
      console.log(e);
    }
  }
};
Main.run(25);
