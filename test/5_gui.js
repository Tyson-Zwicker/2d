import { Main } from '../dist/main.js';
import { GUIPanel } from '../dist/gui.js';
import { Events } from '../dist/events.js';
import { Mien } from '../dist/mien.js';
import { Button } from '../dist/button.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Sim } from '../dist/sim.js';

let textArray1 = ['123 1231902 1 210231', '1 2 39  8 1923 1 23123', '121 1 1 23123', ' 12 12 ', '1 67832', '123 123  123 123'];
let textarray2 = ['gf gf dfg ', 'dftis as ', 'zdsr', 'f te e', 'eas fh cv'];
let textArray3 = ['1234567890', '12345678901234567890', '123456789012345678901234567890', '1234567890123456789012345678901234567890', '1234567890', '12345678901234567890', '1234567890', '12345678901234567890', '1234567890', '12345678901234567890', '1234567890'];

//Values for direction are 'vertical' and 'horizontal'
let panel = new GUIPanel({ x: 0, y: 50 }, 'vertical', { width: 200, height: 200 }, true);
panel.addText(textArray1, 'left')
panel.addButton(['Press Button'], 'center', 'button1', false, (data) => { console.log('pressed value=' + data.value) });//Note:  The text ALWAYS needs to be an array. If you pass a string.. It gets treated like a Char[]...
let listItems = [//List "items" is array of "'textArray' & 'value'}
  { textArray: ['one'], value: 1 },
  { textArray: ['two', 'with', 'lines'], value: 2 },
  { textArray: ['third one!'], value: 3 }
];
panel.addList(['Pick'], 'center', listItems, 1, 'horizontal');//NOTE: The alignment "center" applies to the button.  When the panel is generated the panels
// auto-generated elements will be manually set to "centered" alignment..


let panel2 = new GUIPanel({ x: 600, y: 100 }, 'horizontal', { width: 500, height: 60 }, true);
let anchorElement = panel2.addText(['A panel should appear if you presss:'], 'center');

let subPanel1 = new GUIPanel(anchorElement, 'vertical', { width: 500, height: 60 }, false, false);//<--invisible;
subPanel1.addText(['a am a', 'subpanel'], 'left');
subPanel1.addButton(['Anotherbutton'], 'left', '', 'false', () => { alert('Anotherbutton pressed..'); });
subPanel1.anchor = anchorElement;

panel2.addButton(['This', 'Button'], 'center', 'val1', true, (data) => {
  if (data.toggled) {
    subPanel1.show();
  } else {
    subPanel1.hide();
  }
});
console.log (subPanel1);

let object1 = new SimObject('magenta', 'never');
new Part('mp', Polygon.regular(3, 400, Mien.Magenta)).addTo(object1, { x: 0, y: 0 }, 0);
let object2 = new SimObject('cyan', 'never');
new Part('cp', Polygon.regular(3, 400, Mien.Cyan)).addTo(object2, { x: 0, y: 0 }, 0);

let objPanel1 = new GUIPanel(object1, 'vertical', { width: 200, height: 200 }, true, false);
objPanel1.addText(['this is object', '#1', 'some more', 'text'], 'left');

let objPanel2 = new GUIPanel(object2, 'horizontal', { width: 200, height: 200 }, true, false);
objPanel2.addText(['this is object', '#2', 'text and ', 'more text.'], 'left');
objPanel2.addText(['A second element', 'for #2', '& text and ', 'more text...'], 'left');
console.log (objPanel2.elements);
new Button('1', true, object1, (data) => {
  if (data.toggled) {
    objPanel1.show();
  } else {
    objPanel1.hide();
  }
});
new Button('2', true, object2, (data) => {
  if (data.toggled) {
    objPanel2.show();
  } else {
    objPanel2.hide();
  }
});
//Buttons bind to their 'owner' when constructed - don't need to manually do that anymore..

object1.finalize();
object2.finalize();
Sim.add(object1, { x: -500, y: 700 }, 0);
Sim.add(object2, { x: 2500, y: 700 }, 0);
Main.creatorsFunction = () => {
  let listItemSelected = Events.getEvents('listItemSelected');
  for (let event of listItemSelected) {
    console.log(event);
  }
}
Main.run(60);
