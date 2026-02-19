import Main from '../../code/main.js';
import Appearance from '../../code/appearance.js';
import Rnd from '../../code/rnd.js';
import GUI from '../../code/gui.js';

document.addEventListener('DOMContentLoaded', function () {
  makeGUI();  
});

function makeGUI() {
  GUI.initialize(100, 30, 5, 5, Appearance.Green);
  GUI.addText('top', 'Top Text 1');
  GUI.addText('top', 'Top Text 2');
  GUI.addText('left', 'Left Text 1');
  GUI.addText('left', 'Left Text 2');
  GUI.addButton('left', 'Click Me', false, (response) => { console.log(response); alert(`${response.owner} says ${response.value}`) }, 'Hello');
  GUI.addButton('left', 'Click Me 2', false, (response) => { console.log(response); alert(`${response.owner} says ${response.value}`) }, 'World');
  GUI.addText('left', 'Left Text 3');
  let listOptions = [
    {text:'Item 1', value:'A'},
    {text:'Option 2', value:'B'},
    {text:'Selection C', value:'C'},
    {text:'D!', value:'D'}
  ]
  GUI.addList ('left','Choose',listOptions,(newValue)=>{alert ('left = '+newValue);},'A');
  GUI.addList ('right','Choose',listOptions,(newValue)=>{alert ('right = '+newValue);},'B');
  GUI.addList ('top','Choose',listOptions,(newValue)=>{alert ('top = '+newValue);},'C');
  GUI.addList ('bottom','Choose',listOptions,(newValue)=>{alert ('bottom = '+newValue);},'D');
}