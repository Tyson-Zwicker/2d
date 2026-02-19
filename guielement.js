

import GUI from './gui.js';

export default class GUIElement {
  constructor (text){    
    this.bounds =  {x0:0, y0:0, x1:GUI.columnWidth, y1:GUI.rowHeight}; 
    this.active = true;
    this.text = text;
    this.drawnBounds = undefined;
    //This is enough for the textbox, other Element Types (button and list)
    //require additional properties assigned in the get control methods..        
  }
}
