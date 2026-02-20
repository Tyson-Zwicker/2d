import Main from '../../main.js';
import Appearance from '../../appearance.js';
import GUI from '../../gui.js';

makeGUI();
console.log ('PRE-RUN: GUI elements:', GUI.elements.length, 'panels:', GUI.panels.size);
Main.run();


function makeGUI() {

  GUI.addText('top', 'Top Text 1');
  GUI.addText('top', 'Top Text 2');
  GUI.addText('left', 'Left Text 1');
  GUI.addText('left', 'Left Text 2');
  GUI.addButton('left', 'Click Me', false, (response) => { console.log(response); alert(`${response.owner} says ${response.value}`) }, 'Hello');
  GUI.addButton('left', 'Click Me 2', false, (response) => { console.log(response); alert(`${response.owner} says ${response.value}`) }, 'World');
  GUI.addText('left', 'Left Text 3');
  let listOptions = [
    { text: 'Item 1', value: 'A' },
    { text: 'Option 2', value: 'B' },
    { text: 'Selection C', value: 'C' },
    { text: 'D!', value: 'D' }
  ]
  GUI.addList('left', 'Choose', listOptions, (newValue) => { alert('left = ' + newValue); }, 'A');
  GUI.addList('right', 'Choose', listOptions, (newValue) => { alert('right = ' + newValue); }, 'B');
  GUI.addList('top', 'Choose', listOptions, (newValue) => { alert('top = ' + newValue); }, 'C');
  GUI.addList('bottom', 'Choose', listOptions, (newValue) => { alert('bottom = ' + newValue); }, 'D');
}