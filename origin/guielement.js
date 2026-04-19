import Events from './events.js';
import GUI from './gui.js';
import GUIPanel from './guipanel.js';
import Text from './text.js'

export default class GUIElement {
  constructor(panel, textArray, alignment) {
    if (alignment === 'center' || alignment === 'left') {
      this.alignment = alignment;
    } else throw new Error('invalid alignment: ' + alignment);
    this.drawnBounds = {} //determined when drawn..    
    this.active = true;
    this.highlighted = false;
    this.trimmedText = Text.getTextFromArray(
      textArray,
      { w: panel.constraint.width, h: panel.constraint.height, m: GUI.margin },
      GUI.mien.normal.fontName,
      GUI.mien.normal.fontSize,
      GUI.lineSpace,
      GUI.margin
    );
    this.size = { width: this.trimmedText.w, height: this.trimmedText.h };
    this.panel = panel;
    panel.elements.push(this);
    GUI.elements.push(this);
  }
  get drawnSize() {
    return { width: this.drawnBounds.x1 - this.drawnBounds.x0, height: this.drawnBounds.y1 - this.drawnBounds.y0 };
  }
  //only called by a list that needs to show its items..
  attachListItemPanel(listElement, direction) {
    let constraint = { width: listElement.size.width, height: listElement.size.height };
    let listItemPanel = new GUIPanel(listElement, direction, constraint);    
    for (let item of listElement.listItems) {
      listItemPanel.addButton(        
        item.textArray,
        'center',
        item.value,
        false,
        (data) => {
          let listElement = data.owner.panel.anchor;//<-- the item that showed the panel in the first place.
          listElement.receiveListItemSelection(data); //Give it the selected Value..
        }
      );
    }
    listElement.attachedPanel = listItemPanel;
  }
  //only called by an listItem button..
  receiveListItemSelection(data) {
    this.button.value = data.value; //change this button value to selected value..
    GUI.removePanel(this.attachedPanel); //thrown away, won't be drawn    
    this.attachedPanel.anchor = undefined;
    this.attachedPanel = undefined;
    data.owner = this;
    Events.add('listItemSelected', this, data);
  }
}
