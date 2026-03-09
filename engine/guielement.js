import Events from './events.js';
import GUI from './gui.js';
import GUIPanel from './guipanel.js';
import Button from './button.js';
import Text from './text.js'

export default class GUIElement {
  constructor(panel, textArray, alignment) {
    if (alignment === 'center' || alignment === 'left') {
      this.alignment = alignment;
    } else throw new Error('invalid alignment: ' + alignment);

    this.drawnBounds = {}//determined when draw..
    this.active = true;
    // Use the correct font properties (fontName/fontSize) so text measurement matches rendering
    this.trimmedText = Text.getTextFromArray(
      textArray,
      { w: panel.constraint.width, h: panel.constraint.height , m:GUI.margin},
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

  static addText(panel, textArray, alignment) {
    let textElement = new GUIElement(panel, textArray, alignment);
    textElement.type = 'text';
    return textElement;
  }
  static addButton(panel, textArray, alignment, value, toggle, fn) {
    let buttonElement = new GUIElement(panel, textArray, alignment);
    buttonElement.type = 'button';
    let button = new Button(value, toggle, fn);
    button.guiElement = buttonElement;
    buttonElement.button = button;
    return buttonElement;
  }
  //listItems: [textArray], value
  static addList(panel, textArray, alignment, listItems, defaultValue, itemPanelDirection) {
    let listElement = new GUIElement(panel, textArray, alignment);
    listElement.type = 'list';
    listElement.itemPanelDirection = itemPanelDirection;
    listElement.listItems = listItems;

    let button = new Button(defaultValue, false, (r) => { GUIElement.attachListItemPanel(r.owner) });
    button.guiElement = listElement;
    listElement.button = button;
    return listElement;
  }
  //only called by a list that needs to show its items..
  static attachListItemPanel(listElement) {
    //Lets try just using the size of the listElement and see how it goes..
    let constraint = { width: listElement.size.width, height: listElement.size.height };


    let listItemPanel = new GUIPanel(undefined, listElement.itemPanelDirection, constraint);
    for (let item of listElement.listItems) {
      GUIElement.addButton(
        listItemPanel,
        item.textArray,
        listItemPanel.alignment,
        item.value,
        false,
        (data) => {
          let listElement = data.owner.panel.anchor;//<-- the item that showed the panel in the first place.
          listElement.receiveListItemSelection(data); //Give it the selected Value..
        }
      );
    }
    listItemPanel.anchor = listElement;
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
