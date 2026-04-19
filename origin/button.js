import Events from './events.js';
import SimObject from './simobject.js';
import GUIElement from './guielement.js';
import GUI from './gui.js';
import View from './view.js';
export default class Button {
  guiElement = undefined;
  simObject= undefined;
  get owner() {
    if (this.guiElement) return this.guiElement;
    if (this.simObject) return this.simObject;
  }
  clicked = false;
  clickFn = undefined;
  hovered = false;
  pressed = false;
  toggled = false;
  toggle = false;
  constructor(value, toggle = false, objectOrElement, clickFn) {
    if (objectOrElement instanceof SimObject){
       this.simObject = objectOrElement;
       this.simObject.button = this;
    }
    else if (objectOrElement instanceof GUIElement){
       this.guiElement = objectOrElement;
       this.guiElement.button = this;
    }
    else throw new Error ('Button owner must be a SimObject or a GUIElement.');
    this.clickFn = clickFn;
    this.toggle = toggle;
    this.value = value;
  }
  checkForMouse() {
    if (this.guiElement) {
      const inside = GUI.isMouseIn(this.guiElement);
      return this.#doButton(inside);
    }
    if (this.simObject) {
      const inside = SimObject.isMouseIn(this.simObject);//This is not checking the part, its checking the whole object.
      return this.#doButton(inside);
    }
    return false;
  }
  #doButton(insideBounds) {
    let interaction = false;
    if (insideBounds) {
      if (View.mouse.buttonDown && !this.hovered) {
        //*Must* be checked first.. mouse went down somewhere else, but not here.. doesn't affect this actor..
        return false;
      }
      else if (!View.mouse.buttonDown && !this.hovered) {
        //mouse hovers over actor, not button pressed..
        this.hovered = true;
        interaction = true;
      }
      else if (View.mouse.buttonDown && this.hovered && !this.pressed) {
        //they just pressed on this button, which was being hovered over..
        this.pressed = true;
        interaction = true;
      }
      else if (!View.mouse.buttonDown && this.pressed) {
        //they just let up on the button after pressing.. that is a click.
        this.#click();
        this.hovered = false;
        this.pressed = false;
        interaction = true;
      } else {
        interaction = true;
      }
    } else {
      this.pressed = false; // So.. it can't be clicked if its not on it..
      this.hovered = false;
    }
    return interaction;
  }
  #click() {
    let data = { owner: undefined, type: 'click', value: this.value };
    if (this.guiElement) {      
      data.owner = this.guiElement;
    }
    if (this.simObject) {
      data.owner = this.simObject;
    }
    this.clicked = false;    
    if (this.toggle) {
      this.toggled = !this.toggled;
      data.toggled = this.toggled;
    }
    if (this.clickFn) this.clickFn(data);
    Events.add('click', data.owner.name, data);
  }
}